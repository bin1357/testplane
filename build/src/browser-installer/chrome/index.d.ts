/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
import { type ChildProcess } from "child_process";
import { installChrome } from "./browser";
import { installChromeDriver } from "./driver";
export { installChrome, installChromeDriver };
export declare const runChromeDriver: (chromeVersion: string, { debug }?: {
    debug?: boolean | undefined;
}) => Promise<{
    gridUrl: string;
    process: ChildProcess;
    port: number;
}>;
