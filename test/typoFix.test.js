const expect = require('expect').expect;
const nock = require('nock');
const proxyquire = require('proxyquire');
const sinon = require('sinon');

describe('fixTypo Test Suite', () => {

    describe('Unit Test', () => {

        let typoFix = undefined;

        before(() => {
            typoFix = proxyquire('../src/typoFix', {
				'./apiKeyManagement': {
					getApiKey: sinon.stub().resolves('DUMMY_API_KEY'),
				}
			});
        });

        beforeEach(() => {
            nock.disableNetConnect();
            process.env.OPENAI_API_KEY = 'test';
        });

        it('validateResponseData should return true for valid data', () => {
            const data = {
                choices: [
                    {
                        message: {
                            content: 'This is a test line with a typo corrected',
                        },
                    },
                ],
            };
            expect(typoFix.validateResponseData(data)).toBe(true);
        });

        it('validateResponseData should return false for invalid data', () => {
            const data = {
                choices: [
                    {
                        message: {
                            content: 123,
                        },
                    },
                ],
            };
            expect(typoFix.validateResponseData(data)).toBe(false);
        });

        [
            'No tags',
            'Start tag only',
            'End tag only',
            'Start and end tags',
        ].forEach(caseInfo => {
            it(
                `extractFixedText should the text between the start tag and the end tag: ${caseInfo}`,
                () => {
                    const cases = {
                        'No tags': {
                            inputText: 'This is a test line with a typo corrected',
                            expectedText: 'This is a test line with a typo corrected',
                        },
                        'Start tag only': {
                            inputText: `${typoFix.START_TAG}This is a test line with a typo corrected`,
                            expectedText: 'This is a test line with a typo corrected',
                        },
                        'End tag only': {
                            inputText: `This is a test line with a typo corrected${typoFix.END_TAG}`,
                            expectedText: `This is a test line with a typo corrected`,
                        },
                        'Start and end tags': {
                            inputText: `${typoFix.START_TAG}This is a test line with a typo corrected${typoFix.END_TAG}`,
                            expectedText: 'This is a test line with a typo corrected',
                        },
                    };
                    const inputText = cases[caseInfo].inputText;
                    const expectedText = cases[caseInfo].expectedText;
                    const actualText = typoFix.extractFixedText(inputText);
                    expect(actualText).toBe(expectedText);
                }
            );
        });

        it('extractFixedText should throw an error for non-string input', () => {
            const inputText = 123;
            expect(() => typoFix.extractFixedText(inputText)).toThrow();
        });

        it('fixTypo should return the corrected typo', async () => {
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
            const result = await typoFix.fixTypo(inputText, undefined);
            // verify
            expect(result).toBe(expectedText);
        });

        it('fixTypo should throw an error for not-200 status', async () => {
            const inputText = 'This is a test lime with a typoo.';
            // Mock fetch
            const url = new URL(typoFix.DEFAULT_API_ENDPOINT);
            nock(`${url.protocol}//${url.host}`)
                .post(`${url.pathname}${url.search}`)
                .reply(404);
            // execute and verify
            await expect(typoFix.fixTypo(inputText)).rejects.toThrow();
        });

        it('fixTypo should throw an error for invalid response', async () => {
            const inputText = 'This is a test lime with a typoo.';
            const response = {invalid: true};
            // Mock fetch
            const url = new URL(typoFix.DEFAULT_API_ENDPOINT);
            nock(`${url.protocol}//${url.host}`)
                .post(`${url.pathname}${url.search}`)
                .reply(200, response);
            // execute and verify
            await expect(typoFix.fixTypo(inputText)).rejects.toThrow();
        });

        it('fixTypo should throw an error without apiKey', async () => {
            process.env.OPENAI_API_KEY = undefined;
            await expect(typoFix.fixTypo('')).rejects.toThrow();
        });

        afterEach(() => {
            nock.enableNetConnect();
            process.env.OPENAI_API_KEY = undefined;
            nock.cleanAll();
        });

        // Case: apiEndpoint is not found
        // Case: modelName is not found
        // Case: systemPrompt is not found
    });

    describe('Integration Test', () => {

        let typoFix = undefined;
        let processEnvBackup = undefined;

        before(() => {
            nock.cleanAll();
            nock.enableNetConnect();
            processEnvBackup = process.env;
            require('dotenv').config({override: true, debug: true, path: '../../.env'});
            typoFix = proxyquire('../src/typoFix', {
				'./apiKeyManagement': {
					getApiKey: sinon.stub().resolves(process.env.OPENAI_API_KEY),
				}
			});
        });

        it('should return the corrected typo', async () => {
            const inputText = 'This is a test lime with a typoo.';
            const expectedText = 'This is a test line with a typo.';
            // execute
            const result = await typoFix.fixTypo(inputText);
            // verify
            expect(result).toBe(expectedText);
        });

        after(() => {
            process.env = processEnvBackup;
        });
    });

});