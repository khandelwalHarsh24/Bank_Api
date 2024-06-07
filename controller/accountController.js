const accountSchema=require('../models/account');
const mongoose=require('mongoose');


const getAccount=async(req,res)=>{
    const account_detail=await accountSchema.find();
    res.status(200).json(account_detail);
}

const accountCreate=async(req,res)=>{
  const { accountNumber, sortCode, status, allowCredit, allowDebit,balance, dailyWithdrawalLimit } = req.body;
  const userId = req.user.userId;

  try {
    const account = new accountSchema({ userId, accountNumber, sortCode, status, allowCredit, allowDebit, balance, dailyWithdrawalLimit });
    await account.save();
    res.status(201).send(account);
  } catch (err) {
    res.status(500).send(err);
  }
}


const checkBalance=async(req,res)=>{
  const {accountNumber}=req.params;
  const userId=req.user.userId;
  try{
    const account=await accountSchema.findOne({userId,accountNumber});
    if (!account) return res.status(404).send({ message: 'Account not found' });
    res.status(200).json({balance: account.balance});
  }catch(err){
    res.status(500).send(err);
  }
}

const self_transaction=async(req,res)=>{
  const {accountNumber,type,amount}=req.body;
  const userId=req.user.userId;
  const session = await mongoose.startSession();
  session.startTransaction();
  try{
    const account=await accountSchema.findOne({userId,accountNumber});
    if (!account) return res.status(404).send({ message: 'Account not found' });
    if (account.status === 'INACTIVE') return res.status(400).send({ message: 'Account is inactive' });

    const today= account.setDateWithoutTime(new Date());
    const lastWithdrawalDate = account.setDateWithoutTime(account.lastWithdrawalDate);
    if(type==='Debit'){
      if(!account.allowDebit) return res.status(400).send({ message: 'Debit transactions not allowed' });
      if(lastWithdrawalDate && lastWithdrawalDate.getTime()===today.getTime()){
        if(account.todayWithdrawnAmount+amount>account.dailyWithdrawalLimit){
          return res.status(400).send({ message: 'Withdrawal limit exceeded' });
        }
      }
      else{
        if(amount>account.dailyWithdrawalLimit){
          return res.status(400).send({ message: 'Withdrawal limit exceeded' });
        }
        account.todayWithdrawnAmount=0;
      }
      if (account.balance < amount) return res.status(400).send({ message: 'Insufficient balance' });
      account.balance -= amount;
      account.todayWithdrawnAmount += amount;
      account.lastWithdrawalDate = today;  
    }
    else if(type==='Credit'){
      if(!account.allowCredit) return res.status(400).send({ message: 'Credit transactions not allowed' });
      account.balance += amount;
    }
    await account.save({session});
    await session.commitTransaction();
    session.endSession();
    res.status(200).json(account);
  }
  catch{
    await session.abortTransaction();
    session.endSession();
    res.status(500).send(err);
  }
}


const other_transaction=async(req,res)=>{
  const {userAccountNumber,consumerAccountNumber,type,amount}=req.body;
  const userId=req.user.userId;
  const session = await mongoose.startSession();
  session.startTransaction();
  try{
    const userAccount=await accountSchema.findOne({userId,accountNumber:userAccountNumber});
    const consumerAccount=await accountSchema.findOne({accountNumber:consumerAccountNumber});
    if(!userAccount || !consumerAccount) return res.status(404).send({ message: 'Account not found' });
    if (consumerAccount.status === 'INACTIVE') return res.status(400).send({ message: 'Account is inactive' });
    if(type==='Debit'){
      if(!consumerAccount.allowCredit) return res.status(400).send({ message: 'Credit transactions not allowed' });
      if(!userAccount.allowDebit) return res.status(400).send({ message: 'Debit transactions not allowed' });
      const today= userAccount.setDateWithoutTime(new Date());
      const lastWithdrawalDate = userAccount.setDateWithoutTime(userAccount.lastWithdrawalDate);
      if(lastWithdrawalDate && lastWithdrawalDate.getTime()===today.getTime()){
        if(userAccount.todayWithdrawnAmount+amount>userAccount.dailyWithdrawalLimit){
          return res.status(400).send({ message: 'Withdrawal limit exceeded' });
        }
        else{
          if(amount>userAccount.dailyWithdrawalLimit){
            return res.status(400).send({ message: 'Withdrawal limit exceeded' });
          }
          userAccount.todayWithdrawnAmount=0;
        }
        if (userAccount.balance < amount) return res.status(400).send({ message: 'Insufficient balance' });
        userAccount.balance -= amount;
        userAccount.todayWithdrawnAmount += amount;
        userAccount.lastWithdrawalDate = today;  
        consumerAccount.balance += amount;
      }
      await userAccount.save({session});
      await consumerAccount.save({session});
      await session.commitTransaction();
      session.endSession();
      res.status(200).json({userAccount,consumerAccount});
    }
  }catch(err){
    res.status(500).send(err);
  }
}



module.exports={getAccount,accountCreate,checkBalance,self_transaction,other_transaction};