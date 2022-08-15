import type { DIconProps } from '../Icon';

import { CloseCircleOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function CloseCircleOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
