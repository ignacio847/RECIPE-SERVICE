const Recipe = require("../model/recipe");
const Voter = require("../model/voterPersistence");
const RecipeList = require("../model/recipeList");
const RecipeFavorite = require("../model/favoriteList");
const search = require("../util/ingredientSearch");
const Interests = require("../model/interests");

const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const updateLoadRecipe = async (recipe) =>{
    try{
    const response = await Recipe.findOneAndUpdate(
        { nickName: recipe.nickName, name: recipe.name }, 
        { $set:{ ...recipe,approved:false }},
        { new: true, upsert: false } 
    );

    return response 
    ? {success:true,message:"receta actualizada exitosamente."}
    : {success:false, message:"no se pudo actualizar la receta"};

    }catch(error){
        return {success:false,message:error}
    }
};

const replaceRecipe = async (recipe) =>{
    try{
      recipe.approved = false;
        const response = await Recipe.findOneAndReplace(
            { nickName: recipe.nickName, name: recipe.name }, 
            recipe, 
            { new: true, upsert: false }
        );
        return response 
        ? {success:true,message:"receta reemplazada exitosamente."}
        : {success:false, message:"no se pudo reemplazar la receta."};
    }catch(error){
        return {success:false, message:error}
    }
};

const createRecipe = async (recipe) =>{
    try{
        const response = await Recipe.create(recipe);
        return response 
        ? {success:true, message:"receta creada exitosamente."}
        :{success:false, message:"no se pudo crear la receta."};
    }catch(error){
        return {success:false, message:error};
    }
};

const getMadeRecipesByUser = async (nickName) =>{
    try{
        const response = await Recipe.find({nickName}).select("_id name image description ");
        console.log(response)
        return response ? {success:true, message:response} : {success:false, message:"lista vacia."};
    }catch(error){
        return {success:false, message:error.message}
    }
};

const showRecipeDetails = async (_id, nickName) => {
    try{
        const isMaker = await Recipe.findOne({_id,nickName});
        if(isMaker){
            const response = await Recipe.findOne({_id})
            .select("_id name image description ingredients steps typeOfDish numberOfStart difficulty typeOfDiet portions time approved");
        return response ? {success: true, message:response}:{success:false, message:"el detalle de la receta no pudo ser encontro."};
        }else{
            const approved = await Recipe.findOne({_id}).select("approved"); 
            if(approved.approved){
                const response = await Recipe.findOne({_id})
                .select("_id nickName name image description ingredients steps typeOfDish difficulty typeOfDiet numberOfStart portions time");
                console.log(response)
                return response ? {success: true, message:response}:{success:false, message:"el detalle de la receta no pudo ser encontro."};
            }else{
                return {success:false, message:"el usuario no tiene permisos para ver la receta."}
            }
        }
        
    }catch(error){
        return {success:false, message:error.message};
    }
};

const makeAVote = async (vote) => {
    try{
        const recipe = await Recipe.findOne({_id:vote.recipeId});
        if(!recipe)
            return {success:false, message:"la receta no pudo ser encontrada."};
        const existVote = await Voter.findOne({recipeId:vote.recipeId, nickName:vote.nickName});
        if(existVote)
            return {success:false,message:"el usuario no puede tener mas de un voto."};
        const response = Voter.create(vote);
        return response ? {success:true, message:"voto hecho exitosamente."}:{success:false, message:"el voto no pudo ser hecho."}
    }catch(error){
        return {success:false, message:error.message};
    }
};

const showVoteNotApproved = async () => {
    try{
        const response = await Voter.find({approved:false}).select(" _id nickName stars description date");
        console.log(response)
        return response.length > 0 ? {success:true, message:response} :{success:false, message:"lista vacia."}; 
    }catch(error){
        return {success:false, message:error.message};
    }
};

