'use client';
//display a client side rendered chart 1:22:40


//  1:17:15 coinpulse/components/CandlestickChart.tsx
//                 we ll reuse thie chart wherever we hve to show some market data in a chart format
//but since this has to be used on the client side only and has to be rendered that way
//we ll pass server components such as the coinpulse/components/home/CoinOverview.tsx and coinpulse/components/home/TrendingCoins.tsx
//as its children keeping the data server side rendered and only rendering the chart on the client side 
//1:21:40 implementing the candleStickChart
import { useEffect, useRef, useState, useTransition } from 'react';
import {
  getCandlestickConfig,
  getChartConfig,
  LIVE_INTERVAL_BUTTONS,
  PERIOD_BUTTONS,
  PERIOD_CONFIG,
} from '@/constants';
import { CandlestickSeries, createChart, IChartApi, ISeriesApi } from 'lightweight-charts';
import { fetcher } from '@/lib/coingecko.actions';
import { convertOHLCData } from '@/lib/utils';

const CandlestickChart = ({ //destruct the children 
  children,
  data,// as well as the additonal data we re passing over into the chart
  coinId,
  height = 360, //chart we wana dispaly 1:22:20
  initialPeriod = 'daily', //by default set to daily
  liveOhlcv = null,
  mode = 'historical',
  liveInterval,
  setLiveInterval,
}: CandlestickChartProps) => { //of a type CandlestickChartProps

      //1st ref: to the DOM element that will host the chart
      const chartContainerRef = useRef<HTMLDivElement | null>(null); //1:29:08 type HTMLDivElement
                //we also need a couple of other ref to 
                // be able to display the chart properly 1:29:38
      
      //2nd ref: a ref to store the chart instance accross the renders 1:29:48
      const chartRef = useRef<IChartApi | null>(null);

      //3rd ref: a ref to track the instance of the candleStick Series 1:30:15 
      const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> //<> type of the chart
                                  | null>(null);


  const prevOhlcDataLength = useRef<number>(data?.length || 0);

  const [period, setPeriod] = useState(initialPeriod); //1:27:35 the period will be a state that we should keep track off-daily by default

  const [ohlcData, setOhlcData] = useState<OHLCData[]>(data ?? []);//1:30:55 refetch the data for the chart whenever the period changes
  //data of a type <ohlcData[]> an array of those data points
  //will initialize it as the data that we receive through props 1:31:18 and then if it changes we can actually accomodate for those changes

  const [isPending, startTransition] = useTransition(); //isPending to check whether the data are being loaded  1:24:10 1:45:27
  //1:34:05 new react hook that transition the state byt keep the UI responsive during async updates


    //if the period changes we can actually accomodate for those changes and update the data 1:31:30
  const fetchOHLCData = async (selectedPeriod: Period) => {
    try {
        //auto destruct 
      const { days, interval } = PERIOD_CONFIG[selectedPeriod];//1:32:12 first get access to the selected period
      //we created this object PERIOD-CONFIG @ constants from which we can then extract the proper config struct

      const newData = await fetcher<OHLCData[]> //1:32:50 fecth data
      (`/coins/${coinId}/ohlc`, //endpoint
        { //object containing additional options
        vs_currency: 'usd',
        days, //dynamic coming from the destructed value above  1:33:10
        interval,//dynamic coming from the destructed value above  1:33:30
        precision: 'full',
      });

      startTransition(() => { //1:34:05 new react hook that transition the state byt keep the UI responsive during async updates
        // and we started the transition  1:34:40
        setOhlcData(newData ?? []); //if the data changes update the ohlcData 1:33:40 and if it doesnt exist set it to an empty array
      });
    } catch (e) {
      console.error('Failed to fetch OHLCData', e);//1:33:50
    }
  };

  //know which button is currenlty active 1:26:55
  const handlePeriodChange = (newPeriod: Period) => {//accepting a newPeriod
    if (newPeriod === period) return; //if the newperiod hasnt changed dnt do antg 1:27:17

    setPeriod(newPeriod); //else update the period - be able to swap the periods -- we hve set the period here
    fetchOHLCData(newPeriod); // and we started the transition  1:34:40 fetching the data 1:34:56
  };

  useEffect(() => { //take the data and actually append it to the chart 1:35:09

    //the way u feed the data into the chart is 
    //u 1st get the container - chart container node
    const container = chartContainerRef.current;
    if (!container) return;//if there is no container we simply exit out of the useEffect

    //else decide we need to decide whether to show time labels based on the period 1:35:45
    const showTime = ['daily', 'weekly', 'monthly'].includes(period);

    //with that we re ready to create the chart 1:36:01
    const chart = createChart(
      container, //where to create the chart
       { //then some potential options
      ...getChartConfig(height, showTime), //such as spreading the getchartconfig
      width: container.clientWidth, //so it takes the full width of the container 1:36:30
    });

    //we can now only see the container of the chart but ntg within it yet 1:36:36
    // now we have top add a series of candleStciks - data points
    const series = chart.addSeries(CandlestickSeries,
                                   getCandlestickConfig());

      
    const convertedToSeconds = ohlcData.map( //1:46:25 convert to seconds
      (item) => [Math.floor(item[0] / 1000), item[1], item[2], item[3], item[4]] as OHLCData,
    );

      //convert and set the initial data into the series 1:37:08 but the format that data is within is not gonna work
      //we hve to make it work specifically for the chart 1:37:30
    series.setData(convertOHLCData(convertedToSeconds));//1:38:18

    //1:38:40 make it fir initially in the whole screen of the chart
    chart.timeScale().fitContent();

    chartRef.current = chart;//now we can store this chart instance in red for later updates 1:39:03 for later updates or cleanups
    candleSeriesRef.current = series; //do the same thing with the series 1:39:12

    //1:39:22 manually handle the observer for resizing
    const observer = new ResizeObserver((entries) => { ///taking the resizing entries and whenever smtg happens its gonna resize the chart 1:39:35
      if (!entries.length) return;
      //but if the width of the container changes  1:39:44 we also have to apply the change of the width to the chart
      chart.applyOptions({ width: entries[0].contentRect.width }); //dynamically see the change in the width
    });
    //use this observer  1:40:18
    observer.observe(container); //we are observing the changes within the container keeping track of the chart


    //clean evg up at the end 1:40:43
    return () => {
      observer.disconnect();
      chart.remove(); //destroying the chart instance to prevent memory leaks
      chartRef.current = null;
      candleSeriesRef.current = null;
    };
  }, [height, period]); //if the height changes we can reposition it  1:35:24 1:45:55
         

  //// -- we have to make this charts work with diff periods also 1:41:08
  useEffect(() => {
    if (!candleSeriesRef.current) return;//1:41:26 if there is no candleSeriesref right now=>the chart hasnt been initialized yet
    //in that case we cant modify the data 
    //else 1:41:37
    const convertedToSeconds = ohlcData.map( //get each individual item of data
      //and for each one we return an array where we can provide all the diff datsa points that a candle Stick needs 1:41:54
      (item) => [Math.floor(item[0] / 1000),
       item[1], //open price of that item/candle
        item[2], //high price of the item/candle
         item[3], //low price of the item/candle
         item[4]] as OHLCData,  ////close price of the candle-- as OHLC data to make TS happy 1:42:35
    );

    //1:43:18 convertedToSeconds complains bcz of having an array within an array- we wana have one array

    let merged: OHLCData[];

    if (liveOhlcv) {
      const liveTimestamp = liveOhlcv[0];

      const lastHistoricalCandle = convertedToSeconds[convertedToSeconds.length - 1];

      if (lastHistoricalCandle && lastHistoricalCandle[0] === liveTimestamp) {
        merged = [...convertedToSeconds.slice(0, -1), liveOhlcv];
      } else {
        merged = [...convertedToSeconds, liveOhlcv];
      }
    } else {
      merged = convertedToSeconds;
    } 

    merged.sort((a, b) => a[0] - b[0]);

    const converted = convertOHLCData(merged); //once we get the above data  1:42:42
    candleSeriesRef.current.setData(converted);// 1:42:50 then re update the candleSeries Ref

    const dataChanged = prevOhlcDataLength.current !== ohlcData.length;

    if (dataChanged || mode === 'historical') {
      chartRef.current?.timeScale().fitContent(); //and we wana update the chart to refit the content 1:43:00
      prevOhlcDataLength.current = ohlcData.length;
    }
  }, [ohlcData, period, liveOhlcv, mode]); //this time it has to react on the ohlc 
  // data provided that will be modified depending on the period to be clicked on  1:41:18

  return ( //1:22:50 Create the JSX for the chart
    <div //1:21:50
      id="candlestick-chart">
      <div 
        className="chart-header">
        <div //and here we re gonna render the children that we re passing over as props 1:22:00
          className="flex-1">{children}</div>

        <div //1:22:58 keep track of different buttons for the 
             // periods that we want to manipulate our charts to show the data for
          className="button-group">
          <span 
            className="text-sm mx-2 font-medium text-purple-100/50">
              Period:</span>
          {PERIOD_BUTTONS.map(({ value, label }) => ( //show the buttons 1:23:35 stored within the coinpulse/constants.ts 1:24:38
          //  1:26:09 map over the buttons - get each ind button from which we destruct the value and the label
            <button 
              key={value}
              className={period === value ? 'config-button-active' : //whether its active or not - if period state is = value that is selected 1:28:00
                                            'config-button'} 
              onClick={() => handlePeriodChange(value)} //trigger the period change-passing thevalue that we wana change to 1:28:14
              disabled={isPending} //if we re loading the data for that specific period we wana set it to disabled --if we re currenlty loading
            >
              {label}
            </button>
          ))}
        </div>

        {liveInterval && (
          <div  
           className="button-group">
            <span className="text-sm mx-2 font-medium text-purple-100/50">Update Frequency:</span>
            {LIVE_INTERVAL_BUTTONS.map(({ value, label }) => (
              <button
                key={value}
                className={liveInterval === value ? 'config-button-active' : 'config-button'}
                onClick={() => setLiveInterval && setLiveInterval(value)}
                disabled={isPending}//use isPending instead of isLoading- loading state is never updated use isPending instead 1:45:30
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div //1:28:45 insert the chart
        ref={chartContainerRef} //to b able to do that we should give it a reference 1:28:54 - lets create this const above 1:29:07
        className="chart" 
        style={{ height }} 
        />
    </div>
  );
};

export default CandlestickChart;
