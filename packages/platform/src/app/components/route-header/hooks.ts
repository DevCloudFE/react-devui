import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

export function useTitle(): [string, string][] {
  const location = useLocation();
  const { t, i18n } = useTranslation();

  return location.pathname
    .split('/')
    .filter((key) => key)
    .map((key, index, arr) => {
      const tKey = arr.slice(0, index + 1).join('.');
      return [key, t(i18n.exists(`${tKey}.index`, { ns: 'title' }) ? `${tKey}.index` : tKey, { ns: 'title' })];
    });
}
