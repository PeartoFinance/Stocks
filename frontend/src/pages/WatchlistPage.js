import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Heart, TrendingUp, TrendingDown, Plus, X } from 'lucide-react';
import { stockAPI } from '../utils/api';
import toast from 'react-hot-toast';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const Header = styled.div`
  margin-bottom: 40px;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 16px;
`;

const Subtitle = styled.p`
  font-size: 1.125rem;
  color: #64748b;
`;

const WatchlistContainer = styled.div`
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`;

const WatchlistHeader = styled.div`
  padding: 30px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const WatchlistTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const AddStockButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
  
  &:hover {
    background: #2563eb;
  }
`;

const StockGrid = styled.div`
  padding: 30px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
`;

const StockCard = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
  position: relative;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    background: white;
  }
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: #fee2e2;
  color: #dc2626;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s ease;
  
  ${StockCard}:hover & {
    opacity: 1;
  }
  
  &:hover {
    background: #fecaca;
  }
`;

const StockHeader = styled.div`
  margin-bottom: 16px;
`;

const StockSymbol = styled(Link)`
  font-size: 1.5rem;
  font-weight: 700;
  color: #3b82f6;
  text-decoration: none;
  display: block;
  margin-bottom: 4px;
  
  &:hover {
    text-decoration: underline;
  }
`;

const StockName = styled.div`
  color: #64748b;
  font-size: 0.875rem;
`;

const PriceSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const CurrentPrice = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
`;

const PriceChange = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;
  color: ${props => props.positive ? '#10b981' : '#ef4444'};
`;

const StockMetrics = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  font-size: 0.875rem;
`;

const Metric = styled.div`
  display: flex;
  justify-content: space-between;
  color: #64748b;
`;

const MetricValue = styled.span`
  color: #1e293b;
  font-weight: 500;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 80px 20px;
  color: #64748b;
`;

const EmptyIcon = styled(Heart)`
  width: 64px;
  height: 64px;
  margin-bottom: 20px;
  opacity: 0.3;
`;

const AddStockModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  padding: 30px;
  width: 90%;
  max-width: 400px;
  position: relative;
`;

const ModalTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 20px;
`;

const ModalInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 16px;
  margin-bottom: 20px;
  outline: none;
  transition: border-color 0.2s ease;
  
  &:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const ModalButtons = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

const ModalButton = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
  
  ${props => props.primary ? `
    background: #3b82f6;
    color: white;
    
    &:hover {
      background: #2563eb;
    }
  ` : `
    background: #f1f5f9;
    color: #64748b;
    
    &:hover {
      background: #e2e8f0;
    }
  `}
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: #f1f5f9;
  }
