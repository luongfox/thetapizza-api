import cron from 'node-cron';
import { exec } from 'child_process';
import RC from '../helpers/rc.js';
import Pricing from '../services/pricing.js';
import Factory from '../services/factory.js';

export async function startCrontab() {
  cron.schedule('*/7 * * * *', () => {
    Pricing.getCoins().then((coins) => {
      RC.set('factory.coins', JSON.stringify(coins));
      console.log('Coins updated.');
    });
  });

  cron.schedule('*/2 * * * *', () => {
    Factory.getStatsData().then((stats) => {
      RC.set('factory.stats', JSON.stringify(stats));
      console.log('Stats updated.');
    });

    exec('node /app/scripts/transactions.js');
    console.log('Transactions updated.');

    exec('node /app/scripts/stakes.js');
    console.log('Stakes updated.');
  });
  
  cron.schedule('58 23 * * *', () => {
    exec('node /app/scripts/report.js');
    console.log('Report tweeted.');
  });
}