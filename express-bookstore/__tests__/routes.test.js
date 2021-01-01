process.env.NODE_ENV = "test";

const request = require("supertest");

const app = require("../app");
const db = require("../db");
const Book = require("../models/book");

beforeEach(async function () {
  let u1 = await Book.create({
    isbn: "123",
    amazon_url: "http://a.co/eobPtX2",
    author: "Test",
    language: "english",
    pages: 264,
    publisher: "Test press",
    title: "Testing tests",
    year: 2017
  });
});

//   Get /books/ returns all books
describe("GET books/", function () {
  test("gets all books", async function () {
    let resp = await request(app).get("/books");

    expect(resp.statusCode).toBe(200);
    expect(resp.body.books).toHaveLength(1);
    expect(resp.body.books[0]).toHaveProperty("title");
  });
});

describe("GET books/:isbn", function () {
  test("Gets single book", async function () {
    let resp = await request(app).get("/books/123");
    expect(resp.statusCode).toBe(200);
    expect(resp.body.book).toHaveProperty("isbn");
    expect(resp.body.book.isbn).toBe("123");
  });
  test("Error if invalid isbn is used", async function () {
    let resp = await request(app).get("/books/12345");

    expect(resp.statusCode).toBe(404);
  });
});

describe("POST books/", function () {
  test("Creates a new book entry", async function () {
    let resp = await request(app).post("/books").send({
      isbn: "12345",
      amazon_url: "http://a.co/eobPtX2",
      author: "Test2",
      language: "english",
      pages: 300,
      publisher: "Test press",
      title: "Testing tests again",
      year: 2018
    });
    expect(resp.statusCode).toBe(201);
    expect(resp.body.book).toHaveProperty("isbn");
    expect(resp.body.book.isbn).toBe("12345");
  });
  test("throws error if invalid information is used", async function () {
    let resp = await request(app).post("/books").send({
      isbn: "12345",
      amazon_url: "http://a.co/eobPtX2",
      author: "Test2",
      pages: 300,
      publisher: "Test press",
      title: "Testing tests again",
      year: 2018
    });
    expect(resp.statusCode).toBe(400);
  });
});

describe("PUT books/:isbn", function () {
  test("Updates a specific book", async function () {
    resp = await request(app).put("/books/123").send({
      isbn: "123",
      amazon_url: "http://a.co/eobPtX2",
      author: "Test2",
      language: "english",
      pages: 300,
      publisher: "Test press",
      title: "Testing tests again",
      year: 2018
    });
    expect(resp.statusCode).toBe(200);
    expect(resp.body.book).toHaveProperty("author");
    expect(resp.body.book.author).toBe("Test2");
  });
  test("Error if invalid info is sent", async function () {
    resp = await request(app).put("/books/123").send({
      isbn: "123",
      amazon_url: "http://a.co/eobPtX2",
      publisher: "Test press",
      title: "Testing tests again",
      year: 2018
    });
    expect(resp.statusCode).toBe(400);
  });
  test("Error if invalid isbn sent", async function () {
    resp = await request(app).put("/books/12334234").send({
      isbn: "123",
      amazon_url: "http://a.co/eobPtX2",
      author: "Test2",
      language: "english",
      pages: 300,
      publisher: "Test press",
      title: "Testing tests again",
      year: 2018
    });
    expect(resp.statusCode).toBe(404);
  });
});

describe("DELETE /books/:isbn", function () {
  test("Deletes selected book", async function () {
    let resp = await request(app).delete("/books/123");
    expect(resp.statusCode).toBe(200);
    expect(resp.body.message).toEqual("Book deleted");
  });
  test("throws error if not valid book", async function () {
    let resp = await request(app).delete("/books/123456767");

    expect(resp.statusCode).toBe(404);
  });
});

afterEach(async function () {
  await db.query("DELETE FROM BOOKS");
});

afterAll(async function () {
  await db.end();
});
