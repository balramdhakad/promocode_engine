export const requestBodyExtractor = (incomingObj, allowedFields) => {
  const params = {};
  for (const field of allowedFields) {
    if (
      Object.prototype.hasOwnProperty.call(incomingObj, field) &&
      incomingObj[field] !== undefined
    ) {
      params[field] = incomingObj[field];
    }
  }

  return params;
};

export const toDate = (value) => (value ? new Date(value) : undefined);