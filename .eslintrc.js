module.exports = {
    "extends": "@ni/eslint-config/typescript",
    "env": {
        "node": true
    },
    "plugins": ["@typescript-eslint"],
    "parserOptions": {
        "ecmaVersion": 2018
    },
    rules: {
        'no-console': 'off'
    }
};
