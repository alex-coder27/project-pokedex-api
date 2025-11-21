import axios from 'axios';

const POKEDEX_URL = 'https://pokeapi.co/api/v2/pokemon';

export const getPokemonList = async (offset = 0, limit = 10) => {
  try {
    const response = await axios.get(POKEDEX_URL, {
      params: {
        offset: offset, 
        limit: limit, 
      }
    });
    return response.data; 

  } catch (error) {
    console.error("Error retrieving a list of Pokémon:", error);
    throw error;
  }
};

export const getPokemonDetailsByUrl = async (url) => {
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error(`Error retrieving data from ${url}:`, error); 
        throw error;
    }
};

export const fetchPokemonDetails = async (name) => {
    const url = `${POKEDEX_URL}/${name}`;
    return getPokemonDetailsByUrl(url); 
};