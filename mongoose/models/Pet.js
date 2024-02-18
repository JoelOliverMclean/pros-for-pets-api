const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const petSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      dropDups: true,
    },
    slug: {
      type: String,
      unique: true,
      required: true,
      dropDups: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    breed: {
      type: String,
    },
    colour: {
      type: String,
    },
    description: {
      type: String,
    },
    dob: {
      type: Date,
    },
    businessUserPets: [
      {
        type: Schema.Types.ObjectId,
        ref: "BusinessUserPet",
      },
    ],
  },
  { toJSON: { getters: true, virtuals: true } }
);

const Pet = model("Pet", petSchema);
module.exports = Pet;
