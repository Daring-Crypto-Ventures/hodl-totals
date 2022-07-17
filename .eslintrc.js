module.exports = {
    extends: ['@ni/eslint-config-typescript', 
        '@ni/eslint-config-typescript/requiring-type-checking',
        "eslint:recommended", 
        "plugin:jest/recommended"
    ],
    env: {
        es6: true,
        node: true
    },
    plugins: ['@typescript-eslint', 'jest'],
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        project: 'tsconfig.json'
    },
    rules: {
        'no-console': 'off',
        'import/no-default-export': 'off'
    },
    settings: {
        jest: {
            version: 26
        }
    }
};
