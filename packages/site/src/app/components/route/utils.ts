import hljs from 'highlight.js';
import { marked, Renderer } from 'marked';

const renderer = new Renderer();
renderer.heading = function (text, level) {
  const link = `<a href="#${text}" class="anchor">#</a>`;
  const head = `
<h${level} id="${text}">
  <span>${text}</span>
  ${link}
</h${level}>
`;
  return head;
};
renderer.table = function (header: string, body: string) {
  return `
<div class="app-table-container">
 <table>
   <thead>${header}</thead>
   <tbody>${body}</tbody>
 </table>
</div>
`;
};
marked.setOptions({
  renderer,
  highlight: function (code, lang) {
    return hljs.highlight(code, { language: lang }).value;
  },
  langPrefix: 'hljs ',
});

export function toString(arr: number[]) {
  return new TextDecoder().decode(Uint8Array.from(arr));
}

export default marked.parse;
