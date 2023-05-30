import type { PREV_ROUTE_KEY } from '../../config/other';
import type { AppUser } from '../../utils/types';

import { isString } from 'lodash';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

import { useAsync } from '@react-devui/hooks';
import { LockOutlined, MobileOutlined, UserOutlined } from '@react-devui/icons';
import { DButton, DCheckbox, DForm, DInput, DTabs, FormControl, FormGroup, useForm, Validators } from '@react-devui/ui';
import { getClassName } from '@react-devui/utils';

import { AppLanguage } from '../../components';
import { LOGIN_PATH } from '../../config/other';
import { APP_NAME } from '../../config/other';
import { TOKEN, useHttp, useInit } from '../../core';
import { AppRoute, NotificationService } from '../../utils';
import { BASE64_DATA } from './base64.out';

import styles from './Login.module.scss';

const Login = AppRoute(() => {
  const { t } = useTranslation();
  const http = useHttp();
  const [loginloading, setLoginLoading] = useState(false);
  const init = useInit();
  const async = useAsync();
  const location = useLocation();
  const from = (location.state as null | { [PREV_ROUTE_KEY]?: Location })?.from?.pathname;
  const navigate = useNavigate();

  const [loginType, setLoginType] = useState<'account' | 'phone'>('account');
  const [remember, setRemember] = useState(true);
  const [codeDisabled, setCodeDisabled] = useState(0);
  useEffect(() => {
    if (codeDisabled > 0) {
      async.setTimeout(() => {
        setCodeDisabled((prevCodeDisabled) => prevCodeDisabled - 1);
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

  const handleSubmit = () => {
    setLoginLoading(true);
    http<{ user: AppUser; token: string }>(
      {
        url: '/auth/login',
        method: 'post',
        data: { username: accountForm.get('username').value },
      },
      { authorization: false }
    ).subscribe({
      next: (res) => {
        TOKEN.set(res.token);

        setLoginLoading(false);
        init(res.user);
        navigate(isString(from) && from !== LOGIN_PATH ? from : '/', { replace: true });
      },
      error: (error) => {
        setLoginLoading(false);
        NotificationService.open({
          dTitle: error.response.status,
          dDescription: error.response.statusText,
          dType: 'error',
        });
      },
    });
  };

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
        <DButton type="submit" disabled={loginType === 'account' ? !accountForm.valid : !phoneForm.valid} dLoading={loginloading} dBlock>
          {t('routes.login.Login')}
        </DButton>
      </DForm.Item>
    </>
  );

  return (
    <div className={styles['app-login']}>
      <AppLanguage className={styles['app-login__lang']} />
      <div>
        <img
          className={getClassName(styles['app-login__bg'], 'd-none d-lg-inline')}
          src={`data:image/png;base64,${BASE64_DATA.bg}`}
          alt="bg"
        />
        <div className={styles['app-login__login-container']}>
          <div className={styles['app-login__title-container']}>
            <img className={styles['app-login__logo']} src="/assets/logo.svg" alt="Logo" />
            <span>{APP_NAME}</span>
          </div>
          <div className={styles['app-login__description']}>
            {APP_NAME} {t('routes.login.description')}
          </div>
          <DTabs
            className={styles['app-login__tabs']}
            dList={[
              {
                id: 'account',
                title: t('routes.login.Account Login'),
                panel: (
                  <DForm onSubmit={handleSubmit} dUpdate={updateAccountForm} dLabelWidth={0}>
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
                  <DForm onSubmit={handleSubmit} dUpdate={updatePhoneForm} dLabelWidth={0}>
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
      <footer className={styles['app-login__footer']}>
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
});

export default Login;
