"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var crypto_1 = require("crypto");
var path_1 = (0, tslib_1.__importDefault)(require("path"));
var fs_extra_1 = require("fs-extra");
var highlight_js_1 = (0, tslib_1.__importDefault)(require("highlight.js"));
var marked_1 = (0, tslib_1.__importStar)(require("marked"));
var rxjs_1 = require("rxjs");
var rxjs_for_await_1 = require("rxjs-for-await");
var operators_1 = require("rxjs/operators");
var yamlFront = require('yaml-front-matter');
var renderer = new marked_1.Renderer();
renderer.heading = function (text, level) {
    var link = "<a href=\"#".concat(text, "\" class=\"anchor\">#</a>");
    var head = "\n<h".concat(level, " id=\"").concat(text, "\">\n  <span>").concat(text, "</span>\n  ").concat(link, "\n</h").concat(level, ">\n");
    return head;
};
renderer.table = function (header, body) {
    return "\n<div class=\"app-table-container\">\n <table>\n   <thead>".concat(header, "</thead>\n   <tbody>").concat(body, "</tbody>\n </table>\n</div>\n");
};
marked_1.default.setOptions({
    renderer: renderer,
    highlight: function (code, lang) {
        return highlight_js_1.default.highlight(code, { language: lang }).value;
    },
    langPrefix: 'hljs ',
});
var COMPONENT_DIR = String.raw(templateObject_1 || (templateObject_1 = (0, tslib_1.__makeTemplateObject)(["packages/ui/src/components"], ["packages/ui/src/components"])));
var OUTPUT_DIR = String.raw(templateObject_2 || (templateObject_2 = (0, tslib_1.__makeTemplateObject)(["packages/site/src/app"], ["packages/site/src/app"])));
var GenerateSite = /** @class */ (function () {
    function GenerateSite() {
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
        Object.defineProperty(this, "routesTmp", {
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
    Object.defineProperty(GenerateSite.prototype, "outputFile", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (filePath, data) {
            var hash = (0, crypto_1.createHash)('md5').update(data).digest('hex');
            if (this.hashList.get(filePath) !== hash) {
                this.hashList.set(filePath, hash);
                (0, fs_extra_1.outputFileSync)(filePath, data);
            }
        }
    });
    Object.defineProperty(GenerateSite.prototype, "outputJson", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (filePath, data) {
            var hash = (0, crypto_1.createHash)('md5').update(JSON.stringify(data)).digest('hex');
            if (this.hashList.get(filePath) !== hash) {
                this.hashList.set(filePath, hash);
                (0, fs_extra_1.outputJsonSync)(filePath, data);
            }
        }
    });
    Object.defineProperty(GenerateSite.prototype, "generateComponentDemo", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (file, outDir) {
            var _a, _b, _c;
            var meta = yamlFront.loadFront(file.data);
            var fileNameRegExp = new RegExp(String.raw(templateObject_3 || (templateObject_3 = (0, tslib_1.__makeTemplateObject)(["(?<=^[0-9]+.)[a-zA-Z]+(?=.md$)"], ["(?<=^[0-9]+.)[a-zA-Z]+(?=.md$)"]))), 'g');
            var fileName = (_a = file.name.match(fileNameRegExp)) === null || _a === void 0 ? void 0 : _a[0];
            var id = file.component[0].toUpperCase() + file.component.slice(1) + fileName + 'Demo';
            var tsx = (_b = meta.__content.match(/(?<=```tsx)[\s\S]*?(?=```)/g)) === null || _b === void 0 ? void 0 : _b[0];
            var scss = (_c = meta.__content.match(/(?<=```scss)[\s\S]*?(?=```)/g)) === null || _c === void 0 ? void 0 : _c[0];
            if (fileName && tsx) {
                var outTSX = tsx;
                if (scss) {
                    outTSX =
                        String.raw(templateObject_4 || (templateObject_4 = (0, tslib_1.__makeTemplateObject)(["import './", ".scss';\n"], ["import './", ".scss';\n"])), fileName) + outTSX;
                    this.outputFile(path_1.default.join(outDir, "".concat(fileName, ".scss")), String.raw(templateObject_5 || (templateObject_5 = (0, tslib_1.__makeTemplateObject)(["\n#", "{\n  ", "\n}\n"], ["\n#", "{\n  ", "\n}\n"])), id, scss.split(/\n/g).join('\n  ')));
                }
                outTSX =
                    String.raw(templateObject_6 || (templateObject_6 = (0, tslib_1.__makeTemplateObject)(["/* eslint-disable */\n// @ts-nocheck\n"], ["/* eslint-disable */\n// @ts-nocheck\n"]))) + outTSX;
                this.outputFile(path_1.default.join(outDir, "".concat(fileName, ".tsx")), outTSX);
                var demo_1 = new Map([
                    ['en-US', {}],
                    ['zh-Hant', {}],
                ]);
                Array.from(demo_1.keys()).forEach(function (lang, index, langs) {
                    var _a;
                    var obj = demo_1.get(lang);
                    obj.id = id;
                    obj.name = fileName;
                    obj.title = meta.title[lang];
                    var descriptionRegExp = new RegExp(String.raw(templateObject_7 || (templateObject_7 = (0, tslib_1.__makeTemplateObject)(["(?<=# ", ")[sS]*", ""], ["(?<=# ", ")[\\s\\S]*", ""])), lang, index === langs.length - 1 ? '(?=```tsx)' : "(?=# ".concat(langs[index + 1], ")")), 'g');
                    var description = (_a = meta.__content.match(descriptionRegExp)) === null || _a === void 0 ? void 0 : _a[0];
                    if (description) {
                        obj.description = (0, marked_1.default)(description);
                    }
                    obj.importStatement = String.raw(templateObject_8 || (templateObject_8 = (0, tslib_1.__makeTemplateObject)(["import ", "Demo from './demos/", "';\n"], ["import ", "Demo from './demos/", "';\n"])), fileName, fileName);
                    obj.tsx = meta.__content.match(/```tsx[\s\S]*?```/g)[0];
                    if (scss) {
                        obj.scss = meta.__content.match(/```scss[\s\S]*?```/g)[0];
                    }
                });
                return demo_1;
            }
        }
    });
    Object.defineProperty(GenerateSite.prototype, "generateComponentRoute", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (file, outDir) {
            var e_1, _a;
            var _this = this;
            var _b;
            var enMeta = yamlFront.loadFront((0, fs_extra_1.readFileSync)(path_1.default.join(file.path, 'README.md')));
            var zhMeta = yamlFront.loadFront((0, fs_extra_1.readFileSync)(path_1.default.join(file.path, 'README.zh-Hant.md')));
            var meta = {
                title: {
                    'en-US': enMeta.title,
                    'zh-Hant': zhMeta.title,
                },
                __content: {
                    'en-US': enMeta.__content,
                    'zh-Hant': zhMeta.__content,
                },
            };
            var menuGroupIndex = this.menuConfig.findIndex(function (menuGroup) { return menuGroup.title === enMeta.group; });
            if (menuGroupIndex === -1) {
                console.error("".concat(enMeta.group, " dont exist"));
            }
            else {
                var menuItemIndex = this.menuConfig[menuGroupIndex].children.findIndex(function (menuItem) { return menuItem.title === meta.title['en-US']; });
                if (menuItemIndex === -1) {
                    this.menuConfig[menuGroupIndex].children.push({
                        title: meta.title['en-US'],
                        to: String.raw(templateObject_9 || (templateObject_9 = (0, tslib_1.__makeTemplateObject)(["/components/", ""], ["/components/", ""])), meta.title['en-US']),
                    });
                }
                else {
                    this.menuConfig[menuGroupIndex].children[menuItemIndex] = {
                        title: meta.title['en-US'],
                        to: String.raw(templateObject_10 || (templateObject_10 = (0, tslib_1.__makeTemplateObject)(["/components/", ""], ["/components/", ""])), meta.title['en-US']),
                    };
                }
                this.routeConfig.set(meta.title['en-US'], {
                    import: String.raw(templateObject_11 || (templateObject_11 = (0, tslib_1.__makeTemplateObject)(["./", "/", ""], ["./", "/", ""])), file.name, meta.title['en-US']),
                    path: String.raw(templateObject_12 || (templateObject_12 = (0, tslib_1.__makeTemplateObject)(["/components/", ""], ["/components/", ""])), meta.title['en-US']),
                });
                var importStr = '';
                var demoList_1 = [];
                try {
                    for (var _c = (0, tslib_1.__values)((0, fs_extra_1.readdirSync)(path_1.default.join(file.path, 'demos'))), _d = _c.next(); !_d.done; _d = _c.next()) {
                        var demoFile = _d.value;
                        var order = (_b = demoFile.match(/^[0-9]+/)) === null || _b === void 0 ? void 0 : _b[0];
                        if (order) {
                            var demo = this.generateComponentDemo({
                                name: demoFile,
                                path: path_1.default.join(file.path, 'demos', demoFile),
                                data: (0, fs_extra_1.readFileSync)(path_1.default.join(file.path, 'demos', demoFile)),
                                component: file.name,
                            }, path_1.default.join(OUTPUT_DIR, 'routes', 'components', file.name, 'demos'));
                            demoList_1[Number(order)] = demo;
                            if (demo) {
                                importStr += demo.get('en-US').importStatement;
                            }
                        }
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                var routeTmp_1 = this.routeTmp;
                routeTmp_1 = routeTmp_1.replace(/__Route__/g, meta.title['en-US']);
                routeTmp_1 = routeTmp_1.replace(/__import__/g, importStr);
                ['en-US', 'zh-Hant'].forEach(function (lang) {
                    var _a, _b;
                    _this.resources[lang].translation.menu[meta.title['en-US']] = meta.title[lang];
                    var demosStr = '';
                    var linksStr = '';
                    demoList_1.forEach(function (demo) {
                        if (demo) {
                            var demoStr = String.raw(templateObject_13 || (templateObject_13 = (0, tslib_1.__makeTemplateObject)(["\n<AppDemoBox\n  id=\"__id__\"\n  renderer={<__renderer__Demo />}\n  title=\"__title__\"\n  description={[__description__]}\n  tsx={[__tsx__]}\n  __scss__\n  tsxSource={[__tsxSource__]}\n  __scssSource__\n/>\n"], ["\n<AppDemoBox\n  id=\"__id__\"\n  renderer={<__renderer__Demo />}\n  title=\"__title__\"\n  description={[__description__]}\n  tsx={[__tsx__]}\n  __scss__\n  tsxSource={[__tsxSource__]}\n  __scssSource__\n/>\n"])));
                            demoStr = demoStr.replace(/__id__/g, demo.get(lang).id);
                            demoStr = demoStr.replace(/__renderer__/g, demo.get(lang).name);
                            demoStr = demoStr.replace(/__title__/g, demo.get(lang).title);
                            demoStr = demoStr.replace(/__description__/g, new TextEncoder().encode(demo.get(lang).description).join());
                            demoStr = demoStr.replace(/__tsx__/g, new TextEncoder().encode((0, marked_1.default)(demo.get(lang).tsx)).join());
                            demoStr = demoStr.replace(/__scss__/g, demo.get(lang).scss ? String.raw(templateObject_14 || (templateObject_14 = (0, tslib_1.__makeTemplateObject)(["scss={String.raw", "", "", "}"], ["scss={String.raw", "", "", "}"])), '`', (0, marked_1.default)(demo.get(lang).scss), '`') : '');
                            demoStr = demoStr.replace(/__tsxSource__/g, new TextEncoder().encode(demo.get(lang).tsx.match(/(?<=```tsx\n)[\s\S]*?(?=```)/g)[0]).join());
                            demoStr = demoStr.replace(/__scssSource__/g, demo.get(lang).scss
                                ? String.raw(templateObject_15 || (templateObject_15 = (0, tslib_1.__makeTemplateObject)(["scssSource={String.raw", "", "", "}"], ["scssSource={String.raw", "", "", "}"])), '`', demo.get(lang).scss.match(/(?<=```scss\n)[\s\S]*?(?=```)/g)[0], '`') : '');
                            demosStr += demoStr;
                            linksStr += String.raw(templateObject_16 || (templateObject_16 = (0, tslib_1.__makeTemplateObject)(["{ href: '#", "', title: '", "' }, "], ["{ href: '#", "', title: '", "' }, "])), demo.get(lang).id, demo.get(lang).title);
                        }
                    });
                    var routeArticleProps = String.raw(templateObject_17 || (templateObject_17 = (0, tslib_1.__makeTemplateObject)(["\n{\n  title: '__title__',\n  subtitle: '__subtitle__',\n  description: [__description__],\n  api: [__api__],\n  demos: (\n    <>\n      ", "\n    </>\n  ),\n  links: [__links__],\n}\n"], ["\n{\n  title: '__title__',\n  subtitle: '__subtitle__',\n  description: [__description__],\n  api: [__api__],\n  demos: (\n    <>\n      ", "\n    </>\n  ),\n  links: [__links__],\n}\n"])), demosStr);
                    routeArticleProps = routeArticleProps.replace(/__title__/g, meta.title['en-US']);
                    routeArticleProps = routeArticleProps.replace(/__subtitle__/g, meta.title[lang]);
                    routeArticleProps = routeArticleProps.replace(/__links__/g, linksStr);
                    var article = meta.__content[lang];
                    var description = (_a = article.match(/^[\s\S]*(?=## API)/g)) === null || _a === void 0 ? void 0 : _a[0];
                    var api = (_b = article.match(/## API[\s\S]*$/g)) === null || _b === void 0 ? void 0 : _b[0];
                    if (description && api) {
                        routeArticleProps = routeArticleProps.replace(/__description__/g, new TextEncoder().encode((0, marked_1.default)(description)).join());
                        routeArticleProps = routeArticleProps.replace(/__api__/g, new TextEncoder().encode((0, marked_1.default)(api)).join());
                    }
                    var langRegExp = new RegExp(String.raw(templateObject_18 || (templateObject_18 = (0, tslib_1.__makeTemplateObject)(["__", "__"], ["__", "__"])), lang), 'g');
                    routeTmp_1 = routeTmp_1.replace(langRegExp, routeArticleProps);
                });
                this.outputFile(path_1.default.join(outDir, "".concat(meta.title['en-US'], ".tsx")), routeTmp_1);
            }
        }
    });
    Object.defineProperty(GenerateSite.prototype, "generateGlobalFiles", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function () {
            var e_2, _a;
            this.outputJson(path_1.default.join(OUTPUT_DIR, 'configs', 'menu.json'), this.menuConfig);
            this.outputJson(path_1.default.join(OUTPUT_DIR, 'i18n', 'resources.json'), this.resources);
            var importStr = '';
            var routeStr = '';
            try {
                for (var _b = (0, tslib_1.__values)(this.routeConfig.entries()), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var _d = (0, tslib_1.__read)(_c.value, 2), key = _d[0], value = _d[1];
                    importStr += String.raw(templateObject_19 || (templateObject_19 = (0, tslib_1.__makeTemplateObject)(["const ", "Route = lazy(() => import('", "'));\n"], ["const ", "Route = lazy(() => import('", "'));\n"])), key, value.import);
                    routeStr += String.raw(templateObject_20 || (templateObject_20 = (0, tslib_1.__makeTemplateObject)(["\n{\n  path: '", "',\n  component: ", "Route,\n},\n"], ["\n{\n  path: '", "',\n  component: ", "Route,\n},\n"])), value.path, key);
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_2) throw e_2.error; }
            }
            var routesTmp = this.routesTmp;
            routesTmp = routesTmp.replace(/__import__/g, importStr);
            routesTmp = routesTmp.replace(/__Route__/g, routeStr);
            this.outputFile(path_1.default.join(OUTPUT_DIR, 'routes', 'components', 'routes.ts'), routesTmp);
        }
    });
    Object.defineProperty(GenerateSite.prototype, "generateAll", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function () {
            var e_3, _a;
            var components = (0, fs_extra_1.readdirSync)(COMPONENT_DIR);
            try {
                for (var components_1 = (0, tslib_1.__values)(components), components_1_1 = components_1.next(); !components_1_1.done; components_1_1 = components_1.next()) {
                    var component = components_1_1.value;
                    var componentPath = path_1.default.join(COMPONENT_DIR, component);
                    if (!component.startsWith('_') && (0, fs_extra_1.statSync)(componentPath).isDirectory() && (0, fs_extra_1.readdirSync)(componentPath).includes('README.md')) {
                        this.generateComponentRoute({ name: component, path: componentPath, data: components }, path_1.default.join(OUTPUT_DIR, 'routes', 'components', component));
                    }
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (components_1_1 && !components_1_1.done && (_a = components_1.return)) _a.call(components_1);
                }
                finally { if (e_3) throw e_3.error; }
            }
            this.generateGlobalFiles();
        }
    });
    Object.defineProperty(GenerateSite.prototype, "updateTmp", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function () {
            var _this = this;
            this.resources = (0, fs_extra_1.readJsonSync)(path_1.default.join(__dirname, 'site', 'resources.json'));
            this.menuGroups = (0, fs_extra_1.readJsonSync)(path_1.default.join(__dirname, 'site', 'menu-groups.json'));
            this.routesTmp = (0, fs_extra_1.readFileSync)(path_1.default.join(__dirname, 'site', 'routes.txt')).toString();
            this.routeTmp = (0, fs_extra_1.readFileSync)(path_1.default.join(__dirname, 'site', 'Route.txt')).toString();
            this.menuConfig = [];
            this.menuGroups.forEach(function (item) {
                _this.menuConfig.push({
                    title: item['en-US'],
                    children: [],
                });
                Object.keys(item).forEach(function (lang) {
                    _this.resources[lang].translation['menu-group'][item['en-US']] = item[lang];
                });
            });
        }
    });
    return GenerateSite;
}());
var FileWatcher = /** @class */ (function () {
    function FileWatcher() {
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
    Object.defineProperty(FileWatcher.prototype, "onUpdate", {
        get: function () {
            var _this = this;
            return this.subject.pipe((0, operators_1.debounceTime)(200), (0, operators_1.tap)(function () {
                var e_4, _a;
                try {
                    for (var _b = (0, tslib_1.__values)(_this.taskQueue.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var cb = _c.value;
                        cb();
                    }
                }
                catch (e_4_1) { e_4 = { error: e_4_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_4) throw e_4.error; }
                }
                _this.taskQueue.clear();
            }));
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FileWatcher.prototype, "addWatcher", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (file, task) {
            var _this = this;
            this.watcherList.set(file, (0, fs_extra_1.watch)(file, function () {
                _this.taskQueue.set(task.id, task.callback);
                _this.subject.next(void 0);
            }));
        }
    });
    Object.defineProperty(FileWatcher.prototype, "updateWatcher", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (file, task) {
            this.removeWatcher(file);
            this.addWatcher(file, task);
        }
    });
    Object.defineProperty(FileWatcher.prototype, "removeWatcher", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (file) {
            var watcher = this.watcherList.get(file);
            if (watcher) {
                watcher.close();
                this.watcherList.delete(file);
            }
        }
    });
    Object.defineProperty(FileWatcher.prototype, "removeAllWatcher", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function () {
            var e_5, _a;
            try {
                for (var _b = (0, tslib_1.__values)(this.watcherList.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var watcher = _c.value;
                    watcher.close();
                }
            }
            catch (e_5_1) { e_5 = { error: e_5_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_5) throw e_5.error; }
            }
            this.watcherList.clear();
        }
    });
    Object.defineProperty(FileWatcher.prototype, "hasWatcher", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (file) {
            return this.watcherList.has(file);
        }
    });
    return FileWatcher;
}());
function siteBuildExecutor(options, context) {
    return (0, tslib_1.__asyncGenerator)(this, arguments, function siteBuildExecutor_1() {
        var generateMediator, fileWatcher_1, refreshComponentWatcher_1, refreshComponentWatcherLoop_1;
        return (0, tslib_1.__generator)(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.info("Bundling files of ".concat(context.projectName, "..."));
                    generateMediator = new GenerateSite();
                    generateMediator.generateAll();
                    if (!options.watch) return [3 /*break*/, 4];
                    fileWatcher_1 = new FileWatcher();
                    refreshComponentWatcher_1 = function () {
                        var e_6, _a;
                        var components = (0, fs_extra_1.readdirSync)(COMPONENT_DIR);
                        var _loop_1 = function (component) {
                            var componentPath = path_1.default.join(COMPONENT_DIR, component);
                            if (!component.startsWith('_') && (0, fs_extra_1.statSync)(componentPath).isDirectory() && (0, fs_extra_1.readdirSync)(componentPath).includes('README.md')) {
                                var task = {
                                    id: "generateComponentRoute_".concat(component),
                                    callback: function () {
                                        console.info("Update ".concat(component, "..."));
                                        generateMediator.generateComponentRoute({ name: component, path: componentPath, data: components }, path_1.default.join(OUTPUT_DIR, 'routes', 'components', component));
                                        generateMediator.generateGlobalFiles();
                                    },
                                };
                                if (!fileWatcher_1.hasWatcher(path_1.default.join(componentPath, 'README.md'))) {
                                    fileWatcher_1.addWatcher(path_1.default.join(componentPath, 'README.md'), task);
                                    fileWatcher_1.addWatcher(path_1.default.join(componentPath, 'README.zh-Hant.md'), task);
                                    fileWatcher_1.addWatcher(path_1.default.join(componentPath, 'demos'), task);
                                }
                            }
                        };
                        try {
                            for (var components_2 = (0, tslib_1.__values)(components), components_2_1 = components_2.next(); !components_2_1.done; components_2_1 = components_2.next()) {
                                var component = components_2_1.value;
                                _loop_1(component);
                            }
                        }
                        catch (e_6_1) { e_6 = { error: e_6_1 }; }
                        finally {
                            try {
                                if (components_2_1 && !components_2_1.done && (_a = components_2.return)) _a.call(components_2);
                            }
                            finally { if (e_6) throw e_6.error; }
                        }
                    };
                    fileWatcher_1.addWatcher(path_1.default.join(__dirname, 'site'), {
                        id: 'generateAll',
                        callback: function () {
                            console.info("Update site...");
                            generateMediator.updateTmp();
                            generateMediator.generateAll();
                        },
                    });
                    refreshComponentWatcher_1();
                    refreshComponentWatcherLoop_1 = function () {
                        setTimeout(function () {
                            refreshComponentWatcher_1();
                            refreshComponentWatcherLoop_1();
                        }, 3000);
                    };
                    refreshComponentWatcherLoop_1();
                    return [5 /*yield**/, (0, tslib_1.__values)((0, tslib_1.__asyncDelegator)((0, tslib_1.__asyncValues)((0, rxjs_for_await_1.eachValueFrom)(fileWatcher_1.onUpdate.pipe((0, operators_1.mapTo)({ success: true }))))))];
                case 1: return [4 /*yield*/, tslib_1.__await.apply(void 0, [_a.sent()])];
                case 2: return [4 /*yield*/, tslib_1.__await.apply(void 0, [_a.sent()])];
                case 3: return [2 /*return*/, _a.sent()];
                case 4: return [4 /*yield*/, (0, tslib_1.__await)({ success: true })];
                case 5: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports.default = siteBuildExecutor;
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6, templateObject_7, templateObject_8, templateObject_9, templateObject_10, templateObject_11, templateObject_12, templateObject_13, templateObject_14, templateObject_15, templateObject_16, templateObject_17, templateObject_18, templateObject_19, templateObject_20;
