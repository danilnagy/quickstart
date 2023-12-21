const { Configuration, PlaidApi, Products, PlaidEnvironments } = require('plaid');

const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID;
const PLAID_SECRET = process.env.PLAID_SECRET;
const PLAID_ENV = process.env.PLAID_ENV || 'sandbox';

const configuration = new Configuration({
    basePath: PlaidEnvironments[PLAID_ENV],
    baseOptions: {
        headers: {
            'PLAID-CLIENT-ID': PLAID_CLIENT_ID,
            'PLAID-SECRET': PLAID_SECRET,
            'Plaid-Version': '2020-09-14',
        },
    },
});

const client = new PlaidApi(configuration);

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: 'Method Not Allowed',
            headers: { 'Allow': 'POST' },
        };
    }

    try {
        const requestBody = JSON.parse(event.body);
        const publicToken = requestBody.public_token;

        const tokenResponse = await client.itemPublicTokenExchange({
            public_token: publicToken,
        });

        const accessToken = tokenResponse.data.access_token;
        const itemId = tokenResponse.data.item_id;

        console.log("accessToken:", accessToken);
        console.log("itemId:", itemId);

        return {
            statusCode: 200,
            body: JSON.stringify({
                access_token: accessToken, // Caution: sensitive information
                item_id: itemId,
                error: null,
            }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
