<h1 align="center">React DevUI</h1>

<p align="center">DevUI components based on React</p>

English | [简体中文](README.zh-Hant.md)

In development.

Need unit test support (Jest) 🤝

## Start

We add `chmod ug+x .husky/` at `prepare` that make sure the files is executable in linux. So you use other OS, just ignore error.

Execute the following command to preview the component:

```
yarn site:serve
```

For non-new component contributions, please refer to [Contribution Guide](CONTRIBUTING.md).

## Directory Structure

```
├── packages                                    // Root Directory: Project
│   │
│   │
│   ├── site                                    // Root Directory: Website
│   │   └── src
│   │       ├── app
│   │       │   ├── components                  // Components
│   │       │   ├── configs                     // Configuration files (json)
│   │       │   ├── i18n                        // Internationalization
│   │       │   ├── routes                      // Routes
│   │       │   └── styles                      // Styles
│   │       ├── assets                          // Static resources
│   │       └── environments                    // Configuration files in development and production environments
│   │
│   │
│   └── ui                                      // Root Directory: Components
│       └── src
│           ├── components                      // Components
│           ├── hooks                           // Hooks
│           ├── styles                          // Styles
│           ├── tests                           // Test configuration
│           └── utils                           // Utility function
│
│
└── tools                                       // Root Directory: Project Cli
```

## VSCode configuration

Refer to [README.md](https://github.com/xiejay97/react-devui/tree/main/.vscode) under the `.vscode` directory
