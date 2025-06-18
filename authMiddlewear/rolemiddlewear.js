const roleCheck = (role) => {
  return (req, res, next) => {
    if (role.includes(req.user.role)) {
      next();
    } else {
      res.status(400).send({ error: "you are not authorized" });
    }
  };
};

module.exports = roleCheck;
