const User = require("../models/user");
const jwt = require("jsonwebtoken");

exports.isAuthenticated = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    console.log(token);
    if (!token) {
      return res.status(401).json({
        message: "Please login first",
      });
    }

    const decoded = await jwt.verify(token, process.env.JWT_SECRET);
   
    req.user = await User.findById(decoded._id);
    console.log(req.user);

    next();
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};