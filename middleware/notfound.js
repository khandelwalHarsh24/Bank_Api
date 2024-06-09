const notFound=(req,res)=>{
    res.status(404).json({"message":"Routes does not Exist"});
}

module.exports=notFound;