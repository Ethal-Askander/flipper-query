const express = require('express');
const app = express();          // For API
const cors = require('cors');   // To enable Cross-origin resource sharing (allows react to call this)
const path = require('path');   // For getting local files
const axios = require('axios'); // For getting the exchange rate from an external API

app.use(express.static(path.join(__dirname, 'build'))); // Links html and css
app.use(cors())

const StockXAPI = require('stockx-api');
const stockX = new StockXAPI({
    currency: 'AUD'
});
const BASE_STOCKX_URL = 'https://stockx.com/'

// For currency conversion
async function exchangeRate(base, local) {
    const apiKey = '4b54c0cab5cfad853963';  // API key for the website https://free.currencyconverterapi.com/
    return await axios.get(`http://free.currencyconverterapi.com/api/v6/convert?q=${base}_${local}&compact=ultra&apiKey=${apiKey}`)
        .then(res => {
            // Getting the exchange rate from the returning JSON.
            const rateKey = Object.keys(res.data);
            const rate = res.data[rateKey];
            return rate;
        })
        .catch(err => {
            console.log(err);
            return 'Something went wrong...';
        });
}

// Scrapes StockX and returns items according to search parameter
async function scrapeProducts(query, number = undefined) {
    let res = [];

    //Obtains product details
    await stockX.newSearchProducts(query, {
        limit: number
    })
    .then(products => {
        products.forEach(product => {
            const details = {
                brand: product.brand,
                name: product.name,
                retailPrice: product.searchable_traits["Retail Price"],
                highestBid: product.highest_bid,
                releaseDate: product.release_date,
                thumbnail_url: product.thumbnail_url,
                url: BASE_STOCKX_URL + product.url
            };
            res.push(details);
        });
    })
    .catch(err => console.log(`Error searching: ${err.message}`));

    return res;
}

//Front page
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Ping server
app.get('/ping', function (req, res) {
    // exchangeRate('USD', 'AUD')
    //     .then(out => {
    //         console.log(out);
    //         return res.status(200).send(out + '');
    //     })
    //     .catch(err => {
    //         console.log(err);
    //     });

    res.status(200).send('pong!');
});

// Obtaining query request
app.get('/search', function (req, res) {
    // Check search query parameter
    if (!req.query.q) {
        // 400 = Bad Request
        return res.status(400).send('Requires query value');
    }

    // Conduct search
    const query = req.query.q;
    const number = req.query.n;
    scrapeProducts(query, number).then(out => {
        res.status(200);
        // res.send(out);
        const options = {
            headers: {
                'products': JSON.stringify(out)
            }
          };
        res.sendFile(path.join(__dirname, 'build', 'index.html'), options, (err) => {
            res.status(403);
            res.send(err);
        })
    }).catch(err => {
        res.status(403);
        res.send(err);
    });
});

// Will use either the environment variable PORT or other
const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Listening on port ${port}... open with http://localhost:${port}`));

// Open new window
const open = require('open');
// open(`http://localhost:${port}`);