import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPokemonList, getPokemonDetails } from '../../api/pokedexApi';
import CardPokemon from '../../components/CardPokemon/index';
import Header from '../../components/Header/index';
import { Container, PokemonGrid, LoadMoreButton } from './style';

const POKEMONS_PER_PAGE = 10;

const HomePage = () => {
  const navigate = useNavigate();
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
  const handleCardClick = (pokemonName) => {
    navigate(`/pokemon/${pokemonName}`);
  };

  useEffect(() => {
    fetchPokemons(0);
  }, []);

  const handleLoadMore = () => {
    fetchPokemons(nextOffset);
  };

  return (
   <Container>
        <Header />
        <PokemonGrid>
          {pokemons.map((pokemon, index) => (
            <CardPokemon 
              key={`${pokemon.id}-${index}`} 
              pokemon={pokemon}
              onCardClick={handleCardClick}
            />
          ))}
        </PokemonGrid>

        {hasMore && (
            <LoadMoreButton onClick={handleLoadMore} disabled={isLoading}>
              {isLoading ? 'Loading...' : 'Load More'}
            </LoadMoreButton>
        )}
    </Container>
  );
};

export default HomePage;