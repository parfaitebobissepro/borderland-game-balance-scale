import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';

export let startFrom = new Date().getTime();


platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
