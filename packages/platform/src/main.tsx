import { StrictMode } from 'react';
import ReactDOMClient from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './app/App';
import { GlobalStore } from './app/core';
import { startup } from './startup';

startup.then(() => {
  const rootElement = document.getElementById('root') as Element;

  ReactDOMClient.createRoot(rootElement).render(
    <StrictMode>
      <BrowserRouter>
        <GlobalStore.Provider>
          <App />
        </GlobalStore.Provider>
      </BrowserRouter>
    </StrictMode>
  );
});
