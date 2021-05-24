const ERROR_MESSAGE_WS = 'INVALID_SUB';
const AGGREGATE_INDEX_WS = '5';
const URL_COINLIST =
  'https://min-api.cryptocompare.com/data/all/coinlist?summary=true';
const tickersHandlers = {};
let worker;

if (window.SharedWorker) {
  worker = new SharedWorker('./shared-worker.js');
}

worker.port.onmessage = (e) => {
  const { ticker, price } = e.data;
  tickersHandlers[ticker](price);
};

const fetchCoinList = async () => {
  const res = await fetch(URL_COINLIST);
  const coinList = await res.json();
  return Object.values(coinList.Data);
};

const subscribeToTickerUpdate = (ticker, cb) => {
  tickersHandlers[ticker] = cb;

  worker.port.postMessage({
    action: 'SubAdd',
    subs: [`${AGGREGATE_INDEX_WS}~CCCAGG~${ticker}~USD`],
  });
};

const unsubscribeFromTicker = (ticker) => {
  delete tickersHandlers[ticker];

  worker.port.postMessage({
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
