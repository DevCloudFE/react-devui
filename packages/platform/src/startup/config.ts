import { useStorage } from '@react-devui/hooks';

const STORAGE_KEY = '0';
const storageKey = useStorage.SERVICE.getItem('storageKey');
if (storageKey !== STORAGE_KEY) {
  useStorage.SERVICE.clear();
  useStorage.SERVICE.setItem('storageKey', STORAGE_KEY);
}
