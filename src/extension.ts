import { ExtensionContext } from "vscode";
import { LanguageClient } from "vscode-languageclient/node";
import { createClient, stopClient } from "./client";

let client: LanguageClient;

export function activate(context: ExtensionContext) {
    client = createClient(context);
    client.start();

    console.log("GitIgnore Ultimate is now active.");
}

export function deactivate(): Thenable<void> | undefined {
    return stopClient(client);
}
