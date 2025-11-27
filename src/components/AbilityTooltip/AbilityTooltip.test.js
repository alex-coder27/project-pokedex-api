import React from 'react';
import { render, screen } from '@testing-library/react';
import AbilityTooltip from './index';
import { ThemeProvider } from 'styled-components';

const mockTheme = {
  cardBackground: '#ffffff',
  text: '#333333'
};

const renderWithTheme = (component) => {
  return render(
    <ThemeProvider theme={mockTheme}>
      {component}
    </ThemeProvider>
  );
};

describe('AbilityTooltip', () => {
  it('deve renderizar o tooltip com a descrição fornecida', () => {
    const description = 'Esta é uma descrição de habilidade.';
    
    renderWithTheme(
      <AbilityTooltip description={description} data-testid="ability-tooltip" />
    );

    const tooltip = screen.getByTestId('ability-tooltip');
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveTextContent(description);
  });

  it('não deve renderizar quando description é null', () => {
    const { container } = renderWithTheme(
      <AbilityTooltip description={null} data-testid="ability-tooltip" />
    );

    expect(screen.queryByTestId('ability-tooltip')).not.toBeInTheDocument();
    expect(container.firstChild).toBeNull();
  });

  it('não deve renderizar quando description é undefined', () => {
    const { container } = renderWithTheme(
      <AbilityTooltip description={undefined} data-testid="ability-tooltip" />
    );

    expect(screen.queryByTestId('ability-tooltip')).not.toBeInTheDocument();
    expect(container.firstChild).toBeNull();
  });

  it('não deve renderizar quando description é string vazia', () => {
    const { container } = renderWithTheme(
      <AbilityTooltip description="" data-testid="ability-tooltip" />
    );

    expect(screen.queryByTestId('ability-tooltip')).not.toBeInTheDocument();
    expect(container.firstChild).toBeNull();
  });

  it('não deve renderizar quando description é "Carregando descrição..."', () => {
    const { container } = renderWithTheme(
      <AbilityTooltip description="Carregando descrição..." data-testid="ability-tooltip" />
    );

    expect(screen.queryByTestId('ability-tooltip')).not.toBeInTheDocument();
    expect(container.firstChild).toBeNull();
  });

  it('não deve renderizar quando description é "Erro ao carregar descrição."', () => {
    const { container } = renderWithTheme(
      <AbilityTooltip description="Erro ao carregar descrição." data-testid="ability-tooltip" />
    );

    expect(screen.queryByTestId('ability-tooltip')).not.toBeInTheDocument();
    expect(container.firstChild).toBeNull();
  });

  it('deve passar props adicionais para o container', () => {
    const description = 'Descrição da habilidade';
    
    renderWithTheme(
      <AbilityTooltip 
        description={description} 
        data-testid="ability-tooltip"
        className="custom-class"
        style={{ top: '100px' }}
      />
    );

    const tooltip = screen.getByTestId('ability-tooltip');
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveClass('custom-class');
    expect(tooltip).toHaveStyle('top: 100px');
  });

  it('deve renderizar com descrição longa', () => {
    const longDescription = 'Esta é uma descrição muito longa de uma habilidade de Pokémon que pode ter múltiplas linhas e bastante texto explicativo sobre como a habilidade funciona em batalha.';
    
    renderWithTheme(
      <AbilityTooltip description={longDescription} data-testid="ability-tooltip" />
    );

    const tooltip = screen.getByTestId('ability-tooltip');
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveTextContent(longDescription);
  });

  it('deve renderizar com caracteres especiais', () => {
    const descriptionWithSpecialChars = 'Habilidade com caracteres especiais: áéíóú àèìòù äëïöü ç ñ';
    
    renderWithTheme(
      <AbilityTooltip description={descriptionWithSpecialChars} data-testid="ability-tooltip" />
    );

    const tooltip = screen.getByTestId('ability-tooltip');
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveTextContent(descriptionWithSpecialChars);
  });

  it('deve aplicar estilos do tema corretamente', () => {
    const description = 'Descrição com tema';
    
    renderWithTheme(
      <AbilityTooltip description={description} data-testid="ability-tooltip" />
    );

    const tooltip = screen.getByTestId('ability-tooltip');
    expect(tooltip).toBeInTheDocument();
    
    expect(tooltip).toHaveStyle({
      backgroundColor: mockTheme.cardBackground,
      color: mockTheme.text
    });
  });
});