"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");
const Job = require("../models/job");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  adminToken
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */
describe("POST /jobs", function () {
  const newJob = {
    title: "new",
    salary: 50000,
    equity: 0.05,
    companyHandle: "c2"
  };

  test("ok for admin", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${adminToken}`);

    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      job: {
        id: expect.any(Number),
        title: "new",
        salary: 50000,
        equity: "0.05",
        companyHandle: "c2"
      }
    });
  });

  test("Error for non-admin user", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        title: "new",
        salary: 104444
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        ...newJob,
        salary: "Not a number"
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /jobs */

describe("GET /jobs", function () {
  test("ok for anon", async function () {
    const resp = await request(app).get("/jobs");
    expect(resp.body).toEqual({
      jobs: [
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
          companyHandle: "c2"
        },
        {
          id: expect.any(Number),
          title: "j4",
          salary: 65000,
          equity: "0.02",
          companyHandle: "c1"
        }
      ]
    });
  });

  test("fails: test next() handler", async function () {
    // there's no normal failure event which will cause this route to fail ---
    // thus making it hard to test that the error-handler works with it. This
    // should cause an error, all right :)
    await db.query("DROP TABLE jobs CASCADE");
    const resp = await request(app)
      .get("/jobs")
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(500);
  });
});

// ******************************************** GET /jobs/ with filters

describe("GET /jobs/ with filters", function () {
  test("works for title filter", async function () {
    const resp = await request(app).get(`/jobs/?title=2`);
    expect(resp.statusCode).toBe(200);
    expect(resp.body).toEqual({
      jobs: [
        {
          id: expect.any(Number),
          title: "j2",
          salary: 60000,
          equity: "0.001",
          companyHandle: "c2"
        }
      ]
    });
  });
  test("works for minSalary filter", async function () {
    const resp = await request(app).get(`/jobs/?minSalary=64000`);
    expect(resp.statusCode).toBe(200);
    expect(resp.body).toEqual({
      jobs: [
        {
          id: expect.any(Number),
          title: "j3",
          salary: 70000,
          equity: "0",
          companyHandle: "c2"
        },
        {
          id: expect.any(Number),
          title: "j4",
          salary: 65000,
          equity: "0.02",
          companyHandle: "c1"
        }
      ]
    });
  });
  test("works for hasEquity = true", async function () {
    const resp = await request(app).get(`/jobs/?hasEquity=true`);
    expect(resp.statusCode).toBe(200);
    expect(resp.body).toEqual({
      jobs: [
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
      ]
    });
  });
  test("returns all if hasEquity = false", async function () {
    const resp = await request(app).get(`/jobs/?hasEquity=false`);
    expect(resp.statusCode).toBe(200);
    expect(resp.body).toEqual({
      jobs: [
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
          companyHandle: "c2"
        },
        {
          id: expect.any(Number),
          title: "j4",
          salary: 65000,
          equity: "0.02",
          companyHandle: "c1"
        }
      ]
    });
  });

  test("works for all filters together", async function () {
    const resp = await request(app).get(
      `/jobs/?minSalary=64000&title=3&hasEquity=false`
    );
    expect(resp.statusCode).toBe(200);
    expect(resp.body).toEqual({
      jobs: [
        {
          id: expect.any(Number),
          title: "j3",
          salary: 70000,
          equity: "0",
          companyHandle: "c2"
        }
      ]
    });
  });
  test("returns empty list if none found", async function () {
    const resp = await request(app).get(`/jobs/?title=124124124`);
    expect(resp.statusCode).toBe(200);
    expect(resp.body).toEqual({
      jobs: []
    });
  });
});

/************************************** GET /companies/:handle */

describe("GET /jobs/:id", function () {
  test("works for anon", async function () {
    const jobID = await Job.findAll();
    const resp = await request(app).get(`/jobs/${jobID[0].id}`);
    expect(resp.body).toEqual({
      job: {
        id: jobID[0].id,
        title: "j1",
        salary: 50000,
        equity: "0",
        companyHandle: "c1"
      }
    });
  });

  test("not found for no such job", async function () {
    const resp = await request(app).get(`/jobs/0`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /companies/:handle */

describe("PATCH /jobs/:id", function () {
  test("works for admins", async function () {
    const jobID = await Job.findAll();
    const resp = await request(app)
      .patch(`/jobs/${jobID[0].id}`)
      .send({
        title: "j1-new"
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({
      job: {
        id: jobID[0].id,
        title: "j1-new",
        salary: 50000,
        equity: "0",
        companyHandle: "c1"
      }
    });
  });

  test("unauth for anon", async function () {
    const jobID = await Job.findAll();
    const resp = await request(app).patch(`/jobs/${jobID[0].id}`).send({
      name: "j1-new"
    });
    expect(resp.statusCode).toEqual(401);
  });

  test("not found on no such job", async function () {
    const resp = await request(app)
      .patch(`/jobs/0`)
      .send({
        title: "j1-new"
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request on id change attempt", async function () {
    const jobID = await Job.findAll();
    const resp = await request(app)
      .patch(`/jobs/${jobID[0].id}`)
      .send({
        id: 1
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request on invalid data", async function () {
    const jobID = await Job.findAll();
    const resp = await request(app)
      .patch(`/jobs/${jobID[0].id}`)
      .send({
        salary: "not-a-number"
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("Error for non-admin user", async function () {
    const jobID = await Job.findAll();
    const resp = await request(app)
      .patch(`/jobs/${jobID[0].id}`)
      .send({
        title: "j1-new"
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });
});

/************************************** DELETE /companies/:handle */

describe("DELETE /jobs/:id", function () {
  test("works for admin", async function () {
    const jobID = await Job.findAll();
    const resp = await request(app)
      .delete(`/jobs/${jobID[0].id}`)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({ deleted: `${jobID[0].id}` });
  });

  test("unauth for anon", async function () {
    const jobID = await Job.findAll();
    const resp = await request(app).delete(`/jobs/${jobID[0].id}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such company", async function () {
    const resp = await request(app)
      .delete(`/jobs/0`)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });
  test("Error for non admin user", async function () {
    const jobID = await Job.findAll();
    const resp = await request(app)
      .delete(`/jobs/${jobID[0].id}`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });
});
