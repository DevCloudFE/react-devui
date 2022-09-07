import d from 'dayjs';
import 'dayjs/locale/zh-cn';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import isBetween from 'dayjs/plugin/isBetween';
import localeData from 'dayjs/plugin/localeData';

d.extend(customParseFormat);
d.extend(isBetween);
d.extend(localeData);

export const dayjs = d;
