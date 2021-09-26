import {
    createConnection,
    TextDocuments,
    ProposedFeatures,
    TextDocumentPositionParams,
    CompletionItem,
    CompletionItemKind,
    InitializeParams,
    Range,
} from "vscode-languageserver/node";
import { TextDocument } from "vscode-languageserver-textdocument";
import { URI } from "vscode-uri";

import { Dirent, readdir } from "fs";
import { join } from "path";

const connection = createConnection(ProposedFeatures.all);
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

let workspaceFolder: string | null;

// documents.onDidOpen((e) => {
//     connection.console.log(
//         `[Server(${process.pid}) ${workspaceFolder}] Document opened: ${e.document.uri}`
//     );
// });

documents.listen(connection);

connection.onInitialize((params: InitializeParams) => {
    connection.console.log(
        `[GITIGNORE_ULTIMATE] [SERVER-${process.pid}] onInitialize triggered`
    );

    workspaceFolder = params.rootUri;

    return {
        capabilities: {
            completionProvider: {
                triggerCharacters: ["/"],
            },
            workspace: {
                workspaceFolders: {
                    supported: true,
                    changeNotifications: true,
                },
            },
        },
    };
});

connection.onCompletion(
    async (
        textDocumentPosition: TextDocumentPositionParams
    ): Promise<CompletionItem[]> =>
        new Promise((resolve, reject) => {
            let document = documents.get(textDocumentPosition.textDocument.uri);
            let position = textDocumentPosition.position;
            let text = document?.getText(
                Range.create(
                    position.line,
                    0,
                    position.line,
                    position.character
                )
            );

            let lastSlashPosition = text?.lastIndexOf("/");

            var path = workspaceFolder!;
            if (lastSlashPosition !== -1) {
                path = join(path, text?.substr(0, lastSlashPosition) || "");
            }

            var items: CompletionItem[] = [];

            const getFilesAndFolders = (err: any, files: Dirent[]) => {
                if (err) {
                    reject(err);
                }

                files.forEach((file) => {
                    var kind = file.isDirectory()
                        ? CompletionItemKind.Folder
                        : CompletionItemKind.File;

                    var name = file.name;

                    const removeDot =
                        name.charAt(0) === "." &&
                        text !== "" &&
                        text?.charAt(0) === ".";

                    var insertText = removeDot ? name.substr(1) : name;

                    items.push({
                        label: name,
                        insertText: insertText,
                        kind: kind,
                    });
                });

                resolve(items);
            };

            readdir(
                URI.parse(path).fsPath,
                { withFileTypes: true },
                getFilesAndFolders
            );
        })
);

connection.listen();
