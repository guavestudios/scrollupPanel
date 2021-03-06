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
    //root.returnExportsGlobal = factory(window.jQuery);
    root.ScrollUpPanel = factory(window.jQuery);
  }
}(this, function ($) {

	//scrollup menu with partial visible menu
	//deps jQuery
	function ScrollUpPanel(){
		var self=this;

		var scrollTop=0;
		var panelWidth=0;
		var panelHeight=0;
		var panelTopOffset=0;
		var panelLeftOffset=0;
		var panelInnerHeight=0;
    var panelInnerOffset=0;
		var panelMarginTop=0;
		var panelScroll=0;
		var panelBottomLimit=0;
		var contextHeight=0;
		var contextScrollHeight=0;
		var spacer=$("<div>");
		var isFixed=false;
		var scrollUpStart=0;

		var widthMin=0;
		var widthMax=Number.MAX_VALUE;
		var widthContext=1;
    var heightMax=Number.MAX_VALUE;

		//debug output
		var info=null;

		//Default Options
		self.options={
			element:null,
			elementInner:null,
			context:$(window),
			dock:null,
			debug:false,
			fixedClass:"scrollupPanel-fixed",
			marginTop:null,
			bottom:null,
			minWidth:null,
      maxWidth:null,
      maxHeight:null,
			setExplizitWidth:false,
			limit:null,
      panelHeight:null,
      detachAtZero: true
		};

		/**
		 * Initialize Method
		 * @param {Object} element Dom or jQuery element
		 * @param {Object} opts    Options that will extend default options
		 */
		function init(element,opts){
			self.options=$.extend({},self.options,opts);
			self.options.element=element;

			if (self.options.debug)
				info=self.options.debug;

			updateSizes();
			updateScroll();
			self.options.context.on("scroll",onScroll);
			self.options.context.on("resize",onResize);
		}
		function updateSizes(){
			var o=self.options;

      widthContext=o.context.width();
			if (o.minWidth){
				widthMin=((typeof o.minWidth == "function")?o.minWidth():o.minWidth) || 0;
			}
      if (o.maxWidth){
        widthMax=((typeof o.maxWidth == "function")?o.maxWidth():o.maxWidth) || Number.MAX_VALUE;
      }
      if (o.maxHeight){
        heightMax=((typeof o.maxHeight == "function")?o.maxHeight():o.maxHeight) || Number.MAX_VALUE;
      }

			var element=o.element;
			panelWidth=element.outerWidth();
			panelHeight=((typeof o.panelHeight == "function")?o.panelHeight():o.panelHeight) || element.outerHeight();

			var offset= isFixed?spacer.offset():element.offset();
			panelTopOffset=offset.top;
			panelLeftOffset=offset.left;

			panelInnerHeight=((typeof o.scrollUpHeight == "function")?o.scrollUpHeight():o.scrollUpHeight) || 0;

			panelMarginTop=((typeof o.marginTop == "function")?o.marginTop():o.marginTop) || 0;
			spacer.css({
				width: panelWidth-1,  //FIX: percentage values will be rounded so its possible that a element cannot float
				height: panelHeight
			});
			scrollUpStart=0;

			contextHeight=o.context.height();
			contextScrollHeight=(o.context[0]==window)?$("body")[0].scrollHeight:o.context[0].scrollHeight;
			contextScrollHeight-=contextHeight;

			panelBottomLimit=((typeof o.limit == "function")?o.limit():o.limit) || 0;

			info&&info("panelHeight",panelHeight);
		}
		function updateScroll(force){
			var scrollTopNew=self.options.context.scrollTop();
			if (scrollTopNew==scrollTop && !force) return;

			info&&info("scroll",scrollTopNew);
			var panel=self.options.element;
			var dockBottom=0;
			if (self.options.dock){
				dockBottom=self.options.dock.getVisiblePanelBottom();
			}

			//calculate panel position with all offsets calculated
			var panelPos=panelTopOffset+panelInnerHeight-dockBottom-panelMarginTop;

      var allowedToFix=(widthMin<=widthContext && widthMax>=widthContext && panelHeight<=heightMax) && !(self.options.detachAtZero && scrollTopNew==0);

      info&&info("allowFix",allowedToFix);
      //info&&info("panelHeight",panelHeight);
      //info&&info("panelHeightMax",heightMax);

			if (scrollTopNew>panelPos && !isFixed && allowedToFix){
				var left=panel.offset().left;
				updateSizes();
				spacer.css({
					width:panelWidth-1, //FIX: percentage values will be rounded so its possible that a element cannot float
					height:panelHeight,
					float:panel.css("float"),
					display:panel.css("display")
				});
        if (self.options.onSpacerInsert)
          self.options.onSpacerInsert(spacer);

				panel.after(spacer);
				panel.css({
					top:-panelInnerHeight+dockBottom,
					left:left,
					position:"fixed",
					bottom:(self.options.bottom!=null)?self.options.bottom:""


				});
				if (self.options.setExplizitWidth)
					panel.css("width",panelWidth);
				isFixed=true;
				panel.addClass(self.options.fixedClass);

				info&&info("isFixed",isFixed);
			} else if ((scrollTopNew<(panelPos-panelScroll) || !allowedToFix) && isFixed) {
				spacer.detach();
        if (self.options.onSpacerDetached)
          self.options.onSpacerDetached(spacer);
				panel.css({
					top:"",
					left:"",
					width:"",
					height:"",
					position:"",
					bottom:""
				});
				isFixed=false;
				panel.removeClass(self.options.fixedClass);

				info&&info("isFixed",isFixed);
			}

			if (isFixed){
        if (force) {
          spacer.css({
    				width: panelWidth-1,  //FIX: percentage values will be rounded so its possible that a element cannot float
    				height: panelHeight
    			});
        }

				var top=Math.max(panelInnerOffset,Math.min(scrollTopNew-scrollUpStart,panelInnerHeight))-panelMarginTop;
        scrollUpStart=scrollTopNew-top;
				panelScroll=panelInnerHeight-top;
				var limitPenalty=0;
				if (panelBottomLimit){
					var btm=getVisiblePanelBottom();
					if ((scrollTopNew+btm+panelBottomLimit)>(contextScrollHeight+contextHeight)){
						limitPenalty=contextScrollHeight+contextHeight-scrollTopNew-btm-panelBottomLimit;
					} else  limitPenalty=0;
					info&&info("limitPenalty",limitPenalty+"|"+btm+"|"+panelBottomLimit);
					info&&info("scrollTot",scrollTopNew+"/"+contextScrollHeight);
				}
				panel.css("top",-top+dockBottom+limitPenalty);
				//info&&info("fixedTop",top);
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
			if (!isFixed) return 0;
			var dockBottom=0;
			if (self.options.dock){
				dockBottom=self.options.dock.getVisiblePanelBottom();
			}
			return panelHeight-panelInnerHeight+panelScroll+dockBottom;
		}
		function getPanelBottomFull(){
			if (!isFixed) return 0;
			var dockBottom=0;
			if (self.options.dock){
				dockBottom=self.options.dock.getPanelBottomFull();
			}
			return dockBottom+panelHeight;
		}
    function destroy() {
      if (isFixed) {
        if (panel) {
          panel.css({
  					top:"",
  					left:"",
  					width:"",
  					height:"",
  					position:"",
  					bottom:""
  				});

        }
      }
      if (spacer) {
        spacer.remove();
      }
      self.options.context.off("scroll",onScroll);
			self.options.context.off("resize",onResize);
    }

		this.init=init;
		this.getPanelHeight=getPanelHeight;
		this.getPanelTopOffset=getPanelTopOffset;
		this.isFixed=isFixed;
		this.getPanelScroll=getPanelScroll;
		this.getVisiblePanelBottom=getVisiblePanelBottom;
		this.getPanelBottomFull=getPanelBottomFull;
		this.invalidate=invalidate;
    this.destroy=destroy;
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

  //JQUERY integration
	$.fn.scrollupPanel=function(opts){
		var id="scrollMenu";
		var $elem=$(this);
		var m=$elem.data(id);

    if (opts == "destroy") {
      if (m) {
        m.destroy();
        $elem.data(id,null);
      }
      return;
    }

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
