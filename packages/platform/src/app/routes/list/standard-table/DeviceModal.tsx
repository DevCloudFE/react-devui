import type { AppDialogServiceSupport } from '../../../utils/dialog-service';
import type { DeviceData } from './StandardTable';
import type { DSelectItem } from '@react-devui/ui/components/select';

import { isUndefined } from 'lodash';
import { useState } from 'react';

import { useMount } from '@react-devui/hooks';
import { FormControl, FormGroup, useForm, Validators } from '@react-devui/ui';
import { DForm, DInput, DModal, DSelect } from '@react-devui/ui';

import { AppResponsiveForm } from '../../../components';
import { useHttp } from '../../../core';
import { useAPI } from '../../../hooks';

export interface AppDeviceModalProps {
  aDevice: DeviceData | undefined;
  onSuccess: () => void;
}

export function AppDeviceModal(props: AppDeviceModalProps): JSX.Element | null {
  const { aDevice, onSuccess, aVisible, onClose, afterVisibleChange } = props as AppDeviceModalProps & AppDialogServiceSupport;

  const http = useHttp();
  const modelApi = useAPI(http, '/device/model');

  const [form, updateForm] = useForm(() => {
    const form = new FormGroup({
      name: new FormControl('', Validators.required),
      model: new FormControl<string | null>(null, Validators.required),
    });
    if (aDevice) {
      form.reset({
        name: aDevice.name,
        model: aDevice.model,
      });
    }
    return form;
  });

  const [modelList, setModelList] = useState<DSelectItem<string>[]>();

  useMount(() => {
    modelApi.list().subscribe({
      next: (res) => {
        setModelList(
          res.resources.map((model) => ({
            label: model.name,
            value: model.name,
            disabled: model.disabled,
          }))
        );
      },
    });
  });

  return (
    <DModal
      dVisible={aVisible}
      dHeader={`${aDevice ? 'Edit' : 'Add'} Device`}
      dFooter={
        <DModal.Footer
          dOkProps={{ disabled: !form.valid }}
          onOkClick={() =>
            new Promise((r) => {
              modelApi.list().subscribe({
                next: () => {
                  onSuccess();
                  r(true);
                },
              });
            })
          }
        ></DModal.Footer>
      }
      dSkipFirstTransition={false}
      dMaskClosable={false}
      onClose={onClose}
      afterVisibleChange={afterVisibleChange}
    >
      <AppResponsiveForm>
        <DForm dUpdate={updateForm} dLabelWidth="6em">
          <DForm.Group dFormGroup={form}>
            <DForm.Item dFormControls={{ name: 'Please enter name!' }} dLabel="Name">
              {({ name }) => <DInput dFormControl={name} dPlaceholder="Name" />}
            </DForm.Item>
            <DForm.Item dFormControls={{ model: 'Please select model!' }} dLabel="Model">
              {({ model }) => (
                <DSelect dFormControl={model} dList={modelList ?? []} dLoading={isUndefined(modelList)} dPlaceholder="Model" dClearable />
              )}
            </DForm.Item>
          </DForm.Group>
        </DForm>
      </AppResponsiveForm>
    </DModal>
  );
}
