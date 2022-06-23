/* eslint-disable @typescript-eslint/no-var-requires */
import dayjs from 'dayjs';
import { isArray, isDate, isNull } from 'lodash';

const customParseFormat = require('dayjs/plugin/customParseFormat');

dayjs.extend(customParseFormat);

export default dayjs;

export function deepCompareDate(a: Date | null | [Date, Date], b: Date | null | [Date, Date], format: string) {
  const isSame = (t1: Date, t2: Date) => dayjs(t1).format(format) === dayjs(t2).format(format);

  if (isDate(a) && isDate(b)) {
    return isSame(a, b);
  }
  if (isNull(a) && isNull(b)) {
    return true;
  }
  if (isArray(a) && isArray(b)) {
    return isSame(a[0], b[0]) && isSame(a[1], b[1]);
  }
  return false;
}

function _orderTime(time: [dayjs.Dayjs, dayjs.Dayjs], order: 'ascend' | 'descend' | null): boolean {
  if ((order === 'ascend' && time[0].isAfter(time[1])) || (order === 'descend' && time[0].isBefore(time[1]))) {
    return true;
  }
  return false;
}

export function orderTime(time: [Date, Date], order: 'ascend' | 'descend' | null): boolean {
  const t1 = dayjs(time[0]).set('year', 2000).set('month', 0).set('date', 1);
  const t2 = dayjs(time[1]).set('year', 2000).set('month', 0).set('date', 1);

  return _orderTime([t1, t2], order);
}
