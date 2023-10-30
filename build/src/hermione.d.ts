import { CommanderStatic } from "@gemini-testing/commander";
import { BaseHermione } from "./base-hermione";
import { MainRunner } from "./runner";
import { TestCollection } from "./test-collection";
import { ConfigInput } from "./config/types";
import { MasterEventHandler, Test } from "./types";
interface RunOpts {
    browsers?: string[];
    sets?: string[];
    grep?: string;
    updateRefs?: boolean;
    requireModules?: string[];
    inspectMode?: {
        inspect: boolean;
        inspectBrk: boolean;
    };
    reporters?: string[];
}
interface ReadTestsOpts {
    browsers: string[];
    sets: string[];
    grep: string | RegExp;
    silent: boolean;
    ignore: string | string[];
}
export interface Hermione {
    on: MasterEventHandler<this>;
    once: MasterEventHandler<this>;
    prependListener: MasterEventHandler<this>;
}
export declare class Hermione extends BaseHermione {
    protected failed: boolean;
    protected runner: MainRunner | null;
    constructor(config?: string | ConfigInput);
    extendCli(parser: CommanderStatic): void;
    run(testPaths: TestCollection | string[], { browsers, sets, grep, updateRefs, requireModules, inspectMode, reporters }?: Partial<RunOpts>): Promise<boolean>;
    protected _readTests(testPaths: string[] | TestCollection, opts: Partial<ReadTestsOpts>): Promise<TestCollection>;
    addTestToRun(test: Test, browserId: string): boolean;
    readTests(testPaths: string[], { browsers, sets, grep, silent, ignore }?: Partial<ReadTestsOpts>): Promise<TestCollection>;
    isFailed(): boolean;
    protected _fail(): void;
    isWorker(): boolean;
    halt(err: Error, timeout?: number): void;
}
export {};
