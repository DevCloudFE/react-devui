export const base64url = {
  encode: (str: string) => {
    return window.btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  },
  decode: (str: string) => {
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    const remainder = str.length % 4;
    if (remainder !== 0) {
      str += Array.from({ length: 4 - remainder })
        .fill('=')
        .join('');
    }
    return window.atob(str);
  },
};
