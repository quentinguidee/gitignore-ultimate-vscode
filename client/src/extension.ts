import * as vscode from "vscode";
import * as path from "path";

import { addFileToGitignore, createGitignoreFile } from "./features/commands";
import {
    commands,
    workspace,
    window,
    WorkspaceFolder,
    ExtensionContext,
    Uri,
    OutputChannel,
    TextDocument,
} from "vscode";
import { LanguageClient, LanguageClientOptions, TransportKind } from "vscode-languageclient/node";

let defaultClient: LanguageClient;
let clients: Map<string, LanguageClient> = new Map();

let _sortedWorkspaceFolders: string[] | undefined;
function sortedWorkspaceFolders(): string[] {
    if (_sortedWorkspaceFolders === void 0) {
        _sortedWorkspaceFolders = workspace.workspaceFolders
            ? workspace.workspaceFolders
                  .map((folder) => {
                      let result = folder.uri.toString();
                      if (result.charAt(result.length - 1) !== "/") {
                          result = result + "/";
                      }
                      return result;
                  })
                  .sort((a, b) => {
                      return a.length - b.length;
                  })
            : [];
    }

    return _sortedWorkspaceFolders;
}

workspace.onDidChangeWorkspaceFolders(() => {
    _sortedWorkspaceFolders = undefined;
});

function getOuterMostWorkspaceFolder(folder: WorkspaceFolder): WorkspaceFolder {
    let sorted = sortedWorkspaceFolders();
    for (let element of sorted) {
        let uri = folder.uri.toString();
        if (uri.charAt(uri.length - 1) !== "/") {
            uri += "/";
        }
        if (uri.startsWith(element)) {
            return workspace.getWorkspaceFolder(Uri.parse(element))!;
        }
    }
    return folder;
}

export function activate(context: ExtensionContext) {
    console.log("Extension gitignore-ultimate active!");

    const module = context.asAbsolutePath(path.join("server", "out", "server.js"));

    const outputChannel: OutputChannel = window.createOutputChannel("Gitignore Ultimate");

    function didOpenTextDocument(document: TextDocument): void {
        console.log("[GITIGNORE_ULTIMATE] LanguageID: " + document.languageId);

        if (document.languageId !== "ignore") {
            console.log("[GITIGNORE_ULTIMATE] Not a gitignore file");
            return;
        }

        const uri = document.uri;

        if (uri.scheme === "untitled" && !defaultClient) {
            console.log("[GITIGNORE_ULTIMATE] Create default client.");
            const debugOptions = { execArgv: ["--nolazy", "--inspect=6010"] };
            const serverOptions = {
                run: { module, transport: TransportKind.ipc },
                debug: {
                    module,
                    transport: TransportKind.ipc,
                    options: debugOptions,
                },
            };
            const clientOptions: LanguageClientOptions = {
                documentSelector: [{ language: "ignore" }],
                diagnosticCollectionName: "Gitignore Ultimate",
                outputChannel: outputChannel,
            };
            defaultClient = new LanguageClient(
                "Gitignore Ultimate",
                "Gitignore Ultimate (client)",
                serverOptions,
                clientOptions
            );
            defaultClient.start();
            return;
        }

        let folder = workspace.getWorkspaceFolder(uri);
        if (!folder) {
            return;
        }

        folder = getOuterMostWorkspaceFolder(folder);

        console.log(folder.uri.toString());

        if (!clients.has(folder.uri.toString())) {
            let debugOptions = {
                execArgv: ["--nolazy", `--inspect=${6011 + clients.size}`],
            };
            let serverOptions = {
                run: { module, transport: TransportKind.ipc },
                debug: {
                    module,
                    transport: TransportKind.ipc,
                    options: debugOptions,
                },
            };
            let clientOptions: LanguageClientOptions = {
                documentSelector: [
                    {
                        language: "ignore",
                        pattern: `${folder.uri.fsPath}/**/*`,
                    },
                ],
                diagnosticCollectionName: "Gitignore Ultimate",
                workspaceFolder: folder,
                outputChannel: outputChannel,
            };
            let client = new LanguageClient(
                "Gitignore Ultimate",
                "Gitignore Ultimate (client)",
                serverOptions,
                clientOptions
            );
            client.start();
            clients.set(folder.uri.toString(), client);
        }
    }

    workspace.onDidOpenTextDocument(didOpenTextDocument);
    workspace.textDocuments.forEach(didOpenTextDocument);
    workspace.onDidChangeWorkspaceFolders((event) => {
        for (const folder of event.removed) {
            const client = clients.get(folder.uri.toString());
            if (client) {
                clients.delete(folder.uri.toString());
                client.stop();
            }
        }
    });

    commands.registerCommand("gitignore-ultimate.create-gitignore", createGitignoreFile);

    commands.registerCommand("gitignore-ultimate.add-to-gitignore", addFileToGitignore);
}

export function deactivate(): Thenable<void> {
    console.log("[GITIGNORE_ULTIMATE] deactivate()");

    const promises: Thenable<void>[] = [];
    if (defaultClient) {
        promises.push(defaultClient.stop());
    }
    for (const client of clients.values()) {
        promises.push(client.stop());
    }
    return Promise.all(promises).then(() => undefined);
}
