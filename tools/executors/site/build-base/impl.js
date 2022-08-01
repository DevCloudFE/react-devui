"use strict";
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncDelegator = (this && this.__asyncDelegator) || function (o) {
    var i, p;
    return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
    function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
};
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("crypto");
const path_1 = __importDefault(require("path"));
const fs_extra_1 = require("fs-extra");
const rxjs_1 = require("rxjs");
const rxjs_for_await_1 = require("rxjs-for-await");
const operators_1 = require("rxjs/operators");
const yamlFront = require('yaml-front-matter');
const COMPONENT_DIR = String.raw `packages/ui/src/components`;
const COMPONENT_ROUTE_DIR = [String.raw `packages/site/src/app/routes/components`];
const OUTPUT_DIR = String.raw `packages/site/src/app`;
class GenerateSite {
    constructor() {
        Object.defineProperty(this, "hashList", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "menuConfig", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "routeConfig", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "resources", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "menuGroups", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "componentRoutesTmp", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "componentRouteTmp", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "routeTmp", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.updateTmp();
    }
    outputFile(filePath, data) {
        const hash = (0, crypto_1.createHash)('md5').update(data).digest('hex');
        if (this.hashList.get(filePath) !== hash) {
            this.hashList.set(filePath, hash);
            (0, fs_extra_1.outputFileSync)(filePath, data);
        }
    }
    outputJson(filePath, data) {
        const hash = (0, crypto_1.createHash)('md5').update(JSON.stringify(data)).digest('hex');
        if (this.hashList.get(filePath) !== hash) {
            this.hashList.set(filePath, hash);
            (0, fs_extra_1.outputJsonSync)(filePath, data);
        }
    }
    generateComponentDemo(file, outDir) {
        var _a, _b, _c;
        const meta = yamlFront.loadFront(file.data);
        const fileNameRegExp = new RegExp(String.raw `(?<=^[0-9]+.)[a-zA-Z0-9]+(?=.md$)`, 'g');
        const fileName = (_a = file.name.match(fileNameRegExp)) === null || _a === void 0 ? void 0 : _a[0];
        const id = file.component[0].toUpperCase() + file.component.slice(1) + fileName + 'Demo';
        const tsx = (_b = meta.__content.match(/(?<=```tsx)[\s\S]*?(?=```)/g)) === null || _b === void 0 ? void 0 : _b[0];
        const scss = (_c = meta.__content.match(/(?<=```scss)[\s\S]*?(?=```)/g)) === null || _c === void 0 ? void 0 : _c[0];
        if (fileName && tsx) {
            let outTSX = tsx;
            if (scss) {
                outTSX =
                    String.raw `import './${fileName}.scss';
` + outTSX;
                this.outputFile(path_1.default.join(outDir, `${fileName}.scss`), String.raw `
#${id}{
  ${scss.split(/\n/g).join('\n  ')}
}
`);
            }
            outTSX =
                String.raw `/* eslint-disable */
// @ts-nocheck
` + outTSX;
            this.outputFile(path_1.default.join(outDir, `${fileName}.tsx`), outTSX);
            const demo = new Map([
                ['en-US', {}],
                ['zh-Hant', {}],
            ]);
            Array.from(demo.keys()).forEach((lang, index, langs) => {
                var _a;
                const obj = demo.get(lang);
                obj.id = id;
                obj.name = fileName;
                obj.title = meta.title[lang];
                const descriptionRegExp = new RegExp(String.raw `(?<=# ${lang})[\s\S]*${index === langs.length - 1 ? '(?=```tsx)' : `(?=# ${langs[index + 1]})`}`, 'g');
                const description = (_a = meta.__content.match(descriptionRegExp)) === null || _a === void 0 ? void 0 : _a[0];
                if (description) {
                    obj.description = description;
                }
                obj.importStatement = String.raw `import ${fileName}Demo from './demos/${fileName}';
`;
                obj.tsx = meta.__content.match(/```tsx[\s\S]*?```/g)[0];
                if (scss) {
                    obj.scss = meta.__content.match(/```scss[\s\S]*?```/g)[0];
                }
            });
            return demo;
        }
    }
    generateComponentRoute(file, outDir) {
        var _a, _b;
        const enMeta = yamlFront.loadFront((0, fs_extra_1.readFileSync)(path_1.default.join(file.path, 'README.md')));
        const zhMeta = yamlFront.loadFront((0, fs_extra_1.readFileSync)(path_1.default.join(file.path, 'README.zh-Hant.md')));
        const meta = {
            aria: (_a = enMeta.aria) !== null && _a !== void 0 ? _a : '',
            title: {
                'en-US': enMeta.title,
                'zh-Hant': zhMeta.title,
            },
            __content: {
                'en-US': enMeta.__content,
                'zh-Hant': zhMeta.__content,
            },
        };
        const menuGroupIndex = this.menuConfig.findIndex((menuGroup) => menuGroup.title === enMeta.group);
        if (menuGroupIndex === -1) {
            console.error(`${enMeta.group} dont exist`);
        }
        else {
            const menuItemIndex = this.menuConfig[menuGroupIndex].children.findIndex((menuItem) => menuItem.title === meta.title['en-US']);
            if (menuItemIndex === -1) {
                this.menuConfig[menuGroupIndex].children.push({
                    title: meta.title['en-US'],
                    to: String.raw `/components/${meta.title['en-US']}`,
                });
            }
            else {
                this.menuConfig[menuGroupIndex].children[menuItemIndex] = {
                    title: meta.title['en-US'],
                    to: String.raw `/components/${meta.title['en-US']}`,
                };
            }
            this.routeConfig.set(meta.title['en-US'], {
                import: String.raw `./${file.name}/${meta.title['en-US']}`,
                path: String.raw `/components/${meta.title['en-US']}`,
            });
            let importStr = '';
            const demoList = [];
            for (const demoFile of (0, fs_extra_1.readdirSync)(path_1.default.join(file.path, 'demos'))) {
                const order = (_b = demoFile.match(/^[0-9]+/)) === null || _b === void 0 ? void 0 : _b[0];
                if (order) {
                    const demo = this.generateComponentDemo({
                        name: demoFile,
                        path: path_1.default.join(file.path, 'demos', demoFile),
                        data: (0, fs_extra_1.readFileSync)(path_1.default.join(file.path, 'demos', demoFile)),
                        component: file.name,
                    }, path_1.default.join(OUTPUT_DIR, 'routes', 'components', file.name, 'demos'));
                    demoList[Number(order)] = demo;
                    if (demo) {
                        importStr += demo.get('en-US').importStatement;
                    }
                }
            }
            let componentRouteTmp = this.componentRouteTmp;
            componentRouteTmp = componentRouteTmp.replace(/__Route__/g, meta.title['en-US']);
            componentRouteTmp = componentRouteTmp.replace(/__import__/g, importStr);
            ['en-US', 'zh-Hant'].forEach((lang) => {
                var _a, _b;
                this.resources[lang].translation.menu[meta.title['en-US']] = meta.title[lang];
                let demosStr = '';
                let linksStr = '';
                demoList.forEach((demo) => {
                    if (demo) {
                        let demoStr = String.raw `
<AppDemoBox
  id="__id__"
  renderer={<__renderer__Demo />}
  title="__title__"
  description={[__description__]}
  tsxSource={[__tsxSource__]}
  scssSource={[__scssSource__]}
/>
`;
                        demoStr = demoStr.replace(/__id__/g, demo.get(lang).id);
                        demoStr = demoStr.replace(/__renderer__/g, demo.get(lang).name);
                        demoStr = demoStr.replace(/__title__/g, demo.get(lang).title);
                        demoStr = demoStr.replace(/__description__/g, new TextEncoder().encode(demo.get(lang).description).join());
                        demoStr = demoStr.replace(/__tsxSource__/g, new TextEncoder().encode(demo.get(lang).tsx.match(/(?<=```tsx\n)[\s\S]*?(?=```)/g)[0]).join());
                        demoStr = demoStr.replace(/__scssSource__/g, demo.get(lang).scss ? new TextEncoder().encode(demo.get(lang).scss.match(/(?<=```scss\n)[\s\S]*?(?=```)/g)[0]).join() : '');
                        demosStr += demoStr;
                        linksStr += String.raw `{ title: '${demo.get(lang).title}', href: '#${demo.get(lang).id}' }, `;
                    }
                });
                let routeArticleProps = String.raw `
{
  title: '__title__',
  subtitle: '__subtitle__',
  description: [__description__],
  aria: '__aria__',
  api: [__api__],
  demos: (
    <>
      ${demosStr}
    </>
  ),
  links: [__links__],
}
`;
                routeArticleProps = routeArticleProps.replace(/__title__/g, meta.title['en-US']);
                routeArticleProps = routeArticleProps.replace(/__subtitle__/g, meta.title[lang]);
                routeArticleProps = routeArticleProps.replace(/__aria__/g, meta.aria);
                routeArticleProps = routeArticleProps.replace(/__links__/g, linksStr);
                const article = meta.__content[lang];
                const description = (_a = article.match(/^[\s\S]*(?=## API)/g)) === null || _a === void 0 ? void 0 : _a[0];
                const api = (_b = article.match(/## API[\s\S]*$/g)) === null || _b === void 0 ? void 0 : _b[0];
                if (description && api) {
                    routeArticleProps = routeArticleProps.replace(/__description__/g, new TextEncoder().encode(description).join());
                    routeArticleProps = routeArticleProps.replace(/__api__/g, new TextEncoder().encode(api).join());
                }
                const langRegExp = new RegExp(String.raw `__${lang}__`, 'g');
                componentRouteTmp = componentRouteTmp.replace(langRegExp, routeArticleProps);
            });
            this.outputFile(path_1.default.join(outDir, `${meta.title['en-US']}.tsx`), componentRouteTmp);
        }
    }
    generateRoute(routeName, dirPath) {
        let routeTmp = this.routeTmp;
        routeTmp = routeTmp.replace(/__Route__/g, routeName);
        ['en-US', 'zh-Hant'].forEach((lang) => {
            const langRegExp = new RegExp(String.raw `__${lang}__`, 'g');
            routeTmp = routeTmp.replace(langRegExp, new TextEncoder()
                .encode((0, fs_extra_1.readFileSync)(path_1.default.join(dirPath, routeName + (lang === 'en-US' ? '' : `.${lang}`)) + '.md').toString())
                .join());
        });
        this.outputFile(path_1.default.join(dirPath, routeName, `${routeName}.tsx`), routeTmp);
    }
    generateGlobalFiles() {
        this.outputJson(path_1.default.join(OUTPUT_DIR, 'configs', 'menu.json'), this.menuConfig);
        this.outputJson(path_1.default.join(OUTPUT_DIR, 'i18n', 'resources.json'), this.resources);
        let importStr = '';
        let routeStr = '';
        for (const [key, value] of this.routeConfig.entries()) {
            importStr += String.raw `const ${key}Route = lazy(() => import('${value.import}'));
`;
            routeStr += String.raw `
{
  path: '${value.path}',
  component: ${key}Route,
},
`;
        }
        let componentRoutesTmp = this.componentRoutesTmp;
        componentRoutesTmp = componentRoutesTmp.replace(/__import__/g, importStr);
        componentRoutesTmp = componentRoutesTmp.replace(/__Route__/g, routeStr);
        this.outputFile(path_1.default.join(OUTPUT_DIR, 'routes', 'components', 'routes.ts'), componentRoutesTmp);
    }
    generateAll() {
        var _a;
        const components = (0, fs_extra_1.readdirSync)(COMPONENT_DIR);
        for (const component of components) {
            const componentPath = path_1.default.join(COMPONENT_DIR, component);
            if (!component.startsWith('_') && (0, fs_extra_1.statSync)(componentPath).isDirectory() && (0, fs_extra_1.readdirSync)(componentPath).includes('README.md')) {
                this.generateComponentRoute({ name: component, path: componentPath, data: components }, path_1.default.join(OUTPUT_DIR, 'routes', 'components', component));
            }
        }
        for (const ROUTE of COMPONENT_ROUTE_DIR) {
            const files = (0, fs_extra_1.readdirSync)(ROUTE);
            for (const file of files) {
                if (file.endsWith('.md') && ((_a = file.match(/\./g)) === null || _a === void 0 ? void 0 : _a.length) === 1) {
                    this.generateRoute(file.slice(0, -3), ROUTE);
                }
            }
        }
        this.generateGlobalFiles();
    }
    updateTmp() {
        this.resources = (0, fs_extra_1.readJsonSync)(path_1.default.join(__dirname, 'site', 'resources.json'));
        this.menuGroups = (0, fs_extra_1.readJsonSync)(path_1.default.join(__dirname, 'site', 'menu-groups.json'));
        this.componentRoutesTmp = (0, fs_extra_1.readFileSync)(path_1.default.join(__dirname, 'site', 'component-routes.txt')).toString();
        this.componentRouteTmp = (0, fs_extra_1.readFileSync)(path_1.default.join(__dirname, 'site', 'ComponentRoute.txt')).toString();
        this.routeTmp = (0, fs_extra_1.readFileSync)(path_1.default.join(__dirname, 'site', 'Route.txt')).toString();
        this.menuConfig = [];
        this.menuGroups.forEach((item) => {
            this.menuConfig.push({
                title: item['en-US'],
                children: [],
            });
            Object.keys(item).forEach((lang) => {
                this.resources[lang].translation['menu-group'][item['en-US']] = item[lang];
            });
        });
    }
}
class FileWatcher {
    constructor() {
        Object.defineProperty(this, "subject", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new rxjs_1.Subject()
        });
        Object.defineProperty(this, "taskQueue", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "watcherList", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
    }
    get onUpdate() {
        return this.subject.pipe((0, operators_1.debounceTime)(200), (0, operators_1.tap)(() => {
            for (const cb of this.taskQueue.values()) {
                cb();
            }
            this.taskQueue.clear();
        }));
    }
    addWatcher(file, task) {
        this.watcherList.set(file, (0, fs_extra_1.watch)(file, () => {
            this.taskQueue.set(task.id, task.callback);
            this.subject.next(void 0);
        }));
    }
    updateWatcher(file, task) {
        this.removeWatcher(file);
        this.addWatcher(file, task);
    }
    removeWatcher(file) {
        const watcher = this.watcherList.get(file);
        if (watcher) {
            watcher.close();
            this.watcherList.delete(file);
        }
    }
    removeAllWatcher() {
        for (const watcher of this.watcherList.values()) {
            watcher.close();
        }
        this.watcherList.clear();
    }
    hasWatcher(file) {
        return this.watcherList.has(file);
    }
}
function siteBuildExecutor(options, context) {
    return __asyncGenerator(this, arguments, function* siteBuildExecutor_1() {
        console.info(`Bundling files of ${context.projectName}...`);
        const generateMediator = new GenerateSite();
        generateMediator.generateAll();
        if (options.watch) {
            const fileWatcher = new FileWatcher();
            const refreshComponentWatcher = () => {
                var _a;
                const components = (0, fs_extra_1.readdirSync)(COMPONENT_DIR);
                for (const component of components) {
                    const componentPath = path_1.default.join(COMPONENT_DIR, component);
                    if (!component.startsWith('_') && (0, fs_extra_1.statSync)(componentPath).isDirectory() && (0, fs_extra_1.readdirSync)(componentPath).includes('README.md')) {
                        const task = {
                            id: `generateComponentRoute_${component}`,
                            callback: () => {
                                console.info(`Update ${component}...`);
                                generateMediator.generateComponentRoute({ name: component, path: componentPath, data: components }, path_1.default.join(OUTPUT_DIR, 'routes', 'components', component));
                                generateMediator.generateGlobalFiles();
                            },
                        };
                        if (!fileWatcher.hasWatcher(path_1.default.join(componentPath, 'README.md'))) {
                            fileWatcher.addWatcher(path_1.default.join(componentPath, 'README.md'), task);
                            fileWatcher.addWatcher(path_1.default.join(componentPath, 'README.zh-Hant.md'), task);
                            fileWatcher.addWatcher(path_1.default.join(componentPath, 'demos'), task);
                        }
                    }
                }
                for (const ROUTE of COMPONENT_ROUTE_DIR) {
                    const files = (0, fs_extra_1.readdirSync)(ROUTE);
                    for (const file of files) {
                        if (file.endsWith('.md') && ((_a = file.match(/\./g)) === null || _a === void 0 ? void 0 : _a.length) === 1) {
                            const routeName = file.slice(0, -3);
                            const task = {
                                id: `generateRoute_${routeName}`,
                                callback: () => {
                                    console.info(`Update ${routeName}...`);
                                    generateMediator.generateRoute(routeName, ROUTE);
                                    generateMediator.generateGlobalFiles();
                                },
                            };
                            if (!fileWatcher.hasWatcher(path_1.default.join(ROUTE, file))) {
                                fileWatcher.addWatcher(path_1.default.join(ROUTE, routeName + '.md'), task);
                                fileWatcher.addWatcher(path_1.default.join(ROUTE, routeName + '.zh-Hant.md'), task);
                            }
                        }
                    }
                }
            };
            fileWatcher.addWatcher(path_1.default.join(__dirname, 'site'), {
                id: 'generateAll',
                callback: () => {
                    console.info(`Update site...`);
                    generateMediator.updateTmp();
                    generateMediator.generateAll();
                },
            });
            refreshComponentWatcher();
            const refreshComponentWatcherLoop = () => {
                setTimeout(() => {
                    refreshComponentWatcher();
                    refreshComponentWatcherLoop();
                }, 3000);
            };
            refreshComponentWatcherLoop();
            return yield __await(yield __await(yield* __asyncDelegator(__asyncValues((0, rxjs_for_await_1.eachValueFrom)(fileWatcher.onUpdate.pipe((0, operators_1.mapTo)({ success: true })))))));
        }
        return yield __await({ success: true });
    });
}
exports.default = siteBuildExecutor;
