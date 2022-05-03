import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { DOTPlatform, IMockConfiguration } from 'dotsdk';
import { appLogger } from './log-manager';

if (environment.production) {
  enableProdMode();
}

const mockOptions: IMockConfiguration = {
  useMocksForEnvironment: environment.useMocksForEnvironment,
  environmentMocksPath: environment.environmentMocksPath,
  useMocksForPay: environment.useMocksForPay,
  payMocksPath: environment.payMocksPath,
  useMocksForPos: environment.useMocksForPos,
  posMocksPath: environment.posMocksPath,
};

DOTPlatform(mockOptions).then(() =>
  platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .then(() => appLogger.debug(`application initialized`))
    .catch((err) => appLogger.error(`${err}`))
);
