/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
import type { ChildProcess } from "child_process";
import { type SupportedDriver } from "./utils";
export declare const runBrowserDriver: (driverName: SupportedDriver, browserVersion: string, { debug }?: {
    debug?: boolean | undefined;
}) => Promise<{
    gridUrl: string;
    process: ChildProcess;
    port: number;
}>;
