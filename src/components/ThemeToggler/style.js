import styled from 'styled-components';

export const ToggleButton = styled.button`
  padding: 8px 16px;
  /* As cores vêm do objeto 'theme' definido no Context */
  border: 2px solid ${props => props.theme.text}; 
  background-color: ${props => props.theme.background};
  color: ${props => props.theme.text};
  cursor: pointer;
  border-radius: 5px;
  font-weight: bold;
  transition: all 0.3s ease;
  margin-left: auto;

  &:hover {
    /* Usa uma cor de fundo do tema para o hover */
    background-color: ${props => props.theme.cardBackground};
  }
`;