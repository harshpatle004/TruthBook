const errorHandler = (err,req,res,next)=>{
    if(err instanceof customerror){
        return res.status(err.status).json({error : err.message})
    }
    return res.status(500).json({error : "INternal Server Error"})
}