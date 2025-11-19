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

export const getPokemonDetails = async (url) => {
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error(`Error retrieving Pokémon details in ${url}:`, error);
        throw error;
    }
}