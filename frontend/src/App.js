import React from 'react';
import { Routes, Route } from 'react-router-dom';
import styled from 'styled-components';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import StockDetailPage from './pages/StockDetailPage';
import ScreenerPage from './pages/ScreenerPage';
import WatchlistPage from './pages/WatchlistPage';

const AppContainer = styled.div`
  min-height: 100vh;
  background-color: #f8fafc;
`;

const MainContent = styled.main`
  padding-top: 80px;
  min-height: calc(100vh - 80px);
`;

function App() {
  return (
    <AppContainer>
      <Header />
      <MainContent>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/stock/:symbol" element={<StockDetailPage />} />
          <Route path="/screener" element={<ScreenerPage />} />
          <Route path="/watchlist" element={<WatchlistPage />} />
        </Routes>
      </MainContent>
    </AppContainer>
  );
}

export default App;