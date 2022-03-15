import type { DIconProps } from '../Icon';

import { SelectOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function SelectOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
