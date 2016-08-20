/* 界面自定义 */
var MenuCustom = function() {
	this.process();
};
MenuCustom.prototype = {
	// 执行
	process: function() {
		if (tpl_ext_info.custom) {
			for (var index in tpl_ext_info.custom.menu) {
				switch (tpl_ext_info.custom.menu[index]) {
					case "start-menu":
						this.customStartMenu(this.getStartMenuContent(tpl_ext_info.custom.game_name));
						break;
					case "game-over-menu":
						this.customGameOverMenu(this.getGameOverMenuContent(tpl_ext_info.custom.game_name));
						break;
					default:
						break;
				}
			}
		}
	},
	// 自定义开始界面
	customStartMenu: function(data) {
		var html = data.html;
		var options = data.options;
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
				case "banner":
					$("#start-menu .game-img game-img-start-menu").hide();
					break;
				default:
					break;
			}
		}
	},
	// 自定义结束界面
	customGameOverMenu: function(data) {
		var html = data.html;
		var options = data.options;
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
	},
	// 获取开始界面定制内容
	getStartMenuContent: function(game_name) {
		switch (game_name) {
			case "plato":
				return {
					html: "",
					options: {"hide":["rank", "btn-rule", "btn-rank"]}
				}
				break;
			default:
				return "";
				break;
		}
	},
	// 获取结束界面定制内容
	getGameOverMenuContent: function(game_name) {
		switch (game_name) {
			case "tiger":
				return {
					html: "<div id='q_result_wrap'><div id='q_result_img'></div><h3 id='q_result_h'>"+platform_config["game"]["results"][0]["title"]+"</h3></div><p id='q_result_t'>"+platform_config["game"]["results"][0]["detail"]+"</p>",
					options: {"hide":["rank", "btn-rule", "btn-rank"]}
				}
				break;
			default:
				return "";
				break;
		}
	}
};

