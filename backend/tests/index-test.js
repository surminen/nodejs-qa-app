const app = require("../built/index.js");
const server = require('../built/index');
const instance = require('../built/index');

const chai = require("chai");
const chaiHttp = require('chai-http');
const should = chai.should();
const expect = require('Chai').expect;

// var request = require('request');

var request = require('supertest');

// const expect = chai.expect;

// Configure chai
chai.use(chaiHttp);
chai.should();

describe('loading express', function () {
  var server;
  before(function () {
    // delete require.cache[require.resolve('../built/index')];
    server = require('../built/index');
    console.log("Started server");
  });
  after(function (done) {
    console.log("Closing server");
    server.close(done);
    // instance.close(done);
  });

  it('responds to /', function testSlash(done) {
    request(server)
      .get('/')
      .expect(200, done);
  });
  
  it('responds to /<nonexistingId> with 404', function testSlash(done) {
    request(server)
      .get('/answer/123-123-123')
      .expect(404, done);
  });

  it('responds to /<existingId> with 200', function testSlash(done) {
    request(server)
      .get('/2b60def6-f037-488a-a8a9-9118364b7dce')
        .expect(res.statusCode).to.equal(200);
  });
  
  it('404 everything else', function testPath(done) {
    request(server)
      .get('/foo/bar')
      .expect(404, done);
  });
});

// /*
// * Test the /GET route
// */
// describe("get all entries", function() {
//   before(function() {
//     // runs before all tests in this block
//   });

//   after(function() {
//     // runs after all tests in this block
//     server.close();
//   });

//   it('should return 200 and an empty array', function (done) {
//     request.get('http://localhost:8081', function (err, res, body){
//       expect(res.statusCode).to.equal(200);
//       expect(res.body).to.equal('[]');
//       done();
//     });
//   });
// });

