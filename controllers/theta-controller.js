import Account from '../models/account.js';

export default class ThetaController {
    
  static async prices(req, res) {
    res.json({
      success: true,
      data: await Account.getAll()
    });
  }
}