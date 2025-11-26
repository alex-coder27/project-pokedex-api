import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../../components/Header';
import AbilityTooltip from '../../components/AbilityTooltip';
import { TYPE_COLORS } from '../../utils/typeColors';
import { fetchPokemonDetails, getPokemonDetailsByUrl } from '../../api/pokedexApi';

import {
  DetailsWrapper,
  MainContent,
  Sidebar,
  PokemonImage,
  TypeContainer,
  StatContainer,
  StatBar,
  StatValue,
  DetailTitle,
  SectionContainer,
  ListWrapper,
  AbilityList,
  AbilityItem,
  MovesList,
  MoveItem,
  TypeItem
} from './style';

const DetailsPage = () => {
  const { name } = useParams();
  const [pokemonData, setPokemonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [abilityDescriptions, setAbilityDescriptions] = useState({});
  const [hoveredAbilityName, setHoveredAbilityName] = useState(null);

  const handleAbilityHover = async (abilityName, abilityUrl) => {
    setHoveredAbilityName(abilityName);

    if (abilityDescriptions[abilityName] && abilityDescriptions[abilityName] !== "Carregando descrição...") return;

    setAbilityDescriptions(prev => ({
      ...prev,
      [abilityName]: 'Carregando descrição...',
    }));

    try {
      const data = await getPokemonDetailsByUrl(abilityUrl);
      const englishEntry = data.effect_entries.find(entry => entry.language.name === 'en');
      const description = englishEntry
        ? englishEntry.effect
        : 'Descrição não encontrada.';

      setAbilityDescriptions(prev => ({
        ...prev,
        [abilityName]: description,
      }));

    } catch (error) {
      console.error("Failed to fetch ability description:", error);
      setAbilityDescriptions(prev => ({
        ...prev,
        [abilityName]: 'Erro ao carregar descrição.',
      }));
    }
  };

  const handleAbilityLeave = () => {
    setHoveredAbilityName(null);
  };

  useEffect(() => {
    if (!name) return;

    const fetchDetails = async () => {
      try {
        const data = await fetchPokemonDetails(name);
        setPokemonData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [name]);
  if (loading) return <div>Carregando detalhes do Pokémon...</div>;
  if (error) return <div>Erro ao carregar: {error}</div>;
  if (!pokemonData) return <div>Pokémon não encontrado.</div>;

  const mainType = pokemonData.types[0].type.name;
  const mainColor = TYPE_COLORS[mainType] || '#CC0000';
  return (
    <>
      <Header showBackButton={true} />
      <DetailsWrapper>
        <Sidebar>
          <PokemonImage
            src={pokemonData.sprites.other.dream_world.front_default}
            alt={pokemonData.name}
          />

          <DetailTitle $typeColor={mainColor}>Stats</DetailTitle>
          {pokemonData.stats.map((stat) => (
            <StatContainer key={stat.stat.name}>
              <span>{stat.stat.name.toUpperCase()}:</span>
              <StatBar value={stat.base_stat}>
                <StatValue>{stat.base_stat}</StatValue>
              </StatBar>
            </StatContainer>
          ))}
        </Sidebar>
        <MainContent>
          <DetailTitle $typeColor={mainColor}>Types</DetailTitle>
          <TypeContainer>
            {pokemonData.types.map((typeObj) => (
              <TypeItem
                key={typeObj.type.name}
                $typeColor={TYPE_COLORS[typeObj.type.name] || mainColor}
              >
                {typeObj.type.name.toUpperCase()}
              </TypeItem>
            ))}
          </TypeContainer>
          <SectionContainer>
            <DetailTitle $typeColor={mainColor}>Abilities</DetailTitle>
            <AbilityList>
              {pokemonData.abilities.map(abilityObj => {
                const abilityName = abilityObj.ability.name;
                const description = abilityDescriptions[abilityName] || "Passe o mouse para carregar...";
                return (
                  <AbilityItem
                    key={abilityName}
                    $isHidden={abilityObj.is_hidden}
                    onMouseEnter={() => handleAbilityHover(abilityName, abilityObj.ability.url)}
                    onMouseLeave={handleAbilityLeave}
                  >
                    {abilityName.replace('-', ' ')}
                    {hoveredAbilityName === abilityName && (
                      <AbilityTooltip description={description} />
                    )}
                  </AbilityItem>
                );
              })}
            </AbilityList>
          </SectionContainer>
          <SectionContainer>
            <DetailTitle $typeColor={mainColor}>Moves</DetailTitle>
            <ListWrapper>
              <MovesList>
                {pokemonData.moves.map(moveObj => (
                  <MoveItem key={moveObj.move.name}>
                    {moveObj.move.name.replace('-', ' ')}
                  </MoveItem>
                ))}
              </MovesList>
            </ListWrapper>
          </SectionContainer>

        </MainContent>
      </DetailsWrapper>
    </>
  );
};

export default DetailsPage;