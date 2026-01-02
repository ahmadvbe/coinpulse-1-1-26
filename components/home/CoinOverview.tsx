import React from 'react';
import { fetcher } from '@/lib/coingecko.actions';
import Image from 'next/image';
import { formatCurrency } from '@/lib/utils';
import { CoinOverviewFallback } from './fallback';
import CandlestickChart from '@/components/CandlestickChart';

//1:02:48 
const CoinOverview = async () => {
    //53:49 turn this into asyn to call the fetch 
  // - so we can await calls  right here
  try {
    //getting the data from the API
    //we ll call the fetcher function we created earlier within the coingecko actions 
    //to fetch the trending coins endpoint 54:00
    const [coin, coinOHLCData] = await Promise.all([
      //1-the first Fetcher func we return the coin details object
      fetcher<CoinDetailsData> //define the type of data we re fetching
      ('/coins/bitcoin', { //endpoint 55:20
        dex_pair_format: 'symbol', //additional option object 55:28 
                    // allows us to return back a simple human readable token symbol like BTC for bitcoin
      }),
      //2- the 2nd Fetcher func we return the coinOHLCData object
      fetcher<OHLCData[]>//define the type of data we re fetching
      ('/coins/bitcoin/ohlc', {//endpoint 55:20
        vs_currency: 'usd',
        days: 1,
        interval: 'hourly',
        precision: 'full',
      }),
    ]);

    return (
      <div id="coin-overview">
        <CandlestickChart 
          data={coinOHLCData} 
          coinId="bitcoin">
          <div //26:50
          className="header pt-2">
            <Image //56:20
              src={coin.image.large} 
              alt={coin.name} 
              width={56} 
              height={56} />
              
            <div //27:50
              className="info">
              <p>
                {/* 56:40 */}
                {coin.name} / {coin.symbol.toUpperCase()} 
              </p>
                {/* 57:40 */}
              <h1>{formatCurrency(coin.market_data.current_price.usd)}</h1>
            </div>
          </div>
        </CandlestickChart>
      </div>
    );
  } catch (error) {
    console.error('Error fetching coin overview:', error);
    return <CoinOverviewFallback />;
  }
};

export default CoinOverview;
