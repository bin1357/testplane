"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBrowserDownloadProgressBar = void 0;
const cli_progress_1 = require("cli-progress");
const constants_1 = require("../constants");
const createBrowserDownloadProgressBar = () => {
    const progressBar = new cli_progress_1.MultiBar({
        stopOnComplete: true,
        forceRedraw: true,
        autopadding: true,
        hideCursor: true,
        fps: 5,
        format: " [{bar}] | {filename} | {value}/{total} MB",
    });
    const register = (browserName, browserVersion) => {
        let bar;
        const downloadProgressCallback = (downloadedBytes, totalBytes) => {
            if (!bar) {
                const totalMB = Math.round((totalBytes / constants_1.BYTES_PER_MEGABYTE) * 100) / 100;
                bar = progressBar.create(totalMB, 0, { filename: `${browserName}@${browserVersion}` });
            }
            const downloadedMB = Math.round((downloadedBytes / constants_1.BYTES_PER_MEGABYTE) * 100) / 100;
            bar.update(downloadedMB);
        };
        return downloadProgressCallback;
    };
    return { register };
};
exports.createBrowserDownloadProgressBar = createBrowserDownloadProgressBar;
//# sourceMappingURL=cli-progress-bar.js.map