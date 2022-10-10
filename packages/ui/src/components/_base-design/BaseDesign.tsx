import type { DCloneHTMLElement } from '../../utils/types';
import type { DFormControl } from '../form';

import { useContext } from 'react';

import { cloneHTMLElement } from '../../utils';
import { DComposeContext } from '../compose';
import { DFormUpdateContext } from '../form';

export interface DBaseDesignProps {
  children: (props: { render: DCloneHTMLElement }) => JSX.Element | null;
  dComposeDesign:
    | {
        active?: boolean;
        disabled?: boolean;
      }
    | false;
  dFormDesign:
    | {
        control?: DFormControl;
      }
    | false;
}

export function DBaseDesign(props: DBaseDesignProps): JSX.Element | null {
  const { children, dComposeDesign, dFormDesign } = props;

  const composeContext = useContext(DComposeContext);
  const updateForm = useContext(DFormUpdateContext);

  const supportCompose = composeContext && dComposeDesign;
  const supportForm = updateForm && dFormDesign;

  let dataAttrs: { [index: string]: boolean } = {};

  if (supportCompose) {
    dataAttrs = Object.assign(dataAttrs, {
      'data-compose-support': true,
      'data-compose-support-active': dComposeDesign.active,
      'data-compose-support-disabled': dComposeDesign.disabled,
    });
  }

  if (supportForm) {
    dataAttrs = Object.assign(dataAttrs, dFormDesign.control?.wrapperAttrs);
  }

  return children({
    render: (el) => cloneHTMLElement(el, dataAttrs),
  });
}
