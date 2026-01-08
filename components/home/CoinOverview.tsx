import React from 'react';
import { fetcher } from '@/lib/coingecko.actions';
import Image from 'next/image';
import { formatCurrency } from '@/lib/utils';
import { CoinOverviewFallback } from './fallback';
import CandlestickChart from '@/components/CandlestickChart';

//1:02:48 
const CoinOverview = async () => {
   

  //1:13:55 add error handling for the data fetch operations witht he try and catch block -1:15:25 wrapping the call itslef within a try and catch
  try {
    //getting the data from the API
    //we ll call the fetcher function we created earlier within the coingecko actions 
    //to fetch the trending coins endpoint 54:00
    //also fetch additional data that the coin data details 1:17:50
    //we ll use another endpoint of coingecko API to fetch the OHLC open high low close data of a coin based on a particular ID
    // for the chart 1:17:57 giving us all the data rerquired to create a chart 1:18:14
    //let coin
    //let coinOHLCData
    //we re calling these one after another but instead will call them in // as these 2 pieces of data are independent of each other 1:19:20
    //use of promise.all to run them in parallel 1:19:25
    const [coin, coinOHLCData] = await Promise.all([  //variables declaration here so no need to declare them above
      //pass into it  the 2 funcs - and only when both are done its going to fill the var with data 1:20:00
       //53:49 turn this into asyn to call the fetch 
        // - so we can await calls  right here

      //1-the first Fetcher func we return the coin details object
      fetcher<CoinDetailsData> //define the type of data we re fetching
      ('/coins/bitcoin', { //endpoint 55:20
        dex_pair_format: 'symbol', //additional option object 55:28 
                    // allows us to return back a simple human readable token symbol like BTC for bitcoin
      }),
      //2- the 2nd Fetcher func we return the coinOHLCData object --make another call and get back the coin ohlc data
          //also fetch additional data that the coin data details 1:17:50
          //we ll use another endpoint of coingecko API to fetch the OHLC open high low close data of a coin based on a particular ID
          // for the chart 1:17:57 giving us all the data rerquired to create a chart 1:18:14
      fetcher<OHLCData[]>//define the type of data we re fetching -- an array of those data endpoints
      ('/coins/bitcoin/ohlc', {//endpoint 55:20 1:18:30
        //then provide an object with additional options 1:18:35
        vs_currency: 'usd', //such as versus currency
        days: 1, //by default set to 1
        interval: 'hourly',
        precision: 'full', //1:18:555
      }),
    ]);
      //1:20:14 and now we put the return data directly with the try block
      // - if its successfull go ahead and return this data immediately
      //else return the coinOverview fallback UI
    return (
      <div id="coin-overview">

        <CandlestickChart  //1:20:25 use of the candleStickChart-- and we pass the following as children to the candleStcik chart
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
  } catch (error) { //else return the coinOverview fallback UI
    console.error('Error fetching coin overview:', error);
    
    return <CoinOverviewFallback />;
  }
};

export default CoinOverview;
