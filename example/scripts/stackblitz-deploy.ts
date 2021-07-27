import { promises as fs } from 'fs';

const FILES_TO_EXCLUDE = ['./package.json'];
const DIRS_TO_EXCLUDE = ['./node_modules'];

async function getFilePaths(path = './') {
  const entries = await fs.readdir(path, { withFileTypes: true });

  // Get files within the current directory and add a path key to the file objects.
  const files = entries
    .filter((entry) => !entry.isDirectory())
    .filter((file) => !FILES_TO_EXCLUDE.includes(path + file.name))
    .map((file) => ({ ...file, path: path + file.name }));

  // Get directories within the current directory.
  const directories = entries
    .filter((entry) => entry.isDirectory())
    .filter((directory) => !DIRS_TO_EXCLUDE.includes(path + directory.name));

  //  Add the found files within the subdirectory to the files array by calling the
  // current function itself.
  for (const directory of directories) {
    files.push(...(await getFilePaths(`${path}${directory.name}/`)));
  }

  return files;
}

function getFileContents(path: string) {
  return fs.readFile(path, { encoding: 'utf-8' });
}

// Get files in the directory that the script is called from.
getFilePaths().then(async (files) => {
  console.log(files);

  const fileContents = await Promise.all([...files.map((file) => getFileContents(file.path))]);
  console.log(fileContents);
});
