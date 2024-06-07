const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  accountNumber: {
    type: String,
    required: true,
    unique: true,
    length: 10,
  },
  sortCode: { 
    type: String, 
    required: true, 
    length: 8 
  },
  status: { 
    type: String, 
    enum: ["ACTIVE", "INACTIVE"], 
    default: "ACTIVE" 
  },
  allowCredit: { 
    type: Boolean, 
    default: true 
  },
  allowDebit: { 
    type: Boolean, 
    default: true 
  },
  balance: { 
    type: Number, 
    default: 0 
  },
  dailyWithdrawalLimit: { 
    type: Number, 
    default: 1000 
  },
  todayWithdrawnAmount: { 
    type: Number, 
    default: 0 
  },
  lastWithdrawalDate: { 
    type: Date, 
    default: null 
  },
},{ versionKey: '__v' });


accountSchema.methods.setDateWithoutTime = function(date) {
  const adjustedDate = new Date(date);
  adjustedDate.setUTCHours(0, 0, 0, 0);
  return adjustedDate;
};

const Account = mongoose.model("Account", accountSchema);

module.exports = Account;
