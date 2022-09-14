import type { UserState } from '../../config/state';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { DButton } from '@react-devui/ui';

import { TOKEN } from '../../config/token';
import { useHttp, useInit, usePrevRoute } from '../hooks';

export default function Login(): JSX.Element | null {
  const { t } = useTranslation();
  const createHttp = useHttp();
  const [loading, setLoading] = useState(false);
  const init = useInit();
  const navigate = useNavigate();
  const from = usePrevRoute();

  return (
    <div>
      Login
      <DButton
        onClick={() => {
          const [http] = createHttp();
          setLoading(true);
          http<{ user: UserState; token: string }>({
            url: '/api/login',
            method: 'post',
          }).subscribe({
            next: (res) => {
              setLoading(false);
              TOKEN.token = res.token;
              init(res.user);
              navigate(from, { replace: true });
            },
          });
        }}
        dLoading={loading}
      >
        {t('login.Login')}
      </DButton>
    </div>
  );
}
