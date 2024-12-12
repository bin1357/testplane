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
Object.defineProperty(exports, "__esModule", { value: true });
exports.installChrome = void 0;
const browsers_1 = require("@puppeteer/browsers");
const constants_1 = require("../constants");
const utils_1 = require("../utils");
const registry_1 = require("../registry");
const utils_2 = require("../utils");
const installChrome = async (version, { force = false } = {}) => {
    const milestone = (0, utils_1.getMilestone)(version);
    if (Number(milestone) < constants_1.MIN_CHROME_FOR_TESTING_VERSION) {
        (0, utils_1.browserInstallerDebug)(`couldn't install chrome@${version}, installing chromium instead`);
        const { installChromium } = await Promise.resolve().then(() => __importStar(require("../chromium")));
        return installChromium(version, { force });
    }
    const platform = (0, utils_1.getBrowserPlatform)();
    const existingLocallyBrowserVersion = (0, registry_1.getMatchedBrowserVersion)(utils_1.Browser.CHROME, platform, version);
    if (existingLocallyBrowserVersion && !force) {
        (0, utils_1.browserInstallerDebug)(`A locally installed chrome@${version} browser was found. Skipping the installation`);
        return (0, registry_1.getBinaryPath)(utils_1.Browser.CHROME, platform, existingLocallyBrowserVersion);
    }
    const normalizedVersion = (0, utils_2.normalizeChromeVersion)(version);
    const buildId = await (0, browsers_1.resolveBuildId)(utils_1.Browser.CHROME, platform, normalizedVersion);
    const cacheDir = (0, utils_1.getBrowsersDir)();
    const canBeInstalled = await (0, browsers_1.canDownload)({ browser: utils_1.Browser.CHROME, platform, buildId, cacheDir });
    if (!canBeInstalled) {
        throw new Error([
            `chrome@${version} can't be installed.`,
            `Probably the version '${version}' is invalid, please try another version.`,
            "Version examples: '120', '120.0'",
        ].join("\n"));
    }
    const installFn = (downloadProgressCallback) => (0, browsers_1.install)({
        platform,
        buildId,
        cacheDir,
        downloadProgressCallback,
        browser: utils_1.Browser.CHROME,
        unpack: true,
    }).then(result => result.executablePath);
    return (0, registry_1.installBinary)(utils_1.Browser.CHROME, platform, buildId, installFn);
};
exports.installChrome = installChrome;
//# sourceMappingURL=browser.js.map