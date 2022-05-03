import { logManager } from 'dotsdk';

export const appLogManager = logManager.configure({
  minLevels: {
    '': 'error',
    marugame: 'debug',
  },
});

export const appLogger = appLogManager.getLogger('marugame.app');
export const paymentLogger = appLogManager.getLogger('marugame.payment');
