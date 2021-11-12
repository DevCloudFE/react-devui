import type { ExecutorContext } from '@nrwl/devkit';

import { runExecutor } from '@nrwl/devkit';
import { Subject } from 'rxjs';
import { eachValueFrom } from 'rxjs-for-await';

export interface MultipleExecutorOptions {
  tasks: Array<{
    targetDescription: {
      project: string;
      target: string;
      configuration?: string;
    };
    options?: {
      [k: string]: any;
    };
  }>;
}

export default async function* multipleExecutor(options: MultipleExecutorOptions, context: ExecutorContext) {
  const subject = new Subject<{ success: boolean }>();

  for (const task of options.tasks) {
    const iterator = await runExecutor(task.targetDescription, task.options ?? {}, context);
    (async function () {
      for await (const res of iterator) {
        subject.next(res);
      }
    })();
  }

  return yield* eachValueFrom(subject);
}
