import type { DIconProps } from '../Icon';

import { FormOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function FormOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