const approveVotes = async (_id,accept) => {
    try {
        const vote = await Voter.findOne({ _id}).select("recipeId stars approved");
        if (!vote)
            return { success: false, message: "el voto no pudo ser encontrado." };

        const recipe = await Recipe.findOne({ _id: vote.recipeId });
        if (!recipe)
            return { success: false, message: "la receta no pudo ser encantrada." };
        if(accept){

            const { numberOfStart, numberOfVoters } = recipe;
            const newVote = vote.stars;

            const newVoters = numberOfVoters + 1;

            recipe.numberOfStart = ((numberOfStart * numberOfVoters) + newVote) / newVoters;
            recipe.numberOfVoters = newVoters;

            await recipe.save();

            vote.approved = true;
            await vote.save();
            return { success: true, message: "las estrellas de la receta y el voto fueron actualizados." };
        }else{
            await Voter.deleteOne({_id});
            return { success: true, message: "la aprobacion del voto fue modificado." };
        }

    } catch (error) {
        return { success: false, message: error.message };
    }
};

const updateRecipe = async (recipe) =>{
    try{
        const { _id, ...safeData } = recipe;
        const exists = await Recipe.findOne({
            name: recipe.name,
            _id: { $ne: _id }  
          });     
        if(exists)     
            return {success:false, message:"La receta ya existe con ese nombre."};
        const response = await Recipe.findOneAndReplace({ _id }, safeData, {
            returnDocument: "after", 
            runValidators: true
          });
        return response 
        ? {success:true, message:"la receta fue actualizada exitosamente."} 
        : {success:false, message:"no se pudo actualizar la receta."}

    }catch(error){
        return {success:false,message:error.message};
    }
};

const deleteRecipe = async (id, nickName) =>{
    try{
        const validRecipe = await Recipe.findOne({_id:id,nickName:nickName});
        if (!validRecipe)
            return {success:false, message:"no existe la receta o no es del usuario."};
        await RecipeList.deleteMany({recipeId:id});
        await Voter.deleteMany({recipeId:id})
        const recipeDelete = await Recipe.findOneAndDelete({_id:id});
       
        return recipeDelete 
        ? {success:true, message:"la receta fue eliminada exitosamente."}
        :{success:false, message:"no se pudo eliminar la receta."}

    }catch(error){
        return {success:false, message:error.message};
    }
};

const addRecipeToList = async (recipe) => {
    try {
        const recipeExist = await Recipe.findOne({ _id: recipe.recipeId }).select("approved");
        if (!recipeExist || !recipeExist.approved) {
            return { success: false, message: "la receta no existe o no esta aprobada." };
        }

        const cantidadDeDocumentos = await RecipeList.countDocuments();
        if (cantidadDeDocumentos >= 10) {
            return { success: false, message: "limite de recetas superado." };
        }

        const response = await RecipeList.create(recipe);
        return response
            ? { success: true, message: "la receta se egrego a la lista exitosamente." }
            : { success: false, message: "a receta no se pudo agregar a la lista." };

    } catch (error) {
        return { success: false, message: error.message || "Unexpected error occurred." };
    }
};
const getPortionAndIngredientsFromRecipe = async (_id) => {
    try {
      const recipe = await Recipe.findById(_id).select("portions ingredients");
  
      if (!recipe) {
        return { success: false, message: "La receta no pudo ser encontrada." };
      }
  
      const plainIngredients = recipe.ingredients.map(i => i.toObject());
  
      return {
        success: true,
        message: {
          portions: recipe.portions,
          ingredients: plainIngredients
        }
      };
    } catch (error) {
      return { success: false, message: error };
    }
  };
  
  const updateVote = async (_id, stars,description) => {
    try {
      const vote = await Voter.findOne({ _id }).select("recipeId stars");
      if (!vote)
        return { success: false, message: "El voto no pudo ser encontrado." };
  
      const recipe = await Recipe.findOne({ _id: vote.recipeId }).select("numberOfStart numberOfVoters");
      if (!recipe)
        return { success: false, message: "La receta no pudo ser encontrada." };
  
      const otherVotes = await Voter.find({
        recipeId: vote.recipeId,
        approved: true,
        _id: { $ne: vote._id }
      }).select('stars');
  
      const totalStars = otherVotes.reduce((sum, v) => sum + v.stars, 0);
  
      const newAverage = recipe.numberOfVoters > 1
        ? totalStars / (recipe.numberOfVoters - 1)
        : 0;
  
      recipe.numberOfStart = newAverage;
      recipe.numberOfVoters = Math.max(0, recipe.numberOfVoters - 1); // si era el único voto
  
      vote.stars = stars;
      vote.description = description;
      vote.approved = false;
  
      await recipe.save();
      await vote.save();
  
      return { success: true, message: "Voto actualizado. Se requiere nueva aprobación para incluirlo en el promedio." };
  
    } catch (error) {
      return { success: false, message: error.message };
    }
  };
  
