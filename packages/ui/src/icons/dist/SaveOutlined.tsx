import type { DIconProps } from '../Icon';

import { SaveOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function SaveOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
