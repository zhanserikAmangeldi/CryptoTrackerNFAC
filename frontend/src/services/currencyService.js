import {BASE_URL} from "../utils/Constants";

export const fetchCurrencies = async (currency = 'usd') => {
    try {
        const url = `${BASE_URL}/currency?currency=` + currency;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Failed to fetch currencies: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching currencies:", error);
        throw error;
    }
};

export const createCurrencyLookup = (currencies) => {
    return currencies.reduce((lookup, currency) => {
        lookup[currency.id] = currency;
        return lookup;
    }, {});
};

export const formatCurrency = (amount, currencyCode = 'usd') => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyCode.toUpperCase(),
        currencyDisplay: 'symbol',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
};
