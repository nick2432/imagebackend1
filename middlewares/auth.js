const User = require("../models/user");
const jwt = require("jsonwebtoken");

exports.isAuthenticated = async (req, res, next) => {
  try {
    let token = req.body.token || req.query.token || req.headers.authorization || req.cookies.token;
     console.log(token);
    if (!token) {
      return res.status(401).json({
        message: "Please login first",
      });
    }

    if (token.startsWith("Bearer ")) {
      // Remove "Bearer " prefix if present
      token = token.slice(7);
    }

    const decoded = await jwt.verify(token, "coderun");
   
    req.user = await User.findById(decoded._id);
    console.log(req.user);

    next();
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
