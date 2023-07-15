require = require("esm")(module);
const fs = require("fs");
const path = require("path");

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

const i18nDir = "./src/i18n";
const languageFolders = fs
  .readdirSync(i18nDir, { withFileTypes: true })
  .filter((dirent) => dirent.isDirectory())
  .map((dirent) => dirent.name);

const differingKeys = [];

for (const languageFolder of languageFolders) {
  const subdirectories = fs
    .readdirSync(path.join(i18nDir, languageFolder), { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  for (const subdirectory of subdirectories) {
    const filePath = path.join(i18nDir, languageFolder, subdirectory);

    if (fs.existsSync(filePath)) {
      const files = fs
        .readdirSync(filePath)
        .filter((file) => file.endsWith(".js"));

      for (const file of files) {
        const file1 = require(path.join(filePath, file)).default;
        const file2 = require(path.join(
          i18nDir,
          "en",
          subdirectory,
          file
        )).default;

        console.log(file1);
        const diff = compareKeys(file1, file2);

        if (diff !== true) {
          differingKeys.push({
            language: languageFolder,
            subdirectory,
            file,
            differingKeys: diff,
          });
        }
      }
    }
  }
}

if (differingKeys.length === 0) {
  throw new Error("No differences in locales were found");
} else {
  console.log("There are differences between locale files:");
  for (const {
    language,
    subdirectory,
    file,
    differingKeys: diff,
  } of differingKeys) {
    console.log(
      `Language: ${language}, Subdirectory: ${subdirectory}, File: ${file}, Differences in keys: ${diff}`
    );
  }
}
