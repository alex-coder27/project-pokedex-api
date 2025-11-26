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
  margin: 40px auto;
  cursor: pointer;
  background-color: transparent;
  border: none;
  padding: 0;
  
  transition: opacity 0.2s ease, transform 0.2s ease; 

  img {
    width: 100%;
    height: auto;
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

export const SearchContainer = styled.div`
    display: flex;
    justify-content: center;
    padding: 0; 
    flex-grow: 1;
`;
export const SearchInput = styled.input`
    width: 100%;
    padding: 12px 20px;
    border: 2px solid ${props => props.theme.primary};
    border-radius: 25px;
    font-size: 1.1rem;
    color: ${props => props.theme.text};
    background-color: ${props => props.theme.cardBackground};
    transition: border-color 0.3s, box-shadow 0.3s;
    outline: none;
    
    &::placeholder {
        color: ${props => props.theme.text}99;
    }

    &:focus {
        border-color: ${props => props.theme.primaryHover || '#AA0000'};
        box-shadow: 0 0 8px ${props => props.theme.primary}50;
    }
`;

export const FilterBarContainer = styled.div`
    display: flex;
    gap: 15px;
    padding: 30px 20px 20px;
    max-width: 1000px; 
    margin: 0 auto;
    @media (max-width: 768px) {
        flex-direction: column;
        gap: 10px;
    }
`;

export const TypeSelectWrapper = styled.div`
    position: relative;
    width: 100%;
    max-width: 200px;

    @media (max-width: 768px) {
        max-width: 100%;
    }
    &::after {
        content: '\\25BE';
        position: absolute;
        top: 50%;
        right: 15px;
        transform: translateY(-50%);
        pointer-events: none;
        font-size: 1rem;
        color: ${props => props.$typeColor ? props.theme.white : props.theme.text};
    }
`;

export const TypeSelect = styled.select`
    display: block;
    width: 100%;
    
    padding: 10px 15px;
    padding-right: 40px;
    border-radius: 25px;
    font-size: 1.1rem;
    cursor: pointer;
    background-color: ${props => props.$typeColor || props.theme.cardBackground};
    border: 2px solid ${props => props.$typeColor || props.theme.primary};
    color: ${props => props.$typeColor ? props.theme.white : props.theme.text};
    appearance: none;
`;

export const TypeOption = styled.option`
    color: ${props => props.$textColor || props.theme.text}; 
    background-color: ${props => props.$bgColor || 'transparent'};
`;

export const MessageParagraph = styled.p`
    text-align: center;
    margin-top: 20px;
    color: ${props => props.$isError ? 'red' : props.theme.text}; 
`;