/**	author:http://www.xiaoboy.com(小虾虎鱼)
 *	2013-3-31
 *	穗溪原创
 */
(function($){
	$.fn.saySlide=function(options){
		options=options||{};
		var defaults={
			autoTime:3000,//自动播放时间间隔
			speed:500,//切换速度
			autodir:'RL',//自动播放方向，LR左到右，RL右到左，TB上到下，BT下到上, jQuery自带的动画：jq.fadeOut , jq.slideUp , jq.hide
			isTitle:false,//是否显示标题
			isBlank:true,//是否在新窗口打开链接
			isBottombg:true,//是否显示底部半透明背景,该设置只有在isTitle为false生效
			defaultBg:"#999999",//定义底部按钮默认颜色
			currentBg:"#ffffff",//定义底部按钮激活状态颜色
			btnAlign:"center",//按钮左中右位置，left,center,right
			fontSize:"14px"
		};
		var _this=$(this), len=_this.children().length, _thisChildren;
		options.Width=_this.width() || 0;
		options.Height=_this.height() || 0;
		options.Imgs=options.ImgsO=_this.children();
		options.nowImg=0;
		options.isLink = $(options.Imgs[0]).attr("href") === undefined ? false : true; //根据第一张图片是否有href属性来判断是否给图片加上链接
		var options=$.extend(defaults,options);
		switch(options.autodir){
			case "LR":options.pos="right";break;
			case "RL":options.pos="left";break;
			case "BT":options.pos="top";break;
			case "TB":options.pos="bottom";break;
			default:
				if(/jq\./.test(options.autodir)){
					options.jq=options.autodir.slice(3);
					options.autodir="jq";
				}else{
					alert("autodir参数不正确");
				}
		}
		var SaySlide=function(opt){
			this.opt=opt;
		}
		SaySlide.prototype={
			_init:function(){
				this.BulkImgs();
				this.AutoPlay();
				this.PausePlay();
				this.BtnClick();
			},
			BoxBtn:function(){
				var me=this.opt, boxHtml='';
				for(var i=0;i<len;i++){
					var bg=i==0?me.currentBg:me.defaultBg;
					boxHtml+='<i style="background-color:'+ bg +'" index="'+ i +'"></i>';
				}
				var textAlign=me.isTitle==true ? "right" : me.btnAlign;
				boxHtml='<div class="saySlide-bottom-btn" style="text-align:'+ textAlign +'"><span>'+ boxHtml +'</span></div>';
				return boxHtml;
			},
			BulkImgs:function(){
				var me=this.opt, ImgsArr=new Array;
				for(var i=0;i<len;i++){
					if(me.isLink===true){
						var link=$(me.Imgs[i]).attr({"width":me.Width,"height":me.Height}).attr("href");
						$(me.Imgs[i]).removeAttr("href");
						ImgsArr[i]="<a href='"+ link +"' index='"+ i +"'>"+me.Imgs[i].outerHTML+'</a>';
					}else{
						$(me.Imgs[i]).attr({"width":me.Width,"height":me.Height});
						ImgsArr[i]="<a index='"+ i +"'>"+me.Imgs[i].outerHTML+'</a>';
					}
				}				
				if(me.autodir=="LR" || me.autodir=="TB" || me.autodir=="jq"){
					var ImgsStr=ImgsArr.reverse().join('');
				}else{
					var ImgsStr=ImgsArr.join('');
				}
				_this.html(ImgsStr);
				me.Imgs=_this.children();
				if(me.autodir!="jq"){
					_this.wrapInner("<div class='saySlide-box' />");
					_thisChildren=_this.children("div.saySlide-box");
					var divWidth=me.autodir=="LR" || me.autodir=="RL" ? me.Width*len :me.Width;
					_thisChildren.width(divWidth).css(me.pos,"0");
				}else{
					_this.addClass("saySlide-fade");
				}
				var opacityBg=me.isBottombg===true || me.isTitle===true ? '<div class="saySlide-opacity-bg"></div>' : '';//如果有标题，则透明背景强制显示
				_this.append(this.BoxBtn() + opacityBg);
				me.BtnArr=_this.find("i");
				if(me.isTitle===true){
					this.BuildTitle();
				}
			},
			/* 构造标题 */
			BuildTitle:function(){
				var _w=14*len, me=this.opt;
				_w=me.Width - _w - 20 - 40;
				_this.append('<div class="saySlide-title" />');
				me.titleBox=_this.children("div.saySlide-title").css({"font-size":me.fontSize,width:_w});
				me.titleBox.text($(me.ImgsO[0]).attr("alt"));
			},
			/* 自动播放 */
			AutoPlay:function(){
				var self=this, me=this.opt;
				self.t=setInterval(function(){
					self.PicPlay();
				},me.autoTime);
			},
			/* 鼠标经过时清除定时 */
			PausePlay:function(){
				var self=this;
				_this.hover(function(){
					clearInterval(self.t);
				},function(){
					self.AutoPlay();
				});
			},
			PicPlay:function(){
				var me=this.opt;
				if(me.autodir=="RL" || me.autodir=="BT"){
					this.MoveV(me.autodir);
				}else if(me.autodir=="LR" || me.autodir=="TB"){
					this.MoveH(me.autodir);
				}else if(me.autodir=="jq"){
					this.MovejQ();
				}
				var current=me.nowImg > len-1 ? 0 : me.nowImg;
				$(me.BtnArr[current]).css("background-color",me.currentBg).siblings().css("background-color",me.defaultBg);
				if(me.isTitle===true){
					me.titleBox.text($(me.ImgsO[current]).attr("alt"));
				}
			},
			/* 点击标签按钮 */
			BtnClick:function(){
				var self=this, me=this.opt;
				_this.delegate("i","click",function(){
					var clicked=parseInt($(this).attr("index"));
					me.nowImg=clicked;
					if(me.autodir=="RL" || me.autodir=="BT"){
						var prevImgs=_thisChildren.find("a[index='"+ clicked +"']").prevAll();
						prevImgs=$.makeArray(prevImgs).reverse();
						_thisChildren.css(me.pos,"0");
						$(prevImgs).appendTo(_thisChildren);
					}else if(me.autodir=="LR" || me.autodir=="TB"){
						var prevImgs=_thisChildren.find("a[index='"+ clicked +"']").nextAll();
						_thisChildren.css(me.pos,"0");
						$(prevImgs).prependTo(_thisChildren);						
					}else if(me.autodir=="jq"){
						var prevImgs=_this.find("a[index='"+ clicked +"']").nextAll("a");
						prevImgs.prependTo(_this);
					}
					$(this).css("background-color",me.currentBg).siblings().css("background-color",me.defaultBg);
				});				
			},
			/* 从右到左播放 、 从下到上播放 */
			MoveV:function(type){
				var me=this.opt, current;
				me.nowImg = me.nowImg+1 > len ? 1 : me.nowImg+1;
				current = me.nowImg - 1;
				if(type=="RL"){
					_thisChildren.animate({"left":"-"+me.Width},me.speed,function(){
						$(me.Imgs[current]).appendTo($(this));
						$(this).css("left","0");
					});
				}else if(type=="BT"){
					_thisChildren.animate({"top":"-"+me.Height},me.speed,function(){
						$(me.Imgs[current]).appendTo($(this));
						$(this).css("top","0");
					});
				}
			},
			/* 淡入淡出 */
			MovejQ:function(){
				var me=this.opt, current;
				me.nowImg = me.nowImg+1 > len-1 ? 0 : me.nowImg+1;
				current = len - me.nowImg == len ? 0 : len-me.nowImg;
				var arg1=me.speed;
				var arg2=function(){$(this).prependTo(_this).show();};
				if(me.jq=="fadeOut"){
					$(me.Imgs[current]).fadeOut(arg1,arg2);
				}else if(me.jq=="hide"){
					$(me.Imgs[current]).hide(arg1,arg2);
				}else if(me.jq=="slideUp"){
					$(me.Imgs[current]).slideUp(arg1,arg2);
				}else{
					return ;
				}
				
			},
			/* 从左到右播放 、 从上到下播放 */
			MoveH:function(type){
				var me=this.opt, current;
				me.nowImg = me.nowImg+1 > len-1 ? 0 : me.nowImg+1;
				current = len - me.nowImg == len ? 0 : len-me.nowImg;
				if(type=="LR"){
					_thisChildren.animate({"right":"-"+me.Width},me.speed,function(){
						$(me.Imgs[current]).prependTo($(this));
						$(this).css("right","0");
					});
				}else if(type=="TB"){
					_thisChildren.animate({"bottom":"-"+me.Height},me.speed,function(){
						$(me.Imgs[current]).prependTo($(this));
						$(this).css("bottom","0");
					});
				}
			}
		}
		var _SaySlide=new SaySlide(options);
		_SaySlide._init();
	}
})(jQuery);