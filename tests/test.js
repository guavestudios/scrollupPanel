var uiwait = 60;

function takeScreenshot() {
  if (window.callPhantom) {
    var date = new Date()
    var filename = "screenshots/" + date.getTime()
    console.log("Taking screenshot " + filename)
    callPhantom({'screenshot': filename})
  }
}
function scrollPage(px,done) {
	$(window).scrollTop(px);
	setTimeout(done,uiwait);
}

describe("Basic Tests",function() {
	var header = $(".fixedheader");
	var cls = "scrollupPanel-fixed";

	before(function() {
		header.scrollupPanel({
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
		}, uiwait);
	});
	it("should have received the class", function() {
		expect(header.hasClass(cls)).to.be.true;
	});

	it("should scroll 300px down", function(done){
		$(window).scrollTop(0);

		setTimeout(function() {
			expect($(window).scrollTop()).to.equal(0);
			done();
		}, uiwait);
	});
	it("should have removed the class", function() {
		expect(header.hasClass(cls)).to.be.false;
	});
	it("should be destroyed", function() {
		header.scrollupPanel("destroy");
		expect(header.data("scrollMenu")).to.be.null;
		expect(header.hasClass(cls)).to.be.false;
	});

  /*
	afterEach(function () {
		if (this.currentTest.state == 'failed') {
			takeScreenshot();
		}
	});
	*/
});

describe("Scrollup Test",function() {
	var header = $(".fixedheader");
	var cls = "scrollupPanel-fixed";
	var height = header.height();
	var scrollup = 50;

	before(function() {
		header.scrollupPanel({
			scrollUpHeight: scrollup
		});
	});
	it("should not fix", function(done) {
		scrollPage(25,function() {
			expect(header.hasClass(cls)).to.be.false;
			done();
		});
	});
	it("should fix some pixel up", function(done) {
		scrollPage(300,function() {
			expect(header.hasClass(cls)).to.be.true;
			expect(header.css("top")).to.eql(-scrollup+"px");
			done();
		});
	});
	it("should un fix", function(done) {
		scrollPage(0,function() {
			expect(header.hasClass(cls)).to.be.false;
			expect(header.css("top")).to.eql("auto");
			done();
		});
	});

});
