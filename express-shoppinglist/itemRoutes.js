const express = require("express");
const ExpressError = require("./errors");
const router = new express.Router();
const items = require("./fakeDb");

router.get("/", function (req, res) {
  res.json({ items });
});

router.post("/", function (req, res) {
  if (!req.body.name || !req.body.price) {
    throw new ExpressError("Must enter name and price", 400);
  }
  const newItem = { name: req.body.name, price: req.body.price };
  items.push(newItem);
  res.status(201).json({ added: newItem });
});

router.get("/:name", (req, res) => {
  const foundItem = items.find((item) => item.name === req.params.name);
  if (foundItem === undefined) {
    throw new ExpressError("Not a valid name", 404);
  }
  res.json({ foundItem });
});

router.patch("/:name", (req, res) => {
  const foundItem = items.find((item) => item.name === req.params.name);
  if (foundItem === undefined) {
    throw new ExpressError("Not a valid name", 404);
  }
  foundItem.name = req.body.name;
  res.json({ updated: foundItem });
});

router.delete("/:name", function (req, res) {
  const foundItem = items.findIndex((item) => item.name === req.params.name);
  if (foundItem === -1) {
    throw new ExpressError("Item not found", 404);
  }
  items.splice(foundItem, 1);
  res.json({ message: "Deleted" });
});

module.exports = router;
