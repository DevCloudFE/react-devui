import { useStore } from 'rcl-store';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { LockOutlined, LogoutOutlined, SettingOutlined, UserOutlined } from '@react-devui/icons';
import { DAvatar, DDropdown } from '@react-devui/ui';

import { LOGIN_PATH } from '../../../../config/other';
import { GlobalStore, TOKEN } from '../../../../core';

export function AppUser(props: React.ButtonHTMLAttributes<HTMLButtonElement>): JSX.Element | null {
  const [{ appUser }] = useStore(GlobalStore, ['appUser']);
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <DDropdown
      style={{ minWidth: 160 }}
      dList={[
        { id: 'center', label: t('routes.layout.Account Center'), type: 'item', icon: <UserOutlined /> },
        { id: 'setting', label: t('routes.layout.Account Settings'), type: 'item', icon: <SettingOutlined /> },
        { id: 'password', label: t('routes.layout.Change Password'), type: 'item', icon: <LockOutlined />, separator: true },
        { id: 'logout', label: t('routes.layout.Logout'), type: 'item', icon: <LogoutOutlined /> },
      ]}
      dTrigger="click"
      onItemClick={(id) => {
        switch (id) {
          case 'logout':
            TOKEN.remove();
            navigate(LOGIN_PATH);
            break;

          default:
            break;
        }
      }}
    >
      <button {...props} aria-label={t('routes.layout.My account')}>
        <DAvatar
          dImg={appUser.avatar ? { src: appUser.avatar, alt: 'avatar' } : undefined}
          dText={appUser.name[0].toUpperCase()}
          dSize={28}
        ></DAvatar>
        <span className="d-none d-md-block">{appUser.name}</span>
      </button>
    </DDropdown>
  );
}
