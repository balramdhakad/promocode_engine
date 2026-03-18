export const requestBodyExtractor = (incomingObj, allowedFields) => {
  let params = {};
  for (let field of allowedFields) {
    if (incomingObj[field]) {
      params[field] = incomingObj[field];
    }
  }

  return params
};
