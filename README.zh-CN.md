<h1 align="center">React DevUI</h1>

<p align="center">DevUI components based on React</p>

[English](README.md) | 简体中文

开发中。

需要单元测试支持（Jest）🤝

## 开始

我们在 `prepare` 中添加 `chmod ug+x .husky/` 以确保文件在 linux 中是可执行的。 所以您使用其他操作系统，只需忽略错误。

执行下面的命令以预览组件：

```
yarn site:serve
```

非新组件贡献请参考 [贡献指南](CONTRIBUTING.md)。

## 目录结构

```
├── packages                                    // 根目录：项目
│   │
│   │
│   ├── site                                    // 根目录：网站
│   │   └── src
│   │       ├── app
│   │       │   ├── components                  // 组件
│   │       │   ├── configs                     // 配置文件（json）
│   │       │   ├── i18n                        // 国际化
│   │       │   ├── routes                      // 路由
│   │       │   └── styles                      // 样式
│   │       ├── assets                          // 静态资源
│   │       └── environments                    // 开发和生产环境下的配置文件
│   │
│   │
│   └── ui                                      // 根目录：组件
│       └── src
│           ├── components                      // 组件
│           ├── hooks                           // Hooks
│           ├── styles                          // 样式
│           ├── tests                           // 测试配置
│           └── utils                           // 实用函数
│
│
└── tools                                       // 根目录：项目脚手架
```

## VSCode 配置

参考 `.vscode` 目录下的 [README.md](https://github.com/DevCloudFE/react-devui/tree/main/.vscode)
