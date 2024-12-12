"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BYTES_PER_MEGABYTE = exports.BYTES_PER_KILOBYTE = exports.DRIVER_WAIT_TIMEOUT = exports.MIN_EDGEDRIVER_VERSION = exports.MIN_CHROMIUM_VERSION = exports.MIN_CHROMIUM_MAC_ARM_VERSION = exports.MIN_CHROMEDRIVER_MAC_ARM_NEW_ARCHIVE_NAME = exports.MIN_CHROMEDRIVER_FOR_TESTING_VERSION = exports.MIN_CHROME_FOR_TESTING_VERSION = exports.SAFARIDRIVER_PATH = exports.MSEDGEDRIVER_API = exports.GECKODRIVER_CARGO_TOML = exports.CHROMEDRIVER_STORAGE_API = void 0;
exports.CHROMEDRIVER_STORAGE_API = "https://chromedriver.storage.googleapis.com";
exports.GECKODRIVER_CARGO_TOML = "https://raw.githubusercontent.com/mozilla/geckodriver/release/Cargo.toml";
exports.MSEDGEDRIVER_API = "https://msedgedriver.azureedge.net";
exports.SAFARIDRIVER_PATH = "/usr/bin/safaridriver";
exports.MIN_CHROME_FOR_TESTING_VERSION = 113;
exports.MIN_CHROMEDRIVER_FOR_TESTING_VERSION = 115;
exports.MIN_CHROMEDRIVER_MAC_ARM_NEW_ARCHIVE_NAME = 106;
exports.MIN_CHROMIUM_MAC_ARM_VERSION = 93;
exports.MIN_CHROMIUM_VERSION = 73;
exports.MIN_EDGEDRIVER_VERSION = 94;
exports.DRIVER_WAIT_TIMEOUT = 10 * 1000; // 10s
exports.BYTES_PER_KILOBYTE = 1 << 10; // eslint-disable-line no-bitwise
exports.BYTES_PER_MEGABYTE = exports.BYTES_PER_KILOBYTE << 10; // eslint-disable-line no-bitwise
//# sourceMappingURL=constants.js.map