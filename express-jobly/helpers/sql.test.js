const { sqlForPartialUpdate } = require("./sql");
const { BadRequestError } = require("../expressError");

describe("format JSON to SQL", function () {
  test("Sends correct formatted response", function () {
    const { setCols, values } = sqlForPartialUpdate(
      { name: "sam", state: "ks" },
      {}
    );

    expect(setCols).toEqual('"name"=$1, "state"=$2');
    expect(values).toEqual(["sam", "ks"]);
  });
});
