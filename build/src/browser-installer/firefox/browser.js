"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.installFirefox = void 0;
const browsers_1 = require("@puppeteer/browsers");
const utils_1 = require("../utils");
const registry_1 = require("../registry");
const utils_2 = require("./utils");
const installFirefox = async (version, { force = false } = {}) => {
    const platform = (0, utils_1.getBrowserPlatform)();
    const existingLocallyBrowserVersion = (0, registry_1.getMatchedBrowserVersion)(utils_1.Browser.FIREFOX, platform, version);
    if (existingLocallyBrowserVersion && !force) {
        (0, utils_1.browserInstallerDebug)(`A locally installed firefox@${version} browser was found. Skipping the installation`);
        return (0, registry_1.getBinaryPath)(utils_1.Browser.FIREFOX, platform, existingLocallyBrowserVersion);
    }
    const normalizedVersion = (0, utils_2.normalizeFirefoxVersion)(version);
    const buildId = (0, utils_2.getFirefoxBuildId)(normalizedVersion);
    const cacheDir = (0, utils_1.getBrowsersDir)();
    const canBeInstalled = await (0, browsers_1.canDownload)({ browser: utils_1.Browser.FIREFOX, platform, buildId, cacheDir });
    if (!canBeInstalled) {
        throw new Error([
            `firefox@${version} can't be installed.`,
            `Probably the version '${version}' is invalid, please try another version.`,
            "Version examples: '120', '130.0', '131.0'",
        ].join("\n"));
    }
    (0, utils_1.browserInstallerDebug)(`installing firefox@${buildId} for ${platform}`);
    const installFn = (downloadProgressCallback) => (0, browsers_1.install)({
        platform,
        buildId,
        cacheDir,
        downloadProgressCallback,
        browser: utils_1.Browser.FIREFOX,
        unpack: true,
    }).then(result => result.executablePath);
    return (0, registry_1.installBinary)(utils_1.Browser.FIREFOX, platform, buildId, installFn);
};
exports.installFirefox = installFirefox;
//# sourceMappingURL=browser.js.map