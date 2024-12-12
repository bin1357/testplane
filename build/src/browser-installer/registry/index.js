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
exports.installBinary = exports.getMatchedBrowserVersion = exports.getMatchedDriverVersion = exports.getBinaryPath = void 0;
const fs_extra_1 = require("fs-extra");
const path_1 = __importDefault(require("path"));
const utils_1 = require("../utils");
const utils_2 = require("../firefox/utils");
const logger_1 = __importDefault(require("../../utils/logger"));
const registryPath = (0, utils_1.getRegistryPath)();
const registry = (0, fs_extra_1.existsSync)(registryPath) ? (0, fs_extra_1.readJsonSync)(registryPath) : {};
let cliProgressBar = null;
let warnedFirstTimeInstall = false;
const getRegistryKey = (name, platform) => `${name}_${platform}`;
const getBinaryPath = async (name, platform, version) => {
    const registryKey = getRegistryKey(name, platform);
    if (!registry[registryKey]) {
        throw new Error(`Binary '${name}' on '${platform}' is not installed`);
    }
    if (!registry[registryKey][version]) {
        throw new Error(`Version '${version}' of driver '${name}' on '${platform}' is not installed`);
    }
    const binaryRelativePath = await registry[registryKey][version];
    (0, utils_1.browserInstallerDebug)(`resolved '${name}@${version}' on ${platform} to ${binaryRelativePath}`);
    return path_1.default.resolve(registryPath, binaryRelativePath);
};
exports.getBinaryPath = getBinaryPath;
const addBinaryToRegistry = (name, platform, version, absoluteBinaryPath) => {
    const registryKey = getRegistryKey(name, platform);
    const relativePath = path_1.default.relative(registryPath, absoluteBinaryPath);
    registry[registryKey] ||= {};
    registry[registryKey][version] = relativePath;
    const replacer = (_, value) => {
        if (value.then) {
            return;
        }
        return value;
    };
    (0, utils_1.browserInstallerDebug)(`adding '${name}@${version}' on '${platform}' to registry at ${relativePath}`);
    (0, fs_extra_1.outputJSONSync)(registryPath, registry, { replacer });
};
const getBinaryVersions = (name, platform) => {
    const registryKey = getRegistryKey(name, platform);
    if (!registry[registryKey]) {
        return [];
    }
    return Object.keys(registry[registryKey]);
};
const hasBinaryVersion = (name, platform, version) => getBinaryVersions(name, platform).includes(version);
const getMatchedDriverVersion = (driverName, platform, browserVersion) => {
    const registryKey = getRegistryKey(driverName, platform);
    if (!registry[registryKey]) {
        return null;
    }
    if (driverName === utils_1.Driver.CHROMEDRIVER || driverName === utils_1.Driver.EDGEDRIVER) {
        const milestone = (0, utils_1.getMilestone)(browserVersion);
        const buildIds = getBinaryVersions(driverName, platform);
        const suitableBuildIds = buildIds.filter(buildId => buildId.startsWith(milestone));
        if (!suitableBuildIds.length) {
            return null;
        }
        return suitableBuildIds.sort(utils_1.semverVersionsComparator).pop();
    }
    if (driverName === utils_1.Driver.GECKODRIVER) {
        const buildIds = Object.keys(registry[registryKey]);
        const buildIdsSorted = buildIds.sort(utils_1.semverVersionsComparator);
        return buildIdsSorted.length ? buildIdsSorted[buildIdsSorted.length - 1] : null;
    }
    return null;
};
exports.getMatchedDriverVersion = getMatchedDriverVersion;
const getMatchedBrowserVersion = (browserName, platform, browserVersion) => {
    const registryKey = getRegistryKey(browserName, platform);
    if (!registry[registryKey]) {
        return null;
    }
    let buildPrefix;
    switch (browserName) {
        case utils_1.Browser.CHROME:
            buildPrefix = (0, utils_1.normalizeChromeVersion)(browserVersion);
            break;
        case utils_1.Browser.CHROMIUM:
            buildPrefix = (0, utils_1.getMilestone)(browserVersion);
            break;
        case utils_1.Browser.FIREFOX:
            buildPrefix = (0, utils_2.getFirefoxBuildId)(browserVersion);
            break;
        default:
            return null;
    }
    const buildIds = getBinaryVersions(browserName, platform);
    const suitableBuildIds = buildIds.filter(buildId => buildId.startsWith(buildPrefix));
    if (!suitableBuildIds.length) {
        return null;
    }
    const firefoxVersionComparator = (a, b) => {
        a = a.slice(a.indexOf("_") + 1);
        b = b.slice(b.indexOf("_") + 1);
        // Firefox has versions like "stable_131.0a1" and "stable_129.0b9"
        // Parsing raw numbers as hex values is needed in order to distinguish "129.0b9" and "129.0b7" for example
        return parseInt(a.replace(".", ""), 16) - parseInt(b.replace(".", ""), 16);
    };
    const comparator = browserName === utils_1.Browser.FIREFOX ? firefoxVersionComparator : utils_1.semverVersionsComparator;
    const suitableBuildIdsSorted = suitableBuildIds.sort(comparator);
    return suitableBuildIdsSorted[suitableBuildIdsSorted.length - 1];
};
exports.getMatchedBrowserVersion = getMatchedBrowserVersion;
const installBinary = async (name, platform, version, installFn) => {
    const registryKey = getRegistryKey(name, platform);
    if (hasBinaryVersion(name, platform, version)) {
        return (0, exports.getBinaryPath)(name, platform, version);
    }
    (0, utils_1.browserInstallerDebug)(`installing '${name}@${version}' on '${platform}'`);
    if (!cliProgressBar) {
        const { createBrowserDownloadProgressBar } = await Promise.resolve().then(() => __importStar(require("./cli-progress-bar")));
        cliProgressBar = createBrowserDownloadProgressBar();
    }
    const originalDownloadProgressCallback = cliProgressBar.register(name, version);
    const downloadProgressCallback = (...args) => {
        if (!warnedFirstTimeInstall) {
            logger_1.default.warn("Downloading Testplane browsers");
            logger_1.default.warn("Note: this is one-time action. It may take a while...");
            warnedFirstTimeInstall = true;
        }
        return originalDownloadProgressCallback(...args);
    };
    const installPromise = installFn(downloadProgressCallback).then(executablePath => {
        addBinaryToRegistry(name, platform, version, executablePath);
        return executablePath;
    });
    registry[registryKey] ||= {};
    registry[registryKey][version] = installPromise;
    return installPromise;
};
exports.installBinary = installBinary;
//# sourceMappingURL=index.js.map