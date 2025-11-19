import { BrowserRouter, Routes, Route } from 'react-router-dom'; 
import { ThemeProviderComponent } from './context/ThemeContext.jsx'; 
import GlobalStyle from './styles/GlobalStyles.js'; 

import HomePage from './pages/Home/index.jsx';
import DetailsPage from './pages/Details/index.jsx'; 

function App() {
  return (
    <BrowserRouter>
        <ThemeProviderComponent>
            <GlobalStyle /> 
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/pokemon/:name" element={<DetailsPage />} />
                <Route path="*" element={<h1>404 - Not Found</h1>} />
            </Routes>
        </ThemeProviderComponent>
    </BrowserRouter>
  );
}

export default App;