const ERROR_MESSAGE_WS = 'INVALID_SUB';
const API_KEY =
  '1ed93fceb5103274f9a0abe0ec4f2581fa40bbd4686bcddc6c0747e8454acaa2';
const AGGREGATE_INDEX_WS = '5';
const ERROR_TYPE_WS = '500';

const URL_WSS = `wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`;
const socket = new WebSocket(URL_WSS);

let ports = [];

const getFromWS = (cb) => {
  socket.onmessage = (event) => {
    const {
      TYPE: type,
      PRICE: price,
      FROMSYMBOL: ticker,
      MESSAGE: message,
      PARAMETER: query,
    } = JSON.parse(event.data);

    if (type === AGGREGATE_INDEX_WS && price) {
      cb({ ticker, price });
    }

    if (type === ERROR_TYPE_WS && message === ERROR_MESSAGE_WS) {
      const failedTicker = query.split('~')[2];
      cb({ ticker: failedTicker, price: ERROR_MESSAGE_WS });
    }
  };
};

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

self.onconnect = (e) => {
  const port = e.ports[0];
  ports.push(port);

  port.onmessage = (e) => {
    sendToWS(e.data);
    getFromWS((res) => {
      ports.forEach((port) => {
        port.postMessage(res);
      });
    });
  };
};
