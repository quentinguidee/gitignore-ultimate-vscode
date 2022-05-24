import {
    LanguageClient,
    ServerOptions,
    LanguageClientOptions as ClientOptions,
} from "vscode-languageclient/node";

const clientOptions: ClientOptions = {
    documentSelector: [
        {
            scheme: "file",
            language: "ignore",
        },
    ],
};

const serverOptions: ServerOptions = {
    command: "gitignore_ultimate_server",
};

export function createClient(): LanguageClient {
    return new LanguageClient(
        "gitignore-ultimate-server",
        "GitIgnore Ultimate Server",
        serverOptions,
        clientOptions
    );
}

export function stopClient(client: LanguageClient): Thenable<void> | undefined {
    if (!client) return;
    return client.stop();
}
