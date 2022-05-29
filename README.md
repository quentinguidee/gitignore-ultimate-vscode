<p align="center">
    <img width="256" height="256" src="https://github.com/quentinguidee/gitignore-ultimate/raw/main/icon-1024.png" />
</p>
<h1 align="center">Gitignore Ultimate — VSCode</h1>

<p align="center">
<a src="https://marketplace.visualstudio.com/items?itemName=quentinguidee.gitignore-ultimate&ssr=false#overview"><img alt="Visual Studio Marketplace Version" src="https://img.shields.io/visual-studio-marketplace/v/quentinguidee.gitignore-ultimate?style=for-the-badge&color=red&logo=visual-studio-code"></a>
<img alt="GitHub" src="https://img.shields.io/github/license/quentinguidee/gitignore-ultimate?style=for-the-badge&color=red&logo=open-source-initiative&logoColor=white">
</p>

---

Ultimate extensions are a group of extensions allowing faster coding in VSCode. Gitignore Ultimate allows to speed up the drafting of `.gitignore` files.

This extension uses [Gitignore Ultimate Server](https://github.com/quentinguidee/gitignore-ultimate-server) binary.

## Features

- Autocomplete gitignore files

![autocomplete](https://user-images.githubusercontent.com/12123721/113505778-4bad6600-9541-11eb-9f3e-a64c63983b95.gif)

- Add file/folder to gitignore

<img width="274" alt="image" src="https://user-images.githubusercontent.com/12123721/113505947-266d2780-9542-11eb-9139-c9676746b594.png">

- Create `.gitignore` file

<img width="290" alt="image" src="https://user-images.githubusercontent.com/12123721/113505935-148b8480-9542-11eb-9c27-2862e5af6092.png">

## Run this extension from sources

1. Clone this project and run `yarn install`.
2. Download [Gitignore Ultimate Server (Releases)](https://github.com/quentinguidee/gitignore-ultimate-server/releases) and rename it to `gitignore_ultimate_server` (or `gitignore_ultimate_server.exe` on Windows). Put this file in the `bin/` folder.
3. In VSCode, open the execute and debug panel (<kbd>ctrl</kbd>+<kbd>maj</kbd>+<kbd>d</kbd> or <kbd>cmd</kbd>+<kbd>maj</kbd>+<kbd>d</kbd> on macOS). Select "Run Extension" and click on play.

## Package the extension

```bash
yarn run vsce package
```

This produces a `.vsix` package that you can install with VSCode. **Note:** this package is only compatible with your OS. If you want to distribute this, you must package one extension for each OS with the `--target` argument and use the appropriate server binary.

## License

- This extension is released under the [MIT License](./LICENSE.md)
- The `.vsix` packages are all bundled with [Gitignore Ultimate Server](https://github.com/quentinguidee/gitignore-ultimate-server), also released under the [MIT License](https://github.com/quentinguidee/gitignore-ultimate-server/blob/next/LICENSE.md)