const deleteVote = async (_id) => {
    try {
        const vote = await Voter.findOne({ _id:_id, approved: true }).select("recipeId stars");
        if (!vote) {
            return { success: false, message: "el voto no fue encontrado o no fue aprobado." };
        }

        const recipe = await Recipe.findOne({ _id: vote.recipeId }).select("numberOfStart numberOfVoters");
        if (!recipe) {
            return { success: false, message: "receta no encontrada." };
        }

        const newNumberOfVoters = recipe.numberOfVoters - 1;

        if (newNumberOfVoters > 0) {
            const newTotalStars = (recipe.numberOfStart * recipe.numberOfVoters) - vote.stars;
            recipe.numberOfStart = newTotalStars / newNumberOfVoters;
            recipe.numberOfVoters = newNumberOfVoters;
        } else {
            recipe.numberOfStart = 0;
            recipe.numberOfVoters = 0;
        }

        await Voter.deleteOne({ _id: vote._id });
        await recipe.save();

        return { success: true, message: "el voto fue eliminado y la receta fue actualizada exitosamente." };
    } catch (error) {
        return { success: false, message: error.message };
    }
};

const showRecipeNotApproved = async () => {
    try{
        const response = await Recipe.find({approved:false}).select("_id name nickName image description ingredients steps typeOfDish difficulty typeOfDiet numberOfStart portions time");
        return response.length > 0 ? {success:true, message:response}:{success:false, message:"lista vacia."};
    }catch(error){
        return {success:false, message:error.message};
    }
};

const approveRecipes = async (_id,accept) =>{
    try{
        const recipe = await Recipe.findOne({_id}).select("approved");
        if(!recipe || recipe.approved) 
            return {success:false, message:"la receta no pudo ser encontrada o ya esta aprobada."};
        if(!accept){
            await Recipe.deleteMany({_id});
            return {success:true, message:"la receta fue eliminada exitosamente."};
        }
        recipe.approved = accept;
        await recipe.save();
        return {success:true, message:"la receta fue aprobada exitosamente."};

    }catch(error){
        return {success:false, message:error.message};
    }
};
 
const showVotes = async (_id, nickName) => {
    try {
        const recipe = await Recipe.findById(_id);
        if (!recipe)
            return { success: false, message: "la receta no pudo ser encontrada." };

        const userVote = await Voter.findOne({ recipeId: _id, nickName,approved:true }).select("_id nickName stars description date");

        const otherVotes = await Voter.find({ recipeId: _id, nickName: { $ne: nickName },approved:true }).sort({date:-1}).select("nickName stars description date");

        if (!userVote && otherVotes.length === 0)
            return { success: false, message: "no hay valoraciones." };

        const allVotes = userVote ? [userVote, ...otherVotes] : otherVotes;

        return {
            success: true,
            votes: allVotes,
            userHasVoted: !!userVote
        };

    } catch (error) {
        return { success: false, message: error.message };
    }
};

const getRecipeFromList = async (nickName) => {
    try{
        const response = await RecipeList.find({nickName}).select("recipeId nickName name image description numberOfStart");
        console.log("porcion" ,response.portions)
        if (!response || response.length === 0) {
            return { success: false, message: "lista vacia." };
          }
          return { success: true, message: response };          
    }catch(error){
        return {success:false, message:error.message};
    }
};

