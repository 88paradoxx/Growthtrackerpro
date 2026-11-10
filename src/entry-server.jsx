// Build-time only: renders a page to HTML so search engines and AI crawlers
// see real content. Used by scripts/prerender.mjs; never shipped to browsers.
import React from 'react';
import { renderToString } from 'react-dom/server';
import { App } from './main.jsx';

export function render(route) {
  return renderToString(<App initialRoute={route} />);
}
