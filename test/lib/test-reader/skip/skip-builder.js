'use strict';

const Skip = require('build/test-reader/skip/');
const SkipBuilder = require('build/test-reader/skip/skip-builder');

describe('SkipBuilder', () => {
    let skip;

    beforeEach(() => {
        skip = new Skip();
    });

    describe('.in', () => {
        it('should skip test if browsers match', () => {
            const skipApi = new SkipBuilder(skip, 'browserId');

            skipApi.in('browserId');

            assert.equal(skip.shouldSkip, true);
        });

        it('should not skip test if browsers did not match', () => {
            const skipApi = new SkipBuilder(skip, 'browserId');

            skipApi.in('anotherbrowserId');

            assert.equal(skip.shouldSkip, false);
        });

        it('should support RegExp as a matcher for browser', () => {
            const skipApi = new SkipBuilder(skip, 'browserId');

            skipApi.in(/bro/);

            assert.equal(skip.shouldSkip, true);
        });

        it('should support array of matchers', () => {
            const skipApi = new SkipBuilder(skip, 'browserId');

            skipApi.in([/bro/, 'someBrowserId']);

            assert.equal(skip.shouldSkip, true);
        });

        it('should add comment to skipped test', () => {
            const skipApi = new SkipBuilder(skip, 'browserId');

            skipApi.in('browserId', 'some comment');

            assert.equal(skip.comment, 'some comment');
        });

        it('should skip test with actual comment', () => {
            const skipApi = new SkipBuilder(skip, 'browserId');

            skipApi
                .in('browserId', 'some comment')
                .in('anotherBrowserId', 'another comment');

            assert.equal(skip.comment, 'some comment');
        });

        it('should override comment if test was matched twice', () => {
            const skipApi = new SkipBuilder(skip, 'browserId');

            skipApi
                .in('browserId', 'some comment')
                .notIn('anotherBrowserId', 'another comment');

            assert.equal(skip.comment, 'another comment');
        });

        it('should skip silently if silent option is specified as true', () => {
            const skipApi = new SkipBuilder(skip, 'browserId');

            skipApi.in('browserId', '', {silent: true});

            assert.equal(skip.silent, true);
        });

        it('should skip loudly if silent option is specified as false', () => {
            const skipApi = new SkipBuilder(skip, 'browserId');

            skipApi.in('browserId', '', {silent: false});

            assert.equal(skip.silent, false);
        });

        it('should skip loudly if options are not passed', () => {
            const skipApi = new SkipBuilder(skip, 'browserId');

            skipApi.in('browserId');

            assert.equal(skip.silent, false);
        });
    });

    describe('.notIn', () => {
        it('should invert result of matching', () => {
            const skipApi = new SkipBuilder(skip, 'browserId');

            skipApi.notIn('browserId');

            assert.equal(skip.shouldSkip, false);
        });

        it('should skip browser if it was matched', () => {
            const skipApi = new SkipBuilder(skip, 'browserId');

            skipApi.notIn('anotherBrowserId');

            assert.equal(skip.shouldSkip, true);
        });
    });
});
