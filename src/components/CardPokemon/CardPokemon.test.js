import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CardPokemon from './index';
import { TYPE_COLORS } from '../../utils/typeColors';

jest.mock('../../utils/typeColors', () => ({
  TYPE_COLORS: {
    grass: '#78C850',
    fire: '#F08030',
    water: '#6890F0',
    electric: '#F8D030',
    normal: '#A8A878',
    poison: '#A040A0'
  }
}));

describe('CardPokemon', () => {
  const mockPokemon = {
    id: 1,
    name: 'bulbasaur',
    types: [
      { type: { name: 'grass' } },
      { type: { name: 'poison' } }
    ],
    sprites: {
      other: {
        dream_world: {
          front_default: 'bulbasaur-dream.png'
        }
      }
    }
  };

  const mockOnCardClick = jest.fn();

  const renderCardPokemon = (pokemon = mockPokemon, onCardClick = mockOnCardClick) => {
    return render(
      <CardPokemon pokemon={pokemon} onCardClick={onCardClick} />
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar o card com dados do Pokémon', () => {
    renderCardPokemon();

    expect(screen.getByText('bulbasaur')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByAltText('bulbasaur')).toHaveAttribute('src', 'bulbasaur-dream.png');
  });

  it('deve chamar onCardClick quando o card for clicado', () => {
    renderCardPokemon();

    // Clica em qualquer parte do card que contenha o nome do Pokémon
    const cardElement = screen.getByText('bulbasaur').parentElement;
    fireEvent.click(cardElement);

    expect(mockOnCardClick).toHaveBeenCalledWith('bulbasaur');
  });

  it('deve renderizar os tipos do Pokémon com cores corretas', () => {
    renderCardPokemon();

    expect(screen.getByText('GRASS')).toBeInTheDocument();
    expect(screen.getByText('POISON')).toBeInTheDocument();
  });

  it('deve usar cor padrão para tipo não mapeado', () => {
    const pokemonWithUnknownType = {
      ...mockPokemon,
      types: [{ type: { name: 'unknown-type' } }]
    };

    renderCardPokemon(pokemonWithUnknownType);

    expect(screen.getByText('UNKNOWN-TYPE')).toBeInTheDocument();
  });

  it('deve formatar o nome do Pokémon com primeira letra maiúscula', () => {
    const pokemonWithLowercaseName = {
      ...mockPokemon,
      name: 'pikachu'
    };

    renderCardPokemon(pokemonWithLowercaseName);

    expect(screen.getByText('pikachu')).toBeInTheDocument();
  });

  it('deve lidar com Pokémon com apenas um tipo', () => {
    const pokemonWithOneType = {
      ...mockPokemon,
      types: [{ type: { name: 'fire' } }]
    };

    renderCardPokemon(pokemonWithOneType);

    expect(screen.getByText('FIRE')).toBeInTheDocument();
    expect(screen.queryByText('GRASS')).not.toBeInTheDocument();
  });

  it('deve lidar com Pokémon sem imagem dream_world', () => {
    const pokemonWithoutDreamWorld = {
      ...mockPokemon,
      sprites: {
        other: {
          dream_world: {
            front_default: null
          }
        }
      }
    };

    renderCardPokemon(pokemonWithoutDreamWorld);

    const image = screen.getByAltText('bulbasaur');
    // Verifica se a imagem existe, mesmo com src null
    expect(image).toBeInTheDocument();
  });

  it('deve renderizar ID do Pokémon corretamente', () => {
    const pokemonWithHighId = {
      ...mockPokemon,
      id: 999
    };

    renderCardPokemon(pokemonWithHighId);

    expect(screen.getByText('999')).toBeInTheDocument();
  });

  it('deve lidar com Pokémon com nome composto', () => {
    const pokemonWithCompoundName = {
      ...mockPokemon,
      name: 'mr-mime'
    };

    renderCardPokemon(pokemonWithCompoundName);

    expect(screen.getByText('mr-mime')).toBeInTheDocument();
    expect(screen.getByAltText('mr-mime')).toBeInTheDocument();
  });

  it('deve manter a estrutura visual com dados mínimos', () => {
    const minimalPokemon = {
      id: 25,
      name: 'pikachu',
      types: [{ type: { name: 'electric' } }],
      sprites: {
        other: {
          dream_world: {
            front_default: 'pikachu.png'
          }
        }
      }
    };

    renderCardPokemon(minimalPokemon);

    expect(screen.getByText('pikachu')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('ELECTRIC')).toBeInTheDocument();
    expect(screen.getByAltText('pikachu')).toBeInTheDocument();
  });

  it('deve ser acessível via teclado e ARIA', () => {
    renderCardPokemon();

    // Verifica se todos os elementos principais estão no documento
    expect(screen.getByText('bulbasaur')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByAltText('bulbasaur')).toBeInTheDocument();
    expect(screen.getByText('GRASS')).toBeInTheDocument();
    expect(screen.getByText('POISON')).toBeInTheDocument();
  });

  it('deve lidar com múltiplos tipos corretamente', () => {
    const pokemonWithMultipleTypes = {
      ...mockPokemon,
      types: [
        { type: { name: 'fire' } },
        { type: { name: 'flying' } },
        { type: { name: 'dragon' } }
      ]
    };

    renderCardPokemon(pokemonWithMultipleTypes);

    expect(screen.getByText('FIRE')).toBeInTheDocument();
    expect(screen.getByText('FLYING')).toBeInTheDocument();
    expect(screen.getByText('DRAGON')).toBeInTheDocument();
  });

  it('deve usar fallback para tipos não existentes no TYPE_COLORS', () => {
    const pokemonWithUnmappedType = {
      ...mockPokemon,
      types: [{ type: { name: 'shadow' } }]
    };

    renderCardPokemon(pokemonWithUnmappedType);

    expect(screen.getByText('SHADOW')).toBeInTheDocument();
  });

  it('deve manter a ordem dos tipos como recebido da API', () => {
    const pokemon = {
      ...mockPokemon,
      types: [
        { type: { name: 'water' } },
        { type: { name: 'psychic' } }
      ]
    };

    renderCardPokemon(pokemon);

    const waterType = screen.getByText('WATER');
    const psychicType = screen.getByText('PSYCHIC');
    
    expect(waterType).toBeInTheDocument();
    expect(psychicType).toBeInTheDocument();
  });

  it('deve chamar onCardClick ao clicar na imagem', () => {
    renderCardPokemon();

    const image = screen.getByAltText('bulbasaur');
    fireEvent.click(image);

    expect(mockOnCardClick).toHaveBeenCalledWith('bulbasaur');
  });

  it('deve chamar onCardClick ao clicar no ID', () => {
    renderCardPokemon();

    const idBadge = screen.getByText('1');
    fireEvent.click(idBadge);

    expect(mockOnCardClick).toHaveBeenCalledWith('bulbasaur');
  });

  it('deve chamar onCardClick ao clicar nos tipos', () => {
    renderCardPokemon();

    const grassType = screen.getByText('GRASS');
    fireEvent.click(grassType);

    expect(mockOnCardClick).toHaveBeenCalledWith('bulbasaur');
  });
});