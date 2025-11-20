import { useNavigate } from 'react-router-dom';
import { DetailsHeader, BackButton } from './style';
import ThemeTogglerButton from '../ThemeToggler/index';
import { useTheme } from '../../context/ThemeContext'; 
import ArrowBackWhite from '../../assets/seta-branca.png';
import ArrowBackBlack from '../../assets/seta-preta.png';

const Header = ({ showBackButton = false }) => {
    const navigate = useNavigate();
    const { isDarkMode } = useTheme();
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
            <ThemeTogglerButton />
        </DetailsHeader>
    );
};

export default Header;