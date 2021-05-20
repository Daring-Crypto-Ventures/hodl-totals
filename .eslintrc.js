module.exports = {
    extends: '@ni/eslint-config/typescript',
    env: {
        es6: true,
        node: true,
        'jest/globals': true
    },
    plugins: ['@typescript-eslint', 'jest'],
    parserOptions: {
        ecmaVersion: 2019,
        sourceType: 'module'
    },
    ignorePatterns: ['tests/**', 'examples.js', 'discord.js', 'crypto_tools.js', 'crypto_tools_dbg.js', 'categories.js', 'about.js'],
    rules: {
        'no-console': 'off'
    },
    settings: {
        jest: {
            version: 26
        }
    }
};
