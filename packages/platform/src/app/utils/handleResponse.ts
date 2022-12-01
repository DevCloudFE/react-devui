import { ToastService } from './toast-service';

export function handleActionResponse(res: any, cb?: { success?: () => void; error?: () => void }) {
  if (res.success) {
    ToastService.open({
      children: '操作成功',
      dType: 'success',
    });
    cb?.success?.();
  } else {
    ToastService.open({
      children: res.message,
      dType: 'error',
    });
    cb?.error?.();
  }
}
