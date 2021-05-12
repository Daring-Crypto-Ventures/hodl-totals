import runTests from './index';

test('Check result value', () => {
    const result = runTests();
    expect(result).toBeTruthy();
});