`;

function WatchlistPage() {
  const [watchlist, setWatchlist] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSymbol, setNewSymbol] = useState('');
  const [loading, setLoading] = useState(false);

  // Demo watchlist data - in a real app, this would come from a backend
  const demoWatchlist = [
    { symbol: 'AAPL', name: 'Apple Inc.' },
    { symbol: 'MSFT', name: 'Microsoft Corporation' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.' },
    { symbol: 'TSLA', name: 'Tesla Inc.' }
  ];

  useEffect(() => {
    // Load watchlist from localStorage or use demo data
    const savedWatchlist = localStorage.getItem('stockWatchlist');
    if (savedWatchlist) {
      const symbols = JSON.parse(savedWatchlist);
      loadWatchlistData(symbols);
    } else {
      loadWatchlistData(demoWatchlist.map(item => item.symbol));
    }
  }, []);

  const loadWatchlistData = async (symbols) => {
    setLoading(true);
    const watchlistData = [];
    
    for (const symbol of symbols) {
      try {
        const response = await stockAPI.getStockInfo(symbol);
        watchlistData.push(response.data);
      } catch (error) {
        console.error(`Error loading ${symbol}:`, error);
      }
    }
    
    setWatchlist(watchlistData);
    setLoading(false);
  };

  const saveWatchlistToStorage = (symbols) => {
    localStorage.setItem('stockWatchlist', JSON.stringify(symbols));
  };

  const addToWatchlist = async () => {
    if (!newSymbol.trim()) return;
    
    const symbol = newSymbol.trim().toUpperCase();
    
    // Check if already in watchlist
    if (watchlist.some(stock => stock.symbol === symbol)) {
      toast.error('Stock already in watchlist');
      return;
    }
    
    try {
      const response = await stockAPI.getStockInfo(symbol);
      const newWatchlist = [...watchlist, response.data];
      setWatchlist(newWatchlist);
      
      // Save to localStorage
      const symbols = newWatchlist.map(stock => stock.symbol);
      saveWatchlistToStorage(symbols);
      
      setShowAddModal(false);
      setNewSymbol('');
      toast.success(`${symbol} added to watchlist`);
    } catch (error) {
      toast.error('Stock not found or error loading data');
    }
  };

  const removeFromWatchlist = (symbol) => {
    const newWatchlist = watchlist.filter(stock => stock.symbol !== symbol);
    setWatchlist(newWatchlist);
    
    // Save to localStorage
    const symbols = newWatchlist.map(stock => stock.symbol);
    saveWatchlistToStorage(symbols);
    
    toast.success(`${symbol} removed from watchlist`);
  };

  const formatValue = (value) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
    return `$${value}`;
  };

  const formatVolume = (value) => {
    if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
    return value?.toLocaleString() || '0';
  };

  return (
    <PageContainer>
      <Header>
        <Title>My Watchlist</Title>
        <Subtitle>
          Keep track of your favorite stocks and monitor their performance
        </Subtitle>
      </Header>

      <WatchlistContainer>
        <WatchlistHeader>
          <WatchlistTitle>
            <Heart size={20} />
            Your Stocks ({watchlist.length})
          </WatchlistTitle>
          <AddStockButton onClick={() => setShowAddModal(true)}>
            <Plus size={18} />
            Add Stock
          </AddStockButton>
        </WatchlistHeader>

        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
            Loading watchlist...
          </div>
        ) : watchlist.length === 0 ? (
          <EmptyState>
            <EmptyIcon />
            <h3>Your watchlist is empty</h3>
            <p>Add some stocks to start tracking their performance</p>
            <AddStockButton 
              onClick={() => setShowAddModal(true)}
              style={{ marginTop: '20px' }}
            >
              <Plus size={18} />
              Add Your First Stock
            </AddStockButton>
          </EmptyState>
        ) : (
          <StockGrid>
            {watchlist.map((stock) => (
              <StockCard key={stock.symbol}>
                <RemoveButton onClick={() => removeFromWatchlist(stock.symbol)}>
                  <X size={16} />
                </RemoveButton>
                
                <StockHeader>
                  <StockSymbol to={`/stock/${stock.symbol}`}>
                    {stock.symbol}
                  </StockSymbol>
                  <StockName>{stock.name}</StockName>
                </StockHeader>

                <PriceSection>
                  <CurrentPrice>${stock.price}</CurrentPrice>
                  <PriceChange positive={stock.change >= 0}>
                    {stock.change >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                    {stock.change >= 0 ? '+' : ''}{stock.change_percent.toFixed(2)}%
                  </PriceChange>
                </PriceSection>

                <StockMetrics>
                  <Metric>
                    <span>Market Cap</span>
                    <MetricValue>{formatValue(stock.market_cap)}</MetricValue>
                  </Metric>
                  <Metric>
                    <span>P/E Ratio</span>
                    <MetricValue>{stock.pe_ratio?.toFixed(2) || 'N/A'}</MetricValue>
                  </Metric>
                  <Metric>
                    <span>52W High</span>
                    <MetricValue>${stock.week_52_high}</MetricValue>
                  </Metric>
                  <Metric>
                    <span>52W Low</span>
                    <MetricValue>${stock.week_52_low}</MetricValue>
                  </Metric>
                </StockMetrics>
              </StockCard>
            ))}
          </StockGrid>
        )}
      </WatchlistContainer>

      {showAddModal && (
        <AddStockModal onClick={() => setShowAddModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <CloseButton onClick={() => setShowAddModal(false)}>
              <X size={16} />
            </CloseButton>
            <ModalTitle>Add Stock to Watchlist</ModalTitle>
            <ModalInput
              type="text"
              placeholder="Enter stock symbol (e.g., AAPL)"
              value={newSymbol}
              onChange={(e) => setNewSymbol(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addToWatchlist()}
            />
            <ModalButtons>
              <ModalButton onClick={() => setShowAddModal(false)}>
                Cancel
              </ModalButton>
              <ModalButton primary onClick={addToWatchlist}>
                Add Stock
              </ModalButton>
            </ModalButtons>
          </ModalContent>
        </AddStockModal>
      )}
    </PageContainer>
  );
}

export default WatchlistPage;