'use strict';

const Promise = require('bluebird');

module.exports = class ExecutionThread {
    static create(...args) {
        return new this(...args);
    }

    constructor({test, browser, hermioneCtx, screenshooter}) {
        this._browserConfig = browser.config;
        this._hermioneCtx = hermioneCtx;
        this._screenshooter = screenshooter;
        this._ctx = {
            browser: browser.publicAPI,
            currentTest: test
        };
    }

    async run(runnable) {
        this._setExecutionContext(Object.assign(runnable, {
            hermioneCtx: this._hermioneCtx,
            ctx: this._ctx
        }));

        try {
            await this._call(runnable);
        } catch (err) {
            this._ctx.currentTest.err = this._ctx.currentTest.err || err;

            throw err;
        } finally {
            this._setExecutionContext(null);
        }
    }

    _call(runnable) {
        let fnPromise = Promise.method(runnable.fn).apply(this._ctx);

        if (runnable.timeout()) {
            const msg = `${runnable.type} '${runnable.fullTitle()}' timed out after ${runnable.timeout()} ms`;
            fnPromise = fnPromise.timeout(runnable.timeout(), msg);
        }

        return fnPromise.finally(() => {
            const hasAssertViewFails = this._hermioneCtx.assertViewResults && this._hermioneCtx.assertViewResults.hasFails();

            if (fnPromise.isRejected() || (hasAssertViewFails && this._browserConfig.screenshotOnAssertViewFail)) {
                return this._screenshooter.captureScreenshot();
            }
        });
    }

    _setExecutionContext(context) {
        Object.getPrototypeOf(this._ctx.browser).executionContext = context;
    }
};
