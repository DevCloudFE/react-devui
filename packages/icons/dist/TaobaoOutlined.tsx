import type { DIconProps } from '../Icon';

import { TaobaoOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function TaobaoOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
