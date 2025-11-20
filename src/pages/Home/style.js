import styled from 'styled-components';


export const Container = styled.div`
  min-height: 100vh;
  padding: 0;
  background-color: ${props => props.theme.background}; 
  color: ${props => props.theme.text};
  
  transition: background-color 0.3s, color 0.3s;
`;

export const PokemonGrid = styled.ul`
  list-style: none;
  padding: 20px;
  margin: 0 auto;
  max-width: 1920px; 
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(217px, 1fr)); 
  gap: 20px;
  padding-left: 10px;
  padding-right: 10px;
`;

export const LoadMoreButton = styled.button`
  display: block;
  margin: 40px auto;
  padding: 12px 25px;
  background-color: ${props => props.theme.primary};
  color: ${props => props.theme.white}; 
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  transition: opacity 0.2s;

  &:hover:not(:disabled) {
    opacity: 0.9;
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;