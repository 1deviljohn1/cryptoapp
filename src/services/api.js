const API_KEY =
  '1ed93fceb5103274f9a0abe0ec4f2581fa40bbd4686bcddc6c0747e8454acaa2';
const AGGREGATE_INDEX_WS = '5';
const ERROR_TYPE_WS = '500';
const ERROR_MESSAGE_WS = 'INVALID_SUB';
const URL_COINLIST =
  'https://min-api.cryptocompare.com/data/all/coinlist?summary=true';
const URL_WSS = `wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`;
const tickersHandlers = {};

const socket = new WebSocket(URL_WSS);

socket.addEventListener('message', (event) => {
  const {
    TYPE: type,
    PRICE: price,
    FROMSYMBOL: ticker,
    MESSAGE: message,
    PARAMETER: query,
  } = JSON.parse(event.data);

  if (type === AGGREGATE_INDEX_WS && price) {
    tickersHandlers[ticker](price);
  }

  if (type === ERROR_TYPE_WS && message === ERROR_MESSAGE_WS) {
    const failedTicker = query.split('~')[2];
    tickersHandlers[failedTicker](message);
  }
});

const sendToWS = (message) => {
  const stringifiedMessage = JSON.stringify(message);

  if (socket.readyState === WebSocket.OPEN) {
    socket.send(stringifiedMessage);
    return;
  }

  socket.addEventListener(
    'open',
    () => {
      socket.send(stringifiedMessage);
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
  tickersHandlers[ticker] = cb;

  sendToWS({
    action: 'SubAdd',
    subs: [`${AGGREGATE_INDEX_WS}~CCCAGG~${ticker}~USD`],
  });
};

const unsubscribeFromTicker = (ticker) => {
  delete tickersHandlers[ticker];

  sendToWS({
    action: 'SubRemove',
    subs: [`5~CCCAGG~${ticker}~USD`],
  });
};

export {
  fetchCoinList,
  subscribeToTickerUpdate,
  unsubscribeFromTicker,
  ERROR_MESSAGE_WS,
};
