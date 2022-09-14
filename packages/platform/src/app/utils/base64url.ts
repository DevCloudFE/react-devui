export const base64url = {
  encode: (str: string) => {
    return window.btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  },
  decode: (str: string) => {
    str = (str + '===').slice(0, str.length + (str.length % 4));
    return window.atob(str.replace(/-/g, '+').replace(/_/g, '/'));
  },
};
