import runTests from './calc-fifo';

test('Check result value', () => {
    const result = runTests();
    expect(result).toBeTruthy();
});
