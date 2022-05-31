import assert = require("assert");
import { existsSync } from "fs";
import { readdir, readFile, unlink } from "fs/promises";
import { join, resolve } from "path";
import { Uri, workspace } from "vscode";
import {
    addFileToGitignore,
    createGitignoreFile,
} from "../../features/commands";

describe("run commands", async () => {
    const workspaceUri = workspace.workspaceFolders![0].uri;
    const workspacePath = workspaceUri.path;
    const gitignorePath = join(workspacePath, ".gitignore");

    async function cleanWorkspace() {
        const paths = await readdir(workspacePath);
        for (const path of paths) {
            if (path !== "test.code-workspace") {
                await unlink(join(workspacePath, path));
            }
        }
    }

    beforeEach("Clean workspace", async () => {
        await cleanWorkspace();
    });

    it("should create .gitignore", async () => {
        await createGitignoreFile(workspaceUri);
        assert.ok(existsSync(gitignorePath));
        return Promise.resolve();
    });

    it("should add file to .gitignore", async () => {
        await addFileToGitignore(Uri.file(resolve(workspacePath, "file.c")));

        try {
            const data = await readFile(gitignorePath);
            assert.strictEqual(data.toString(), "\nfile.c");
            return Promise.resolve();
        } catch (err) {
            return Promise.reject(err);
        }
    });

    after("Clean workspace", async () => {
        await cleanWorkspace();
    });
});
