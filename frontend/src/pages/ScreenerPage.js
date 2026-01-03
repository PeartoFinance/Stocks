import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Filter, Search, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
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

const FiltersContainer = styled.div`
  background: white;
  border-radius: 16px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`;

const FiltersTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FilterLabel = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
`;

const FilterInput = styled.input`
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const FilterSelect = styled.select`
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  background: white;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const ApplyButton = styled.button`
  grid-column: 1 / -1;
  padding: 12px 24px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
  margin-top: 10px;
  
  &:hover {
    background: #2563eb;
  }
  
  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }
`;

const ResultsContainer = styled.div`
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`;

const ResultsHeader = styled.div`
  padding: 20px 30px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ResultsTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
`;

const ResultsCount = styled.span`
  color: #64748b;
  font-size: 0.875rem;
`;

const TableContainer = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.thead`
  background: #f8fafc;
`;

const TableRow = styled.tr`
  &:hover {
    background: #f8fafc;
  }
`;

const TableHeaderCell = styled.th`
  padding: 16px 20px;
  text-align: left;
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
  border-bottom: 1px solid #f1f5f9;
`;

const TableCell = styled.td`
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.875rem;
`;

const StockLink = styled(Link)`
  color: #3b82f6;
  text-decoration: none;
  font-weight: 600;
  
  &:hover {
    text-decoration: underline;
  }
`;

const StockName = styled.div`
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 2px;
`;

const StockSymbol = styled.div`
  font-size: 0.75rem;
  color: #64748b;
`;

const PriceChange = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
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

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #64748b;
`;

function ScreenerPage() {
  const [filters, setFilters] = useState({
    min_price: '',
    max_price: '',
    min_market_cap: '',
    sector: ''
  });
  
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const sectors = [
    'Technology',
    'Healthcare',
    'Financial Services',
    'Consumer Cyclical',
    'Communication Services',
    'Industrials',
    'Consumer Defensive',
    'Energy',
    'Utilities',
    'Real Estate',
    'Basic Materials'
  ];

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      // Clean up filters - remove empty values
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '')
      );

      const response = await stockAPI.getStockScreener(cleanFilters);
      setResults(response.data);
      setHasSearched(true);
    } catch (error) {
      console.error('Screener error:', error);
      toast.error('Failed to search stocks. Please try again.');
    } finally {
      setLoading(false);
    }
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

  useEffect(() => {
    // Load all stocks on initial page load
    handleSearch();
  }, []);

  return (
    <PageContainer>
      <Header>
        <Title>Stock Screener</Title>
        <Subtitle>
          Filter and discover stocks based on your investment criteria
        </Subtitle>
      </Header>

      <FiltersContainer>
        <FiltersTitle>
          <Filter size={20} />
          Filters
        </FiltersTitle>
        
        <FiltersGrid>
          <FilterGroup>
            <FilterLabel>Min Price ($)</FilterLabel>
            <FilterInput
              type="number"
              placeholder="e.g., 10"
              value={filters.min_price}
              onChange={(e) => handleFilterChange('min_price', e.target.value)}
            />
          </FilterGroup>
          
          <FilterGroup>
            <FilterLabel>Max Price ($)</FilterLabel>
            <FilterInput
              type="number"
              placeholder="e.g., 1000"
              value={filters.max_price}
              onChange={(e) => handleFilterChange('max_price', e.target.value)}
            />
          </FilterGroup>
          
          <FilterGroup>
            <FilterLabel>Min Market Cap</FilterLabel>
            <FilterInput
              type="number"
              placeholder="e.g., 1000000000"
              value={filters.min_market_cap}
              onChange={(e) => handleFilterChange('min_market_cap', e.target.value)}
            />
          </FilterGroup>
          
          <FilterGroup>
            <FilterLabel>Sector</FilterLabel>
            <FilterSelect
              value={filters.sector}
              onChange={(e) => handleFilterChange('sector', e.target.value)}
            >
              <option value="">All Sectors</option>
              {sectors.map(sector => (
                <option key={sector} value={sector}>{sector}</option>
              ))}
            </FilterSelect>
          </FilterGroup>
          
          <ApplyButton onClick={handleSearch} disabled={loading}>
            {loading ? 'Searching...' : 'Apply Filters'}
          </ApplyButton>
        </FiltersGrid>
      </FiltersContainer>

      <ResultsContainer>
        <ResultsHeader>
          <ResultsTitle>Search Results</ResultsTitle>
          <ResultsCount>
            {results.length} stock{results.length !== 1 ? 's' : ''} found
          </ResultsCount>
        </ResultsHeader>

        {loading ? (
          <LoadingContainer>
            <Search size={24} />
            <span style={{ marginLeft: '12px' }}>Searching stocks...</span>
          </LoadingContainer>
        ) : results.length === 0 ? (
          <EmptyState>
            {hasSearched ? (
              <>
                <Search size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                <h3>No stocks found</h3>
                <p>Try adjusting your filters to see more results</p>
              </>
            ) : (
              <>
                <Search size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                <h3>Search for stocks</h3>
                <p>Use the filters above to find stocks that match your criteria</p>
              </>
            )}
          </EmptyState>
        ) : (
          <TableContainer>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHeaderCell>Company</TableHeaderCell>
                  <TableHeaderCell>Price</TableHeaderCell>
                  <TableHeaderCell>Change %</TableHeaderCell>
                  <TableHeaderCell>Market Cap</TableHeaderCell>
                  <TableHeaderCell>P/E Ratio</TableHeaderCell>
                  <TableHeaderCell>Volume</TableHeaderCell>
                  <TableHeaderCell>Sector</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <tbody>
                {results.map((stock) => (
                  <TableRow key={stock.symbol}>
                    <TableCell>
                      <StockLink to={`/stock/${stock.symbol}`}>
                        <StockName>{stock.name}</StockName>
                        <StockSymbol>{stock.symbol}</StockSymbol>
                      </StockLink>
                    </TableCell>
                    <TableCell>
                      <strong>${stock.price}</strong>
                    </TableCell>
                    <TableCell>
                      <PriceChange positive={stock.change_percent >= 0}>
                        {stock.change_percent >= 0 ? (
                          <TrendingUp size={16} />
                        ) : (
                          <TrendingDown size={16} />
                        )}
                        {stock.change_percent >= 0 ? '+' : ''}{stock.change_percent.toFixed(2)}%
                      </PriceChange>
                    </TableCell>
                    <TableCell>{formatValue(stock.market_cap)}</TableCell>
                    <TableCell>{stock.pe_ratio?.toFixed(2) || 'N/A'}</TableCell>
                    <TableCell>{formatVolume(stock.volume)}</TableCell>
                    <TableCell>{stock.sector || 'N/A'}</TableCell>
                  </TableRow>
                ))}
              </tbody>
            </Table>
          </TableContainer>
        )}
      </ResultsContainer>
    </PageContainer>
  );
}

export default ScreenerPage;