"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runEdgeDriver = exports.installEdgeDriver = void 0;
const driver_1 = require("./driver");
Object.defineProperty(exports, "installEdgeDriver", { enumerable: true, get: function () { return driver_1.installEdgeDriver; } });
const child_process_1 = require("child_process");
const get_port_1 = __importDefault(require("get-port"));
const wait_port_1 = __importDefault(require("wait-port"));
const utils_1 = require("../../dev-server/utils");
const constants_1 = require("../constants");
const runEdgeDriver = async (edgeVersion, { debug = false } = {}) => {
    const edgeDriverPath = await (0, driver_1.installEdgeDriver)(edgeVersion);
    const randomPort = await (0, get_port_1.default)();
    const edgeDriver = (0, child_process_1.spawn)(edgeDriverPath, [`--port=${randomPort}`, debug ? `--verbose` : "--silent"], {
        windowsHide: true,
        detached: false,
    });
    if (debug) {
        (0, utils_1.pipeLogsWithPrefix)(edgeDriver, `[edgedriver@${edgeVersion}] `);
    }
    const gridUrl = `http://127.0.0.1:${randomPort}`;
    process.once("exit", () => edgeDriver.kill());
    await (0, wait_port_1.default)({ port: randomPort, output: "silent", timeout: constants_1.DRIVER_WAIT_TIMEOUT });
    return { gridUrl, process: edgeDriver, port: randomPort };
};
exports.runEdgeDriver = runEdgeDriver;
//# sourceMappingURL=index.js.map