/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
import type { ChildProcess } from "child_process";
import { installFirefox } from "./browser";
import { installLatestGeckoDriver } from "./driver";
export { installFirefox, installLatestGeckoDriver };
export declare const runGeckoDriver: (firefoxVersion: string, { debug }?: {
    debug?: boolean | undefined;
}) => Promise<{
    gridUrl: string;
    process: ChildProcess;
    port: number;
}>;
