// tests/uploadValidation.test.js
import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import path from 'path';
import fs from 'fs';
import os from 'os';

// We test the validateAndRenameAvatar middleware that will be exported from upload.js.
// We mock file-type so we don't need real image files.
const fileTypeFromFileMock = jest.fn();

jest.unstable_mockModule('file-type', () => ({
  fileTypeFromFile: fileTypeFromFileMock,
}));

const { validateAndRenameAvatar } = await import('../app/middlewares/upload.js');

function makeTempFile(ext = '.jpg') {
  const tmpDir = os.tmpdir();
  const filePath = path.join(tmpDir, `test-upload-${Date.now()}${ext}`);
  fs.writeFileSync(filePath, 'fake-content');
  return filePath;
}

function mockReq(filePath, ext = '.jpg') {
  return {
    file: filePath ? {
      path: filePath,
      filename: `1-${Date.now()}${ext}`,
    } : null,
    user: { id: 1 },
  };
}

function mockRes() {
  const res = { statusCode: null, jsonData: null };
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (data) => { res.jsonData = data; return res; };
  return res;
}

describe('validateAndRenameAvatar middleware (H1)', () => {
  let tmpFile;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    if (tmpFile && fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
  });

  test('calls next() and passes through when no file is uploaded', async () => {
    const req = mockReq(null);
    const res = mockRes();
    const next = jest.fn();

    await validateAndRenameAvatar(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(fileTypeFromFileMock).not.toHaveBeenCalled();
  });

  test('returns 400 and deletes file when magic bytes are not an allowed image type', async () => {
    tmpFile = makeTempFile('.jpg');
    fileTypeFromFileMock.mockResolvedValue({ mime: 'application/pdf', ext: 'pdf' });

    const req = mockReq(tmpFile, '.jpg');
    const res = mockRes();
    const next = jest.fn();

    await validateAndRenameAvatar(req, res, next);

    expect(res.statusCode).toBe(400);
    expect(next).not.toHaveBeenCalled();
    expect(fs.existsSync(tmpFile)).toBe(false); // file deleted
    tmpFile = null;
  });

  test('returns 400 and deletes file when file-type cannot detect type (e.g. SVG without signature)', async () => {
    tmpFile = makeTempFile('.jpg');
    fileTypeFromFileMock.mockResolvedValue(null); // undetectable

    const req = mockReq(tmpFile, '.jpg');
    const res = mockRes();
    const next = jest.fn();

    await validateAndRenameAvatar(req, res, next);

    expect(res.statusCode).toBe(400);
    expect(fs.existsSync(tmpFile)).toBe(false);
    tmpFile = null;
  });

  test('renames file to correct extension based on magic bytes, then calls next()', async () => {
    tmpFile = makeTempFile('.php'); // attacker sent .php extension
    fileTypeFromFileMock.mockResolvedValue({ mime: 'image/jpeg', ext: 'jpg' });

    const req = mockReq(tmpFile, '.php');
    const res = mockRes();
    const next = jest.fn();

    await validateAndRenameAvatar(req, res, next);

    expect(next).toHaveBeenCalled();
    // req.file.filename should now end with .jpg, not .php
    expect(req.file.filename).toMatch(/\.jpg$/);
    // original .php path is gone
    expect(fs.existsSync(tmpFile)).toBe(false);
    // new .jpg path exists
    const newPath = req.file.path;
    expect(fs.existsSync(newPath)).toBe(true);
    // cleanup
    fs.unlinkSync(newPath);
    tmpFile = null;
  });

  test('keeps correct extension when magic bytes match filename extension', async () => {
    tmpFile = makeTempFile('.png');
    fileTypeFromFileMock.mockResolvedValue({ mime: 'image/png', ext: 'png' });

    const req = mockReq(tmpFile, '.png');
    const res = mockRes();
    const next = jest.fn();

    await validateAndRenameAvatar(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.file.filename).toMatch(/\.png$/);
    // cleanup
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    tmpFile = null; // must set to null — afterEach path no longer exists after rename
  });

  test('returns 500 and deletes file when fs.promises.rename throws', async () => {
    tmpFile = makeTempFile('.php'); // wrong extension triggers rename
    fileTypeFromFileMock.mockResolvedValue({ mime: 'image/jpeg', ext: 'jpg' });

    // Spy on fs.promises.rename and make it throw
    const renameSpy = jest.spyOn(fs.promises, 'rename').mockRejectedValueOnce(new Error('EXDEV'));

    const req = mockReq(tmpFile, '.php');
    const res = mockRes();
    const next = jest.fn();

    await validateAndRenameAvatar(req, res, next);

    expect(res.statusCode).toBe(500);
    expect(next).not.toHaveBeenCalled();
    expect(fs.existsSync(tmpFile)).toBe(false); // file deleted in catch
    tmpFile = null;

    renameSpy.mockRestore();
  });
});
