require = require("esm")(module);
const fs = require("fs");
const path = require("path");

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

const directories = ["ua", "en", "fr"];

directories.forEach((directory) => {
  const directoryPath = path.join("./src/i18n", directory);
  const filesToCompare = [];

  // Read files from the current directory
  fs.readdirSync(directoryPath).forEach((file) => {
    if (file.endsWith(".js")) {
      const filePath = path.join(directoryPath, file);
      const fileContent = require(`./${filePath}`).default; // Assuming the files are valid JavaScript modules exporting objects
      filesToCompare.push({
        filePath: filePath,
        fileContent: fileContent,
      });
    }
  });

  console.log(filesToCompare);

  // Compare files in the current directory
  filesToCompare.forEach((file, index) => {
    const fileName = path.basename(Object.keys(file)[0], ".js");
    const differingKeys = compareKeys(
      filesToCompare.filter((_, i) => i !== index)
    );

    console.log(`Differing keys in ${fileName}:`, differingKeys);
  });
});
