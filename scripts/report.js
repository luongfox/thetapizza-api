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
  const tvl = await Pricing.getTVL();
  const nodes = await Stake.countNodeTypes();
  const coins = await Factory.getCoins();

  const __dirname = path.resolve();
  const reportImage = __dirname + '/public/images/report.png';
  const logoImage = __dirname + '/public/images/tfuel2.png';

  let bgImage = __dirname + '/public/images/dailybg_green.png';
  if (coins.THETA.price_change_24h <= 0 && coins.TFUEL.price_change_24h <= 0) {
    bgImage = __dirname + '/public/images/dailybg_red.png';
  }
  
  const bgWidth = 504;
  const bgHeight = 504;

  registerFont(__dirname + '/public/fonts/Roboto-Light.ttf', { family: 'Roboto-Light' });
  registerFont(__dirname + '/public/fonts/Roboto-Regular.ttf', { family: 'Roboto-Regular' });
  registerFont(__dirname + '/public/fonts/Roboto-Medium.ttf', { family: 'Roboto-Medium' });
  registerFont(__dirname + '/public/fonts/Roboto-Bold.ttf', { family: 'Roboto-Bold' });

  const canvas = createCanvas(bgWidth, bgHeight);
  const ctx = canvas.getContext('2d');

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
  text = 'TVL: $' + Utils.formatNumber(tvl.tvl, 2, 'auto');
  ctx.font = normalFont;
  ctx.fillText(text, x1 + 5, y1);

  y1 += hSpacing;
  text = 'Validators: ' + nodes.vcp;
  ctx.fillText(text, x1 + 5, y1);

  y1 += hSpacing;
  text = 'Guardians: ' + Utils.formatNumber(nodes.gcp);
  ctx.fillText(text, x1 + 5, y1);

  y1 += hSpacing;
  text = 'Elite nodes: ' + Utils.formatNumber(nodes.eenp);
  ctx.fillText(text, x1 + 5, y1);

  y1 += hSpacing;
  text = 'Active wallets: ' + Utils.formatNumber(await Theta.getActiveWallets());
  ctx.fillText(text, x1 + 5, y1);

  y1 += hSpacing;
  text = 'Trans 24H: ' + Utils.formatNumber(await Theta.getTransactions24h());
  ctx.fillText(text, x1 + 5, y1);

  y1 += hSpacing;
  text = '* Tdrop';
  ctx.font = headingFont;
  ctx.fillText(text, x1 + 5, y1 + 5);
  
  y1 += hSpacing + 5;
  text = 'Rank: #' + Utils.formatNumber(coins.TDROP.rank, 0);
  ctx.font = normalFont;
  ctx.fillText(text, x1 + 5, y1);

  y1 += hSpacing;
  text = 'Price: $' + Utils.formatNumber(coins.TDROP.price, 5) + ' (' + (coins.TDROP.price_change_24h >= 0 ? '+' : '') + Utils.formatNumber(coins.TDROP.price_change_24h, 2) + '%)';
  ctx.fillText(text, x1 + 5, y1);

  y1 += hSpacing;
  text = 'Vol 24H: $' + Utils.formatNumber(coins.TDROP.volume_24h, 2, 'auto') + ' (' + (coins.TDROP.volume_change_24h >= 0 ? '+' : '') + Utils.formatNumber(coins.TDROP.volume_change_24h, 0) + '%)';
  ctx.fillText(text, x1 + 5, y1);

  y1 += hSpacing;
  text = 'Market cap: $' + Utils.formatNumber(coins.TDROP.market_cap, 2, 'auto');
  ctx.fillText(text, x1 + 5, y1);

  y1 += hSpacing;
  const tdropTotalStaked = await Theta.getTdropTotalStaked();
  const tdropSupply = await Theta.getTdropSupply();
  const tdropTotalStakedPercentage = Utils.formatNumber((tdropTotalStaked / tdropSupply) * 100, 2);
  text = 'Stakes: ' + Utils.formatNumber(tdropTotalStaked, 3, 'auto') + ' (' + tdropTotalStakedPercentage + '%)';
  ctx.fillText(text, x1 + 5, y1);

  y1 += hSpacing;
  const tdropSupplyPercentage = Utils.formatNumber((tdropSupply / TDROP_MAX_SUPPLY) * 100, 2);
  text = 'Supply: ' + Utils.formatNumber(tdropSupply, 2, 'auto') + ' (' + tdropSupplyPercentage + '%)';
  ctx.fillText(text, x1 + 5, y1);

  y1 += hSpacing;
  text = 'Staking APY: ' + parseFloat(await Theta.getTdropStakingRate() * 100).toFixed(2) + '%'
  ctx.fillText(text, x1 + 5, y1);

  // THETA
  let x2 = 260
  let y2 = 105;

  text = '* Theta';
  ctx.font = headingFont;
  ctx.fillText(text, x2 + 5, y2 + 5);
  
  y2 += hSpacing + 5;
  text = 'Rank: #' + Utils.formatNumber(coins.THETA.rank, 0);
  ctx.font = normalFont;
  ctx.fillText(text, x2 + 5, y2);

  y2 += hSpacing;
  text = 'Price: $' + Utils.formatNumber(coins.THETA.price, 3) + ' (' + (coins.THETA.price_change_24h >= 0 ? '+' : '') + Utils.formatNumber(coins.THETA.price_change_24h, 2) + '%)';
  ctx.fillText(text, x2 + 5, y2);

  y2 += hSpacing;
  text = 'Vol 24H: $' + Utils.formatNumber(coins.THETA.volume_24h, 2, 'auto') + ' (' + (coins.THETA.volume_change_24h >= 0 ? '+' : '') + Utils.formatNumber(coins.THETA.volume_change_24h, 0) + '%)';
  ctx.fillText(text, x2 + 5, y2);

  y2 += hSpacing;
  text = 'Market cap: $' + Utils.formatNumber(coins.THETA.market_cap, 2, 'auto');
  ctx.fillText(text, x2 + 5, y2);

  y2 += hSpacing;
  const thetaTotalStaked = await Theta.getThetaTotalAmountStaked();
  const thetaTotalStakedPercentage = Utils.formatNumber((thetaTotalStaked / 1000000000) * 100, 2);
  text = 'Stakes: ' + Utils.formatNumber(thetaTotalStaked, 3, 'auto') + ' (' + thetaTotalStakedPercentage + '%)';
  ctx.fillText(text, x2 + 5, y2);

  y2 += hSpacing;
  text = 'Supply: 1,000,000,000';
  ctx.fillText(text, x2 + 5, y2);

  // TFUEL

  y2 += hSpacing;
  text = '* Tfuel';
  ctx.font = headingFont;
  ctx.fillText(text, x2 + 5, y2 + 5);
  
  y2 += hSpacing + 5;
  text = 'Rank: #' + Utils.formatNumber(coins.TFUEL.rank, 0);
  ctx.font = normalFont;
  ctx.fillText(text, x2 + 5, y2);

  y2 += hSpacing;
  text = 'Price: $' + Utils.formatNumber(coins.TFUEL.price, 4) + ' (' + (coins.TFUEL.price_change_24h >= 0 ? '+' : '') + Utils.formatNumber(coins.TFUEL.price_change_24h, 2) + '%)';
  ctx.fillText(text, x2 + 5, y2);

  y2 += hSpacing;
  text = 'Vol 24H: $' + Utils.formatNumber(coins.TFUEL.volume_24h, 2, 'auto') + ' (' + (coins.TFUEL.volume_change_24h >= 0 ? '+' : '') + Utils.formatNumber(coins.TFUEL.volume_change_24h, 0) + '%)';
  ctx.fillText(text, x2 + 5, y2);

  y2 += hSpacing;
  text = 'Market cap: $' + Utils.formatNumber(coins.TFUEL.market_cap, 2, 'auto');
  ctx.fillText(text, x2 + 5, y2);

  y2 += hSpacing;
  const tfuelTotalStaked = await Theta.getTfuelTotalAmountStaked();
  const tfuelTotalSupply = await Theta.getTfuelSupply();
  const tfuelTotalStaledPercentage = Utils.formatNumber((tfuelTotalStaked / tfuelTotalSupply) * 100, 2);
  text = 'Stakes: ' + Utils.formatNumber(tfuelTotalStaked, 3, 'auto') + ' (' + tfuelTotalStaledPercentage + '%)';
  ctx.fillText(text, x2 + 5, y2);

  y2 += hSpacing;
  text = 'Supply: ' + Utils.formatNumber(tfuelTotalSupply, 0);
  ctx.fillText(text, x2 + 5, y2);

  y2 += hSpacing;
  const dailyBurnt = await Theta.getTfuelDailyBurnt();
  text = 'Daily burnt: ' + Utils.formatNumber(dailyBurnt, 0);
  ctx.fillText(text, x2 + 5, y2);

  const buffer = await canvas.toBuffer('image/png');
  fs.writeFileSync(reportImage, buffer);

  await Twitter.dailyUpdate('#THETA daily update ' + (today.getUTCFullYear() + '-' + (today.getUTCMonth() + 1) + '-' + today.getUTCDate()), reportImage);

  fs.unlinkSync(reportImage);
}
  