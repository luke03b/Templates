import { renderLandingPage } from './pages/landing-page';

export function createApp(): HTMLElement {
  const appRoot = document.createElement('main');
  appRoot.className = 'page-shell';
  appRoot.appendChild(renderLandingPage());
  return appRoot;
}
