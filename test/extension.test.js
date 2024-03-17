const assert = require('assert');
const expect = require('expect').expect;
const vscode = require('vscode');
const nock = require('nock');
const sinon = require('sinon');
const diff = require('diff');
const TypoFixer = require('../extension').TypoFixer;
const DEFAULT_API_ENDPOINT = require('../typoFix').DEFAULT_API_ENDPOINT;


describe('Extension Test Suite', () => {

	describe('Unit Test', () => {

		beforeEach(() => {
			process.env.OPENAI_API_KEY = 'test';
		});

		it('TypoFixer is activated', () => {
			const typoFixer = new TypoFixer();
			assert.strictEqual(typoFixer.is_activated(), true);
		});

		it('TypoFixer can be activated', () => {
			const typoFixer = new TypoFixer();
			typoFixer.deactivate();
			typoFixer.activate();
			assert.strictEqual(typoFixer.is_activated(), true);
		});

		it('TypoFixer can be deactivated', () => {
			const typoFixer = new TypoFixer();
			typoFixer.deactivate();
			assert.strictEqual(typoFixer.is_activated(), false);
		});

		it('TypoFixer.run corrects typo', async () => {
			// setup
			const typoFixer = new TypoFixer();
			const cursorPosition = new vscode.Position(0, 0);
			const cursorLineText = 'This is a test lime with a typoo';
			const expectedText = 'This is a test line with a typo';
			const mergedText = diff.diffChars(cursorLineText, expectedText).map(change => {return change.value}).join('');
			let actualPlaceHolder = undefined;
			let fetchCalledCount = 0;
			let firstCallOfEdit = true;
			// mock editor
			const editSpy = sinon.spy((callback, options) => {
				console.log('editSpy called');
				const editBuilder = {
					replace: (range, text) => {
						if (firstCallOfEdit) {
							assert.strictEqual(range.start.line, cursorPosition.line);
							assert.strictEqual(range.start.character, 0);
							assert.strictEqual(range.end.line, cursorPosition.line);
							assert.strictEqual(range.end.character, cursorLineText.length);
							assert.strictEqual(text, mergedText);
							firstCallOfEdit = false;
						} else {
							assert.strictEqual(range.start.line, cursorPosition.line);
							assert.strictEqual(range.start.character, 0);
							assert.strictEqual(range.end.line, cursorPosition.line);
							assert.strictEqual(range.end.character, mergedText.length);
							assert.strictEqual(text, expectedText);
							actualPlaceHolder = text;
						}
					}
				};
				options;
				callback(editBuilder);
				return Promise.resolve(true);
			});
			sinon.stub(vscode.window, 'activeTextEditor').value({
				selection: {
					active: new vscode.Position(0, 0),
				},
				document: {
					lineAt: () => ({ text: 'This is a test lime with a typoo' }),
				},
				edit: editSpy,
				setDecorations: (decorationType, ranges) => {decorationType; ranges; return;},
			});
			// Mock fetch
			const url = new URL(DEFAULT_API_ENDPOINT);
			const response = {
				choices: [
					{message: {content: expectedText}},
				],
			};
			nock.disableNetConnect();
			nock(`${url.protocol}//${url.host}`)
				.post(`${url.pathname}${url.search}`)
				.reply(200, () => {
					fetchCalledCount += 1;
					return response;
				});
			// Mock the necessary functions
			typoFixer.is_activated = () => true;
			vscode.window.showInformationMessage = () => Promise.resolve();
			vscode.window.showErrorMessage = () => Promise.resolve();
			// execute
			await typoFixer.run();
			// verify
			expect(fetchCalledCount).toBe(1);  // Verify LLM API is called
			expect(editSpy.calledTwice).toBe(true);  // Verify editor is edited
			expect(actualPlaceHolder).toBe(expectedText);
		});

		it('TypoFixer.run does not call vscode.window.activeTextEditor.edit when LLM API response not 200', async () => {
			// setup
			const typoFixer = new TypoFixer();
			const expectedText = 'This is a test line with a typo';
			let fetchCalledCount = 0;
			// mock editor
			const editSpy = sinon.spy();
			sinon.stub(vscode.window, 'activeTextEditor').value({
				selection: {
					active: new vscode.Position(0, 0),
				},
				document: {
					lineAt: () => ({ text: 'This is a test lime with a typoo' }),
				},
				edit: editSpy,
				setDecorations: (decorationType, ranges) => {decorationType; ranges; return;},
			});
			// Mock fetch
			const url = new URL(DEFAULT_API_ENDPOINT);
			const response = {
				choices: [
					{message: {content: expectedText}},
				],
			};
			nock.disableNetConnect();
			nock(`${url.protocol}//${url.host}`)
				.post(`${url.pathname}${url.search}`)
				.reply(400, () => {
					fetchCalledCount += 1;
					return response;
				});
			// Mock the necessary functions
			typoFixer.is_activated = () => true;
			vscode.window.showInformationMessage = () => Promise.resolve();
			vscode.window.showErrorMessage = () => Promise.resolve();
			// execute
			await typoFixer.run();
			// verify
			expect(fetchCalledCount).toBe(1);  // Verify LLM API is called
			expect(editSpy.calledOnce).toBe(false);  // Verify editor is not called
		});

		it('TypoFixer.run does not call vscode.window.activeTextEditor.edit when LLM API response invalid data', async () => {
			// setup
			const typoFixer = new TypoFixer();
			let fetchCalledCount = 0;
			// mock editor
			const editSpy = sinon.spy();
			sinon.stub(vscode.window, 'activeTextEditor').value({
				selection: {
					active: new vscode.Position(0, 0),
				},
				document: {
					lineAt: () => ({ text: 'This is a test lime with a typoo' }),
				},
				edit: editSpy,
				setDecorations: (decorationType, ranges) => {decorationType; ranges; return;},
			});
			// Mock fetch
			const url = new URL(DEFAULT_API_ENDPOINT);
			const invalidResponse = {invalid: true};
			nock.disableNetConnect();
			nock(`${url.protocol}//${url.host}`)
				.post(`${url.pathname}${url.search}`)
				.reply(200, () => {
					fetchCalledCount += 1;
					return invalidResponse;
				});
			// Mock the necessary functions
			typoFixer.is_activated = () => true;
			vscode.window.showInformationMessage = () => Promise.resolve();
			vscode.window.showErrorMessage = () => Promise.resolve();
			// execute
			await typoFixer.run();
			// verify
			expect(fetchCalledCount).toBe(1);  // Verify LLM API is called
			expect(editSpy.calledOnce).toBe(false);  // Verify editor is not called
		});

		afterEach(() => {
			process.env.OPENAI_API_KEY = undefined;
			nock.cleanAll();
		});

	});

	describe('Integration Test', () => {

		let processEnvBackup = undefined;

        beforeEach(() => {
            nock.cleanAll();
            nock.enableNetConnect();
            processEnvBackup = process.env;
            require('dotenv').config({override: true, debug: true, path: '../../.env'});
        });

		it('TypoFixer.run can run', async () => {
			// setup
			const inputText = 'This is a test lime with a typoo.';
			const expectedText = 'This is a test line with a typo.';
			await vscode.workspace.openTextDocument({ content: inputText }).then(doc => vscode.window.showTextDocument(doc));
			// execute
			const typoFixer = new TypoFixer();
			await typoFixer.run();
			// verify
			const editor = vscode.window.activeTextEditor;
			const text = editor.document.getText();
			expect(text).toBe(expectedText);
		});

		afterEach(() => {
            process.env = processEnvBackup;
        });

	});

});