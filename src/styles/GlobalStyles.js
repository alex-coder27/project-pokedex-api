import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: sans-serif;
    list-style: none;
  }

  body {
    background-color: ${props => props.theme.background};
    color: ${props => props.theme.text};
    transition: background-color 0.3s, color 0.3s; 
  }

`;

export default GlobalStyle;