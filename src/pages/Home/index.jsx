import { useNavigate } from 'react-router-dom';
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

  const selectedTypeColor = selectedType ? TYPE_COLORS[selectedType] : '';

  const handleCardClick = (pokemonName) => {
    navigate(`/pokemon/${pokemonName}`);
  };

  const handleSearchChange = (event) => {
    const term = event.target.value;
    setSearchTerm(term);
    setSearchedPokemon(null);
    setSearchError(null);

  };

  const handleSearchSubmit = async (event) => {
    if (event.key !== 'Enter') return;

    const term = searchTerm.toLowerCase().trim();

    if (term.length === 0) {
      setSearchedPokemon(null);
      setSearchError(null);
      return;
    }
    const localMatch = pokemons.find(p => p.name.toLowerCase() === term);
    if (localMatch) {
      setSearchedPokemon(localMatch);
      setSearchError(null);
      return;
    }
    setIsLoading(true);
    try {
      const data = await fetchPokemonDetails(term);
      setSearchedPokemon(data);
      setSearchError(null);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setSearchError(`Pokémon "${term}" não encontrado.`);
      } else {
        setSearchError(null);
      }
      setSearchedPokemon(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  const typesForSelect = ['all', ...ALL_TYPES]; 

  let pokemonsToDisplay = pokemons;

  if (searchedPokemon) {
    pokemonsToDisplay = [searchedPokemon];
  } else if (searchTerm.length > 0) {
    pokemonsToDisplay = pokemons.filter(pokemon =>
      pokemon.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }


  return (
    <Container>
      <Header />
      <FilterBarContainer>
        <SearchContainer>
          <SearchInput
            type="text"
            placeholder="Buscar Pokémon pelo nome..."
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyDown={handleSearchSubmit}
            disabled={isLoading && !searchedPokemon}
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
      {isLoading && pokemonsToDisplay.length === 0 && (
        <MessageParagraph>Carregando...</MessageParagraph>
      )}

      {searchError && (
        <MessageParagraph>
          {searchError}
        </MessageParagraph>
      )}

      {searchTerm.length > 0 && pokemonsToDisplay.length === 0 && !isLoading && !searchError && (
        <MessageParagraph>
          Nenhum Pokémon encontrado que corresponda aos critérios de busca.
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
      {hasMore && searchTerm.length === 0 && (
        <LoadMoreButton onClick={handleLoadMore} disabled={isLoading}>
          <img src={LoadingPokemon} alt='Buttom Loading' />
        </LoadMoreButton>
      )}
    </Container>
  );
};

export default HomePage;