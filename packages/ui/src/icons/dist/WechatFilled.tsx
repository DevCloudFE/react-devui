import type { DIconProps } from '../Icon';

import { WechatFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function WechatFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
