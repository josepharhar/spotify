const http = require('http');
const fs = require('fs');
const url = require('url');
const querystring = require('querystring');
const stream = require('stream');

const {clientId, clientSecret} = JSON.parse(fs.readFileSync('secrets.json'));

/**
 * @param {!stream.ReadableStream} stream
 * @return {!Promise<string>}
 */
async function streamToString(stream) {
  return new Promise((resolve, reject) => {
    let str = '';
    stream.on('data', data => {
      str += data;
    });
    stream.on('end', () => resolve(str));
    stream.on('error', err => reject(err));
  });
}

/**
 * @param {!string} unparsedUrl
 * @param {!string} method
 * @param {!object<string, string>} headers
 * @param {?string} postdata
 * @return {!Promise<http.IncomingMessage>}
 */
async function request(unparsedUrl, method, headers, postdata) {
  const parsedUrl = url.parse(unparsedUrl);
  // TODO(jarhar): make case insensitive with passed values?
  headers['content-length'] = Buffer.byteLength(postdata);
  const postOptions = {
    hostname: parsedUrl.hostname,
    port: parsedUrl.port,
    path: parsedUrl.pathname,
    method: method,
    headers: headers
  };

  return new Promise((resolve, reject) => {
    const req = http.request(postOptions, res => {
      resolve(res);
    });
    req.on('error' err => {
      reject(err);
    });
    req.write(postdata);
    req.end();
  });
}

const postdata = querystring.stringify({
  'paramone': 'valueone',
  'paramtwo': 'valuetwo'
});

(async () => {

  await post('http://localhost:8000/post', postdata);

})();
