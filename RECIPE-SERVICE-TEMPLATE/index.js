const express = require("express");
require("dotenv").config();
const cors = require("cors");

const connection = require("./src/config/mongo.connection");
const router = require("./src/router/router");

require("./src/model/recipe");
require("./src/model/voterPersistence");
require("./src/model/recipeList");
require("./src/model/favoriteList");
require("./src/model/interests");

const app = express();
const PORT = process.env.PORT || 7000;
app.use(cors());
app.use(express.json()); 

app.use( "/recipe",router);

connection();

app.listen(PORT, () => {
    console.log("RECIPE-SERVICE is running in port " + PORT);
});
