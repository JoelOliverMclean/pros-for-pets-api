const {
  BookingSlot,
  BusinessUser,
  BusinessUserPet,
  Booking,
} = require("../mongoose/models");
const moment = require("moment");

const getBookings = async (
  pageSize,
  page,
  businessSlugs,
  tense,
  user,
  service = null,
  payment = null
) => {
  const pipeline = [];
  pipeline.push({
    $match: {
      start_time:
        tense === "PAST" || payment === "OUTSTANDING"
          ? { $lt: moment().toDate() }
          : tense === "FUTURE"
          ? { $gte: moment().toDate() }
          : { $ne: null },
      payment: payment ? payment : { $ne: null },
      status: payment === "OUTSTANDING" ? "CONFIRMED" : { $ne: null },
    },
  });
  pipeline.push({
    $lookup: {
      from: "businessuserpets",
      localField: "businessUserPet",
      foreignField: "_id",
      as: "businessUserPet",
    },
  });
  pipeline.push({
    $lookup: {
      from: "pets",
      localField: "businessUserPet.pet",
      foreignField: "_id",
      as: "businessUserPet.pet",
      pipeline: [
        {
          $lookup: {
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "owner",
            pipeline: [
              {
                $project: {
                  firstname: 1,
                  lastname: 1,
                  username: 1,
                },
              },
            ],
          },
        },
        {
          $project: {
            name: 1,
            owner: 1,
          },
        },
      ],
    },
  });
  pipeline.push({
    $lookup: {
      from: "businesses",
      localField: "business",
      foreignField: "_id",
      as: "business",
      pipeline: [
        {
          $project: {
            name: 1,
            slug: 1,
          },
        },
      ],
    },
  });
  pipeline.push({
    $lookup: {
      from: "bookingslots",
      localField: "bookingSlot",
      foreignField: "_id",
      as: "bookingSlot",
      pipeline: [
        {
          $lookup: {
            from: "services",
            localField: "service",
            foreignField: "_id",
            as: "service",
            pipeline: [
              {
                $project: {
                  name: 1,
                },
              },
            ],
          },
        },
        {
          $project: {
            start_time: 1,
            end_time: 1,
            cost: 1,
            location: 1,
            locationLink: 1,
            info: 1,
            service: 1,
          },
        },
      ],
    },
  });
  pipeline.push({
    $match: {
      "business.slug":
        businessSlugs?.length > 0 ? { $in: businessSlugs } : { $ne: null },
    },
  });
  pipeline.push({
    $match: {
      "businessUserPet.pet.owner.username": user.username,
    },
  });
  pipeline.push({
    $match: {
      "bookingSlot.service._id": service ? service._id : { $ne: null },
    },
  });
  pipeline.push({
    $unwind: "$businessUserPet",
  });
  pipeline.push({
    $unwind: "$bookingSlot",
  });
  pipeline.push({
    $unwind: "$bookingSlot.service",
  });
  pipeline.push({
    $unwind: "$business",
  });
  pipeline.push({
    $unwind: "$businessUserPet.pet",
  });
  pipeline.push({
    $unwind: "$businessUserPet.pet.owner",
  });
  pipeline.push({
    $project: {
      __v: 0,
    },
  });
  let results = await Booking.aggregate([
    ...pipeline,
    {
      $count: "results",
    },
  ]);
  if (results.length == 1) results = results[0].results;
  else results = 0;
  if (pageSize > 0) {
    if (!page) {
      page = 0;
    }
    var skip = page * pageSize;
    pipeline.push({
      $limit: skip + pageSize,
    });
    pipeline.push({
      $skip: skip,
    });
  }
  let bookings = await Booking.aggregate(pipeline);
  return {
    bookings,
    pages: Math.floor(
      Math.max(isNaN(results) ?? 1, 1) /
        Math.max(isNaN(pageSize) ? 1 : pageSize, 1)
    ),
    results: results,
  };
};

const getBookingsAsSlots = async (
  pageSize,
  page,
  businessSlugs,
  tense,
  user,
  service = null
) => {
  const pipeline = [];
  pipeline.push({
    $match: {
      start_time:
        tense === "PAST"
          ? { $lt: moment().toDate() }
          : tense === "FUTURE"
          ? { $gte: moment().toDate() }
          : { $ne: null },
    },
  });
  pipeline.push({
    $lookup: {
      from: "bookings",
      localField: "bookings",
      foreignField: "_id",
      as: "bookings",
      pipeline: [
        {
          $lookup: {
            from: "businessuserpets",
            localField: "businessUserPet",
            foreignField: "_id",
            as: "businessUserPet",
            pipeline: [
              {
                $lookup: {
                  from: "pets",
                  localField: "pet",
                  foreignField: "_id",
                  as: "pet",
                  pipeline: [
                    {
                      $lookup: {
                        from: "users",
                        localField: "owner",
                        foreignField: "_id",
                        as: "owner",
                        pipeline: [
                          {
                            $project: {
                              firstname: 1,
                              lastname: 1,
                              username: 1,
                            },
                          },
                        ],
                      },
                    },
                    {
                      $unwind: "$owner",
                    },
                    {
                      $project: {
                        name: 1,
                        owner: 1,
                      },
                    },
                  ],
                },
              },
              {
                $unwind: "$pet",
              },
            ],
          },
        },
        {
          $match: {
            "businessUserPet.pet.owner.username": "JoelMclean",
          },
        },
        {
          $unwind: "$businessUserPet",
        },
      ],
    },
  });
  pipeline.push({
    $lookup: {
      from: "businesses",
      localField: "business",
      foreignField: "_id",
      as: "business",
      pipeline: [
        {
          $project: {
            name: 1,
            slug: 1,
          },
        },
      ],
    },
  });
  pipeline.push({
    $lookup: {
      from: "services",
      localField: "service",
      foreignField: "_id",
      as: "service",
      pipeline: [
        {
          $project: {
            name: 1,
          },
        },
      ],
    },
  });
  pipeline.push({
    $match: {
      "business.slug":
        businessSlugs?.length > 0 ? { $in: businessSlugs } : { $ne: null },
    },
  });
  pipeline.push({
    $match: {
      "bookings.businessUserPet.pet.owner.username": "JoelMclean",
    },
  });
  pipeline.push({
    $unwind: "$service",
  });
  pipeline.push({
    $match: {
      "service._id": service ? service._id : { $ne: null },
    },
  });
  pipeline.push({
    $unwind: "$business",
  });

  pipeline.push({
    $project: {
      start_time: 1,
      end_time: 1,
      cost: 1,
      location: 1,
      locationLink: 1,
      info: 1,
      service: 1,
      bookings: 1,
      business: 1,
    },
  });
  let results = await BookingSlot.aggregate([
    ...pipeline,
    {
      $count: "results",
    },
  ]);
  if (results.length == 1) results = results[0].results;
  else results = 0;
  if (pageSize > 0) {
    if (!page) {
      page = 0;
    }
    var skip = page * pageSize;
    pipeline.push({
      $limit: skip + pageSize,
    });
    pipeline.push({
      $skip: skip,
    });
  }
  let bookingSlots = await BookingSlot.aggregate(pipeline);
  return {
    bookingSlots,
    pages: Math.floor(
      Math.max(isNaN(results) ?? 1, 1) /
        Math.max(isNaN(pageSize) ? 1 : pageSize, 1)
    ),
    results: results,
  };
};

module.exports = { getBookings, getBookingsAsSlots };
