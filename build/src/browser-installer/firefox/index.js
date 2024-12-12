"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runGeckoDriver = exports.installLatestGeckoDriver = exports.installFirefox = void 0;
const geckodriver_1 = require("geckodriver");
const get_port_1 = __importDefault(require("get-port"));
const wait_port_1 = __importDefault(require("wait-port"));
const browser_1 = require("./browser");
Object.defineProperty(exports, "installFirefox", { enumerable: true, get: function () { return browser_1.installFirefox; } });
const driver_1 = require("./driver");
Object.defineProperty(exports, "installLatestGeckoDriver", { enumerable: true, get: function () { return driver_1.installLatestGeckoDriver; } });
const utils_1 = require("../../dev-server/utils");
const constants_1 = require("../constants");
const runGeckoDriver = async (firefoxVersion, { debug = false } = {}) => {
    const [geckoDriverPath] = await Promise.all([
        (0, driver_1.installLatestGeckoDriver)(firefoxVersion),
        (0, browser_1.installFirefox)(firefoxVersion),
    ]);
    const randomPort = await (0, get_port_1.default)();
    const geckoDriver = await (0, geckodriver_1.start)({
        customGeckoDriverPath: geckoDriverPath,
        port: randomPort,
        log: debug ? "debug" : "fatal",
        spawnOpts: {
            windowsHide: true,
            detached: false,
        },
    });
    if (debug) {
        (0, utils_1.pipeLogsWithPrefix)(geckoDriver, `[geckodriver@${firefoxVersion}] `);
    }
    const gridUrl = `http://127.0.0.1:${randomPort}`;
    process.once("exit", () => geckoDriver.kill());
    await (0, wait_port_1.default)({ port: randomPort, output: "silent", timeout: constants_1.DRIVER_WAIT_TIMEOUT });
    return { gridUrl, process: geckoDriver, port: randomPort };
};
exports.runGeckoDriver = runGeckoDriver;
//# sourceMappingURL=index.js.map