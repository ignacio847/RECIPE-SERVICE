const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const fs = require("fs");
const path = require("path");
const { makeExecutableSchema } = require('@graphql-tools/schema');
const router = express.Router();
const {authenticate} = require("../auth/middleware");
const { mergeTypeDefs, mergeResolvers } = require("@graphql-tools/merge");

const typeDefsArray = [
  fs.readFileSync(path.join(__dirname, "../graphQl/favoriteList/schema.graphql"), "utf8"),
  fs.readFileSync(path.join(__dirname, "../graphQl/recipeCreated/schema.graphql"), "utf8"),
  fs.readFileSync(path.join(__dirname, "../graphQl/recipeList/schema.graphql"), "utf8"),
  fs.readFileSync(path.join(__dirname, "../graphQl/votes/schema.graphql"), "utf8"),
  fs.readFileSync(path.join(__dirname, "../graphQl/intereses/schema.graphql"), "utf8"),
  fs.readFileSync(path.join(__dirname, "../graphQl/home/schema.graphql"), "utf8"),
];
const mergedTypeDefs = mergeTypeDefs(typeDefsArray);

const favorite = require("../graphQl/favoriteList/resolvers");
const recipe = require("../graphQl/recipeCreated/resolvers");
const recipeList = require("../graphQl/recipeList/resolvers");
const votes = require("../graphQl/votes/resolvers");
const interests = require("../graphQl/intereses/resolvers");
const home = require("../graphQl/home/resolvers");
const mergedResolvers = mergeResolvers([favorite, recipe,recipeList,votes,interests,home]);

const schema = makeExecutableSchema({
  typeDefs:mergedTypeDefs,
  resolvers:mergedResolvers
});


router.use('/graphql', authenticate, graphqlHTTP((req) => ({
  schema,
  graphiql: true,
  context: {informationToken: req.informationToken} 
})));


module.exports = router;
