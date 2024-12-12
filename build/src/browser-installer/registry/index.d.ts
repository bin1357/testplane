import type { BrowserPlatform } from "@puppeteer/browsers";
import { type SupportedBrowser, type SupportedDriver, type DownloadProgressCallback } from "../utils";
type BinaryName = Exclude<SupportedBrowser | SupportedDriver, SupportedBrowser & SupportedDriver>;
export declare const getBinaryPath: (name: BinaryName, platform: BrowserPlatform, version: string) => Promise<string>;
export declare const getMatchedDriverVersion: (driverName: SupportedDriver, platform: BrowserPlatform, browserVersion: string) => string | null;
export declare const getMatchedBrowserVersion: (browserName: SupportedBrowser, platform: BrowserPlatform, browserVersion: string) => string | null;
export declare const installBinary: (name: BinaryName, platform: BrowserPlatform, version: string, installFn: (downloadProgressCallback: DownloadProgressCallback) => Promise<string>) => Promise<string>;
export {};
