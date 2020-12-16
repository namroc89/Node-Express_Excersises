const express = require("express");
const app = express();
const itemRoutes = require("./itemRoutes");
const ExpressError = require("./errors");

app.use(express.json());

app.use("/items", itemRoutes);

app.use(function (req, res, next) {
  return new ExpressError("Not Found", 404);
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  console.log(err);
  return res.json({
    error: err.msg,
  });
});

module.exports = app;
