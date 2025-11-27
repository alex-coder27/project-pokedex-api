import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Header from './index';
import * as ThemeContext from '../../context/ThemeContext';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../../assets/seta-branca.png', () => 'mocked-seta-branca.png');
jest.mock('../../assets/seta-preta.png', () => 'mocked-seta-preta.png');
jest.mock('../../assets/chandelure-normal.png', () => 'mocked-chandelure-normal.png');
jest.mock('../../assets/chandelure-apagado.png', () => 'mocked-chandelure-apagado.png');

describe('Header', () => {
  const mockToggleTheme = jest.fn();
  let useThemeSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
    mockToggleTheme.mockClear();

    useThemeSpy = jest.spyOn(ThemeContext, 'useTheme');
    useThemeSpy.mockReturnValue({
      isDarkMode: false,
      toggleTheme: mockToggleTheme,
    });
  });

  afterEach(() => {
    cleanup();
    useThemeSpy.mockRestore();
  });

  const renderHeader = (showBackButton = false, isDarkMode = false) => {
    useThemeSpy.mockReturnValue({
      isDarkMode,
      toggleTheme: mockToggleTheme,
    });

    return render(
      <BrowserRouter>
        <Header showBackButton={showBackButton} />
      </BrowserRouter>
    );
  };

  it('deve renderizar o header com botão de tema', () => {
    renderHeader();
    const themeButton = screen.getByRole('button', { name: /tema claro|tema escuro/i });
    expect(themeButton).toBeInTheDocument();
  });

  it('deve mostrar botão voltar quando showBackButton for true', () => {
    renderHeader(true);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
    expect(screen.getByAltText('Voltar página')).toBeInTheDocument();
  });

  it('não deve mostrar botão voltar quando showBackButton for false', () => {
    renderHeader(false);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(1);
    expect(screen.queryByAltText('Voltar página')).not.toBeInTheDocument();
  });

  it('deve navegar para home quando botão voltar for clicado', () => {
    renderHeader(true);
    const backButton = screen.getByAltText('Voltar página');
    fireEvent.click(backButton);
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('deve chamar toggleTheme quando botão de tema for clicado', () => {
    renderHeader();
    const themeButton = screen.getByRole('button', { name: /tema claro|tema escuro/i });
    fireEvent.click(themeButton);
    expect(mockToggleTheme).toHaveBeenCalledTimes(1);
  });
  
  it('deve mostrar textos alternativos corretos', () => {
    renderHeader(true, false);
    expect(screen.getByAltText('Voltar página')).toBeInTheDocument();
    expect(screen.getByAltText('Tema Claro')).toBeInTheDocument();
  });

  it('deve alterar texto alternativo do tema quando modo muda', () => {
    renderHeader(false, true);
    expect(screen.getByAltText('Tema Escuro')).toBeInTheDocument();

    cleanup();

    renderHeader(false, false);
    expect(screen.getByAltText('Tema Claro')).toBeInTheDocument();
  });
});