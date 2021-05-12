module.exports = {
    extends: '@ni/eslint-config/typescript',
    env: {
        node: true
    },
    plugins: ['@typescript-eslint'],
    parserOptions: {
        ecmaVersion: 2018
    },
    ignorePatterns: ['tests/**', 'examples.js', 'discord.js', 'crypto_tools.js', 'crypto_tools_dbg.js', 'categories.js', 'about.js'],
    rules: {
        'no-console': 'off'
    }
};
