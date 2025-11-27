import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import HomePage from './index';
import { usePokemonData } from '../../hooks/usePokemonData';
import { TYPE_COLORS } from '../../utils/typeColors';

jest.mock('../../hooks/usePokemonData');
jest.mock('../../components/Header/index', () => () => <div data-testid="header">Header</div>);
jest.mock('../../components/CardPokemon/index', () => ({ pokemon, onCardClick }) => (
  <div data-testid="card-pokemon" onClick={() => onCardClick(pokemon.name)}>
    {pokemon.name}
  </div>
));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const mockPokemons = [
  { id: 1, name: 'bulbasaur', types: [{ type: { name: 'grass' } }] },
  { id: 2, name: 'charmander', types: [{ type: { name: 'fire' } }] },
  { id: 3, name: 'squirtle', types: [{ type: { name: 'water' } }] },
];

const mockUsePokemonData = {
  pokemons: mockPokemons,
  isLoading: false,
  hasMore: true,
  searchTerm: '',
  searchedPokemon: null,
  searchError: null,
  selectedType: null,
  setSearchTerm: jest.fn(),
  setSearchedPokemon: jest.fn(),
  setSearchError: jest.fn(),
  setIsLoading: jest.fn(),
  fetchPokemonDetails: jest.fn(),
  handleLoadMore: jest.fn(),
  handleTypeFilter: jest.fn(),
};

