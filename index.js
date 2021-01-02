const express = require('express');
const app = express();          // For API
const cors = require('cors');   // To enable Cross-origin resource sharing (allows react to call this)

app.use(cors())

const StockXAPI = require('stockx-api');
const stockX = new StockXAPI({
    currency: 'AUD'
});
const BASE_STOCKX_URL = 'https://stockx.com/'

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

const path = require('path');   // For getting local files
app.set('index', path.join(__dirname, 'build', 'index.html'));
app.use(express.static(path.join(__dirname, 'build')));
//Front page
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Ping server
app.get('/ping', function (req, res) {
    return res.send('pong');
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
        res.send(out);
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
// open(`http://localhost:${port}`)