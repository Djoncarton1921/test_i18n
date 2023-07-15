require = require("esm")(module);
const fs = require("fs");
const path = require("path");

function compareKeys(files) {
  console.log(files);
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

const directoryPath = "./src/i18n/ua";
const filesToCompare = [];

// Read files from the 'ua' directory
fs.readdirSync(directoryPath).forEach((file) => {
  if (file.endsWith(".js")) {
    const filePath = path.join(directoryPath, file);
    const fileContent = require(`./${filePath}`).default; // Assuming the files are valid JavaScript modules exporting objects
    filesToCompare.push(fileContent);
  }
});

const otherDirectories = ["en", "fr"];

// Compare files in other directories
otherDirectories.forEach((dir) => {
  const otherDirectoryPath = path.join("./src/i18n", dir);

  fs.readdirSync(otherDirectoryPath).forEach((file) => {
    if (file.endsWith(".js")) {
      const filePath = path.join(otherDirectoryPath, file);
      const fileContent = require(`./${filePath}`).default;

      const differingKeys = compareKeys(filesToCompare.map((fileToCompare) => ({
        [fileToCompare]: fileToCompare,
        [file]: fileContent,
      })));

      console.log(`Differing keys in ${file}:`, differingKeys);
    }
  });
});
