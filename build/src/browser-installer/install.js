"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.installBrowsersWithDrivers = exports.BrowserInstallStatus = exports.installBrowser = void 0;
const lodash_1 = __importDefault(require("lodash"));
/**
 * @returns path to browser binary
 */
const installBrowser = async (browserName, browserVersion, { force = false, installWebDriver = false } = {}) => {
    const unsupportedBrowserError = new Error([
        `Couldn't install browser '${browserName}', as it is not supported`,
        `Currently supported for installation browsers: 'chrome', 'firefox`,
    ].join("\n"));
    if (!browserName) {
        throw unsupportedBrowserError;
    }
    if (!browserVersion) {
        throw new Error(`Couldn't install browser '${browserName}' because it has invalid version: '${browserVersion}'`);
    }
    if (/chrome/i.test(browserName)) {
        const { installChrome, installChromeDriver } = await Promise.resolve().then(() => __importStar(require("./chrome")));
        return installWebDriver
            ? await Promise.all([
                installChrome(browserVersion, { force }),
                installChromeDriver(browserVersion, { force }),
            ]).then(binaries => binaries[0])
            : installChrome(browserVersion, { force });
    }
    else if (/firefox/i.test(browserName)) {
        const { installFirefox, installLatestGeckoDriver } = await Promise.resolve().then(() => __importStar(require("./firefox")));
        return installWebDriver
            ? await Promise.all([
                installFirefox(browserVersion, { force }),
                installLatestGeckoDriver(browserVersion, { force }),
            ]).then(binaries => binaries[0])
            : installFirefox(browserVersion, { force });
    }
    else if (/edge/i.test(browserName)) {
        const { installEdgeDriver } = await Promise.resolve().then(() => __importStar(require("./edge")));
        if (installWebDriver) {
            await installEdgeDriver(browserVersion, { force });
        }
        return null;
    }
    else if (/safari/i.test(browserName)) {
        return null;
    }
    throw unsupportedBrowserError;
};
exports.installBrowser = installBrowser;
exports.BrowserInstallStatus = {
    Ok: "ok",
    Skip: "skip",
    Error: "error",
};
const forceInstallBinaries = async (installFn, browserName, browserVersion) => {
    return installFn(browserName, browserVersion, { force: true, installWebDriver: true })
        .then(successResult => {
        return successResult
            ? { status: exports.BrowserInstallStatus.Ok }
            : {
                status: exports.BrowserInstallStatus.Skip,
                reason: `Installing ${browserName} is unsupported. Assuming it is installed locally`,
            };
    })
        .catch(errorResult => ({ status: exports.BrowserInstallStatus.Error, reason: errorResult.message }));
};
const installBrowsersWithDrivers = async (browsersToInstall) => {
    const uniqBrowsers = lodash_1.default.uniqBy(browsersToInstall, b => `${b.browserName}@${b.browserVersion}`);
    const installPromises = [];
    const browsersInstallResult = {};
    for (const { browserName, browserVersion } of uniqBrowsers) {
        installPromises.push(forceInstallBinaries(exports.installBrowser, browserName, browserVersion).then(result => {
            browsersInstallResult[`${browserName}@${browserVersion}`] = result;
        }));
    }
    await Promise.all(installPromises);
    return browsersInstallResult;
};
exports.installBrowsersWithDrivers = installBrowsersWithDrivers;
//# sourceMappingURL=install.js.map