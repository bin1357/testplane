import { EventEmitter } from "node:events";
import _ from "lodash";
import { passthroughEvent } from "../events/utils.js";
import SetsBuilder from "./sets-builder/index.js";
import { TestParser } from "./test-parser.js";
import { MasterEvents } from "../events/index.js";
import * as env from "../utils/env.js";

export default class TestReader extends EventEmitter {
    #config;

    static create(...args) {
        return new this(...args);
    }

    constructor(config) {
        super();

        this.#config = config;
    }

    async read(options = {}) {
        const { paths, browsers, ignore, sets, grep } = options;

        const { fileExtensions } = this.#config.system;
        const setCollection = await SetsBuilder.create(this.#config.sets, { defaultDir: require("../../package").name })
            .useFiles(paths)
            .useSets((sets || []).concat(env.parseCommaSeparatedValue("HERMIONE_SETS")))
            .useBrowsers(browsers)
            .build(process.cwd(), { ignore }, fileExtensions);

        const parser = new TestParser();
        passthroughEvent(parser, this, [MasterEvents.BEFORE_FILE_READ, MasterEvents.AFTER_FILE_READ]);

        await parser.loadFiles(setCollection.getAllFiles(), this.#config);

        const filesByBro = setCollection.groupByBrowser();
        const testsByBro = _.mapValues(filesByBro, (files, browserId) =>
            parser.parse(files, { browserId, config: this.#config.forBrowser(browserId), grep }),
        );

        validateTests(testsByBro, options);

        return testsByBro;
    }
}

function validateTests(testsByBro, options) {
    const tests = _.flatten(Object.values(testsByBro));

    if (options.replMode?.enabled) {
        const testsToRun = tests.filter(test => !test.disabled && !test.pending);
        const browsersToRun = _.uniq(testsToRun.map(test => test.browserId));

        if (testsToRun.length !== 1) {
            throw new Error(
                `In repl mode only 1 test in 1 browser should be run, but found ${testsToRun.length} tests` +
                    `${testsToRun.length === 0 ? ". " : ` that run in ${browsersToRun.join(", ")} browsers. `}` +
                    `Try to specify cli-options: "--grep" and "--browser" or use "hermione.only.in" in the test file.`,
            );
        }
    }

    if (!_.isEmpty(tests) && tests.some(test => !test.silentSkip)) {
        return;
    }

    const stringifiedOpts = convertOptions(options);
    if (_.isEmpty(stringifiedOpts)) {
        throw new Error(`There are no tests found. Try to specify [${Object.keys(options).join(", ")}] options`);
    } else {
        throw new Error(`There are no tests found by the specified options:\n${stringifiedOpts}`);
    }
}

function convertOptions(obj) {
    let result = "";
    for (let key of _.keys(obj)) {
        if (!_.isEmpty(obj[key])) {
            if (_.isArray(obj[key])) {
                result += `- ${key}: ${obj[key].join(", ")}\n`;
            } else {
                result += `- ${key}: ${obj[key]}\n`;
            }
        }
    }
    return result;
}
