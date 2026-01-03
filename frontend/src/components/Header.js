import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Search, TrendingUp, Menu, X, BarChart3, List, Heart } from 'lucide-react';
import { stockAPI } from '../utils/api';
import toast from 'react-hot-toast';

const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid #e2e8f0;
  z-index: 1000;
  padding: 0 20px;
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 80px;
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: #1e293b;
  font-weight: 700;
  font-size: 24px;
  
  svg {
    color: #3b82f6;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  max-width: 400px;
  margin: 0 40px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 20px 12px 50px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 16px;
  outline: none;
  transition: all 0.2s ease;
  
  &:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &::placeholder {
    color: #94a3b8;
  }
`;

const SearchIcon = styled(Search)`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
  width: 20px;
  height: 20px;
`;

const SearchResults = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  max-height: 300px;
  overflow-y: auto;
  z-index: 1001;
`;

const SearchResultItem = styled.div`
  padding: 12px 16px;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: #f8fafc;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const Navigation = styled.nav`
  display: flex;
  align-items: center;
  gap: 30px;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: #64748b;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    color: #3b82f6;
    background-color: #f8fafc;
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  
  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await stockAPI.searchStocks(query);
      setSearchResults(response.data);
      setShowSearchResults(true);
    } catch (error) {
      toast.error('Error searching stocks');
      console.error('Search error:', error);
    }
    setIsSearching(false);
  };

  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      handleSearch(value);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  };

  const handleResultClick = (symbol) => {
    navigate(`/stock/${symbol}`);
    setSearchQuery('');
    setShowSearchResults(false);
  };

  return (
    <HeaderContainer>
      <HeaderContent>
        <Logo to="/">
          <TrendingUp />
          StockAnalysis Pro
        </Logo>
        
        <SearchContainer>
          <SearchIcon />
          <SearchInput
            type="text"
            placeholder="Search stocks (e.g., AAPL, Apple...)"
            value={searchQuery}
            onChange={handleSearchInputChange}
            onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
          />
          
          {showSearchResults && (
            <SearchResults>
              {isSearching ? (
                <SearchResultItem>Searching...</SearchResultItem>
              ) : searchResults.length > 0 ? (
                searchResults.map((stock) => (
                  <SearchResultItem
                    key={stock.symbol}
                    onClick={() => handleResultClick(stock.symbol)}
                  >
                    <div style={{ fontWeight: '600', color: '#1e293b' }}>
                      {stock.symbol}
                    </div>
                    <div style={{ fontSize: '14px', color: '#64748b' }}>
                      {stock.name}
                    </div>
                  </SearchResultItem>
                ))
              ) : (
                <SearchResultItem>No results found</SearchResultItem>
              )}
            </SearchResults>
          )}
        </SearchContainer>
        
        <Navigation>
          <NavLink to="/">
            <TrendingUp />
            Market
          </NavLink>
          <NavLink to="/screener">
            <BarChart3 />
            Screener
          </NavLink>
          <NavLink to="/watchlist">
            <Heart />
            Watchlist
          </NavLink>
        </Navigation>
        
        <MobileMenuButton>
          <Menu />
        </MobileMenuButton>
      </HeaderContent>
    </HeaderContainer>
  );
}

export default Header;