const showRecipeDetailsFromList = async (recipeId, nickName) => {
    try{
        const response = await RecipeList.findOne({recipeId,nickName})
        .select("recipeId name image description ingredients steps typeOfDish difficulty typeOfDiet numberOfStart portions time ");
        console.log(response)
        return response ? {success:true, message:response}:{success:false, message:"la receta no pudo ser encontrada."}
    }catch(error){
        return {success:false, message:error.message};
    }
}

const existRecipeInList = async (recipeId, nickName) =>{
    try{
        const response = await RecipeList.findOne({recipeId,nickName});
        return response ? {success:true, message:"la receta existe en la lista."}
        :{success:false, message:"la receta no existe en la lista."}
    }catch(error){
        return {success:false, message:error.message};
    }
};

const deleteRecipeFromList = async (recipeId) =>{
    try{
        const response = await RecipeList.findOne({recipeId:recipeId}).select("_id");
        if(!response)
            return {success:false, message:"no se pudo encontrar la receta."};
        await RecipeList.deleteMany({_id:response._id});
        return {success:true, message:"receta eliminada de la lista exitosamente."};
    }catch(error){
        return {success:false, message:error.message};
    }
};

const searchRecipesWithIngredients = async (searchText) => {
  try {
    const ingredients = search.extractIngredients(searchText);

    if (ingredients.length === 0) {
      // No hay ingredientes, devuelve todo o vacio según necesites
      return { success: false, message: "no se encontraron resultados." };
    }

    const filter = {approved:true,
      $and: ingredients.map(ing => ({
        ingredients: {
          $elemMatch: {
            $or: [
              { name: { $regex: `^${ing}$`, $options: "i" } }, // exacta
              { name: { $regex: ing, $options: "i" } }        // parcial
            ]
          }
        }
      }))
    };

    const recipes = await Recipe.find(filter)
      .select("_id nickName name image description numberOfStart creationDate")
      .sort({ name: 1 });

    const recipesWithStringDate = recipes.map(r => ({
      ...r.toObject(),
      creationDate: r.creationDate.toISOString()
    }));

    return recipesWithStringDate.length > 0
      ? { success: true, message: recipesWithStringDate }
      : { success: false, message: "no se encontraron resultados." };

  } catch (error) {
    return { success: false, message: error.message };
  }
};

const searchRecipesWithoutIngredients = async (searchText) => {
  try {
    const ingredients = search.extractIngredients(searchText);

    if (ingredients.length === 0) {
      return { success: false, message: "no se encontraron resultados." };
    }

    const filter = {approved:true,
      $nor: ingredients.map(ing => ({
        "ingredients.name": {
          $regex: ing, $options: "i"
        }
      }))
    };

    const recipe = await Recipe.find(filter)
      .select("_id nickName name image description numberOfStart creationDate")
      .sort({ name: 1 });

    const recipeWithStringDate = recipe.map(r => ({
      ...r.toObject(),
      creationDate: r.creationDate.toISOString()
    }));

    return recipeWithStringDate.length > 0
      ? { success: true, message: recipeWithStringDate }
      : { success: false, message: "no se encontraron resultados." };

  } catch (error) {
    return { success: false, message: error.message };
  }
};

const searchRecipeByNickName = async (searchText) => {
  try {
    const recipes = await Recipe.find({approved:true,
      nickName: { $regex: new RegExp(`^${searchText}$`, 'i') }
    })
      .select("_id name image description numberOfStart creationDate")
      .sort({ "name": 1 });

    const recipesWithStringDate = recipes.map(r => ({
      ...r.toObject(),
      creationDate: r.creationDate.toISOString()
    }));

    return recipesWithStringDate.length > 0
      ? { success: true, message: recipesWithStringDate }
      : { success: false, message: "no se encontraron resultados." };

  } catch (error) {
    return { success: false, message: error.message };
  }
};

