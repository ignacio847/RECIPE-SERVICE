const mongoose = require("mongoose");
const {Schema} = mongoose;

const favoriteListSchema = new Schema({
    recipeId:{type:String, required:true},
    nickName:{type:String, required:true}
});

module.exports = mongoose.model("favoriteList",favoriteListSchema);