import type { FormGroup } from '@react-devui/ui';
import type { DSelectItem } from '@react-devui/ui/components/select';

import { isUndefined } from 'lodash';

import { useId } from '@react-devui/hooks';
import { DForm, DInput, DModal, DSelect } from '@react-devui/ui';

export interface AppDeviceModalProps {
  aVisible: boolean;
  aHeader: string;
  aForm: FormGroup;
  aUpdateForm: any;
  aModelList: DSelectItem<string>[] | undefined;
  onClose: () => void;
  onSubmit: () => void | boolean | Promise<boolean>;
}

export function AppDeviceModal(props: AppDeviceModalProps): JSX.Element | null {
  const { aVisible, aHeader, aForm, aUpdateForm, aModelList, onClose, onSubmit } = props;

  const uniqueId = useId();
  const id = `app-form-${uniqueId}`;

  return (
    <DModal
      dVisible={aVisible}
      dHeader={aHeader}
      dFooter={<DModal.Footer dOkProps={{ type: 'submit', form: id, disabled: !aForm.valid }} onOkClick={onSubmit}></DModal.Footer>}
      dMaskClosable={false}
      dSkipFirstTransition={false}
      onClose={onClose}
    >
      <DForm id={id} dUpdate={aUpdateForm} dLabelWidth="6em">
        <DForm.Group dFormGroup={aForm}>
          <DForm.Item dFormControls={{ name: 'Please enter name!' }} dLabel="Name">
            {({ name }) => <DInput dFormControl={name} dPlaceholder="Name" />}
          </DForm.Item>
          <DForm.Item dFormControls={{ model: 'Please select model!' }} dLabel="Model">
            {({ model }) => (
              <DSelect dFormControl={model} dList={aModelList ?? []} dLoading={isUndefined(aModelList)} dPlaceholder="Model" dClearable />
            )}
          </DForm.Item>
        </DForm.Group>
      </DForm>
    </DModal>
  );
}
