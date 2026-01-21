'use client';

//  13:19 coinpulse/components/Header.tsx 14:13
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const Header = () => {
  //figure out which coin is currently active 17:15
            //we hve to use browser url functionalities to get the current path
            //next js pages are by default sserver side rendered 
            // which means they dnt hve access to the url
            //we add use client directive at the top to make this component a client component
  const pathname = usePathname(); //17:40

  return (
    <header>
      <div className="main-container inner">
        <Link  //15:00
          href="/">
          <Image  //display our logo
            src="/logo.svg" 
            alt="CoinPulse logo" 
            width={132}
            height={40} />
        </Link>

        <nav //16:45
          >
          <Link
            href="/"//figure out which coin is currently active 17:15
            //we hve to use browser url functionalities to get the current path
            //next js pages are by default sserver side rendered 
            // which means they dnt hve access to the url
            className={cn('nav-link', {//17:50 put dynamic links
              'is-active': pathname === '/',//dynamically apply the is-active class
              //  only if pathname / if we re on the home page
              'is-home': true, //also apply the is-home classname 
            })}
          >
            Home
          </Link>

          <p>Search Modal</p>

          <Link 
            href="/coins" //figure out which coin is currently active 17:15
            //we hve to use browser url functionalities to get the current path
            //next js pages are by default sserver side rendered 
            // which means they dnt hve access to the url
            className={cn('nav-link', { 
              'is-active': pathname === '/coins', //dynamically apply the is-active class
              //  only if pathname / if we re on the coins page
            })}
          >
            All Coins
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
