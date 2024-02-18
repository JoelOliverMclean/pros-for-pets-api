const { Business } = require("../mongoose/models");
const moment = require("moment");

const getBusinesses = async (pageSize, page, searchTerm) => {
  let where = {
    approved: true,
  };
  if (searchTerm && searchTerm.length > 0) {
    where.name = {
      $regex: ".*" + searchTerm + ".*",
      $options: "i",
    };
  }
  let query = Business.find(where);
  if (pageSize && pageSize > 0) {
    query = query.limit(pageSize);
    if (page) {
      query = query.skip(pageSize * page);
    }
  }
  const businessCount = await Business.countDocuments(where).exec();
  const businesses = await query
    .select("id name slug phone email website description")
    .exec();
  const pages = pageSize ? Math.max(businessCount / pageSize, 1) : 1;
  return {
    businesses,
    pages,
    results: businessCount,
  };
};

module.exports = { getBusinesses };
