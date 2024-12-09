import type { Browser } from "../types";

// TODO: remove after fix https://github.com/webdriverio/webdriverio/issues/9620
export default (browser: Browser): void => {
    const { publicAPI: session } = browser;

    session.overwriteCommand(
        "scrollIntoView",
        async function (
            this: WebdriverIO.Element,
            _origScrollIntoView,
            options: ScrollIntoViewOptions | boolean = { block: "start", inline: "nearest" },
        ): Promise<void> {
            await session.execute<Promise<void>, [WebdriverIO.Element, ScrollIntoViewOptions | boolean]>(
                async function (elem, options) {
                    return await elem.scrollIntoView(options) as Promise<void>;
                },
                this,
                options,
            );
        },
        true,
    );
};
