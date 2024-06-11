const userSchema=require("../models/user");
const bcrypt=require("bcryptjs");
const jwt = require("jsonwebtoken");


const validatePassword = (password) => {
    const minLength = 8;
    const hasAlphabet = /[a-zA-Z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
    return password.length > minLength && hasAlphabet && hasSpecialChar;
};

const getUserData=async(req,res)=>{
    const userData=await userSchema.find();
    res.status(200).json(userData);
}

const userRegister=async(req,res)=>{
     try{
        const userName=req.body.username;
        const password=req.body.password;
        if (!validatePassword(password)) {
            return res.status(400).send({ message: 'Password must be greater than 8 characters, contain at least one alphabet, and one special character' });
        }
        let newUser=new userSchema({
            username:userName,
            password: await bcrypt.hash(password,10)
        })
        if (!newUser) return res.status(404).json({"message":"The user cannot be created"});
        newUser=await newUser.save();
        res.status(200).json(newUser);
     }
     catch(err){
        return res.status(500).send(err);
     }
}

const loginUser=async(req,res)=>{
    const {username,password}=req.body;
    try {
        const user = await userSchema.findOne({ username });
        const jwt_secret=process.env.jwt_secret
        // console.log(user);
        if (!user) return res.status(400).send({ message: 'Invalid credentials' });
    
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).send({ message: 'Invalid credentials' });
    
        const token = jwt.sign({ userId: user._id }, jwt_secret, { expiresIn: '1h' });
        // console.log(token);
        res.status(200).send({token});
      } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
}


module.exports={getUserData,userRegister,loginUser};