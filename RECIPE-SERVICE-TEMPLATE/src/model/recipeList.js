const mongoose = require("mongoose");
const {Schema} = mongoose;

const ingredientitemSchema = new Schema({
    name:{type:String,required:true},
    quantity:{type:Number,required:true},
    unit:{type:String,required:true}
},{_id:false});

const stepSchema = new Schema({
    description:{type:String,required:true}
},{_id:false});

const recipeListSchema = new Schema({
    recipeId:{type:String,required:true},
    nickName:{type:String,required:true},
    name:{type:String,required:true},
    image:{type:String,required:true},
    description:{type:String,required:true},
    ingredients:[ingredientitemSchema],
    steps:[stepSchema],
    typeOfDish:{type:String,required:false},
    difficulty:{type:String,required:false},
    typeOfDiet:{type:String,required:false}, 
    portions:{type:Number,required:true},
    time:{type:Number,required:true},
    numberOfStart:{type:Number,default:0},
    creationDate:{type:Date,default:Date.now}

});

module.exports = mongoose.model('recipeList', recipeListSchema);