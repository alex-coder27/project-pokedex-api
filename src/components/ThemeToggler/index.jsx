import { useTheme } from '../../context/ThemeContext';
import { ToggleButton } from './style'

const ThemeTogglerButton = () => {
    const { isDarkMode, toggleTheme } = useTheme();

    return (
        <ToggleButton onClick={toggleTheme}>
            {isDarkMode ? '🌞 Light Theme' : '🌙 Dark Theme'}
        </ToggleButton>
    );
};

export default ThemeTogglerButton;