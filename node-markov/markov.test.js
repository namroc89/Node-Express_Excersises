const { MarkovMachine } = require("./markov");

describe("test makeChains function", function () {
  test("test length of chain created", () => {
    let mm = new MarkovMachine("the cat in the hat strikes back");

    expect(Object.keys(mm.chains).length).toEqual(6);
    expect(mm.chains["the"].length).toEqual(2);
  });
});

describe("test makeText", () => {
  test("test output of makeText is String", () => {
    let mm = new MarkovMachine("the cat in the hat strikes back");

    expect(mm.makeText()).toEqual(expect.any(String));
  });
  test("test output of makeText follows numWords", () => {
    let mm = new MarkovMachine("the cat in the hat strikes back");
    let splitString = mm.makeText((numWords = 1)).split(" ").length;

    expect(splitString).toEqual(1);
  });
});
