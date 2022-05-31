import * as Mocha from "mocha";

import { glob } from "glob";
import { resolve } from "path";

export async function run(): Promise<void> {
    const mocha = new Mocha({
        ui: "bdd",
        color: true,
    });

    const cwd = resolve(__dirname, "..");

    return new Promise((success, error) => {
        glob("**/**.test.js", { cwd }, (e, files) => {
            if (e) return error(e);

            files.forEach((file) => mocha.addFile(resolve(cwd, file)));

            try {
                mocha.run((failures) => {
                    if (failures > 0) {
                        error(new Error(`${failures} tests failed.`));
                    } else {
                        success();
                    }
                });
            } catch (e) {
                error(e);
            }
        });
    });
}
