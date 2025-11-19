import { useState, useEffect } from 'react';
import { getPokemonList, getPokemonDetails } from '../../api/pokedexApi'; 

const POKEMONS_PER_PAGE = 10;

const HomePage = () => {
  const [pokemons, setPokemons] = useState([]);
  const [nextOffset, setNextOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const fetchPokemons = async (offset) => {
    setIsLoading(true);
    try {
      const listData = await getPokemonList(offset, POKEMONS_PER_PAGE);
      const nextOffsetValue = offset + POKEMONS_PER_PAGE;
      setNextOffset(nextOffsetValue);
      if (!listData.next) {
          setHasMore(false);
      }
      const detailedPokemonsPromises = listData.results.map(item => 
        getPokemonDetails(item.url)
      );
      const detailedPokemons = await Promise.all(detailedPokemonsPromises);
      setPokemons(prevPokemons => {
            const existingIds = new Set(prevPokemons.map(p => p.id));
            const uniqueNewPokemons = detailedPokemons.filter(newP => 
                newP && newP.id && !existingIds.has(newP.id)
            );
            return [...prevPokemons, ...uniqueNewPokemons];
        });

    } catch (error) {
      console.error("Failed to fetch pokemons:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPokemons(0);
  }, []);

  const handleLoadMore = () => {
    fetchPokemons(nextOffset);
  };

  return (
      <>
          {pokemons.map(pokemon => (
            <div 
              key={pokemon.id || pokemon.name} 
              onClick={() => {
                console.log(`Ta funcionando para ir na pagina details do pokemon: ${pokemon.name}`);
              }}
            >
              <img 
                src={pokemon.sprites.front_default} 
                alt={pokemon.name} 
              />
              <p>{pokemon.name}</p>
            </div>
          ))}
        
        {hasMore && (
            <button onClick={handleLoadMore} disabled={isLoading}>
              {isLoading ? 'Loading...' : 'Load More'}
            </button>
        )}
      </>
  );
};

export default HomePage;