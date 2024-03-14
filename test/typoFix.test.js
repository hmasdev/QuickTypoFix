const fixTypo = require('../typoFix').fixTypo;
const DEFAULT_API_ENDPOINT = require('../typoFix').DEFAULT_API_ENDPOINT;
const isResponseModel = require('../typoFix').isResponseModel;
const nock = require('nock');
const expect = require('expect').expect;


describe('fixTypo Unit Test Suite', () => {

    beforeEach(() => {
        nock.disableNetConnect();
        process.env.OPENAI_API_KEY = 'test';
    });

    it('isResponseModel should return true for valid data', () => {
        const data = {
            choices: [
                {
                    message: {
                        content: 'This is a test line with a typo corrected',
                    },
                },
            ],
        };
        expect(isResponseModel(data)).toBe(true);
    });

    it('isResponseModel should return false for invalid data', () => {
        const data = {
            choices: [
                {
                    message: {
                        content: 123,
                    },
                },
            ],
        };
        expect(isResponseModel(data)).toBe(false);
    });

    it('should return the corrected typo', async () => {
        const inputText = 'This is a test lime with a typoo';
        const expectedText = 'This is a test line with a typo corrected';
        const response = {
            choices: [
                {
                    message: {
                        content: expectedText,
                    },
                },
            ],
        };

        // Mock fetch
        const url = new URL(DEFAULT_API_ENDPOINT);
        nock(`${url.protocol}//${url.host}`)
            .post(`${url.pathname}${url.search}`)
            .reply(200, response);

        // execute
        const result = await fixTypo(inputText);

        // verify
        expect(result).toBe(expectedText);
    });

    afterEach(() => {
        nock.enableNetConnect();
        process.env.OPENAI_API_KEY = undefined;
        nock.cleanAll();
    });

    // Case: apiKey is not found
    // Case: apiEndpoint is not found
    // Case: modelName is not found
    // Case: status is not 200
    // Case: invalid response
});

describe('fixTypo Integration Test Suite', () => {

    let processEnvBackup = undefined;

    beforeEach(() => {
        nock.cleanAll();
        processEnvBackup = process.env;
        require('dotenv').config({override: true, debug: true, path: '../../.env'});
    });

    it('should return the corrected typo', async () => {
        const inputText = 'This is a test lime with a typoo';
        const expectedText = 'This is a test line with a typo';
        // execute
        const result = await fixTypo(inputText);
        // verify
        expect(result).toBe(expectedText);
    });

    afterEach(() => {
        process.env = processEnvBackup;
    });
});
