import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProviderComponent, useTheme } from './ThemeContext';
import { lightTheme, darkTheme } from '../styles/theme';

jest.mock('../styles/theme', () => ({
  lightTheme: {
    name: 'light',
    primary: '#1A75BB',
    background: '#f0f0f0'
  },
  darkTheme: {
    name: 'dark', 
    primary: '#4A90E2',
    background: '#1a1a1a'
  }
}));

const TestComponent = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  
  return (
    <div>
      <span data-testid="isDarkMode">{isDarkMode.toString()}</span>
      <button onClick={toggleTheme} data-testid="toggle-theme">
        Toggle Theme
      </button>
      <div data-testid="theme-info">
        {isDarkMode ? 'Dark Mode' : 'Light Mode'}
      </div>
    </div>
  );
};

describe('ThemeContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve fornecer o tema claro como padrão', () => {
    render(
      <ThemeProviderComponent>
        <TestComponent />
      </ThemeProviderComponent>
    );

    expect(screen.getByTestId('isDarkMode')).toHaveTextContent('false');
    expect(screen.getByTestId('theme-info')).toHaveTextContent('Light Mode');
  });

  it('deve alternar entre temas quando toggleTheme é chamado', () => {
    render(
      <ThemeProviderComponent>
        <TestComponent />
      </ThemeProviderComponent>
    );

    expect(screen.getByTestId('isDarkMode')).toHaveTextContent('false');
    expect(screen.getByTestId('theme-info')).toHaveTextContent('Light Mode');

    const toggleButton = screen.getByTestId('toggle-theme');
    fireEvent.click(toggleButton);

    expect(screen.getByTestId('isDarkMode')).toHaveTextContent('true');
    expect(screen.getByTestId('theme-info')).toHaveTextContent('Dark Mode');

    fireEvent.click(toggleButton);

    expect(screen.getByTestId('isDarkMode')).toHaveTextContent('false');
    expect(screen.getByTestId('theme-info')).toHaveTextContent('Light Mode');
  });

  it('deve aplicar o tema correto do styled-components', () => {
    const ThemedTestComponent = () => {
      const { isDarkMode } = useTheme();
      
      return (
        <div data-testid="themed-component" style={{ 
          color: isDarkMode ? darkTheme.primary : lightTheme.primary 
        }}>
          Themed Component
        </div>
      );
    };

    render(
      <ThemeProviderComponent>
        <ThemedTestComponent />
      </ThemeProviderComponent>
    );

    const themedComponent = screen.getByTestId('themed-component');
    
    expect(themedComponent).toHaveStyle({ color: lightTheme.primary });
  });

  it('deve atualizar o tema do styled-components quando alternado', () => {
    const TestComponentWithTheme = () => {
      const { isDarkMode, toggleTheme } = useTheme();
      
      return (
        <div>
          <div 
            data-testid="dynamic-themed-component" 
            style={{ color: isDarkMode ? darkTheme.primary : lightTheme.primary }}
          >
            Dynamic Themed Component
          </div>
          <button onClick={toggleTheme} data-testid="dynamic-toggle-theme">
            Toggle Theme
          </button>
        </div>
      );
    };

    render(
      <ThemeProviderComponent>
        <TestComponentWithTheme />
      </ThemeProviderComponent>
    );

    const themedComponent = screen.getByTestId('dynamic-themed-component');
    const toggleButton = screen.getByTestId('dynamic-toggle-theme');

    expect(themedComponent).toHaveStyle({ color: lightTheme.primary });

    fireEvent.click(toggleButton);

    expect(themedComponent).toHaveStyle({ color: darkTheme.primary });
  });

  it('deve fornecer o contexto para componentes filhos', () => {
    render(
      <ThemeProviderComponent>
        <TestComponent />
      </ThemeProviderComponent>
    );

    expect(screen.getByTestId('isDarkMode')).toBeInTheDocument();
    expect(screen.getByTestId('toggle-theme')).toBeInTheDocument();
    expect(screen.getByTestId('theme-info')).toBeInTheDocument();
  });

  it('deve manter o estado do tema entre rerenders', () => {
    const { rerender } = render(
      <ThemeProviderComponent>
        <TestComponent />
      </ThemeProviderComponent>
    );

    const toggleButton = screen.getByTestId('toggle-theme');
    fireEvent.click(toggleButton);
    expect(screen.getByTestId('isDarkMode')).toHaveTextContent('true');

    rerender(
      <ThemeProviderComponent>
        <TestComponent />
      </ThemeProviderComponent>
    );

    expect(screen.getByTestId('isDarkMode')).toHaveTextContent('true');
  });

  it('deve funcionar com múltiplos componentes consumindo o contexto', () => {
    const SecondTestComponent = () => {
      const { isDarkMode } = useTheme();
      return <div data-testid="second-component">{isDarkMode ? 'Dark' : 'Light'}</div>;
    };

    render(
      <ThemeProviderComponent>
        <TestComponent />
        <SecondTestComponent />
      </ThemeProviderComponent>
    );

    const toggleButton = screen.getByTestId('toggle-theme');
    
    expect(screen.getByTestId('theme-info')).toHaveTextContent('Light Mode');
    expect(screen.getByTestId('second-component')).toHaveTextContent('Light');

    fireEvent.click(toggleButton);

    expect(screen.getByTestId('theme-info')).toHaveTextContent('Dark Mode');
    expect(screen.getByTestId('second-component')).toHaveTextContent('Dark');
  });

  it('deve lançar erro se useTheme for usado fora do Provider', () => {
    const originalError = console.error;
    console.error = jest.fn();

    expect(() => {
      render(<TestComponent />);
    }).toThrow();

    console.error = originalError;
  });
});