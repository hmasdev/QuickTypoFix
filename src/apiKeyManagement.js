const vscode = require('vscode');
const getApiKeyPreview = require('./utils').getApiKeyPreview;

const API_KEY_SECRET_ID = 'quickTypoFix.apiKey';

async function registerApiKey(context) {
    const input = await vscode.window.showInputBox({
        prompt: 'Enter your API key',
        ignoreFocusOut: true,
        password: true
    });

    if (input) {
        await context.secrets.store(API_KEY_SECRET_ID, input);
        vscode.window.showInformationMessage(`API key has been securely stored.`);
        return true;
    } else {
        vscode.window.showWarningMessage(`No API key provided.`);
        return false;
    }
}

async function getApiKey(context) {
    try {
        const stored = await context.secrets.get(API_KEY_SECRET_ID);
        if (stored) {
            return stored;
        } else {
            vscode.window.showWarningMessage(`No API key found. Please register one first: open the command palette and run "QuickTypoFix: Register API Key".`);
            return undefined;
        }
    } catch (error) {
        console.error(`Error retrieving API key: ${error}`);
        vscode.window.showErrorMessage(`Failed to retrieve API key. Did you register the API key? If not, please register it first: open the command palette and run "QuickTypoFix: Register API Key".`);
        return undefined;
    }
}

async function clearApiKey(context) {
    await context.secrets.delete(API_KEY_SECRET_ID);
    vscode.window.showInformationMessage('Stored API key has been cleared.');
}

async function previewMaskedApiKey(context) {
    const apiKey = await getApiKey(context, false);
    vscode.window.showInformationMessage(`API Key: ${getApiKeyPreview(apiKey)}`);
}

module.exports = {
    clearApiKey,
    getApiKey,
    previewMaskedApiKey,
    registerApiKey,
};
