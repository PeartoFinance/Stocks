import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, Activity, Heart, ArrowLeft, DollarSign, Percent, Calendar, BarChart3 } from 'lucide-react';
import { stockAPI } from '../utils/api';
import toast from 'react-hot-toast';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const BackButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
  margin-bottom: 30px;
  
  &:hover {
    text-decoration: underline;
  }
`;

const StockHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 40px;
  padding: 30px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`;

const StockInfo = styled.div``;

const StockSymbol = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 8px;
`;

const StockName = styled.h2`
  font-size: 1.25rem;
  color: #64748b;
  font-weight: 400;
  margin-bottom: 16px;
`;

const StockDescription = styled.p`
  color: #64748b;
  max-width: 600px;
  line-height: 1.6;
`;

const PriceSection = styled.div`
  text-align: right;
`;

const CurrentPrice = styled.div`
  font-size: 3rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
`;

const PriceChange = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: flex-end;
  color: ${props => props.positive ? '#10b981' : '#ef4444'};
  margin-bottom: 16px;
`;

const AddToWatchlistButton = styled.button`
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

const TabContainer = styled.div`
  margin-bottom: 30px;
`;

const TabButtons = styled.div`
  display: flex;
  gap: 4px;
  background: #f1f5f9;
  padding: 4px;
  border-radius: 12px;
  margin-bottom: 30px;
