const vscode = require('vscode');
const fetch = require('node-fetch');

const DEFAULT_API_ENDPOINT = 'https://api.openai.com/v1/chat/completions';
const DEFAUT_MODEL_NAME = 'gpt-3.5-turbo';

function isResponseModel(data) {
    return (
        data.choices &&
        Array.isArray(data.choices) &&
        (data.choices.length > 0) &&
        data.choices[0].message &&
        data.choices[0].message.content &&
        (typeof data.choices[0].message.content === 'string')
    );
}

async function fixTypo(text){

    // get settings
    let apiKey = vscode.workspace.getConfiguration().get('quicktypofix.apiKey');
    if (!apiKey) {
        apiKey = process.env.OPENAI_API_KEY || '';
        if (!apiKey) {throw new Error('API key or OPENAI_API_KEY is not set');}
    }
    let apiEndpoint = vscode.workspace.getConfiguration().get('quicktypofix.apiEndpoint');
    if (!apiEndpoint) {
        apiEndpoint = DEFAULT_API_ENDPOINT;
        vscode.window.showWarningMessage('API endpoint is not set. Using default endpoint: '+apiEndpoint);
    }
    let modelName = vscode.workspace.getConfiguration().get('quicktypofix.modelName');
    if (!modelName) {
        modelName = DEFAUT_MODEL_NAME;
        vscode.window.showWarningMessage('Model name is not set. Using default model: '+modelName);
    }
    let systemPrompt = vscode.workspace.getConfiguration().get('quicktypofix.systemPrompt');
    if (!systemPrompt) {
        systemPrompt = 'Excellent Typo Fixer';
        vscode.window.showWarningMessage('System prompt is not set. Using default prompt: '+systemPrompt);
    }

    return await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            messages: [
                {role: 'system', content: systemPrompt},
                {role: 'user', content: `Fix typo: ${text}`},
            ],
            temperature: 0.5,
            top_p: 1.0,
            frequency_penalty: 0.0,
            presence_penalty: 0.0,
            model: modelName,
        }),
    }).then((response) => {
        if (!response.ok) {
            throw new Error(`HTTP Status ${response.status} from ${apiEndpoint}: ${response.statusText}`);
        }
        return response.json();
    }).then((data) => {
        if (isResponseModel(data)) {
            return data.choices[0].message.content;
        } else {
            throw new Error(`Invalid response from ${apiEndpoint}: ${data}`);
        }
    }).catch((error) => {
        throw error;
    });
}

module.exports = {
    DEFAULT_API_ENDPOINT,
    DEFAUT_MODEL_NAME,
    fixTypo,
    isResponseModel,
};
