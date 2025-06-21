const calculatePortions = (recipePortions, portion, ingredients) => {
  if (portion <= 0 || !recipePortions || typeof recipePortions !== 'number') {
    return { success: false, message: [] };
  }

  const factor = portion / recipePortions;

  const adjustedIngredients = ingredients
    .map(item => {
      const quantity = parseFloat(item.quantity);
      if (isNaN(quantity)) return null;

      return {
        ...item,
        quantity: parseFloat((quantity * factor).toFixed(2))
      };
    })
    .filter(Boolean); 

  return { success: true, message: adjustedIngredients };
};

const calculatePortionsByIngredient = (recipePortions, portion, ingredients, ingredientName) => {
  try {
    const referenceIngredient = ingredients.find(item => item.name === ingredientName);

    if (!referenceIngredient) {
      return { success: false, message: "ingrediente no encontrado en la receta." };
    }

    const referenceQuantity = parseFloat(referenceIngredient.quantity);

    if (
      portion <= 0 ||
      isNaN(referenceQuantity) ||
      referenceQuantity === 0 ||
      typeof recipePortions !== 'number'
    ) {
      return { success: false, message: "porcion o cantidades invalidas." };
    }

    const factor = portion / referenceQuantity;

    const adjustedIngredients = ingredients
      .map(item => {
        const quantity = parseFloat(item.quantity);
        if (isNaN(quantity)) return null;

        return {
          ...item,
          quantity: parseFloat((quantity * factor).toFixed(2))
        };
      })
      .filter(Boolean);

    const adjustedPortions = parseFloat((recipePortions * factor).toFixed(2));

    if (isNaN(adjustedPortions)) {
      return { success: false, message: "porciones ajustada." };
    }

    return {
      success: true,
      message: {
        newPortions: adjustedPortions,
        ingredients: adjustedIngredients
      }
    };

  } catch (error) {
    return { success: false, message: error.message };
  }
};

module.exports = {
  calculatePortions,
  calculatePortionsByIngredient
};
