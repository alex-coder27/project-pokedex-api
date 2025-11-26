import { useNavigate } from 'react-router-dom';
import { DetailsHeader, BackButton, ToggleButton } from './style';
import { useTheme } from '../../context/ThemeContext';
import ArrowBackWhite from '../../assets/seta-branca.png';
import ArrowBackBlack from '../../assets/seta-preta.png';
import ChandelureNormal from '../../assets/chandelure-normal.png';
import ChandelureApagado from '../../assets/chandelure-apagado.png';

const Header = ({ showBackButton = false }) => {
    const navigate = useNavigate();
    const { isDarkMode, toggleTheme } = useTheme(); 
    const iconSrc = isDarkMode ? ChandelureApagado : ChandelureNormal;
    const ArrowBackIcon = isDarkMode ? ArrowBackBlack : ArrowBackWhite;
    const handleGoBack = () => {
        navigate('/');
    };

    return (
        <DetailsHeader>
            {showBackButton ? (
                <BackButton onClick={handleGoBack}>
                    <img src={ArrowBackIcon} alt='Voltar página' />
                </BackButton>
            ) : (
                <div style={{ width: '2rem' }} />
            )}
            <ToggleButton onClick={toggleTheme}>
                <img
                    src={iconSrc}
                    alt={isDarkMode ? 'Tema Escuro' : 'Tema Claro'}
                />
            </ToggleButton>
        </DetailsHeader>
    );
};

export default Header;