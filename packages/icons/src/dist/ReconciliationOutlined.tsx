import type { DIconProps } from '../Icon';

import { ReconciliationOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function ReconciliationOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
