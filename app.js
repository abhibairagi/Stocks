const axios = require('axios');

// Replace with your Dhan API key
const API_KEY = 'YOUR_API_KEY';

// Replace with your stock symbol
const SYMBOL = 'AAPL';

// Replace with your buy price and quantity
const BUY_PRICE = 150;
const QUANTITY = 10;

const BASE_URL = 'https://dhan.apiv2.unidax.com';

// Get the latest 5-minute candlestick data
axios.get(`${BASE_URL}/market/kline?api_key=${API_KEY}&symbol=${SYMBOL}&interval=5min`)
  .then(response => {
    const data = response.data;

    // Get the last candlestick data
    const lastCandle = data[data.length - 1];

    // Get the 5-period exponential moving average (EMA)
    const ema5 = calculateEMA(data, 5);

    // Check if the low of the last candlestick does not touch the 5EMA
    if (lastCandle.low > ema5) {
      console.log('Low of last candlestick does not touch 5EMA');

      // Get the previous candlestick data
      const prevCandle = data[data.length - 2];

      // Check if the low of the current candlestick breaks the low of the previous candlestick
      if (lastCandle.low < prevCandle.low) {
        console.log('Low of current candlestick breaks low of previous candlestick');

        // Place a buy order at the specified price and quantity
        axios.post(`${BASE_URL}/order/buy?api_key=${API_KEY}&symbol=${SYMBOL}&price=${BUY_PRICE}&quantity=${QUANTITY}`)
          .then(response => {
            console.log('Buy order placed');
          })
          .catch(error => {
            console.error('Error placing buy order:', error.response.data);
          });
      } else {
        console.log('Low of current candlestick does not break low of previous candlestick');
      }
    } else {
      console.log('Low of last candlestick touches or crosses 5EMA');
    }
  })
  .catch(error => {
    console.error('Error getting candlestick data:', error.response.data);
  });


  
// Function to calculate the exponential moving average (EMA)
function calculateEMA(data, period) {
  const k = 2 / (period + 1);
  let ema = 0;
  for (let i = data.length - period; i < data.length; i++) {
    const close = data[i].close;
    ema = ema === 0 ? close : (close - ema) * k + ema;
  }
  return ema;
}


// const Run5EMA = setInterval(() =>
// }, 30000);


// const DhanHq = require('dhanhq-api');
// const apiKey = 'YOUR_API_KEY';
// const apiSecret = 'YOUR_API_SECRET';
// const stockSymbol = 'AAPL'; // Replace with the symbol of the stock you are interested in
// const intervalTime = 300000; // 5 minutes in milliseconds
// const sellQty = 1; // Replace with the quantity you want to sell
// const sellPrice = null; // Replace with the price you want to sell at, or null for market price

// const dhanHq = new DhanHq(apiKey, apiSecret);

// dhanHq.connect()
//   .then(() => {rs

//     console.log(`Connected to DhanHq API`);

//     // Subscribe to real-time market data for the stock
//     dhanHq.subscribe(stockSymbol);

//     // Set up interval timer to check candle low and 5EMA value every 5 minutes
//     setInterval(() => {
//       const candles = dhanHq.getCandles(stockSymbol, '5minute');
//       const lastCandle = candles[candles.length - 1];
//       const ema5 = dhanHq.getIndicator(stockSymbol, 'ema', { period: 5 });

//       if (lastCandle.low > ema5 && sellPrice) {
//         // Place a sell order at the specified price
//         dhanHq.placeOrder(stockSymbol, 'sell', sellQty, sellPrice);
//       } else if (lastCandle.low > ema5) {
//         // Place a sell order at market price
//         dhanHq.placeOrder(stockSymbol, 'sell', sellQty);
//       }
//     }, intervalTime);
//   })
//   .catch((err) => {
//     console.error(`Error connecting to DhanHq API: ${err}`);
//   });



//   // Placing Order
//   const orderParams = {
//     symbol: 'BANKNIFTY',
//     expiry: '27-May-2021',
//     optionType: 'CE',
//     strikePrice: 35000,
//     orderType: 'LIMIT',
//     quantity: 1,
//     price: 200
//   };



//   API for Placing Order
// const request = require('request');

// const apiKey = '<Your-API-Key>';
// const exchangeSegment = 'NFO';
// const exchangeInstrument = 'BANKNIFTY21APRFUT';
// const transactionType = 'B';
// const quantity = 1;
// const price = 35000;
// const orderType = 'L';
// const orderValidity = 'DAY';
// const disclosedQuantity = '';

// const url = `https://apis.dhan.com/quotes-api/index.php/api/placeOrder/${encodeURIComponent(apiKey)}/${encodeURIComponent(exchangeSegment)}/${encodeURIComponent(exchangeInstrument)}/${encodeURIComponent(transactionType)}/${encodeURIComponent(quantity)}/${encodeURIComponent(price)}/${encodeURIComponent(orderType)}/${encodeURIComponent(orderValidity)}/${encodeURIComponent(disclosedQuantity)}`;

// const options = {
//     method: 'POST',
//     url: url,
//     headers: {
//         'Content-Type': 'application/json'
//     },
//     body: JSON.stringify({})
// };

// request(options, function (error, response, body) {
//     if (error) throw new Error(error);
//     console.log(body);
// });
