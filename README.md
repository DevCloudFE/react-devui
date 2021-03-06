<h1 align="center">React DevUI</h1>

<p align="center">DevUI components based on React</p>

English | [įŽäŊä¸­æ](README.zh-Hant.md)

In development.

Need unit test support (Jest) đ¤

## Start

We add `chmod ug+x .husky/` at `prepare` that make sure the files is executable in linux. So you use other OS, just ignore error.

Execute the following command to preview the component:

```
yarn site:serve
```

For non-new component contributions, please refer to [Contribution Guide](CONTRIBUTING.md).

## Directory Structure

```
âââ packages                                    // Root Directory: Project
â   â
â   â
â   âââ site                                    // Root Directory: Website
â   â   âââ src
â   â       âââ app
â   â       â   âââ components                  // Components
â   â       â   âââ configs                     // Configuration files (json)
â   â       â   âââ i18n                        // Internationalization
â   â       â   âââ routes                      // Routes
â   â       â   âââ styles                      // Styles
â   â       âââ assets                          // Static resources
â   â       âââ environments                    // Configuration files in development and production environments
â   â
â   â
â   âââ ui                                      // Root Directory: Components
â       âââ src
â           âââ components                      // Components
â           âââ hooks                           // Hooks
â           âââ styles                          // Styles
â           âââ tests                           // Test configuration
â           âââ utils                           // Utility function
â
â
âââ tools                                       // Root Directory: Project Cli
```

## VSCode configuration

Refer to [README.md](https://github.com/xiejay97/react-devui/tree/main/.vscode) under the `.vscode` directory
