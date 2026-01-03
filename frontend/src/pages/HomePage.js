import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { TrendingUp, TrendingDown, Activity, DollarSign, BarChart3 } from 'lucide-react';
import { stockAPI } from '../utils/api';
import toast from 'react-hot-toast';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const Hero = styled.section`
  text-align: center;
  margin-bottom: 60px;
`;

const HeroTitle = styled.h1`
  font-size: 3.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 20px;
`;

const HeroSubtitle = styled.p`
  font-size: 1.25rem;
  color: #64748b;
  max-width: 600px;
  margin: 0 auto;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 60px;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #f1f5f9;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 25px rgba(0, 0, 0, 0.1);
  }
`;

const StatIcon = styled.div`
  width: 60px;
  height: 60px;
  background: ${props => props.color || '#3b82f6'};
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  
  svg {
    color: white;
    width: 28px;
    height: 28px;
  }
`;

const StatTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
`;

const StatChange = styled.div`
  font-size: 0.875rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
  color: ${props => props.positive ? '#10b981' : '#ef4444'};
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 30px;
  text-align: center;
`;

const StockGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 60px;
`;

const StockCard = styled(Link)`
  background: white;
  border-radius: 12px;
  padding: 24px;
  text-decoration: none;
  color: inherit;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid #f1f5f9;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  }
`;

const StockHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
`;

const StockInfo = styled.div``;

const StockSymbol = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 4px;
`;

const StockName = styled.div`
  font-size: 0.875rem;
  color: #64748b;
`;

const StockPrice = styled.div`
  text-align: right;
`;

const Price = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
`;

const PriceChange = styled.div`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${props => props.positive ? '#10b981' : '#ef4444'};
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #64748b;
`;

const ErrorContainer = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 16px;
  color: #dc2626;
  text-align: center;
  margin: 20px 0;
`;

const QuickActions = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 40px;
`;

const ActionButton = styled(Link)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  background: #3b82f6;
  color: white;
  text-decoration: none;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
  
  &:hover {
    background: #2563eb;
    transform: translateY(-2px);
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

function HomePage() {
  const [marketData, setMarketData] = useState({});
  const [trendingStocks, setTrendingStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch market overview and trending stocks in parallel
        const [marketResponse, trendingResponse] = await Promise.all([
          stockAPI.getMarketOverview(),
          stockAPI.getTrendingStocks()
        ]);
        
        setMarketData(marketResponse.data);
        setTrendingStocks(trendingResponse.data.slice(0, 6)); // Show top 6
        setError('');
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load market data. Please try again later.');
        toast.error('Failed to load market data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatMarketCap = (value) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    return `$${value}`;
  };

  const formatVolume = (value) => {
    if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
    return value;
  };

  if (loading) {
    return (
      <PageContainer>
        <LoadingContainer>
          <Activity size={40} />
          <span style={{ marginLeft: '12px', fontSize: '18px' }}>
            Loading market data...
          </span>
        </LoadingContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Hero>
        <HeroTitle>Professional Stock Analysis</HeroTitle>
        <HeroSubtitle>
          Get real-time market data, technical analysis, and investment insights 
          to make informed trading decisions.
        </HeroSubtitle>
      </Hero>

      {error && <ErrorContainer>{error}</ErrorContainer>}

      {/* Market Overview */}
      <SectionTitle>Market Overview</SectionTitle>
      <StatsGrid>
        {Object.entries(marketData).map(([symbol, data]) => (
          <StatCard key={symbol}>
            <StatIcon color={data.change_percent >= 0 ? '#10b981' : '#ef4444'}>
              {data.change_percent >= 0 ? <TrendingUp /> : <TrendingDown />}
            </StatIcon>
            <StatTitle>{data.name}</StatTitle>
            <StatValue>${data.price}</StatValue>
            <StatChange positive={data.change_percent >= 0}>
              {data.change_percent >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              {data.change >= 0 ? '+' : ''}{data.change} ({data.change_percent >= 0 ? '+' : ''}{data.change_percent.toFixed(2)}%)
            </StatChange>
          </StatCard>
        ))}
      </StatsGrid>

      {/* Trending Stocks */}
      <SectionTitle>Trending Stocks</SectionTitle>
      <StockGrid>
        {trendingStocks.map((stock) => (
          <StockCard key={stock.symbol} to={`/stock/${stock.symbol}`}>
            <StockHeader>
              <StockInfo>
                <StockSymbol>{stock.symbol}</StockSymbol>
                <StockName>{stock.name}</StockName>
              </StockInfo>
              <StockPrice>
                <Price>${stock.price}</Price>
                <PriceChange positive={stock.change_percent >= 0}>
                  {stock.change >= 0 ? '+' : ''}{stock.change} ({stock.change_percent >= 0 ? '+' : ''}{stock.change_percent.toFixed(2)}%)
                </PriceChange>
              </StockPrice>
            </StockHeader>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#64748b' }}>
              <span>Volume: {formatVolume(stock.volume)}</span>
              <span>Market Cap: {formatMarketCap(stock.market_cap)}</span>
            </div>
          </StockCard>
        ))}
      </StockGrid>

      <QuickActions>
        <ActionButton to="/screener">
          <BarChart3 />
          Stock Screener
        </ActionButton>
        <ActionButton to="/watchlist">
          <DollarSign />
          My Watchlist
        </ActionButton>
      </QuickActions>
    </PageContainer>
  );
}

export default HomePage;