module.exports = {
    "extends": "@ni/eslint-config/typescript",
    "env": {
        "node": true
    },
    "plugins": ["@typescript-eslint"],
    "parserOptions": {
        "project": "tsconfig.json",
        "ecmaVersion": 2018
    }
};
