'use client';

import { Separator } from '@/components/ui/separator';
import CandlestickChart from '@/components/CandlestickChart';
import { useCoinGeckoWebSocket } from '@/hooks/useCoinGeckoWebSocket';
import DataTable from '@/components/DataTable';
import { formatCurrency, timeAgo } from '@/lib/utils';
import { useState } from 'react';
import CoinHeader from '@/components/CoinHeader';

    // 3:00:19 now we re ready to fetch realtime data with
    //     coinpulse/components/LiveDataWrapper.tsx
    //it will amke the coin details page feels alive with real time data streaming in
    //without it the page will show an outdated snapshot of the coin data
    //within it to separate the cards nd texts we ll use a shadcn separator component
const LiveDataWrapper = ({ children, //wtver is passed between the tags of the component <> children </>
                                     coinId,
                                     poolId,
                                     coin,
                                     coinOHLCData }: LiveDataProps) => {

    // static chart and reloads only when u reload the screen to smtg that updates in realtime 3:08:50
    // 3:09:10 within the LiveDataWrapper component we ll be using the useCoinGeckoWebSocket hook 
    //     so lets add the additional button to choose the frequency of updates 3:09:08
  const [liveInterval, setLiveInterval] = useState<'1s' | '1m'>('1s');
  //and we will pass it to the useCoinGeckoWebSocket hook and the candlestick chart component 3:10:10

  //3:04:15  display some recent trades for that coin we get access to trades ohlcv and price data from the useCoinGeckoWebSocket hook
  const { trades, ohlcv, price } = useCoinGeckoWebSocket({ coinId, poolId, liveInterval });

//3:05:05 now we can render some of that data within the JSX structure of the component
// -columns for the table where the trades will be rendered
  const tradeColumns: DataTableColumn<Trade>[] = [ //get access to an array of trades
    { //1st column
      header: 'Price',
      cellClassName: 'price-cell',
      cell: (trade) => (trade.price ? formatCurrency(trade.price) : '-'), //data we wana shpw for this column
    },
    {//2nd column
      header: 'Amount',
      cellClassName: 'amount-cell',
      cell: (trade) => trade.amount?.toFixed(4) ?? '-',//data we wana shpw for this column
    },
    {
      header: 'Value',
      cellClassName: 'value-cell',
      cell: (trade) => (trade.value ? formatCurrency(trade.value) : '-'),//data we wana shpw for this column
    },
    {
      header: 'Buy/Sell',
      cellClassName: 'type-cell',
      cell: (trade) => (//data we wana shpw for this column
        <span className={trade.type === 'b' ? 'text-green-500' : 'text-red-500'}>
          {trade.type === 'b' ? 'Buy' : 'Sell'}
        </span>
      ),
    },
    {
      header: 'Time',
      cellClassName: 'time-cell',
      cell: (trade) => (trade.timestamp ? timeAgo(trade.timestamp) : '-'),
    },
  ];

  return ( //JSX 3:02:10
    <section id="live-data-wrapper">

      <CoinHeader //coinpulse/components/CoinHeader.tsx 3:21:10
        name={coin.name}
        image={coin.image.large}
        livePrice={price?.usd ?? coin.market_data.current_price.usd} //price is coming from the web socket directly 3:21:54 - custom hook created
        livePriceChangePercentage24h={ //3:22:10
          price?.change24h ?? coin.market_data.price_change_percentage_24h_in_currency.usd
        }
        priceChangePercentage30d={coin.market_data.price_change_percentage_30d_in_currency.usd} //3:22:40
        priceChange24h={coin.market_data.price_change_24h_in_currency.usd}
        //3:23:10 so now we re passing all the necesseary coin info to the coin header
      />

      <Separator className="divider" />

      <div className="trend">
        <CandlestickChart //3:03:40
          coinId={coinId}
          data={coinOHLCData}
          
          liveOhlcv={ohlcv} //3:10:15
          mode="live"
          initialPeriod="daily"
          liveInterval={liveInterval}
          setLiveInterval={setLiveInterval}
        >
          {/* rendering the children 3:04:06*/}
          <h4>Trend Overview</h4>
        </CandlestickChart>
      </div>

      <Separator className="divider" />

      {tradeColumns && ( //3:05:55 once we hve the trade columns we can reuse our existing datatable component
        <div className="trades">
          <h4>Recent Trades</h4>

          <DataTable 
            columns={tradeColumns}
            data={trades} //array of trades from the webhook useCoinGeckoWebSocket hook
            rowKey={(_, index) => index} //access to whole row and then set the key to the index of the row
            tableClassName="trades-table"
          />
        </div>
      )}
    </section>
  );
};

export default LiveDataWrapper;
