import { appendFile, existsSync, writeFile } from "fs";
import { join, relative } from "path";
import { Uri, window, workspace } from "vscode";

export function createGitignoreFile(uri: Uri) {
    const path = join(uri.path, ".gitignore");

    if (existsSync(path)) {
        window.showInformationMessage("A .gitignore file already exists.");
        return;
    }

    writeFile(path, "", () => {
        showTextDocument(path);
    });
}

export function addFileToGitignore(uri: Uri) {
    const root = workspace.getWorkspaceFolder(uri);
    if (!root) return;
    const content = "\n" + relative(root.uri.fsPath, uri.fsPath);
    const path = Uri.file(join(root.uri.fsPath, ".gitignore")).fsPath;

    appendFile(path, content, () => {
        showTextDocument(path);
    });
}

function showTextDocument(path: string) {
    workspace.openTextDocument(path).then((textDocument) => {
        window.showTextDocument(textDocument);
    });
}
