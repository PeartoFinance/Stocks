'use client';

interface OrderBookEntry {
  price: number;
  size: number;
  total: number;
}

interface OrderBookProps {
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
}

export default function OrderBook({ bids, asks }: OrderBookProps) {
  const spread = asks[0] && bids[0] ? (asks[0].price - bids[0].price).toFixed(2) : '—';

  return (
    <div className="flex-1 border-b border-gray-800 overflow-hidden flex flex-col">
      <div className="h-10 border-b border-gray-800 flex items-center px-4">
        <h2 className="text-sm font-bold text-gray-400">ORDER BOOK</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-3 gap-2 px-4 py-2 text-xs font-mono text-gray-500 border-b border-gray-800">
          <div>PRICE</div>
          <div className="text-right">SIZE</div>
          <div className="text-right">TOTAL</div>
        </div>
        
        <div className="space-y-px">
          {asks.map((ask, i) => (
            <div key={`ask-${i}`} className="grid grid-cols-3 gap-2 px-4 py-1 text-xs font-mono hover:bg-gray-900/50">
              <div className="text-red-500">{ask.price.toFixed(2)}</div>
              <div className="text-right text-gray-400">{ask.size}</div>
              <div className="text-right text-gray-500">{ask.total.toLocaleString()}</div>
            </div>
          ))}
        </div>
        
        <div className="h-8 flex items-center justify-center border-y border-gray-800 bg-gray-900/30">
          <span className="text-xs font-mono text-gray-500">SPREAD: {spread}</span>
        </div>
        
        <div className="space-y-px">
          {bids.map((bid, i) => (
            <div key={`bid-${i}`} className="grid grid-cols-3 gap-2 px-4 py-1 text-xs font-mono hover:bg-gray-900/50">
              <div className="text-green-500">{bid.price.toFixed(2)}</div>
              <div className="text-right text-gray-400">{bid.size}</div>
              <div className="text-right text-gray-500">{bid.total.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
