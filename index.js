const express=require('express');
const app=express();
const connectdb = require('./DB/connectDb');
const port=3000;
require('dotenv/config'); 
app.use(express.json());
const user=require('./routes/userRegister');
const account=require('./routes/accountRoute');
const notfound=require('./middleware/notfound');

app.use('/api/v1',user);

app.use('/api/v2',account);

app.use(notfound);

const start=async ()=>{
    try {
        await connectdb(process.env.url);
        app.listen(port,console.log(`Server Listening To The Port ${port}`));
    } catch (error) {
        console.log(error);
    }
}

start();
