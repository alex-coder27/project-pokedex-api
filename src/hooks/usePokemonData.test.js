import { renderHook, act, waitFor } from '@testing-library/react';
import { usePokemonData } from './usePokemonData';

import {
    getPokemonList,
    getPokemonDetailsByUrl,
    fetchPokemonDetails,
    getPokemonListByType
} from '../api/pokedexApi';

jest.mock('../api/pokedexApi', () => ({
    getPokemonList: jest.fn(),
    getPokemonDetailsByUrl: jest.fn(),
    fetchPokemonDetails: jest.fn(),
    getPokemonListByType: jest.fn(),
}));

const POKEMONS_PER_PAGE = 10;

const mockInitialListResponse = {
    results: [
        { name: 'bulbasaur', url: 'url-bulbasaur' },
        { name: 'ivysaur', url: 'url-ivysaur' },
    ],
    next: 'next-page-url',
    count: 100,
};

const mockFilteredUrls = [
    { name: 'charmander', url: 'url-charmander' },
    { name: 'charmeleon', url: 'url-charmeleon' },
    { name: 'charizard', url: 'url-charizard' },
];

const createMockFilteredUrls = (count) => {
    return Array.from({ length: count }, (_, i) => ({
        name: `water-pokemon-${i + 1}`,
        url: `url-water-pokemon-${i + 1}`,
    }));
};
const mockLargerFilteredUrls = createMockFilteredUrls(15);

const mockFireUrls = [{ name: 'fire-mon', url: 'url-fire-mon' }];
const mockGrassUrls = [{ name: 'grass-mon', url: 'url-grass-mon' }];

const createMockDetails = (name, fixedId = null) => ({
    id: fixedId || Math.floor(Math.random() * 1000) + 1,
    name: name,
    types: [{ type: { name: 'grass' } }],
    sprites: { other: { dream_world: { front_default: `image-of-${name}.png` } } },
});

