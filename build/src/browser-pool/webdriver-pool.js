"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebdriverPool = void 0;
const browser_installer_1 = require("../browser-installer");
class WebdriverPool {
    constructor() {
        this.driverProcess = new Map();
        this.portToDriverProcess = new Map();
    }
    async getWebdriver(browserName, browserVersion, { debug = false } = {}) {
        const driverName = (0, browser_installer_1.getDriverNameForBrowserName)(browserName);
        if (!driverName) {
            throw new Error([
                `Couldn't run browser driver for "${browserName}", as this browser is not supported`,
                `Supported browsers: "chrome", "firefox", "safari", "MicrosoftEdge"`,
            ].join("\n"));
        }
        if (!browserVersion) {
            throw new Error(`Couldn't run browser driver for "${browserName}" because its version is undefined`);
        }
        const wdProcesses = this.driverProcess.get(driverName)?.get(browserVersion) ?? {};
        for (const port in wdProcesses) {
            if (!wdProcesses[port].isBusy) {
                wdProcesses[port].isBusy = true;
                return {
                    gridUrl: wdProcesses[port].gridUrl,
                    free: () => this.freeWebdriver(port),
                    kill: () => this.killWebdriver(driverName, browserVersion, port),
                };
            }
        }
        return this.createWebdriverProcess(driverName, browserVersion, { debug });
    }
    freeWebdriver(port) {
        const wdProcess = this.portToDriverProcess.get(port);
        if (wdProcess) {
            wdProcess.isBusy = false;
        }
    }
    killWebdriver(driverName, browserVersion, port) {
        const wdProcess = this.portToDriverProcess.get(port);
        const nodes = this.driverProcess.get(driverName)?.get(browserVersion);
        if (wdProcess && nodes) {
            wdProcess.process.kill();
            this.portToDriverProcess.delete(port);
            delete nodes[port];
        }
    }
    async createWebdriverProcess(driverName, browserVersion, { debug = false } = {}) {
        const driver = await (0, browser_installer_1.runBrowserDriver)(driverName, browserVersion, { debug });
        if (!this.driverProcess.has(driverName)) {
            this.driverProcess.set(driverName, new Map());
        }
        if (!this.driverProcess.get(driverName)?.has(browserVersion)) {
            this.driverProcess.get(driverName)?.set(browserVersion, {});
        }
        const nodes = this.driverProcess.get(driverName)?.get(browserVersion);
        const node = { process: driver.process, gridUrl: driver.gridUrl, isBusy: true };
        nodes[driver.port] = node;
        this.portToDriverProcess.set(String(driver.port), node);
        return {
            gridUrl: driver.gridUrl,
            free: () => this.freeWebdriver(String(driver.port)),
            kill: () => this.killWebdriver(driverName, browserVersion, String(driver.port)),
        };
    }
}
exports.WebdriverPool = WebdriverPool;
//# sourceMappingURL=webdriver-pool.js.map