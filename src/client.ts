import {
    LanguageClient,
    ServerOptions,
    LanguageClientOptions as ClientOptions,
} from "vscode-languageclient/node";
import { join } from "path";
import { ExtensionContext } from "vscode";

const clientOptions: ClientOptions = {
    documentSelector: [
        {
            scheme: "file",
            language: "ignore",
        },
    ],
};

function getServerOptions(context: ExtensionContext): ServerOptions {
    return {
        command: context.asAbsolutePath(
            join("bin", "gitignore_ultimate_server")
        ),
    };
}

export function createClient(context: ExtensionContext): LanguageClient {
    return new LanguageClient(
        "gitignore-ultimate-server",
        "GitIgnore Ultimate Server",
        getServerOptions(context),
        clientOptions
    );
}

export function stopClient(client: LanguageClient): Thenable<void> | undefined {
    if (!client) return;
    return client.stop();
}
