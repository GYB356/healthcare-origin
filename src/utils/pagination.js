export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

export const paginate = (query, page = 1, pageSize = DEFAULT_PAGE_SIZE) => {
  const limit = Math.min(pageSize, MAX_PAGE_SIZE);
  const offset = (page - 1) * limit;

  return {
    ...query,
    limit,
    offset,
  };
};

export const createPaginationResponse = (data, total, page, pageSize) => {
  const totalPages = Math.ceil(total / pageSize);

  return {
    data,
    pagination: {
      total,
      totalPages,
      currentPage: page,
      pageSize,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
};

// Pagination middleware for API routes
export const withPagination = (handler) => {
  return async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || DEFAULT_PAGE_SIZE;

    // Add pagination to request
    req.pagination = {
      page,
      pageSize,
    };

    // Store original json method
    const originalJson = res.json;

    // Override json method to handle pagination
    res.json = function (data, total) {
      const response = createPaginationResponse(data, total, page, pageSize);
      return originalJson.call(this, response);
    };

    return handler(req, res);
  };
}; 