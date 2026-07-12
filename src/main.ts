import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import 'chart.js/auto';

const storedTheme = localStorage.getItem('finance-dashboard-theme');
document.documentElement.setAttribute('data-theme', storedTheme === 'dark' ? 'dark' : 'light');

const storedLocale = localStorage.getItem('finance-dashboard-locale');
document.documentElement.lang = storedLocale === 'ru' ? 'ru' : 'en';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
