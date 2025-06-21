const service = require("../../service/service");

const resolvers = {
  Query: {
    home: async (_, {}, context) => {
      try {
        if (context) {
          const { informationToken } = context;
          console.log(informationToken)

          const lastThreeRecipes = await service.showLastThreeRecipes();
          const diet = await service.showForDiet(informationToken.nickName);
          const timeSpent = await service.showForTimeSpent(informationToken.nickName);
          const ability = await service.showForAbility(informationToken.nickName);
          console.log(lastThreeRecipes,diet,timeSpent,ability)
          return {
            __typename: "homeMessageSuccess",
            lastThreeRecipes,
            diet,
            timeSpent,
            ability
          };
        }
      } catch (error) {
        return {
          __typename: "errorHomeMessage",
          success: false,
          message: error.message
        };
      }
    }
  },
  homeMessage: {
    __resolveType(obj) {
      return obj.__typename;
    }
  }
};

module.exports = resolvers;
