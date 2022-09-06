import { useImmer } from '@react-devui/hooks';

export function useNestedPopup<ID>(initialValue: ID[] = []) {
  const [popupIds, setPopupIds] = useImmer<{ id: ID; visible: boolean }[]>(() => initialValue.map((id) => ({ id, visible: true })));

  return {
    popupIds,
    setPopupIds,
    addPopupId: (id: ID) => {
      setPopupIds((draft) => {
        if (draft.findIndex((v) => v.id === id) === -1) {
          draft.push({ id, visible: true });
        }
      });
    },
    removePopupId: (id: ID) => {
      setPopupIds((draft) => {
        const index = draft.findIndex((v) => v.id === id);
        if (index !== -1) {
          draft[index].visible = false;
          for (let index = draft.length - 1; index >= 0; index--) {
            if (draft[index].visible) {
              break;
            }
            draft.pop();
          }
        }
      });
    },
  };
}
