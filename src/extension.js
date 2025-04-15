const vscode = require('vscode');
const diff = require('diff');
const fixTypo = require('./typoFix').fixTypo;
const temporalHighLight = require('./temporalHighLight').temporalHighLight;
const registerApiKey = require('./apiKeyManagement').registerApiKey;
const clearApiKey = require('./apiKeyManagement').clearApiKey;
const previewMaskedApiKey = require('./apiKeyManagement').previewMaskedApiKey;

class TypoFixer {

	constructor() {
		this._is_activated = true;
	}

	is_activated() {
		return this._is_activated;
	}

	activate() {
		this._is_activated = true;
	}

	deactivate() {
		this._is_activated = false;
	}

	async run(context) {

		if (!this.is_activated()) {
			vscode.window.showInformationMessage('QuickTypoFix is not activated');
			return;
		}

        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('No editor is active');
            return;
        }

		// get the line of the cursor
		const cursorPosition = editor.selection.active;
		const cursorLine = cursorPosition.line;
		const cursorLineText = editor.document.lineAt(cursorLine).text;
        if (!cursorLineText) {
            vscode.window.showInformationMessage('No text in the line');
            return;
        }

		// fix the typo
		let fixedText;
        try {
			fixedText = await fixTypo(cursorLineText, context);
        } catch (error) {
            console.error(`Failed to fix typo: ${error}`);
            vscode.window.showErrorMessage(`Failed to fix typo: ${error}`);
			return;
        }

		// specify changes
		let changes = diff.diffChars(cursorLineText, fixedText);
		let mergedText = changes.map(change => {return change.value}).join('');

		// temporally show the before and after text
		await editor.edit(editBuilder => {
			const lineStart = new vscode.Position(cursorLine, 0);
			const lineEnd = new vscode.Position(cursorLine, cursorLineText.length);
			const lineRange = new vscode.Range(lineStart, lineEnd);
			editBuilder.replace(lineRange, mergedText);
		});
		// highlight the merged text
		await temporalHighLight(editor, cursorLine, changes);

		// replace the line with the fixed text
		await editor.edit(editBuilder => {
			const lineStart = new vscode.Position(cursorLine, 0);
			const lineEnd = new vscode.Position(cursorLine, mergedText.length);
			const lineRange = new vscode.Range(lineStart, lineEnd);
			editBuilder.replace(lineRange, fixedText);
		});
		// highlight the fixed text
		await temporalHighLight(editor, cursorLine, changes.filter(change => !change.removed));
		vscode.window.showInformationMessage('Typo corrected');
    }
}

function activate(context) {
    console.log('QuickTypoFix is now active!');
	vscode.window.showInformationMessage('QuickTypoFix is now active!');

    let typoFixer = new TypoFixer();

    let fixType_ = vscode.commands.registerCommand('quicktypofix.fixTypo', ()=>{typoFixer.run(context);});
    context.subscriptions.push(fixType_);
	let registerApiKey_ = vscode.commands.registerCommand('quicktypofix.registerApiKey', async () => {await registerApiKey(context);});
	context.subscriptions.push(registerApiKey_);
	let clearApiKey_ = vscode.commands.registerCommand('quicktypofix.clearApiKey', async () => {await clearApiKey(context);});
	context.subscriptions.push(clearApiKey_);
	let previewMaskedApiKey_ = vscode.commands.registerCommand('quicktypofix.previewMaskedApiKey', async () => {await previewMaskedApiKey(context);});
	context.subscriptions.push(previewMaskedApiKey_);
}

function deactivate() {}

module.exports = {
	TypoFixer,
	activate,
	deactivate,
};
