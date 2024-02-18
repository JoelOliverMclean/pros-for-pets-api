// Register and export models

const models = {
  User: require("./User"),
  Permission: require("./Permission"),
  Role: require("./Role"),
  UserRole: require("./UserRole"),
  UserPermission: require("./UserPermission"),
  RolePermission: require("./RolePermission"),
  Pet: require("./Pet"),
  Business: require("./Business"),
  BusinessUser: require("./BusinessUser"),
  BusinessUserPet: require("./BusinessUserPet"),
  BookingSlot: require("./BookingSlot"),
  Booking: require("./Booking"),
  Service: require("./Service"),
};

module.exports = models;
