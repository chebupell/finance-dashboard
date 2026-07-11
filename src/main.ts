import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import 'chart.js/auto';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
