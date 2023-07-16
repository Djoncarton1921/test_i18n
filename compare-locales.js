require = require("esm")(module);
const fs = require("fs");

function compareKeys(files) {
  if (files.length < 2) {
    throw new Error("At least two files are required for comparison");
  }

  const keys = {};

  files.forEach((file, index) => {
    const fileKeys = Object.keys(file);

    fileKeys.forEach((key) => {
      if (!keys[key]) {
        keys[key] = [index];
      } else {
        keys[key].push(index);
      }
    });
  });

  const differingKeys = Object.entries(keys).filter(([key, indexes]) => {
    return indexes.length !== files.length;
  });

  return differingKeys.length === 0 ? true : differingKeys.map(([key]) => key);
}

const filePaths = process.argv.slice(2);

console.log(filePaths);

const files = filePaths.map((filePath) => require(`./${filePath}`).default);

const differingKeys = compareKeys(files);

if (differingKeys === true) {
  throw new Error("No differences in locales were found");
} else {
  console.log(
    `There are differences between locale files. Differences in the following keys: ${differingKeys}`
  );
}
