import { io } from "socket.io-client";
import { BrowserError } from "./errors/index.js";
import { BROWSER_EVENT_PREFIX } from "./constants.js";
const RECONNECT_KEY = "__testplane__.reconnect";
const connectToSocket = () => {
    const socket = io({
        auth: {
            runUuid: window.__testplane__.runUuid,
            type: BROWSER_EVENT_PREFIX,
            reconnect: Boolean(sessionStorage.getItem(RECONNECT_KEY)),
        },
    });
    socket.on("connect_error", err => {
        const { runUuid, sessionId, file } = window.__testplane__;
        console.error(`Couldn't connect to the server with "runUuid=${runUuid}", "sessionId=${sessionId} and "file=${file}" due to an error: ${err}`);
    });
    return socket;
};
const proxyTool = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const proxyHandler = {
        get(target, prop) {
            return prop in target ? target[prop] : new Proxy(() => { }, this);
        },
        apply() {
            return new Proxy(() => { }, this);
        },
    };
    window.testplane = new Proxy(window.testplane || {}, proxyHandler);
    window.hermione = new Proxy(window.hermione || {}, proxyHandler);
};
const subscribeOnBrowserErrors = () => {
    addEventListener("error", e => window.__testplane__.errors.push(BrowserError.create({
        message: e.message,
        stack: e.error.stack,
        file: e.filename,
    })));
};
const mockDialog = ({ name, value }) => (...params) => {
    const formatedParams = params.map(p => JSON.stringify(p)).join(", ");
    console.warn(`Testplane encountered a \`${name}(${formatedParams})\` call that would block the web page and won't allow the test to continue, so it was mocked and \`${value}\` was returned instead.`);
    return value;
};
const mockBlockingDialogs = () => {
    window.alert = mockDialog({ name: "alert", value: undefined });
    window.confirm = mockDialog({ name: "confirm", value: false });
    window.prompt = mockDialog({ name: "prompt", value: null });
};
const mockBuiltInNodeJsModules = () => {
    window.process = window.process || {
        platform: "browser",
        env: {},
        stdout: {},
        stderr: {},
        cwd: () => "",
    };
};
window.__testplane__.errors = [];
window.__testplane__.socket = connectToSocket();
sessionStorage.setItem(RECONNECT_KEY, true.toString());
proxyTool();
subscribeOnBrowserErrors();
mockBlockingDialogs();
mockBuiltInNodeJsModules();
//# sourceMappingURL=globals.js.map