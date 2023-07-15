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

const uaFile = require("./src/i18n/ua/chat.js").default;
const enFile = require("./src/i18n/en/chat.js").default;
const frFile = require("./src/i18n/fr/chat.js").default;

const files = [uaFile, enFile, frFile];
const differingKeys = compareKeys(files);

if (differingKeys === true) {
  throw new Error("No differences in locales were found");
} else {
  console.log(
    `There are differences between locale files. Differences in the following keys: ${differingKeys}`
  );
}
