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
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' }),
            headers: { 'Allow': 'GET' },
        };
    }

    try {
        // Accessing the query string parameters
        const params = event.queryStringParameters;
        const accessToken = params.access_token;
        console.log("accessToken", accessToken);

        const balanceResponse = await client.accountsBalanceGet({
            access_token: accessToken,
        });

        console.log(balanceResponse);

        return {
            statusCode: 200,
            body: JSON.stringify(balanceResponse.data),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
