const vscode = require('vscode');
const fetch = require('node-fetch');
const getApiKey = require('./apiKeyManagement').getApiKey;

const DEFAULT_API_ENDPOINT = 'https://api.openai.com/v1/chat/completions';
const DEFAULT_MODEL_NAME = 'gpt-4o-mini';
const OUTPUT_FORMAT_KEY = 'typoFixed';
const START_TAG = `<${OUTPUT_FORMAT_KEY}>`;
const END_TAG = `</${OUTPUT_FORMAT_KEY}>`;
const OUTPUT_INSTRUCTIONS = `OUTPUT FORMAT\n<${OUTPUT_FORMAT_KEY}>{HERE_IS_FIXED_SENTENCE}</${OUTPUT_FORMAT_KEY}>\n`;

function validateResponseData(data) {
    return (
        data.choices &&
        Array.isArray(data.choices) &&
        (data.choices.length > 0) &&
        data.choices[0].message &&
        data.choices[0].message.content &&
        (typeof data.choices[0].message.content === 'string')
    );
}

function extractFixedText(text) {
    // check
    if (typeof text !== 'string') {
        throw new Error(`Type error: text is not a string but ${typeof text} with contents: "${text}"`);
    }
    if (!text.includes(START_TAG)) {
        console.warn(`The start tag, ${START_TAG}, is not found in text: "${text}"`);
    }
    if (!text.includes(END_TAG)) {
        console.warn(`The end tag, ${END_TAG}, is not found in text: "${text}"`);
    }
    // extract
    let fixedText = text.split(END_TAG)[0];
    let texts = fixedText.split(START_TAG);
    if (texts.length > 1) {
        fixedText = texts[1];
    }
    return fixedText;
}

async function fixTypo(text, context) {

    // get settings
    let apiKey = await getApiKey(context);
    if (!apiKey) {
        vscode.window.showErrorMessage('API Key is not set. Please set it properly.');
        throw new Error('API Key has not been set.');
    }
    let apiEndpoint = vscode.workspace.getConfiguration().get('quicktypofix.apiEndpoint');
    if (!apiEndpoint) {
        apiEndpoint = DEFAULT_API_ENDPOINT;
        vscode.window.showWarningMessage('API endpoint is not set. Using default endpoint: ' + apiEndpoint);
    }
    let modelName = vscode.workspace.getConfiguration().get('quicktypofix.modelName');
    if (!modelName) {
        modelName = DEFAULT_MODEL_NAME;
        vscode.window.showWarningMessage('Model name is not set. Using default model: ' + modelName);
    }
    let systemPrompt = vscode.workspace.getConfiguration().get('quicktypofix.systemPrompt');
    if (!systemPrompt) {
        systemPrompt = 'Excellent Typo Fixer';
        vscode.window.showWarningMessage('System prompt is not set. Using default prompt: ' + systemPrompt);
    }

    return await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            messages: [
                { role: 'system', content: systemPrompt + '\n\n' + OUTPUT_INSTRUCTIONS },
                { role: 'user', content: `Fix typo: ${text}` },
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
        if (validateResponseData(data)) {
            return extractFixedText(data.choices[0].message.content);
        } else {
            throw new Error(`Invalid response from ${apiEndpoint}: ${data}`);
        }
    }).catch((error) => {
        throw error;
    });
}

module.exports = {
    DEFAULT_API_ENDPOINT,
    DEFAULT_MODEL_NAME,
    fixTypo,
    START_TAG,  // FIXME: this should be private, but it is used in the test code
    END_TAG,  // FIXME: this should be private, but it is used in the test code
    extractFixedText,  // FIXME: this should be private, but it is used in the test code
    validateResponseData,  // FIXME: this should be private, but it is used in the test code
};
