const fs = require("fs");
const process = require("process");
const argv = process.argv;

function cat(path) {
  fs.readFile(path, "utf8", (err, data) => {
    if (err) {
      console.log(err);
      process.exit(1);
    }
    console.log(data);
  });
}

if (argv.length === 3) {
  cat(argv[2]);
}
