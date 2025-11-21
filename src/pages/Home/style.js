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
  width: 300px;
  height: auto;
  margin: 0 auto;
  cursor: pointer;
  background-color: transparent;
  transition: opacity 0.2s;
  img {
    width: 100%;
  }
    &:hover:not(:disabled) {
    opacity: 0.85;
    transform: scale(1.02);
  }

  &:active {
    transform: scale(0.98);
    opacity: 1;
  }
`;