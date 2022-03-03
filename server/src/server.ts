import {
    createConnection,
    TextDocuments,
    ProposedFeatures,
    TextDocumentPositionParams,
    CompletionItem,
    InitializeParams,
    Range,
} from "vscode-languageserver/node";
import { TextDocument } from "vscode-languageserver-textdocument";

import { join } from "path";
import { completionSuggestionsFor } from "./features/completion";

const connection = createConnection(ProposedFeatures.all);
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

let workspaceFolder: string | null;

documents.onDidOpen((e) => {
    connection.console.log(
        `[Server(${process.pid}) ${workspaceFolder}] Document opened: ${e.document.uri}`
    );
});

documents.listen(connection);

connection.onInitialize((params: InitializeParams) => {
    workspaceFolder = params.rootUri;

    connection.console.log(
        `[GITIGNORE_ULTIMATE] [SERVER-${process.pid}] onInitialize() with ${workspaceFolder}`
    );

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
    ): Promise<CompletionItem[]> => {
        return new Promise((resolve, reject) => {
            let document = documents.get(textDocumentPosition.textDocument.uri);
            let position = textDocumentPosition.position;
            let currentPath = document?.getText(
                Range.create(
                    position.line,
                    0,
                    position.line,
                    position.character
                )
            );

            let lastSlashPosition = currentPath?.lastIndexOf("/");

            var path = workspaceFolder!;
            if (lastSlashPosition !== -1) {
                path = join(
                    path,
                    currentPath?.substr(0, lastSlashPosition) || ""
                );
            }

            completionSuggestionsFor(path)
                .then((items) => resolve(items))
                .catch((error) => reject(error));
        });
    }
);

connection.listen();
