import type { DIconProps } from '../Icon';

import { SisternodeOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function SisternodeOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
