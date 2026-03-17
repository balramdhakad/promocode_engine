export const sendResponse = (
  res,
  { statusCode = 200, message = null, data = null },
) => {
  const response = { success: true };

  if (data) response.data = data;
  if (message) response.message = message;

  res.status(statusCode).json(response);
};

export const sendResponseWithPagination = (res, { data, pagination }) => {
  const { page = 1, limit = 10, total = 0 } = pagination;

  const totalPages = Math.ceil(total / limit);

  res.status(200).json({
    success: true,
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  });
};
