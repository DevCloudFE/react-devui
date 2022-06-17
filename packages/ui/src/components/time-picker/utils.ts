/* eslint-disable @typescript-eslint/no-var-requires */
import dayjs from 'dayjs';
import { isArray, isDate, isNull } from 'lodash';

const customParseFormat = require('dayjs/plugin/customParseFormat');

dayjs.extend(customParseFormat);

export default dayjs;

export function deepCompareDate(a: Date | null | [Date | null, Date | null], b: Date | null | [Date | null, Date | null], format: string) {
  const isSame = (t1: Date | null, t2: Date | null) =>
    (isNull(t1) && isNull(t2)) || (isDate(t1) && isDate(t2) && dayjs(t1).format(format) === dayjs(t2).format(format));
  if (isArray(a) && isArray(b)) {
    return isSame(a[0], b[0]) && isSame(a[1], b[1]);
  } else if (!isArray(a) && !isArray(b)) {
    return isSame(a, b);
  }
  return false;
}

export function orderTime(time: [Date, Date], order: 'ascend' | 'descend' | null): boolean {
  if ((order === 'ascend' && dayjs(time[0]).isAfter(dayjs(time[1]))) || (order === 'descend' && dayjs(time[0]).isBefore(dayjs(time[1])))) {
    time.reverse();
    return true;
  }
  return false;
}
