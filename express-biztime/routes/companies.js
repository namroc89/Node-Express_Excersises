const express = require("express");
const router = new express.Router();
const db = require("../db");
const slugify = require("slugify");
const ExpressError = require("../expressError");

// Get / returns all companies, like {companies: [{company}]}
router.get("/", async (req, res, next) => {
  const result = await db.query(`SELECT * FROM companies`);
  return res.json({ companies: result.rows });
});

//  Get /[code] Return obj of company: {company: {code, name, description}}

router.get("/:code", async (req, res, next) => {
  try {
    const companyResult = await db.query(
      `
    SELECT * 
    FROM companies 
    WHERE code = $1`,
      [req.params.code]
    );
    const invoiceResult = await db.query(
      `
    SELECT id 
    FROM invoices 
    WHERE comp_code = $1`,
      [req.params.code]
    );

    if (companyResult.rows.length === 0) {
      throw new ExpressError(`No company with code ${req.params.code}`, 404);
    }
    const company = companyResult.rows[0];
    const invoices = invoiceResult.rows;

    company.invoices = invoices.map((inv) => inv.id);

    return res.json({ company: company });
  } catch (e) {
    return next(e);
  }
});

// Post / create new company, Returns obj of new company: {company: {code, name, description}}

router.post("/", async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const code = slugify(name, { lower: true });
    const result = await db.query(
      `
    INSERT INTO companies (code, name, description)
    VALUES ($1, $2, $3)
    RETURNING code, name, description`,
      [code, name, description]
    );
    return res.status(201).json({ company: result.rows[0] });
  } catch (e) {
    return next(e);
  }
});

// PUT /:code Edits company and Returns update company object: {company: {code, name, description}}

router.put("/:code", async (req, res, next) => {
  try {
    if ("code" in req.body) {
      throw new ExpressError("Not allowed", 400);
    }
    const { name, description } = req.body;
    const result = await db.query(
      `UPDATE companies 
    SET name =$2, description = $3
    WHERE code = $1
    RETURNING code, name, description
    `,
      [req.params.code, name, description]
    );
    if (result.rows.length === 0) {
      throw new ExpressError(`No company with code ${req.params.code}`, 404);
    }
    return res.json({ company: result.rows[0] });
  } catch (e) {
    return next(e);
  }
});

// Delete /:code, Deletes company returns Returns {status: "deleted"}

router.delete("/:code", async (req, res, next) => {
  try {
    const result = await db.query(
      `DELETE FROM companies
        WHERE code = $1`,
      [req.params.code]
    );

    return res.json({ message: "Deleted" });
  } catch (e) {
    return next(e);
  }
});

module.exports = router;
