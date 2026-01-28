import React from 'react';
import { fetcher, getPools } from '@/lib/coingecko.actions';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import LiveDataWrapper from '@/components/LiveDataWrapper';
import Converter from '@/components/Converter';

    // create a new route for a dynamic ID coinpulse/app/coins/[id]/page.tsx    2:45:40
    // To figure out to which coin we re displaying the details for =>Next js provides us with params object 2:46:10
    //             { params }: NextPageProps

const Page = async ({ params }: NextPageProps) => { //those params include the dynamic segment id which is gonna get populated by the URL
  //we can extract that id by saying the following: 2:46:35
  const { id } = await params;

  //this will now allow us very easily to access to coin details for the specific coin based on the id in the URL 2:46:55
  //before we made 2 calls one after another but instead we will wrap them into a promise.all so the calls are made in parallel 2:56:10
  const [coinData, coinOHLCData] = await Promise.all([
    fetcher<CoinDetailsData>(`/coins/${id}`, { //2:47:13 endpoint url
      dex_pair_format: 'contract_address',
    }),
    fetcher<OHLCData>(`/coins/${id}/ohlc`, { //2:55:15 data to stream in - data for the candle stick chart --endpoint url
      //additional options for the ohlc data fetch
      vs_currency: 'usd',
      days: 1,
      interval: 'hourly',
      precision: 'full',
    }),
  ]);

  //CREATION OF VARIABLES THAT HELP US EXTRACT WHAT WE NEED 2:56:54
  const platform = coinData.asset_platform_id
    ? coinData.detail_platforms?.[coinData.asset_platform_id] //DESTRUCTURE WITHIN AN ARRAY TO GET THE PLATFORM DATA
    : null; //THE PLATFORM WOULD BE SET TO NULL IF WE DONT HAVE AN ASSET PLATFORM ID

    //2:57:30 EXTRACT THE NETWORK AND CONTRACT ADDRESS FROM THE PLATFORM DATA
  const network = platform?.geckoterminal_url.split('/')[3] || null;
  const contractAddress = platform?.contract_address || null;

  //2:58:05 WE CAN NOW USE THESE VARIABLES TO GET THE POOL DATA - IN CRYPTOS A POOL IS A LIQUIDITY POOL
  //  - WE NEED TO FIND THE BEST CRYPTO EXCHANGE LISTING FOR THIS COIN - THE BEST TRADING POOL FOR EACH COIN--
  //SO THE LIVE DATA CAN CONNECT TO UR REAL MARKET - A POOL IS A TRADING MARKET OF A TOKEN ON A DECENTRALIZED EXCHANGE
  //EXAMPLE TOKEN BTC/USD THATS ONE PAIR - WE NEED TO FIND THE BEST POOL FOR THE COIN WE RE DISPLAYING
  //THE POOL ESSENTIALLY IDENTIFIES WHICH MARKET THE APP SHOULD SUBSCRIBE TO FOR REALTIME UPDATES/TO STREAM THE LIVE DATA FROM
  const pool = await getPools(id, network, contractAddress); //2:58:50 3:00:05 getPools() makes it super eassy to us to have access to most relevant pool for a specific coin

  const coinDetails = [ //only extract the details needed from the coin data object 2:49:05
    //array of objects with label and value properties
    {
      label: 'Market Cap',
      value: formatCurrency(coinData.market_data.market_cap.usd), //formatting the coin detials data 2:52:47
    },
    {
      label: 'Market Cap Rank',
      value: `# ${coinData.market_cap_rank}`,
    },
    {
      label: 'Total Volume',
      value: formatCurrency(coinData.market_data.total_volume.usd),
    },
    {
      label: 'Website',
      value: '-',
      link: coinData.links.homepage[0],
      linkText: 'Homepage',
    },
    {
      label: 'Explorer',
      value: '-',
      link: coinData.links.blockchain_site[0],
      linkText: 'Explorer',
    },
    {
      label: 'Community',
      value: '-',
      link: coinData.links.subreddit_url,
      linkText: 'Community',
    },
  ];

  //here we create a JXS structure to be able to show all that data 2:47:33
  //structure the data into a main tag with 2 sections primary and secondary
  //in a good way to display the exchange listings and coin details
  return (
    <main 
        id="coin-details-page">
      <section className="primary">
        <LiveDataWrapper  // 3:00:19 now we re ready to fetch realtime data with the LiveDataWrapper component
          coinId={id} 
          poolId={pool.id}  
          coin={coinData} 
          coinOHLCData={coinOHLCData}>
          <h4>Exchange Listings</h4>
        </LiveDataWrapper>
      </section>

      <section  //2:48:40
          className="secondary">
        <Converter //3:33:30 import ut here
          symbol={coinData.symbol} //3:33:50
          icon={coinData.image.small}
          priceList={coinData.market_data.current_price}
        />

        <div className="details">
          <h4>Coin Details</h4>

          <ul className="details-grid">
            {coinDetails. //properly map over the data to be able to display it 2:49:49
                map(({ label, value, link, linkText }, index) => (
              <li //auto return a li for each of the above values
                key={index}>
                <p 
                  className={label}>{label}
                  </p>

                {link ? ( //if we hve a link =>isplay a <div> else a <p> tag rendering the value 2:51:00
                  <div className="link">
                    <Link href={link} target="_blank">
                      {linkText || label}
                    </Link>
                    <ArrowUpRight  //lucid icon to knwo this is clickable link
                      size={16} />
                  </div>
                ) : (
                  <p className="text-base font-medium">{value}</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
};
export default Page;
