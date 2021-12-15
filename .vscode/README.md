# VSCode Configuration

This folder contains opt-in [Workspace Settings](https://code.visualstudio.com/docs/getstarted/settings) that we recommends using when working on this repository.

## Usage

To use the recommended configurations follow the steps below:

- install the recommneded extensions in `.vscode/extensions.json`
- copy (or link) `.vscode/recommended-settings.json` to `.vscode/settings.json`
- [Using the workspace version of TypeScript](https://code.visualstudio.com/docs/typescript/typescript-compiling#_using-the-workspace-version-of-typescript)
- restart the editor

If you already have your custom workspace settings you should instead manually merge the file contents.

This isn't an automatic process so you will need to repeat it when settings are updated.

To see the recommended extensions select **Extensions: Show Recommended Extensions** in the [Command Palette](https://code.visualstudio.com/docs/getstarted/userinterface#_command-palette).

To use the workspace version of TypeScript select **TypeScript: Select TypeScript Version** in the [Command Palette](https://code.visualstudio.com/docs/getstarted/userinterface#_command-palette), make sure to execute the command in a ts file.

## Editing `.vscode/recommended-*.json` files

If you wish to add extra configuration items please keep in mind any modifications you make here will be used by many users.

Try to keep these settings/configuations to things that help facilitate the development process and avoid altering the user workflow whenever possible.
