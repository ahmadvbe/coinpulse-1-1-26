import { fetcher } from '@/lib/coingecko.actions';
import DataTable from '@/components/DataTable';
import Image from 'next/image';
import { cn, formatCurrency, formatPercentage } from '@/lib/utils';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { CategoriesFallback } from './fallback';

//coinpulse/components/home/Categories.tsx 1:49:50
// develop the Categories component 1:50:28
//                     head to coingecko API 1:50:30
//                         https://docs.coingecko.com/v3.0.1/reference/coins-categories

const Categories = async () => { //make it an assync function
  try {
    //fecth the categories data from the coingecko API 1:51:10
    const categories = await fetcher<Category[]>('/coins/categories'); //use await to wait for the data to be fetched
    //expected to get back an array of diff categories under the url /coins/categories
 
    ////structuring the data into an array of columns to be passed into the DataTable component
    //now we hve to strcuture that data in term of columns, headers and rows/cells to be displayed within the DataTable component 1:51:30
    const columns: DataTableColumn<Category>[] = [ //type and define that as an array where we re gonna have a number of objects 1:52:00
      { header: 'Category', 
        cellClassName: 'category-cell',
        cell: (category) => category.name }, 
         //finally a cell itslef whitin which which we re gonn aget a categorie and we ll return the cat.name
         //this is the first column that we have

      {//add other columns to the table 1:53:08
        header: 'Top Gainers',
        cellClassName: 'top-gainers-cell', //class which should make the images appear one next ot another-flex
        cell: (category) => //1:54:30 directly refer the cojngecko api and see what data we re getting back - the coins images given back
        //reading what the API gives you and put it to use
          category.top_3_coins.map((coin) => (
            <Image src={coin} alt={coin} key={coin} width={28} height={28} />
          )),
      },
      { //1:56:58 3 more additional columns
        
        header: '24h Change',//1:58:05
        cellClassName: 'change-header-cell',
        cell: (category) => {//takes in the cat
          const isTrendingUp = category.market_cap_change_24h > 0;//check whether it is trending up or down 1:59:20

          return ( //turn it into a percentage point and display an icon based on whether its trending up or down 1:58:35
            <div className={cn('change-cell', //1:59:30
                          isTrendingUp ? 'text-green-500' : 'text-red-500')}
            >
              <p className="flex items-center">
                {formatPercentage(category.market_cap_change_24h)}
                {isTrendingUp ? (
                  <TrendingUp width={16} height={16} />
                ) : (
                  <TrendingDown width={16} height={16} />
                )}
              </p>
            </div>
          );
        },
      },
      {
        header: 'Market Cap', //1:57:15
        cellClassName: 'market-cap-cell',
        cell: (category) => formatCurrency(category.market_cap),//utils func
      },
      {
        header: '24h Volume', //1:57:48
        cellClassName: 'volume-cell',
        cell: (category) => formatCurrency(category.volume_24h),
      },
    ];

    return ( //display the table below 1:52:10
      <div id="categories" 
          className="custom-scrollbar" //scoll being able if we re on a smaller device
          >
        <h4>Top Categories</h4>

        <DataTable //reuse of the data table component created before 1:52:35
        //feed all the fetched data into the table
          columns={columns}
          data={categories?.slice(0, 10)} //slice only the first 10 out of it
          rowKey={(_, index) => index}
          tableClassName="mt-3"
        />
      </div>
    );
  } catch (error) {
    console.error('Error fetching categories:', error);
    return <CategoriesFallback />;
  }
};

export default Categories;
