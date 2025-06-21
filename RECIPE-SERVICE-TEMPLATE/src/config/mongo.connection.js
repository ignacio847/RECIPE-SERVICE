const mongoose = require("mongoose");

const connection = async() => {
    try{
        await mongoose.connect(process.env.URL,{
        useNewUrlParser:true,
        useUnifiedTopology:true
        }).then(()=>{console.log("succesfull connection by atlas.")})
    }catch(error) { 
        console.error("error, not connected.", error);
        process.exit(1);
    }
};
module.exports= connection;