import { commands, ExtensionContext } from "vscode";
import { LanguageClient } from "vscode-languageclient/node";
import { createClient, stopClient } from "./client";
import { addFileToGitignore, createGitignoreFile } from "./features/commands";

let client: LanguageClient;

export function activate(context: ExtensionContext) {
    client = createClient(context);
    client.start();

    commands.registerCommand(
        "gitignore-ultimate.create-gitignore",
        createGitignoreFile
    );

    commands.registerCommand(
        "gitignore-ultimate.add-to-gitignore",
        addFileToGitignore
    );

    console.log("GitIgnore Ultimate is now active.");
}

export function deactivate(): Thenable<void> | undefined {
    return stopClient(client);
}
