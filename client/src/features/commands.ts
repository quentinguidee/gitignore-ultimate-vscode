import * as vscode from "vscode";
import * as path from "path";
import { existsSync, writeFile, appendFile } from "fs";

export function createGitignoreFile(uri: vscode.Uri) {
    const gitignorePath = path.join(uri.path, ".gitignore");

    if (existsSync(gitignorePath)) {
        vscode.window.showInformationMessage("A .gitignore file already exists.");
    } else {
        writeFile(gitignorePath, "", () => {
            vscode.workspace.openTextDocument(gitignorePath).then((textDocument) => {
                vscode.window.showTextDocument(textDocument);
            });
        });
    }
}

export function addFileToGitignore(uri: vscode.Uri) {
    const root = vscode.workspace.getWorkspaceFolder(uri);
    const fileToAdd = path.relative(root!.uri.fsPath, uri.fsPath);
    const gitignorePath = path.join(root!.uri.fsPath, ".gitignore");
    const gitignoreFile = vscode.Uri.file(gitignorePath);

    appendFile(gitignoreFile.fsPath, "\n" + fileToAdd, () => {
        vscode.workspace.openTextDocument(gitignoreFile).then((textDocument) => {
            vscode.window.showTextDocument(textDocument);
        });
    });
}