describe('usePokemonData', () => {
    let consoleErrorSpy;

    beforeEach(() => {
        jest.clearAllMocks();
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

        getPokemonDetailsByUrl.mockImplementation((url) => {
            if (typeof url !== 'string' || !url.startsWith('url-')) {
                throw new Error(`Mock de getPokemonDetailsByUrl chamado com URL inválida: ${url}`);
            }

            const name = url.replace('url-', '');
            return Promise.resolve(createMockDetails(name));
        });

        getPokemonListByType.mockResolvedValue(mockFilteredUrls);
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
    });

    it('deve buscar e carregar a lista inicial de pokémons na montagem', async () => {
        getPokemonList.mockResolvedValueOnce(mockInitialListResponse);

        const { result } = renderHook(() => usePokemonData());

        expect(result.current.isLoading).toBe(true);

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.pokemons).toHaveLength(mockInitialListResponse.results.length);
        expect(result.current.pokemons[0].name).toBe('bulbasaur');
        expect(result.current.hasMore).toBe(true);
        expect(getPokemonList).toHaveBeenCalledWith(0, 10, expect.any(Object));
        expect(getPokemonDetailsByUrl).toHaveBeenCalledTimes(mockInitialListResponse.results.length);
    });

    it('deve carregar mais pokémons quando handleLoadMore é chamado', async () => {
        getPokemonList.mockResolvedValueOnce(mockInitialListResponse);
        const { result } = renderHook(() => usePokemonData());

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        const mockLoadMoreResponse = {
            results: [{ name: 'venusaur', url: 'url-venusaur' }],
            next: null,
            count: 100,
        };
        getPokemonList.mockResolvedValueOnce(mockLoadMoreResponse);

        await act(async () => {
            result.current.handleLoadMore();
        });

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        const initialLength = mockInitialListResponse.results.length;
        const newLength = mockLoadMoreResponse.results.length;

        expect(result.current.pokemons).toHaveLength(initialLength + newLength);
        expect(result.current.pokemons[initialLength].name).toBe('venusaur');

        expect(getPokemonList).toHaveBeenCalledWith(10, 10, expect.any(Object));
        expect(result.current.hasMore).toBe(false);
    });

    it('deve filtrar por tipo, resetar o estado e usar getPokemonListByType', async () => {
        getPokemonList.mockResolvedValueOnce(mockInitialListResponse);

        const { result } = renderHook(() => usePokemonData());

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        await act(async () => {
            result.current.handleTypeFilter({ target: { value: 'fire' } });
        });

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.selectedType).toBe('fire');
        expect(result.current.pokemons).toHaveLength(mockFilteredUrls.length);
        expect(result.current.pokemons[0].name).toBe('charmander');

        expect(getPokemonListByType).toHaveBeenCalledWith('fire', expect.any(Object));
        expect(getPokemonList).toHaveBeenCalledTimes(1);
    });

    it('deve buscar um único Pokémon quando setSearchTerm é usado', async () => {
        const mockSearchDetails = {
            id: 150,
            name: 'mewtwo',
            types: [{ type: { name: 'psychic' } }]
        };

        getPokemonList.mockResolvedValueOnce(mockInitialListResponse);
        fetchPokemonDetails.mockResolvedValueOnce(mockSearchDetails);

        const { result } = renderHook(() => usePokemonData());
        await waitFor(() => expect(result.current.isLoading).toBe(false));
        await act(async () => {
            result.current.setSearchTerm('mewtwo');
        });
        await waitFor(() => expect(result.current.searchedPokemon).not.toBe(null));
        expect(result.current.searchTerm).toBe('mewtwo');
        expect(result.current.searchedPokemon.name).toBe('mewtwo');
        expect(result.current.searchError).toBe(null);
        expect(fetchPokemonDetails).toHaveBeenCalledWith('mewtwo', expect.any(Object));
    });

    it('deve definir searchError e resetar searchedPokemon em caso de 404 na busca', async () => {
        const errorMessage = 'Pokémon "invalidname" não encontrado.';
        getPokemonList.mockResolvedValueOnce(mockInitialListResponse);
        const { result } = renderHook(() => usePokemonData());
        await waitFor(() => expect(result.current.isLoading).toBe(false));
        fetchPokemonDetails.mockRejectedValueOnce({
            isAxiosError: true,
            response: {
                status: 404,
                data: { detail: 'Not Found' }
            },
        });
        await act(async () => {
            result.current.setSearchTerm('invalidname');
        });
        await waitFor(() => expect(result.current.searchError).toBe(errorMessage));
        expect(result.current.searchedPokemon).toBe(null);
        expect(fetchPokemonDetails).toHaveBeenCalledWith('invalidname', expect.any(Object));
    });

    it('deve carregar mais Pokémons após aplicar um filtro de tipo', async () => {
        getPokemonList.mockResolvedValueOnce(mockInitialListResponse);
        getPokemonListByType.mockResolvedValue(mockLargerFilteredUrls);

        const { result } = renderHook(() => usePokemonData());

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        await act(async () => {
            result.current.handleTypeFilter({ target: { value: 'water' } });
        });

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.selectedType).toBe('water');
        expect(result.current.pokemons).toHaveLength(POKEMONS_PER_PAGE);
        expect(result.current.hasMore).toBe(true);
        expect(result.current.pokemons[0].name).toBe('water-pokemon-1');
        expect(result.current.pokemons[9].name).toBe('water-pokemon-10');

        await act(async () => {
            result.current.handleLoadMore();
        });

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        const totalLoaded = mockLargerFilteredUrls.length;
        expect(result.current.pokemons).toHaveLength(totalLoaded);
        expect(result.current.hasMore).toBe(false);
        expect(result.current.pokemons[10].name).toBe('water-pokemon-11');

        expect(getPokemonList).toHaveBeenCalledTimes(1);
        expect(getPokemonListByType).toHaveBeenCalledTimes(1);
    });

    it('deve prevenir condição de corrida abortando o filtro anterior', async () => {
        getPokemonList.mockResolvedValue(mockInitialListResponse);

        let resolveFire, rejectFire;
        const firePromise = new Promise((resolve, reject) => {
            resolveFire = resolve;
            rejectFire = reject;
        });

        getPokemonListByType
            .mockImplementationOnce((type, options = {}) => {
                const signal = options.signal;
                if (signal) {
                    signal.addEventListener('abort', () => {
                        rejectFire({ name: 'AbortError' });
                    });
                }
                return firePromise;
            })
            .mockResolvedValueOnce(mockGrassUrls);

        const { result } = renderHook(() => usePokemonData());

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        act(() => {
            result.current.handleTypeFilter({ target: { value: 'fire' } });
        });

        expect(result.current.selectedType).toBe('fire');
        expect(result.current.isLoading).toBe(true);

        await act(async () => {
            result.current.handleTypeFilter({ target: { value: 'grass' } });
        });

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.selectedType).toBe('grass');
        expect(result.current.pokemons).toHaveLength(mockGrassUrls.length);

        await act(async () => {
            resolveFire(mockFireUrls);
        });

        expect(result.current.selectedType).toBe('grass');
        expect(result.current.pokemons).toHaveLength(mockGrassUrls.length);
    });

    it('deve prevenir condição de corrida na busca abortando a busca anterior', async () => {
        getPokemonList.mockResolvedValue(mockInitialListResponse);

        let resolveSlowpoke, rejectSlowpoke;
        const slowpokePromise = new Promise((resolve, reject) => {
            resolveSlowpoke = resolve;
            rejectSlowpoke = reject;
        });

        const mockPikachuDetails = createMockDetails('pikachu');

        fetchPokemonDetails
            .mockImplementationOnce((name, options = {}) => {
                const signal = options.signal;
                if (signal) {
                    signal.addEventListener('abort', () => {
                        rejectSlowpoke({ name: 'AbortError' });
                    });
                }
                return slowpokePromise;
            })
            .mockResolvedValueOnce(mockPikachuDetails);

        const { result } = renderHook(() => usePokemonData());

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        act(() => {
            result.current.setSearchTerm('slowpoke');
        });

        expect(result.current.searchTerm).toBe('slowpoke');
        expect(result.current.isLoading).toBe(true);

        await act(async () => {
            result.current.setSearchTerm('pikachu');
        });

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.searchTerm).toBe('pikachu');
        expect(result.current.searchedPokemon.name).toBe('pikachu');

        await act(async () => { });

        expect(result.current.searchedPokemon.name).toBe('pikachu');
        expect(result.current.isLoading).toBe(false);
        expect(fetchPokemonDetails).toHaveBeenCalledTimes(2);
    });

    it('deve lidar com erro genérico na busca de Pokémon sem mostrar console.error', async () => {
        getPokemonList.mockResolvedValueOnce(mockInitialListResponse);
        const { result } = renderHook(() => usePokemonData());

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        fetchPokemonDetails.mockRejectedValueOnce(new Error('Network Error'));

        await act(async () => {
            result.current.setSearchTerm('pikachu');
        });

        await waitFor(() => {
            expect(result.current.searchError).toBe("Erro desconhecido ao buscar Pokémon.");
        });

        expect(result.current.searchedPokemon).toBe(null);
        expect(fetchPokemonDetails).toHaveBeenCalledWith('pikachu', expect.any(Object));
    });

    it('deve resetar busca quando termo de busca for vazio', async () => {
        getPokemonList.mockResolvedValueOnce(mockInitialListResponse);
        const { result } = renderHook(() => usePokemonData());

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        const mockPikachuDetails = createMockDetails('pikachu');
        fetchPokemonDetails.mockResolvedValueOnce(mockPikachuDetails);

        await act(async () => {
            result.current.setSearchTerm('pikachu');
        });

        await waitFor(() => expect(result.current.searchedPokemon).not.toBeNull());
        expect(result.current.searchTerm).toBe('pikachu');
        expect(result.current.searchedPokemon.name).toBe('pikachu');

        await act(async () => {
            result.current.setSearchTerm('');
        });

        expect(result.current.searchTerm).toBe('');
        expect(result.current.searchedPokemon).toBeNull();
        expect(result.current.searchError).toBeNull();
    });

    it('deve lidar com filtro "all" corretamente', async () => {
        getPokemonList.mockResolvedValueOnce(mockInitialListResponse);
        const { result } = renderHook(() => usePokemonData());

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        await act(async () => {
            result.current.handleTypeFilter({ target: { value: 'all' } });
        });

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.selectedType).toBe(null);
        expect(result.current.searchTerm).toBe('');
        expect(result.current.searchedPokemon).toBeNull();
        expect(result.current.searchError).toBeNull();

        expect(getPokemonList).toHaveBeenCalledWith(0, 10, expect.any(Object));
        expect(getPokemonListByType).not.toHaveBeenCalled();
    });

    it('deve prevenir duplicatas ao carregar mais pokémons', async () => {
        const firstPageResponse = {
            results: [
                { name: 'pokemon1', url: 'url-pokemon1' },
                { name: 'pokemon2', url: 'url-pokemon2' },
            ],
            next: 'next-page',
            count: 4,
        };

        const secondPageResponse = {
            results: [
                { name: 'pokemon2', url: 'url-pokemon2' },
                { name: 'pokemon3', url: 'url-pokemon3' },
                { name: 'pokemon4', url: 'url-pokemon4' },
            ],
            next: null,
            count: 4,
        };

        getPokemonDetailsByUrl.mockImplementation((url) => {
            const name = url.replace('url-', '');
            const fixedIds = {
                'pokemon1': 1,
                'pokemon2': 2,
                'pokemon3': 3,
                'pokemon4': 4
            };
            return Promise.resolve(createMockDetails(name, fixedIds[name]));
        });

        getPokemonList
            .mockResolvedValueOnce(firstPageResponse)
            .mockResolvedValueOnce(secondPageResponse);

        const { result } = renderHook(() => usePokemonData());

        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(result.current.pokemons).toHaveLength(2);

        await act(async () => {
            result.current.handleLoadMore();
        });

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.pokemons).toHaveLength(4);
        expect(result.current.pokemons.map(p => p.id)).toEqual([1, 2, 3, 4]);

        const uniqueNames = [...new Set(result.current.pokemons.map(p => p.name))];
        expect(uniqueNames).toHaveLength(4);
    });

    it('deve lidar com erro na paginação filtrada preservando estado anterior', async () => {
        getPokemonList.mockResolvedValueOnce(mockInitialListResponse);
        getPokemonListByType.mockResolvedValueOnce(mockLargerFilteredUrls);

        const { result } = renderHook(() => usePokemonData());

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        await act(async () => {
            result.current.handleTypeFilter({ target: { value: 'water' } });
        });

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        const initialPokemons = [...result.current.pokemons];

        getPokemonDetailsByUrl
            .mockImplementationOnce(() => Promise.resolve(createMockDetails('water-pokemon-11')))
            .mockImplementationOnce(() => Promise.reject(new Error('API Error')))
            .mockImplementationOnce(() => Promise.resolve(createMockDetails('water-pokemon-13')));

        await act(async () => {
            result.current.handleLoadMore();
        });

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.pokemons).toHaveLength(initialPokemons.length);
        expect(result.current.selectedType).toBe('water');
    });

    it('deve lidar com erro de rede ao carregar lista inicial sem mostrar console.error', async () => {
        getPokemonList.mockRejectedValueOnce(new Error('Network Error'));

        const { result } = renderHook(() => usePokemonData());

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.pokemons).toHaveLength(0);
    });

    it('deve lidar com lista vazia de Pokémon filtrados', async () => {
        getPokemonList.mockResolvedValueOnce(mockInitialListResponse);

        getPokemonListByType.mockResolvedValueOnce([]);

        const { result } = renderHook(() => usePokemonData());

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        await act(async () => {
            result.current.handleTypeFilter({ target: { value: 'unknown-type' } });
        });

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.pokemons).toHaveLength(0);
        expect(result.current.hasMore).toBe(false);
        expect(result.current.selectedType).toBe('unknown-type');
    });

    it('deve manter estados consistentes durante múltiplas operações', async () => {
        getPokemonList.mockResolvedValue(mockInitialListResponse);
        getPokemonListByType.mockResolvedValue(mockFilteredUrls);

        const { result } = renderHook(() => usePokemonData());

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        await act(async () => {
            result.current.handleTypeFilter({ target: { value: 'fire' } });
        });
        await waitFor(() => expect(result.current.isLoading).toBe(false));

        const mockCharizardDetails = createMockDetails('charizard');
        fetchPokemonDetails.mockResolvedValueOnce(mockCharizardDetails);
        await act(async () => {
            result.current.setSearchTerm('charizard');
        });
        await waitFor(() => expect(result.current.isLoading).toBe(false));

        await act(async () => {
            result.current.setSearchTerm('');
        });

        await act(async () => {
            result.current.handleTypeFilter({ target: { value: 'all' } });
        });
        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.selectedType).toBe(null);
        expect(result.current.searchTerm).toBe('');
        expect(result.current.searchedPokemon).toBeNull();
        expect(result.current.searchError).toBeNull();
        expect(result.current.pokemons).toHaveLength(2);
    });

    it('deve lidar com cancelamento durante loading inicial', async () => {
        const abortMock = jest.fn();
        const AbortControllerMock = jest.fn(() => ({
            abort: abortMock,
            signal: { aborted: false }
        }));
        global.AbortController = AbortControllerMock;

        getPokemonList.mockImplementation(() => new Promise(() => { }));

        const { unmount } = renderHook(() => usePokemonData());

        unmount();

        expect(AbortControllerMock).toHaveBeenCalled();
    });
});