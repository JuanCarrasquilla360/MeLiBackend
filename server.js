const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(express.static('public'));
app.use(cors());

app.options('/items', cors());

app.get('/items', async (req, res, next) => {
    try {
        const query = req.query.q;
        const response = await axios.get(`https://api.mercadolibre.com/sites/MLA/search?q=${query}`);
        const items = response.data.results.slice(0, 4).map((item) => ({
            id: item.id,
            title: item.title,
            price: {
                currency: item.currency_id,
                amount: item.price,
                decimals: 0
            },
            picture: item.thumbnail,
            condition: item.condition,
            free_shipping: item.shipping.free_shipping,
            seller: item.seller.nickname
        }));
        res.json({
            author: {
                name: 'John',
                lastname: 'Doe'
            },
            categories: response.data.filters.find(filter => filter.id === 'category')?.values[0]?.path_from_root.map(category => category.name) || [],
            items
        });
    } catch (error) {
        next(error);
    }

});

app.get('/items/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const [itemResponse, descriptionResponse] = await Promise.all([
            axios.get(`https://api.mercadolibre.com/items/${id}`),
            axios.get(`https://api.mercadolibre.com/items/${id}/description`)
        ]);
        const item = itemResponse.data;
        const description = descriptionResponse.data;
        const { data } = await axios.get(`https://api.mercadolibre.com/categories/${item.category_id}`)
        res.json({
            author: {
                name: 'John',
                lastname: 'Doe'
            },
            item: {
                id: item.id,
                title: item.title,
                price: {
                    currency: item.currency_id,
                    amount: item.price,
                    decimals: 0
                },
                picture: item.pictures[0]?.url,
                condition: item.condition,
                free_shipping: item.shipping.free_shipping,
                sold_quantity: item.sold_quantity,
                description: description.plain_text,
                items_sold: item.deal_ids.length,
                categories: data.path_from_root.map(cat => cat.name)
            }
        });
    } catch (error) {
        next(error);
    }

});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});