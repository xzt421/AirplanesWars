$("#start").on("touchstart", start); //点击开始游戏

var timerBg = null,
	timerDj = null,
	timerJf = null,
	timer = null;

function start() {
	//开始游戏之后初始化
	init();
	$(this).css("display", "none"); //隐藏开始游戏的div
	bgMove(); //背景移动动画
	timerBg = setInterval(function() {
		bgMove();
	}, 5000)

	//随机出现敌机并移动
	timerDj = setInterval(function() {
		enemyMove();
		$.each($(".box .enemy"), function() {
			if($(this).offset().top >= $(".box").height()) {
				$(this).remove();
			}
		});
	}, 1500)

	//己方战机跟随触摸移动
	var startX = 0,
		startY = 0,
		thatL = 0,
		thatR = 0;
	$(document).on("touchstart", function(e) {
		startX = e.changedTouches[0].clientX;
		startY = e.changedTouches[0].clientY;
		thatL = $("#me").offset().left;
		thatT = $("#me").offset().top;
	})
	$(document).on("touchmove", function(e) {
		//var x = e.changedTouches[0].clientX - startX + thatL + $("#me").width() / 2,
		//	y = e.changedTouches[0].clientY - startY + thatT;
		var x = e.changedTouches[0].clientX - startX + thatL,
			y = e.changedTouches[0].clientY - startY;
		x = fn(x, $("#me").width() / 2, $(".box").width() - $("#me").width() / 2);
		y = fn(y, 0, $(".box").height() - $("#me img").height());
		$("#me").css({
			"top": y / 25 + "rem",
			"left": x / 25 + "rem"
		})
	})

	//己方子弹
	timerJf = setInterval(function() {
		bulletMove($(".box"));
		$.each($(".box .bullet"), function() {
			if($(this).offset().top <= 0) {
				$(this).remove();
			}
		});
	}, 500)

	timer = setInterval(function() {
		//己方子弹击中敌机
		$.each($(".enemy"), function() {
			//that是敌机，this是己方子弹
			var that = $(this);
			$.each($(".bullet"), function() {
				var thisL = $(this).offset().left,
					thisT = $(this).offset().top,
					thatL = that.offset().left,
					thatT = that.offset().top;
				if(thisT <= thatT + that.height() && Math.abs(thatL - thisL + that.width() - that.width()) <= that.width()) {
					$("#current").html(Number($("#current").html()) + 1);
					$(this).remove();
					boom(that.offset().left, that.offset().top);
					that.animate({
						"opcity": 0,
						"top": thatT + "px"
					}, function() {
						that.remove();
					})
				}
			});
		});

		//己方战机与敌机相撞
		$.each($(".enemy"), function() {
			//this是敌机，that是己方战机
			var thisL = $(this).offset().left,
				thisT = $(this).offset().top,
				thatL = $("#me").offset().left,
				thatT = $("#me").offset().top;
			if(thatT - thisT <= $(this).height() && thisT - thatT <= $("#me").height()) {
				if(Math.abs(thatL - thisL + $("#me").width() - $("#me").width()) <= $("#me").width()) {
					boom($(this).offset().left, $(this).offset().top);
					$(this).animate({
						"opcity": 0,
						"top": thatT + "px"
					}, function() {
						$(this).remove();
						clear();//清除所有定时器
						$(document).off("touchmove");//己方战机解除跟随移动
						$("#end").css("display", "block");//显示分数结果
						$("#df").css("display","none");//隐藏头部分数显示
						//修改分数
						$("#fen span").html($("#current").html());
						if(Number($("#current").html()) > Number($("#history span").html())) {
							$("#best span").html(Number($("#current").html()));
							$("#history span").html($("#best span").html());
						} else {
							$("#best span").html(Number($("#history span").html()));
						}
					})
				}
			}
		});
	}, 10)
}

//重新开始
$("#btn").on("touchstart", function() {
	$(this).css("background", "linear-gradient(RGBA(84, 126, 141,1) 45%, RGBA(0, 62, 85,1) 45%)");
	$(this).on("touchend", function() {
		$(this).css("background", "linear-gradient(RGBA(84, 126, 141,0.5) 45%, RGBA(0, 62, 85,0.5) 45%)");
		$("#end").css("display", "none");
		start();
	})
})

//初始化
function init() {
	clear();
	$("#df").css("display", "block"); //显示分数
	$("#current").html("0")
	$("#me").css({
		"top": "23rem",
		"left": "7.5rem"
	}); //初始化己方战机的位置
	$.each($(".bullet"), function() {
		$(this).remove();
	});
	$(".box").append("<img src='img/bullet.png' class='bullet'/>");
	$.each($(".enemy"), function() {
		$(this).remove();
	});
}

//清除定时器
function clear() {
	clearTimeout(timerBg);
	clearInterval(timerDj);
	clearInterval(timerJf);
	clearInterval(timer);
}

//背景移动
function bgMove() {
	$("#bg").html("<img src='img/bg.jpg'/>" + $("#bg").html());
	$("#bg img").first().addClass("first").siblings().removeClass("first");
	$("#bg img").last().remove();
}

//敌机移动
function enemyMove() {
	$(".box").append("<div class='enemy' style='left:" + (Math.random() * ($(".box").width() - $(".enemy img").width()) / 25 + ($(".enemy img").width() - $(".enemy").width()) / 50) + "rem;' ><img src='img/enemy.png' /></div>");
	$(".box").children(".enemy:last-child").css("top", $(".box").height() / 25 + "rem");
}

//子弹移动
function bulletMove(obj) {
	obj.append("<img src='img/bullet.png' class='bullet' style='top:" + ($("#me").offset().top - $(".bullet").height() / 2) / 25 + "rem;left:" + ($("#me").offset().left + 15) / 25 + "rem;'/>");
	obj.find(".bullet").css("top", -$(".box").height() / 25 + "rem");
}

//爆炸特效
function boom(left, top, callback) {
	var t = 1;
	var timer = setInterval(function() {
		$(".boom").css({
			"display": "block",
			"background": "url(img/explosion" + t + ".png) no-repeat",
			"left": left,
			"top": top
		});
		if(t < 19) {
			t++;
		} else {
			clearInterval(timer);
			$(".boom").css("display", "none");
		}
	}, 10)
}

//比较大小
function fn(current, min, max) {
	if(current <= min) {
		return min;
	} else if(current >= max) {
		return max;
	} else {
		return current
	}
}
