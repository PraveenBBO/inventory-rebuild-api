const { ProductLog } = require('@models');
const { ensureActor, getActor } = require('@utils/actor');

/**
 * Create a product log entry
 * @param {Object} payload
 * @param {number} payload.product_id
 * @param {string} payload.action
 * @param {string} [payload.detail]
 * @param {('usa'|'china')} payload.is_for
 */
const createLog = async (payload = {}, options = {}) => {
  const { product_id, action, detail = null, is_for } = payload;
  if (!product_id) throw new Error('product_id is required');
  if (!action) throw new Error('action is required');
  if (!is_for) throw new Error('is_for is required');

  // Resolve actor and safely derive created_by
  await ensureActor();
  const actor = getActor();
  const created_by = (actor && (actor.name || actor.email)) ? (actor.name || actor.email) : 'system';

  const createOptions = {};
  if (options.transaction) createOptions.transaction = options.transaction;

  return await ProductLog.create({ product_id, action, detail, is_for, created_by }, createOptions);
};

const getLogsByProductId = async (productId, options = {}) => {
  if (!productId) throw new Error('productId is required');
  const { page = 1, limit = 10, is_for } = options;
  const where = { product_id: productId };
  if (is_for) where.is_for = is_for;

  const offset = (page - 1) * limit;
  const { count, rows } = await ProductLog.findAndCountAll({
    where,
    order: [['createdAt', 'DESC']],
    offset,
    limit,
  });

  return {
    total: count,
    page,
    pageSize: limit,
    logs: rows,
  };
};

module.exports = {
  createLog,
  getLogsByProductId,
};
