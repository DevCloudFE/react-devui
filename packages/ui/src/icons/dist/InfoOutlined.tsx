import type { DIconProps } from '../Icon';

import { InfoOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function InfoOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
