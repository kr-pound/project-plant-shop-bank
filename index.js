// Load environment variables from .env file
require('dotenv').config();

const config = require('config');

const express = require('express');
const bodyParser = require('body-parser');
const debug = require('debug')('app:bank');

const { v4: uuidv4 } = require('uuid');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

debug(`=== ${config.get('name')} ===`)

app.post('/api/payment_detail', (req, res) => {

    debug(`\n===== /api/payment_detail =====`);

    debug(`PlantWithDetail: get the request params : ${JSON.stringify(req.params, null, 2)}`);
    debug(`PlantWithDetail: get the request body : ${JSON.stringify(req.body, null, 2)}`);

    const price = req.body.price;

    const transactionId = uuidv4();
    const paymentQr = `https://promptpay.io/0970638685/${price}`;

    const response = {
        transaction_id: transactionId,
        payment_qr: paymentQr,
        price
    };

    // Send the formatted response
    res.status(200).json(response);
});

app.post('/transaction/:transaction_id', (req, res) => {

    debug(`\n===== /transaction/:transaction_id =====`);

    debug(`PlantWithDetail: get the request params : ${JSON.stringify(req.params, null, 2)}`);
    debug(`PlantWithDetail: get the request body : ${JSON.stringify(req.body, null, 2)}`);

    const transactionId = req.params.transaction_id;

    const baseUrl = config.get('webhook.server_base_url');
    const webhookUrl = `${baseUrl}/webhook/payment_status/${transactionId}`;
    const webhookBody = {
        status: 'success'
    };

    // Send the webhook request
    axios.post(webhookUrl, webhookBody)
        .then(response => {
            debug(`Webhook sent successfully to ${webhookUrl}`);
            debug(`Webhook response: ${JSON.stringify(response.data, null, 2)}`);
        })
        .catch(error => {
            debug(`Error sending webhook to ${webhookUrl}`);
            debug(`Webhook error: ${error.message}`);
        });

    // Send the formatted response
    res.status(200).json( {message: 'Transaction webhook sent'} );
});

// PORT
// 'process.env.PORT' can be set using `set PORT=5000` in the cmd
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
