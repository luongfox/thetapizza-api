import '../boostrap.js';
import Theta from '../services/theta.js';
import Stake from '../models/stake.js';
import path from 'path';
import fs from 'fs';
import { loadImage, createCanvas, registerFont } from 'canvas';
import Factory from '../services/factory.js';
import Utils from '../helpers/utils.js';
import Pricing from '../services/pricing.js';
import { TDROP_MAX_SUPPLY } from '../helpers/constants.js';
import Twitter from '../services/twitter.js';

(async () => {
  await main().catch(console.error);
  process.exit(0);
})();

async function main() {
  const stats = await Factory.getStats();

  const __dirname = path.resolve();
  const reportImage = __dirname + '/public/images/report.png';
  const logoImage = __dirname + '/public/images/tfuel3.png';
  const isBearish = stats.theta.price_change_percent_24h <= 0 && stats.tfuel.price_change_percent_24h <= 0;
  
  const bgWidth = 504;
  const bgHeight = 504;

  registerFont(__dirname + '/public/fonts/Roboto-Light.ttf', { family: 'Roboto-Light' });
  registerFont(__dirname + '/public/fonts/Roboto-Regular.ttf', { family: 'Roboto-Regular' });
  registerFont(__dirname + '/public/fonts/Roboto-Medium.ttf', { family: 'Roboto-Medium' });
  registerFont(__dirname + '/public/fonts/Roboto-Bold.ttf', { family: 'Roboto-Bold' });

  const canvas = createCanvas(bgWidth, bgHeight);
  const ctx = canvas.getContext('2d');

  let bgImage = __dirname + '/public/images/dailybg_green.png';
  let textColor = '#000000';
  if (isBearish) {
    bgImage = __dirname + '/public/images/dailybg_red.png';
    textColor = '#ffffff';
  }

  ctx.fillStyle = textColor;

  const image = await loadImage(bgImage);
  ctx.drawImage(image, 0, 0, bgWidth, bgHeight);

  const logo = await loadImage(logoImage);
  ctx.drawImage(logo, 115, 15, 60, 60);

  let x1 = 20
  let y1 = 45;
  let hSpacing = 26;
  let titleFont = '35px Roboto-Bold';
  let headingFont = '21px Roboto-Bold';
  let normalFont = '18px Roboto-Regular';

  let value = '';
  let text = 'ThetaPizza';
  ctx.font = titleFont;
  ctx.fillText(text, 180, y1);

  y1 = 70;
  const today = new Date();
  text = today.getUTCFullYear() + '-' + (today.getUTCMonth() + 1) + '-' + today.getUTCDate() + ' ' + today.getUTCHours() + ':' + today.getUTCMinutes() + ' UTC';
  ctx.font = normalFont;
  ctx.fillText(text, 180 + 5, y1);

  y1 = 110;
  text = '* Network';
  ctx.font = headingFont;
  ctx.fillText(text, x1 + 5, y1);

  y1 = 135;
  text = 'TVL: $' + Utils.formatNumber(stats.network.tvl, 2, 'auto') + ' (' + (stats.network.tvl_change_24h >= 0 ? '+' : '-') + Utils.formatNumber(Math.abs(stats.network.tvl_change_24h), 2, 'auto') + ')';;
  ctx.font = normalFont;
  ctx.fillText(text, x1 + 5, y1);

  y1 += hSpacing;
  text = 'Validators: ' + stats.network.validators;
  ctx.fillText(text, x1 + 5, y1);

  y1 += hSpacing;
  text = 'Guardians: ' + Utils.formatNumber(stats.network.guardians);
  ctx.fillText(text, x1 + 5, y1);

  y1 += hSpacing;
  text = 'Elite nodes: ' + Utils.formatNumber(stats.network.elites);
  ctx.fillText(text, x1 + 5, y1);

  y1 += hSpacing;
  text = 'Active wallets: ' + Utils.formatNumber(stats.network.active_wallets);
  ctx.fillText(text, x1 + 5, y1);

  y1 += hSpacing;
  text = 'Trans 24H: ' + Utils.formatNumber(stats.network.transactions_24h);
  ctx.fillText(text, x1 + 5, y1);

  y1 += hSpacing;
  text = '* Tdrop';
  ctx.font = headingFont;
  ctx.fillText(text, x1 + 5, y1 + 5);
  
  y1 += hSpacing + 5;
  text = 'Rank: #' + Utils.formatNumber(stats.tdrop.rank, 0);
  ctx.font = normalFont;
  ctx.fillText(text, x1 + 5, y1);

  y1 += hSpacing;
  text = 'Price: $' + Utils.formatNumber(stats.tdrop.price, 5) + ' (' + (stats.tdrop.price_change_percent_24h >= 0 ? '+' : '-') + Utils.formatNumber(Math.abs(stats.tdrop.price_change_percent_24h), 2) + '%)';
  ctx.fillText(text, x1 + 5, y1);

  y1 += hSpacing;
  text = 'Vol 24H: $' + Utils.formatNumber(stats.tdrop.volume_24h, 2, 'auto') + ' (' + (stats.tdrop.volume_change_percent_24h >= 0 ? '+' : '-') + Utils.formatNumber(Math.abs(stats.tdrop.volume_change_percent_24h), 2) + '%)';
  ctx.fillText(text, x1 + 5, y1);

  y1 += hSpacing;
  text = 'Market cap: $' + Utils.formatNumber(stats.tdrop.market_cap, 2, 'auto');
  ctx.fillText(text, x1 + 5, y1);

  y1 += hSpacing;
  text = 'Stakes: ' + Utils.formatNumber(stats.tdrop.stakes, 2, 'auto') + ' (' + Utils.formatNumber(stats.tdrop.stakes_percent, 2) + '%)';
  ctx.fillText(text, x1 + 5, y1);

  y1 += hSpacing;
  text = 'Supply: ' + Utils.formatNumber(stats.tdrop.supply, 3, 'auto') + ' / 20B';
  ctx.fillText(text, x1 + 5, y1);

  y1 += hSpacing;
  text = 'Staking APY: ' + Utils.formatNumber(stats.tdrop.stakes_apy_percent, 2) + '%';
  ctx.fillText(text, x1 + 5, y1);

  // THETA
  let x2 = 260
  let y2 = 105;

  text = '* Theta';
  ctx.font = headingFont;
  ctx.fillText(text, x2 + 5, y2 + 5);
  
  y2 += hSpacing + 5;
  text = 'Rank: #' + Utils.formatNumber(stats.theta.rank, 0);
  ctx.font = normalFont;
  ctx.fillText(text, x2 + 5, y2);

  y2 += hSpacing;
  text = 'Price: $' + Utils.formatNumber(stats.theta.price, 3) + ' (' + (stats.theta.price_change_percent_24h >= 0 ? '+' : '-') + Utils.formatNumber(Math.abs(stats.theta.price_change_percent_24h), 2) + '%)';
  ctx.fillText(text, x2 + 5, y2);

  y2 += hSpacing;
  text = 'Vol 24H: $' + Utils.formatNumber(stats.theta.volume_24h, 2, 'auto') + ' (' + (stats.theta.volume_change_percent_24h >= 0 ? '+' : '') + Utils.formatNumber(stats.theta.volume_change_percent_24h, 2) + '%)';
  ctx.fillText(text, x2 + 5, y2);

  y2 += hSpacing;
  text = 'Market cap: $' + Utils.formatNumber(stats.theta.market_cap, 2, 'auto');
  ctx.fillText(text, x2 + 5, y2);

  y2 += hSpacing;
  text = 'Stakes: ' + Utils.formatNumber(stats.theta.stakes, 2, 'auto') + ' (' + Utils.formatNumber(stats.theta.stakes_percent, 2) + '%)';
  ctx.fillText(text, x2 + 5, y2);

  y2 += hSpacing;
  text = 'Supply: 1B / 1B';
  ctx.fillText(text, x2 + 5, y2);

  // TFUEL

  y2 += hSpacing;
  text = '* Tfuel';
  ctx.font = headingFont;
  ctx.fillText(text, x2 + 5, y2 + 5);
  
  y2 += hSpacing + 5;
  text = 'Rank: #' + Utils.formatNumber(stats.tfuel.rank, 0);
  ctx.font = normalFont;
  ctx.fillText(text, x2 + 5, y2);

  y2 += hSpacing;
  text = 'Price: $' + Utils.formatNumber(stats.tfuel.price, 4) + ' (' + (stats.tfuel.price_change_percent_24h >= 0 ? '+' : '-') + Utils.formatNumber(Math.abs(stats.tfuel.price_change_percent_24h), 2) + '%)';
  ctx.fillText(text, x2 + 5, y2);

  y2 += hSpacing;
  text = 'Vol 24H: $' + Utils.formatNumber(stats.tfuel.volume_24h, 2, 'auto') + ' (' + (stats.tfuel.volume_change_percent_24h >= 0 ? '+' : '-') + Utils.formatNumber(Math.abs(stats.tfuel.volume_change_percent_24h), 2) + '%)';
  ctx.fillText(text, x2 + 5, y2);

  y2 += hSpacing;
  text = 'Market cap: $' + Utils.formatNumber(stats.tfuel.market_cap, 2, 'auto');
  ctx.fillText(text, x2 + 5, y2);

  y2 += hSpacing;
  text = 'Stakes: ' + Utils.formatNumber(stats.tfuel.stakes, 2, 'auto') + ' (' + Utils.formatNumber(stats.tfuel.stakes_percent, 2) + '%)';
  ctx.fillText(text, x2 + 5, y2);

  y2 += hSpacing;
  text = 'Supply: ' + Utils.formatNumber(stats.tfuel.supply, 3, 'auto') + ' / Infinite';
  ctx.fillText(text, x2 + 5, y2);

  y2 += hSpacing;
  text = 'Daily burnt: ' + Utils.formatNumber(stats.tfuel.daily_burnt, 0);
  ctx.fillText(text, x2 + 5, y2);

  const buffer = await canvas.toBuffer('image/png');
  fs.writeFileSync(reportImage, buffer);

  await Twitter.dailyUpdate('#THETA daily update ' + (today.getUTCFullYear() + '-' + (today.getUTCMonth() + 1) + '-' + today.getUTCDate()) + ' https://thetapizza.com', reportImage);

  fs.unlinkSync(reportImage);
}
  