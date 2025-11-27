// src/App.jsx

import { BrowserRouter, Routes, Route } from 'react-router-dom'; 
import { ThemeProviderComponent } from './context/ThemeContext.jsx'; 
import GlobalStyle from './styles/GlobalStyles.js'; 

// 🎯 IMPORTAÇÕES NECESSÁRIAS
import isPropValid from '@emotion/is-prop-valid';
import { StyleSheetManager } from 'styled-components';

import HomePage from './pages/Home/index.jsx';
import DetailsPage from './pages/Details/index.jsx'; 

const shouldForwardProp = (prop) => {
    return !prop.startsWith('$') && isPropValid(prop);
};

function App() {
  return (
    <BrowserRouter>
        <StyleSheetManager shouldForwardProp={shouldForwardProp}> 
            <ThemeProviderComponent>
                <GlobalStyle /> 
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/pokemon/:name" element={<DetailsPage />} />
                    <Route path="*" element={<h1>404 - Not Found</h1>} />
                </Routes>
            </ThemeProviderComponent>
        </StyleSheetManager>
    </BrowserRouter>
  );
}

export default App;