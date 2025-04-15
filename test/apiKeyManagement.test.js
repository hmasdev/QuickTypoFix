const assert = require('assert');
const proxyquire = require('proxyquire');
const sinon = require('sinon');

const API_KEY_SECRET_ID = 'quickTypoFix.apiKey';

class MockSecretsStore {
    constructor(){
        this._store = {};
    }
    store(id, value) {
        this._store[id] = value;
    }
    get(id) {
        return this._store[id];
    }
    delete(id) {
        delete this._store[id];
    }
}


describe('apiKeyManagement Test Suite', () => {

    describe('Unit Test', () => {

        let context;

        beforeEach(() => {
            context = {
                secrets: new MockSecretsStore(),
            };
        });

        it('registerApiKey stores the API key with Vaid API Key', async () => {
            // preparation
            const DUMMY_API_KEY = 'DUMMY_API_KEY';
            // Mock
            const registerApiKey = proxyquire('../src/apiKeyManagement', {
                'vscode': {
                    window: {
                        showInputBox: sinon.stub().resolves(DUMMY_API_KEY),
                        showInformationMessage: sinon.stub(),
                        showWarningMessage: sinon.stub(),
                        showErrorMessage: sinon.stub(),
                    }
                }
            }).registerApiKey;
            // Execute and assert
            assert.strictEqual(await registerApiKey(context), true);
            assert.strictEqual(context.secrets.get(API_KEY_SECRET_ID), DUMMY_API_KEY);
        });

        it('registerApiKey returns false with empty API key', async () => {
            // Mock
            const registerApiKey = proxyquire('../src/apiKeyManagement', {
                'vscode': {
                    window: {
                        showInputBox: sinon.stub().resolves(''),
                        showInformationMessage: sinon.stub(),
                        showWarningMessage: sinon.stub(),
                        showErrorMessage: sinon.stub(),
                    }
                }
            }).registerApiKey;
            // Execute and assert
            assert.strictEqual(await registerApiKey(context), false);
            assert.strictEqual(context.secrets.get(API_KEY_SECRET_ID), undefined);
        });

        it('registerApiKey returns false with no API key', async () => {
            // Mock
            const registerApiKey = proxyquire('../src/apiKeyManagement', {
                'vscode': {
                    window: {
                        showInputBox: sinon.stub().resolves(undefined),
                        showInformationMessage: sinon.stub(),
                        showWarningMessage: sinon.stub(),
                        showErrorMessage: sinon.stub(),
                    }
                }
            }).registerApiKey;
            // Execute and assert
            assert.strictEqual(await registerApiKey(context), false);
            assert.strictEqual(context.secrets.get(API_KEY_SECRET_ID), undefined);
        });

        it('getApiKey returns the stored API key', async () => {
            // preparation
            const DUMMY_API_KEY = 'DUMMY_API_KEY';
            context.secrets.store(API_KEY_SECRET_ID, DUMMY_API_KEY);
            const getApiKey = require('../src/apiKeyManagement').getApiKey;
            // Execute
            const actual = await getApiKey(context);
            // Assert
            assert.strictEqual(actual, DUMMY_API_KEY);
        });

        it('getApiKey returns undefined with no stored API key', async () => {
            // preparation
            const getApiKey = require('../src/apiKeyManagement').getApiKey;
            // Execute
            const actual = await getApiKey(context);
            // Assert
            assert.strictEqual(actual, undefined);
        });

        it('clearApiKey clears the stored API key', async () => {
            // preparation
            const DUMMY_API_KEY = 'DUMMY_API_KEY';
            context.secrets.store(API_KEY_SECRET_ID, DUMMY_API_KEY);
            const clearApiKey = require('../src/apiKeyManagement').clearApiKey;
            // pre-assert
            assert.strictEqual(context.secrets.get(API_KEY_SECRET_ID), DUMMY_API_KEY);
            // Execute
            await clearApiKey(context);
            // Assert
            assert.strictEqual(context.secrets.get(API_KEY_SECRET_ID), undefined);
        })

        // TODO: previewMaskedApiKey test

        afterEach(() => {
            context = undefined;
        });
    });

});