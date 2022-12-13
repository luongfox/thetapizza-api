import cron from 'node-cron';
import { exec } from 'child_process';
import Factory from '../services/factory.js';

export async function startCrontab() {
  cron.schedule('*/30 * * * *', () => {
    Factory.cacheTopThetaWallets();
    Factory.cacheTopTfuelWallets();
  });

  cron.schedule('*/10 * * * *', () => {
    exec('node /app/scripts/stakes.js');
    console.log('Stakes updated.');
  });

  cron.schedule('*/7 * * * *', () => {
    Factory.cacheCoins();
  });

  cron.schedule('*/2 * * * *', () => {
    Factory.cacheStats();

    exec('node /app/scripts/transactions.js');
    console.log('Transactions updated.');
  });
  
  if (process.env.APP_ENV == 'production') {
    cron.schedule('59 23 * * *', () => {
      exec('node /app/scripts/report.js');
      console.log('Report tweeted.');
    });
  }
}