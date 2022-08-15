import type { DIconProps } from '../Icon';

import { AliwangwangOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function AliwangwangOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
