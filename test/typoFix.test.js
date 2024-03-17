const nock = require('nock');
const expect = require('expect').expect;
const rewire = require('rewire');
const typoFix = rewire('../typoFix');

describe('fixTypo Test Suite', () => {

    describe('Unit Test', () => {

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
            expect(typoFix.isResponseModel(data)).toBe(true);
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
            expect(typoFix.isResponseModel(data)).toBe(false);
        });

        [
            [
                'This is a test line with a typo corrected',
                'This is a test line with a typo corrected',
                'No tags',
            ],
            [
                `${typoFix.__get__('START_TAG')}This is a test line with a typo corrected`,
                'This is a test line with a typo corrected',
                'Start tag only',
            ],
            [
                `This is a test line with a typo corrected${typoFix.__get__('END_TAG')}`,
                `This is a test line with a typo corrected`,
                'End tag only',
            ],
            [
                `${typoFix.__get__('START_TAG')}This is a test line with a typo corrected${typoFix.__get__('END_TAG')}`,
                'This is a test line with a typo corrected',
                'Start and end tags',
            ],
        ].forEach(([inputText, expectedText, caseInfo]) => {
            it(
                `extractFixedText should the text between the start tag and the end tag: ${caseInfo}`,
                () => {
                    const actualText = typoFix.__get__('extractFixedText')(inputText);
                    expect(actualText).toBe(expectedText);
                }
            );
        });

        it('extractFixedText should throw an error for non-string input', () => {
            const inputText = 123;
            expect(() => typoFix.__get__('extractFixedText')(inputText)).toThrow();
        });

        it('should return the corrected typo', async () => {
            const inputText = 'This is a test lime with a typoo.';
            const expectedText = 'This is a test line with a typo.';
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
            const url = new URL(typoFix.DEFAULT_API_ENDPOINT);
            nock(`${url.protocol}//${url.host}`)
                .post(`${url.pathname}${url.search}`)
                .reply(200, response);

            // execute
            const result = await typoFix.fixTypo(inputText);

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

    describe('Integration Test', () => {

        let processEnvBackup = undefined;

        beforeEach(() => {
            nock.cleanAll();
            nock.enableNetConnect();
            processEnvBackup = process.env;
            require('dotenv').config({override: true, debug: true, path: '../../.env'});
        });

        it('should return the corrected typo', async () => {
            const inputText = 'This is a test lime with a typoo.';
            const expectedText = 'This is a test line with a typo.';
            // execute
            const result = await typoFix.fixTypo(inputText);
            // verify
            expect(result).toBe(expectedText);
        });

        afterEach(() => {
            process.env = processEnvBackup;
        });
    });

});