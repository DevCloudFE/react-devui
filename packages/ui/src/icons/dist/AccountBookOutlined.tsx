import type { DIconProps } from '../Icon';

import { AccountBookOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function AccountBookOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
