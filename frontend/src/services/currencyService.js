const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080/api/v1";

export const fetchCurrencies = async (currency = 'usd', ids = '', limit = 0) => {
    try {
        let url = `${BASE_URL}/currency?currency=${currency}`;

        if (ids) {
            url += `&ids=${ids}`;
        }

        if (limit > 0) {
            url += `&limit=${limit}`;
        }

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
