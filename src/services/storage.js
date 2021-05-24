const STORAGE_AREA = 'cryptoapp';

const fetchTickersFromLS = () => {
  let localstorageData = [];

  if (localStorage.getItem(STORAGE_AREA)) {
    localstorageData = JSON.parse(localStorage.getItem(STORAGE_AREA));
  }

  return localstorageData;
};

const updateTickersLS = (tickers) => {
  localStorage.setItem(STORAGE_AREA, JSON.stringify(tickers));
};

export { fetchTickersFromLS, updateTickersLS };
