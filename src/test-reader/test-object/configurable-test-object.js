import _ from "lodash";
import { TestObject } from "./test-object.js";

export class ConfigurableTestObject extends TestObject {
    #data;

    constructor({ title, file, id }) {
        super({ title });

        this.#data = { id, file };
    }

    assign(src) {
        this.#data = { ...src.#data };

        return super.assign(src);
    }

    skip({ reason }) {
        this.pending = true;
        this.skipReason = reason;
    }

    disable() {
        this.disabled = true;
        this.silentSkip = true;
    }

    get id() {
        return this.#data.id;
    }

    get file() {
        return this.#data.file;
    }

    set pending(val) {
        this.#data.pending = val;
    }

    get pending() {
        return this.#getInheritedProperty("pending", false);
    }

    set skipReason(reason) {
        this.#data.skipReason = reason;
    }

    get skipReason() {
        return this.#getInheritedProperty("skipReason", "");
    }

    set disabled(val) {
        this.#data.disabled = val;
    }

    get disabled() {
        return this.#getInheritedProperty("disabled", false);
    }

    set silentSkip(val) {
        this.#data.silentSkip = val;
    }

    get silentSkip() {
        return this.#getInheritedProperty("silentSkip", false);
    }

    set timeout(timeout) {
        this.#data.timeout = timeout;
    }

    get timeout() {
        return this.#getInheritedProperty("timeout", 0);
    }

    set browserId(id) {
        this.#data.browserId = id;
    }

    get browserId() {
        return this.#getInheritedProperty("browserId", undefined);
    }

    set browserVersion(version) {
        this.#data.browserVersion = version;
    }

    get browserVersion() {
        return this.#getInheritedProperty("browserVersion", undefined);
    }

    get hasBrowserVersionOverwritten() {
        return "browserVersion" in this.#data;
    }

    #getInheritedProperty(name, defaultValue) {
        return name in this.#data ? this.#data[name] : _.get(this.parent, name, defaultValue);
    }
}
