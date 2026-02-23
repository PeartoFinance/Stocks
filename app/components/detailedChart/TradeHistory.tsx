'use client';

interface Trade {
  time: string;
  price: number;
  size: number;
  side: 'buy' | 'sell';
}

interface TradeHistoryProps {
  trades: Trade[];
}

export default function TradeHistory({ trades }: TradeHistoryProps) {
  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <div className="h-10 border-b border-gray-800 flex items-center px-4">
        <h2 className="text-sm font-bold text-gray-400">TRADE HISTORY</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-3 gap-2 px-4 py-2 text-xs font-mono text-gray-500 border-b border-gray-800">
          <div>TIME</div>
          <div className="text-right">PRICE</div>
          <div className="text-right">SIZE</div>
        </div>
        
        <div className="space-y-px">
          {trades.map((trade, i) => (
            <div key={i} className="grid grid-cols-3 gap-2 px-4 py-1 text-xs font-mono hover:bg-gray-900/50">
              <div className="text-gray-500">{trade.time}</div>
              <div className={`text-right ${trade.side === 'buy' ? 'text-green-500' : 'text-red-500'}`}>
                {trade.price.toFixed(2)}
              </div>
              <div className="text-right text-gray-400">{trade.size}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
