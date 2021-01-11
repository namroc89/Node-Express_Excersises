"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

// ****************************Create

describe("create", function () {
  const newJob = {
    title: "j5",
    salary: 60000,
    equity: "0",
    companyHandle: "c2"
  };

  test("works", async function () {
    let job = await Job.create(newJob);
    expect(job).toEqual({
      id: expect.any(Number),
      title: "j5",
      salary: 60000,
      equity: "0",
      companyHandle: "c2"
    });

    const result = await db.query(`
    SELECT title,salary,equity,company_handle 
    FROM jobs 
    WHERE title = 'j5'`);

    expect(result.rows).toEqual([
      {
        title: "j5",
        salary: 60000,
        equity: "0",
        company_handle: "c2"
      }
    ]);
  });
});

// *************************************** findAll

describe("findAll", function () {
  test("works no filter", async function () {
    let jobs = await Job.findAll();
    expect(jobs).toEqual([
      {
        id: expect.any(Number),
        title: "j1",
        salary: 50000,
        equity: "0",
        companyHandle: "c1"
      },
      {
        id: expect.any(Number),
        title: "j2",
        salary: 60000,
        equity: "0.001",
        companyHandle: "c2"
      },
      {
        id: expect.any(Number),
        title: "j3",
        salary: 70000,
        equity: "0",
        companyHandle: "c3"
      },
      {
        id: expect.any(Number),
        title: "j4",
        salary: 65000,
        equity: "0.02",
        companyHandle: "c1"
      }
    ]);
  });

  test("works with title filter", async function () {
    let jobs = await Job.findAll({ title: "j2" });
    expect(jobs).toEqual([
      {
        id: expect.any(Number),
        title: "j2",
        salary: 60000,
        equity: "0.001",
        companyHandle: "c2"
      }
    ]);
  });
  test("returns empty if no title matches", async function () {
    let jobs = await Job.findAll({ title: "j9" });
    expect(jobs).toEqual([]);
  });

  test("works with minSalary filter", async function () {
    let jobs = await Job.findAll({ minSalary: 61000 });
    expect(jobs).toEqual([
      {
        id: expect.any(Number),
        title: "j3",
        salary: 70000,
        equity: "0",
        companyHandle: "c3"
      },
      {
        id: expect.any(Number),
        title: "j4",
        salary: 65000,
        equity: "0.02",
        companyHandle: "c1"
      }
    ]);
  });
  test("returns empty with no matches", async function () {
    let jobs = await Job.findAll({ minSalary: 100000 });
    expect(jobs).toEqual([]);
  });

  test("works with hasEquity", async function () {
    let jobs = await Job.findAll({ hasEquity: "true" });
    expect(jobs).toEqual([
      {
        id: expect.any(Number),
        title: "j2",
        salary: 60000,
        equity: "0.001",
        companyHandle: "c2"
      },
      {
        id: expect.any(Number),
        title: "j4",
        salary: 65000,
        equity: "0.02",
        companyHandle: "c1"
      }
    ]);
  });

  test("if hasEquity is false return everything", async function () {
    let jobs = await Job.findAll({ hasEquity: "false" });
    expect(jobs).toEqual([
      {
        id: expect.any(Number),
        title: "j1",
        salary: 50000,
        equity: "0",
        companyHandle: "c1"
      },
      {
        id: expect.any(Number),
        title: "j2",
        salary: 60000,
        equity: "0.001",
        companyHandle: "c2"
      },
      {
        id: expect.any(Number),
        title: "j3",
        salary: 70000,
        equity: "0",
        companyHandle: "c3"
      },
      {
        id: expect.any(Number),
        title: "j4",
        salary: 65000,
        equity: "0.02",
        companyHandle: "c1"
      }
    ]);
  });

  test("works with all filters", async function () {
    let jobs = await Job.findAll({
      title: "j",
      minSalary: 60000,
      hasEquity: "true"
    });
    expect(jobs).toEqual([
      {
        id: expect.any(Number),
        title: "j2",
        salary: 60000,
        equity: "0.001",
        companyHandle: "c2"
      },
      {
        id: expect.any(Number),
        title: "j4",
        salary: 65000,
        equity: "0.02",
        companyHandle: "c1"
      }
    ]);
  });
});

// ************************** Get

describe("GET", function () {
  test("works with valid id", async function () {
    const res = await Job.findAll();
    let job = await Job.get(res[0].id);
    expect(job).toEqual({
      id: expect.any(Number),
      title: "j1",
      salary: 50000,
      equity: "0",
      companyHandle: "c1"
    });
  });

  test("not found if no such job", async function () {
    try {
      await Job.get(0);
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
  const updateData = {
    title: "new",
    salary: 90000,
    equity: "0.05",
    companyHandle: "c1"
  };

  test("works", async function () {
    const jobID = await Job.findAll();
    let job = await Job.update(jobID[0].id, updateData);
    expect(job).toEqual({
      id: expect.any(Number),
      title: "new",
      salary: 90000,
      equity: "0.05",
      companyHandle: "c1"
    });

    const result = await db.query(
      `SELECT id, 
      title, 
      salary, 
      equity, 
      company_handle AS "companyHandle"
           FROM jobs
           WHERE  id = ${jobID[0].id}`
    );
    expect(result.rows).toEqual([
      {
        id: expect.any(Number),
        title: "new",
        salary: 90000,
        equity: "0.05",
        companyHandle: "c1"
      }
    ]);
  });

  test("not found if no job exists", async function () {
    try {
      await Job.update(0, updateData);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Job.update("c1", {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    const jobID = await Job.findAll();
    await Job.remove(jobID[0].id);
    const res = await db.query(`SELECT id FROM jobs WHERE id= ${jobID[0].id}`);
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such company", async function () {
    try {
      await Job.remove(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
