"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tryToRegisterTsNode = void 0;
const lodash_1 = __importDefault(require("lodash"));
const tryToRegisterTsNode = () => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { REGISTER_INSTANCE } = require("ts-node");
        if (lodash_1.default.get(process, REGISTER_INSTANCE)) {
            return;
        }
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { register } = require("ts-node");
        let swc = false;
        try {
            require("@swc/core");
            swc = true;
        }
        catch { } // eslint-disable-line no-empty
        register({
            skipProject: JSON.parse(process.env.TS_NODE_SKIP_PROJECT ?? "true"),
            transpileOnly: JSON.parse(process.env.TS_NODE_TRANSPILE_ONLY ?? "true"),
            swc: JSON.parse(process.env.TS_NODE_SWC ?? swc.toString()),
        });
    }
    catch { } // eslint-disable-line no-empty
};
exports.tryToRegisterTsNode = tryToRegisterTsNode;
//# sourceMappingURL=typescript.js.map