const express = require("express");
const router = new express.Router();
const db = require("../db");
const ExpressError = require("../expressError");

// Get / returns all companies, like {companies: [{company}]}
router.get("/", async (req, res, next) => {
  const result = await db.query(`SELECT id, comp_code FROM invoices`);
  return res.json({ invoices: result.rows });
});

// Get /:id returns company with given ID and corresponding company Returns {invoice: {id, amt, paid, add_date, paid_date, company: {code, name, description}}}

router.get("/:id", async (req, res, next) => {
  try {
    const result = await db.query(
      `
    SELECT i.id,
     i.comp_code,
     i.amt,
     i.paid,
     i.add_date,
     i.paid_date,
     c.name,
     c.description 
     FROM invoices As i 
     JOIN companies AS c ON(i.comp_code = c.code)
    WHERE id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      throw new ExpressError(`No invoice with ID ${req.params.id}`, 404);
    }
    const data = result.rows[0];
    const invoice = {
      id: data.id,
      amt: data.amt,
      paid: data.paid,
      add_date: data.add_date,
      paid_date: data.paid_date,
      company: {
        code: data.comp_code,
        name: data.name,
        description: data.description,
      },
    };

    return res.json({ invoice: invoice });
  } catch (e) {
    return next(e);
  }
});

//Post / creates new invoice when passes comp_code and amt, Returns: {invoice: {id, comp_code, amt, paid, add_date, paid_date}}

router.post("/", async (req, res, next) => {
  try {
    const { comp_code, amt } = req.body;
    const result = await db.query(
      `
      INSERT INTO invoices (comp_code, amt)
      VALUES ($1, $2)
      RETURNING id,comp_code,amt,paid,add_date,paid_date`,
      [comp_code, amt]
    );
    return res.status(201).json({ invoice: result.rows[0] });
  } catch (e) {
    return next(e);
  }
});

//  PUT /:id Edits Invoice amount and Returns: {invoice: {id, comp_code, amt, paid, add_date, paid_date}}

router.put("/:id", async (req, res, next) => {
  try {
    if ("id" in req.body) {
      throw new ExpressError("Not allowed", 400);
    }
    let { amt, paid } = req.body;
    if (paid === true) {
      let result = await db.query(
        `UPDATE invoices 
        SET amt =$2, paid=$3, paid_date=$4
        WHERE id = $1
        RETURNING id,comp_code,amt,paid,add_date,paid_date
        `,
        [req.params.id, amt, paid, new Date()]
      );
      if (result.rows.length === 0) {
        throw new ExpressError(`No invoice with ID ${req.params.id}`, 404);
      }
      return res.json({ invoice: result.rows[0] });
    }
    let result = await db.query(
      `UPDATE invoices 
      SET amt =$2, paid =$3, paid_date =$4
      WHERE id = $1
      RETURNING id,comp_code,amt,paid,add_date,paid_date
      `,
      [req.params.id, amt, paid, null]
    );
    if (result.rows.length === 0) {
      throw new ExpressError(`No invoice with ID ${req.params.id}`, 404);
    }
    return res.json({ invoice: result.rows[0] });
  } catch (e) {
    return next(e);
  }
});

// Delete /:id, Deletes invoice returns Returns {status: "deleted"}

router.delete("/:id", async (req, res, next) => {
  try {
    const result = await db.query(
      `DELETE FROM invoices
          WHERE id = $1`,
      [req.params.id]
    );

    return res.json({ message: "Deleted" });
  } catch (e) {
    return next(e);
  }
});

module.exports = router;
