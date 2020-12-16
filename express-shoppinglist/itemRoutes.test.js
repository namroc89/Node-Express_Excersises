process.env.NODE_ENV = "test";

const request = require("supertest");

const app = require("./app");
let items = require("./fakeDb");

let listItem = { name: "pickles", price: 1.0 };
beforeEach(function () {
  items.push(listItem);
});

afterEach(function () {
  items.length = 0;
});

describe("GET /items", function () {
  test("Gets a list of items", async function () {
    const resp = await request(app).get("/items");
    expect(resp.statusCode).toBe(200);
    expect(resp.body).toEqual({ items: [listItem] });
  });
});

describe("Get /items/:name", function () {
  test("Gets specified item ", async function () {
    const resp = await request(app).get(`/items/${listItem.name}`);
    expect(resp.statusCode).toBe(200);
    expect(resp.body).toEqual({ foundItem: listItem });
  });
  test("Responds with Error if item cannot be found", async function () {
    const resp = await request(app).get("/items/foot");
    expect(resp.statusCode).toBe(404);
  });
});

describe("POST /items", function () {
  test("Creates new item", async function () {
    const resp = await request(app).post("/items").send({
      name: "banana",
      price: 1,
    });
    expect(resp.statusCode).toBe(201);
    expect(resp.body).toEqual({ added: { name: "banana", price: 1 } });
  });
  test("Responds with Error if no name or price", async function () {
    const resp = await request(app).post("/items").send({
      price: 1,
    });
    expect(resp.statusCode).toBe(400);
  });
  test("Responds with Error if no name or price", async function () {
    const resp = await request(app).post("/items").send({
      name: "shoes",
    });
    expect(resp.statusCode).toBe(400);
  });
});

describe("PATCH /items/:name", function () {
  test("Updates selected item", async function () {
    const resp = await request(app).patch(`/items/${listItem.name}`).send({
      name: "banana",
    });
    expect(resp.statusCode).toBe(200);
    expect(resp.body).toEqual({ updated: listItem });
  });
  test("Responds with Error if item cannot be found", async function () {
    const resp = await request(app).patch(`/items/feet`).send({
      name: "banana",
    });
    expect(resp.statusCode).toBe(404);
  });
});

describe("DELETE /items/:name", function () {
  test("Deletes selected item", async function () {
    const resp = await request(app).delete(`/items/${listItem.name}`);
    expect(resp.statusCode).toBe(200);
    expect(resp.body).toEqual({ message: "Deleted" });
    expect(items.length).toEqual(0);
  });
});
