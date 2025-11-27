import {TooltipContainer} from './style'

const AbilityTooltip = ({ description, ...props }) => {
  if (!description || description === "Carregando descrição..." || description === "Erro ao carregar descrição.") {
    return null;
  }
  return (
    <TooltipContainer {...props}>
      {description}
    </TooltipContainer>
  );
};

export default AbilityTooltip;