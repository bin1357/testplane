"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewBrowser = void 0;
const url_1 = require("url");
// import { RequestOptions } from "https";
const urijs_1 = __importDefault(require("urijs"));
const lodash_1 = require("lodash");
const webdriverio_1 = require("webdriverio");
const browser_1 = require("./browser");
const signal_handler_1 = __importDefault(require("../signal-handler"));
const history_1 = require("./history");
const logger_1 = require("../utils/logger");
const runtime_config_1 = require("../config/runtime-config");
const config_1 = require("../constants/config");
const defaults_1 = require("../config/defaults");
const browser_installer_1 = require("../browser-installer");
const DEFAULT_PORT = 4444;
const headlessBrowserOptions = {
    chrome: {
        capabilityName: "goog:chromeOptions",
        getArgs: (headlessMode) => {
            const headlessValue = (0, lodash_1.isBoolean)(headlessMode) ? "headless" : `headless=${headlessMode}`;
            return [headlessValue, "disable-gpu"];
        },
    },
    firefox: {
        capabilityName: "moz:firefoxOptions",
        getArgs: () => ["-headless"],
    },
    msedge: {
        capabilityName: "ms:edgeOptions",
        getArgs: () => ["--headless"],
    },
    edge: {
        capabilityName: "ms:edgeOptions",
        getArgs: () => ["--headless"],
    },
    microsoftedge: {
        capabilityName: "ms:edgeOptions",
        getArgs: () => ["--headless"],
    },
};
class NewBrowser extends browser_1.Browser {
    constructor(config, opts) {
        super(config, opts);
        signal_handler_1.default.on("exit", () => this.quit());
    }
    async init() {
        this._session = await this._createSession();
        this._extendStacktrace();
        this._addSteps();
        this._addHistory();
        await (0, history_1.runGroup)(this._callstackHistory, "testplane: init browser", async () => {
            this._addCommands();
            this.restoreHttpTimeout();
            await this._setPageLoadTimeout();
        });
        return this;
    }
    reset() {
        return Promise.resolve();
    }
    async quit() {
        try {
            this.setHttpTimeout(this._config.sessionQuitTimeout);
            await this._session.deleteSession();
            this._wdProcess?.free();
        }
        catch (e) {
            (0, logger_1.warn)(`WARNING: Can not close session: ${e.message}`);
            this._wdProcess?.kill();
        }
        finally {
            this._wdProcess = null;
        }
    }
    async _createSession() {
        const sessionOpts = await this._getSessionOpts();
        return (0, webdriverio_1.remote)(sessionOpts);
    }
    async _setPageLoadTimeout() {
        if (!this._config.pageLoadTimeout) {
            return;
        }
        try {
            await this._session.setTimeout({ pageLoad: this._config.pageLoadTimeout });
        }
        catch (e) {
            // edge with w3c does not support setting page load timeout
            if (this._session.isW3C &&
                this._session.capabilities.browserName === "MicrosoftEdge") {
                (0, logger_1.warn)(`WARNING: Can not set page load timeout: ${e.message}`);
            }
            else {
                throw e;
            }
        }
    }
    _isLocalGridUrl() {
        return this._config.gridUrl === config_1.LOCAL_GRID_URL || (0, runtime_config_1.getInstance)().local;
    }
    async _getSessionOpts() {
        const config = this._config;
        let gridUrl;
        if (this._isLocalGridUrl() && config.automationProtocol === config_1.WEBDRIVER_PROTOCOL) {
            gridUrl = await this._getLocalWebdriverGridUrl();
        }
        else {
            // if automationProtocol is not "webdriver", fallback to default grid url from "local"
            // because in "devtools" protocol we dont need gridUrl, but it still has to be valid URL
            gridUrl = config.gridUrl === config_1.LOCAL_GRID_URL ? defaults_1.gridUrl : config.gridUrl;
        }
        const gridUri = new urijs_1.default(gridUrl);
        const capabilities = await this._extendCapabilities(config);
        const { devtools } = (0, runtime_config_1.getInstance)();
        const options = {
            protocol: gridUri.protocol(),
            hostname: this._getGridHost(gridUri),
            port: gridUri.port() ? parseInt(gridUri.port(), 10) : DEFAULT_PORT,
            path: gridUri.path(),
            queryParams: this._getQueryParams(gridUri.query()),
            capabilities,
            automationProtocol: devtools ? config_1.DEVTOOLS_PROTOCOL : config.automationProtocol,
            connectionRetryTimeout: config.sessionRequestTimeout || config.httpTimeout,
            connectionRetryCount: 0, // testplane has its own advanced retries
            baseUrl: config.baseUrl,
            waitforTimeout: config.waitTimeout,
            waitforInterval: config.waitInterval,
            ...this._getSessionOptsFromConfig(),
        };
        return options;
    }
    _extendCapabilities(config) {
        const capabilitiesExtendedByVersion = this.version
            ? this._extendCapabilitiesByVersion()
            : config.desiredCapabilities;
        const capabilitiesWithAddedHeadless = this._addHeadlessCapability(config.headless, capabilitiesExtendedByVersion);
        return this._isLocalGridUrl()
            ? this._addExecutablePath(config, capabilitiesWithAddedHeadless)
            : Promise.resolve(capabilitiesWithAddedHeadless);
    }
    _addHeadlessCapability(headless, capabilities) {
        if (!headless) {
            return capabilities;
        }
        const browserNameLowerCase = capabilities.browserName?.toLocaleLowerCase();
        const capabilitySettings = headlessBrowserOptions[browserNameLowerCase];
        if (!capabilitySettings) {
            (0, logger_1.warn)(`WARNING: Headless setting is not supported for ${capabilities.browserName} browserName`);
            return capabilities;
        }
        const browserCapabilities = (capabilities[capabilitySettings.capabilityName] ??
            {});
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        capabilities[capabilitySettings.capabilityName] = {
            ...browserCapabilities,
            args: [...(browserCapabilities.args ?? []), ...capabilitySettings.getArgs(headless)],
        };
        return capabilities;
    }
    _extendCapabilitiesByVersion() {
        const { desiredCapabilities, sessionEnvFlags } = this._config;
        const versionKeyName = desiredCapabilities.browserVersion || sessionEnvFlags.isW3C ? "browserVersion" : "version";
        return (0, lodash_1.assign)({}, desiredCapabilities, { [versionKeyName]: this.version });
    }
    async _getLocalWebdriverGridUrl() {
        if (!this._wdPool) {
            throw new Error("webdriver pool is not defined");
        }
        if (this._wdProcess) {
            return this._wdProcess.gridUrl;
        }
        this._wdProcess = await this._wdPool.getWebdriver(this._config.desiredCapabilities?.browserName, this._config.desiredCapabilities?.browserVersion, { debug: this._config.system.debug });
        return this._wdProcess.gridUrl;
    }
    async _addExecutablePath(config, capabilities) {
        const browserNameLowerCase = config.desiredCapabilities?.browserName?.toLowerCase();
        const executablePath = await (0, browser_installer_1.installBrowser)(this._config.desiredCapabilities?.browserName, this._config.desiredCapabilities?.browserVersion);
        if (executablePath) {
            const { capabilityName } = headlessBrowserOptions[browserNameLowerCase];
            capabilities[capabilityName] ||= {};
            capabilities[capabilityName].binary ||= executablePath;
        }
        return capabilities;
    }
    _getGridHost(url) {
        return new urijs_1.default({
            username: url.username(),
            password: url.password(),
            hostname: url.hostname(),
        })
            .toString()
            .slice(2); // URIjs leaves `//` prefix, removing it
    }
    _getQueryParams(query) {
        if ((0, lodash_1.isEmpty)(query)) {
            return {};
        }
        const urlParams = new url_1.URLSearchParams(query);
        return Object.fromEntries(urlParams);
    }
}
exports.NewBrowser = NewBrowser;
//# sourceMappingURL=new-browser.js.map