const searchByType = async (searchText) => {
  try {
    const recipes = await Recipe.find({approved:true,
      typeOfDish: { $regex: new RegExp(`^${searchText}$`, 'i') }
    })
      .select("_id nickName name image description numberOfStart creationDate")
      .sort({ "name": 1 });

    const recipesWithStringDate = recipes.map(r => ({
      ...r.toObject(),
      creationDate: r.creationDate.toISOString()
    }));

    return recipesWithStringDate.length > 0
      ? { success: true, message: recipesWithStringDate }
      : { success: false, message: "no se encontraron resultados." };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const searchByName = async (searchText) => {
  try {
    let recipes = await Recipe.aggregate([
      { $match: { name: searchText,approved:true} },
      { $group: { _id: "$name", doc: { $first: "$$ROOT" } } },
      { $replaceRoot: { newRoot: "$doc" } },
      { $sort: { name: 1 } },
      { $project: { _id: 1, nickName: 1, name: 1, image: 1, description: 1, numberOfStart: 1, creationDate: 1 } }
    ]);

    if (recipes.length === 0) {
      recipes = await Recipe.aggregate([
        { $match: { name: { $regex: searchText, $options: 'i' },approved:true } },
        { $group: { _id: "$name", doc: { $first: "$$ROOT" } } },
        { $replaceRoot: { newRoot: "$doc" } },
        { $sort: { name: 1 } },
        { $project: { _id: 1, nickName: 1, name: 1, image: 1, description: 1, numberOfStart: 1, creationDate: 1 } }
      ]);
    }

    const recipesWithStringDate = recipes.map(r => ({
      ...r,
      creationDate: r.creationDate.toISOString()
    }));

    return recipesWithStringDate.length > 0
      ? { success: true, message: recipesWithStringDate }
      : { success: false, message: "No se encontraron resultados." };

  } catch (error) {
    return { success: false, message: error.message };
  }
};

const addRecipeToFavorite = async (_id, nickName) =>{
    try{
        const exist = await RecipeFavorite.findOne({recipeId:_id, nickName:nickName});
        if(exist)
            return {success:false, message:"la receta ya existe en la lista de favoritos"}
        const response = await RecipeFavorite.create({recipeId:_id,nickName:nickName});

        return response 
        ? {success:true, message:"la receta se agrego a la lista de favoritos."}
        :{success:false, message:"no se pudo agregar la receta a lista de favoritos"};

    }catch(error){
        return {success:false, message:error.message};
    }
};

const deletefromFavorite = async (recipeId, nickName) =>{
    try{
        const exist = await RecipeFavorite.findOne({recipeId,nickName}).select("_id");
        if(!exist)
            return {success:false, message:"no se pudo encontrar la receta en la lista de favoritos."};
        const response = await RecipeFavorite.deleteOne({_id:exist._id});
        return response 
        ? {success:true, message:"se elimino la receta de la lista de favoritos."}
        : {success:false, message:"no se pudo eliminar la receta de lista de favoritos."};
    }catch(error){
        return {success:false, message:error.message};
    }
};

const existRecipeInFavorite = async (_id, nickName) =>{
    try{
        const response = await RecipeFavorite.findOne({recipeId:_id, nickName:nickName});
        return response 
        ? {success:true, message:"la receta ya existe en la lista de favoritos"}
        :{success:false, message:"la receta no existe en la lista de favoritos."};

    }catch(error){
        return {success:false, message:error.message};
    }
};

const getRecipeFromFavorites = async (nickName) => {
    try{
        const favoriteList = await RecipeFavorite.find({nickName}).select("recipeId");
        const recipeIds = favoriteList.map(f => f.recipeId);
        const recipes = await Recipe.find({ _id: { $in: recipeIds } })
        .select('_id nickName name description');
        return recipes.length > 0 ? {success:true, message:recipes}:{success:false, message:"la lista esta vacia."};

    }catch(error){
        return {success:false, message:error.message}
    }
};

const getRecipeByUser = async (nickName) =>{
    try{
        const recipes = await Recipe.find({nickName}).select("_id name image numberOfStart");
        return recipes ? {success:true,message:recipes}:{success:false,message:"lista vacia."}
    }catch(error){
        return {success:false, message:error.message}
    }
};

const addInterests = async (nickName,interests) =>{
    try{
        const existInterests = await Interests.findOne({nickName});
        if(existInterests)
            return {success:false, message:"no se pudo cargar los intereses."};
        const response = await Interests.create(interests);
        return response ? {success:true, message:"intereses agregados exitosamente."}:{success:false, message:"no se pudo agregar los intereses"};
    }catch(error){
        return {success:false, message:message.error};
    }
};

const updateInterests = async (nickName, interests) =>{
    try{
        const existInterests = await Interests.findOne({nickName});
        if(!existInterests)
            return {success:false, message:"no existen intereses previamente cargados."};
        const { ability,typeOfDish, diet, intolerances, timeSpent } = interests;
        const response = await Interests.updateMany(
            {nickName:nickName},
            {
                $set:{
                    ability,
                    typeOfDish,
                    diet,
                    intolerances,
                    timeSpent:{
                        initial:timeSpent.initial,
                        end:timeSpent.end
                    }
                }
            });
        return response ? {success:true, message:"intereses actualizados correctamente."}:{success:false, message:"no se pudieron actualizar los intereses."};
    }catch(error){
        return {success:false.valueOf, message:error.message};
    }
};

const showLastThreeRecipes = async () => {
  try {
    const response = await Recipe.find({ approved: true })
    .sort({ creationDate: -1 }) 
    .select("_id image")
    .limit(3);
    console.log(response)
    return response.length > 0
      ? { success: true, title: "Últimas recetas compartidas.", recipes: response }
      : { success: false, message: "No se encontraron recetas." };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const showForTimeSpent = async (nickName) => {
  try {
    const interests = await Interests.findOne({ nickName }).select("intolerances timeSpent.initial timeSpent.end");

    let intolerances = [];
    let initial = 0;
    let end = 9999;

    if (interests && interests.timeSpent) {
      intolerances = interests.intolerances || [];
      initial = interests.timeSpent.initial;
      end = interests.timeSpent.end;
    }

    let recipe = await Recipe.findOne({approved:true,
      ingredients: { $not: { $elemMatch: { name: intolerances } } },
      time: { $gte: initial, $lte: end }
    }).select("_id image time");

    if (!recipe) {
      recipe = await Recipe.findOne({approved:true}).sort({ _id: -1 }).select("_id image time");
    }

    if (!recipe) {
      return { success: false, message: "No se encontraron recetas." };
    }

    let title;
    if (recipe.time < 15) {
      title = "Menos de 15 minutos";
    } else if (recipe.time >= 15 && recipe.time <= 45) {
      title = "Entre 15 y 45 minutos";
    } else {
      title = "Más de 45 minutos";
    }

    return { success: true, title, recipe };

  } catch (error) {
    return { success: false, message: error.message };
  }
};

const showForDiet = async (nickName) => {
  try {
    const interests = await Interests.findOne({ nickName }).select("intolerances diet");

    let intolerances = [];
    let diet;

    if (interests) {
      intolerances = interests.intolerances || [];
      diet = interests.diet;
    }

    const dietFilter = diet
      ? { diet: { $regex: `.*${escapeRegex(diet)}.*`, $options: "i" } }
      : {};

    let recipe = await Recipe.findOne({
      approved: true,
      ingredients: {
        $not: {
          $elemMatch: {
            name: { $in: intolerances }
          }
        }
      },
      ...dietFilter
    }).select("_id image typeOfDiet");

    if (!recipe) {
      recipe = await Recipe.findOne({ approved: true }).sort({ _id: -1 }).select("_id image typeOfDiet");
    }

    if (!recipe) {
      return { success: false, message: "No se encontraron recetas." };
    }

    const title = "Dieta " + recipe.typeOfDiet;

    return { success: true, title, recipe };

  } catch (error) {
    return { success: false, message: error.message };
  }
};

const showForAbility = async (nickName) => {
  try {
    const interests = await Interests.findOne({ nickName }).select("intolerances ability");
    let recipe;
    if(interests){
    const intolerance = interests.intolerances; 
    const ability = interests.ability; 
    const difficultyFilter = ability ? { difficulty: new RegExp(`^${ability}$`, 'i') } : {};

      recipe = await Recipe.findOne({
      approved: true,
      ingredients: {
        $not: {
          $elemMatch: {
            name: { $regex: intolerance, $options: "i" }
          }
        }
      },
      ...difficultyFilter
    }).select("_id image difficulty");
    }
   
    if (!recipe) {
      recipe = await Recipe.findOne({ approved: true }).sort({ _id: -1 }).select("_id image difficulty");
    }

    if (!recipe) {
      return { success: false, message: "No se encontraron recetas." };
    }

    const title = "Dificultad " + recipe.difficulty;

    return { success: true, title, recipe };

  } catch (error) {
    return { success: false, message: error.message };
  }
};

const showForTypeOfDish = async (nickName) => {
  try {
    const interests = await Interests.findOne({ nickName }).select("intolerances typeOfDish");
    let recipe;

    if (interests) {
      const intolerance = interests.intolerances;
      const typeOfDish = interests.typeOfDish;

      const typeOfDishFilter = typeOfDish
        ? { typeOfDish: { $regex: `.*${escapeRegex(typeOfDish)}.*`, $options: "i" } }
        : {};

      recipe = await Recipe.findOne({
        approved: true,
        ingredients: {
          $not: {
            $elemMatch: {
              name: { $regex: intolerance, $options: "i" }
            }
          }
        },
        ...typeOfDishFilter
      }).select("_id image typeOfDish");
    }

    if (!recipe) {
      recipe = await Recipe.findOne({ approved: true }).sort({ _id: -1 }).select("_id image typeOfDish");
    }

    if (!recipe) {
      return { success: false, message: "No se encontraron recetas." };
    }

    const title = "Tipo de Plato " + recipe.typeOfDish;

    return { success: true, title, recipe };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const existRecipeByName = async (nickName,name) =>{
  try{
    const response = await Recipe.findOne({nickName:nickName,name:name}).select("_id name nickName image description ingredients steps typeOfDish difficulty typeOfDiet portions time");
    console.log(response, name, nickName)
    return response ? {success:true,recipe:response,message:"existe la receta"}:{success:false,recipe:{name,nickName},message:"la receta no existe"}
  }catch(error){
    return {success:false,message:error.message}
  }
};

const existNameForUpdate = async (_id,name,nickName) =>{
  try{
    const response = await Recipe.findOne({nickName:nickName,name:name,_id:_id})
    return response ? {success:false,message:"es la misma receta"}:{success:false,message:"la receta ya existe."};
  }catch(error){
    return {success:false,message:error.message}
  }
};
       
const getInterests = async (nickName) =>{
  try{
    const response = await Interests.findOne({nickName}).select("ability typeOfDish diet intolerances timeSpent");
    return response ? {success:true, message:"se encontraron los intereses",interests:response}:{success:false,message:"no se encontraron intereses"};
  }catch(error){
    return {success:false, message:error.message}
  }
};

module.exports = { 
    updateLoadRecipe,
    replaceRecipe,
    createRecipe,
    getMadeRecipesByUser,
    showRecipeDetails,
    makeAVote,
    showVoteNotApproved,
    approveVotes,
    updateRecipe,
    deleteRecipe,
    addRecipeToList,
    getPortionAndIngredientsFromRecipe,
    updateVote,
    deleteVote,
    showRecipeNotApproved,
    approveRecipes,
    showVotes,
    getRecipeFromList,
    showRecipeDetailsFromList,
    existRecipeInList,
    deleteRecipeFromList,
    searchRecipesWithIngredients,
    searchRecipesWithoutIngredients,
    searchRecipeByNickName,
    searchByType,
    searchByName,
    addRecipeToFavorite,
    deletefromFavorite,
    existRecipeInFavorite,
    getRecipeFromFavorites,
    getRecipeByUser,
    addInterests,
    updateInterests,
    showLastThreeRecipes,
    showForTimeSpent,
    showForDiet,
    showForAbility,
    showForTypeOfDish,
    existRecipeByName,
    existNameForUpdate,
    getInterests
};