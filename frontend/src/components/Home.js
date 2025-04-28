import React from 'react';
import CurrencyTable from "./Crypto/CurrencyTable";

function Home() {
    return (
        <div className="home-container">
            <h1>Welcome to CryptoTracker</h1>

            <div className="currency-section">
                <CurrencyTable />
            </div>
        </div>
    );
}

export default Home;