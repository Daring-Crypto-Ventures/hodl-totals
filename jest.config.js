module.exports = {
    roots: ['src'],
    extensionsToTreatAsEsm: ['.ts'],
    globals: {
        'ts-jest': {
          useESM: true,
        },
      },
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
      },
    transform: { '^.+\\.tsx?$': 'ts-jest' },
    testEnvironment: 'node'
};
