/**
 * @returns path to browser binary
 */
export declare const installBrowser: (browserName?: string, browserVersion?: string, { force, installWebDriver }?: {
    force?: boolean | undefined;
    installWebDriver?: boolean | undefined;
}) => Promise<string | null>;
export declare const BrowserInstallStatus: {
    readonly Ok: "ok";
    readonly Skip: "skip";
    readonly Error: "error";
};
type InstallResultSuccess = {
    status: "ok";
};
type InstallResultSkip = {
    status: "skip";
    reason: string;
};
type InstallResultError = {
    status: "error";
    reason: string;
};
export type InstallResult<Status = unknown> = (InstallResultSuccess | InstallResultSkip | InstallResultError) & {
    status: Status;
};
type ForceInstallBinaryResult = Promise<InstallResult>;
export declare const installBrowsersWithDrivers: (browsersToInstall: {
    browserName?: string;
    browserVersion?: string;
}[]) => Promise<Record<string, Awaited<ForceInstallBinaryResult>>>;
export {};
