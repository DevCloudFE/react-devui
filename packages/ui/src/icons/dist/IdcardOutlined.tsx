import type { DIconProps } from '../Icon';

import { IdcardOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function IdcardOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
