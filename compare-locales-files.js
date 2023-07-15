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

function getFilePaths(directory) {
  const fileNames = fs.readdirSync(directory);

  return fileNames.map((fileName) => path.join(directory, fileName));
}

function compareFilesInDirectory(directory) {
  const filePaths = getFilePaths(directory);

  const files = filePaths.map((filePath) => {
    if (fs.statSync(filePath).isDirectory()) {
      return compareFilesInDirectory(filePath);
    } else {
      return require(`./${filePath}`).default;
    }
  });

  return files.flat();
}

const baseDirectory = "./src/i18n";
const differingFiles = [];

const processDirectory = (directory) => {
  const directories = fs
    .readdirSync(directory)
    .map((subDir) => path.join(directory, subDir));

  directories.forEach((subDir) => {
    if (fs.statSync(subDir).isDirectory()) {
      const files = compareFilesInDirectory(subDir);
      const differingKeys = compareKeys(files);
      
      if (differingKeys !== true) {
        differingFiles.push(subDir);
        console.log(
          `Differences in directory ${subDir}. Keys: ${differingKeys}`
        );
      }
      
      processDirectory(subDir);
    }
  });
};

processDirectory(baseDirectory);

if (differingFiles.length === 0) {
  console.log("No differences in locale files were found");
}