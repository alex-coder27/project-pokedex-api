import { CardWrapper, ImageContainer, NameContainer, Name, TypesContainer, TypeBadge, typeColors, IdBadge } from './style';

const CardPokemon = ({ pokemon, onCardClick }) => {
    const imageUrl = pokemon.sprites.other.dream_world.front_default;
    const typeNames = pokemon.types.map(typeObj => typeObj.type.name);
    const glowColorsArray = typeNames.map(name => typeColors[name] || '#777777'); 
    const glowColorsString = glowColorsArray.join(',');
    const renderTypes = () => (
        pokemon.types.map((typeObj) => {
            const typeName = typeObj.type.name;
            const color = typeColors[typeName] || '#777777';
            
            return (
                <TypeBadge key={typeName} color={color}>
                    {typeName.toUpperCase()}
                </TypeBadge>
            );
        })
    );

    return (
        <CardWrapper onClick={() => onCardClick(pokemon.name)} $glowColors={glowColorsString}>
            <ImageContainer>
                <IdBadge>{pokemon.id}</IdBadge>
                <img src={imageUrl} alt={pokemon.name} />
            </ImageContainer>
            
            <NameContainer>
                <Name>{pokemon.name}</Name>
            </NameContainer>
            
            <TypesContainer>
                {renderTypes()}
            </TypesContainer>
        </CardWrapper>
    );
};

export default CardPokemon;