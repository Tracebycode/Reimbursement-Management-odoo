import { useState, useEffect } from 'react';

const useCurrencyApi = (baseCurrency = 'USD') => {
    const [currencies, setCurrencies] = useState([]);
    const [exchangeRates, setExchangeRates] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCurrencyData = async () => {
            setLoading(true);
            try {
                // 1. Fetch available currencies and countries
                const countryRes = await fetch('https://restcountries.com/v3.1/all?fields=name,currencies');
                const countryData = await countryRes.json();
                
                // Deduplicate and format currencies from restcountries
                const currencyMap = new Map();
                countryData.forEach(country => {
                    if (country.currencies) {
                        Object.keys(country.currencies).forEach(code => {
                            if (!currencyMap.has(code)) {
                                currencyMap.set(code, {
                                    code,
                                    name: country.currencies[code].name,
                                    symbol: country.currencies[code].symbol
                                });
                            }
                        });
                    }
                });
                
                // Convert to array and sort alphabetically
                const currencyList = Array.from(currencyMap.values()).sort((a, b) => a.code.localeCompare(b.code));
                setCurrencies(currencyList);

                // 2. Fetch exchange rates relative to the base currency
                const ratesRes = await fetch(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`);
                const ratesData = await ratesRes.json();
                
                setExchangeRates(ratesData.rates);
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch currency data", err);
                setError(err.message);
                setLoading(false);
            }
        };

        fetchCurrencyData();
    }, [baseCurrency]);

    // Conversion helper
    const convert = (amount, fromCurrency, toCurrency) => {
        if (!exchangeRates[fromCurrency] || !exchangeRates[toCurrency]) return amount;
        
        // Convert to base currency first (USD), then to target
        const amountInBase = amount / exchangeRates[fromCurrency];
        return amountInBase * exchangeRates[toCurrency];
    };

    return { currencies, exchangeRates, loading, error, convert };
};

export default useCurrencyApi;
