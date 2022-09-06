import type { DIconProps } from '../Icon';

import { GooglePlusOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function GooglePlusOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
