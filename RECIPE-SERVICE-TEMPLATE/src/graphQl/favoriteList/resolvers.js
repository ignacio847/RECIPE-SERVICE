const service = require("../../service/service");

const resolvers = {
    Query: {
      existRecipeInFavorite: async (_,{id},context) =>{
        try{
          const {informationToken} = context;
          const response = await service.existRecipeInFavorite(id,informationToken.nickName);
          return response;
        }catch(error){
          return {success:false,message:error.message};
        }
      },
      getRecipeFromFavorites: async (_,{},context) =>{
        try{
          const {informationToken} = context;
          const response = await service.getRecipeFromFavorites(informationToken.nickName);
          return response.success ? {
            __typename:"getRecipesByUser",
            success:response.success,
            recipes:response.message
          }:{
            __typename:"recipeErrorMessage",
            success:response.success,
            message:response.message
          };
        }catch(error){
          return {
            __typename:"recipeErrorMessage",
            success:false,
            message:error.message
          }
        }
      },
    
    },
    Mutation: { 
      addRecipeToFavorite: async (_,{id},context) =>{
        try{
          const {informationToken} = context;
          const response = service.addRecipeToFavorite(id, informationToken.nickName);
          return response;
          
        }catch(error){
          return {success:false, message:error.message}
        }
      },
      deletefromFavorite: async (_,{id},context) =>{
        try{
          const {informationToken} = context;
          const response = await service.deletefromFavorite(id,informationToken.nickName);
          return response;
        }catch(error){
          return {success:false, message:error.message}
        }
      },
    },
    getRecipesByUserMessage:{
      __resolveType(obj){
         return obj.__typename;
      }
  },
    
    
};
  
  module.exports = resolvers;
  