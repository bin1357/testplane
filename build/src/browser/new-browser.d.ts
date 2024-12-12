import URI from "urijs";
import type { Capabilities } from '@wdio/types';
import { Browser, BrowserOpts } from "./browser";
import { Config } from "../config";
import { BrowserConfig } from "../config/browser-config";
export type CapabilityName = "goog:chromeOptions" | "moz:firefoxOptions" | "ms:edgeOptions";
export type HeadlessBrowserOptions = Record<string, {
    capabilityName: CapabilityName;
    getArgs: (headlessMode: BrowserConfig["headless"]) => string[];
}>;
export declare class NewBrowser extends Browser {
    constructor(config: Config, opts: BrowserOpts);
    init(): Promise<NewBrowser>;
    reset(): Promise<void>;
    quit(): Promise<void>;
    protected _createSession(): Promise<WebdriverIO.Browser>;
    protected _setPageLoadTimeout(): Promise<void>;
    protected _isLocalGridUrl(): boolean;
    protected _getSessionOpts(): Promise<Capabilities.WebdriverIOConfig>;
    protected _extendCapabilities(config: BrowserConfig): Promise<WebdriverIO.Capabilities>;
    protected _addHeadlessCapability(headless: BrowserConfig["headless"], capabilities: WebdriverIO.Capabilities): WebdriverIO.Capabilities;
    protected _extendCapabilitiesByVersion(): WebdriverIO.Capabilities;
    protected _getLocalWebdriverGridUrl(): Promise<string>;
    protected _addExecutablePath(config: BrowserConfig, capabilities: WebdriverIO.Capabilities): Promise<WebdriverIO.Capabilities>;
    protected _getGridHost(url: URI): string;
    protected _getQueryParams(query: string): Record<string, string>;
}
