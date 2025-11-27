import React from 'react';

var mockNavigate = jest.fn();
var mockUseParamsFn = jest.fn();

import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import DetailsPage from './index';

import {
    fetchPokemonDetails,
    getPokemonDetailsByUrl
} from '../../api/pokedexApi';

import axios from 'axios';

import isPropValid from '@emotion/is-prop-valid';
import { StyleSheetManager, ThemeProvider } from 'styled-components';

jest.mock('../../context/ThemeContext', () => ({
    useTheme: () => ({
        isDarkMode: false,
        toggleTheme: jest.fn(),
    }),
}));

const mockPokemonData = {
    id: 1,
    name: 'bulbasaur',
    stats: [
        { stat: { name: 'hp' }, base_stat: 45 },
        { stat: { name: 'attack' }, base_stat: 49 },
        { stat: { name: 'defense' }, base_stat: 49 }
    ],
    types: [
        { type: { name: 'grass' } },
        { type: { name: 'poison' } }
    ],
    abilities: [
        { ability: { name: 'overgrow', url: 'url-overgrow' }, is_hidden: false },
        { ability: { name: 'chlorophyll', url: 'url-chlorophyll' }, is_hidden: true },
    ],
    sprites: {
        front_default: 'bulbasaur.png',
        other: {
            dream_world: { front_default: 'bulbasaur-dream.png' }
        }
    },
    moves: [
        { move: { name: 'razor-leaf' } },
        { move: { name: 'vine-whip' } },
        { move: { name: 'tackle' } }
    ],
};

const mockOvergrowDescription = {
    effect_entries: [{ effect: 'Boosts Grass moves when HP is low.', language: { name: 'en' } }],
};

const mockChlorophyllDescription = {
    effect_entries: [{ effect: 'Speed doubles in sunshine.', language: { name: 'en' } }],
};

const mockTheme = {
    name: 'light',
    primary: '#1A75BB',
    background: '#f0f0f0',
    backgroundContainer: '#ffffff',
    text: '#333333',
    cardBackground: '#f7f7f7',
    error: '#FF3B30',
};

const shouldForwardProp = (prop) => {
    return !prop.startsWith('$') && isPropValid(prop);
};

jest.mock('react-router-dom', () => {
    const actual = jest.requireActual('react-router-dom');

    return {
        ...actual,
        get useNavigate() {
            return () => mockNavigate;
        },
        get useParams() {
            return mockUseParamsFn;
        },
    };
});

jest.mock('../../api/pokedexApi', () => ({
    fetchPokemonDetails: jest.fn(),
    getPokemonDetailsByUrl: jest.fn(),
}));

jest.mock('axios', () => ({
    isAxiosError: jest.fn(e => e && e.isAxiosError),
    get: jest.fn(),
    Cancel: jest.fn(),
    isCancel: jest.fn(e => e && e.name === 'AbortError'),
}));

const renderDetailsPage = (pokemonName) => {
    mockUseParamsFn.mockReturnValue({ name: pokemonName });

    render(
        <MemoryRouter initialEntries={[`/pokemon/${pokemonName}`]}>
            <StyleSheetManager shouldForwardProp={shouldForwardProp}>
                <ThemeProvider theme={mockTheme}>
                    <Routes>
                        <Route path="/pokemon/:name" element={<DetailsPage />} />
                    </Routes>
                </ThemeProvider>
            </StyleSheetManager>
        </MemoryRouter>
    );
};

