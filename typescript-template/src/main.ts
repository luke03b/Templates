import { createApp } from './app';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Root element not found');
}

root.appendChild(createApp());
