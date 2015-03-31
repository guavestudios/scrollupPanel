"format cjs";
(function (root, factory) {
  if (typeof exports === 'object') {
    // CommonJS
    module.exports = factory(require('jquery'));
  } else if (typeof define === 'function' && define.amd) {
    // AMD
    define(['jquery'], function (jQuery) {
      return (root.returnExportsGlobal = factory(jQuery));
    });
  } else {
    // Global Variables
    root.returnExportsGlobal = factory(window.jQuery);
  }
}(this, function ($) {

	//scrollup menu with partial visible menu
	//deps jQuery
	function ScrollUpPanel(){
		var self=this;

		var scrollTop=0;
		var panelHeight=0;
		var panelTopOffset=0;
		var panelInnerHeight=0;
		var panelScroll=0;
		var spacer=$("<div>");
		var isFixed=false;
		var scrollUpStart=0;

		self.options={
			element:null,
			elementInner:null,
			context:$(window),
			dock:null,
			debug:false,
			fixedClass:"scrollupPanel-fixed"
		};
		function init(element,opts){
			self.options=$.extend({},self.options,opts);
			self.options.element=element;

			updateSizes();
			updateScroll();
			self.options.context.on("scroll",onScroll);
			self.options.context.on("resize",onResize);
		}
		function updateSizes(){
			panelHeight=self.options.element.height();
			if (!isFixed)
				panelTopOffset=self.options.element.offset().top;
			else
				panelTopOffset=spacer.offset().top;
			panelInnerHeight=((typeof self.options.scrollUpHeight == "function")?self.options.scrollUpHeight():self.options.scrollUpHeight) || 0;
			spacer.height(panelHeight);
			scrollUpStart=0;

			if (self.options.debug) info("panelHeight",panelHeight);
		}
		function updateScroll(force){
			var scrollTopNew=self.options.context.scrollTop();
			if (scrollTopNew==scrollTop && !force) return;

			if (self.options.debug) info("scroll",scrollTopNew);
			var header=self.options.element;
			var dockBottom=0;
			if (self.options.dock){
				dockBottom=self.options.dock.getVisiblePanelBottom();
			}

			var panelPos=panelTopOffset+panelInnerHeight-dockBottom;

			if (scrollTopNew>panelPos && !isFixed){
				spacer.height(panelHeight);
				header.after(spacer);
				header.css({
					top:-panelInnerHeight+dockBottom,
					position:"fixed"
				});
				isFixed=true;
				header.addClass(self.options.fixedClass);
				if (self.options.debug) info("isFixed",isFixed);
			} else if (scrollTopNew<(panelPos-panelScroll) && isFixed) {
				spacer.detach();
				header.css({
					top:"",
					position:""
				});
				isFixed=false;
				header.removeClass(self.options.fixedClass);
				if (self.options.debug) info("isFixed",isFixed);
			}

			if (isFixed){
				var top=Math.max(0,Math.min(scrollTopNew-scrollUpStart,panelInnerHeight));
				scrollUpStart=scrollTopNew-top;
				panelScroll=panelInnerHeight-top;
				header.css("top",-top+dockBottom);
				if (self.options.debug) info("fixedTop",top);
			} else {
				scrollUpStart=0;
			}

			scrollTop=scrollTopNew;
		}
		function onResize(){
			ScrollUpPanel.animationFrame.request(function(){
				updateSizes(true);
				updateScroll(true);
			});
		}
		function onScroll(){
			if (window.requestAnimationFrame)
				ScrollUpPanel.animationFrame.request(updateScroll);
			else
				updateScroll();
		}
		function invalidate(){
			updateSizes(true);
			updateScroll(true);
		}
		function getPanelHeight(){
			return panelHeight;
		}
		function getPanelTopOffset(){
			return panelTopOffset;
		}
		function getPanelScroll(){
			return panelScroll;
		}
		function getIsFixed(){
			return isFixed;
		}
		function getVisiblePanelBottom(){
			return panelHeight-panelInnerHeight+panelScroll;
		}

		this.init=init;
		this.getPanelHeight=getPanelHeight;
		this.getPanelTopOffset=getPanelTopOffset;
		this.isFixed=isFixed;
		this.getPanelScroll=getPanelScroll;
		this.getVisiblePanelBottom=getVisiblePanelBottom;
		this.invalidate=invalidate;
	}
	ScrollUpPanel.animationFrame={
		queue:[],
		running:false,
		request:function(cb){
			this.queue.push(cb);
			if (!this.running) {
				this.running=true;
				window.requestAnimationFrame(this.requestDone.bind(ScrollUpPanel.animationFrame));
			}

		},
		requestDone:function(){
			var done=this.queue.slice();
			this.queue.length=0;
			this.running=false;
			done.forEach(function(item){
				item();
			});
		}
	}

	$.fn.scrollupPanel=function(opts){
		var id="scrollMenu";
		var $elem=$(this);
		var m=$elem.data(id);
		if (m) return m;

		return $elem.each(function(){
			var $this=$(this);
			var d=$this.data(id);
			if (d) return d;
			var menu=new ScrollUpPanel();
			menu.init($this,opts);
			$this.data(id,menu);
			return menu;
		});
	}
	return ScrollUpPanel;

}));
