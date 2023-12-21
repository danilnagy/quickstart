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

        let cursor = null;
        let added = [];
        let modified = [];
        let removed = [];
        let hasMore = true;

        while (hasMore) {
            const request = {
                access_token: accessToken,
                cursor: cursor,
            };
            const plaidResponse = await client.transactionsSync(request);
            const data = plaidResponse.data;

            added = added.concat(data.added);
            modified = modified.concat(data.modified);
            removed = removed.concat(data.removed);
            hasMore = data.has_more;
            cursor = data.next_cursor;

            console.log(plaidResponse);
        }

        const compareTxnsByDateAscending = (a, b) => (a.date > b.date) - (a.date < b.date);
        const recentlyAdded = [...added].sort(compareTxnsByDateAscending).slice(-8);

        return {
            statusCode: 200,
            body: JSON.stringify({ latest_transactions: recentlyAdded }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};