var helpers = require('./helpers.js'),
    enc = require('./run_lengths.js');

function readRow(row) {
  var rls = helpers.runLengths(row);

  // find guard

  var cursor = findGuard(rls);

  if (cursor == null) {
    return null;
  }

  // decode left group

  cursor += 3; // left guard

  var left = readGroup(rls, cursor, enc.left);

  cursor += 24; // previous group
  cursor += 5; // middle guard

  var right = readGroup(rls, cursor, enc.right);

  if (left == null || right == null) {
    return null;
  } else {
    return [].concat(left, right);
  }
}

function findGuard(rls) {
  var guard = enc.guard;

  var chunk, diff;

  for (var i = 0; i < rls.length - 2; i++) {
    chunk = rls.slice(i, i + 3);
    diff = helpers.difference(chunk, guard);

    if (diff < 0.2) {
      return i;
    }
  }

  return null;
}

function readGroup(rls, offset, encodings) {
  var result = [],
      chunk, code;

  for (var i = 0, j; i < 6; i++) {
    j = offset + i * 4;
    chunk = rls.slice(j, j + 4);
    code = readChunk(chunk, encodings);

    if (code == null) {
      return null;
    }

    result.push(code);
  }

  return result;
}

function readChunk(chunk, encodings) {
  if (chunk.length != 4) {
    return null;
  }

  var res = {
    diff: null,
    code: null
  };

  var code, diff;

  for (code in encodings) {
    diff = helpers.difference(chunk, encodings[code]);

    if (res.diff == null || diff < res.diff) {
      res.diff = diff;
      res.code = code;
    }
  }

  return res.code;
}

exports.read = readRow;
exports.findGuard = findGuard;
exports.readGroup = readGroup;
exports.readChunk = readChunk;