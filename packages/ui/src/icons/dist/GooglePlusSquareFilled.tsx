import type { DIconProps } from '../Icon';

import { GooglePlusSquareFilled as AntIcon } from '@ant-design/icons-svg';

import { DIcon } from '../Icon';

export function GooglePlusSquareFilled(props: Omit<DIconProps, 'dIcon'>) {
  return <DIcon {...props} dIcon={AntIcon} />;
}
