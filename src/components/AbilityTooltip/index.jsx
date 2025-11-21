import {TooltipContainer} from './style'

const AbilityTooltip = ({ description }) => {
  if (!description || description === "Carregando descrição..." || description === "Erro ao carregar descrição.") {
    return null;
  }
  return (
    <TooltipContainer>
      {description}
    </TooltipContainer>
  );
};

export default AbilityTooltip;