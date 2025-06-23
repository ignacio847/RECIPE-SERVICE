const service = require("../../service/service");
const jwt = require("../../auth/jwt");

const resolvers = {
    Query:{
        getRecipeFromList: async (_,{},context) =>{
            try{
              const {informationToken} = context;
              const response = await service.getRecipeFromList(informationToken.nickName);
              console.log("archivado" ,response)
              return response.success ? {
                __typename:"getRecipesByUser",
                success:response.success,
                recipes:response.message
              }:{
                __typename:"errorMessage",
                success:response.success,
                message:response.message
              }
            }catch(error){
              return {
                __typename:"errorMessage",
                success:false,
                message:error.message
              };
            }
        },
        showRecipeDetailsFromList: async (_,{id},context) =>{
            try{
                const {informationToken} = context;
                const response = await service.showRecipeDetailsFromList(id, informationToken.nickName);
                return response.success ?{
                    __typename:"showDetails",
                    success:response.success,
                    recipe: response.message
                }:{
                    __typename:"recipeErrorMessage",
                    success:response.success,
                    message:response.success
                };
            }catch(error){
                return {
                    __typename:"recipeErrorMessage",
                    success:false,
                    message:error.message
                };
            }
        },
        existRecipeInList: async (_,{id},context) =>{
            try{
                const {informationToken} = context;
                const response = service.existRecipeInList(id, informationToken.nickName);
                return response;
            }catch(error){
                return {success:false, message:error.message};
            }
        },
    },
    Mutation:{
        addRecipeToList: async (_,{recipe},context) =>{
            try{
            const {informationToken} = context;
            const newRecipe = {
                nickName:informationToken.nickName,
                recipeId:recipe.recipeId,
                portions:recipe.portions,
                name:recipe.name,
                image:recipe.image,
                description:recipe.description,
                ingredients:recipe.ingredients,
                steps:recipe.steps,
                typeOfDish:recipe.typeOfDish,
                difficulty:recipe.difficulty,
                typeOfDiet:recipe.typeOfDiet,
                time:recipe.time
            };
    
            const response = await service.addRecipeToList(newRecipe);
    
            return response;
    
            }catch(error){
            return {success:false, message:error.message};
            }
        },
        deleteRecipeFromList: async (_,{id}) =>{
            try{
            const response = await service.deleteRecipeFromList(id);
            return response;
            }catch(error){
            return {success:false, message:error.message};
            }
        },
    },
    recipeDetailsMessage:{
        __resolveType(obj){
            return obj.__typename;
        }
    },
};

module.exports = resolvers;