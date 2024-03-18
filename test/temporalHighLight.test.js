const expect = require('expect').expect;
const diff = require('diff');
const rewire = require('rewire');
const temporalHighLight = rewire('../temporalHighLight');

describe('temporalHighLight Test Suite', () => {
    describe('Unit Test', () => {
        [
            [
                'this is a test line with a typo',
                'this is a test line with a typo',
                change => change.added || change.removed,
                [],
                'No change',
            ],
            [
                'this is a test line with a typo',
                'this is a line with a typo',
                change => change.removed,
                [{start: 10, end: 15}],
                'A word is removed',
            ],
            [
                'this is a test line with a typo',
                'this is a test line with a typo and a typo',
                change => change.added,
                [{start: 31, end: 42}],
                'A word is added',
            ],
            [
                'this is a test line with a typo',
                'this is a new line with a typo',
                change => change.added || change.removed,
                [{start: 10, end: 11}, {start: 11, end: 12}, {start: 13, end: 15}, {start: 15, end: 16}],
                'A word is added and a word is removed',
            ],
        ].forEach(([beforeText, afterText, condition, expected, caseInfo]) => {
            it(`specifyHighlightPosition returns ${expected} for ${caseInfo}`, () => {
                const changes = diff.diffChars(beforeText, afterText);
                expect(temporalHighLight.__get__('specifyHighlightPosition')(changes, condition)).toEqual(expected);
            });
        });
    });
    describe('Integration Test', () => {});
});

