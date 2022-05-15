import { Dirent, readdir } from "fs";
import { CompletionItem, CompletionItemKind } from "vscode-languageserver/node";
import { URI } from "vscode-uri";

export function getFilesInDirectory(directory?: string): Promise<Dirent[]> {
    return new Promise((resolve, reject) => {
        if (!directory) {
            reject("Directory is undefined.");
        }

        if (process.platform === "win32") {
            directory = directory!.replace(/\\/g, "/");
        }

        readdir(URI.parse(directory!).fsPath, { withFileTypes: true }, (err, files) => {
            if (err) {
                reject(err);
            }
            resolve(files);
        });
    });
}

export async function completionSuggestionsFor(
    directory?: string,
    currentCompletion?: string
): Promise<CompletionItem[]> {
    return new Promise((resolve, reject) => {
        getFilesInDirectory(directory)
            .then((files) => {
                if (!directory) {
                    directory = "";
                }

                if (!files) {
                    console.error("Files is undefined.");
                    resolve([]);
                }

                var completionItems: CompletionItem[] = [];

                files.forEach((file) => {
                    var kind = file.isDirectory() ? CompletionItemKind.Folder : CompletionItemKind.File;

                    var filename = file.name;

                    const removeDot = currentCompletion?.charAt(0) === ".";

                    var insertText = removeDot ? filename.substring(1) : filename;

                    completionItems.push({
                        label: filename,
                        insertText: insertText,
                        kind: kind,
                    });
                });

                resolve(completionItems);
            })
            .catch((e) => {
                console.error(e);
                resolve([]);
            });
    });
}