const fetchTickersFromLS = () => {
  let localstorageData = [];

  if (localStorage.getItem('cryptoapp')) {
    localstorageData = JSON.parse(localStorage.getItem('cryptoapp'));
  }

  return localstorageData;
};

export { fetchTickersFromLS };
