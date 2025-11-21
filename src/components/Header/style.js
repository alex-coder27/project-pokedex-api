import styled from "styled-components";

export const DetailsHeader = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: ${props => props.theme.cardBackground};
  padding: 5px 30px;
  margin-bottom: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  img {
    width:100%;
    height: 80px;
  }
`;

export const BackButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 2rem;
  padding: 0;
  transition: color 0.2s, transform 0.2s;
  img{
    width: 50%;
    height: auto;
  }
  &:hover {
    transform: translateX(-5px);
  }
`;