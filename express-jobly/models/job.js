"use strict";

const db = require("../db");
const { NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

class Job {
  /** Create a job (from data), update db, return new company data.
   *
   * data should be { title, salary, equity, company_handle }
   *
   * Returns { id, title, salary, equity, company_handle  }
   *
   * */

  static async create({ title, salary, equity, companyHandle }) {
    const result = await db.query(
      `INSERT INTO jobs 
            (title, salary, equity, company_handle)
            VALUES($1,$2,$3,$4)
            RETURNING id, title, salary, equity, company_handle AS "companyHandle"
            `,
      [title, salary, equity, companyHandle]
    );
    const company = result.rows[0];
    return company;
  }
  /** Finds all Jobs if no argument passed. Searches based on parameters if correct parameters are passed
   *
   */
  static async findAll(search = {}) {
    let query = `SELECT id,
      title,
      salary,
      equity, 
      company_handle AS "companyHandle"
      FROM jobs`;

    let whereParams = [];
    let queryValues = [];

    // Create variables based on passed throught query paramaters

    const { title, minSalary, hasEquity } = search;

    // Checks if search parameter is used and adds it to whereParams list and queryValues to render the correct SQL query
    if (title) {
      queryValues.push(`%${title}%`);
      whereParams.push(`title ILIKE $${queryValues.length}`);
    }

    if (minSalary) {
      queryValues.push(minSalary);
      whereParams.push(`salary >= $${queryValues.length}`);
    }
    if (hasEquity === "true") {
      whereParams.push(`equity > 0`);
    }

    // If query params were passed, a WHERE statement will be added to the SQL query and all items in whereParams list, will be joined with AND and added as well.
    if (whereParams.length > 0) {
      query += " WHERE ";
      query += whereParams.join(" AND ");
    }

    // add an ORDER BY to the SQL query regardless of if any parameters were passed and make request.
    query += " ORDER BY title ";
    const jobsRes = await db.query(query, queryValues);

    return jobsRes.rows;
  }
  /** Given job idm return data about specified job
   *
   * Returns {id, title, salary, equity, companyHandle}
   *
   * Throws NotFoundError if not found
   * */

  static async get(id) {
    const jobRes = await db.query(
      `SELECT id,
                title,
                salary,
                equity,
                company_handle AS "companyHandle"
             FROM jobs
             WHERE id = $1`,
      [id]
    );

    const job = jobRes.rows[0];

    if (!job) throw new NotFoundError(`No job with an id of: ${id}`);

    return job;
  }

  /**Update job data with "data".
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {title, salary, equity, company_handle}
   *
   * Returns {id, title, salary, equity, company_handle}
   *
   * Throws NotFoundError if not found.
   */

  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(data, {
      companyHandle: "company_handle"
    });
    const handleVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE jobs 
                      SET ${setCols} 
                      WHERE id = ${handleVarIdx} 
                      RETURNING id, 
                                title, 
                                salary, 
                                equity, 
                                company_handle AS "companyHandle"`;
    const result = await db.query(querySql, [...values, id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job with id of: ${id}`);

    return job;
  }

  /** Delete given job from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove(id) {
    const result = await db.query(
      `DELETE
           FROM jobs
           WHERE id = $1
           RETURNING id`,
      [id]
    );
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job with id of: ${id}`);
  }
}

module.exports = Job;
