const express = require("express");
const ExpressError = require("./errors");
const app = express();

const {
  createFrequencyCounter,
  findMean,
  findMedian,
  findMode,
} = require("./mathFunctions");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/mean", function (req, res, next) {
  let stringList = req.query["nums"].split(",");
  let numArray = [];
  try {
    for (num of stringList) {
      if (isNaN(num)) {
        throw new ExpressError(`${num} is not a valid number`, 400);
      }
      numArray.push(Number(num));
    }
  } catch (e) {
    next(e);
  }
  return res.json({ operation: "mean", value: findMean(numArray) });
});

app.get("/median", (req, res, next) => {
  let stringList = req.query["nums"].split(",");
  let numArray = [];
  try {
    for (num of stringList) {
      if (isNaN(num)) {
        throw new ExpressError(`${num} is not a valid number`, 400);
      }
      numArray.push(Number(num));
    }
  } catch (e) {
    next(e);
  }
  return res.json({ operation: "median", value: findMedian(numArray) });
});

app.get("/mode", (req, res, next) => {
  let stringList = req.query["nums"].split(",");
  let numArray = [];
  try {
    for (num of stringList) {
      if (isNaN(num)) {
        throw new ExpressError(`${num} is not a valid number`, 400);
      }
      numArray.push(Number(num));
    }
  } catch (e) {
    next(e);
  }
  return res.json({ operation: "mode", value: findMode(numArray) });
});

app.get("/all", (req, res, next) => {
  let stringList = req.query["nums"].split(",");
  let numArray = [];
  try {
    for (num of stringList) {
      if (isNaN(num)) {
        throw new ExpressError(`${num} is not a valid number`, 400);
      }
      numArray.push(Number(num));
    }
  } catch (e) {
    next(e);
  }
  return res.json({
    operation: "all",
    mode: findMode(numArray),
    mean: findMean(numArray),
    median: findMedian(numArray),
  });
});

app.use((err, req, res, next) => {
  let status = err.status || 500;

  return res.status(status).json({
    error: err,
  });
});

app.listen(3000, function () {
  console.log("Server started on port 3000.");
});
