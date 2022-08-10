import { StrictMode } from 'react';
import ReactDOMClient from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './app/App';
import './app/i18n';
import { insertBaiduScript } from './utils';

const rootElement = document.getElementById('app-root') as Element;

insertBaiduScript();

ReactDOMClient.createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
