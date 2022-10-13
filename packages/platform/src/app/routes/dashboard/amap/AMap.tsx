import { useTranslation } from 'react-i18next';

import { useStorage } from '@react-devui/hooks';
import { DButton, DForm, DInput, FormControl, FormGroup, useForm, Validators } from '@react-devui/ui';

import { STORAGE_KEY } from '../../../../config/storage';
import { AppAMap } from '../../../components';
import styles from './AMap.module.scss';

export default function AMap(): JSX.Element | null {
  const { t } = useTranslation();
  const amapStorage = useStorage<{ key: string; securityJsCode: string | null }>(...STORAGE_KEY.amap);

  const [form, updateForm] = useForm(
    () =>
      new FormGroup({
        key: new FormControl(amapStorage.value?.key ?? '', Validators.required),
        securityJsCode: new FormControl(amapStorage.value?.securityJsCode ?? ''),
      })
  );

  return (
    <div className={styles['app-amap']}>
      <DForm
        className="mb-3"
        onSubmit={() => {
          amapStorage.set({
            key: form.value.key,
            securityJsCode: form.value.securityJsCode ? form.value.securityJsCode : null,
          });
        }}
        dLayout="vertical"
        dUpdate={updateForm}
      >
        <DForm.Group dFormGroup={form}>
          <DForm.Item dFormControls={{ key: t('routes.dashboard.amap.Please enter your JSAPI key') }} dLabel="Key">
            {({ key }) => <DInput dFormControl={key} dPlaceholder="Key" />}
          </DForm.Item>
          <DForm.Item dFormControls={{ securityJsCode: {} }} dLabel={t('routes.dashboard.amap.Security key')}>
            {({ securityJsCode }) => <DInput dFormControl={securityJsCode} dPlaceholder={t('routes.dashboard.amap.Security key')} />}
          </DForm.Item>
          <DForm.Item>
            <DButton type="submit" disabled={!form.valid}>
              {t('routes.dashboard.amap.OK')}
            </DButton>
          </DForm.Item>
        </DForm.Group>
      </DForm>
      {amapStorage.value ? (
        <AppAMap style={{ paddingTop: '61.8%' }} aKey={amapStorage.value.key} aSecurityJsCode={amapStorage.value.securityJsCode}></AppAMap>
      ) : (
        <div className={styles['app-amap__empty']}>
          <div>{t('routes.dashboard.amap.No JSAPI key')}</div>
        </div>
      )}
    </div>
  );
}
