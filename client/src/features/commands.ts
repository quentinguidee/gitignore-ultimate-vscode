import * as vscode from "vscode";
import { existsSync, writeFile } from "fs";

export function createGitignoreFile(context: any) {
    const path = context.path + "/.gitignore";
    const uri = vscode.Uri.file(path);

    if (existsSync(path)) {
        vscode.window.showInformationMessage(
            "A .gitignore file already exists."
        );
    } else {
        writeFile(uri.fsPath, "", () => {
            vscode.workspace.openTextDocument(path).then((textDocument) => {
                vscode.window.showTextDocument(textDocument);
            });
        });
    }
}
