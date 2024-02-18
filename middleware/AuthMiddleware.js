const { verify } = require("jsonwebtoken");
const { User, UserPermission, Permission } = require("../mongoose/models");

const validateToken = async (req, res, next) => {
  const accessToken = req.cookies.token ?? req.header("accessToken");

  if (!accessToken) return next();

  try {
    const validToken = verify(accessToken, process.env.SECRET);
    if (validToken) {
      const user = await User.findOne({ username: validToken.username }).exec();
      req.user = user;
      req.body.username = user.username;
    }
  } catch (err) {
    res.clearCookie("token");
    res.clearCookie("user");
  }
  return next();
};

const validateTokenSecured = async (req, res, next) => {
  const accessToken = req.cookies.token ?? req.header("accessToken");

  if (!accessToken)
    return res.status(401).json({ error: "User not logged in!" });

  try {
    const validToken = verify(accessToken, process.env.SECRET);
    if (validToken) {
      const user = await User.findOne({ username: validToken.username }).exec();
      req.user = user;
      req.body.username = user.username;
      return next();
    } else {
      res.clearCookie("token");
      res.clearCookie("user");
      return res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (err) {
    res.clearCookie("token");
    res.clearCookie("user");
    return res.status(401).json({ error: err });
  }
};

const hasPermission = (permissionName) => {
  return (
    hasPermission[permissionName] ||
    (async (req, res, next) => {
      const permissions = await Permission.find({
        name: { $in: [permissionName, "super"] },
      }).exec();
      if (!permissions || permissions.length < 2)
        return res.status(400).json({ error: "Permission does not exist" });
      const userPermission = await UserPermission.findOne({
        permissionId: { $in: permissions },
        userId: req.user,
      }).exec();
      if (userPermission) {
        return next();
      }
      return res
        .status(401)
        .json({ error: "You do not have permission to do this" });
    })
  );
};

module.exports = { validateToken, validateTokenSecured, hasPermission };
