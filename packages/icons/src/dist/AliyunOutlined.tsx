import type { DIconProps } from '../Icon';

import { AliyunOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function AliyunOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
