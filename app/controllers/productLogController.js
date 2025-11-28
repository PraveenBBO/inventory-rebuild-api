const AsyncHandler = require('@utils/AsyncHandler');
const { sendSuccess, sendError } = require('@utils/responseHandler');
const { getLogsByProductId } = require('@services/productLogService');

// GET /api/product-log/:productId
exports.getByProduct = AsyncHandler(async (req, res) => {
  const productId = parseInt(req.params.productId, 10);
  if (!productId || Number.isNaN(productId)) {
    return sendError(res, 'Invalid product id', 422);
  }

  const { is_for } = req.query;
  const allowedRegion = ['usa', 'china'];
  const options = {};
  if (is_for) {
    if (!allowedRegion.includes(is_for)) {
      return sendError(res, 'Invalid is_for value', 422);
    }
    options.is_for = is_for;
  }

  // Pagination params
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  if (page < 1 || limit < 1) {
    return sendError(res, 'page and limit must be positive integers', 422);
  }
  options.page = page;
  options.limit = limit;

  const result = await getLogsByProductId(productId, options);
  return sendSuccess(res, result);
});
