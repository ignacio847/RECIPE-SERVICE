const service = require("../../service/service");
const calculater = require("../../util/calculatePortions");

const resolvers = {
  Query:{
    getRecipesByUser: async (_,{},context) => {
        try{
          const {informationToken} = context;
          const response = await service.getRecipeByUser(informationToken.nickName);
          return response.success ? {
            __typename:"getRecipesByUser",
            success: response.success,
            recipes: response.message
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
          };
        }
    },
    showRecipeDetails: async (_,{id},context) =>{
        try{
          const {informationToken} = context;
          const response = await service.showRecipeDetails(id,informationToken.nickName);
          console.log(response)
          return response.success ?
          {
            __typename:"showDetails",
            success:response.success,
            recipe:response.message
          }:{
            __typename:"recipeErrorMessage",
            success:response.success,
            message:response.message
          }
        }catch(error){
          return {
            __typename:"recipeErrorMessage",
            success:false,
            message:error.message
          }
        }
    },
    showRecipeNotApproved: async () =>{
        try{
          const response = await service.showRecipeNotApproved();
          return response.success ? {
            __typename:"recipeList",success:true,recipes:response.message
          }:{
            __typename:"recipeList",success:false, message:response.message
          };
        }catch(error){
          return {__typename:"recipeErrorMessage",success:false, message:error.message}
        }
    },
    searchWithIngredients: async (_,{searchText}) => {
    try{ 
        const response = await service.searchRecipesWithIngredients(searchText);
        return response.success ? {
        __typename:"searchRecipe",
        success:response.success,
        recipes:response.message
        }:{
        __typename:"searchRecipe",
        success:response.success,
        message:response.message
        } 
    }catch(error){
        return {
        __typename:"recipeErrorMessage",
        success:false,
        message:error.message
        };
      }
    },
    searchWithOutIngredients: async (_,{searchText}) => {
    try{
        const response = await service.searchRecipesWithoutIngredients(searchText);
        return response.success ? {
        __typename:"searchRecipe",
        success:response.success,
        recipes: response.message
        }:{
        __typename:"searchRecipe",
        success:response.success,
        message:response.message
        };
    }catch(error){
        return {
        __typename:"recipeErrorMessage",
        success:false,
        message:error.message
        };
    }
    },
    searchByNickName: async (_,{searchText}) =>{
    try{
        const response = await service.searchRecipeByNickName(searchText);
        return response.success ? {
        __typename:"searchRecipe",
        success:response.success,
        recipes:response.message
        }:{
        __typename:"searchRecipe",
        success:response.success,
        message: response.message
        };
    }catch(error){
        return {
        __typename:"recipeErrorMessage",
        success:false,
        message:error.message
        };
    }
    },
    searchByType: async (_,{searchText}) =>{
    try{
        const response = await service.searchByType(searchText);
        return response.success ? {
        __typename:"searchRecipe",
        success:response.success,
        recipes:response.message
        }:{
        __typename:"searchRecipe",
        success:response.success,
        message: response.message
        };
    }catch(error){
        return {
        __typename:"recipeErrorMessage",
        success:false,
        message:error.message
        };
    }
    },
    searchByName: async (_,{searchText}) => {
    try{
        const response = await service.searchByName(searchText);
        return response.success ? {
        __typename:"searchRecipe",
        success:response.success,
        recipes:response.message
        }:{
        __typename:"searchRecipe",
        success:response.success,
        message: response.message
        };
    }catch(error){
        return {
        __typename:"recipeErrorMessage",
        success:false,
        message:error.message
        };
    }
    },
    calculatePortions: async (_, { id, portion}) => {
      try {
        const recipePortionsAndIngredients = await service.getPortionAndIngredientsFromRecipe(id);
    
        if (!recipePortionsAndIngredients.success) {
          return {
            __typename: "recipeErrorMessage",
            success: false,
            message: recipePortionsAndIngredients.message || "No se encontraron porciones."
          };
        }
    
        const result = calculater.calculatePortions(recipePortionsAndIngredients.message.portions, portion, recipePortionsAndIngredients.message.ingredients);
  
        if (!result.success) {
          return {
            __typename: "recipeErrorMessage",
            success: false,
            message: result.message
          };
        }
    
        return {
          __typename: "portions",
          success: true,
          ingredients: result.message 
        };
      } catch (error) {
        return {
          __typename: "recipeErrorMessage",
          success: false,
          message: error.message
        };
      }
    },    
    calculatePortionsByIngredient: async (_, { id, portion, ingredientName }) => {
      try {
        const recipePortionsAndIngredients = await service.getPortionAndIngredientsFromRecipe(id);
    
        if (!recipePortionsAndIngredients.success) {
          return {
            __typename: "recipeErrorMessage",
            success: false,
            message: recipePortionsAndIngredients.message || "No se encontraron porciones."
          };
        }
    
        const result = calculater.calculatePortionsByIngredient(recipePortionsAndIngredients.message.portions, portion, recipePortionsAndIngredients.message.ingredients, ingredientName);
    
        if (!result.success) {
          return {
            __typename: "recipeErrorMessage",
            success: false,
            message: result.message
          };
        }
    
        return {
          __typename: "portions",
          success: true,
          portion: result.message.newPortions,
          ingredients: result.message.ingredients
        };
      } catch (error) {
        return {
          __typename: "recipeErrorMessage",
          success: false,
          message: error.message
        };
      }
    },
    existRecipeByName: async (_,{name},context) =>{
      try{
        const {informationToken} = context;
        const response = await service.existRecipeByName(informationToken.nickName,name);
        return response.success ? {
          __typename:"recipeExist",
          success:response.success,
          recipe:response.recipe,
          message:response.message
        }:{
          __typename:"recipeExist",
          success:response.success,
          recipe:response.recipe,
          message:response.message
        }
        
      }catch(error){
        return {__typename:"recipeErrorMessage",success:false,message:error.message}
      }
    },
    existNameForUpdate: async (_,{id,name},context) =>{
      try{
        const {informationToken} = context;
        const response = await service.existNameForUpdate(id,name,informationToken.nickName);
        console.log(response)
        return response
      }catch(error){
        return {success:false,message:error.message}
      }
    },
  },    
  Mutation:{
      loadRecipe: async (_, { recipe,option},context) => {
        const {informationToken} = context;
        const newRecipe = {
              nickName:informationToken.nickName,
              name: recipe.name,
              image:recipe.image,
              description: recipe.description,
              ingredients: recipe.ingredients,
              steps: recipe.steps,
              typeOfDish: recipe.typeOfDish,
              difficulty: recipe.difficulty,
              typeOfDiet: recipe.typeOfDiet,
              portions:recipe.portions,
              time:recipe.time
            };
        try{
          if(!option){
            return {success:false,message:"existe la receta pero no se recibio una opcion."}
          }else if (option == "REPLACE"){
            const response = await service.replaceRecipe(newRecipe);
            return response;
          }else if(option == "UPDATE"){
            const response = await service.updateLoadRecipe(newRecipe);
            return response;
          }else{
          const response = await service.createRecipe(newRecipe);
          return response;
          }
      }catch(error){
        return {success:false, message:error.message};
      }
      },
      UpdateRecipe: async (_,{recipe},context) =>{
            try{
              const {informationToken} = context;

              const newRecipe = {
                _id:recipe._id,
                nickName:informationToken.nickName,
                name: recipe.name,
                image:recipe.image,
                description: recipe.description,
                ingredients: recipe.ingredients,
                steps: recipe.steps,
                typeOfDish: recipe.typeOfDish,
                difficulty: recipe.difficulty,
                typeOfDiet: recipe.typeOfDiet,
                portions:recipe.portions,
                time:recipe.time
              };

              const response = await service.updateRecipe(newRecipe);
              return response;
      
            }catch(error){
              return {success:false, message:error};
            }
      },
      deleteRecipe: async (_,{id},context) => {
        try{
            const {informationToken} = context;
            const response = await service.deleteRecipe(id, informationToken.nickName);
            return response;
        }catch(error){
            return {success:false,message:error};
        }
      },
      approveRecipes: async (_,{id,accept}) =>{
            try{
              const response = service.approveRecipes(id,accept);
              return response;
            }catch(error){
              return {success:false, message:error.message};
            }
      },
  },
  getRecipesByUserMessage: {
    __resolveType(obj) {
      if (obj.recipes) return 'getRecipesByUser';
      if (obj.message) return 'recipeErrorMessage';
      return null;
    }
  },
  recipeDetailsMessage:{
      __resolveType(obj){
        return obj.__typename;
      }
  },
  recipeNotApprovedMessage:{
      __resolveType(obj){
          return obj.__typename;
      }
  },
  searchRecipeMessage:{
      __resolveType(obj){
          return obj.__typename;
      }
  },
  portionsMessage:{
    __resolveType(obj){
      return obj.__typename;
    }
  },existRecipeByNameMessage:{
    __resolveType(obj){
      return obj.__typename;
    }
  }
};

module.exports = resolvers;