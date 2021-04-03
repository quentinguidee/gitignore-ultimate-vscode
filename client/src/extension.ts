import * as vscode from "vscode";
import * as path from "path";
import {
    LanguageClient,
    LanguageClientOptions,
    TransportKind,
} from "vscode-languageclient/node";

let defaultClient: LanguageClient;
let clients: Map<string, LanguageClient> = new Map();

let _sortedWorkspaceFolders: string[] | undefined;
function sortedWorkspaceFolders(): string[] {
    if (_sortedWorkspaceFolders === void 0) {
        _sortedWorkspaceFolders = vscode.workspace.workspaceFolders
            ? vscode.workspace.workspaceFolders
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
vscode.workspace.onDidChangeWorkspaceFolders(
    () => (_sortedWorkspaceFolders = undefined)
);

function getOuterMostWorkspaceFolder(
    folder: vscode.WorkspaceFolder
): vscode.WorkspaceFolder {
    let sorted = sortedWorkspaceFolders();
    for (let element of sorted) {
        let uri = folder.uri.toString();
        if (uri.charAt(uri.length - 1) !== "/") {
            uri = uri + "/";
        }
        if (uri.startsWith(element)) {
            return vscode.workspace.getWorkspaceFolder(
                vscode.Uri.parse(element)
            )!;
        }
    }
    return folder;
}

export function activate(context: vscode.ExtensionContext) {
    console.log("Extension gitignore-ultimate active!");

    let module = context.asAbsolutePath(
        path.join("server", "out", "server.js")
    );

    let outputChannel: vscode.OutputChannel = vscode.window.createOutputChannel(
        "Gitignore Ultimate"
    );

    function didOpenTextDocument(document: vscode.TextDocument): void {
        console.log("[GITIGNORE_ULTIMATE] LanguageID: " + document.languageId);

        if (document.languageId !== "ignore") {
            console.log("[GITIGNORE_ULTIMATE] Not a gitignore file");
            return;
        }

        if (!defaultClient) {
            console.log("[GITIGNORE_ULTIMATE] Create default client.");
            let debugOptions = { execArgv: ["--nolazy", "--inspect=6010"] };
            let serverOptions = {
                run: { module, transport: TransportKind.ipc },
                debug: {
                    module,
                    transport: TransportKind.ipc,
                    options: debugOptions,
                },
            };
            let clientOptions: LanguageClientOptions = {
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

        let uri = document.uri;
        let folder = vscode.workspace.getWorkspaceFolder(uri);
        if (!folder) {
            return;
        }
        folder = getOuterMostWorkspaceFolder(folder);

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

    vscode.workspace.onDidOpenTextDocument(didOpenTextDocument);
    vscode.workspace.textDocuments.forEach(didOpenTextDocument);
    vscode.workspace.onDidChangeWorkspaceFolders((event) => {
        for (let folder of event.removed) {
            let client = clients.get(folder.uri.toString());
            if (client) {
                clients.delete(folder.uri.toString());
                client.stop();
            }
        }
    });
}

export function deactivate(): Thenable<void> {
    console.log("[GITIGNORE_ULTIMATE] deactivate()");

    let promises: Thenable<void>[] = [];
    if (defaultClient) {
        promises.push(defaultClient.stop());
    }
    for (let client of clients.values()) {
        promises.push(client.stop());
    }
    return Promise.all(promises).then(() => undefined);
}
