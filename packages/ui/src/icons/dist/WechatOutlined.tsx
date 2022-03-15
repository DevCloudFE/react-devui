import type { DIconProps } from '../Icon';

import { WechatOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function WechatOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
