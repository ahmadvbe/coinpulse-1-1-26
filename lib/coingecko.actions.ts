'use server';
        // then create the coinpulse/lib/coingecko.actions.ts 46:41s
        //     server file using the use server directive
        //it is gonna be only called from the server 
        //within here we re gonna be implementing 
        // all the data fetching logic for all the diff coingecko API endpoints

import qs from 'query-string'; //stringify our urls 47:07
//stringify a url by connecting together different parts

//get access to our coingecko base URL 47:10 which were already store in the process.env
const BASE_URL = process.env.COINGECKO_BASE_URL;
const API_KEY = process.env.COINGECKO_API_KEY;

//47:45 if we dnt hve access to the base URL we cant do a ntg
//we ll save us if we could nt immediately get it from env variables
if (!BASE_URL) throw new Error('Could not get base url');
if (!API_KEY) throw new Error('Could not get api key'); //48:00

//Most important func responsible for fetching all of our diff endpoints 48:17
//creating an abstration allowing us to mjuch more easily make every single endpoint call 
//throughout the. app
export async function fetcher<T>( //defining the new dynamic type that we ll pass into it 
  //we defined that we re gonna pass a specific type T
      //and when the func is resolved its gonna return that T type
      //we have to define the type at the time we re calling the fetcher func ,
      //  now we define it as generic T
  //depending on wht we re fetching and it will take couple of params
  endpoint: string,//trying to fetch
  params?: QueryParams, //params helping us specific things - optional of type QueryParams
  revalidate = 60, //revalidate it
): Promise<T> { //this func will return a promise bcz we re making an async call
  //and when the func is resolved itss fgonna return that T type

  //1-figure out which url we re trying to call 49:00
  const url = qs.stringifyUrl(//we hve to construct the url - stringify a url by connecting together different parts
    {
      url: `${BASE_URL}/${endpoint}`, //pass the url object that contains the url itself
              //which is gonna be a concatenation of the base url + endpoint we re trying to call
      query: params, //to it we re gonna append diff queries we are the params
      //so actually we re constructing the coingecko 
      // starting part and appending the endpoint as well 49:40
      //and potentially passing some additional params like the ID of our acc
    },
    //49:55 additional options 
    { skipEmptyString: true, //so we dnt hve to manhually remove
                      //  the parameter key if we pass empty values
       skipNull: true 
      },
  );

  //call to the above constructed url 50:10
  const response = await fetch(url, {
    //and pass a few headers 50:26
    //we need these headers to b able to make a valid request
    headers: {
      'x-cg-pro-api-key': API_KEY, //ths param we got from the coingecko api 50:39
      'Content-Type': 'application/json',//as thats how api most commonly communicate
    } as Record<string, string>, //define the types of these headers 50:50
    //it will be record of a type string and string pairs

    //define the next object in the response 50:58s
    next: { revalidate }, //--revalidate the responsse in a specific amount of time
  });

  if (!response.ok) { //51:07 check whether response went ok
    //in that casse we can extract some kind of an error body 51:20
    const errorBody: CoinGeckoErrorBody = await response.json().
    //on this reponse.json  we can chain a catchs that return some info
            catch(() => ({}));

    throw new Error(`API Error: ${response.status}: ${errorBody.error || response.statusText} `);
  }
    //if the response is okay 51:55
  return response.json();
}

export async function getPools( //2:58:50 makes it super eassy to us to have access to most relevant pool for a specific coin
  //2:59:06
  id: string,
  network?: string | null,
  contractAddress?: string | null,
): Promise<PoolData> {
  const fallback: PoolData = { //we fisrt define a fallback of a type pool data 
    //each pool will have an id address name and network starting as empty strings
    id: '',
    address: '',
    name: '',
    network: '',
  };

  if (network && contractAddress) { //then if both exists
    try { //-we can get the pool data by using the fetcher helper func and a corresponding endpoint url giving us access to the pools
      const poolData = await fetcher<{ data: PoolData[] }>(
        `/onchain/networks/${network}/tokens/${contractAddress}/pools`,
      );

      return poolData.data?.[0] ?? fallback; //once we get it we re gonna return the first pool found
    } catch (error) {
      console.log(error);
      return fallback;
    }
  }

  try { //but if we dnt hve them (network && contractAddress) we can try to get the 
  // pool data by just searching '/onchain/search/pools' endpoint and pass the query =id
    const poolData = await fetcher<{ data: PoolData[] }>('/onchain/search/pools', { query: id });

    return poolData.data?.[0] ?? fallback;
  } catch {
    return fallback;
  }
}
