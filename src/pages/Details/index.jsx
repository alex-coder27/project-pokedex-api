import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const DetailsPage = () => {
  const { name } = useParams();
  const [pokemon, setPokemon] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const POKEMON_DETAIL_URL = `https://pokeapi.co/api/v2/pokemon/${name}`;
  
  useEffect(() => {
    const fetchDetails = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(POKEMON_DETAIL_URL);
        const detailData = response.data;
        const abilitiesWithDescriptionPromises = detailData.abilities.map(async (abilityItem) => {
          const abilityResponse = await axios.get(abilityItem.ability.url);
          const flavorTextEntry = abilityResponse.data.flavor_text_entries.find(
            (entry) => entry.language.name === 'en'
          );

          return {
            name: abilityItem.ability.name,
            description: flavorTextEntry ? flavorTextEntry.flavor_text : 'No description found.',
          };
        });

        const detailedAbilities = await Promise.all(abilitiesWithDescriptionPromises);

        setPokemon({
            ...detailData,
            abilities: detailedAbilities,
        });

      } catch (error) {
        console.error(`Error fetching details for ${name}:`, error);
        setPokemon(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (name) {
        fetchDetails();
    }
  }, [name]);

  if (isLoading) {
    return <div>Loading details...</div>;
  }

  if (!pokemon) {
    return <div>Pokemon not found or an error occurred.</div>;
  }

  return (
      <>
        <h2>{pokemon.name.toUpperCase()}</h2>
        <img 
            src={pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default} 
            alt={pokemon.name} 
        />
        
        <p>Type: {pokemon.types.map(t => t.type.name).join(', ')}</p>

        <h3>Moves:</h3>
        <ul>
          {pokemon.moves.slice(0, 5).map((move, index) => (
            <li key={index}>{move.move.name}</li>
          ))}
        </ul>

        <h3>Abilities:</h3>
        <ul>
          {pokemon.abilities.map((ability, index) => (
            <li key={index}>
              <strong>{ability.name}</strong>: {ability.description}
            </li>
          ))}
        </ul>
      </>
    // </Container>
  );
};

export default DetailsPage;