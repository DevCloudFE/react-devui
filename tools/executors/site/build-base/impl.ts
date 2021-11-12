import type { ExecutorContext } from '@nrwl/devkit';
import type { FSWatcher } from 'fs-extra';

import { createHash } from 'crypto';
import path from 'path';

import { readdirSync, statSync, readJsonSync, readFileSync, outputJsonSync, outputFileSync, watch } from 'fs-extra';
import hljs from 'highlight.js';
import marked, { Renderer } from 'marked';
import { Subject } from 'rxjs';
import { eachValueFrom } from 'rxjs-for-await';
import { debounceTime, tap, mapTo } from 'rxjs/operators';

const yamlFront = require('yaml-front-matter');

const renderer = new Renderer();
renderer.heading = function (text, level) {
  const link = `<a href="#${text}" class="anchor">#</a>`;
  const head = `
<h${level} id="${text}">
  <span>${text}</span>
  ${link}
</h${level}>
`;
  return head;
};
marked.setOptions({
  renderer,
  highlight: function (code, lang) {
    return hljs.highlight(code, { language: lang }).value;
  },
  langPrefix: 'hljs ',
});

const COMPONENT_DIR = String.raw`packages/ui/src/components`;
const OUTPUT_DIR = String.raw`packages/site/src/app`;

export interface SiteBuildExecutorOptions {
  watch: boolean;
}

interface FileMeta {
  name: string;
  path: string;
  data: Buffer | string[];
}

interface ComponentMeta {
  group?: string;
  title: string;
  img?: string;
  __content: string;
}

interface DemoMeta {
  title: { 'en-US': string; 'zh-Hant': string };
  __content: string;
}

class GenerateSite {
  private hashList = new Map<string, string>();
  private menuConfig: Array<{ title: string; children: Array<{ title: string; to: string }> }> = [];
  private routeConfig = new Map<string, { import: string; path: string }>();

  private resources!: {
    'en-US': {
      translation: {
        'menu-group': { [index: string]: string };
        menu: { [index: string]: string };
      } & { [index: string]: string };
    };
    'zh-Hant': {
      translation: {
        'menu-group': { [index: string]: string };
        menu: { [index: string]: string };
      } & { [index: string]: string };
    };
  };
  private menuGroups!: Array<{ 'en-US': string; 'zh-Hant': string }>;
  private appTmp!: string;
  private routeTmp!: string;

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

