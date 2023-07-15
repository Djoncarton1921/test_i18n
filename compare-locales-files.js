require = require("esm")(module);
const fs = require("fs");

function compareKeys(file1, file2) {
  const keys1 = Object.keys(file1);
  const keys2 = Object.keys(file2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  const differingKeys = [];

  for (let i = 0; i < keys1.length; i++) {
    const key = keys1[i];
    if (!keys2.includes(key)) {
      differingKeys.push(key);
    }
  }

  return differingKeys.length === 0 ? true : differingKeys;
}

const uaFile = require("./src/i18n/ua/chat.js").default;
const enFile = require("./src/i18n/en/chat.js").default;

const differingKeys = compareKeys(uaFile, enFile);

if (differingKeys === true) {
  throw new Error("No differences in locales were found");
} else {
  console.log(
    `There are differences between locale files. Differences in such keys as: ${differingKeys}`
  );
}
