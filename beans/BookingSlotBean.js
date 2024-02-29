const {
  BookingSlot,
  BusinessUser,
  BusinessUserPet,
  Booking,
} = require("../mongoose/models");
const moment = require("moment");

const getBookingSlots = async (
  pageSize,
  page,
  business,
  tense,
  service = null,
  user = null,
  availableOnly = false
) => {
  let sort = {
    start_time: "desc",
  };
  let where = {
    business,
  };
  let businessUser;
  if (user) {
    businessUser = await BusinessUser.findOne({ user })
      .populate("businessUserPets")
      .exec();
    let businessUserPets = await BusinessUserPet.find({
      businessUser,
    }).exec();
    let bookings = await Booking.find({
      businessUserPet: { $all: businessUserPets },
    }).exec();
    if (businessUser) {
      where.bookings = { $nin: bookings };
    }
  }
  if (availableOnly) {
    where.spaces_left = { $gt: 0 };
  }
  if (service) {
    where.service = service;
  }
  switch (tense) {
    case "future":
      where.end_time = { $gte: moment() };
      sort.start_time = "asc";
      break;
    case "past":
      where.start_time = { $lt: moment() };
      break;
  }
  let query = BookingSlot.find(where)
    .sort(sort)
    .populate([
      "service",
      {
        path: "bookings",
        populate: {
          path: "businessUserPet",
          select: "businessUser",
          populate: {
            path: "businessUser",
            select: "user",
            populate: { path: "user", select: "username" },
          },
        },
      },
    ]);
  if (pageSize && pageSize > 0) {
    query = query.limit(pageSize);
    if (page) {
      query = query.skip(pageSize * page);
    }
  }
  const bookingSlotCount = await BookingSlot.countDocuments(where).exec();
  const bookingSlots = await query.exec();
  const pages = pageSize ? Math.max(bookingSlotCount / pageSize, 1) : 1;
  return {
    bookingSlots,
    pages,
    results: bookingSlotCount,
  };
};

const getBookingRequests = async (business, user) => {
  if (String(business.owner) !== String(user._id)) {
    return [];
  }
  let bookingRequests = await Booking.find({
    business,
    status: "PENDING",
    // end_time: { $gte: moment().startOf("day") },
  })
    .populate([
      { path: "bookingSlot", populate: "service" },
      {
        path: "businessUserPet",
        populate: {
          path: "pet",
          populate: "owner",
        },
      },
    ])
    .sort({
      start_time: "asc",
    });
  return bookingRequests;
};

module.exports = { getBookingSlots, getBookingRequests };
