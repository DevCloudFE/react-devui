import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useImmer } from '@react-devui/hooks';
import * as AllIcons from '@react-devui/icons';
import { DInput, DRadio, DToast } from '@react-devui/ui';
import { copy } from '@react-devui/utils';

import styles from './Icon.module.scss';

export function AppIcon() {
  const { t } = useTranslation();

  const [type, setType] = useState('Outlined');
  const [search, setSearch] = useState('');
  const [toasts, setToasts] = useImmer<{ key: string; visible: boolean }[]>([]);

  const icons = Object.keys(AllIcons)
    .filter((key) => key.endsWith(type) && key.toLowerCase().includes(search.toLowerCase()))
    .map((key) => (
      <li
        key={key}
        className={styles['icon']}
        title={key}
        onClick={() => {
          copy(key);
          setToasts((draft) => {
            draft.push({
              key,
              visible: true,
            });
          });
        }}
      >
        {React.createElement(AllIcons[key], {
          dSize: 30,
        })}
        <div className={styles['icon-name']}>{key}</div>
      </li>
    ));

  return (
    <>
      {toasts.map(({ key, visible }) => (
        <DToast
          key={key}
          dVisible={visible}
          dType="success"
          onClose={() => {
            setToasts((draft) => {
              draft.find((n) => n.key === key)!.visible = false;
            });
          }}
          afterVisibleChange={(visible) => {
            if (!visible) {
              setToasts((draft) => {
                draft.splice(
                  draft.findIndex((n) => n.key === key),
                  1
                );
              });
            }
          }}
        >
          <strong>{key}</strong> copied!
        </DToast>
      ))}
      <div className={styles['header']}>
        <DRadio.Group
          dModel={type}
          dList={[
            {
              label: (
                <>
                  <AllIcons.DCustomIcon viewBox="0 0 1024 1024" className="me-1">
                    <path d="M864 64H160C107 64 64 107 64 160v704c0 53 43 96 96 96h704c53 0 96-43 96-96V160c0-53-43-96-96-96z m-12 800H172c-6.6 0-12-5.4-12-12V172c0-6.6 5.4-12 12-12h680c6.6 0 12 5.4 12 12v680c0 6.6-5.4 12-12 12z"></path>
                  </AllIcons.DCustomIcon>
                  Outlined
                </>
              ),
              value: 'Outlined',
            },
            {
              label: (
                <>
                  <AllIcons.DCustomIcon viewBox="0 0 1024 1024" className="me-1">
                    <path d="M864 64H160C107 64 64 107 64 160v704c0 53 43 96 96 96h704c53 0 96-43 96-96V160c0-53-43-96-96-96z"></path>
                  </AllIcons.DCustomIcon>
                  Filled
                </>
              ),
              value: 'Filled',
            },
            {
              label: (
                <>
                  <AllIcons.DCustomIcon viewBox="0 0 1024 1024" className="me-1">
                    <path d="M16 512c0 273.932 222.066 496 496 496s496-222.068 496-496S785.932 16 512 16 16 238.066 16 512z m496 368V144c203.41 0 368 164.622 368 368 0 203.41-164.622 368-368 368z"></path>
                  </AllIcons.DCustomIcon>
                  TwoTone
                </>
              ),
              value: 'TwoTone',
            },
          ]}
          dType="fill"
          onModelChange={setType}
        />
        <DInput
          className={styles['header-search']}
          dModel={search}
          dPlaceholder={t('Search icons')}
          dPrefix={<AllIcons.SearchOutlined />}
          onModelChange={setSearch}
        ></DInput>
      </div>
      <ul className={styles['list']}>{icons}</ul>
    </>
  );
}
