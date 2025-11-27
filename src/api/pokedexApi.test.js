import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { 
    getPokemonList, 
    getPokemonDetailsByUrl, 
    fetchPokemonDetails,
    getPokemonListByType
} from './pokedexApi';

const BASE_URL = 'https://pokeapi.co/api/v2';
const mock = new MockAdapter(axios);

const originalIsCancel = axios.isCancel; 

describe('pokedexApi', () => {
    afterEach(() => {
        mock.reset();
        axios.isCancel = originalIsCancel; 
    });

    describe('getPokemonList', () => {
        it('deve buscar pokemons com offset e limit corretos', async () => {
            const mockData = { results: [{ name: 'pikachu' }], next: null, count: 1 };
            mock.onGet(`${BASE_URL}/pokemon?offset=20&limit=15`).reply(200, mockData);
            const data = await getPokemonList(20, 15);
            expect(data).toEqual(mockData);
        });

        it('deve usar valores padrão quando offset e limit não são fornecidos', async () => {
            const mockData = { results: [{ name: 'bulbasaur' }], next: null, count: 1 };
            mock.onGet(`${BASE_URL}/pokemon?offset=0&limit=10`).reply(200, mockData);
            const data = await getPokemonList();
            expect(data).toEqual(mockData);
        });

        it('deve passar o signal para a requisição axios', async () => {
            const mockData = { results: [], next: null, count: 0 };
            const abortController = new AbortController();
            const signal = abortController.signal;
            
            mock.onGet(`${BASE_URL}/pokemon?offset=0&limit=10`).reply(200, mockData);
            
            await getPokemonList(0, 10, { signal });
            
            expect(mock.history.get[0].signal).toBe(signal);
        });

        it('deve lançar um erro em caso de falha na API (e.g., 500)', async () => {
            mock.onGet(`${BASE_URL}/pokemon?offset=0&limit=10`).reply(500);
            await expect(getPokemonList()).rejects.toThrow();
        });

        it('deve lançar erro em caso de timeout', async () => {
            mock.onGet(`${BASE_URL}/pokemon?offset=0&limit=10`).timeout();
            await expect(getPokemonList()).rejects.toThrow();
        });

        it('deve lançar erro em caso de network error', async () => {
            mock.onGet(`${BASE_URL}/pokemon?offset=0&limit=10`).networkError();
            await expect(getPokemonList()).rejects.toThrow();
        });

        it('deve lançar DOMException AbortError quando a requisição é cancelada', async () => {
            mock.onGet(`${BASE_URL}/pokemon?offset=0&limit=10`).abortRequest();
            axios.isCancel = jest.fn(() => true);
            
            await expect(getPokemonList()).rejects.toMatchObject({
                name: 'AbortError',
                message: 'Requisição abortada pelo usuário.',
            });
            
            expect(axios.isCancel).toHaveBeenCalled();
        });

        it('deve lidar com resposta vazia', async () => {
            const mockData = { results: [], next: null, count: 0 };
            mock.onGet(`${BASE_URL}/pokemon?offset=1000&limit=10`).reply(200, mockData);
            const data = await getPokemonList(1000, 10);
            expect(data).toEqual(mockData);
            expect(data.results).toHaveLength(0);
        });
    });

    describe('fetchPokemonDetails', () => {
        it('deve buscar detalhes de um Pokémon pelo nome', async () => {
            const mockDetails = { id: 25, name: 'pikachu', weight: 60 };
            mock.onGet(`${BASE_URL}/pokemon/pikachu`).reply(200, mockDetails);
            const details = await fetchPokemonDetails('pikachu');

            expect(details).toEqual(mockDetails);
            expect(details.name).toBe('pikachu');
        });

        it('deve converter nome para minúsculo', async () => {
            const mockDetails = { id: 6, name: 'charizard', weight: 905 };
            mock.onGet(`${BASE_URL}/pokemon/charizard`).reply(200, mockDetails);
            const details = await fetchPokemonDetails('CHARIZARD');
            
            expect(details).toEqual(mockDetails);
            expect(details.name).toBe('charizard');
        });

        it('deve lançar um erro se o Pokémon não for encontrado (404)', async () => {
            mock.onGet(`${BASE_URL}/pokemon/invalidname`).reply(404);
            await expect(fetchPokemonDetails('invalidname')).rejects.toThrow();
        });

        it('deve lançar erro em caso de server error (500)', async () => {
            mock.onGet(`${BASE_URL}/pokemon/pikachu`).reply(500);
            await expect(fetchPokemonDetails('pikachu')).rejects.toThrow();
        });

        it('deve lançar erro em caso de network error', async () => {
            mock.onGet(`${BASE_URL}/pokemon/pikachu`).networkError();
            await expect(fetchPokemonDetails('pikachu')).rejects.toThrow();
        });

        it('deve lidar com Pokémon com nome composto', async () => {
            const mockDetails = { id: 386, name: 'deoxys-normal', forms: [] };
            mock.onGet(`${BASE_URL}/pokemon/deoxys-normal`).reply(200, mockDetails);
            const details = await fetchPokemonDetails('deoxys-normal');
            
            expect(details.name).toBe('deoxys-normal');
        });
    });

    describe('getPokemonDetailsByUrl', () => {
        it('deve buscar detalhes pela URL fornecida', async () => {
            const url = `${BASE_URL}/pokemon/25`;
            const mockDetails = { id: 25, name: 'pikachu', types: [] };
            mock.onGet(url).reply(200, mockDetails);
            
            const details = await getPokemonDetailsByUrl(url);
            
            expect(details).toEqual(mockDetails);
            expect(details.id).toBe(25);
        });

        it('deve passar o signal para a requisição axios', async () => {
            const url = `${BASE_URL}/pokemon/1`;
            const mockDetails = { id: 1, name: 'bulbasaur' };
            const abortController = new AbortController();
            const signal = abortController.signal;
            
            mock.onGet(url).reply(200, mockDetails);
            
            await getPokemonDetailsByUrl(url, { signal });
            
            expect(mock.history.get[0].signal).toBe(signal);
        });

        it('deve lançar DOMException AbortError quando a requisição é cancelada', async () => {
            const url = `${BASE_URL}/pokemon/1`;
            mock.onGet(url).abortRequest();
            axios.isCancel = jest.fn(() => true);
            
            await expect(getPokemonDetailsByUrl(url)).rejects.toMatchObject({
                name: 'AbortError',
                message: 'Requisição abortada pelo usuário.',
            });
        });

        it('deve lançar erro em caso de URL inválida', async () => {
            const invalidUrl = 'invalid-url';
            mock.onGet(invalidUrl).networkError();
            
            await expect(getPokemonDetailsByUrl(invalidUrl)).rejects.toThrow();
        });

        it('deve lançar erro em caso de server error', async () => {
            const url = `${BASE_URL}/pokemon/1`;
            mock.onGet(url).reply(500);
            
            await expect(getPokemonDetailsByUrl(url)).rejects.toThrow();
        });
    });

    describe('getPokemonListByType', () => {
        it('deve retornar uma lista de URLs de pokemons do tipo fire', async () => {
            const mockTypeData = { 
                pokemon: [
                    { pokemon: { name: 'charmander', url: `${BASE_URL}/pokemon/4/` } },
                    { pokemon: { name: 'vulpix', url: `${BASE_URL}/pokemon/37/` } }
                ] 
            };
            const expectedUrls = mockTypeData.pokemon.map(p => p.pokemon);
            mock.onGet(`${BASE_URL}/type/fire`).reply(200, mockTypeData);

            const data = await getPokemonListByType('fire');
            expect(data).toEqual(expectedUrls);
            expect(data.length).toBe(2);
        });

        it('deve passar o signal para a requisição axios', async () => {
            const mockTypeData = { pokemon: [] };
            const abortController = new AbortController();
            const signal = abortController.signal;
            
            mock.onGet(`${BASE_URL}/type/water`).reply(200, mockTypeData);
            
            await getPokemonListByType('water', { signal });
            
            expect(mock.history.get[0].signal).toBe(signal);
        });

        it('deve lidar com tipo inexistente', async () => {
            mock.onGet(`${BASE_URL}/type/invalidtype`).reply(404);
            
            await expect(getPokemonListByType('invalidtype')).rejects.toThrow();
        });

        it('deve lançar DOMException AbortError quando a requisição é cancelada', async () => {
            mock.onGet(`${BASE_URL}/type/electric`).abortRequest();
            axios.isCancel = jest.fn(() => true);
            
            await expect(getPokemonListByType('electric')).rejects.toMatchObject({
                name: 'AbortError',
                message: 'Requisição abortada pelo usuário.',
            });
        });

        it('deve lançar erro em caso de server error', async () => {
            mock.onGet(`${BASE_URL}/type/grass`).reply(500);
            
            await expect(getPokemonListByType('grass')).rejects.toThrow();
        });

        it('deve lidar com lista vazia de pokémons para um tipo', async () => {
            const mockTypeData = { pokemon: [] };
            mock.onGet(`${BASE_URL}/type/unknown`).reply(200, mockTypeData);
            
            const data = await getPokemonListByType('unknown');
            expect(data).toEqual([]);
            expect(data).toHaveLength(0);
        });

        it('deve lidar com tipos com caracteres especiais', async () => {
            const mockTypeData = { 
                pokemon: [
                    { pokemon: { name: 'togekiss', url: `${BASE_URL}/pokemon/468/` } }
                ] 
            };
            mock.onGet(`${BASE_URL}/type/fairy`).reply(200, mockTypeData);
            
            const data = await getPokemonListByType('fairy');
            expect(data).toHaveLength(1);
            expect(data[0].name).toBe('togekiss');
        });

        it('deve lidar com tipos em maiúsculo', async () => {
            const mockTypeData = { 
                pokemon: [
                    { pokemon: { name: 'geodude', url: `${BASE_URL}/pokemon/74/` } }
                ] 
            };
            mock.onGet(`${BASE_URL}/type/ROCK`).reply(200, mockTypeData);
            
            const data = await getPokemonListByType('ROCK');
            expect(data).toHaveLength(1);
            expect(data[0].name).toBe('geodude');
        });
    });

    describe('Integração entre funções', () => {
        it('deve integrar getPokemonList com getPokemonDetailsByUrl corretamente', async () => {
            const mockList = {
                results: [
                    { name: 'bulbasaur', url: `${BASE_URL}/pokemon/1` },
                    { name: 'ivysaur', url: `${BASE_URL}/pokemon/2` }
                ],
                next: null,
                count: 2
            };
            
            const mockDetails1 = { id: 1, name: 'bulbasaur', types: [] };
            const mockDetails2 = { id: 2, name: 'ivysaur', types: [] };
            
            mock.onGet(`${BASE_URL}/pokemon?offset=0&limit=10`).reply(200, mockList);
            mock.onGet(`${BASE_URL}/pokemon/1`).reply(200, mockDetails1);
            mock.onGet(`${BASE_URL}/pokemon/2`).reply(200, mockDetails2);
            
            const list = await getPokemonList();
            const details1 = await getPokemonDetailsByUrl(list.results[0].url);
            const details2 = await getPokemonDetailsByUrl(list.results[1].url);
            
            expect(details1.name).toBe('bulbasaur');
            expect(details2.name).toBe('ivysaur');
        });

        it('deve integrar getPokemonListByType com fetchPokemonDetails corretamente', async () => {
            const mockTypeData = {
                pokemon: [
                    { pokemon: { name: 'charmander', url: `${BASE_URL}/pokemon/4/` } }
                ]
            };
            
            const mockDetails = { id: 4, name: 'charmander', types: [] };
            
            mock.onGet(`${BASE_URL}/type/fire`).reply(200, mockTypeData);
            mock.onGet(`${BASE_URL}/pokemon/charmander`).reply(200, mockDetails);
            
            const typeList = await getPokemonListByType('fire');
            const details = await fetchPokemonDetails(typeList[0].name);
            
            expect(details.name).toBe('charmander');
            expect(details.id).toBe(4);
        });
    });
});