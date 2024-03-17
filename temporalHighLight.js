const vscode = require('vscode');

const DEFAULT_HIGHLIGHT_TIMEOUT = 3000;
const DEFAULT_ADDED_HIGHLIGHT_COLOR = 'rgba(0, 255, 0, 0.3)';
const DEFAULT_REMOVED_HIGHLIGHT_COLOR = 'rgba(255, 0, 0, 0.3)';

function specifyHighlightPosition(changes, condition) {
    let idxText = 0;
    return changes.map(change => {
        const startIdx = idxText;
        idxText = idxText + change.count;
        if (condition(change)) {
            return [ startIdx, idxText - 1];
        } else {
            return undefined;
        }
    }).filter(range => range !== undefined);
}

function temporalHighLight(editor, cursorLine, changes) {
    /*
    Highlight the changes in the text temporally.
    Assume the followings:
    - changes are calculated by diff.diffChars;
    - the cursor line display the merged text of the changes.
    */

    // setup
    let highlightTimeout = vscode.workspace.getConfiguration().get('quicktypofix.highlightTimeout');
    if (!highlightTimeout) {
        highlightTimeout = DEFAULT_HIGHLIGHT_TIMEOUT;
        vscode.window.showWarningMessage('Highlight timeout is not set. Using default timeout: '+highlightTimeout);
    }

    let addedHighlightColor = vscode.workspace.getConfiguration().get('quicktypofix.addedHighlightColor');
    if (!addedHighlightColor) {
        addedHighlightColor = DEFAULT_ADDED_HIGHLIGHT_COLOR;
        vscode.window.showWarningMessage('Added highlight color is not set. Using default color: '+addedHighlightColor);
    }
    let removedHighlightColor = vscode.workspace.getConfiguration().get('quicktypofix.removedHighlightColor');
    if (!removedHighlightColor) {
        removedHighlightColor = DEFAULT_REMOVED_HIGHLIGHT_COLOR;
        vscode.window.showWarningMessage('Removed highlight color is not set. Using default color: '+removedHighlightColor);
    }
    const addedDecorationType = vscode.window.createTextEditorDecorationType({backgroundColor: addedHighlightColor});
    const removedDecorationType = vscode.window.createTextEditorDecorationType({backgroundColor: removedHighlightColor});

    editor.setDecorations(
        addedDecorationType,
        specifyHighlightPosition(changes, change => change.added)
            .map(range => {return new vscode.Range(cursorLine, range[0], cursorLine, range[1]);}),
    );
    editor.setDecorations(
        removedDecorationType,
        specifyHighlightPosition(changes, change => change.removed)
            .map(range => {return new vscode.Range(cursorLine, range[0], cursorLine, range[1]);}),
    );

    setTimeout(() => {
        editor.setDecorations(addedDecorationType, []);
        editor.setDecorations(removedDecorationType, []);
        addedDecorationType.dispose();
        removedDecorationType.dispose();
    }, highlightTimeout);
}

module.exports = {
    temporalHighLight,
};
