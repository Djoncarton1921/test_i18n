require = require('esm')(module);
const fs = require('fs');

function compareKeys(file1, file2) {
  const keys1 = Object.keys(file1);
  const keys2 = Object.keys(file2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (let i = 0; i < keys1.length; i++) {
    const key = keys1[i];
    if (!keys2.includes(key)) {
      return false;
    }
  }

  return true;
}

const uaFile = require('./src/i18n/ua/chat.js').default;
const enFile = require('./src/i18n/en/chat.js').default;

if (compareKeys(uaFile, enFile)) {
  console.log('All keys are correct.');
} else {
  console.log('Keys are not the same in all files.');
}