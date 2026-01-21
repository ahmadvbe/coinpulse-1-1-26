import React, { Suspense } from 'react';
import CoinOverview from '@/components/home/CoinOverview';
import TrendingCoins from '@/components/home/TrendingCoins';
import {
  CategoriesFallback,
  CoinOverviewFallback,
  TrendingCoinsFallback,
} from '@/components/home/fallback';
import Categories from '@/components/home/Categories';

const Page = async () => { //53:49 turn this into asyn to call the fetch 
                         // - so we can await calls right here
  return (    
    <main //24:50  implementing our home page
    // # 1:09:10 create the FALLBACK UI components for each of the sections on the home page
    // under the element coinpulse/components/home/fallback.tsx
    //     export const CoinOverviewFallback = () 
    //     export const TrendingCoinsFallback = () 
    //1:09:50 update the page.tsx to use the above ccomponets as susepnse fallbacks
      className="main-container">
      <section 
          className="home-grid">
            {/* 1:06:50 put the components within suspense components to use */}

            {/* Rendering the Coins */}
        <Suspense  //1:06:55 Suspense component needs also a fallback
            // then u have to provide a FALLBACK UI
            //  which is gonna be displayed while the data is being fetched in the background
            //  demo version of that page without the data-
            //  then u hev to stream in the data as soon as its ready 1:02:30
             fallback={ //1:09:10 create the FALLBACK UI components for each of the sections on the home page
             <CoinOverviewFallback //these are basically some emopty skeleton UIs with 
             // some styling that replicate the structure 
             //but not data of the website
              />
             }>
          <CoinOverview  //1:07:10 once it loads we wana show the CoinOverview component
            />
        </Suspense>

            {/* Rendering the TRENDING Coins 1:07:18 */}
        <Suspense 
              fallback={//1:09:10 create the FALLBACK UI components for each of the sections on the home page
              <TrendingCoinsFallback //these are basically some empty skeleton UIs with 
             // some styling that replicate the structure 
             //but not data of the website
              />
              }>
          <TrendingCoins />
        </Suspense>

      </section>

      <section //25:26 another section
         className="w-full mt-7 space-y-4">
        <Suspense  //1:50:10 wrap it in a suspense component
            fallback={<CategoriesFallback />} //2:01:20 add a skeleton loader as fallback on loading 
            // --show an empty table waiting for the data to pop up
            >
          <Categories  //1:49:50 Implementing Categories part of our app
              />
        </Suspense>
      </section>
    </main>
  );
};

export default Page;
