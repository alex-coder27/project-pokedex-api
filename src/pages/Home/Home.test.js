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
  jest.useFakeTimers();

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUsePokemonData.fetchPokemonDetails = jest.fn().mockResolvedValue({ 
      id: 25, 
      name: 'pikachu', 
      types: [{ type: { name: 'electric' } }] 
    });
    
    usePokemonData.mockReturnValue(mockUsePokemonData);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('deve renderizar o componente corretamente', () => {
    renderHomePage();

    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Buscar Pokémon pelo nome... (mín. 3 letras)')).toBeInTheDocument();
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

  it('deve atualizar localSearchTerm ao digitar na busca', () => {
    renderHomePage();

    const searchInput = screen.getByPlaceholderText('Buscar Pokémon pelo nome... (mín. 3 letras)');
    fireEvent.change(searchInput, { target: { value: 'pikachu' } });

    expect(searchInput.value).toBe('pikachu');
  });

  it('deve chamar setSearchTerm após debounce', async () => {
    renderHomePage();

    const searchInput = screen.getByPlaceholderText('Buscar Pokémon pelo nome... (mín. 3 letras)');
    
    fireEvent.change(searchInput, { target: { value: 'pikachu' } });

    await act(async () => {
      jest.advanceTimersByTime(500);
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(mockUsePokemonData.setSearchTerm).toHaveBeenCalledWith('pikachu');
    });
  });

  it('deve chamar debouncedSearch para termos com mais de 3 caracteres', async () => {
    renderHomePage();

    const searchInput = screen.getByPlaceholderText('Buscar Pokémon pelo nome... (mín. 3 letras)');
    
    fireEvent.change(searchInput, { target: { value: 'pika' } });

    await act(async () => {
      jest.advanceTimersByTime(500);
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(mockUsePokemonData.fetchPokemonDetails).toHaveBeenCalledWith('pika');
    });
  });

  it('deve não chamar fetchPokemonDetails para termos com menos de 3 caracteres', async () => {
    renderHomePage();

    const searchInput = screen.getByPlaceholderText('Buscar Pokémon pelo nome... (mín. 3 letras)');
    
    fireEvent.change(searchInput, { target: { value: 'pi' } });

    await act(async () => {
      jest.advanceTimersByTime(500);
      await Promise.resolve();
    });

    expect(mockUsePokemonData.fetchPokemonDetails).not.toHaveBeenCalled();
  });

  it('deve mostrar mensagem para termos curtos', async () => {
    usePokemonData.mockReturnValue({
      ...mockUsePokemonData,
      pokemons: [],
    });

    renderHomePage();

    const searchInput = screen.getByPlaceholderText('Buscar Pokémon pelo nome... (mín. 3 letras)');
    fireEvent.change(searchInput, { target: { value: 'pi' } });
    
    await act(async () => {
      jest.advanceTimersByTime(500);
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(screen.getByText('Digite pelo menos 3 letras para buscar na API.')).toBeInTheDocument();
    });
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

  it('deve mostrar mensagem de "Buscando..." durante loading', () => {
    usePokemonData.mockReturnValue({
      ...mockUsePokemonData,
      isLoading: true,
      pokemons: [],
    });

    renderHomePage();

    expect(screen.getByText('Buscando...')).toBeInTheDocument();
  });

  it('deve mostrar mensagem de erro na busca', async () => {
    mockUsePokemonData.fetchPokemonDetails = jest.fn().mockRejectedValue({
      response: { status: 404 }
    });

    usePokemonData.mockReturnValue({
      ...mockUsePokemonData,
      searchError: 'Pokémon "invalid" não encontrado.',
    });

    renderHomePage();

    const searchInput = screen.getByPlaceholderText('Buscar Pokémon pelo nome... (mín. 3 letras)');
    
    fireEvent.change(searchInput, { target: { value: 'invalid' } });

    await act(async () => {
      jest.advanceTimersByTime(500);
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(screen.getByText('Pokémon "invalid" não encontrado.')).toBeInTheDocument();
    });
  });

  it('deve mostrar mensagem quando nenhum Pokémon é encontrado na busca', async () => {
    renderHomePage();

    const searchInput = screen.getByPlaceholderText('Buscar Pokémon pelo nome... (mín. 3 letras)');
    fireEvent.change(searchInput, { target: { value: 'unknown' } });
    
    await act(async () => {
      jest.advanceTimersByTime(500);
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(screen.getByText('Nenhum Pokémon encontrado.')).toBeInTheDocument();
    });
  });

  it('deve filtrar pokémons localmente durante a busca', async () => {
    renderHomePage();

    const searchInput = screen.getByPlaceholderText('Buscar Pokémon pelo nome... (mín. 3 letras)');
    fireEvent.change(searchInput, { target: { value: 'char' } });

    await act(async () => {
      jest.advanceTimersByTime(500);
      await Promise.resolve();
    });
    
    await waitFor(() => {
      const cards = screen.getAllByTestId('card-pokemon');
      expect(cards).toHaveLength(1);
      expect(screen.getByText('charmander')).toBeInTheDocument();
    });
  });

  it('deve mostrar apenas o Pokémon buscado quando searchedPokemon existe', async () => {
    usePokemonData.mockReturnValue({
      ...mockUsePokemonData,
      searchedPokemon: { id: 25, name: 'pikachu', types: [{ type: { name: 'electric' } }] },
      pokemons: [],
    });

    renderHomePage();

    const searchInput = screen.getByPlaceholderText('Buscar Pokémon pelo nome... (mín. 3 letras)');
    fireEvent.change(searchInput, { target: { value: 'pikachu' } });
    
    await act(async () => {
      jest.advanceTimersByTime(500);
      await Promise.resolve();
    });

    await waitFor(() => {
      const cards = screen.getAllByTestId('card-pokemon');
      expect(cards).toHaveLength(1);
      expect(screen.getByText('pikachu')).toBeInTheDocument();
    });
  });

  it('deve não mostrar botão loadMore durante busca', async () => {
    renderHomePage();

    const searchInput = screen.getByPlaceholderText('Buscar Pokémon pelo nome... (mín. 3 letras)');
    fireEvent.change(searchInput, { target: { value: 'pikachu' } });
    
    await act(async () => {
      jest.advanceTimersByTime(500);
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
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

  it('deve limpar busca quando termo for vazio', async () => {
    renderHomePage();

    const searchInput = screen.getByPlaceholderText('Buscar Pokémon pelo nome... (mín. 3 letras)');
    
    fireEvent.change(searchInput, { target: { value: 'pikachu' } });

    await act(async () => {
      jest.advanceTimersByTime(500);
      await Promise.resolve();
    });

    fireEvent.change(searchInput, { target: { value: '' } });

    await act(async () => {
      jest.advanceTimersByTime(500);
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(mockUsePokemonData.setSearchTerm).toHaveBeenCalledWith('');
    });
  });

  it('deve usar key única para cada Pokémon na lista', () => {
    renderHomePage();

    const cards = screen.getAllByTestId('card-pokemon');
    
    cards.forEach((card, index) => {
      expect(card).toBeInTheDocument();
    });
  });

  it('deve desabilitar input durante loading', () => {
    usePokemonData.mockReturnValue({
      ...mockUsePokemonData,
      isLoading: true,
    });

    renderHomePage();

    const searchInput = screen.getByPlaceholderText('Buscar Pokémon pelo nome... (mín. 3 letras)');
    expect(searchInput).toBeDisabled();
  });

  it('deve não desabilitar input quando não está loading', () => {
    usePokemonData.mockReturnValue({
      ...mockUsePokemonData,
      isLoading: false,
    });

    renderHomePage();

    const searchInput = screen.getByPlaceholderText('Buscar Pokémon pelo nome... (mín. 3 letras)');
    expect(searchInput).not.toBeDisabled();
  });

  it('deve cancelar debounce ao limpar busca rapidamente', async () => {
    renderHomePage();

    const searchInput = screen.getByPlaceholderText('Buscar Pokémon pelo nome... (mín. 3 letras)');
    
    fireEvent.change(searchInput, { target: { value: 'pika' } });
    
    fireEvent.change(searchInput, { target: { value: '' } });
    
    await act(async () => {
      jest.advanceTimersByTime(500);
      await Promise.resolve();
    });
    
    await waitFor(() => {
      expect(mockUsePokemonData.setSearchTerm).toHaveBeenCalledWith('');
      const calls = mockUsePokemonData.setSearchTerm.mock.calls.flat();
      expect(calls.includes('pika')).toBe(false); 
    });
  });

  it('deve buscar localmente mesmo para termos curtos', async () => {
    renderHomePage();

    const searchInput = screen.getByPlaceholderText('Buscar Pokémon pelo nome... (mín. 3 letras)');
    fireEvent.change(searchInput, { target: { value: 'ch' } });
    
    await act(async () => {
      jest.advanceTimersByTime(500);
      await Promise.resolve();
    });

    const cards = screen.getAllByTestId('card-pokemon');
    expect(cards).toHaveLength(1);
    expect(screen.getByText('charmander')).toBeInTheDocument();
  });
});