`;

const TabButton = styled.button`
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${props => props.active ? 'white' : 'transparent'};
  color: ${props => props.active ? '#3b82f6' : '#64748b'};
  box-shadow: ${props => props.active ? '0 2px 4px rgba(0, 0, 0, 0.1)' : 'none'};
  
  &:hover {
    color: #3b82f6;
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
  
  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
`;

const ChartContainer = styled.div`
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`;

const ChartTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 20px;
`;

const MetricsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const MetricCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const MetricTitle = styled.h4`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const MetricGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
`;

const MetricItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f1f5f9;
  
  &:last-child {
    border-bottom: none;
  }
`;

const MetricLabel = styled.span`
  color: #64748b;
  font-size: 0.875rem;
`;

const MetricValue = styled.span`
  font-weight: 600;
  color: #1e293b;
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400px;
  color: #64748b;
`;

const ErrorContainer = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 24px;
  color: #dc2626;
  text-align: center;
`;

const RecommendationCard = styled.div`
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
`;

const RecommendationTitle = styled.h4`
  font-size: 1.125rem;
  margin-bottom: 8px;
`;

const RecommendationValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 8px;
`;

const RecommendationFactors = styled.div`
  font-size: 0.875rem;
  opacity: 0.9;
`;

function StockDetailPage() {
  const { symbol } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [stockData, setStockData] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [technicalData, setTechnicalData] = useState(null);
  const [fundamentalData, setFundamentalData] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch basic stock info and chart data
        const [stockResponse, historyResponse] = await Promise.all([
          stockAPI.getStockInfo(symbol),
          stockAPI.getStockHistory(symbol, '1y', '1d')
        ]);

        setStockData(stockResponse.data);
        setChartData(historyResponse.data.map(item => ({
          date: item.date,
          price: item.close,
          volume: item.volume
        })));

        // Fetch additional data based on active tab
        if (activeTab === 'technical') {
          const techResponse = await stockAPI.getTechnicalAnalysis(symbol);
          setTechnicalData(techResponse.data);
        } else if (activeTab === 'fundamentals') {
          const fundResponse = await stockAPI.getFundamentalAnalysis(symbol);
          setFundamentalData(fundResponse.data);
        }

        // Always fetch recommendation
        const recResponse = await stockAPI.getRecommendation(symbol);
        setRecommendation(recResponse.data);

      } catch (err) {
        console.error('Error fetching stock data:', err);
        setError('Failed to load stock data. Please try again later.');
        toast.error('Failed to load stock data');
      } finally {
        setLoading(false);
      }
    };

    fetchStockData();
  }, [symbol, activeTab]);

  const formatValue = (value, prefix = '', suffix = '') => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'number') {
      if (value >= 1e12) return `${prefix}${(value / 1e12).toFixed(1)}T${suffix}`;
      if (value >= 1e9) return `${prefix}${(value / 1e9).toFixed(1)}B${suffix}`;
      if (value >= 1e6) return `${prefix}${(value / 1e6).toFixed(1)}M${suffix}`;
      return `${prefix}${value.toLocaleString()}${suffix}`;
    }
    return value;
  };

  const formatPercent = (value) => {
    if (value === null || value === undefined) return 'N/A';
    return `${(value * 100).toFixed(2)}%`;
  };

  if (loading) {
    return (
      <PageContainer>
        <LoadingContainer>
          <Activity size={40} />
          <span style={{ marginLeft: '12px', fontSize: '18px' }}>
            Loading {symbol} data...
          </span>
        </LoadingContainer>
      </PageContainer>
    );
  }

  if (error || !stockData) {
    return (
      <PageContainer>
        <BackButton to="/">
          <ArrowLeft size={20} />
          Back to Market
        </BackButton>
        <ErrorContainer>
          <h3>Error Loading Stock Data</h3>
          <p>{error || 'Stock not found'}</p>
        </ErrorContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <BackButton to="/">
        <ArrowLeft size={20} />
        Back to Market
      </BackButton>

      <StockHeader>
        <StockInfo>
          <StockSymbol>{stockData.symbol}</StockSymbol>
          <StockName>{stockData.name}</StockName>
          <StockDescription>{stockData.description}</StockDescription>
        </StockInfo>
        
        <PriceSection>
          <CurrentPrice>${stockData.price}</CurrentPrice>
          <PriceChange positive={stockData.change >= 0}>
            {stockData.change >= 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
            {stockData.change >= 0 ? '+' : ''}{stockData.change} ({stockData.change_percent >= 0 ? '+' : ''}{stockData.change_percent.toFixed(2)}%)
          </PriceChange>
          <AddToWatchlistButton onClick={() => toast.success('Added to watchlist!')}>
            <Heart size={18} />
            Add to Watchlist
          </AddToWatchlistButton>
        </PriceSection>
      </StockHeader>

      <TabContainer>
        <TabButtons>
          <TabButton 
            active={activeTab === 'overview'} 
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </TabButton>
          <TabButton 
            active={activeTab === 'technical'} 
            onClick={() => setActiveTab('technical')}
          >
            Technical
          </TabButton>
          <TabButton 
            active={activeTab === 'fundamentals'} 
            onClick={() => setActiveTab('fundamentals')}
          >
            Fundamentals
          </TabButton>
        </TabButtons>

        <ContentGrid>
          <ChartContainer>
            <ChartTitle>Price Chart (1 Year)</ChartTitle>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short' })}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <Tooltip 
                  formatter={(value) => [`$${value.toFixed(2)}`, 'Price']}
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <Area 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#3b82f6" 
                  fillOpacity={1} 
                  fill="url(#colorPrice)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>

          <MetricsContainer>
            {recommendation && (
              <RecommendationCard>
                <RecommendationTitle>AI Recommendation</RecommendationTitle>
                <RecommendationValue>{recommendation.recommendation}</RecommendationValue>
                <RecommendationFactors>
                  Confidence: {recommendation.confidence}
                </RecommendationFactors>
              </RecommendationCard>
            )}

            <MetricCard>
              <MetricTitle>
                <DollarSign size={20} />
                Key Metrics
              </MetricTitle>
              <MetricGrid>
                <MetricItem>
                  <MetricLabel>Market Cap</MetricLabel>
                  <MetricValue>{formatValue(stockData.market_cap, '$')}</MetricValue>
                </MetricItem>
                <MetricItem>
                  <MetricLabel>Volume</MetricLabel>
                  <MetricValue>{formatValue(stockData.volume)}</MetricValue>
                </MetricItem>
                <MetricItem>
                  <MetricLabel>P/E Ratio</MetricLabel>
                  <MetricValue>{stockData.pe_ratio?.toFixed(2) || 'N/A'}</MetricValue>
                </MetricItem>
                <MetricItem>
                  <MetricLabel>EPS</MetricLabel>
                  <MetricValue>${stockData.eps?.toFixed(2) || 'N/A'}</MetricValue>
                </MetricItem>
                <MetricItem>
                  <MetricLabel>52W High</MetricLabel>
                  <MetricValue>${stockData.week_52_high}</MetricValue>
                </MetricItem>
                <MetricItem>
                  <MetricLabel>52W Low</MetricLabel>
                  <MetricValue>${stockData.week_52_low}</MetricValue>
                </MetricItem>
                <MetricItem>
                  <MetricLabel>Beta</MetricLabel>
                  <MetricValue>{stockData.beta?.toFixed(2) || 'N/A'}</MetricValue>
                </MetricItem>
                <MetricItem>
                  <MetricLabel>Dividend Yield</MetricLabel>
                  <MetricValue>{stockData.dividend_yield ? formatPercent(stockData.dividend_yield) : 'N/A'}</MetricValue>
                </MetricItem>
              </MetricGrid>
            </MetricCard>

            {activeTab === 'technical' && technicalData && (
              <MetricCard>
                <MetricTitle>
                  <BarChart3 size={20} />
                  Technical Indicators
                </MetricTitle>
                <MetricGrid>
                  <MetricItem>
                    <MetricLabel>RSI</MetricLabel>
                    <MetricValue>{technicalData.rsi?.toFixed(2) || 'N/A'}</MetricValue>
                  </MetricItem>
                  <MetricItem>
                    <MetricLabel>SMA 20</MetricLabel>
                    <MetricValue>${technicalData.sma_20?.toFixed(2) || 'N/A'}</MetricValue>
                  </MetricItem>
                  <MetricItem>
                    <MetricLabel>SMA 50</MetricLabel>
                    <MetricValue>${technicalData.sma_50?.toFixed(2) || 'N/A'}</MetricValue>
                  </MetricItem>
                  <MetricItem>
                    <MetricLabel>MACD</MetricLabel>
                    <MetricValue>{technicalData.macd?.toFixed(4) || 'N/A'}</MetricValue>
                  </MetricItem>
                </MetricGrid>
              </MetricCard>
            )}

            {activeTab === 'fundamentals' && fundamentalData && (
              <MetricCard>
                <MetricTitle>
                  <Percent size={20} />
                  Financial Ratios
                </MetricTitle>
                <MetricGrid>
                  <MetricItem>
                    <MetricLabel>ROE</MetricLabel>
                    <MetricValue>{fundamentalData.return_on_equity ? formatPercent(fundamentalData.return_on_equity) : 'N/A'}</MetricValue>
                  </MetricItem>
                  <MetricItem>
                    <MetricLabel>ROA</MetricLabel>
                    <MetricValue>{fundamentalData.return_on_assets ? formatPercent(fundamentalData.return_on_assets) : 'N/A'}</MetricValue>
                  </MetricItem>
                  <MetricItem>
                    <MetricLabel>Profit Margin</MetricLabel>
                    <MetricValue>{fundamentalData.profit_margins ? formatPercent(fundamentalData.profit_margins) : 'N/A'}</MetricValue>
                  </MetricItem>
                  <MetricItem>
                    <MetricLabel>Debt to Equity</MetricLabel>
                    <MetricValue>{fundamentalData.debt_to_equity?.toFixed(2) || 'N/A'}</MetricValue>
                  </MetricItem>
                </MetricGrid>
              </MetricCard>
            )}
          </MetricsContainer>
        </ContentGrid>
      </TabContainer>
    </PageContainer>
  );
}

export default StockDetailPage;