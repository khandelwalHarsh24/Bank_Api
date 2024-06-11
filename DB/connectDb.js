const mongoose=require('mongoose');
const connectdb=(url)=>{
    console.log('Connection Made');
    return mongoose.connect(url);
}

module.exports=connectdb;