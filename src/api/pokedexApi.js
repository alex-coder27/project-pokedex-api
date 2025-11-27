import axios from 'axios';
const BASE_URL = "https://pokeapi.co/api/v2";

export const getPokemonList = async (offset = 0, limit = 10, options = {}) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/pokemon?offset=${offset}&limit=${limit}`,
      { signal: options.signal }
    );
    return response.data;
  } catch (error) {
    if (axios.isCancel(error)) {
        throw new DOMException('Requisição abortada pelo usuário.', 'AbortError');
    }
    throw error;
  }
};

export const getPokemonListByType = async (type, options = {}) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/type/${type}`,
      { signal: options.signal }
    );
    return response.data.pokemon.map(p => p.pokemon);
  } catch (error) {
    if (axios.isCancel(error)) {
        throw new DOMException('Requisição abortada pelo usuário.', 'AbortError');
    }
    throw error;
  }
};

export const getPokemonDetailsByUrl = async (url, options = {}) => {
  try {
    const response = await axios.get(
      url, 
      { signal: options.signal }
    );
    return response.data;
  } catch (error) {
    if (axios.isCancel(error)) {
        throw new DOMException('Requisição abortada pelo usuário.', 'AbortError');
    }
    throw error;
  }
};

export const fetchPokemonDetails = async (name) => {
    const url = `${BASE_URL}/pokemon/${name.toLowerCase()}`;
    return getPokemonDetailsByUrl(url); 
};