require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const csrf = require("csurf");
const {
  validateToken,
  validateTokenSecured,
} = require("./middleware/AuthMiddleware");
const mongoose = require("mongoose");

// Configure Cross Origin Resources
app.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000",
  })
);

// Configure Parsers
app.use(express.json());
app.use(cookieParser());

// Configure CSURF
app.use(csrf({ cookie: true }));
app.get("/api/csrf-token", async (req, res) => {
  res.cookie("csrf-token", req.csrfToken());
  res.sendStatus(200);
});

mongoose.set("strictQuery", false);
const mongoDB = process.env.MONGO_STRING;
mongoose.set("debug", process.env.DEBUG === "true");
mongoose.connect(mongoDB);
const models = require("./mongoose/models");

app.use(express.static("public"));

app.use("/api/auth", require("./routes/Auth"));
app.use("/api/pets", validateTokenSecured, require("./routes/Pets"));
app.use(
  "/api/manage-business",
  validateTokenSecured,
  require("./routes/ManageBusiness")
);
app.use(
  "/api/manage-booking-slots",
  validateTokenSecured,
  require("./routes/ManageBookingSlots")
);
app.use(
  "/api/manage-services",
  validateTokenSecured,
  require("./routes/ManageServices")
);
app.use("/api/businesses", require("./routes/public/Businesses"));
app.use("/api/bookings", validateTokenSecured, require("./routes/Bookings"));
app.use(
  "/api/business-user",
  validateTokenSecured,
  require("./routes/BusinessUser")
);
app.use(
  "/api/business-user-pets",
  validateTokenSecured,
  require("./routes/BusinessUserPet")
);
app.use("/api/services", require("./routes/public/Services"));

app.get("/", async (req, res) => {
  let superuser = await models.User.findOne({
    username: "admin",
  }).exec();
  if (!superuser) {
    res.json({ success: false });
  } else {
    res.json({
      success: true,
      name: `${superuser.firstname} ${superuser.lastname}`,
    });
  }
});

require("./mongoose").seed();

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
