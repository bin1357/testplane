export = ExistingBrowser;
declare class ExistingBrowser extends Browser {
    static create(config: any, id: any, version: any, emitter: any): import("./existing-browser");
    constructor(config: any, id: any, version: any, emitter: any);
    _emitter: any;
    _camera: Camera;
    _meta: any;
    init({ sessionId, sessionCaps, sessionOpts }: {
        sessionId: any;
        sessionCaps: any;
        sessionOpts: any;
    } | undefined, calibrator: any): globalThis.Promise<import("./existing-browser")>;
    markAsBroken(): void;
    quit(): void;
    prepareScreenshot(selectors: any, opts?: {}): globalThis.Promise<any>;
    open(url: any): any;
    evalScript(script: any): any;
    injectScript(script: any): any;
    captureViewportImage(page: any, screenshotDelay: any): globalThis.Promise<import("../image")>;
    scrollBy(params: any): any;
    _attachSession({ sessionId, sessionCaps, sessionOpts }: {
        sessionId: any;
        sessionCaps: any;
        sessionOpts?: {} | undefined;
    }): globalThis.Promise<WebdriverIO.Browser>;
    _initMeta(): any;
    _takeScreenshot(): any;
    _addMetaAccessCommands(session: any): void;
    _decorateUrlMethod(session: any): void;
    _resolveUrl(uri: any): any;
    _performIsolation({ sessionCaps, sessionOpts }: {
        sessionCaps: any;
        sessionOpts: any;
    }): globalThis.Promise<void>;
    _prepareSession(): globalThis.Promise<void>;
    _setOrientation(orientation: any): globalThis.Promise<void>;
    _setWindowSize(size: any): globalThis.Promise<void>;
    _performCalibration(calibrator: any): any;
    _calibration: any;
    _buildClientScripts(): Promise<clientBridge.ClientBridge>;
    _clientBridge: clientBridge.ClientBridge | undefined;
    _stubCommands(): void;
    get meta(): any;
    get emitter(): any;
}
import Browser = require("./browser");
import Camera = require("./camera");
import clientBridge = require("./client-bridge");
import Promise = require("bluebird");
