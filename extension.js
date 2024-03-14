const vscode = require('vscode');
const fixTypo = require('./typoFix').fixTypo;
const temporalHighLight = require('./temporalHighLight').temporalHighLight;

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

    async run() {

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
			fixedText = await fixTypo(cursorLineText);
        } catch (error) {
            console.error('Error correcting typo:', error);
            vscode.window.showErrorMessage('Failed to correct typo');
        }

		// replace the line with the fixed text
		await editor.edit(editBuilder => {
			const lineStart = new vscode.Position(cursorLine, 0);
			const lineEnd = new vscode.Position(cursorLine, cursorLineText.length);
			const lineRange = new vscode.Range(lineStart, lineEnd);
			editBuilder.replace(lineRange, fixedText);
		});
		vscode.window.showInformationMessage('Typo corrected');

		// highlight the fixed text
		temporalHighLight(editor, cursorLine, cursorLineText, fixedText);
    }
}

function activate(context) {
    console.log('QuickTypoFix is now active!');
	vscode.window.showInformationMessage('QuickTypoFix is now active!');

    let typoFixer = new TypoFixer();

    let disposable = vscode.commands.registerCommand('quicktypofix.fixTypo', () => {
        typoFixer.run();
    });
    context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
	TypoFixer,
	activate,
	deactivate,
};
