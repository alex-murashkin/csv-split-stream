'use strict';

const
  assert = require('assert'),
  byline = require('byline');

function split(inputStream, opts, createOutputStreamCallback) {
  let outputStream = null;
  let chunkIndex = 0;
  let lineIndex = 0;
  let header;
  const options = {
    delimiter: opts.delimiter || '\n',
    lineLimit: opts.lineLimit
  };

  return new Promise((resolve, reject) => {
    assert(inputStream, 'Provide inputStream');
    assert(options.lineLimit > 0, 'Provide non-negative lineLimit');
    let lineStream;

    function handleError(err) {
      if (outputStream) {
        outputStream.end();
      }
      reject(err);
    }

    inputStream.on('error', handleError);

    try {
      lineStream = byline(inputStream);
    } catch(err) {
      handleError(err);
      return;
    }

    lineStream.on('data', line => {
      if (!header) {
        header = line;
      } else {
        if (lineIndex === 0) {
          if (outputStream) {
            outputStream.end();
          }
          outputStream = createOutputStreamCallback(chunkIndex++);
          outputStream.write(header);
          outputStream.write(options.delimiter);
        }

        outputStream.write(line);
        outputStream.write(options.delimiter);
        lineIndex = (++lineIndex) % options.lineLimit;
      }
    });

    lineStream.on('error', handleError);
    lineStream.on('end', () => {
      if (!header) {
        reject(new Error('The provided CSV is empty'));
        return;
      }

      if (outputStream) {
        outputStream.end();
      } else {
        outputStream = createOutputStreamCallback(chunkIndex++);
        outputStream.write(header);
        outputStream.write(options.delimiter);
        outputStream.end();
      }

      resolve({
        totalChunks: chunkIndex,
        options: options
      });
    });
  });
}

module.exports = {
  split
};
