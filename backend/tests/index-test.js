const app = require("../built/index.js");
const server = require('../built/index');

const chai = require("chai");
const chaiHttp = require('chai-http');
const should = chai.should();
const expect = require('Chai').expect;

var request = require('request');

// const expect = chai.expect;

// Configure chai
chai.use(chaiHttp);
chai.should();

// // Test setup
// describe('Test setup', () => {
//   beforeEach((done) => { //Before each test we ...
//         console.log("foobar");
//          done();           
//       });        
// });

/*
* Test the /GET route
*/
describe("get all entries", function() {
  it('should return 200 and an empty array', function (done) {
    request.get('http://localhost:8081', function (err, res, body){
      expect(res.statusCode).to.equal(200);
      expect(res.body).to.equal('[]');
      done();
    });
  });
});

