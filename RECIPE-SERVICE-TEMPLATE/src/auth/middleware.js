const {verifyToken} = require("./jwt");

const authenticate = (req,res,next)=>{
    const token = req.headers.authorization?.split(" ")[1];
    
    if(!token) return res.status(401).json({error:"unauthorized access."});
    try{
        const decoded = verifyToken(token);
        req.informationToken = decoded
        next();
    }catch(err){
        return res.status(401).json({err:"token overdue."});
    };

};

module.exports = {
    authenticate
};