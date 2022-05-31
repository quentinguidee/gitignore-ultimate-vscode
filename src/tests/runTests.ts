import { resolve } from "path";
import { runTests } from "@vscode/test-electron";

async function main() {
    try {
        const extensionDevelopmentPath = resolve(__dirname, "../../");
        const extensionTestsPath = resolve(__dirname, "./suite/index");
        const workspacePath = resolve(
            extensionDevelopmentPath,
            "./src/tests/suite/workspace/test.code-workspace"
        );

        await runTests({
            extensionDevelopmentPath,
            extensionTestsPath,
            launchArgs: ["--disable-extensions", workspacePath],
        });
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

main();
