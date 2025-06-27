const service = require("../../service/service");
const jwt = require("../../auth/jwt");

const resolvers = {
  Query: {
    searchRecipes: async (_, { input }, context) => {
      const { searchTerm, filterType, orderBy, orderDirection } = input;
      const { informationToken } = context;

      let response;

      try {
        switch (filterType) {
          case "USERNAME":
            response = await service.searchRecipeByNickName(orderBy, orderDirection, searchTerm);
            break;
          case "NAME":
            response = await service.searchByName(orderBy, orderDirection, searchTerm);
            break;
          case "TYPE":
            response = await service.searchByType(orderBy, orderDirection, searchTerm);
            break;
          case "WITH_INGREDIENTS":
            response = await service.searchRecipesWithIngredients(orderBy, orderDirection, searchTerm);
            break;
          case "WITHOUT_INGREDIENTS":
            response = await service.searchRecipesWithoutIngredients(orderBy, orderDirection, searchTerm);
            break;
          default:
            return {
              __typename: "errorMessage",
              success: false,
              message: "Tipo de filtro no reconocido.",
            };
        }

        return response.success
          ? {
              __typename: "getRecipesByUser",
              success: true,
              recipes: response.message,
            }
          : {
              __typename: "errorMessage",
              success: false,
              message: response.message,
            };
      } catch (error) {
        return {
          __typename: "errorMessage",
          success: false,
          message: error.message,
        };
      }
    },

    // otros resolvers que ya tenés
    getRecipeFromList: async (_, {}, context) => {
      try {
        const { informationToken } = context;
        const response = await service.getRecipeFromList(informationToken.nickName);
        return response.success
          ? {
              __typename: "getRecipesByUser",
              success: response.success,
              recipes: response.message,
            }
          : {
              __typename: "errorMessage",
              success: response.success,
              message: response.message,
            };
      } catch (error) {
        return {
          __typename: "errorMessage",
          success: false,
          message: error.message,
        };
      }
    },

    showRecipeDetailsFromList: async (_, { id }, context) => {
      try {
        const { informationToken } = context;
        const response = await service.showRecipeDetailsFromList(id, informationToken.nickName);
        return response.success
          ? {
              __typename: "showDetails",
              success: response.success,
              recipe: response.message,
            }
          : {
              __typename: "recipeErrorMessage",
              success: false,
              message: response.message,
            };
      } catch (error) {
        return {
          __typename: "recipeErrorMessage",
          success: false,
          message: error.message,
        };
      }
    },

    existRecipeInList: async (_, { id }, context) => {
      try {
        const { informationToken } = context;
        return await service.existRecipeInList(id, informationToken.nickName);
      } catch (error) {
        return { success: false, message: error.message };
      }
    },
  },

  Mutation: {
    addRecipeToList: async (_, { recipe }, context) => {
      try {
        const { informationToken } = context;
        const newRecipe = {
          nickName: informationToken.nickName,
          recipeId: recipe.recipeId,
          portions: recipe.portions,
          name: recipe.name,
          image: recipe.image,
          description: recipe.description,
          ingredients: recipe.ingredients,
          steps: recipe.steps,
          typeOfDish: recipe.typeOfDish,
          difficulty: recipe.difficulty,
          typeOfDiet: recipe.typeOfDiet,
          time: recipe.time,
        };

        return await service.addRecipeToList(newRecipe);
      } catch (error) {
        return { success: false, message: error.message };
      }
    },

    deleteRecipeFromList: async (_, { id }) => {
      try {
        return await service.deleteRecipeFromList(id);
      } catch (error) {
        return { success: false, message: error.message };
      }
    },
  },

  recipeDetailsMessage: {
    __resolveType(obj) {
      return obj.__typename;
    },
  },
};

module.exports = resolvers;
