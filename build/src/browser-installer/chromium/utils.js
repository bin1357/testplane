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
exports.getChromeDriverArchiveTmpPath = exports.getChromeDriverArchiveUrl = exports.getChromiumBuildId = void 0;
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const browsers_1 = require("@puppeteer/browsers");
const utils_1 = require("../utils");
const constants_1 = require("../constants");
const getChromiumBuildId = async (platform, milestone) => {
    const { default: revisions } = await Promise.resolve(`${`./revisions/${platform}`}`).then(s => __importStar(require(s)));
    return String(revisions[milestone]);
};
exports.getChromiumBuildId = getChromiumBuildId;
const getChromeDriverArchiveUrl = (version) => {
    const chromeDriverArchiveName = {
        linux: "linux64",
        mac: "mac64",
        mac_arm: "mac64_m1", // eslint-disable-line camelcase
        win32: "win32",
        win64: "win32",
    };
    const milestone = (0, utils_1.getMilestone)(version);
    const platform = (0, utils_1.getChromePlatform)(version);
    const isNewMacArm = platform === browsers_1.BrowserPlatform.MAC_ARM && Number(milestone) >= constants_1.MIN_CHROMEDRIVER_MAC_ARM_NEW_ARCHIVE_NAME;
    const archiveName = isNewMacArm ? "mac_arm64" : chromeDriverArchiveName[platform];
    const archiveUrl = `${constants_1.CHROMEDRIVER_STORAGE_API}/${version}/chromedriver_${archiveName}.zip`;
    return archiveUrl;
};
exports.getChromeDriverArchiveUrl = getChromeDriverArchiveUrl;
const getChromeDriverArchiveTmpPath = (version) => {
    const randomString = Math.floor(Math.random() * Date.now()).toString(36);
    return path_1.default.join(os_1.default.tmpdir(), `chromedriver-${version}-${randomString}.zip`);
};
exports.getChromeDriverArchiveTmpPath = getChromeDriverArchiveTmpPath;
//# sourceMappingURL=utils.js.map