# csv-split-stream

[![npm version](https://badge.fury.io/js/csv-split-stream.svg)](https://badge.fury.io/js/csv-split-stream)
[![CircleCI](https://circleci.com/gh/AlexanderMS/csv-split-stream.svg?style=shield)](https://circleci.com/gh/AlexanderMS/csv-split-stream)
[![Coverage Status](https://coveralls.io/repos/github/AlexanderMS/csv-split-stream/badge.svg?branch=master)](https://coveralls.io/github/AlexanderMS/csv-split-stream?branch=master)

Splits a CSV read stream into multiple write streams.

## Install

`npm install csv-split-stream`

## Usage

1. Split a local CSV file into multiple CSV files (10000 lines each, excluding the header row):

  ```javascript
  const csvSplitStream = require('csv-split-stream');

  return csvSplitStream.split(
    fs.createReadStream('input.csv'),
    {
      lineLimit: 100
    },
    (index) => fs.createWriteStream(`output-${index}.csv`)
  )
  .then(csvSplitResponse => {
    console.log('csvSplitStream succeeded.', csvSplitResponse);
    // outputs: {
    //  "totalChunks": 350,
    //  "options": {
    //    "delimiter": "\n",
    //    "lineLimit": "10000"
    //  }
    // }
  }).catch(csvSplitError => {
    console.log('csvSplitStream failed!', csvSplitError);
  });

  ```

2. Download a large CSV file via HTTP, split it into chunks of 10000 lines and upload each of them to s3:

  ```javascript
  const http           = require('http'),
  const csvSplitStream = require('csv-split-stream');
  const AWS            = require('aws-sdk'),
  const s3Stream       = require('s3-upload-stream')(new AWS.S3());

  function downloadAndSplit(callback) {
    http.get({...}, downloadStream => {
      csvSplitStream.split(
        downloadStream,
        {
          lineLimit: 10000
        },
        (index) => s3Stream.upload({
          Bucket: 'testBucket',
          Key: `output-${index}.csv`
        })
      )
      .then(csvSplitResponse => {
        console.log('csvSplitStream succeeded.', csvSplitResponse);
        callback(...);
      }).catch(csvSplitError => {
        console.log('csvSplitStream failed!', csvSplitError);
        callback(...);
      });
    });    
  }
  ```
