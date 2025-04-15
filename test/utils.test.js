const assert = require('assert');
const getApiKeyPreview = require('../src/utils').getApiKeyPreview;
const MASK_THRESHOLD = require('../src/utils').MASK_THRESHOLD;


describe('utils Test Suite', () => {
    describe('Unit Test', () => {
        [
            { input: undefined, expected: '(not set)' },
            { input: '', expected: '(empty string)' },
            { input: '123'+'x'.repeat(MASK_THRESHOLD*10)+'890', expected: '123...890' },
            { input: '1', expected: '*' },
            { input: '1'.repeat(MASK_THRESHOLD), expected: '*'.repeat(MASK_THRESHOLD) },
            { input: '1'.repeat(MASK_THRESHOLD+1), expected: '111...111' },
        ].forEach(({ input, expected }) => {
            it(`getApiKeyPreview(${input}) should return "${expected}"`, () => {
                assert.strictEqual(getApiKeyPreview(input), expected);
            });
        });
    });
});
