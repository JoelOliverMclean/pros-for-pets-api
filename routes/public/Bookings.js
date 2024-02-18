const express = require("express");
const router = express.Router();
const {
  BookingSlot,
  Pet,
  BusinessUserPet,
  Booking,
} = require("../../mongoose/models");
const { validateToken } = require("../../middleware/AuthMiddleware");

router.post("/request", validateToken, async (req, res) => {
  let { slotId, petId } = req.body;
  if (!slotId)
    return res.status(409).json({ error: "Booking Slot ID required" });
  if (!petId) return res.status(409).json({ error: "Pet ID required" });

  let bookingSlot = await BookingSlot.findById(slotId)
    .populate([
      "bookings",
      {
        path: "business",
        populate: [{ path: "businessUsers", populate: "user" }],
      },
    ])
    .exec();
  if (!bookingSlot)
    return res.status(404).json({ error: "Cannot find booking slot" });

  let business = bookingSlot.business;
  let businessUser = business.businessUsers.find(
    (bu) => bu.user.username === req.user.username
  );
  if (!businessUser) {
    return res.status(409).json({ error: "Must be a client to book" });
  }

  let pet = await Pet.findById(petId)
    .populate({ path: "businessUserPets" })
    .exec();
  if (!pet) return res.status(404).json({ error: "Cannot find pet" });
  let businessUserPet = await BusinessUserPet.findOne({
    businessUser,
    pet,
  })
    .populate("bookings")
    .exec();

  if (!businessUserPet) {
    businessUserPet = await BusinessUserPet.create({
      businessUser,
      pet,
    });
    pet.businessUserPets.push(businessUserPet._id);
    businessUser.businessUserPets.push(businessUserPet._id);
    await businessUser.save();
    await pet.save();
  }

  if (
    bookingSlot.bookings.some(
      (booking) => booking.businessUserPet === businessUserPet
    )
  ) {
    return res.status(409).json({ error: "Booking already requested" });
  }

  let booking = await Booking.create({
    business,
    bookingSlot,
    businessUserPet,
    start_time: bookingSlot.start_time,
    end_time: bookingSlot.end_time,
    cost: bookingSlot.cost,
  });

  bookingSlot.spaces_left -= 1;
  bookingSlot.bookings.push(booking._id);
  await bookingSlot.save();

  businessUserPet.bookings.push(booking._id);
  await businessUserPet.save();

  return res.status(200).json(booking);
});

module.exports = router;
