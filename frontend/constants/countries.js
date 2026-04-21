export const SUPPORTED_COUNTRIES = {
  FR: {
    name: "France",
    currency: "EUR",
    symbol: "€",
    vatRate: 20.0,
    url: "https://dealnbuy.fr",
  },
  ES: {
    name: "Spain",
    currency: "EUR",
    symbol: "€",
    vatRate: 21.0,
    url: "https://dealnbuy.es",
  },
  DE: {
    name: "Germany",
    currency: "EUR",
    symbol: "€",
    vatRate: 19.0,
    url: "https://dealnbuy.de",
  },
  PT: {
    name: "Portugal",
    currency: "EUR",
    symbol: "€",
    vatRate: 23.0,
    url: "https://dealnbuy.pt",
  },
};

export const COUNTRY_LIST = Object.entries(SUPPORTED_COUNTRIES).map(([code, data]) => ({
  code,
  ...data,
}));
