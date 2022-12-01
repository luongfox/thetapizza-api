import '../boostrap.js';
import Factory from '../services/factory.js';

(async () => {
  await main().catch(console.error);
  process.exit(0);
})();

async function main() {
  console.log(await Factory.getStats());
}
  