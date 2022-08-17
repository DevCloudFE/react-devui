import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useAsync, useMount } from '@react-devui/hooks';
import { CheckOutlined, CodeSandboxOutlined, DCustomIcon, SnippetsOutlined, ThunderboltOutlined } from '@react-devui/icons';
import { DTooltip, DTabs } from '@react-devui/ui';
import { copy, getClassName } from '@react-devui/utils';

import marked, { toString } from '../utils';
import './DemoBox.scss';
import { openCodeSandbox, openStackBlitz } from './online-ide';

export interface AppDemoBoxProps {
  id: string;
  renderer: React.ReactNode;
  title: string;
  description: number[];
  tsxSource: number[];
  scssSource: number[];
}

export function AppDemoBox(props: AppDemoBoxProps) {
  const { id, renderer, title } = props;

  const elRef = useRef<HTMLElement>(null);

  const description = marked(toString(props.description));
  const tsxSource = toString(props.tsxSource);
  const scssSource = props.scssSource.length > 0 ? toString(props.scssSource) : undefined;

  const tsx = marked(String.raw`
${'```tsx'}
${tsxSource}
${'```'}
`);
  const scss = scssSource
    ? marked(String.raw`
${'```scss'}
${scssSource}
${'```'}
`)
    : undefined;

  const asyncCapture = useAsync();

  const [tab, setTab] = useState<string>('tsx');

  const [openCode, setOpencode] = useState(false);
  const [copyCode, setCopycode] = useState(false);

  const handleOpenClick = () => {
    setOpencode((draft) => !draft);
  };

  const handleCopyClick = () => {
    copy(tab === 'tsx' ? tsxSource : (scssSource as string));
    setCopycode(true);
  };

  const afterCopyTrige = (visible: boolean) => {
    if (!visible) {
      setCopycode(false);
    }
  };

  const { t } = useTranslation();

  useMount(() => {
    if (window.location.hash === `#${id}` && elRef.current) {
      elRef.current.scrollIntoView();
    }
  });

  const [active, setActive] = useState(false);
  useEffect(() => {
    const [asyncGroup, asyncId] = asyncCapture.createGroup();

    setActive(window.location.hash === `#${id}`);

    asyncGroup.fromEvent(window, 'hashchange').subscribe({
      next: () => {
        setActive(window.location.hash === `#${id}`);
      },
    });

    return () => {
      asyncCapture.deleteGroup(asyncId);
    };
  }, [asyncCapture, id]);

  return (
    <section
      ref={elRef}
      id={id}
      className={getClassName('app-demo-box', {
        'is-active': active,
      })}
    >
      <div className="app-demo-box__renderer">{renderer}</div>
      <div className="app-demo-box__info">
        <div className="app-demo-box__title">{title}</div>
        <div className="app-demo-box__description" dangerouslySetInnerHTML={{ __html: description }} />
      </div>
      <div className="app-demo-box__toolbar">
        <DTooltip dTitle={t('Open in CodeSandbox')}>
          <CodeSandboxOutlined
            className="app-icon-button"
            dSize={18}
            onClick={() => {
              const el = document.getElementById('component-route-title');
              openCodeSandbox(`${el!.textContent!.match(/[a-zA-Z]+/)![0]}:${title}`, tsxSource, scssSource);
            }}
          />
        </DTooltip>
        <DTooltip dTitle={t('Open in Stackblitz')}>
          <ThunderboltOutlined
            className="app-icon-button"
            dSize={18}
            onClick={() => {
              const el = document.getElementById('component-route-title');
              openStackBlitz(`${el!.textContent!.match(/[a-zA-Z]+/)![0]}:${title}`, tsxSource, scssSource);
            }}
          />
        </DTooltip>
        <DTooltip dTitle={copyCode ? t('Copied!') : t('Copy code')} afterVisibleChange={afterCopyTrige}>
          <div className="app-icon-button">
            {copyCode ? <CheckOutlined dSize={18} /> : <SnippetsOutlined onClick={handleCopyClick} dSize={18} />}
          </div>
        </DTooltip>
        <DTooltip dTitle={openCode ? t('Hide code') : t('Show code')}>
          <DCustomIcon className="app-icon-button" viewBox="0 0 1024 1024" onClick={handleOpenClick} dSize={18}>
            {openCode ? (
              <path d="M1018.645 531.298c8.635-18.61 4.601-41.42-11.442-55.864l-205.108-184.68c-19.7-17.739-50.05-16.148-67.789 3.552-17.738 19.7-16.148 50.051 3.553 67.79l166.28 149.718-167.28 150.62c-19.7 17.738-21.291 48.088-3.553 67.789 17.739 19.7 48.089 21.291 67.79 3.553l205.107-184.68a47.805 47.805 0 0 0 12.442-17.798zM119.947 511.39l166.28-149.719c19.7-17.738 21.29-48.088 3.552-67.789-17.738-19.7-48.088-21.291-67.789-3.553L16.882 475.01C.84 489.456-3.194 512.264 5.44 530.874a47.805 47.805 0 0 0 12.442 17.798l205.108 184.68c19.7 17.739 50.05 16.148 67.79-3.552 17.738-19.7 16.147-50.051-3.553-67.79l-167.28-150.62zm529.545-377.146c24.911 9.066 37.755 36.61 28.688 61.522L436.03 861.068c-9.067 24.911-36.611 37.755-61.522 28.688-24.911-9.066-37.755-36.61-28.688-61.522l242.15-665.302c9.067-24.911 36.611-37.755 61.522-28.688z"></path>
            ) : (
              <path d="M1018.645 531.298c8.635-18.61 4.601-41.42-11.442-55.864l-205.108-184.68c-19.7-17.739-50.05-16.148-67.789 3.552-17.738 19.7-16.148 50.051 3.553 67.79l166.28 149.718-167.28 150.62c-19.7 17.738-21.291 48.088-3.553 67.789 17.739 19.7 48.089 21.291 67.79 3.553l205.107-184.68a47.805 47.805 0 0 0 12.442-17.798zM119.947 511.39l166.28-149.719c19.7-17.738 21.29-48.088 3.552-67.789-17.738-19.7-48.088-21.291-67.789-3.553L16.882 475.01C.84 489.456-3.194 512.264 5.44 530.874a47.805 47.805 0 0 0 12.442 17.798l205.108 184.68c19.7 17.739 50.05 16.148 67.79-3.552 17.738-19.7 16.147-50.051-3.553-67.79l-167.28-150.62z"></path>
            )}
          </DCustomIcon>
        </DTooltip>
      </div>
      {openCode && (
        <div className="app-demo-box__code">
          {!scss && <div dangerouslySetInnerHTML={{ __html: tsx }} />}
          {scss && (
            <DTabs
              dList={['tsx', 'scss'].map((code) => ({
                id: code,
                title: code,
                panel: <div dangerouslySetInnerHTML={{ __html: code === 'tsx' ? tsx : scss }} />,
              }))}
              dActive={tab}
              dSize="smaller"
              dCenter
              onActiveChange={(id) => {
                setTab(id);
              }}
            />
          )}
        </div>
      )}
    </section>
  );
}
