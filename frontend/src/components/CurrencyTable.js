import React, {useEffect, useState} from 'react';

function CurrencyTable() {
    const [currencies, setCurrencies] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCurrency, setSelectedCurrency] = useState('usd');
    const availableCurrencies = [
        { value: 'usd', label: 'USD' },
        { value: 'eur', label: 'EUR' },
        { value: 'kzt', label: 'KZT' }
    ];

    const makeAPICall = async (currency) => {
        if (currency == null) {
            currency = 'usd'
        }

        const url = 'http://localhost:8080/api/v1/currency'.concat('?currency=', currency);
        console.log(url);
        var response = await fetch(url)

        const data = await response.json();

        setCurrencies(data);
    }

    // TODO: Change in the future to react query
    useEffect(() => {
        makeAPICall();
    }, []);

    const filteredCurrencies = currencies.filter(currency =>
        currency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        currency.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCurrencyChange = (e) => {
        const newCurrency = e.target.value;
        setSelectedCurrency(newCurrency);
        makeAPICall(newCurrency);
    };

    return (
        <div>

            <input
                type="text"
                placeholder="Search by name or symbol..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ marginBottom: '16px', padding: '8px', width: '300px' }}
            />

            <div className="currency-selector">
                <label htmlFor="currency-select">Select Fiat Currency: </label>
                <select
                    id="currency-select"
                    value={selectedCurrency}
                    onChange={handleCurrencyChange}
                >
                    {availableCurrencies.map(currency => (
                        <option key={currency.value} value={currency.value}>
                            {currency.label}
                        </option>
                    ))}
                </select>
            </div>

            <h1>Currency Table</h1>
            <table className="styled-table">
                <thead>
                <tr>
                    <th>Logo</th>
                    <th>Name</th>
                    <th>Symbol</th>
                    <th>Current Price</th>
                    <th>Market Cap.</th>
                    <th>Changes in last 24h</th>
                </tr>
                </thead>
                <tbody>
                {
                    filteredCurrencies.map((currency) => {
                        return (
                            <tr key={currency.id}>
                                <td>
                                    <img src={currency.image} alt={currency.id} width={"36"} height={"36"} />
                                </td>
                                <td>{currency.name}</td>
                                <td>{currency.symbol}</td>
                                <td>{currency.current_price}</td>
                                <td>{currency.market_cap}</td>
                                <td>{currency.price_change_24h.toFixed(3)}</td>
                            </tr>
                        )
                    })
                }
                </tbody>
            </table>
            <style jsx>{`
                .header-container {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }
                
                .currency-selector {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                select {
                    padding: 8px;
                    border-radius: 4px;
                    border: 1px solid #ccc;
                }
            `}</style>
        </div>
    );
}

export default CurrencyTable;