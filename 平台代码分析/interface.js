/*-------------------------------------------

			跳转结束界面

-------------------------------------------*/
// 跳转结束界面
function toGameOverMenu() {
	// 显示结束界面
	$('.game-over-menu').show();
	// 显示弹窗
	showBox();
	// 如果获奖则显示奖品中心按钮
	if (gift_center_data.length > 0) $(".btn-giftcenter").show();
}

// 设置抽奖结果（由于分享得奖之后要重新体验一遍）
var lottery_result = null;
function setLotteryResult() {
	left_times--;
	$(".gameover-remind").addClass("hidden");
	if (lottery_result == "empty") {
		$("#game-over-menu .gift-has-container").addClass("hidden");
		$("#game-over-menu .gift-empty-container").removeClass("hidden");
	} else {
		// 显示对应的界面
		$("#game-over-menu .gift-has-container").removeClass("hidden");
		$("#game-over-menu .gift-empty-container").addClass("hidden");
		// 配置奖品信息
		var gift_name = lottery_result.name;
		var img_src = lottery_result.img;
		if (lottery_result['rp_total']) {
			gift_name += "(共"+lottery_result['rp_total']+"元)";
			if (lottery_result['rp_type'] == 2) { // 普通红包
				img_src = "/images/t/giftmoney-common-opened.png";
			} else {
				img_src = "/images/t/giftmoney-common-opened.png";
			}
		}
		$("#game-over-menu .gift-has-container .game-img").attr("name", lottery_result["record_id"]);
		$("#game-over-menu .gift-has-container .game-img img").attr("src", img_src);
		$("#game-over-menu .gift-has-container .game-over-text-gift-name").text(gift_name);
	}
	$('.game-over-menu').show();
	if (gift_center_data.length > 0) $(".btn-giftcenter").show();
}

/*-------------------------------------------

			自定义界面

-------------------------------------------*/
// 自定义开始界面
function customStartMenu(html, options) {
	// 替换特定区域
	$("#start-menu .custom-container").html(html);
	// 隐藏对应UI
	for (var index in options.hide) {
		switch (options.hide[index]) {
			case "rank": 
				$("#start-menu .best-score").hide();
				break;
			case "test-remind": 
				$("#start-menu .test-remind-div").hide();
				break;
			case "btn-start": 
				$("#start-menu .game-start-btn").hide();
				break;
			case "btn-rule":
				$("#start-menu .game-rule-btn").hide();
				break;
			case "foot":
				$("#start-menu .start-menu-foot").hide();
				break;
			default:
				break;
		}
	}
}

// 自定义开始界面
function customGameOverMenu(html, options) {
	// 替换特定区域
	$("#game-over-menu .custom-container").html(html);
	// 隐藏对应UI
	for (var index in options.hide) {
		switch (options.hide[index]) {
			case "rank": 
				$("#game-over-menu .best-score").hide();
				break;
			case "test-remind": 
				$("#game-over-menu .test-remind-div").hide();
				break;
			case "btn-again": 
				$("#game-over-menu .play-again-btn").hide();
				break;
			case "btn-rank":
				$("#game-over-menu .rank-btn").hide();
				break;
			case "btn-rule":
				$("#game-over-menu .game-rule-btn").hide();
				break;
			case "foot":
				$("#game-over-menu .gameover-menu-foot").hide();
				break;
			default:
				break;
		}
	}
}