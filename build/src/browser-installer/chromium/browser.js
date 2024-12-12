"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.installChromium = void 0;
const browsers_1 = require("@puppeteer/browsers");
const registry_1 = require("../registry");
const utils_1 = require("../utils");
const utils_2 = require("./utils");
const utils_3 = require("../utils");
const constants_1 = require("../constants");
const installChromium = async (version, { force = false } = {}) => {
    const milestone = (0, utils_1.getMilestone)(version);
    if (Number(milestone) < constants_1.MIN_CHROMIUM_VERSION) {
        throw new Error([
            `chrome@${version} can't be installed.`,
            `Automatic browser downloader is not available for chrome versions < ${constants_1.MIN_CHROMIUM_VERSION}`,
        ].join("\n"));
    }
    const platform = (0, utils_3.getChromePlatform)(version);
    const existingLocallyBrowserVersion = (0, registry_1.getMatchedBrowserVersion)(utils_1.Browser.CHROMIUM, platform, version);
    if (existingLocallyBrowserVersion && !force) {
        (0, utils_1.browserInstallerDebug)(`A locally installed chromium@${version} browser was found. Skipping the installation`);
        return (0, registry_1.getBinaryPath)(utils_1.Browser.CHROMIUM, platform, existingLocallyBrowserVersion);
    }
    const buildId = await (0, utils_2.getChromiumBuildId)(platform, milestone);
    const cacheDir = (0, utils_1.getBrowsersDir)();
    const canBeInstalled = await (0, browsers_1.canDownload)({ browser: utils_1.Browser.CHROMIUM, platform, buildId, cacheDir });
    if (!canBeInstalled) {
        throw new Error([
            `chrome@${version} can't be installed.`,
            `Probably the version '${version}' is invalid, please try another version.`,
            "Version examples: '93', '93.0'",
        ].join("\n"));
    }
    (0, utils_1.browserInstallerDebug)(`installing chromium@${buildId} (${milestone}) for ${platform}`);
    const installFn = (downloadProgressCallback) => (0, browsers_1.install)({
        platform,
        buildId,
        cacheDir,
        downloadProgressCallback,
        browser: utils_1.Browser.CHROMIUM,
        unpack: true,
    }).then(result => result.executablePath);
    return (0, registry_1.installBinary)(utils_1.Browser.CHROMIUM, platform, milestone, installFn);
};
exports.installChromium = installChromium;
//# sourceMappingURL=browser.js.map