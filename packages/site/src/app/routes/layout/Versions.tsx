import axios from 'axios';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';

import { useMount } from '@react-devui/hooks';
import { DownOutlined } from '@react-devui/icons';
import { DButton, DDropdown } from '@react-devui/ui';

export function AppVersions(): JSX.Element | null {
  const location = useLocation();

  const version = (() => {
    const v = window.location.host.match(/^v[0-9]+/);
    return v ? v[0] : 'main';
  })();
  const [versions, setVersions] = useState<string[]>(() => {
    if (version === 'main') {
      return ['main'];
    } else {
      return ['main', version];
    }
  });
  useMount(() => {
    axios.get('/api/versions').then((response) => {
      setVersions(['main', ...(response.data as number[]).map((v) => `v${v}`)]);
    });
  });

  return (
    <DDropdown
      dList={versions.map((v) => ({ id: v, label: v, type: 'item' }))}
      onItemClick={(id) => {
        window.location = ((id === 'main' ? 'https://react-devui.com' : `https://${id}.react-devui.com`) + location.pathname) as any;
      }}
    >
      <DButton dType="text">
        <div className="d-flex align-items-center">
          {version}
          <DownOutlined style={{ position: 'relative', top: 2, marginLeft: 2 }} dSize={12} />
        </div>
      </DButton>
    </DDropdown>
  );
}
