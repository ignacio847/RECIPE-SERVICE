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

const recipeSchema = new Schema({
    nickName:{type:String,required:true},
    name:{type:String,required:true},
    image:{type:String,required:true},
    description:{type:String,required:true},
    ingredients:[ingredientitemSchema],
    steps:[stepSchema],
    typeOfDish:{type:String,required:false},
    difficulty:{type:String,required:false},
    typeOfDiet:{type:String,required:false}, 
    numberOfStart:{type:Number,default:0},
    numberOfVoters:{type:Number,default:0},
    portions:{type:Number,required:true},
    time:{type:Number,required:true},
    approved:{type:Boolean,default:false},
    creationDate:{type:Date,default:Date.now}

});

module.exports = mongoose.model('recipes', recipeSchema);