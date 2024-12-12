"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.installEdgeDriver = void 0;
const edgedriver_1 = require("edgedriver");
const utils_1 = require("../utils");
const registry_1 = require("../registry");
const constants_1 = require("../constants");
const getLatestMajorEdgeDriverVersion = async (milestone) => {
    const fullVersion = await (0, utils_1.retryFetch)(`${constants_1.MSEDGEDRIVER_API}/LATEST_RELEASE_${milestone}`).then(res => res.text());
    if (!fullVersion) {
        throw new Error(`Couldn't resolve latest edgedriver version for ${milestone}`);
    }
    const versionNormalized = fullVersion
        .split("")
        .filter(char => /\.|\d/.test(char))
        .join("");
    (0, utils_1.browserInstallerDebug)(`resolved latest edgedriver@${milestone} version: ${versionNormalized}`);
    return versionNormalized;
};
const installEdgeDriver = async (edgeVersion, { force = false } = {}) => {
    const platform = (0, utils_1.getBrowserPlatform)();
    const existingLocallyDriverVersion = (0, registry_1.getMatchedDriverVersion)(utils_1.Driver.EDGEDRIVER, platform, edgeVersion);
    if (existingLocallyDriverVersion && !force) {
        (0, utils_1.browserInstallerDebug)(`A locally installed edgedriver for edge@${edgeVersion} browser was found. Skipping the installation`);
        return (0, registry_1.getBinaryPath)(utils_1.Driver.EDGEDRIVER, platform, existingLocallyDriverVersion);
    }
    const milestone = (0, utils_1.getMilestone)(edgeVersion);
    if (Number(milestone) < constants_1.MIN_EDGEDRIVER_VERSION) {
        throw new Error(`Automatic driver downloader is not available for Edge versions < ${constants_1.MIN_EDGEDRIVER_VERSION}`);
    }
    const driverVersion = await getLatestMajorEdgeDriverVersion(milestone);
    const installFn = () => (0, edgedriver_1.download)(driverVersion, (0, utils_1.getEdgeDriverDir)(driverVersion));
    return (0, registry_1.installBinary)(utils_1.Driver.EDGEDRIVER, platform, driverVersion, installFn);
};
exports.installEdgeDriver = installEdgeDriver;
//# sourceMappingURL=driver.js.map