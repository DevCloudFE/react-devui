import type { DIconProps } from '../Icon';

import { RedEnvelopeOutlined as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function RedEnvelopeOutlined(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
