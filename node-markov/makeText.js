/** Command-line tool to generate Markov text. */
const { MarkovMachine } = require("./markov");
const fs = require("fs");
const process = require("process");
const axios = require("axios");
let argv = process.argv;

function makeText(text) {
  let mm = new MarkovMachine(text);
  console.log(mm.makeText());
}

function fileMarkov(path) {
  fs.readFile(path, "utf8", function (err, data) {
    if (err) {
      console.error(`Couldn't read ${path}: ${err}`);
      process.exit(1);
    } else {
      makeText(data);
    }
  });
}

async function urlMarkov(url) {
  let resp;
  try {
    resp = await axios.get(url);
  } catch (err) {
    console.error(`Error fetching ${url}: ${err}`);
    process.exit(1);
  }
  makeText(resp.data);
}

if (argv[2] === "file") {
  fileMarkov(argv[3]);
} else if (argv[2] === "url") {
  urlMarkov(argv[3]);
} else {
  console.log(`Invalid Method: ${argv[2]}`);
}
