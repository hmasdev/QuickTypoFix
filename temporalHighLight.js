const vscode = require('vscode');
const diff = require('diff');

const DEFAULT_HIGHLIGHT_TIMEOUT = 3000;
const DEFAULT_HIGHLIGHT_COLOR = 'rgba(255, 255, 0, 0.3)';

function temporalHighLight(editor, cursorLine, beforeLineText, afterLineText) {

    let highlightTimeout = vscode.workspace.getConfiguration().get('quicktypofix.highlightTimeout');
    if (!highlightTimeout) {
        highlightTimeout = DEFAULT_HIGHLIGHT_TIMEOUT;
        vscode.window.showWarningMessage('Highlight timeout is not set. Using default timeout: '+highlightTimeout);
    }
    let rgbaColor = vscode.workspace.getConfiguration().get('quicktypofix.highlightColor');
    if (!rgbaColor) {
        rgbaColor = DEFAULT_HIGHLIGHT_COLOR;
        vscode.window.showWarningMessage('Highlight color is not set. Using default color: '+rgbaColor);
    }

    const changes = diff.diffChars(beforeLineText, afterLineText);
    const decorationType = vscode.window.createTextEditorDecorationType({backgroundColor: rgbaColor});
    let idxFixedText = 0;
    editor.setDecorations(decorationType, changes.map(change => {
        const startIdx = idxFixedText;
        if (!change.removed) {
            idxFixedText += change.value.length;
        }
        if (change.added) {
            return { range: new vscode.Range(cursorLine, startIdx, cursorLine, idxFixedText) };
        } else {
            return undefined;
        }
    }).filter(range => range !== undefined));
    setTimeout(() => {
        editor.setDecorations(decorationType, []);
        decorationType.dispose();
    }, highlightTimeout);
}

module.exports = {
    temporalHighLight,
};
