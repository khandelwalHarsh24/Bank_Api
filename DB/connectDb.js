const mongoose=require('mongoose');
// mongoose.set('strictQuery', false);
const connectdb=(url)=>{
    console.log('Connection Made');
    return mongoose.connect(url);
}

module.exports=connectdb;