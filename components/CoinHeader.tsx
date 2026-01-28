import { cn, formatCurrency, formatPercentage } from '@/lib/utils';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { TrendingDown, TrendingUp } from 'lucide-react';


//  ## 3:20:20 Coins Details Page - continue part II - rest of the info
//  coin header - convertor - ...
//     coinpulse/components/CoinHeader.tsx 3:21:00
//         import it into the coinpulse/components/LiveDataWrapper.tsx


const CoinHeader = ({ //3:23:20 get access to the props being passed in 
  livePriceChangePercentage24h,
  priceChangePercentage30d,
  name,
  image,
  livePrice,
  priceChange24h,
}: LiveCoinHeaderProps) => {//3:23:45

  //now we hve to create new vars that will help us later on -- color wise
    const isTrendingUp = livePriceChangePercentage24h > 0;
    const isThirtyDayUp = priceChangePercentage30d > 0;
    const isPriceChangeUp = priceChange24h > 0;

    //3:24:25 DISPLAYIN THE DATA  -- format it into the array called stat
  const stats = [ //which contains 3 objects, containing several props each
    {
      label: 'Today', //displaying the today value-price change today
      value: livePriceChangePercentage24h,
      isUp: isTrendingUp,
      formatter: formatPercentage,
      showIcon: true,
    },
    {
      label: '30 Days',
      value: priceChangePercentage30d,
      isUp: isThirtyDayUp,
      formatter: formatPercentage,
      showIcon: true,
    },
    {
      label: 'Price Change (24h)',
      value: priceChange24h,
      isUp: isPriceChangeUp,
      formatter: formatCurrency, //utils 
      showIcon: false,
    },
  ];
      //3:26:00 now we re ready to render it all within JSX
  return (
    <div id="coin-header">
      <h3>{name}</h3>

      <div  //3:26:35
        className="info">
        <Image 
            src={image} alt={name} width={77} height={77} />

        <div className="price-row">
          <h1>{formatCurrency(livePrice)}</h1>
          <Badge //3:27:25 shadcn BADGE RENDERING
            className={cn('badge', isTrendingUp ? 'badge-up' :  //depending on trending up or down
                                                'badge-down')}>
            {formatPercentage(livePriceChangePercentage24h)}
            {isTrendingUp ? <TrendingUp /> : <TrendingDown />}
            (24h)
          </Badge>
        </div>
      </div>

      <ul  //3:29:00 render a ul to show the rest of the stats
        className="stats">
        {stats.map((stat) => ( //get each individual stat
          <li 
            key={stat.label}>
            <p 
              className="label">{stat.label}</p>

            <div
              className={cn('value', {
                'text-green-500': stat.isUp,
                'text-red-500': !stat.isUp, //if stat is nt up 3:30:20
              })}
            >
              <p>{stat.formatter(stat.value)}
                
              </p>
              {stat.showIcon &&
                (stat.isUp ? (
                  <TrendingUp width={16} height={16} />
                ) : (
                  <TrendingDown width={16} height={16} />
                ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
export default CoinHeader;
