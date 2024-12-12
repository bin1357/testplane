import type { SupportedBrowser } from "../browser-installer";
export type WdProcess = {
    gridUrl: string;
    free: () => void;
    kill: () => void;
};
export declare class WebdriverPool {
    private driverProcess;
    private portToDriverProcess;
    constructor();
    getWebdriver(browserName: SupportedBrowser, browserVersion: string, { debug }?: {
        debug?: boolean | undefined;
    }): ReturnType<typeof this.createWebdriverProcess>;
    private freeWebdriver;
    private killWebdriver;
    private createWebdriverProcess;
}
