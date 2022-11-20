import Account from '../models/account.js';

export default class ThetaController {
    
  static async prices(req, res) {
    const accounts = await Account.getAll();
    console.log(accounts);
    res.status(200).json({
      success: true,
      data: accounts
    });
  }
}