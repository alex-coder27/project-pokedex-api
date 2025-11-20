import { useTheme } from '../../context/ThemeContext'; 
import { ToggleButton } from './style'; 
import ChandelureNormal from '../../assets/chandelure-normal.png'; 
import ChandelureApagado from '../../assets/chandelure-apagado.png';

const ThemeTogglerButton = () => {
    const { isDarkMode, toggleTheme } = useTheme(); 
    const iconSrc = isDarkMode ? ChandelureApagado : ChandelureNormal;

    return (
        <ToggleButton onClick={toggleTheme}>
            <img 
                src={iconSrc} 
                alt={isDarkMode ? 'Tema Escuro' : 'Tema Claro'}
            />
        </ToggleButton>
    );
};

export default ThemeTogglerButton;