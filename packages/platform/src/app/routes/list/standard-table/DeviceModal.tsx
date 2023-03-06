import type { OpenSettingFn } from '../../../utils/types';
import type { DeviceData } from './StandardTable';
import type { DSelectItem } from '@react-devui/ui/components/select';

import { isUndefined } from 'lodash';
import React, { useImperativeHandle, useState } from 'react';

import { useEventCallback } from '@react-devui/hooks';
import { FormControl, FormGroup, useForm, Validators } from '@react-devui/ui';
import { DForm, DInput, DModal, DSelect } from '@react-devui/ui';

import { AppResponsiveForm } from '../../../components';
import { useHttp } from '../../../core';
import { useAPI } from '../../../hooks';

export interface AppDeviceModalProps {
  onSuccess: () => void;
}

function DeviceModal(props: AppDeviceModalProps, ref: React.ForwardedRef<OpenSettingFn<DeviceData>>): JSX.Element | null {
  const { onSuccess } = props;

  const http = useHttp();
  const httpOfInit = useHttp();
  const modelApi = useAPI(http, '/device/model');
  const modelApiOfInit = useAPI(httpOfInit, '/device/model');

  const [visible, setVisible] = useState(false);
  const [device, setDevice] = useState<DeviceData>();
  const [form, updateForm] = useForm(
    () =>
      new FormGroup({
        name: new FormControl('', Validators.required),
        model: new FormControl<string | null>(null, Validators.required),
      })
  );

  const [modelList, setModelList] = useState<DSelectItem<string>[]>();

  const open = useEventCallback<OpenSettingFn<DeviceData>>((device) => {
    setVisible(true);
    setDevice(device);

    form.reset(device ? { name: device.name } : undefined);
    updateForm();

    setModelList(undefined);
    modelApiOfInit.list().subscribe({
      next: (res) => {
        setModelList(
          res.resources.map((model) => ({
            label: model.name,
            value: model.name,
            disabled: model.disabled,
          }))
        );
        if (device) {
          form.patchValue({ model: device.model });
          updateForm();
        }
      },
    });
  });

  useImperativeHandle(ref, () => open, [open]);

  return (
    <DModal
      dVisible={visible}
      dHeader={`${device ? 'Edit' : 'Add'} Device`}
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
      dMaskClosable={false}
      onClose={() => {
        httpOfInit.abortAll();
        setVisible(false);
      }}
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

export const AppDeviceModal = React.forwardRef(DeviceModal);
