const User = require("../modules/auth/auth.model");
const STATUS = require("./statusCodes");
const validateClient = async (req, res, next) => {
  try {
    const client_id =
      req.params.client_id  ||
      req.query.client_id   ||
      req.body.client_id    ||
      req.headers["x-client-id"];

    if (!client_id) {
      return res.status(STATUS.BAD_REQUEST).json({
        success: false,
        message: "client_id is required",
      });
    }

    const user = await User.findOne({ client_id });

    if (!user) {
      return res.status(STATUS.NOT_FOUND).json({
        success: false,
        message: "Wrong client_id — user not found",
      });
    }

    req.clientUser = user;
    next();

  } catch (err) {
    return res.status(STATUS.SERVER_ERROR).json({
      success: false,
      message: "Client validation failed",
    });
  }
};

module.exports = validateClient;