const mongoose = require("mongoose");
const {Schema} = mongoose;

const range = new Schema({
    initial:{type:Number,required:true},
    end:{type:Number, required:true}
},{_id:false});

const interestsSchema = new Schema ({
    nickName:{type:String,required:true,unique:true},
    ability:{type:String, required:true},
    typeOfDish:{type:String,required:true},
    diet:{type:String, required:true},
    intolerances:{type:String, required:true},
    timeSpent:{type:range,required:true}
});

module.exports = mongoose.model("interests",interestsSchema);