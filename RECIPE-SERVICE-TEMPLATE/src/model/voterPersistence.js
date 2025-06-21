const mongoose = require("mongoose");
const {Schema} = mongoose;

const voterPersistenceSchema = new Schema({
    recipeId:{type:String,required:true},
    nickName:{type:String,required:true},
    stars:{type:Number,required:true},
    description:{type:String,required:true},
    approved:{type:Boolean,default:false},
    date:{type:Date,default:Date.now}

});

module.exports = mongoose.model('voterPersistence', voterPersistenceSchema);