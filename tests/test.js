function takeScreenshot() {
  if (window.callPhantom) {
    var date = new Date()
    var filename = "screenshots/" + date.getTime()
    console.log("Taking screenshot " + filename)
    callPhantom({'screenshot': filename})
  }
}

describe("Basic Tests",function() {

	before(function() {
		$(".fixedheader").scrollupPanel({
		});
	});
	it("should be loaded", function() {
		expect($.fn.scrollupPanel).to.not.be.null;
	});
	it("should scroll 300px down", function(done){
		$(window).scrollTop(300);

		setTimeout(function() {
			expect($(window).scrollTop()).to.equal(300);
			done();
		}, 200);
	});
	it("should have received the class", function() {
		expect($(".fixedheader").hasClass("scrollupPanel-fixed")).to.be.true;
	});

	it("should scroll 300px down", function(done){
		$(window).scrollTop(0);

		setTimeout(function() {
			expect($(window).scrollTop()).to.equal(0);
			done();
		}, 200);
	});
	it("should have removed the class", function() {
		expect($(".fixedheader").hasClass("scrollupPanel-fixed")).to.be.false;
	});

	afterEach(function () {
    if (this.currentTest.state == 'failed') {
      //takeScreenshot();
    }
  });



});
