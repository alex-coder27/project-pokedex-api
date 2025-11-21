import styled from 'styled-components';

export const DetailsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
  padding: 20px;
  margin: 0 auto;
  max-width: 1200px;
  min-height: calc(90vh - 80px);

  @media (min-width: 768px) {
    flex-direction: row;
    padding-top: 50px;
  }
`;

export const Sidebar = styled.aside`
  flex: 0 0 300px;
  background-color: ${props => props.theme.cardBackground};
  color: ${props => props.theme.text};
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;

  img {
    width: 100%;
    max-width: 200px;
    height: auto;
    margin-bottom: 20px;
    filter: ${props => props.theme.name === 'dark' 
        ? 'none' 
        : 'brightness(0.9) contrast(1.1)'};
    transition: filter 0.3s ease-out;
  }

  @media (max-width: 767px) {
      width: 100%;
      flex: none;
  }
`;

export const MainContent = styled.main`
  flex: 1;
  background-color: ${props => props.theme.cardBackground};
  color: ${props => props.theme.text};
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
`;

export const DetailTitle = styled.h2`
    color: ${props => props.$typeColor || props.theme.primary};
    border-bottom: 2px solid ${props => props.$typeColor || props.theme.primary}50;
    padding-bottom: 5px;
    margin-top: 0;
    margin-bottom: 20px;
    width: 100%;
    text-transform: uppercase;
    font-size: 1.5rem;
`;

export const StatContainer = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    width: 100%;
    
    span {
        flex: 0 0 100px;
        font-weight: bold;
        font-size: 0.9rem;
        margin-right: 10px;
        text-align: right;
    }
`;

export const StatBar = styled.div`
    flex: 1;
    height: 12px;
    background-color: ${props => props.theme.backgroundContainer};
    border-radius: 6px;
    overflow: hidden;
    position: relative;

    &::before {
        content: '';
        display: block;
        height: 100%;
        width: ${props => `${(props.value / 255) * 100}%`};
        max-width: 100%;
        background-color: ${props => props.theme.primary};
        transition: width 1s ease-out;
    }
`;

export const StatValue = styled.span`
    position: absolute;
    right: 5px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 0.8rem;
    font-weight: bold;
    color: ${props => props.theme.text};
    z-index: 1;
    flex: none;
    text-align: left;
`;

export const TypeContainer = styled.div`
    display: flex;
    gap: 10px;
    margin-bottom: 30px;
    flex-wrap: wrap;
`;

export const TypeItem = styled.span`
    background-color: ${props => props.$typeColor || props.theme.primary};
    color: ${props => props.theme.text};
    padding: 8px 15px;
    border-radius: 8px;
    font-weight: bold;
    font-size: 0.9rem;
`;

export const SectionContainer = styled.div`
    margin-bottom: 30px;
`;

export const ListWrapper = styled.div`
    border: 1px solid ${props => props.theme.backgroundContainer};
    border-radius: 8px;
    padding: 10px;
    max-height: 300px;
    overflow-y: auto;
    background-color: ${props => props.theme.backgroundContainer};
`;

export const AbilityList = styled.ul`
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
`;

export const AbilityItem = styled.li`
    background-color: ${props => props.theme.primary}1A;
    color: ${props => props.theme.text};
    padding: 8px 15px;
    border-radius: 20px;
    font-size: 0.95rem;
    font-weight: bold;
    text-transform: capitalize;
    border: 1px solid ${props => props.theme.primary};
    position: relative;
    
    ${props => props.$isHidden && `
        opacity: 0.7;
        font-weight: semi-bold;
        border-style: dashed;
        color: ${props.theme.text};
        border-color: ${props.theme.text};
        background-color: transparent;
        &::after {
            content: ' (Hidden)';
            font-size: 0.8em;
            font-weight: bold;
        }
    `}
`;

export const MovesList = styled.ul`
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); 
    gap: 10px;
`;

export const MoveItem = styled.li`
    background-color: ${props => props.theme.cardBackground};
    color: ${props => props.theme.text};
    padding: 8px;
    border-radius: 5px;
    font-size: 0.9rem;
    text-transform: capitalize;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;