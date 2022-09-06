import type { DIconProps } from '../Icon';

import { CloudFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function CloudFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