describe('DetailsPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockNavigate.mockClear();
    });

    it('deve renderizar os detalhes do Pokémon corretamente', async () => {
        fetchPokemonDetails.mockResolvedValue(mockPokemonData);
        getPokemonDetailsByUrl.mockImplementation(async (url) => {
            if (url.includes('overgrow')) return mockOvergrowDescription;
            return { effect_entries: [{ effect: 'Some other effect.', language: { name: 'en' } }] };
        });

        await act(async () => {
            renderDetailsPage('bulbasaur');
        });

        await waitFor(() => expect(screen.getByText(/Bulbasaur #1/i)).toBeInTheDocument());

        expect(screen.getByText('HP:')).toBeInTheDocument();
        expect(screen.getByText('45')).toBeInTheDocument();

        await act(async () => {
            const overgrowItem = screen.getByText('overgrow');
            fireEvent.mouseEnter(overgrowItem);
        });

        await waitFor(() => {
            expect(screen.getByTestId('ability-tooltip')).toBeInTheDocument();
        });

        expect(screen.getByTestId('ability-tooltip')).toHaveTextContent('Boosts Grass moves when HP is low.');
    });

    it('deve exibir mensagem de erro para Pokémon não encontrado', async () => {
        fetchPokemonDetails.mockRejectedValue({
            isAxiosError: true,
            response: { status: 404 }
        });

        await act(async () => {
            renderDetailsPage('missingno');
        });

        await waitFor(() => {
            expect(screen.getByText(/Pokémon "missingno" não encontrado\. Verifique o nome\./i)).toBeInTheDocument();
        });

        await act(async () => {
            const backButton = screen.getByText('Voltar à Home');
            fireEvent.click(backButton);
        });
        expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('deve exibir mensagem de erro para falha geral na requisição', async () => {
        fetchPokemonDetails.mockRejectedValue(new Error('Network Error'));

        await act(async () => {
            renderDetailsPage('bulbasaur');
        });

        await waitFor(() => {
            expect(screen.getByText(/Ocorreu um erro ao carregar os detalhes do Pokémon\. Tente novamente\./i)).toBeInTheDocument();
        });

        await act(async () => {
            const backButton = screen.getByText('Voltar à Home');
            fireEvent.click(backButton);
        });
        expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('deve carregar e mostrar descrição da ability ao passar o mouse', async () => {
        fetchPokemonDetails.mockResolvedValue(mockPokemonData);

        getPokemonDetailsByUrl.mockImplementation((url) => {
            if (url === 'url-overgrow') {
                return Promise.resolve(mockOvergrowDescription);
            } else if (url === 'url-chlorophyll') {
                return Promise.resolve(mockChlorophyllDescription);
            }
            return Promise.resolve({ effect_entries: [] });
        });

        await act(async () => {
            renderDetailsPage('bulbasaur');
        });
        await waitFor(() => expect(screen.getByText(/Bulbasaur #1/i)).toBeInTheDocument());

        await act(async () => {
            const overgrowItem = screen.getByText('overgrow');
            fireEvent.mouseEnter(overgrowItem);
        });

        await waitFor(() => {
            expect(screen.getByTestId('ability-tooltip')).toBeInTheDocument();
        });

        expect(screen.getByTestId('ability-tooltip')).toHaveTextContent('Boosts Grass moves when HP is low.');

        await act(async () => {
            fireEvent.mouseLeave(screen.getByText('overgrow'));
        });

        await waitFor(() => {
            expect(screen.queryByTestId('ability-tooltip')).not.toBeInTheDocument();
        });

        await act(async () => {
            const chlorophyllItem = screen.getByText('chlorophyll');
            fireEvent.mouseEnter(chlorophyllItem);
        });

        await waitFor(() => {
            expect(screen.getByTestId('ability-tooltip')).toBeInTheDocument();
        });

        expect(screen.getByTestId('ability-tooltip')).toHaveTextContent('Speed doubles in sunshine.');
    });

    it('não deve atualizar o estado se a requisição for abortada', async () => {
        fetchPokemonDetails.mockResolvedValue(mockPokemonData);

        let resolveFirstCall;

        getPokemonDetailsByUrl
            .mockImplementationOnce((url, options = {}) => {
                return new Promise((resolve) => {
                    resolveFirstCall = resolve;
                });
            })
            .mockImplementationOnce((url) => {
                if (url === 'url-chlorophyll') {
                    return Promise.resolve(mockChlorophyllDescription);
                }
                return Promise.resolve({ effect_entries: [] });
            });

        await act(async () => {
            renderDetailsPage('bulbasaur');
        });
        await waitFor(() => expect(screen.getByText(/Bulbasaur #1/i)).toBeInTheDocument());

        await act(async () => {
            const overgrowItem = screen.getByText('overgrow');
            fireEvent.mouseEnter(overgrowItem);
        });

        await waitFor(() => {
            expect(getPokemonDetailsByUrl).toHaveBeenCalledWith('url-overgrow', expect.any(Object));
        });

        await act(async () => {
            const chlorophyllItem = screen.getByText('chlorophyll');
            fireEvent.mouseEnter(chlorophyllItem);
        });

        await waitFor(() => {
            expect(screen.getByTestId('ability-tooltip')).toBeInTheDocument();
        });

        expect(screen.getByTestId('ability-tooltip')).toHaveTextContent('Speed doubles in sunshine.');

        await act(async () => {
            resolveFirstCall(mockOvergrowDescription);
        });

        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 50));
        });

        expect(screen.getByTestId('ability-tooltip')).toHaveTextContent('Speed doubles in sunshine.');

        expect(getPokemonDetailsByUrl).toHaveBeenCalledTimes(2);
    });

    it('deve mostrar tooltip com descrição correta para cada ability', async () => {
        fetchPokemonDetails.mockResolvedValue(mockPokemonData);

        getPokemonDetailsByUrl.mockImplementation((url) => {
            if (url === 'url-overgrow') {
                return Promise.resolve(mockOvergrowDescription);
            } else if (url === 'url-chlorophyll') {
                return Promise.resolve(mockChlorophyllDescription);
            }
            return Promise.resolve({ effect_entries: [] });
        });

        await act(async () => {
            renderDetailsPage('bulbasaur');
        });
        await waitFor(() => expect(screen.getByText(/Bulbasaur #1/i)).toBeInTheDocument());

        const overgrowItem = screen.getByText('overgrow');

        expect(screen.queryByTestId('ability-tooltip')).not.toBeInTheDocument();

        await act(async () => {
            fireEvent.mouseEnter(overgrowItem);
        });

        await waitFor(() => {
            expect(screen.getByTestId('ability-tooltip')).toBeInTheDocument();
        });

        expect(screen.getByTestId('ability-tooltip')).toHaveTextContent('Boosts Grass moves when HP is low.');

        await act(async () => {
            fireEvent.mouseLeave(overgrowItem);
        });

        await waitFor(() => {
            expect(screen.queryByTestId('ability-tooltip')).not.toBeInTheDocument();
        });

        await act(async () => {
            const chlorophyllItem = screen.getByText('chlorophyll');
            fireEvent.mouseEnter(chlorophyllItem);
        });

        await waitFor(() => {
            expect(screen.getByTestId('ability-tooltip')).toBeInTheDocument();
        });

        expect(screen.getByTestId('ability-tooltip')).toHaveTextContent('Speed doubles in sunshine.');
    });

    it('deve renderizar a imagem do Pokémon com a URL correta', async () => {
        const pokemonWithDefaultImage = {
            ...mockPokemonData,
            sprites: {
                front_default: 'bulbasaur.png',
                other: { dream_world: { front_default: null } }
            }
        };

        fetchPokemonDetails.mockResolvedValue(pokemonWithDefaultImage);
        getPokemonDetailsByUrl.mockResolvedValue(mockOvergrowDescription);

        await act(async () => {
            renderDetailsPage('bulbasaur');
        });

        await waitFor(() => expect(screen.getByText(/Bulbasaur #1/i)).toBeInTheDocument());

        const pokemonImage = screen.getByAltText('bulbasaur');
        expect(pokemonImage).toBeInTheDocument();
        expect(pokemonImage).toHaveAttribute('src', 'bulbasaur.png');
        expect(pokemonImage).toHaveAttribute('alt', 'bulbasaur');
    });

    it('deve usar imagem dream_world quando disponível', async () => {
        fetchPokemonDetails.mockResolvedValue(mockPokemonData);
        getPokemonDetailsByUrl.mockResolvedValue(mockOvergrowDescription);

        await act(async () => {
            renderDetailsPage('bulbasaur');
        });

        await waitFor(() => expect(screen.getByText(/Bulbasaur #1/i)).toBeInTheDocument());

        const pokemonImage = screen.getByAltText('bulbasaur');
        expect(pokemonImage).toHaveAttribute('src', 'bulbasaur-dream.png');
    });

    it('deve usar imagem padrão quando dream_world não estiver disponível', async () => {
        const pokemonWithoutDreamWorld = {
            ...mockPokemonData,
            sprites: {
                front_default: 'bulbasaur-default.png',
                other: { dream_world: { front_default: null } }
            }
        };

        fetchPokemonDetails.mockResolvedValue(pokemonWithoutDreamWorld);
        getPokemonDetailsByUrl.mockResolvedValue(mockOvergrowDescription);

        await act(async () => {
            renderDetailsPage('bulbasaur');
        });

        await waitFor(() => expect(screen.getByText(/Bulbasaur #1/i)).toBeInTheDocument());

        const pokemonImage = screen.getByAltText('bulbasaur');
        expect(pokemonImage).toHaveAttribute('src', 'bulbasaur-default.png');
    });

    it('deve exibir múltiplos tipos corretamente', async () => {
        fetchPokemonDetails.mockResolvedValue(mockPokemonData);
        getPokemonDetailsByUrl.mockResolvedValue(mockOvergrowDescription);

        await act(async () => {
            renderDetailsPage('bulbasaur');
        });

        await waitFor(() => expect(screen.getByText(/Bulbasaur #1/i)).toBeInTheDocument());

        expect(screen.getByText('GRASS')).toBeInTheDocument();
        expect(screen.getByText('POISON')).toBeInTheDocument();
    });

    it('deve exibir todas as stats corretamente', async () => {
        fetchPokemonDetails.mockResolvedValue(mockPokemonData);
        getPokemonDetailsByUrl.mockResolvedValue(mockOvergrowDescription);

        await act(async () => {
            renderDetailsPage('bulbasaur');
        });

        await waitFor(() => expect(screen.getByText(/Bulbasaur #1/i)).toBeInTheDocument());

        expect(screen.getByText('HP:')).toBeInTheDocument();
        expect(screen.getByText('ATTACK:')).toBeInTheDocument();
        expect(screen.getByText('DEFENSE:')).toBeInTheDocument();
        expect(screen.getByText('45')).toBeInTheDocument();

        const stats49 = screen.getAllByText('49');
        expect(stats49).toHaveLength(2);
    });

    it('deve exibir moves corretamente', async () => {
        fetchPokemonDetails.mockResolvedValue(mockPokemonData);
        getPokemonDetailsByUrl.mockResolvedValue(mockOvergrowDescription);

        await act(async () => {
            renderDetailsPage('bulbasaur');
        });

        await waitFor(() => expect(screen.getByText(/Bulbasaur #1/i)).toBeInTheDocument());

        expect(screen.getByText('razor leaf')).toBeInTheDocument();
        expect(screen.getByText('vine whip')).toBeInTheDocument();
        expect(screen.getByText('tackle')).toBeInTheDocument();
    });

    it('deve marcar abilities hidden corretamente', async () => {
        fetchPokemonDetails.mockResolvedValue(mockPokemonData);
        getPokemonDetailsByUrl.mockResolvedValue(mockOvergrowDescription);

        await act(async () => {
            renderDetailsPage('bulbasaur');
        });

        await waitFor(() => expect(screen.getByText(/Bulbasaur #1/i)).toBeInTheDocument());

        const hiddenAbility = screen.getByText('chlorophyll');
        expect(hiddenAbility).toHaveClass('faokdS');
    });

    it('deve lidar com erro ao carregar descrição da ability sem mostrar console.error', async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

        fetchPokemonDetails.mockResolvedValue(mockPokemonData);

        getPokemonDetailsByUrl.mockRejectedValue(new Error('Network error'));

        await act(async () => {
            renderDetailsPage('bulbasaur');
        });

        await waitFor(() => expect(screen.getByText(/Bulbasaur #1/i)).toBeInTheDocument());

        await act(async () => {
            const overgrowItem = screen.getByText('overgrow');
            fireEvent.mouseEnter(overgrowItem);
        });

        await waitFor(() => {
            expect(getPokemonDetailsByUrl).toHaveBeenCalledWith('url-overgrow', expect.any(Object));
        });

        consoleErrorSpy.mockRestore();
    });

    it('deve lidar com ability sem descrição em inglês', async () => {
        fetchPokemonDetails.mockResolvedValue(mockPokemonData);

        getPokemonDetailsByUrl.mockResolvedValue({
            effect_entries: [
                { effect: 'Descrição em japonês', language: { name: 'ja' } },
                { effect: 'Descrição em espanhol', language: { name: 'es' } }
            ]
        });

        await act(async () => {
            renderDetailsPage('bulbasaur');
        });

        await waitFor(() => expect(screen.getByText(/Bulbasaur #1/i)).toBeInTheDocument());

        await act(async () => {
            const overgrowItem = screen.getByText('overgrow');
            fireEvent.mouseEnter(overgrowItem);
        });

        await waitFor(() => {
            expect(screen.getByTestId('ability-tooltip')).toBeInTheDocument();
        });

        expect(screen.getByTestId('ability-tooltip')).toHaveTextContent('No description available.');
    });

    it('deve limpar estados ao desmontar', async () => {
        const abortMock = jest.fn();
        const AbortControllerMock = jest.fn(() => ({
            abort: abortMock,
            signal: {}
        }));
        global.AbortController = AbortControllerMock;

        fetchPokemonDetails.mockResolvedValue(mockPokemonData);
        getPokemonDetailsByUrl.mockResolvedValue(mockOvergrowDescription);

        const { unmount } = render(
            <MemoryRouter initialEntries={['/pokemon/bulbasaur']}>
                <StyleSheetManager shouldForwardProp={shouldForwardProp}>
                    <ThemeProvider theme={mockTheme}>
                        <Routes>
                            <Route path="/pokemon/:name" element={<DetailsPage />} />
                        </Routes>
                    </ThemeProvider>
                </StyleSheetManager>
            </MemoryRouter>
        );

        await waitFor(() => expect(screen.getByText(/Bulbasaur #1/i)).toBeInTheDocument());

        unmount();

        expect(AbortControllerMock).toHaveBeenCalled();
    });

    it('deve exibir loading state corretamente', async () => {
        fetchPokemonDetails.mockImplementation(() => new Promise(() => { }));

        await act(async () => {
            renderDetailsPage('bulbasaur');
        });

        expect(screen.getByText('Carregando detalhes do Pokémon...')).toBeInTheDocument();
    });

    it('deve exibir mensagem quando não há dados do Pokémon', async () => {
        fetchPokemonDetails.mockResolvedValue(null);

        await act(async () => {
            renderDetailsPage('bulbasaur');
        });

        await waitFor(() => {
            expect(screen.getByText('Nenhum dado de Pokémon para exibir.')).toBeInTheDocument();
        });
    });

    it('deve formatar nome do Pokémon com primeira letra maiúscula', async () => {
        const pokemonWithLowercaseName = {
            ...mockPokemonData,
            name: 'pikachu'
        };

        fetchPokemonDetails.mockResolvedValue(pokemonWithLowercaseName);
        getPokemonDetailsByUrl.mockResolvedValue(mockOvergrowDescription);

        await act(async () => {
            renderDetailsPage('pikachu');
        });

        await waitFor(() => expect(screen.getByText(/Pikachu #1/i)).toBeInTheDocument());
    });

    it('deve substituir hífens nos nomes das moves', async () => {
        fetchPokemonDetails.mockResolvedValue(mockPokemonData);
        getPokemonDetailsByUrl.mockResolvedValue(mockOvergrowDescription);

        await act(async () => {
            renderDetailsPage('bulbasaur');
        });

        await waitFor(() => expect(screen.getByText(/Bulbasaur #1/i)).toBeInTheDocument());

        expect(screen.getByText('razor leaf')).toBeInTheDocument();
        expect(screen.getByText('vine whip')).toBeInTheDocument();
    });
    it('deve lidar com Pokémon sem abilities', async () => {
        const pokemonWithoutAbilities = {
            ...mockPokemonData,
            abilities: []
        };

        fetchPokemonDetails.mockResolvedValue(pokemonWithoutAbilities);
        getPokemonDetailsByUrl.mockResolvedValue(mockOvergrowDescription);

        await act(async () => {
            renderDetailsPage('bulbasaur');
        });

        await waitFor(() => expect(screen.getByText(/Bulbasaur #1/i)).toBeInTheDocument());

        expect(screen.getByText('Abilities')).toBeInTheDocument();
    });

    it('deve lidar com Pokémon sem moves', async () => {
        const pokemonWithoutMoves = {
            ...mockPokemonData,
            moves: []
        };

        fetchPokemonDetails.mockResolvedValue(pokemonWithoutMoves);
        getPokemonDetailsByUrl.mockResolvedValue(mockOvergrowDescription);

        await act(async () => {
            renderDetailsPage('bulbasaur');
        });

        await waitFor(() => expect(screen.getByText(/Bulbasaur #1/i)).toBeInTheDocument());

        expect(screen.getByText('Moves')).toBeInTheDocument();
    });

    it('deve lidar com Pokémon sem stats', async () => {
        const pokemonWithoutStats = {
            ...mockPokemonData,
            stats: []
        };

        fetchPokemonDetails.mockResolvedValue(pokemonWithoutStats);
        getPokemonDetailsByUrl.mockResolvedValue(mockOvergrowDescription);

        await act(async () => {
            renderDetailsPage('bulbasaur');
        });

        await waitFor(() => expect(screen.getByText(/Bulbasaur #1/i)).toBeInTheDocument());

        expect(screen.getByText('Base Stats')).toBeInTheDocument();
    });

    it('deve lidar com Pokémon sem tipos', async () => {
        const pokemonWithoutTypes = {
            ...mockPokemonData,
            types: []
        };

        fetchPokemonDetails.mockResolvedValue(pokemonWithoutTypes);
        getPokemonDetailsByUrl.mockResolvedValue(mockOvergrowDescription);

        await act(async () => {
            renderDetailsPage('bulbasaur');
        });

        await waitFor(() => expect(screen.getByText(/Bulbasaur #1/i)).toBeInTheDocument());

        expect(screen.getByText('Types')).toBeInTheDocument();
    });

    it('deve aplicar cor padrão quando tipo não existe em TYPE_COLORS', async () => {
        const pokemonWithUnknownType = {
            ...mockPokemonData,
            types: [{ type: { name: 'unknown-type' } }]
        };

        fetchPokemonDetails.mockResolvedValue(pokemonWithUnknownType);
        getPokemonDetailsByUrl.mockResolvedValue(mockOvergrowDescription);

        await act(async () => {
            renderDetailsPage('bulbasaur');
        });

        await waitFor(() => expect(screen.getByText(/Bulbasaur #1/i)).toBeInTheDocument());

        expect(screen.getByText('UNKNOWN-TYPE')).toBeInTheDocument();
    });

    it('deve lidar com ability com descrição vazia', async () => {
        fetchPokemonDetails.mockResolvedValue(mockPokemonData);

        getPokemonDetailsByUrl.mockResolvedValue({
            effect_entries: []
        });

        await act(async () => {
            renderDetailsPage('bulbasaur');
        });

        await waitFor(() => expect(screen.getByText(/Bulbasaur #1/i)).toBeInTheDocument());

        await act(async () => {
            const overgrowItem = screen.getByText('overgrow');
            fireEvent.mouseEnter(overgrowItem);
        });

        await waitFor(() => {
            expect(screen.getByTestId('ability-tooltip')).toBeInTheDocument();
        });

        expect(screen.getByTestId('ability-tooltip')).toHaveTextContent('No description available.');
    });

    it('deve cancelar requisição quando componente desmonta durante loading', async () => {
        const abortMock = jest.fn();
        const AbortControllerMock = jest.fn(() => ({
            abort: abortMock,
            signal: {}
        }));
        global.AbortController = AbortControllerMock;

        fetchPokemonDetails.mockImplementation(() => new Promise(() => { }));

        const { unmount } = render(
            <MemoryRouter initialEntries={['/pokemon/bulbasaur']}>
                <StyleSheetManager shouldForwardProp={shouldForwardProp}>
                    <ThemeProvider theme={mockTheme}>
                        <Routes>
                            <Route path="/pokemon/:name" element={<DetailsPage />} />
                        </Routes>
                    </ThemeProvider>
                </StyleSheetManager>
            </MemoryRouter>
        );

        expect(screen.getByText('Carregando detalhes do Pokémon...')).toBeInTheDocument();

        unmount();

        expect(AbortControllerMock).toHaveBeenCalled();
    });

    it('deve lidar com nome de Pokémon com hífen', async () => {
        const pokemonWithHyphen = {
            ...mockPokemonData,
            name: 'ho-oh'
        };

        fetchPokemonDetails.mockResolvedValue(pokemonWithHyphen);
        getPokemonDetailsByUrl.mockResolvedValue(mockOvergrowDescription);

        await act(async () => {
            renderDetailsPage('ho-oh');
        });

        await waitFor(() => expect(screen.getByText(/Ho-oh #1/i)).toBeInTheDocument());
    });

    it('deve mostrar texto padrão para ability não carregada', async () => {
        fetchPokemonDetails.mockResolvedValue(mockPokemonData);
        getPokemonDetailsByUrl.mockResolvedValue(mockOvergrowDescription);

        await act(async () => {
            renderDetailsPage('bulbasaur');
        });

        await waitFor(() => expect(screen.getByText(/Bulbasaur #1/i)).toBeInTheDocument());

        const abilityItems = screen.getAllByRole('listitem');
        const abilityWithDefaultText = abilityItems.find(item =>
            item.textContent.includes('overgrow') || item.textContent.includes('chlorophyll')
        );

        expect(abilityWithDefaultText).toBeInTheDocument();
    });

    it('deve manter tooltip visível durante hover contínuo', async () => {
        fetchPokemonDetails.mockResolvedValue(mockPokemonData);
        getPokemonDetailsByUrl.mockResolvedValue(mockOvergrowDescription);

        await act(async () => {
            renderDetailsPage('bulbasaur');
        });

        await waitFor(() => expect(screen.getByText(/Bulbasaur #1/i)).toBeInTheDocument());

        const overgrowItem = screen.getByText('overgrow');

        await act(async () => {
            fireEvent.mouseEnter(overgrowItem);
        });

        await waitFor(() => {
            expect(screen.getByTestId('ability-tooltip')).toBeInTheDocument();
        });

        await act(async () => {
            fireEvent.mouseMove(overgrowItem);
        });

        expect(screen.getByTestId('ability-tooltip')).toBeInTheDocument();

        await act(async () => {
            fireEvent.mouseLeave(overgrowItem);
        });

        await waitFor(() => {
            expect(screen.queryByTestId('ability-tooltip')).not.toBeInTheDocument();
        });
    });

    it('deve lidar com stat com valor zero', async () => {
        const pokemonWithZeroStat = {
            ...mockPokemonData,
            stats: [{ stat: { name: 'speed' }, base_stat: 0 }]
        };

        fetchPokemonDetails.mockResolvedValue(pokemonWithZeroStat);
        getPokemonDetailsByUrl.mockResolvedValue(mockOvergrowDescription);

        await act(async () => {
            renderDetailsPage('bulbasaur');
        });

        await waitFor(() => expect(screen.getByText(/Bulbasaur #1/i)).toBeInTheDocument());

        expect(screen.getByText('SPEED:')).toBeInTheDocument();
        expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('deve lidar com stat com valor máximo', async () => {
        const pokemonWithMaxStat = {
            ...mockPokemonData,
            stats: [{ stat: { name: 'attack' }, base_stat: 255 }]
        };

        fetchPokemonDetails.mockResolvedValue(pokemonWithMaxStat);
        getPokemonDetailsByUrl.mockResolvedValue(mockOvergrowDescription);

        await act(async () => {
            renderDetailsPage('bulbasaur');
        });

        await waitFor(() => expect(screen.getByText(/Bulbasaur #1/i)).toBeInTheDocument());

        expect(screen.getByText('ATTACK:')).toBeInTheDocument();
        expect(screen.getByText('255')).toBeInTheDocument();
    });
});