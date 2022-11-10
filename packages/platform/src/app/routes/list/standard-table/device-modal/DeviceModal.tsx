import type { DeviceDoc } from '../../../../hooks/api/types';
import type { DSelectItem } from '@react-devui/ui/components/select';

import { isUndefined } from 'lodash';
import { useEffect } from 'react';

import { useForm, FormGroup, FormControl, Validators, DForm, DInput, DModal, DSelect } from '@react-devui/ui';

export interface AppDeviceModalProps {
  aVisible?: boolean;
  aDevice?: DeviceDoc;
  aModelList?: DSelectItem<string>[];
  onVisibleChange?: (visible: boolean) => void;
  onSubmit?: () => void;
}

export function AppDeviceModal(props: AppDeviceModalProps): JSX.Element | null {
  const { aVisible = false, aDevice, aModelList, onVisibleChange, onSubmit } = props;

  const [form, updateForm] = useForm(
    () =>
      new FormGroup({
        name: new FormControl('', Validators.required),
        model: new FormControl<string | null>(null, Validators.required),
      })
  );

  useEffect(() => {
    form.reset(aDevice ? { name: aDevice.name, model: aDevice.model } : undefined);
    updateForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aDevice]);

  return (
    <DModal
      dVisible={aVisible}
      dHeader={<DModal.Header>{aDevice ? 'Edit' : 'Add'} Device</DModal.Header>}
      dFooter={
        <DModal.Footer
          dOkProps={{ type: 'submit', form: 'device-form', disabled: !form.valid }}
          onOkClick={() => {
            return false;
          }}
        ></DModal.Footer>
      }
      dMaskClosable={false}
      onVisibleChange={onVisibleChange}
    >
      <DForm id="device-form" onSubmit={onSubmit} dUpdate={updateForm} dLabelWidth="6em">
        <DForm.Group dFormGroup={form}>
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
