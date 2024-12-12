/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
import { type ChildProcess } from "child_process";
export declare const runSafariDriver: ({ debug }?: {
    debug?: boolean | undefined;
}) => Promise<{
    gridUrl: string;
    process: ChildProcess;
    port: number;
}>;
