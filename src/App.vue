<template>
  <div class="container mx-auto flex flex-col items-center bg-gray-100 p-4">
    <div class="container">
      <section>
        <div class="flex">
          <div class="max-w-xs">
            <label class="block text-sm font-medium text-gray-700">Тикер</label>
            <div class="mt-1 relative rounded-md shadow-md">
              <input
                @keydown.enter="addTicker()"
                v-model.trim="ticker"
                type="text"
                name="ticker"
                class="block w-full pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
                placeholder="Например DOGE"
              />
            </div>
            <div
              v-if="tickersSuggestions.length"
              class="flex bg-white shadow-md p-1 rounded-md shadow-md flex-wrap"
            >
              <span
                v-for="ticker in tickersSuggestions"
                :key="ticker.FullName"
                @click="selectTipTicker(ticker.Symbol)"
                class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer"
              >
                {{ ticker.Symbol }}
              </span>
            </div>
            <div v-if="duplicatedTicker" class="text-sm text-red-600">
              Такой тикер уже добавлен
            </div>
          </div>
        </div>
        <button
          @click="addTicker()"
          type="button"
          class="my-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none"
        >
          <!-- Heroicon name: solid/mail -->
          <svg
            class="-ml-0.5 mr-2 h-6 w-6"
            xmlns="http://www.w3.org/2000/svg"
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="#ffffff"
          >
            <path
              d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7zm-1-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
            ></path>
          </svg>
          Добавить
        </button>
      </section>

      <template v-if="tickers.length">
        <hr class="w-full border-t border-gray-600 my-4" />
        <div class="flex">
          <div class="max-w-xs">
            <label class="block text-sm font-medium text-gray-700"
              >Фильтр</label
            >
            <div class="mt-1 relative rounded-md shadow-md">
              <input
                v-model.trim="filter"
                type="text"
                name="filter"
                class="block w-full pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
              />
            </div>
          </div>
          <button
            :disabled="isFirstPage"
            @click="page--"
            type="button"
            :class="{ 'disabled:opacity-50': isFirstPage }"
            class="ml-4 my-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none"
          >
            Назад
          </button>
          <button
            :disabled="isLastPage"
            @click="page++"
            type="button"
            :class="{ 'disabled:opacity-50': isLastPage }"
            class="ml-4 my-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none"
          >
            Вперед
          </button>
        </div>
      </template>

      <template v-if="paginatedTickers.length">
        <hr class="w-full border-t border-gray-600 my-4" />
        <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div
            v-for="ticker in paginatedTickers"
            :key="ticker.name"
            @click="selectTicker(ticker.name)"
            :class="[
              ticker.name === selectedTicker ? 'border-purple-800' : '',
              failedTickers.includes(ticker.name) ? 'bg-red-100' : 'bg-white',
            ]"
            class="overflow-hidden shadow rounded-lg border-transparent border-solid border-4 cursor-pointer"
          >
            <div class="px-4 py-5 sm:p-6 text-center">
              <dt class="text-sm font-medium text-gray-500 truncate">
                {{ ticker.name }} - USD
              </dt>
              <dd class="mt-1 text-3xl font-semibold text-gray-900">
                {{ ticker.price || '-' }}
              </dd>
            </div>
            <div class="w-full border-t border-gray-200"></div>
            <button
              @click.stop="deleteTicker(ticker.name)"
              class="flex items-center justify-center font-medium w-full bg-gray-100 px-4 py-4 sm:px-6 text-md text-gray-500 hover:text-gray-600 hover:bg-gray-200 hover:opacity-20 transition-all focus:outline-none"
            >
              <svg
                class="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="#718096"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                ></path></svg
              >Удалить
            </button>
          </div>
        </dl>
        <hr class="w-full border-t border-gray-600 my-4" />
      </template>
      <section v-if="selectedTicker" class="relative">
        <h3 class="text-lg leading-6 font-medium text-gray-900 my-8">
          {{ selectedTicker }} - USD
        </h3>
        <div
          ref="graph"
          class="flex items-end border-gray-600 border-b border-l h-64"
        >
          <div
            v-for="(bar, i) in normalizedGraph"
            :key="i"
            :style="{ height: bar + '%', width: graphElemWidth + 'px' }"
            class="bg-purple-800 border"
          ></div>
        </div>
        <button
          @click="deleteGraph"
          type="button"
          class="absolute top-0 right-0"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            xmlns:svgjs="http://svgjs.com/svgjs"
            version="1.1"
            width="30"
            height="30"
            x="0"
            y="0"
            viewBox="0 0 511.76 511.76"
            style="enable-background: new 0 0 512 512"
            xml:space="preserve"
          >
            <g>
              <path
                d="M436.896,74.869c-99.84-99.819-262.208-99.819-362.048,0c-99.797,99.819-99.797,262.229,0,362.048    c49.92,49.899,115.477,74.837,181.035,74.837s131.093-24.939,181.013-74.837C536.715,337.099,536.715,174.688,436.896,74.869z     M361.461,331.317c8.341,8.341,8.341,21.824,0,30.165c-4.16,4.16-9.621,6.251-15.083,6.251c-5.461,0-10.923-2.091-15.083-6.251    l-75.413-75.435l-75.392,75.413c-4.181,4.16-9.643,6.251-15.083,6.251c-5.461,0-10.923-2.091-15.083-6.251    c-8.341-8.341-8.341-21.845,0-30.165l75.392-75.413l-75.413-75.413c-8.341-8.341-8.341-21.845,0-30.165    c8.32-8.341,21.824-8.341,30.165,0l75.413,75.413l75.413-75.413c8.341-8.341,21.824-8.341,30.165,0    c8.341,8.32,8.341,21.824,0,30.165l-75.413,75.413L361.461,331.317z"
                fill="#718096"
                data-original="#000000"
              ></path>
            </g>
          </svg>
        </button>
      </section>
    </div>
  </div>
