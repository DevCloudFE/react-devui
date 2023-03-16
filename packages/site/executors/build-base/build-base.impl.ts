/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { ExecutorContext } from '@nrwl/devkit';
import type { FSWatcher } from 'fs-extra';

import { createHash } from 'crypto';
import path from 'path';

import { removeSync } from 'fs-extra';
import { readdirSync, statSync, readJsonSync, readFileSync, outputJsonSync, outputFileSync, watch } from 'fs-extra';
import { capitalize } from 'lodash';
import { Subject } from 'rxjs';
import { eachValueFrom } from 'rxjs-for-await';
import { debounceTime, tap, mapTo } from 'rxjs/operators';
import { loadFront } from 'yaml-front-matter';

const COMPONENTS_DIR = String.raw`packages/ui/src/components`;
const ROUTES_DIR = String.raw`packages/site/src/app/routes`;
const OUTPUT_PATH = {
  routeDir: String.raw`packages/site/dist/routes`,
  componentDir: (name: string) => path.join(String.raw`packages/site/dist/routes/components`, name),
  componentDemoDir: (name: string) => path.join(String.raw`packages/site/dist/routes/components`, name, 'demos'),
  routes: String.raw`packages/site/dist/routes/index.ts`,
  'menu.json': String.raw`packages/site/dist/menu.json`,
  'resources.json': String.raw`packages/site/dist/resources.json`,
};

export interface SiteBuildExecutorOptions {
  watch: boolean;
}

interface ComponentMeta {
  group?: string;
  title: string;
  img?: string;
  aria?: string;
  compose?: string;
  'virtual-scroll'?: string;
  __content: string;
}

interface DemoMeta {
  title: { 'en-US': string; 'zh-CN': string };
  __content: string;
}

const LANGS = ['en-US', 'zh-CN'] as const;

class GenerateSite {
  private hashList = new Map<string, string>();
  private menuConfig: { title: string; children: { title: string; to: string }[] }[] = [];
  private routes = new Map<string, { import: string; path: string }>();

  private resources!: {
    'en-US': {
      translation: {
        menu: {
          'components-group': { [index: string]: string };
          components: { [index: string]: string };
        };
      };
    };
    'zh-CN': {
      translation: {
        menu: {
          'components-group': { [index: string]: string };
          components: { [index: string]: string };
        };
      };
    };
  };
  private menuGroups!: { 'en-US': string; 'zh-CN': string }[];
  private routesTmp!: string;
  private componentRouteTmp!: string;
  private mdRouteTmp!: string;

  constructor() {
    this.updateTmp();
  }

  private outputFile(filePath: string, data: string) {
    const hash = createHash('md5').update(data).digest('hex');
    if (this.hashList.get(filePath) !== hash) {
      this.hashList.set(filePath, hash);
      outputFileSync(filePath, data);
    }
  }

  private outputJson(filePath: string, data: unknown) {
    const hash = createHash('md5').update(JSON.stringify(data)).digest('hex');
    if (this.hashList.get(filePath) !== hash) {
      this.hashList.set(filePath, hash);
      outputJsonSync(filePath, data);
    }
  }

