const { Configuration, PlaidApi, Products, PlaidEnvironments } = require('plaid');

const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID;
const PLAID_SECRET = process.env.PLAID_SECRET;
const PLAID_ENV = process.env.PLAID_ENV || 'sandbox';
const PLAID_PRODUCTS = process.env.PLAID_PRODUCTS || 'auth,transactions';
const PLAID_COUNTRY_CODES = process.env.PLAID_COUNTRY_CODES || 'US,CA';
const PLAID_REDIRECT_URI = process.env.PLAID_REDIRECT_URI || '';
const PLAID_ANDROID_PACKAGE_NAME = process.env.PLAID_ANDROID_PACKAGE_NAME || '';

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
        const configs = {
            user: {
                // This should correspond to a unique id for the current user.
                client_user_id: 'user-id', // Replace with actual user id
            },
            client_name: 'Plaid Quickstart',
            products: PLAID_PRODUCTS.split(','),
            country_codes: PLAID_COUNTRY_CODES.split(','),
            language: 'en',
        };

        if (PLAID_REDIRECT_URI !== '') {
            configs.redirect_uri = PLAID_REDIRECT_URI;
        }

        if (PLAID_ANDROID_PACKAGE_NAME !== '') {
            configs.android_package_name = PLAID_ANDROID_PACKAGE_NAME;
        }

        const createTokenResponse = await client.linkTokenCreate(configs);

        return {
            statusCode: 200,
            body: JSON.stringify(createTokenResponse.data),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