</template>

<script>
import { fetchTickersFromLS, updateTickersLS } from './services/storage';
import {
  fetchCoinList,
  subscribeToTickerUpdate,
  unsubscribeFromTicker,
  ERROR_MESSAGE_WS,
} from './services/api';

export default {
  name: 'App',

  data() {
    return {
      ticker: '',
      failedTickers: [],
      filter: '',

      page: 1,
      graphElemWidth: 40,
      graphElems: 10,

      selectedTicker: null,

      tickers: [],
      graph: [],
      coinList: [],
    };
  },

  async created() {
    this.coinList = await fetchCoinList();
    this.tickers = fetchTickersFromLS();
    this.fetchUrlParams();

    if (!this.tickers.length) {
      return;
    }

    this.tickers.forEach((ticker) => {
      subscribeToTickerUpdate(ticker.name, (newPrice) => {
        this.updateTicker(ticker.name, newPrice);
      });
    });
  },

  mounted() {
    window.addEventListener('resize', () => {
      if (!this.$refs.graph) {
        return;
      }

      this.graphElems = this.calculateGraphElems();

      if (this.graph.length > this.graphElems) {
        this.graph = this.graph.slice(-this.graphElems);
      }
    });
  },

  computed: {
    normalizedGraph() {
      const min = Math.min(...this.graph);
      const max = Math.max(...this.graph);

      return this.graph.map((price) =>
        min === max ? 100 : 5 + ((price - min) * 95) / (max - min)
      );
    },

    tickersSuggestions() {
      let tipsTickers = [];

      if (this.ticker) {
        tipsTickers = this.coinList
          .filter((t) => {
            return (
              t.FullName.toLowerCase().includes(this.ticker.toLowerCase()) ||
              t.Symbol.toLowerCase().includes(this.ticker.toLowerCase())
            );
          })
          .slice(0, 4);
      }

      return tipsTickers;
    },

    duplicatedTicker() {
      let res = false;

      if (this.tickers.length) {
        res = this.tickers.filter(
          (t) => t.name.toLowerCase() === this.ticker.toLowerCase()
        ).length;
      }

      return res;
    },

    filteredTickers() {
      return this.tickers.filter((t) => {
        return t.name.toLowerCase().includes(this.filter.toLowerCase());
      });
    },

    paginatedTickers() {
      return this.filteredTickers.slice((this.page - 1) * 6, this.page * 6);
    },

    isFirstPage() {
      return this.page === 1;
    },

    isLastPage() {
      return this.filteredTickers.length <= this.page * 6;
    },

    pageParams() {
      return {
        filter: this.filter,
        page: this.page,
      };
    },
  },

  watch: {
    tickers: {
      handler() {
        updateTickersLS(this.tickers);
      },
      deep: true,
    },

    paginatedTickers() {
      if (this.paginatedTickers.length === 0 && this.page > 1) {
        this.page--;
      }
    },

    selectedTicker() {
      this.graph = [];

      if (!this.selectedTicker) {
        return;
      }

      this.$nextTick().then(() => {
        this.graphElems = this.calculateGraphElems();
      });
    },

    pageParams(state) {
      window.history.pushState(
        null,
        document.title,
        `${window.location.pathname}?filter=${state.filter}&page=${state.page}`
      );
    },
  },

  methods: {
    calculateGraphElems() {
      return this.$refs.graph.clientWidth / this.graphElemWidth;
    },

    fetchUrlParams() {
      const params = Object.fromEntries(
        new URL(window.location).searchParams.entries()
      );

      if (params.filter) {
        this.filter = params.filter;
      }

      if (params.page) {
        this.page = parseInt(params.page);
      }
    },

    selectTipTicker(ticker) {
      this.ticker = ticker;
      this.addTicker(ticker);
    },

    addTicker(ticker) {
      const addedTicker = ticker || this.ticker;

      if (!addedTicker || this.duplicatedTicker) {
        return;
      }

      const newTicker = {
        name: addedTicker.toUpperCase(),
        price: '-',
      };

      this.tickers.push(newTicker);
      subscribeToTickerUpdate(newTicker.name, (newPrice) => {
        this.updateTicker(newTicker.name, newPrice);
      });

      this.ticker = '';
    },

    deleteTicker(ticker) {
      this.tickers = this.tickers.filter((t) => t.name !== ticker);
      unsubscribeFromTicker(ticker);

      if (ticker === this.selectedTicker) {
        this.selectedTicker = null;
      }
    },

    selectTicker(ticker) {
      this.selectedTicker = this.selectedTicker === ticker ? null : ticker;
    },

    updateTicker(ticker, price) {
      if (price === ERROR_MESSAGE_WS) {
        this.failedTickers.push(ticker);
      } else {
        this.tickers.find((t) => t.name === ticker).price = price;

        if (ticker === this.selectedTicker) {
          this.graph.push(price);
        }

        if (this.graph.length > this.graphElems) {
          this.graph = this.graph.slice(-this.graphElems);
        }
      }
    },

    deleteGraph() {
      this.selectedTicker = null;
    },
  },
};
</script>
