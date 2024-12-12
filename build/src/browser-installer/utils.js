"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unzipFile = exports.downloadFile = exports.retryFetch = exports.getChromeDriverDir = exports.getChromiumDriverDir = exports.getEdgeDriverDir = exports.getGeckoDriverDir = exports.getBrowsersDir = exports.getRegistryPath = exports.getChromePlatform = exports.getBrowserPlatform = exports.normalizeChromeVersion = exports.semverVersionsComparator = exports.getMilestone = exports.createBrowserLabel = exports.getDriverNameForBrowserName = exports.Driver = exports.Browser = exports.browserInstallerDebug = void 0;
const browsers_1 = require("@puppeteer/browsers");
const extract_zip_1 = __importDefault(require("extract-zip"));
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const fs_1 = require("fs");
const stream_1 = require("stream");
const debug_1 = __importDefault(require("debug"));
const constants_1 = require("./constants");
exports.browserInstallerDebug = (0, debug_1.default)("testplane:browser-installer");
exports.Browser = {
    CHROME: browsers_1.Browser.CHROME,
    CHROMIUM: browsers_1.Browser.CHROMIUM,
    FIREFOX: browsers_1.Browser.FIREFOX,
    SAFARI: "safari",
    EDGE: "MicrosoftEdge",
};
exports.Driver = {
    CHROMEDRIVER: browsers_1.Browser.CHROMEDRIVER,
    GECKODRIVER: "geckodriver",
    SAFARIDRIVER: "safaridriver",
    EDGEDRIVER: "edgedriver",
};
const getDriverNameForBrowserName = (browserName) => {
    if (browserName === exports.Browser.CHROME || browserName === exports.Browser.CHROMIUM) {
        return exports.Driver.CHROMEDRIVER;
    }
    if (browserName === exports.Browser.FIREFOX) {
        return exports.Driver.GECKODRIVER;
    }
    if (browserName === exports.Browser.SAFARI) {
        return exports.Driver.SAFARIDRIVER;
    }
    if (browserName === exports.Browser.EDGE) {
        return exports.Driver.EDGEDRIVER;
    }
    return null;
};
exports.getDriverNameForBrowserName = getDriverNameForBrowserName;
const createBrowserLabel = (browserName, version = "latest") => browserName + "@" + version;
exports.createBrowserLabel = createBrowserLabel;
const getMilestone = (version) => {
    if (typeof version === "number") {
        return String(version);
    }
    return version.split(".")[0];
};
exports.getMilestone = getMilestone;
const semverVersionsComparator = (a, b) => {
    const splitVersion = (version) => version
        .replaceAll(/[^\d.]/g, "")
        .split(".")
        .filter(Boolean)
        .map(Number);
    const versionPartsA = splitVersion(a);
    const versionPartsB = splitVersion(b);
    for (let i = 0; i < Math.min(versionPartsA.length, versionPartsB.length); i++) {
        if (versionPartsA[i] !== versionPartsB[i]) {
            return versionPartsA[i] - versionPartsB[i];
        }
    }
    return 0;
};
exports.semverVersionsComparator = semverVersionsComparator;
const normalizeChromeVersion = (version) => {
    const versionParts = version.split(".").filter(Boolean);
    if (versionParts.length === 2) {
        return versionParts[0];
    }
    if (versionParts.length >= 3) {
        return versionParts.slice(0, 3).join(".");
    }
    return versionParts[0];
};
exports.normalizeChromeVersion = normalizeChromeVersion;
const getBrowserPlatform = () => {
    const platform = (0, browsers_1.detectBrowserPlatform)();
    if (!platform) {
        throw new Error(`Got an error while trying to download browsers: platform "${platform}" is not supported`);
    }
    return platform;
};
exports.getBrowserPlatform = getBrowserPlatform;
const getChromePlatform = (version) => {
    const milestone = (0, exports.getMilestone)(version);
    const platform = (0, exports.getBrowserPlatform)();
    if (platform === browsers_1.BrowserPlatform.MAC_ARM && Number(milestone) < constants_1.MIN_CHROMIUM_MAC_ARM_VERSION) {
        return browsers_1.BrowserPlatform.MAC;
    }
    return platform;
};
exports.getChromePlatform = getChromePlatform;
const resolveUserPath = (userPath) => userPath.startsWith("~") ? path_1.default.resolve(os_1.default.homedir(), userPath.slice(1)) : path_1.default.resolve(userPath);
const getCacheDir = (envValueOverride = process.env.TESTPLANE_BROWSERS_PATH) => envValueOverride ? resolveUserPath(envValueOverride) : path_1.default.join(os_1.default.homedir(), ".testplane");
const getRegistryPath = (envValueOverride) => path_1.default.join(getCacheDir(envValueOverride), "registry.json");
exports.getRegistryPath = getRegistryPath;
const getBrowsersDir = () => path_1.default.join(getCacheDir(), "browsers");
exports.getBrowsersDir = getBrowsersDir;
const getDriversDir = () => path_1.default.join(getCacheDir(), "drivers");
const getDriverDir = (driverName, driverVersion) => path_1.default.join(getDriversDir(), driverName, driverVersion);
const getGeckoDriverDir = (driverVersion) => getDriverDir("geckodriver", (0, exports.getBrowserPlatform)() + "-" + driverVersion);
exports.getGeckoDriverDir = getGeckoDriverDir;
const getEdgeDriverDir = (driverVersion) => getDriverDir("edgedriver", (0, exports.getBrowserPlatform)() + "-" + driverVersion);
exports.getEdgeDriverDir = getEdgeDriverDir;
const getChromiumDriverDir = (driverVersion) => getDriverDir("chromedriver", (0, exports.getBrowserPlatform)() + "-" + driverVersion);
exports.getChromiumDriverDir = getChromiumDriverDir;
const getChromeDriverDir = () => getDriversDir(); // path is set by @puppeteer/browsers.install
exports.getChromeDriverDir = getChromeDriverDir;
const retryFetch = async (url, opts, retry = 3, retryDelay = 100) => {
    while (retry > 0) {
        try {
            return await fetch(url, opts);
        }
        catch (e) {
            retry = retry - 1;
            if (retry <= 0) {
                throw e;
            }
            await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
    }
    return null;
};
exports.retryFetch = retryFetch;
const downloadFile = async (url, filePath) => {
    const writeStream = (0, fs_1.createWriteStream)(filePath);
    const response = await fetch(url);
    if (!response.ok || !response.body) {
        throw new Error(`Unable to download file from ${url}: ${response.statusText}`);
    }
    const stream = stream_1.Readable.fromWeb(response.body).pipe(writeStream);
    return new Promise((resolve, reject) => {
        stream.on("error", reject);
        stream.on("close", resolve);
    });
};
exports.downloadFile = downloadFile;
const unzipFile = async (zipPath, outputDir) => {
    await (0, extract_zip_1.default)(zipPath, { dir: outputDir });
    return outputDir;
};
exports.unzipFile = unzipFile;
//# sourceMappingURL=utils.js.map