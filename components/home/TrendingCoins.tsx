import { fetcher } from '@/lib/coingecko.actions';
import Link from 'next/link';
import Image from 'next/image';
import { cn, formatCurrency, formatPercentage } from '@/lib/utils';
import { TrendingDown, TrendingUp } from 'lucide-react';
import DataTable from '@/components/DataTable';
import { TrendingCoinsFallback } from './fallback';

//  coinpulse/components/DataTable.tsx
//             then import it within ur coinpulse/components/home/TrendingCoins.tsx 29:45 which
//             we will then import into the coinpulse/app/page.tsx
//1:03:22
const TrendingCoins = async () => {
  //53:49 turn this into asyn to call the fetch 
 // - so we can await calls  right here
  let trendingCoins; //extract the trending coings at the top

    //1:13:55 add error handling for the data fetch operations witht he try and catch block- 1:15:25 wrapping the call itslef within a try and catch
  try { //getting the data from the API
    //we ll call the fetcher function we created earlier within the coingecko actions 
    //to fetch the trending coins endpoint  59:15
    trendingCoins = await fetcher<{ coins: TrendingCoin[] }> //define the type of data we re fetching
    //we re expecting an object containing an array of TrendingCoin Type 59:27
            ('/search/trending',//call this endpoint  59:36 
               undefined, //59:39 option parameter we dnt have anything here so undefined
                300 //revalidate every 5 minutes 59:45
              );
  } catch (error) {
    console.error('Error fetching trending coins:', error);
    return <TrendingCoinsFallback />;
  }

  
   //we need to create a format for the data we need to pass in 38:34
  const columns: DataTableColumn<TrendingCoin>[] = [//take in the 
  // trendingCoin coming from types specifically an array = []
  //each specific column will contain a header,..

    {  //1st header- object
      header: 'Name', //name of the coin
      cellClassName: 'name-cell', //cell name
      cell: (coin) => {  //cell info which will be set to a func where we accept info abt the coin
        const item = coin.item; //extract the item we re displaying 39:22

        return ( //39:26 return nt only just the title saying the coin name 
        // but rather will link tot he details page of that coin
          <Link 
            href={`/coins/${item.id}`} //turn ths into dynamic template string 39:45
              > 
            <Image 
                  src={item.large} 
                  alt={item.name} 
                  width={36} 
                  height={36} />
            <p>{item.name}</p>
          </Link>
        );
      },
    },

    { //Add another column 40:25 2nd header-object
      header: '24h Change', //how did the price move within 24hours
      cellClassName: 'change-cell',
      cell: (coin) => { //what will be displayed within that cell 40:36
        //get info abt the coin and open the function bloc
        const item = coin.item; //extract the item 
        //then figure out whether its trending up or down 40:55
          //if >0 => trending up
        const isTrendingUp = item.data.price_change_percentage_24h.usd > 0;

        return ( //all the aboce provides us with info to return a <div> 41:10
          //dispalying the corresponding change 41:16
          <div className={cn('price-change', //general className
             isTrendingUp ? 'text-green-500' : //if trending up
                            'text-red-500')}>

            <p //41:45
              className="flex items-center">
              {formatPercentage(item.data.price_change_percentage_24h.usd)}
              {isTrendingUp ? ( //if trending up 41:52 dispaly an icon coming from lucid react
                <TrendingUp
                    width={16} height={16} />
              ) : (
                <TrendingDown 
                    width={16} height={16} />
              )}
            </p>
          </div>
        );
      },
    },
    { //42:45 3rd Header to show -- another object
      header: 'Price',
      cellClassName: 'price-cell',
      cell: (coin) => formatCurrency(coin.item.data.price), //cell itself whihc gathers info abt a coin
      //and auto return price
    },
  ];

  return (
    <div //1:06:20
      id="trending-coins">
      <h4>Trending Coins</h4>

      <DataTable //38:25 put the table into use 1:04:10

      //we ll need to pass in the data to fill in the columns 36:50
      //we need to create a format for the data we need to pass in
      //43:12 so now its time to feed some data into the table to be able to see it 
      //we re gonna gather tons of data from coingecko API 43:17
      //create a reusbale fetcher function to fetch evg into a super simple way 
        data={trendingCoins.coins.slice(0, 6) || []} 
        //1:06:35 get the first 6 
        // or pass an empty array if we cant fetch them
            
        columns={columns} 
            //35:02 we hve to passs in the column data example:coin header, coin price ...36:00 
        rowKey={(coin) => coin.item.id}
        tableClassName="trending-coins-table"
        headerCellClassName="py-3!" //1:07:46 STYLE IT 
        bodyCellClassName="py-2!"
      />
    </div>
  );
};

export default TrendingCoins;
