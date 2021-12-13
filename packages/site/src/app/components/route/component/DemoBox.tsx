import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { DTooltip, DIcon, DTabs, DTab } from '@react-devui/ui';
import { useAsync, useImmer } from '@react-devui/ui/hooks';
import { copy, getClassName } from '@react-devui/ui/utils';

import './DemoBox.scss';
import { toString } from './utils';

export interface AppDemoBoxProps {
  id: string;
  renderer: React.ReactNode;
  title: string;
  description: number[];
  tsx: number[];
  scss?: string;
  tsxSource: number[];
  scssSource?: string;
}

export function AppDemoBox(props: AppDemoBoxProps) {
  const { id, renderer, title, scss, scssSource } = props;

  const description = toString(props.description);
  const tsx = toString(props.tsx);
  const tsxSource = toString(props.tsxSource);

  const asyncCapture = useAsync();

  const [tab, setTab] = useImmer<string | null>('tsx');

  const [openCode, setOpencode] = useImmer(false);
  const handleOpenClick = useCallback(() => {
    setOpencode((draft) => !draft);
  }, [setOpencode]);

  const [copyCode, setCopycode] = useImmer(false);
  const handleCopyClick = useCallback(() => {
    copy(tab === 'tsx' ? tsxSource : (scssSource as string));
    setCopycode(true);
  }, [scssSource, setCopycode, tab, tsxSource]);

  const afterCopyTrige = useCallback(
    (v) => {
      if (!v) {
        setCopycode(false);
      }
    },
    [setCopycode]
  );

  const { t } = useTranslation();

  const [active, setActive] = useImmer(false);
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
  }, [asyncCapture, id, setActive]);

  return (
    <section
      id={id}
      className={getClassName('app-demo-box', {
        'is-active': active,
      })}
    >
      <div className="app-demo-box__renderer">{renderer}</div>
      <div className="app-demo-box__info">
        <div className="app-demo-box__title">
          {title}
          <DTooltip dTitle={t('Edit this demo on GitHub')}>
            <DIcon className="app-icon-button" style={{ marginLeft: 4 }} viewBox="64 64 896 896" dSize={16}>
              <path d="M257.7 752c2 0 4-.2 6-.5L431.9 722c2-.4 3.9-1.3 5.3-2.8l423.9-423.9a9.96 9.96 0 000-14.1L694.9 114.9c-1.9-1.9-4.4-2.9-7.1-2.9s-5.2 1-7.1 2.9L256.8 538.8c-1.5 1.5-2.4 3.3-2.8 5.3l-29.5 168.2a33.5 33.5 0 009.4 29.8c6.6 6.4 14.9 9.9 23.8 9.9zm67.4-174.4L687.8 215l73.3 73.3-362.7 362.6-88.9 15.7 15.6-89zM880 836H144c-17.7 0-32 14.3-32 32v36c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-36c0-17.7-14.3-32-32-32z"></path>
            </DIcon>
          </DTooltip>
        </div>
        <div className="app-demo-box__description" dangerouslySetInnerHTML={{ __html: description }} />
      </div>
      <div className="app-demo-box__toolbar">
        <DTooltip dTitle={t('Open in CodeSandbox')}>
          <DIcon className="app-icon-button" viewBox="0 0 1024 1024" dSize={18}>
            <path d="M755 140.3l0.5-0.3h0.3L512 0 268.3 140h-0.3l0.8 0.4L68.6 256v512L512 1024l443.4-256V256L755 140.3z m-30 506.4v171.2L548 920.1V534.7L883.4 341v215.7l-158.4 90z m-584.4-90.6V340.8L476 534.4v385.7L300 818.5V646.7l-159.4-90.6zM511.7 280l171.1-98.3 166.3 96-336.9 194.5-337-194.6 165.7-95.7L511.7 280z"></path>
          </DIcon>
        </DTooltip>
        <DTooltip dTitle={t('Open in Stackblitz')}>
          <DIcon className="app-icon-button" viewBox="64 64 896 896" dSize={18}>
            <path d="M848 359.3H627.7L825.8 109c4.1-5.3.4-13-6.3-13H436c-2.8 0-5.5 1.5-6.9 4L170 547.5c-3.1 5.3.7 12 6.9 12h174.4l-89.4 357.6c-1.9 7.8 7.5 13.3 13.3 7.7L853.5 373c5.2-4.9 1.7-13.7-5.5-13.7zM378.2 732.5l60.3-241H281.1l189.6-327.4h224.6L487 427.4h211L378.2 732.5z"></path>
          </DIcon>
        </DTooltip>
        <DTooltip dTitle={copyCode ? t('Copied!') : t('Copy code')} afterVisibleChange={afterCopyTrige}>
          <DIcon className="app-icon-button" viewBox="64 64 896 896" dSize={18} onClick={handleCopyClick}>
            {copyCode ? (
              <path d="M912 190h-69.9c-9.8 0-19.1 4.5-25.1 12.2L404.7 724.5 207 474a32 32 0 00-25.1-12.2H112c-6.7 0-10.4 7.7-6.3 12.9l273.9 347c12.8 16.2 37.4 16.2 50.3 0l488.4-618.9c4.1-5.1.4-12.8-6.3-12.8z"></path>
            ) : (
              <path d="M832 112H724V72c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v40H500V72c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v40H320c-17.7 0-32 14.3-32 32v120h-96c-17.7 0-32 14.3-32 32v632c0 17.7 14.3 32 32 32h512c17.7 0 32-14.3 32-32v-96h96c17.7 0 32-14.3 32-32V144c0-17.7-14.3-32-32-32zM664 888H232V336h218v174c0 22.1 17.9 40 40 40h174v338zm0-402H514V336h.2L664 485.8v.2zm128 274h-56V456L544 264H360v-80h68v32c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8v-32h152v32c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8v-32h68v576z"></path>
            )}
          </DIcon>
        </DTooltip>
        <DTooltip dTitle={openCode ? t('Hide code') : t('Show code')}>
          <DIcon className="app-icon-button" viewBox="0 0 1024 1024" dSize={18} onClick={handleOpenClick}>
            {openCode ? (
              <path d="M1018.645 531.298c8.635-18.61 4.601-41.42-11.442-55.864l-205.108-184.68c-19.7-17.739-50.05-16.148-67.789 3.552-17.738 19.7-16.148 50.051 3.553 67.79l166.28 149.718-167.28 150.62c-19.7 17.738-21.291 48.088-3.553 67.789 17.739 19.7 48.089 21.291 67.79 3.553l205.107-184.68a47.805 47.805 0 0 0 12.442-17.798zM119.947 511.39l166.28-149.719c19.7-17.738 21.29-48.088 3.552-67.789-17.738-19.7-48.088-21.291-67.789-3.553L16.882 475.01C.84 489.456-3.194 512.264 5.44 530.874a47.805 47.805 0 0 0 12.442 17.798l205.108 184.68c19.7 17.739 50.05 16.148 67.79-3.552 17.738-19.7 16.147-50.051-3.553-67.79l-167.28-150.62zm529.545-377.146c24.911 9.066 37.755 36.61 28.688 61.522L436.03 861.068c-9.067 24.911-36.611 37.755-61.522 28.688-24.911-9.066-37.755-36.61-28.688-61.522l242.15-665.302c9.067-24.911 36.611-37.755 61.522-28.688z"></path>
            ) : (
              <path d="M1018.645 531.298c8.635-18.61 4.601-41.42-11.442-55.864l-205.108-184.68c-19.7-17.739-50.05-16.148-67.789 3.552-17.738 19.7-16.148 50.051 3.553 67.79l166.28 149.718-167.28 150.62c-19.7 17.738-21.291 48.088-3.553 67.789 17.739 19.7 48.089 21.291 67.79 3.553l205.107-184.68a47.805 47.805 0 0 0 12.442-17.798zM119.947 511.39l166.28-149.719c19.7-17.738 21.29-48.088 3.552-67.789-17.738-19.7-48.088-21.291-67.789-3.553L16.882 475.01C.84 489.456-3.194 512.264 5.44 530.874a47.805 47.805 0 0 0 12.442 17.798l205.108 184.68c19.7 17.739 50.05 16.148 67.79-3.552 17.738-19.7 16.147-50.051-3.553-67.79l-167.28-150.62z"></path>
            )}
          </DIcon>
        </DTooltip>
      </div>
      {openCode && (
        <div className="app-demo-box__code">
          {!scss && <div dangerouslySetInnerHTML={{ __html: tsx }} />}
          {scss && (
            <DTabs dActive={[tab, setTab]} dSize="smaller" dCenter>
              {['tsx', 'scss'].map((code) => (
                <DTab key={code} dId={code} dTitle={code}>
                  <div dangerouslySetInnerHTML={{ __html: code === 'tsx' ? tsx : scss }} />
                </DTab>
              ))}
            </DTabs>
          )}
        </div>
      )}
    </section>
  );
}
