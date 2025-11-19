import styled from 'styled-components';

export const IdBadge = styled.span`
  position: absolute; 
  bottom: 5px;    
  left: -5px;   
  z-index: 10;
  
  width: 40px;
  height: 40px;
  
  display: flex;
  justify-content: center;
  align-items: center; 
  
  border-radius: 50%; 
  
  background-color: ${props => props.theme.backgroundContainer};
  color: ${props => props.theme.text};
  font-weight: bold;
  font-size: 1rem;
`;

export const ImageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 170px;
  width: 170px;
  margin-bottom: 10px;
  position: relative;
  
  /* 🟢 ESTADO NORMAL: SEM SHADOW! */
  box-shadow: none; 
  
  border-radius: 50%;
  background-color: ${props => props.theme.backgroundContainer};
  
  img {
    width: 100%;
    height: auto;
  }
`;

export const NameContainer = styled.div`
  text-align: center;
  background-color: ${props => props.theme.backgroundContainer};
  color: ${props => props.theme.text};
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 15px;
`;

export const Name = styled.h3`
  text-transform: capitalize;
  font-size: 1.2rem;
  margin: 0;
`;

export const TypesContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
`;


export const TypeBadge = styled.span`
  background-color: ${props => props.color}; 
  color: white;
  padding: 8px 15px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: bold;
  flex-grow: 1;
  text-align: center;
`;

export const CardWrapper = styled.li`
  background-color: ${props => props.theme.cardBackground};
  color: ${props => props.theme.text};
  border-radius: 12px;
  display:flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 15px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5); 

  &:hover {
    transform: translateY(-2px);
    box-shadow:
        0 0 15px rgba(0, 0, 0, 0.7),
        ${props => {
            const colors = props.$glowColors.split(',');
            
            if (colors.length > 1) {
                return `
                    -5px -5px 20px ${colors[0]}, 
                    5px 5px 20px ${colors[1]}
                `;
            }
        
            return `
                0 0 15px ${colors[0]},
                0 0 20px ${colors[0]}
            `;
        }};

    ${ImageContainer} {
        box-shadow: 
            0 0 10px ${props => props.$glowColors.split(',')[0]},
            0 0 20px ${props => props.$glowColors.split(',')[0]},
            0 0 40px ${props => props.$glowColors.split(',')[0]};
        transition: box-shadow 0.3s ease-out;
    };
    ${IdBadge} {
        box-shadow: 
            0 0 10px ${props => props.$glowColors.split(',')[0]},
            0 0 20px ${props => props.$glowColors.split(',')[0]},
            0 0 40px ${props => props.$glowColors.split(',')[0]};
        transition: box-shadow 0.3s ease-out;
    };
  }
`;

export const typeColors = {
  normal: '#A8A77A',
  fire: '#EE8130',
  water: '#6390F0',
  electric: '#F7D02C',
  grass: '#7AC74C',
  ice: '#96D9D6',
  fighting: '#C22E28',
  poison: '#A33EA1',
  ground: '#E2BF65',
  flying: '#A98FF3',
  psychic: '#F95587',
  bug: '#A6B91A',
  rock: '#B6A136',
  ghost: '#735797',
  dragon: '#6F35FC',
  dark: '#705746',
  steel: '#B7B7CE',
  fairy: '#D685AD',
};