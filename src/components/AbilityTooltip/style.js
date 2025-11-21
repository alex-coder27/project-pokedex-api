import styled from 'styled-components';

export const TooltipContainer = styled.div`
  position: absolute;
  top: calc(100% + 10px); 
  left: 50%;
  transform: translateX(-50%);
  background-color: ${props => props.theme.cardBackground};
  color: ${props => props.theme.text};
  padding: 10px 15px;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  max-width: 300px;
  min-width: 200px;
  text-align: center;
  font-size: 0.9rem;
  z-index: 1000;
  &::before {
    content: '';
    position: absolute;
    bottom: 100%; 
    left: 50%;
    transform: translateX(-50%) rotate(45deg); 
    width: 12px;
    height: 12px;
    background-color: ${props => props.theme.text};
    clip-path: polygon(0% 0%, 100% 100%, 100% 0%); 
    z-index: -1; 
  }
`;