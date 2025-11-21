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
  box-shadow: none; 
  border-radius: 50%;
  background-color: ${props => props.theme.backgroundContainer};
  img {
    max-width: 70%;
    height: 70%;
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
  color: ${props => props.theme.text};
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
        img {
          transform: scale(1.3);
          transition: transform 0.3s ease-out;
        }
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