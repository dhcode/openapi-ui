const fs = require('fs');
const path = require('path');

const basePath = process.argv[2];
const targetName = process.argv[3];
if (!targetName || !basePath) {
  console.error('Usage combine-files.js [basePath] [targetName]');
  process.exit(1);
} else {
  console.log(`Combine files in ${basePath} to ${targetName}-es2015.js and ${targetName}-es5.js`);
}

const fileOrder = [/polyfills/, /runtime/, /main/];

const files = fs.readdirSync(basePath);
files.sort((a, b) => {
  let iA = 0;
  let iB = 0;
  for (let i = 0; i < fileOrder.length; i++) {
    if (fileOrder[i].test(a)) {
      iA = i;
    }
    if (fileOrder[i].test(b)) {
      iB = i;
    }
  }
  return iA < iB ? -1 : iA > iB ? 1 : 0;
});
checkFiles(basePath, files, targetName).then(
  () => process.exit(0),
  error => {
    console.error(error);
    process.exit(1);
  }
);

async function checkFiles(basePath, files, targetName) {
  const es2015 = fs.createWriteStream(path.join(basePath, `${targetName}-es2015.js`));
  const es5 = fs.createWriteStream(path.join(basePath, `${targetName}-es5.js`));

  for (const fileName of files) {
    const filePath = path.join(basePath, fileName);
    if (fileName.match(/es2015/)) {
      await copyToStream(filePath, es2015);
    }
    if (fileName.match(/es5/)) {
      await copyToStream(filePath, es5);
    }
  }

  await endStream(es2015);
  await endStream(es5);
}

function copyToStream(filePath, writeStream) {
  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(filePath);
    stream.on('error', err => reject(err));
    stream.on('end', () => resolve());
    stream.pipe(
      writeStream,
      { end: false }
    );
  });
}

function endStream(stream) {
  return new Promise(resolve => {
    stream.end(() => resolve());
  });
}
