'use client'; //since we re using the useState and useEffect hooks we have to give a use client directive at the top
///if we try to use a use a custom hook withina. server component we hve to make that component client rendered as well

    // ==>so the coingecko websocket api provides a persistent cnx for realtime data streaming
    // we wont be polling that data every minute or every couple of seconds rather it will be instantly pushed to us whenever there is an update 2:22:50
    // implement it using a custom hook 2:22:55 coinpulse/hooks/useCoinGeckoWebSocket.ts
    //          then use it within the coin details page 2:23:20 coinpulse/app/coins/[id]/page.tsx
    //acts as a single place that manages the socket connection
    //liable for opening the socket, subscribing to the right channels, handling pings, and translating incoming messages into usable data structures/react states
    //every component that needs realtime data can just use this hook and get the latest data without worrying about the underlying socket logic 2:23:35
import { useEffect, useRef, useState } from 'react';

const WS_BASE = `${process.env.NEXT_PUBLIC_COINGECKO_WEBSOCKET_URL}?x_cg_pro_api_key=${process.env.NEXT_PUBLIC_COINGECKO_API_KEY}`;//2:28:10

//2:24:25 -- we re exporting this custom hook to be used whenever and wherever we need to access real and live data from the coingecko websocket api
//first define the types for the hook props and return value 2:24:40
export const useCoinGeckoWebSocket = ({ //accepting a couple of props. 
  coinId,
  poolId,//onchain identifies used for candles and streaming trades
  liveInterval,//how often we want to receive candle updates
}: UseCoinGeckoWebSocketProps)////: the before mentioned type
: UseCoinGeckoWebSocketReturn => {  //define the return type
  //2:25:20 we first need a reference to the websocket instance so that we can send and receive messages
  const wsRef = useRef<WebSocket | null>(null); //<type >initial value

  //2:25:35 we also need to keep track of the channels we are subscribed to so that we dont accidentally subscribe multiple times-prevent duplications
  const subscribed = useRef(<Set<string>>new Set()); //2:25:50

  //create the local state to track the latest snapshot from the sokcet so we can display it in the ui 2:25:58
  //as we are using 3 different endpointds we need 3 different pieces of state to mange the data from each endpoint
  const [price, setPrice] = useState<ExtendedPriceData | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);//local state for rolling list of recent trades 2:26:25
  const [ohlcv, setOhlcv] = useState<OHLCData | null>(null);//for the candlestickchart data 2:26:55

  const [isWsReady, setIsWsReady] = useState(false);//to denote whether the websocket connection is open and ready 2:27:10

  //this useEffect is managing the connection to our socket server  and it is analyzing its responses
  //and providing them to us in nice structured way meaningful react states 
  useEffect(() => {//2:27:18 within which we ll connect to our websocket server
    //we ll actually connecct using a web sokcet based on the WS_BASE url defined @ the top 2:27:30
    const ws = new WebSocket(WS_BASE);
    wsRef.current = ws;//i will assign the newly created websocket instance to the wsRef reference so that we can access it later 2:29:56
 
    //create a: -1- small helper func to send messages to the websocket server 2:30:10 help us send json strings/payloads
    const send = (payload: Record<string, unknown>) => ws.send(JSON.stringify(payload));
     //= callback func accepting a payload of type record<string, unknown> and it will call the websocket.send to sending it after stringifying the data
     //it will serialze the payload into a json string before sending it over the websocket cnx which is part of the server protocol

    //2:30:30 `other helper func -2-  now we need to handle incoming messages from the websocket server 
    // --all sorts of messages will come in based on the channels we re subscribed to
    const handleMessage = (event: MessageEvent) => { //event that comes in of a type message event
      const msg: WebSocketMessage = JSON.parse(event.data);//within it we will get access to a msg of a type websocketmessage by parsing the event.data(which is a json string)

      //we re creating diff source of func blocs for handling diff sorts of msgs based on their type or content 
      //server keep alive ping messages - as long as we re responding we re good-we re keeping the cnx alive 2:31:10
      if (msg.type === 'ping') { //2:31:00 first check if the incoming message is a ping from the server
        send({ type: 'pong' });
        return;
      }
      if (msg.type === 'confirm_subscription') {//create a msg to receive once we successfully subscribe to specifc updates 2:31:17
        const { channel } = JSON.parse(msg?.identifier ?? '');//in that case we wana extract the channel anme from the identifier property of the incoming msg
         
        //then we wana record that this channle is now subscribed within our subscribed ref set so that we dont accidentally subscribe to it again later
        subscribed.current.add(channel);
      }

      ///2:32:06 this is all about the price updates coming from the CGSimplePrice channel
      if (msg.c === 'C1') {
        setPrice({ //with that we re successfully updating the price state with the latest data from the incoming msg
          usd: msg.p ?? 0,//p:usd price 2:32:40
          coin: msg.i,//coin identifier
          price: msg.p,//raw price
          change24h: msg.pp,
          marketCap: msg.m,//market capitalization value
          volume24h: msg.v,//trading volume
          timestamp: msg.t,
        });
      }
      if (msg.c === 'G2') {//here we re getting all trade updates 2:33:27
        const newTrade: Trade = { //structure a new object of type trade -- values from docs https://docs.coingecko.com/websocket/onchaintrade
          price: msg.pu,
          value: msg.vo,
          timestamp: msg.t ?? 0,
          type: msg.ty,//buy or sell
          amount: msg.to,
        };

        setTrades((prev) => //we get the prev access to the previous trades state
             [newTrade, ...prev].slice(0, 7)); //we add the new trade to the front of the array
             //  and then slice it to keep only the latest 7 trades
      }

      if (msg.ch === 'G3') { //2:35:10 data for the chart candles coming from the OnchainOHLCV channel--https://docs.coingecko.com/websocket/wssonchainohlcv
        const timestamp = msg.t ?? 0;

        const candle: OHLCData = [ //build the candle data structure of type OHLCData combined of multiple pieces of data
          timestamp,
          Number(msg.o ?? 0),//open price --Number conversion to ensure numeric values
          Number(msg.h ?? 0), //high--Number conversion to ensure numeric values
          Number(msg.l ?? 0),//low--Number conversion to ensure numeric values
          Number(msg.c ?? 0),//close--Number conversion to ensure numeric values
        ];
          //add the formed candkle to the ohlcv state
        setOhlcv(candle);
      }
    };

    //mark that the socket is ready once the connection is open 2:36:45
    ws.onopen = () => setIsWsReady(true); //a call back func where we set the isWsReady state to true

    //assign the handleMessage func to the onmessage event of the websocket so that 
    // it gets called whenever a new message arrives from the server 2:37:00
    //attache the message handler to incoming events
    ws.onmessage = handleMessage;

    //when the connexion closes we need to update the isWsReady state to false 2:37:15
    ws.onclose = () => setIsWsReady(false);


    ws.onerror = (error) => {//handle any errors that may occur during the websocket cnx
      setIsWsReady(false);
    };


    return () => ws.close();//2:37:25 cleanup func to close the websocket cnx when the component using this hook unmounts

  }, []); //only execute at the start 2:27:20


  useEffect(() => { //2:37:48 subscribe to the created connection - mananing the subscriptions
  //  and request the specific data we want based on the coinId and poolId passed into the hook as props
    if (!isWsReady) return;//1-check whether our websocket is ready

    const ws = wsRef.current; //if its ready we get the current websocket instance from the wsRef reference
    if (!ws) return;

    //helper func to send messages over the websocket cnx 2:38:48
    const send = (payload: Record<string, unknown>) => ws.send(JSON.stringify(payload));

    //create diff funcs to unsubscribe and subscribe to channels 2:39:00
    const unsubscribeAll = () => {
      subscribed.current.forEach((channel) => {
        send({ //send a new message to unsubscribe from each channel currently in the subscribed set
          command: 'unsubscribe',
          identifier: JSON.stringify({ channel }),//2:39:30
        });
      });

      subscribed.current.clear(); //clear the subscribed set to reflect that we re no longer subscribed to any channels 
    };

    //2:39:52 subscribe func accepting a channel name and optional data payload
    const subscribe = (channel: string, data?: Record<string, unknown>) => { //props to know wt to subscribe to
      if (subscribed.current.has(channel)) return;//if this specific channel 
      // is already in the subscribed set we simply return early to prevent duplicate subscriptions

      send({ command: 'subscribe',//send cmd to subscribe to the specified channel
         identifier: JSON.stringify({ channel }) });

      if (data) { //if we also hve some data =>send another request to actually request the specific data we want from that channel 2:40:50
        send({
          command: 'message',
          identifier: JSON.stringify({ channel }),
          data: JSON.stringify(data),
        });
      }
    };

    //2:41:10 now we can use the above subscribe and unsubscribe funcs to manage our subscriptions based on the coinId and poolId
    queueMicrotask(() => {
        //reset the local state after the microtask to avoid displaying stale data while we re subscribing to new channels
        //to avoid mid render updates
        //the ui resets when subscription changes
      setPrice(null);//clearing the price state
      setTrades([]);//setting trades to an empty array - list restarts for a new pool
      setOhlcv(null);//the chart resets for th new pool

      unsubscribeAll();//remove any existing channels subscriptions first before subscribing to new ones 2:41:52

      //subscribe to the CGSimplePrice channel -price updates  for the specified coinId 2:41:58
      subscribe('CGSimplePrice', { coin_id: [coinId], action: 'set_tokens' });
    });

    //2:42:45 recent trades and ohlcv data for the specified poolId
    const poolAddress = poolId.replace('_', ':') ?? '';//replace the underscore with a colon to form the correct onchain identifier format

    if (poolAddress) {//if we have a valid pool address we can subscribe to the other 2 channels OnchainTrade & OnchainOHLCV
      subscribe('OnchainTrade', {
        'network_id:pool_addresses': [poolAddress],//set that to an array of pool addresses
        action: 'set_pools', //set_pools action to get trade updates for the specified pool
      });

      subscribe('OnchainOHLCV', {//candle stick chart data subscription
        'network_id:pool_addresses': [poolAddress],
        interval: liveInterval,//additional piece of data specifying the live interval for the candles
        action: 'set_pools',
      });
    }
  }, [coinId, poolId, isWsReady, liveInterval]); //accepting these dependencies 2:37:55
  //wheneevr these changes we wana recall this use effect 


  //2:44:35 now we hve to return the data in the simplest form possible
  return { //an object including the 
    price,
    trades,
    ohlcv,
    isConnected: isWsReady, //is connected state which is set to isWsReady
  };
};
