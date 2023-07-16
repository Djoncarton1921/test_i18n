const fs = require('fs');
const path = require('path');

const baseFolder = './src/i18n';
const locales = ['ua', 'en', 'fr', 'ja']; // Add more locales if needed

function compareFilesInLocales(localeIndex, fileIndex, files) {
  if (fileIndex >= files.length) {
    // Reached the end of files in the current locale
    return;
  }

  const fileName = files[fileIndex];
  const filePath = path.join(baseFolder, locales[localeIndex], fileName);
  
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error(`Error reading file: ${filePath}`);
      return;
    }

    const file = JSON.parse(data);

    try {
      const differingKeys = compareKeys(files.map((file) => {
        const fileData = fs.readFileSync(path.join(baseFolder, locales[localeIndex], file), 'utf8');
        return JSON.parse(fileData);
      }));

      if (differingKeys === true) {
        console.log(`All keys match in ${filePath}`);
      } else {
        console.log(`Differing keys found in ${filePath}:`);
        console.log(differingKeys);
      }
    } catch (error) {
      console.error(`Error comparing keys in ${filePath}:`, error);
    }

    compareFilesInLocales(localeIndex + 1, fileIndex, files);
  });
}

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

compareFilesInLocales(0, 0, fs.readdirSync(path.join(baseFolder, locales[0])));
