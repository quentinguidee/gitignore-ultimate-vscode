import {
    createConnection,
    TextDocuments,
    ProposedFeatures,
    TextDocumentSyncKind,
    TextDocumentPositionParams,
    CompletionItem,
    CompletionItemKind,
    InitializeParams,
    Position,
    Range,
} from "vscode-languageserver/node";
import { TextDocument } from "vscode-languageserver-textdocument";

import * as fs from "fs";

const connection = createConnection(ProposedFeatures.all);

let documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

documents.listen(connection);

connection.onInitialize((params: InitializeParams) => {
    connection.console.log(
        `[GITIGNORE_ULTIMATE] [SERVER-${process.pid}] onInitialize triggered`
    );

    return {
        capabilities: {
            completionProvider: {
                triggerCharacters: ["/"],
            },
        },
    };
});

connection.onCompletion(
    (textDocumentPosition: TextDocumentPositionParams): CompletionItem[] => {
        let document = documents.get(textDocumentPosition.textDocument.uri);
        let position = textDocumentPosition.position;
        let text = document?.getText(
            Range.create(position.line, 0, position.line, position.character)
        );

        let lastSlashPosition = text?.lastIndexOf("/");

        var path = "";
        if (lastSlashPosition !== -1) {
            path = text?.substr(0, lastSlashPosition) || "";
        }

        var items: CompletionItem[] = [];
        var files = fs.readdirSync("./" + path, { withFileTypes: true });

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

        return items;
    }
);

connection.listen();
