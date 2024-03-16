const assert = require('assert');
const expect = require('expect').expect;
const vscode = require('vscode');
const nock = require('nock');
const sinon = require('sinon');
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

		it('TypoFixer corrects typo', async () => {

			const typoFixer = new TypoFixer();
			const cursorPosition = new vscode.Position(0, 0);
			const cursorLineText = 'This is a test lime with a typoo';
			const expectedText = 'This is a test line with a typo';
			let actualPlaceHolder = undefined;

			// mock editor
			sinon.stub(vscode.window, 'activeTextEditor').value({
				selection: {
					active: new vscode.Position(0, 0),
				},
				document: {
					lineAt: () => ({ text: 'This is a test lime with a typoo' }),
				},
				edit: (callback, options) => {
					const editBuilder = {
						replace: (range, text) => {
							assert.strictEqual(range.start.line, cursorPosition.line);
							assert.strictEqual(range.start.character, 0);
							assert.strictEqual(range.end.line, cursorPosition.line);
							assert.strictEqual(range.end.character, cursorLineText.length);
							assert.strictEqual(text, expectedText);
							actualPlaceHolder = text;
						}
					};
					options;
					callback(editBuilder);
					return Promise.resolve(true);
				},
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
				.reply(200, response);

			// Mock the necessary functions
			typoFixer.is_activated = () => true;
			vscode.window.showInformationMessage = () => Promise.resolve();
			vscode.window.showErrorMessage = () => Promise.resolve();

			// execute
			await typoFixer.run();

			// verify
			expect(actualPlaceHolder).toBe(expectedText);
		});

		afterEach(() => {
			process.env.OPENAI_API_KEY = undefined;
			nock.cleanAll();
		});

		// TODO: status is not 200 case
		// TODO: invalid response case

		// TODO: integration test
	});

});