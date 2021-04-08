const API_KEY =
  '1ed93fceb5103274f9a0abe0ec4f2581fa40bbd4686bcddc6c0747e8454acaa2';
const AGGREGATE_INDEX_WS = '5';
const URL_COINLIST =
  'https://min-api.cryptocompare.com/data/all/coinlist?summary=true';
const URL_WSS = `wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`;

const socket = new WebSocket(URL_WSS);

const sendToWS = (message) => {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(message);
    return;
  }

  socket.addEventListener(
    'open',
    () => {
      socket.send(message);
    },
    { once: true }
  );
};

const fetchCoinList = async () => {
  const res = await fetch(URL_COINLIST);
  const coinList = await res.json();
  return Object.values(coinList.Data);
};

const subscribeToTickerUpdate = (ticker, cb) => {
  const subscription = {
    action: 'SubAdd',
    subs: [`${AGGREGATE_INDEX_WS}~CCCAGG~${ticker}~USD`],
  };

  sendToWS(JSON.stringify(subscription));

  socket.addEventListener('message', (event) => {
    const data = JSON.parse(event.data);
    if (data.FROMSYMBOL === ticker && data.PRICE) {
      cb(data.PRICE);
    }
  });
};

const unsubscribeFromTicker = (ticker) => {
  const unsubscribe = {
    action: 'SubRemove',
    subs: [`5~CCCAGG~${ticker}~USD`],
  };

  sendToWS(JSON.stringify(unsubscribe));
};

export { fetchCoinList, subscribeToTickerUpdate, unsubscribeFromTicker };
