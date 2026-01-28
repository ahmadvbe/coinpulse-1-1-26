'use client'; //use state use

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { formatCurrency } from '@/lib/utils';

//  3:32:40 implementing the convertor
//                 use of shadcn select
//                 use of shadcn input
//                 coinpulse/components/Converter.tsx
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const Converter = ({ symbol, icon, priceList }: ConverterProps) => { //3:34:15 destruct/accept  the props

  //declare a couple of diff states managing the values
  const [currency, setCurrency] = useState('usd'); //currency that we re currenlty viewing the exchange rate for - start it with USD
  const [amount, setAmount] = useState('10'); //amount to be displayed at first

  const convertedPrice = (parseFloat(amount) || 0) * (priceList[currency] || 0); //3:35

  //JSX OF THE CONVERTER 3:35:40
  return (
    <div id="converter">
      <h4>{symbol.toUpperCase()} Converter</h4>

      <div //3:37:54 wrap all of the following into a PANEL - so we can display several inputs within it
        className="panel">
        <div className="input-wrapper">
          <Input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="input"
          />
          <div className="coin-info">
            <Image src={icon} alt={symbol} width={20} height={20} />
            <p>{symbol.toUpperCase()}</p>
          </div>
        </div>

        <div className="divider">
          <div className="line" />

          <Image //3:38:35
            src="/converter.svg" alt="converter" width={32} height={32} className="icon" />
        </div>

        <div //3:39:10
          className="output-wrapper">
          <p>{formatCurrency(convertedPrice, 2, currency, false)}</p>

          <Select //select ur native currency 3:39:50
            value={currency} onValueChange={setCurrency}>
            <SelectTrigger className="select-trigger" value={currency}>
              <SelectValue placeholder="Select" className="select-value">
                {currency.toUpperCase()}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="select-content" data-converter>
              {Object.keys(priceList).map((currencyCode) => (
                <SelectItem value={currencyCode} key={currencyCode} className="select-item">
                  {currencyCode.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
export default Converter;
