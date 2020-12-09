const fs = require("fs");
const process = require("process");
const argv = process.argv;
const axios = require("axios");

function cat(path) {
  fs.readFile(path, "utf8", (err, data) => {
    if (err) {
      console.log(`${err}`);
      process.exit(1);
    }
    console.log(data);
  });
}

async function webCat(url) {
  try {
    let res = await axios.get(path);
    console.log(res);
  } catch (e) {
    console.log(`Error: ${e}`);
    process.exit(1);
  }
}

let path = argv[2];

if (path) {
  if (path.slice(0, 4) === "http") {
    webCat(path);
  } else {
    cat(path);
  }
}