  private generateComponentDemo(file: { name: string; path: string; component: string; componentTitle: string; data: Buffer }) {
    const meta = loadFront(file.data) as DemoMeta;
    const outDir = OUTPUT_PATH.componentDemoDir(file.component);

    const fileNameRegExp = new RegExp(String.raw`(?<=^[0-9]+.)[a-zA-Z0-9]+(?=.md$)`, 'g');
    const fileName = file.name.match(fileNameRegExp)?.[0];
    const id = file.componentTitle + fileName + 'Demo';
    const tsx = meta.__content.match(/(?<=```tsx)[\s\S]*?(?=```)/g)?.[0];
    const scss = meta.__content.match(/(?<=```scss)[\s\S]*?(?=```)/g)?.[0];

    if (fileName && tsx) {
      let outTSX = tsx;
      if (scss) {
        outTSX =
          String.raw`import './${fileName}.scss';
` + outTSX;

        this.outputFile(
          path.join(outDir, `${fileName}.scss`),
          String.raw`
#${id}{
  ${scss.split(/\n/g).join('\n  ')}
}
`
        );
      }

      outTSX =
        String.raw`/* eslint-disable */
// @ts-nocheck
` + outTSX;

      this.outputFile(path.join(outDir, `${fileName}.tsx`), outTSX);

      const demo = new Map<
        'en-US' | 'zh-CN',
        {
          id?: string;
          name?: string;
          title?: string;
          description?: string;
          importStatement?: string;
          tsx?: string;
          scss?: string;
        }
      >([
        ['en-US', {}],
        ['zh-CN', {}],
      ]);
      Array.from(demo.keys()).forEach((lang, index, langs) => {
        const obj = demo.get(lang)!;
        obj.id = id;
        obj.name = fileName;
        obj.title = meta.title[lang];
        const descriptionRegExp = new RegExp(
          String.raw`(?<=# ${lang})[\s\S]*${index === langs.length - 1 ? '(?=```tsx)' : `(?=# ${langs[index + 1]})`}`,
          'g'
        );
        const description = meta.__content.match(descriptionRegExp)?.[0];
        if (description) {
          obj.description = description;
        }
        obj.importStatement = String.raw`import ${fileName}Demo from './demos/${fileName}';
`;
        obj.tsx = meta.__content.match(/```tsx[\s\S]*?```/g)![0];
        if (scss) {
          obj.scss = meta.__content.match(/```scss[\s\S]*?```/g)![0];
        }
      });
      return demo;
    }
  }

  generateComponentRoute(file: { name: string; path: string; data: string[] }) {
    const enMeta = loadFront(readFileSync(path.join(file.path, 'README.md'))) as ComponentMeta;
    const zhMeta = loadFront(readFileSync(path.join(file.path, 'README.zh-CN.md'))) as ComponentMeta;
    const meta = {
      aria: enMeta.aria ?? '',
      compose: enMeta.compose ?? '',
      'virtual-scroll': enMeta['virtual-scroll'] ?? '',
      title: {
        'en-US': enMeta.title,
        'zh-CN': zhMeta.title,
      },
      __content: {
        'en-US': enMeta.__content,
        'zh-CN': zhMeta.__content,
      },
    };

    const menuGroupIndex = this.menuConfig.findIndex((menuGroup) => menuGroup.title === enMeta.group!);
    if (menuGroupIndex === -1) {
      console.error(`${enMeta.group!} dont exist`);
    } else {
      const menuItemIndex = this.menuConfig[menuGroupIndex].children.findIndex((menuItem) => menuItem.title === meta.title['en-US']);
      if (menuItemIndex === -1) {
        this.menuConfig[menuGroupIndex].children.push({
          title: meta.title['en-US'],
          to: String.raw`/components/${meta.title['en-US']}`,
        });
      } else {
        this.menuConfig[menuGroupIndex].children[menuItemIndex] = {
          title: meta.title['en-US'],
          to: String.raw`/components/${meta.title['en-US']}`,
        };
      }

      this.routes.set(`Components${meta.title['en-US']}`, {
        import: String.raw`./components/${file.name}/${meta.title['en-US']}`,
        path: String.raw`/components/${meta.title['en-US']}`,
      });

      let importStr = '';
      const demoList: ReturnType<GenerateSite['generateComponentDemo']>[] = [];
      for (const demoFile of readdirSync(path.join(file.path, 'demos'))) {
        const order = demoFile.match(/^[0-9]+/)?.[0];
        if (order) {
          const demo = this.generateComponentDemo({
            name: demoFile,
            path: path.join(file.path, 'demos', demoFile),
            data: readFileSync(path.join(file.path, 'demos', demoFile)),
            component: file.name,
            componentTitle: enMeta.title,
          });
          demoList[Number(order)] = demo;
          if (demo) {
            importStr += demo.get('en-US')!.importStatement;
          }
        }
      }

      let componentRouteTmp = this.componentRouteTmp;
      let tsxSources = '';
      let scssSources = '';
      componentRouteTmp = componentRouteTmp.replace(/__Route__/g, meta.title['en-US']);
      componentRouteTmp = componentRouteTmp.replace(/__import__/g, importStr);
      LANGS.forEach((lang) => {
        this.resources[lang].translation.menu.components[meta.title['en-US']] = meta.title[lang];

        let demosStr = '';
        let linksStr = '';
        demoList.forEach((demo) => {
          if (demo) {
            const id = demo.get(lang)!.id!;

            let demoStr = String.raw`
<AppDemoBox
  id="${id}"
  renderer={<__renderer__Demo />}
  title="__title__"
  description={[__description__]}
  tsxSource={tsxSources['${id}']}
  scssSource={scssSources['${id}']}
/>
`;
            demoStr = demoStr.replace(/__renderer__/g, demo.get(lang)!.name!);
            demoStr = demoStr.replace(/__title__/g, demo.get(lang)!.title!);
            demoStr = demoStr.replace(/__description__/g, new TextEncoder().encode(demo.get(lang)!.description!).join());
            tsxSources += String.raw`
'${id}': [${new TextEncoder().encode(demo.get(lang)!.tsx!.match(/(?<=```tsx\n)[\s\S]*?(?=```)/g)![0]).join()}],`;
            if (demo.get(lang)!.scss) {
              scssSources += String.raw`
'${id}': [${new TextEncoder().encode(demo.get(lang)!.scss!.match(/(?<=```scss\n)[\s\S]*?(?=```)/g)![0]).join()}],`;
            }
            demosStr += demoStr;

            linksStr += String.raw`{ title: '${demo.get(lang)!.title!}', href: '${id}' }, `;
          }
        });
        componentRouteTmp = componentRouteTmp.replace(/__tsxSources__/g, tsxSources);
        componentRouteTmp = componentRouteTmp.replace(/__scssSources__/g, scssSources);

        let routeArticleProps = String.raw`
{
  title: '__title__',
  subtitle: '__subtitle__',
  description: [__description__],
  aria: '__aria__',
  compose: '__compose__',
  'virtual-scroll': '__virtual-scroll__',
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
        routeArticleProps = routeArticleProps.replace(/__compose__/g, meta.compose);
        routeArticleProps = routeArticleProps.replace(/__virtual-scroll__/g, meta['virtual-scroll']);
        routeArticleProps = routeArticleProps.replace(/__links__/g, linksStr);

        const article = meta.__content[lang];
        const description = article.match(/^[\s\S]*(?=## API)/g)?.[0];
        const api = article.match(/## API[\s\S]*$/g)?.[0];
        if (description && api) {
          routeArticleProps = routeArticleProps.replace(/__description__/g, new TextEncoder().encode(description).join());
          routeArticleProps = routeArticleProps.replace(/__api__/g, new TextEncoder().encode(api).join());
        }
        const langRegExp = new RegExp(String.raw`__${lang}__`, 'g');
        componentRouteTmp = componentRouteTmp.replace(langRegExp, routeArticleProps);
      });

      this.outputFile(path.join(OUTPUT_PATH.componentDir(file.name), `${meta.title['en-US']}.tsx`), componentRouteTmp);
    }
  }

  generateRouteMD(paths: string[], routeName: string) {
    this.routes.set(
      `${paths
        .slice(0, -1)
        .map((p) => capitalize(p))
        .join('')}${routeName}`,
      {
        import: String.raw`./${[...paths, routeName].join('/')}`,
        path: String.raw`/${[...paths.slice(0, -1), routeName].join('/')}`,
      }
    );

    let mdRouteTmp = this.mdRouteTmp;
    mdRouteTmp = mdRouteTmp.replace(/__Route__/g, routeName);
    LANGS.forEach((lang) => {
      const langRegExp = new RegExp(String.raw`__${lang}__`, 'g');
      mdRouteTmp = mdRouteTmp.replace(
        langRegExp,
        new TextEncoder()
          .encode(
            readFileSync(path.join(ROUTES_DIR, ...paths, routeName + (lang === 'en-US' ? '' : `.${lang}`)) + '.md', { encoding: 'utf8' })
          )
          .join()
      );
    });
    this.outputFile(path.join(OUTPUT_PATH.routeDir, ...paths, `${routeName}.tsx`), mdRouteTmp);
  }

  generateGlobalFiles() {
    this.outputJson(OUTPUT_PATH['menu.json'], this.menuConfig);
    this.outputJson(OUTPUT_PATH['resources.json'], this.resources);

    let importStr = '';
    let routeStr = '';
    for (const [key, value] of this.routes.entries()) {
      importStr += String.raw`const ${key}Route = lazy(() => import('${value.import}'));
`;
      routeStr += String.raw`
{
  path: '${value.path}',
  component: ${key}Route,
},
`;
    }
    let routesTmp = this.routesTmp;
    routesTmp = routesTmp.replace(/__import__/g, importStr);
    routesTmp = routesTmp.replace(/__Route__/g, routeStr);
    this.outputFile(OUTPUT_PATH.routes, routesTmp);
  }

  generateAll() {
    const components = readdirSync(COMPONENTS_DIR);
    for (const component of components) {
      const componentPath = path.join(COMPONENTS_DIR, component);
      if (!component.startsWith('_') && statSync(componentPath).isDirectory() && readdirSync(componentPath).includes('README.md')) {
        this.generateComponentRoute({
          name: component,
          path: componentPath,
          data: components,
        });
      }
    }

    const reduceMD = (mdPath: string, paths: string[] = []) => {
      const files = readdirSync(mdPath);
      for (const file of files) {
        const filePath = path.join(mdPath, file);
        if (statSync(filePath).isDirectory()) {
          reduceMD(filePath, [...paths, file]);
        } else if (file.endsWith('.md') && file.match(/\./g)?.length === 1) {
          this.generateRouteMD(paths, file.slice(0, -3));
        }
      }
    };
    reduceMD(ROUTES_DIR);

    this.generateGlobalFiles();
  }

  updateTmp() {
    this.resources = readJsonSync(path.join(__dirname, 'files', 'resources.json'));
    this.menuGroups = readJsonSync(path.join(__dirname, 'files', 'menu-groups.json'));
    this.routesTmp = readFileSync(path.join(__dirname, 'files', 'routes.txt'), { encoding: 'utf8' });
    this.componentRouteTmp = readFileSync(path.join(__dirname, 'files', 'ComponentRoute.txt'), { encoding: 'utf8' });
    this.mdRouteTmp = readFileSync(path.join(__dirname, 'files', 'MdRoute.txt'), { encoding: 'utf8' });

    this.menuConfig = [];
    this.menuGroups.forEach((item) => {
      this.menuConfig.push({
        title: item['en-US'],
        children: [],
      });

      LANGS.forEach((lang) => {
        this.resources[lang].translation.menu['components-group'][item['en-US']] = item[lang];
      });
    });
  }
}

class FileWatcher {
  private subject = new Subject();
  private taskQueue = new Map<string, () => void>();
  private watcherList = new Map<string, FSWatcher>();

  public get onUpdate() {
    return this.subject.pipe(
      debounceTime(200),
      tap(() => {
        for (const cb of this.taskQueue.values()) {
          cb();
        }
        this.taskQueue.clear();
      })
    );
  }

  addWatcher(file: string, task: { id: string; callback: () => void }) {
    this.watcherList.set(
      file,
      watch(file, () => {
        this.taskQueue.set(task.id, task.callback);
        this.subject.next(void 0);
      })
    );
  }

  updateWatcher(file: string, task: { id: string; callback: () => void }) {
    this.removeWatcher(file);
    this.addWatcher(file, task);
  }

  removeWatcher(file: string) {
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

  hasWatcher(file: string) {
    return this.watcherList.has(file);
  }
}

export default async function* siteBuildExecutor(options: SiteBuildExecutorOptions, context: ExecutorContext) {
  console.info(`Clear files of ${context.projectName}...`);
  removeSync(String.raw`packages/site/dist`);

  console.info(`Bundling files of ${context.projectName}...`);

  const generateMediator = new GenerateSite();
  generateMediator.generateAll();

  if (options.watch) {
    const fileWatcher = new FileWatcher();

    const refreshComponentWatcher = () => {
      const components = readdirSync(COMPONENTS_DIR);
      for (const component of components) {
        const componentPath = path.join(COMPONENTS_DIR, component);
        if (!component.startsWith('_') && statSync(componentPath).isDirectory() && readdirSync(componentPath).includes('README.md')) {
          const task = {
            id: `generateComponentRoute_${component}`,
            callback: () => {
              console.info(`Update ${component}...`);

              generateMediator.generateComponentRoute({
                name: component,
                path: componentPath,
                data: components,
              });
              generateMediator.generateGlobalFiles();
            },
          };
          if (!fileWatcher.hasWatcher(path.join(componentPath, 'README.md'))) {
            fileWatcher.addWatcher(path.join(componentPath, 'README.md'), task);
            fileWatcher.addWatcher(path.join(componentPath, 'README.zh-CN.md'), task);
            fileWatcher.addWatcher(path.join(componentPath, 'demos'), task);
          }
        }
      }

      const reduceMD = (mdPath: string, paths: string[] = []) => {
        const files = readdirSync(mdPath);
        for (const file of files) {
          const filePath = path.join(mdPath, file);
          if (statSync(filePath).isDirectory()) {
            reduceMD(filePath, [...paths, file]);
          } else if (file.endsWith('.md') && file.match(/\./g)?.length === 1) {
            const routeName = file.slice(0, -3);
            const task = {
              id: `generateRoute_${routeName}`,
              callback: () => {
                console.info(`Update ${routeName}...`);

                generateMediator.generateRouteMD(paths, routeName);
                generateMediator.generateGlobalFiles();
              },
            };
            if (!fileWatcher.hasWatcher(filePath)) {
              fileWatcher.addWatcher(path.join(mdPath, routeName + '.md'), task);
              fileWatcher.addWatcher(path.join(mdPath, routeName + '.zh-CN.md'), task);
            }
          }
        }
      };
      reduceMD(ROUTES_DIR);
    };

    fileWatcher.addWatcher(path.join(__dirname, 'files'), {
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

    return yield* eachValueFrom(fileWatcher.onUpdate.pipe(mapTo({ success: true })));
  }

  return { success: true };
}