  private generateComponentDemo(file: FileMeta & { component: string }, outDir: string) {
    const meta: DemoMeta = yamlFront.loadFront(file.data);

    const fileNameRegExp = new RegExp(String.raw`(?<=^[0-9]+.)[a-zA-Z]+(?=.md$)`, 'g');
    const fileName = file.name.match(fileNameRegExp)?.[0];
    const id = file.component[0].toUpperCase() + file.component.slice(1) + fileName + 'Demo';
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
        'en-US' | 'zh-Hant',
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
        ['zh-Hant', {}],
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
          obj.description = marked(description);
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

  generateComponentRoute(file: FileMeta, outDir: string) {
    const enMeta: ComponentMeta = yamlFront.loadFront(readFileSync(path.join(file.path, 'README.md')));
    const zhMeta: ComponentMeta = yamlFront.loadFront(readFileSync(path.join(file.path, 'README.zh-Hant.md')));
    const meta = {
      title: {
        'en-US': enMeta.title,
        'zh-Hant': zhMeta.title,
      },
      __content: {
        'en-US': enMeta.__content,
        'zh-Hant': zhMeta.__content,
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

      this.routeConfig.set(meta.title['en-US'], {
        import: String.raw`./routes/components/${file.name}/${meta.title['en-US']}`,
        path: String.raw`/components/${meta.title['en-US']}`,
      });

      let importStr = '';
      const demoList: Array<ReturnType<GenerateSite['generateComponentDemo']>> = [];
      for (const demoFile of readdirSync(path.join(file.path, 'demos'))) {
        const order = demoFile.match(/^[0-9]+/)?.[0];
        if (order) {
          const demo = this.generateComponentDemo(
            {
              name: demoFile,
              path: path.join(file.path, 'demos', demoFile),
              data: readFileSync(path.join(file.path, 'demos', demoFile)),
              component: file.name,
            },
            path.join(OUTPUT_DIR, 'routes', 'components', file.name, 'demos')
          );
          demoList[Number(order)] = demo;
          if (demo) {
            importStr += demo.get('en-US')!.importStatement;
          }
        }
      }

      let routeTmp = this.routeTmp;
      routeTmp = routeTmp.replace(/__Route__/g, meta.title['en-US']);
      routeTmp = routeTmp.replace(/__import__/g, importStr);
      (['en-US', 'zh-Hant'] as const).forEach((lang) => {
        this.resources[lang].translation.menu[meta.title['en-US']] = meta.title[lang];

        let demosStr = '';
        let linksStr = '';
        demoList.forEach((demo) => {
          if (demo) {
            let demoStr = String.raw`
<AppDemoBox
  id="__id__"
  renderer={<__renderer__Demo />}
  title="__title__"
  description={String.raw${'`'}__description__${'`'}}
  tsx={String.raw${'`'}__tsx__${'`'}}
  __scss__
  tsxSource={String.raw${'`'}__tsxSource__${'`'}}
  __scssSource__
/>
`;
            demoStr = demoStr.replace(/__id__/g, demo.get(lang)!.id!);
            demoStr = demoStr.replace(/__renderer__/g, demo.get(lang)!.name!);
            demoStr = demoStr.replace(/__title__/g, demo.get(lang)!.title!);
            demoStr = demoStr.replace(/__description__/g, demo.get(lang)!.description!);
            demoStr = demoStr.replace(/__tsx__/g, marked(demo.get(lang)!.tsx!));
            demoStr = demoStr.replace(
              /__scss__/g,
              demo.get(lang)!.scss ? String.raw`scss={String.raw${'`'}${marked(demo.get(lang)!.scss!)}${'`'}}` : ''
            );
            demoStr = demoStr.replace(/__tsxSource__/g, demo.get(lang)!.tsx!.match(/(?<=```tsx\n)[\s\S]*?(?=```)/g)![0]);
            demoStr = demoStr.replace(
              /__scssSource__/g,
              demo.get(lang)!.scss
                ? String.raw`scssSource={String.raw${'`'}${demo.get(lang)!.scss!.match(/(?<=```scss\n)[\s\S]*?(?=```)/g)![0]}${'`'}}`
                : ''
            );

            demosStr += demoStr;

            linksStr += String.raw`{ href: '#${demo.get(lang)!.id!}', title: '${demo.get(lang)!.title!}' }, `;
          }
        });

        let routeArticleProps = String.raw`
{
  title: '__title__',
  subtitle: '__subtitle__',
  description: String.raw${'`'}__description__${'`'},
  api: String.raw${'`'}__api__${'`'},
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
        routeArticleProps = routeArticleProps.replace(/__links__/g, linksStr);

        const article = meta.__content[lang];
        const description = article.match(/^[\s\S]*(?=## API)/g)?.[0];
        const api = article.match(/## API[\s\S]*$/g)?.[0];
        if (description && api) {
          routeArticleProps = routeArticleProps.replace(/__description__/g, marked(description));
          routeArticleProps = routeArticleProps.replace(/__api__/g, marked(api));
        }
        const langRegExp = new RegExp(String.raw`__${lang}__`, 'g');
        routeTmp = routeTmp.replace(langRegExp, routeArticleProps);
      });

      this.outputFile(path.join(outDir, `${meta.title['en-US']}.tsx`), routeTmp);
    }
  }

  generateGlobalFiles() {
    this.outputJson(path.join(OUTPUT_DIR, 'configs', 'menu.json'), this.menuConfig);
    this.outputJson(path.join(OUTPUT_DIR, 'configs', 'resources.json'), this.resources);

    let importStr = '';
    let routeStr = '';
    for (const [key, value] of this.routeConfig.entries()) {
      importStr += String.raw`const ${key} = lazy(() => import('${value.import}'));
`;
      routeStr += String.raw`
<Route 
  path="${value.path}"
  element={
    <Suspense fallback={<div className="app-top-line-loader" />}>
      <${key} />
    </Suspense>
  }
/>
`;
    }
    let appTmp = this.appTmp;
    appTmp = appTmp.replace(/__import__/g, importStr);
    appTmp = appTmp.replace(/__Route__/g, routeStr);
    this.outputFile(path.join(OUTPUT_DIR, 'App.tsx'), appTmp);
  }

  generateAll() {
    const components = readdirSync(COMPONENT_DIR);
    for (const component of components) {
      const componentPath = path.join(COMPONENT_DIR, component);
      if (!component.startsWith('_') && statSync(componentPath).isDirectory() && readdirSync(componentPath).includes('README.md')) {
        this.generateComponentRoute(
          { name: component, path: componentPath, data: components },
          path.join(OUTPUT_DIR, 'routes', 'components', component)
        );
      }
    }

    this.generateGlobalFiles();
  }

  updateTmp() {
    this.resources = readJsonSync(path.join(__dirname, 'site', 'resources.json'));
    this.menuGroups = readJsonSync(path.join(__dirname, 'site', 'menu-groups.json'));
    this.appTmp = readFileSync(path.join(__dirname, 'site', 'App.txt')).toString();
    this.routeTmp = readFileSync(path.join(__dirname, 'site', 'component-route.txt')).toString();

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
  console.info(`Bundling files of ${context.projectName}...`);

  const generateMediator = new GenerateSite();
  generateMediator.generateAll();

  if (options.watch) {
    const fileWatcher = new FileWatcher();

    const refreshComponentWatcher = () => {
      const components = readdirSync(COMPONENT_DIR);
      for (const component of components) {
        const componentPath = path.join(COMPONENT_DIR, component);
        if (!component.startsWith('_') && statSync(componentPath).isDirectory() && readdirSync(componentPath).includes('README.md')) {
          const task = {
            id: `generateComponentRoute_${component}`,
            callback: () => {
              console.info(`Update ${component}...`);

              generateMediator.generateComponentRoute(
                { name: component, path: componentPath, data: components },
                path.join(OUTPUT_DIR, 'routes', 'components', component)
              );
              generateMediator.generateGlobalFiles();
            },
          };
          if (!fileWatcher.hasWatcher(path.join(componentPath, 'README.md'))) {
            fileWatcher.addWatcher(path.join(componentPath, 'README.md'), task);
            fileWatcher.addWatcher(path.join(componentPath, 'README.zh-Hant.md'), task);
            fileWatcher.addWatcher(path.join(componentPath, 'demos'), task);
          }
        }
      }
    };

    fileWatcher.addWatcher(path.join(__dirname, 'site'), {
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
