import { isUndefined } from 'lodash';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { LogoutOutlined, SettingOutlined, UserOutlined } from '@react-devui/icons';
import { DAvatar, DDropdown } from '@react-devui/ui';

import { LOGIN_PATH } from '../../../../../config/other';
import { useUserState, TOKEN } from '../../../../../core';

export function AppUser(props: React.ButtonHTMLAttributes<HTMLButtonElement>): JSX.Element | null {
  const [user] = useUserState();
  const { t } = useTranslation();
  const navigate = useNavigate();

  return isUndefined(user) ? null : (
    <DDropdown
      style={{ minWidth: 160 }}
      dList={[
        { id: 'center', label: t('routes.layout.Account Center'), type: 'item', icon: <UserOutlined /> },
        { id: 'setting', label: t('routes.layout.Account Settings'), type: 'item', icon: <SettingOutlined />, separator: true },
        { id: 'logout', label: t('routes.layout.Logout'), type: 'item', icon: <LogoutOutlined /> },
      ]}
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
        <DAvatar dImg={{ src: user.avatar, alt: 'avatar' }} dSize={28}></DAvatar>
        <span className="d-none d-md-block">{user.name}</span>
      </button>
    </DDropdown>
  );
}
