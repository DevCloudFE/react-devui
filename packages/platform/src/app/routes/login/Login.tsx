import type { PREV_ROUTE_KEY } from '../../../config/other';
import type { UserState } from '../../../config/state';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

import { useAsync } from '@react-devui/hooks';
import { LockOutlined, MobileOutlined, UserOutlined } from '@react-devui/icons';
import { DButton, DCheckbox, DForm, DInput, DTabs, FormControl, FormGroup, useForm, Validators } from '@react-devui/ui';
import { getClassName } from '@react-devui/utils';

import { TOKEN } from '../../../config/token';
import { useHttp, useInit } from '../../../core';
import { AppLanguage } from '../../components';
import { useDeviceQuery } from '../../hooks';
import styles from './Login.module.scss';

export default function Login(): JSX.Element | null {
  const { t } = useTranslation();
  const createHttp = useHttp();
  const [loginloading, setLoginLoading] = useState(false);
  const init = useInit();
  const async = useAsync();
  const deviceMatched = useDeviceQuery();
  const location = useLocation();
  const from = (location.state as null | { [PREV_ROUTE_KEY]?: Location })?.from?.pathname;
  const navigate = useNavigate();

  const [loginType, setLoginType] = useState<'account' | 'phone'>('account');
  const [remember, setRemember] = useState(true);
  const [codeDisabled, setCodeDisabled] = useState(0);
  useEffect(() => {
    if (codeDisabled > 0) {
      async.setTimeout(() => {
        setCodeDisabled((draft) => draft - 1);
      }, 1000);
    }
  }, [async, codeDisabled]);

  const [accountForm, updateAccountForm] = useForm(
    () =>
      new FormGroup({
        username: new FormControl('', [
          Validators.required,
          (control) => {
            return control.value && control.value !== 'admin' && control.value !== 'user' ? { checkValue: true } : null;
          },
        ]),
        password: new FormControl('', Validators.required),
      })
  );
  const [phoneForm, updatePhoneForm] = useForm(
    () =>
      new FormGroup({
        phone: new FormControl('', [Validators.required]),
        code: new FormControl('', Validators.required),
      })
  );

  const loginSameNode = (
    <>
      <DForm.Item>
        <DCheckbox dModel={remember} onModelChange={setRemember}>
          {t('routes.login.Remember me')}
        </DCheckbox>
        <a className="app-link" style={{ marginLeft: 'auto' }}>
          {t('routes.login.Forgot Password')}
        </a>
      </DForm.Item>
      <DForm.Item>
        <DButton
          type="submit"
          disabled={loginType === 'account' ? !accountForm.valid : !phoneForm.valid}
          onClick={() => {
            const [http] = createHttp();
            setLoginLoading(true);
            http<{ user: UserState; token: string }>({
              url: '/api/login',
              method: 'post',
              data: { username: accountForm.get('username').value },
            }).subscribe({
              next: (res) => {
                setLoginLoading(false);
                TOKEN.token = res.token;
                init(res.user);
                navigate(from ?? '/', { replace: true });
              },
            });
          }}
          dLoading={loginloading}
          dBlock
        >
          {t('routes.login.Login')}
        </DButton>
      </DForm.Item>
    </>
  );

  return (
    <div className={styles['app-login']}>
      <AppLanguage className={styles['app-login__lang']} />
      <div>
        {deviceMatched === 'desktop' && <img className={styles['app-login__bg']} src="/assets/login-bg.png" alt="bg" />}
        <div className={styles['app-login__login-container']}>
          <div className={styles['app-login__title-container']}>
            <img className={styles['app-login__logo']} src="/assets/logo.svg" alt="Logo" />
            <span>RD-Platform</span>
          </div>
          <div className={styles['app-login__description']}>{t('routes.login.description')}</div>
          <DTabs
            className={styles['app-login__tabs']}
            dList={[
              {
                id: 'account',
                title: t('routes.login.Account Login'),
                panel: (
                  <DForm dUpdate={updateAccountForm} dLabelWidth={0}>
                    <DForm.Group dFormGroup={accountForm}>
                      <DForm.Item
                        dFormControls={{
                          username: {
                            required: t('routes.login.Please enter your name'),
                            checkValue: t('routes.login.Username'),
                          },
                        }}
                      >
                        {({ username }) => (
                          <DInput dFormControl={username} dPrefix={<UserOutlined />} dPlaceholder={t('routes.login.Username')} />
                        )}
                      </DForm.Item>
                      <DForm.Item dFormControls={{ password: t('routes.login.Please enter your password') }}>
                        {({ password }) => (
                          <DInput
                            dFormControl={password}
                            dPrefix={<LockOutlined />}
                            dPlaceholder={t('routes.login.Password')}
                            dType="password"
                          />
                        )}
                      </DForm.Item>
                      {loginSameNode}
                    </DForm.Group>
                  </DForm>
                ),
              },
              {
                id: 'phone',
                title: t('routes.login.Phone Login'),
                panel: (
                  <DForm dUpdate={updatePhoneForm} dLabelWidth={0}>
                    <DForm.Group dFormGroup={phoneForm}>
                      <DForm.Item dFormControls={{ phone: t('routes.login.Please enter your phone number') }}>
                        {({ phone }) => (
                          <DInput dFormControl={phone} dPrefix={<MobileOutlined />} dPlaceholder={t('routes.login.Phone number')} />
                        )}
                      </DForm.Item>
                      <DForm.Item dFormControls={{ code: t('routes.login.Please enter verification code') }} dSpan>
                        {({ code }) => <DInput dFormControl={code} dPlaceholder={t('routes.login.Verification code')} />}
                      </DForm.Item>
                      <DForm.Item dLabelWidth={8} dSpan="auto">
                        <DButton
                          disabled={codeDisabled > 0 || !phoneForm.controls['phone'].valid}
                          onClick={() => {
                            setCodeDisabled(60);
                          }}
                        >
                          {codeDisabled > 0 ? `${codeDisabled}s` : t('routes.login.Get code')}
                        </DButton>
                      </DForm.Item>
                      {loginSameNode}
                    </DForm.Group>
                  </DForm>
                ),
              },
            ]}
            dActive={loginType}
            onActiveChange={setLoginType}
          />
        </div>
      </div>
      <footer
        className={getClassName(styles['app-login__footer'], {
          [styles['app-login__footer--phone']]: deviceMatched === 'phone',
        })}
      >
        <div>
          <span>© {new Date().getFullYear()} made with ❤ by </span>
          <a className="app-link" href="//github.com/xiejay97">
            Xie Jay
          </a>
        </div>
        <div className={styles['app-login__link-container']}>
          <a className="app-link">{t('routes.login.Terms')}</a>
          <a className="app-link">{t('routes.login.Privacy')}</a>
        </div>
      </footer>
    </div>
  );
}
