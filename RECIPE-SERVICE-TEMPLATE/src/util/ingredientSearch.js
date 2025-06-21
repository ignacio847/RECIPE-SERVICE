const connectorsRegex = /\b(y|o|con|sin|de|para|del|la|el|los|las|al)\b|[,.;]/gi;

const extractIngredients = (text) => {
  const normalized = text.toLowerCase().trim().replace(connectorsRegex, '|');
  return normalized
    .split('|')
    .map(item => item.trim())
    .filter(item => item.length > 0);
};

const getSortObject = (orderBy = "name", direction = "asc") => {
  const dir = direction === "desc" ? -1 : 1;

  switch (orderBy) {
    case "date":
      return {creationDate: dir };
    case "nickName":
      return { nickName: dir };
    case "name":
    default:
      return { name: dir };
  }
};

module.exports ={
    extractIngredients,
    getSortObject
};