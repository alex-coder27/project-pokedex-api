import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { TYPE_COLORS, isLightColor } from '../../utils/typeColors';
import { usePokemonData } from '../../hooks/usePokemonData';
import CardPokemon from '../../components/CardPokemon/index';
import Header from '../../components/Header/index';
import LoadingPokemon from '../../assets/loading.png';
import {
  Container,
  PokemonGrid,
  LoadMoreButton,
  SearchContainer,
  SearchInput,
  FilterBarContainer,
  TypeSelect,
  TypeSelectWrapper,
  TypeOption,
  MessageParagraph
} from './style';

const ALL_TYPES = Object.keys(TYPE_COLORS);

const HomePage = () => {
  const navigate = useNavigate();
  const {
    pokemons,
    isLoading,
    hasMore,
    searchTerm,
    searchedPokemon,
    searchError,
    selectedType,
    setSearchTerm,
    setSearchedPokemon,
    setSearchError,
    setIsLoading,
    fetchPokemonDetails,
    handleLoadMore,
    handleTypeFilter,
  } = usePokemonData();

  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const selectedTypeColor = selectedType ? TYPE_COLORS[selectedType] : '';

  const debouncedSearch = useCallback(
    (term) => {
      const trimmedTerm = term.trim();

      if (trimmedTerm.length === 0) {
        setSearchedPokemon(null);
        setSearchError(null);
        setIsSearching(false);
        return;
      }

      const isValidSearchTerm = trimmedTerm.length >= 3 &&
        /^[a-zA-Z]+$/.test(trimmedTerm);
      const localMatches = pokemons.filter(p =>
        p.name.toLowerCase().includes(trimmedTerm.toLowerCase())
      );

      if (localMatches.length > 0) {
        setSearchedPokemon(null);
        setSearchError(null);
        setIsSearching(false);
        return;
      }

      if (isValidSearchTerm) {
        setIsSearching(true);
        fetchPokemonDetails(trimmedTerm)
          .then(data => {
            setSearchedPokemon(data);
            setSearchError(null);
          })
          .catch(error => {
            if (error.response && error.response.status === 404) {
              setSearchError(`Pokémon "${trimmedTerm}" não encontrado.`);
            } else {
              setSearchError(null);
            }
            setSearchedPokemon(null);
          })
          .finally(() => {
            setIsSearching(false);
          });
      } else {
        setSearchedPokemon(null);
        setSearchError(null);
        setIsSearching(false);
      }
    },
    [pokemons, fetchPokemonDetails, setSearchedPokemon, setSearchError]
  );

  useEffect(() => {
    if (localSearchTerm === searchTerm) return;

    const timer = setTimeout(() => {
      setSearchTerm(localSearchTerm);
      debouncedSearch(localSearchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [localSearchTerm, debouncedSearch, setSearchTerm, searchTerm]);

  const handleCardClick = (pokemonName) => {
    navigate(`/pokemon/${pokemonName}`);
  };

  const handleSearchChange = (event) => {
    const term = event.target.value;
    setLocalSearchTerm(term);

    if (term.length === 0) {
      setSearchTerm('');
      setSearchedPokemon(null);
      setSearchError(null);
      setIsSearching(false);
    }
  };

  const typesForSelect = ['all', ...ALL_TYPES];

  let pokemonsToDisplay = pokemons;

  if (localSearchTerm.length > 0) {
    if (searchedPokemon) {
      pokemonsToDisplay = [searchedPokemon];
    } else {
      pokemonsToDisplay = pokemons.filter(pokemon =>
        pokemon.name.toLowerCase().includes(localSearchTerm.toLowerCase())
      );
    }
  }

  const showLoading = isLoading || isSearching;
  const showNoResults = localSearchTerm.length > 0 && pokemonsToDisplay.length === 0 && !showLoading && !searchError;
  const showSearchError = searchError && localSearchTerm.length > 0;

  return (
    <Container>
      <Header />
      <FilterBarContainer>
        <SearchContainer>
          <SearchInput
            type="text"
            placeholder="Buscar Pokémon pelo nome... (mín. 3 letras)"
            value={localSearchTerm}
            onChange={handleSearchChange}
            disabled={showLoading}
          />
        </SearchContainer>
        <TypeSelectWrapper $typeColor={selectedTypeColor}>
          <TypeSelect
            onChange={handleTypeFilter}
            value={selectedType || 'all'}
            $typeColor={selectedTypeColor}
          >
            {typesForSelect.map((type) => {
              if (type === 'all') {
                return (
                  <TypeOption
                    key="all"
                    value="all"
                    $bgColor="#ffffff"
                    $textColor="#000000"
                  >
                    All
                  </TypeOption>
                );
              }

              const color = TYPE_COLORS[type];
              const textColor = isLightColor(color) ? '#000000' : '#ffffff';
              return (
                <TypeOption
                  key={type}
                  value={type}
                  $bgColor={color}
                  $textColor={textColor}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </TypeOption>
              );
            })}
          </TypeSelect>
        </TypeSelectWrapper>
      </FilterBarContainer>

      {showLoading && pokemonsToDisplay.length === 0 && (
        <MessageParagraph>Buscando...</MessageParagraph>
      )}

      {showSearchError && (
        <MessageParagraph>
          {searchError}
        </MessageParagraph>
      )}

      {showNoResults && (
        <MessageParagraph>
          {localSearchTerm.length < 3 ?
            "Digite pelo menos 3 letras para buscar na API." :
            "Nenhum Pokémon encontrado."
          }
        </MessageParagraph>
      )}

      <PokemonGrid>
        {pokemonsToDisplay.map((pokemon, index) => (
          <CardPokemon
            key={`${pokemon.id}-${pokemon.name}-${index}`}
            pokemon={pokemon}
            onCardClick={handleCardClick}
          />
        ))}
      </PokemonGrid>

      {hasMore && localSearchTerm.length === 0 && !searchedPokemon && (
        <LoadMoreButton onClick={handleLoadMore} disabled={isLoading}>
          <img src={LoadingPokemon} alt='Buttom Loading' />
        </LoadMoreButton>
      )}
    </Container>
  );
};

export default HomePage;