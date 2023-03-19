import { writeFile, readFile, unlink } from 'fs';
import { resolve } from 'path';

import promisify from './promisify';

describe('Promisify function implementation', () => {
  it('Promisify function must take a thunk-based async function (with possible overloads) and return new function that provides Promise API', () => {
    const promisifiedWriteFile = promisify(writeFile);
    const promisifiedReadFile = promisify(readFile);
    const promisifiedUnlinkFile = promisify(unlink);
    const filePath = resolve(__dirname, 'data.txt');
    const fileData = 'Hello, World!';

    const fileHandlePromise = promisifiedWriteFile(filePath, fileData)
      .then(() => promisifiedReadFile(filePath, 'utf-8'))
      .then((data) => promisifiedUnlinkFile(filePath).then(() => `From file: ${data}`));

    expect(fileHandlePromise).resolves.toBe(`From file: ${fileData}`);
  });
});
