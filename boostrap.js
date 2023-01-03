import * as dotenv from 'dotenv';
import MDB from './models/mdb.js';
import RC from './helpers/rc.js';
import { DECIMALS } from './helpers/constants.js';
import BigNumber from 'bignumber.js';
//import Logger from './helpers/logger.js';

//Logger.setup();

dotenv.config();
BigNumber.config({ DECIMAL_PLACES: DECIMALS });

MDB.getDb();
RC.getClient();