require = require("esm")(module);
const fs = require("fs");
const path = require("path");

function compareKeys(files) {
  if (files.length < 2) {
    throw new Error("At least two files are required for comparison");
  }
  console.log(files);

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

function getFilePaths(directory) {
  const fileNames = fs.readdirSync(directory);

  return fileNames.map((fileName) => path.join(directory, fileName));
}

function compareFilesInDirectory(directory) {
  const files = getFilePaths(directory)
    .filter((filePath) => fs.statSync(filePath).isFile())
    .map((filePath) => require(filePath).default);

  return compareKeys(files);
}

const baseDirectory = "./src/i18n";
const directories = fs
  .readdirSync(baseDirectory)
  .map((directory) => path.join(baseDirectory, directory));

const differingFiles = [];

for (let i = 0; i < directories.length; i++) {
  const directory = directories[i];
  const differingKeys = compareFilesInDirectory(directory);

  if (differingKeys !== true) {
    differingFiles.push(directory);
    console.log(
      `Differences in directory ${directory}. Keys: ${differingKeys}`
    );
  }
}

if (differingFiles.length === 0) {
  console.log("No differences in locale files were found");
}
