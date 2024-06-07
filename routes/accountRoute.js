const express=require('express');
const router=express.Router();
const auth=require('../middleware/auth');

const {getAccount,accountCreate,checkBalance,self_transaction,other_transaction}=require('../controller/accountController');
router.route('/getAccount').get(getAccount);
router.route('/createAccount').post(auth,accountCreate)
router.route('/checkBalance/:accountNumber').get(auth,checkBalance);
router.route('/selftransaction').post(auth,self_transaction);
router.route('/othertransaction').post(auth,other_transaction)

module.exports=router;
