import { fetcher } from '@/lib/coingecko.actions';
import Image from 'next/image';
import Link from 'next/link';

import { cn, formatPercentage, formatCurrency } from '@/lib/utils';
import DataTable from '@/components/DataTable';
import CoinsPagination from '@/components/CoinsPagination';

// use the following endpoint https://docs.coingecko.com/v3.0.1/reference/coins-markets  2:04:40
//display the table with pagination

const Coins = async ({ searchParams }: NextPageProps) => {

  //pagination will be handled via search params
  const { page } = await searchParams;

  const currentPage = Number(page) || 1;
  const perPage = 10;//if there is page less then 10 show 10 items per page =>no new pages

  //beginning fetchin the coins data from the coingecko API
  const coinsData = await fetcher<CoinMarketData[]>('/coins/markets', {
    //fetch the coin data array from the /coins/markets endpoint
    vs_currency: 'usd',
    order: 'market_cap_desc',
    per_page: perPage,//pagination handling
    page: currentPage,//pagination handling
    sparkline: 'false',
    price_change_percentage: '24h',
  });

  //once we hve the data we need to structure it into columns and rows
  //structuring the data into an array of columns to be passed into the DataTable component
  const columns: DataTableColumn<CoinMarketData>[] = [
    {
      header: 'Rank',
      cellClassName: 'rank-cell',
      cell: (coin) => (
        <>
          #{coin.market_cap_rank}
          <Link href={`/coins/${coin.id}`} aria-label="View coin" />
        </>
      ),
    },
    {
      header: 'Token',
      cellClassName: 'token-cell',
      cell: (coin) => (
        <div className="token-info">
          <Image src={coin.image} alt={coin.name} width={36} height={36} />
          <p>
            {coin.name} ({coin.symbol.toUpperCase()})
          </p>
        </div>
      ),
    },
    {
      header: 'Price',
      cellClassName: 'price-cell',
      cell: (coin) => formatCurrency(coin.current_price),
    },
    {
      header: '24h Change',
      cellClassName: 'change-cell',
      cell: (coin) => {
        const isTrendingUp = coin.price_change_percentage_24h > 0;

        return (
          <span
            className={cn('change-value', {
              'text-green-600': isTrendingUp,
              'text-red-500': !isTrendingUp,
            })}
          >
            {isTrendingUp && '+'}
            {formatPercentage(coin.price_change_percentage_24h)}
          </span>
        );
      },
    },
    {
      header: 'Market Cap',
      cellClassName: 'market-cap-cell',
      cell: (coin) => formatCurrency(coin.market_cap),
    },
  ];

  //figure out whether there are more pages to show 2:08:00 check whether its = perPage
  const hasMorePages = coinsData.length === perPage;

  //smart navigation that expands as users navigates further, start at 100 pages and then expand by another 100 pages 2:08:25
  //get access to the current page provided by searchparams 
  const estimatedTotalPages = currentPage >= 100 ? Math.ceil(currentPage / 100) * 100 + 100 : 100;//else defaut of 100 or round it to 200,300 etc

  return (
    <main id="coins-page">
      <div className="content">
        <h4>All Coins</h4>

        <DataTable //feeding the data fetched into the table 
          tableClassName="coins-table"
          columns={columns}
          data={coinsData}
          rowKey={(coin) => coin.id}
        />

        <CoinsPagination //2:07:35 using the pagination component created before
          //feed it with props to make it work
          currentPage={currentPage} //2:10:30
          totalPages={estimatedTotalPages}
          hasMorePages={hasMorePages}
        />
      </div>
    </main>
  );
};

export default Coins;
