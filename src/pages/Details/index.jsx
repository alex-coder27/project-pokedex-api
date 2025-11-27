import { React, useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
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
    const navigate = useNavigate();
    const [pokemonData, setPokemonData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [abilityDescriptions, setAbilityDescriptions] = useState({});
    const [hoveredAbilityName, setHoveredAbilityName] = useState(null);

    const abilityControllerRef = useRef(null);

    useEffect(() => {
        const controller = new AbortController();

        const loadPokemon = async () => {
            setLoading(true);
            setError(null);
            setPokemonData(null);

            try {
                const data = await fetchPokemonDetails(name, { signal: controller.signal });
                setPokemonData(data);

            } catch (err) {
                if (err.name === 'AbortError') return;

                if (axios.isAxiosError(err) && err.response && err.response.status === 404) {
                    setError(`Pokémon "${name}" não encontrado. Verifique o nome.`);
                } else {
                    setError('Ocorreu um erro ao carregar os detalhes do Pokémon. Tente novamente.');
                }
            } finally {
                setLoading(false);
            }
        };

        loadPokemon();

        return () => controller.abort();
    }, [name]);


    const handleAbilityHover = useCallback(async (name, url) => {
        if (abilityControllerRef.current) {
            abilityControllerRef.current.abort();
        }

        setHoveredAbilityName(name);

        if (!abilityDescriptions[name]) {
            setAbilityDescriptions(prev => ({
                ...prev,
                [name]: 'Carregando descrição...',
            }));

            const controller = new AbortController();
            abilityControllerRef.current = controller;

            try {
                const data = await getPokemonDetailsByUrl(url, { signal: controller.signal });
                const englishEffectEntry = data.effect_entries.find(entry => entry.language.name === 'en');
                const effect = englishEffectEntry ? englishEffectEntry.effect : 'No description available.';

                setAbilityDescriptions(prev => ({
                    ...prev,
                    [name]: effect,
                }));
            } catch (error) {
                if (error.name !== 'AbortError') {
                    console.error('Error fetching ability description:', error);
                    setAbilityDescriptions(prev => ({
                        ...prev,
                        [name]: 'Erro ao carregar descrição.',
                    }));
                }
            } finally {
                if (abilityControllerRef.current === controller) {
                    abilityControllerRef.current = null;
                }
            }
        }
    }, [abilityDescriptions]);

    const handleAbilityLeave = () => {
        setHoveredAbilityName(null);
    };

    const centeredWrapperStyle = {
        textAlign: 'center',
        padding: '20px',
        maxWidth: '1200px',
        margin: '0 auto',
    };

    if (loading && !pokemonData) {
        return (
            <div style={centeredWrapperStyle}>
                <Header showBackButton={true} />
                <p style={{ marginTop: '50px' }}>Carregando detalhes do Pokémon...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={centeredWrapperStyle}>
                <Header showBackButton={true} />
                <p style={{ color: 'red', marginTop: '50px', fontSize: '1.2rem', fontWeight: 'bold' }}>
                    {error}
                </p>
                <p style={{ marginTop: '20px' }}>
                    <button
                        onClick={() => navigate('/')}
                        style={{ padding: '10px 20px', cursor: 'pointer' }}
                    >
                        Voltar à Home
                    </button>
                </p>
            </div>
        );
    }

    if (!pokemonData) {
        return (
            <div style={centeredWrapperStyle}>
                <Header showBackButton={true} />
                <p style={{ marginTop: '50px' }}>Nenhum dado de Pokémon para exibir.</p>
            </div>
        );
    }


    const mainType = pokemonData.types && pokemonData.types.length > 0
        ? pokemonData.types[0].type.name
        : 'normal';
    const mainColor = TYPE_COLORS[mainType] || '#CC0000';

    return (
        <>
            <Header showBackButton={true} />
            <DetailsWrapper>
                <Sidebar>
                    <h2>
                        {pokemonData.name.charAt(0).toUpperCase() + pokemonData.name.slice(1)}
                        {` #${pokemonData.id}`}
                    </h2>
                    <PokemonImage
                        src={pokemonData.sprites.other?.dream_world?.front_default || pokemonData.sprites.front_default}
                        alt={pokemonData.name}
                    />

                    <DetailTitle $typeColor={mainColor}>Types</DetailTitle>
                    <TypeContainer>
                        {pokemonData.types.map((typeObj) => {
                            const typeName = typeObj.type.name;
                            const color = TYPE_COLORS[typeName];
                            return (
                                <TypeItem
                                    key={typeObj.type.name}
                                    $typeColor={color}
                                >
                                    {typeName.toUpperCase()}
                                </TypeItem>
                            );
                        })}
                    </TypeContainer>


                    <DetailTitle $typeColor={mainColor}>Base Stats</DetailTitle>
                    {pokemonData.stats.map((stat) => (
                        <StatContainer key={stat.stat.name}>
                            <span>{stat.stat.name.toUpperCase().replace('-', ' ')}:</span>
                            <StatBar $statValue={stat.base_stat} $typeColor={mainColor}>
                                <StatValue>{stat.base_stat}</StatValue>
                            </StatBar>
                        </StatContainer>
                    ))}
                </Sidebar>

                <MainContent>

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
                                            <AbilityTooltip
                                                description={description}
                                                data-testid="ability-tooltip"
                                            />
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