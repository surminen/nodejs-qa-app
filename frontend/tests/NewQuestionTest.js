const newQuestion = require("NewQuestion");

const chai = require("chai");
const should = chai.should();

chai.should();

/*
* Test the updateTitle function
*/
describe("Updating the title", function() {
  it('should set the new title value', function (done) {
    newQuestion.updateTitle('newTitleValue');
  })})
