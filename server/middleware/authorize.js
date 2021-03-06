require('dotenv').config
const jwt = require("express-jwt");
const db = require("../_helpers/db");
module.exports = authorize;
function authorize(roles = [], credentialsRequired = true) {
  if (typeof roles == "string") roles = [roles];

  return [
    jwt({
      secret: process.env.JWT_SECRET,
      algorithms: ["HS256"],
      credentialsRequired,
      getToken: function getTokenFromCookie(req) {
        const token = req.cookies.token;
        if (!token) return null;
        return token;
      },
    }),

    async (req, res, next) => {
      if (!req.user && credentialsRequired)
        return res.status(403).json({ message: "Token missing." });
      else if (!req.user) {
        req.user = null;
        next();
        return;
      }

      const user = await db.user.findByPk(req.user.sub);
      if (!user || (roles.length && !roles.includes(user.role))) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      req.user = user.get();
      next();
    },
  ];
}
