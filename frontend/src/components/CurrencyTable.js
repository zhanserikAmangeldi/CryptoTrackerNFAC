import React, {useEffect, useState} from 'react';

function CurrencyTable() {
    const [currencies, setCurrencies] = useState([]);

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

    return (
        <div>
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
                    currencies.map((currency) => {
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
        </div>
    );
}

export default CurrencyTable;