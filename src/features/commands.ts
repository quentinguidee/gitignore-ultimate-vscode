import { existsSync } from "fs";
import { appendFile, writeFile } from "fs/promises";
import { join, relative } from "path";
import { Uri, window, workspace } from "vscode";

export async function createGitignoreFile(uri: Uri) {
    const path = join(uri.path, ".gitignore");
    if (existsSync(path)) {
        window.showInformationMessage("A .gitignore file already exists.");
        return;
    }

    await writeFile(path, "");
    await showTextDocument(path);
}

export async function addFileToGitignore(uri: Uri) {
    const root = workspace.getWorkspaceFolder(uri);
    if (!root) return;

    const content = "\n" + relative(root.uri.fsPath, uri.fsPath);
    const path = Uri.file(join(root.uri.fsPath, ".gitignore")).fsPath;

    await appendFile(path, content);
    await showTextDocument(path);
}

async function showTextDocument(path: string) {
    const textDocument = await workspace.openTextDocument(path);
    await window.showTextDocument(textDocument);
}