const renderHomePage = () => {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('HomePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    usePokemonData.mockReturnValue(mockUsePokemonData);
  });

  it('deve renderizar o componente corretamente', () => {
    renderHomePage();

    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Buscar Pokémon pelo nome...')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('deve renderizar a lista de pokémons', () => {
    renderHomePage();

    const cards = screen.getAllByTestId('card-pokemon');
    expect(cards).toHaveLength(3);
    expect(screen.getByText('bulbasaur')).toBeInTheDocument();
    expect(screen.getByText('charmander')).toBeInTheDocument();
    expect(screen.getByText('squirtle')).toBeInTheDocument();
  });

  it('deve navegar para a página de detalhes ao clicar em um card', () => {
    renderHomePage();

    const firstCard = screen.getByText('bulbasaur');
    fireEvent.click(firstCard);

    expect(mockNavigate).toHaveBeenCalledWith('/pokemon/bulbasaur');
  });

  it('deve chamar setSearchTerm ao digitar na busca', () => {
    renderHomePage();

    const searchInput = screen.getByPlaceholderText('Buscar Pokémon pelo nome...');
    fireEvent.change(searchInput, { target: { value: 'pikachu' } });

    expect(mockUsePokemonData.setSearchTerm).toHaveBeenCalledWith('pikachu');
    expect(mockUsePokemonData.setSearchedPokemon).toHaveBeenCalledWith(null);
    expect(mockUsePokemonData.setSearchError).toHaveBeenCalledWith(null);
  });

  it('deve chamar handleTypeFilter ao selecionar um tipo', () => {
    renderHomePage();

    const typeSelect = screen.getByRole('combobox');
    fireEvent.change(typeSelect, { target: { value: 'fire' } });

    expect(mockUsePokemonData.handleTypeFilter).toHaveBeenCalled();
  });

  it('deve chamar handleLoadMore ao clicar no botão', () => {
    renderHomePage();

    const loadMoreButton = screen.getByRole('button');
    fireEvent.click(loadMoreButton);

    expect(mockUsePokemonData.handleLoadMore).toHaveBeenCalled();
  });

  it('deve desabilitar o botão loadMore durante loading', () => {
    usePokemonData.mockReturnValue({
      ...mockUsePokemonData,
      isLoading: true,
    });

    renderHomePage();

    const loadMoreButton = screen.getByRole('button');
    expect(loadMoreButton).toBeDisabled();
  });

  it('deve mostrar mensagem de carregamento', () => {
    usePokemonData.mockReturnValue({
      ...mockUsePokemonData,
      isLoading: true,
      pokemons: [],
    });

    renderHomePage();

    expect(screen.getByText('Carregando...')).toBeInTheDocument();
  });

  it('deve mostrar mensagem de erro na busca', () => {
    usePokemonData.mockReturnValue({
      ...mockUsePokemonData,
      searchError: 'Pokémon "invalid" não encontrado.',
    });

    renderHomePage();

    expect(screen.getByText('Pokémon "invalid" não encontrado.')).toBeInTheDocument();
  });

  it('deve mostrar mensagem quando nenhum Pokémon é encontrado na busca', () => {
    usePokemonData.mockReturnValue({
      ...mockUsePokemonData,
      searchTerm: 'unknown',
      pokemons: [],
    });

    renderHomePage();

    expect(screen.getByText('Nenhum Pokémon encontrado que corresponda aos critérios de busca.')).toBeInTheDocument();
  });

  it('deve filtrar pokémons localmente durante a busca', () => {
    usePokemonData.mockReturnValue({
      ...mockUsePokemonData,
      searchTerm: 'char',
    });

    renderHomePage();

    const cards = screen.getAllByTestId('card-pokemon');
    expect(cards).toHaveLength(1);
    expect(screen.getByText('charmander')).toBeInTheDocument();
  });

  it('deve mostrar apenas o Pokémon buscado quando searchedPokemon existe', () => {
    usePokemonData.mockReturnValue({
      ...mockUsePokemonData,
      searchedPokemon: { id: 25, name: 'pikachu', types: [{ type: { name: 'electric' } }] },
    });

    renderHomePage();

    const cards = screen.getAllByTestId('card-pokemon');
    expect(cards).toHaveLength(1);
    expect(screen.getByText('pikachu')).toBeInTheDocument();
  });

  it('deve não mostrar botão loadMore durante busca', () => {
    usePokemonData.mockReturnValue({
      ...mockUsePokemonData,
      searchTerm: 'pikachu',
    });

    renderHomePage();

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('deve não mostrar botão loadMore quando não há mais pokémons', () => {
    usePokemonData.mockReturnValue({
      ...mockUsePokemonData,
      hasMore: false,
    });

    renderHomePage();

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('deve renderizar opções de tipo corretamente', () => {
    renderHomePage();

    const options = screen.getAllByRole('option');
    
    expect(options.length).toBeGreaterThan(1);
    expect(screen.getByText('All')).toBeInTheDocument();
    
    Object.keys(TYPE_COLORS).forEach(type => {
      const expectedText = type.charAt(0).toUpperCase() + type.slice(1);
      expect(screen.getByText(expectedText)).toBeInTheDocument();
    });
  });

  it('deve aplicar cor do tipo selecionado no select', () => {
    usePokemonData.mockReturnValue({
      ...mockUsePokemonData,
      selectedType: 'fire',
    });

    renderHomePage();

    const typeSelect = screen.getByRole('combobox');
    expect(typeSelect).toBeInTheDocument();
  });

  it('deve lidar com busca por Enter key', async () => {
    const mockFetchPokemonDetails = jest.fn().mockResolvedValue({ id: 25, name: 'pikachu' });
    
    usePokemonData.mockReturnValue({
      ...mockUsePokemonData,
      searchTerm: 'pikachu',
      fetchPokemonDetails: mockFetchPokemonDetails,
    });

    renderHomePage();

    const searchInput = screen.getByPlaceholderText('Buscar Pokémon pelo nome...');
    
    await act(async () => {
      fireEvent.keyDown(searchInput, { key: 'Enter' });
    });

    expect(mockFetchPokemonDetails).toHaveBeenCalledWith('pikachu');
  });

  it('deve não fazer busca se termo estiver vazio ao pressionar Enter', async () => {
    const mockFetchPokemonDetails = jest.fn();
    
    usePokemonData.mockReturnValue({
      ...mockUsePokemonData,
      searchTerm: '',
      fetchPokemonDetails: mockFetchPokemonDetails,
    });

    renderHomePage();

    const searchInput = screen.getByPlaceholderText('Buscar Pokémon pelo nome...');
    
    await act(async () => {
      fireEvent.keyDown(searchInput, { key: 'Enter' });
    });

    expect(mockFetchPokemonDetails).not.toHaveBeenCalled();
  });

  it('deve encontrar Pokémon localmente ao pressionar Enter', async () => {
    usePokemonData.mockReturnValue({
      ...mockUsePokemonData,
      searchTerm: 'bulbasaur',
    });

    renderHomePage();

    const searchInput = screen.getByPlaceholderText('Buscar Pokémon pelo nome...');
    
    await act(async () => {
      fireEvent.keyDown(searchInput, { key: 'Enter' });
    });

    expect(mockUsePokemonData.setSearchedPokemon).toHaveBeenCalledWith(mockPokemons[0]);
    expect(mockUsePokemonData.setSearchError).toHaveBeenCalledWith(null);
  });

  it('deve lidar com erro na busca por Enter key', async () => {
    const mockFetchPokemonDetails = jest.fn().mockRejectedValue({
      response: { status: 404 }
    });
    
    usePokemonData.mockReturnValue({
      ...mockUsePokemonData,
      searchTerm: 'invalid',
      fetchPokemonDetails: mockFetchPokemonDetails,
    });

    renderHomePage();

    const searchInput = screen.getByPlaceholderText('Buscar Pokémon pelo nome...');
    
    await act(async () => {
      fireEvent.keyDown(searchInput, { key: 'Enter' });
    });

    expect(mockUsePokemonData.setSearchError).toHaveBeenCalledWith('Pokémon "invalid" não encontrado.');
    expect(mockUsePokemonData.setSearchedPokemon).toHaveBeenCalledWith(null);
  });

  it('deve lidar com erro genérico na busca por Enter key', async () => {
    const mockFetchPokemonDetails = jest.fn().mockRejectedValue(new Error('Network error'));
    
    usePokemonData.mockReturnValue({
      ...mockUsePokemonData,
      searchTerm: 'pikachu',
      fetchPokemonDetails: mockFetchPokemonDetails,
    });

    renderHomePage();

    const searchInput = screen.getByPlaceholderText('Buscar Pokémon pelo nome...');
    
    await act(async () => {
      fireEvent.keyDown(searchInput, { key: 'Enter' });
    });

    expect(mockUsePokemonData.setSearchError).toHaveBeenCalledWith(null);
    expect(mockUsePokemonData.setSearchedPokemon).toHaveBeenCalledWith(null);
  });

  it('deve ignorar outras teclas que não seja Enter', () => {
    usePokemonData.mockReturnValue({
      ...mockUsePokemonData,
      searchTerm: 'pikachu',
    });

    renderHomePage();

    const searchInput = screen.getByPlaceholderText('Buscar Pokémon pelo nome...');
    
    fireEvent.keyDown(searchInput, { key: 'Escape' });

    expect(mockUsePokemonData.fetchPokemonDetails).not.toHaveBeenCalled();
  });

  it('deve desabilitar input durante loading sem searchedPokemon', () => {
    usePokemonData.mockReturnValue({
      ...mockUsePokemonData,
      isLoading: true,
      searchedPokemon: null,
    });

    renderHomePage();

    const searchInput = screen.getByPlaceholderText('Buscar Pokémon pelo nome...');
    expect(searchInput).toBeDisabled();
  });

  it('deve não desabilitar input durante loading com searchedPokemon', () => {
    usePokemonData.mockReturnValue({
      ...mockUsePokemonData,
      isLoading: true,
      searchedPokemon: { id: 25, name: 'pikachu' },
    });

    renderHomePage();

    const searchInput = screen.getByPlaceholderText('Buscar Pokémon pelo nome...');
    expect(searchInput).not.toBeDisabled();
  });

  it('deve limpar busca quando termo for vazio', () => {
    usePokemonData.mockReturnValue({
      ...mockUsePokemonData,
      searchTerm: 'pikachu',
      searchedPokemon: { id: 25, name: 'pikachu' },
      searchError: null,
    });

    renderHomePage();

    const searchInput = screen.getByPlaceholderText('Buscar Pokémon pelo nome...');
    fireEvent.change(searchInput, { target: { value: '' } });

    expect(mockUsePokemonData.setSearchTerm).toHaveBeenCalledWith('');
    expect(mockUsePokemonData.setSearchedPokemon).toHaveBeenCalledWith(null);
    expect(mockUsePokemonData.setSearchError).toHaveBeenCalledWith(null);
  });

  it('deve usar key única para cada Pokémon na lista', () => {
    renderHomePage();

    const cards = screen.getAllByTestId('card-pokemon');
    
    cards.forEach((card, index) => {
      expect(card).toBeInTheDocument();
    });
  });
});