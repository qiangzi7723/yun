/*-------------------------------------------

				加载脚本相关

-------------------------------------------*/
// 加载脚本
function loadScript(url, callback) {
    var script = document.createElement("script");
    script.type = "text/javascript";
    if (script.readyState) {  //IE
        script.onreadystatechange = function() {
            if (script.readyState == "loaded" || script.readyState == "complete") {
                script.onreadystatechange = null;
                callback();
            }
        };
    } else { //Others
        script.onload = function(){
            callback();
        };
    }
    script.src = url;
    document.body.appendChild(script);
}

// 加载jQuery回调
var jq, showLoading, showRemind;
function jqCallback() {
	jq = $.noConflict();

	// 手机扫码预览
    var fade_out_time;
    jq(".preview-show-qrcode").mouseenter(function() {
        jq(".preview-qrcode-container").stop().fadeIn(300);
    });
    jq(".preview-show-qrcode").mouseleave(function() {
        clearTimeout(fade_out_time);
        fade_out_time = setTimeout(function(){
            jq(".preview-qrcode-container").stop().fadeOut(300);
        }, 500);
    });
    // 鼠标移动到二维码区域，则二维码一直显示
    jq(".preview-qrcode-container").mouseenter(function(){
        clearTimeout(fade_out_time);
        jq(".preview-qrcode-container").stop().fadeIn(300);
    });
    jq(".preview-qrcode-container").mouseleave(function(){
        clearTimeout(fade_out_time);
        jq(".preview-qrcode-container").stop().fadeOut(300);
    });
    jq(".preview-qrcode-container").mousedown(function(e) {
    	if (e.which == 3) setTimeout(function() {jq(".preview-qrcode-container").stop().fadeIn(300);}, 10);
    });

	jq(".preview-qrcode-container img").attr("src", "/webCustom/DownloadQr/game_id/"+game_info["game_id"]);
	jq(".preview-qrcode-container button a").attr("href", "/webCustom/DownloadQr/game_id/"+game_info["game_id"]);

	// 显示提示
	showRemind = function(text) {
		jq("#remind-loading").addClass("hidden");
		jq("#remind-text").html(text);
		jq("#remind-container").fadeIn(300, function() {
			setTimeout(function() {
				jq("#remind-container").fadeOut(300);
			}, 2000);
		});
	}
	// 加载提示
	showLoading = function(text) {
		jq("#remind-loading").removeClass("hidden");
		jq("#remind-text").html(text);
		jq("#remind-container").fadeIn(300);
	}

    // 只能在手机上体验的
	if (configJson["mobileOnly"]) {
		jq(".game-tpl-container").mouseenter(function() {
			jq(".preview-qrcode-container").stop().fadeIn(300);
		});
	} else {
		jq(".game-tpl-container").off('mouseenter');
	}
}



/*-------------------------------------------

				游戏配置

-------------------------------------------*/
// 配置游戏
var configManager = function(_config) {
	this.styleConfig(_config['style']);
	this.textConfig(_config['text']);
	this.msgConfig(_config['message']);
	this.shareConfig(_config['message']['share']);

	// 底部链接设置
	if (!_config["bottom-show"]) $(".bottom-logo").hide();
	if (_config["text"]["brand-text"] != "") $(".icon").html(_config["text"]["brand-text"]);
	if (_config["bottom-link-set"]) {
		$(".bottom-logo a").attr("href", _config["bottom-link"]);
	} else {
		$(".bottom-logo a").removeAttr("href");
	}

	// 排行榜设置
	if (game_type == 1 || game_type == 3) {
		if (_config['disable-rank']) {
			$(".rank-btn").addClass("hidden");
			$('#start-rank-btn').addClass("disabled");
			$('#game-over-rank-btn').addClass("disabled");
			$('.game-over-menu .rank-btn').addClass("disabled");
			$(".score-text .score-text-rank").addClass("hidden");
		} else {
			$(".score-text .score-text-rank").text("第"+best_rank+"名");
		}
	} else if (game_type == 2 || game_type == 4) {
		$(".best-score").addClass("hidden");
	}

	// 非手机处理
	if (window.innerWidth > 700) {
		// 加载jQuery
		var jqUrl = "//24haowan-cdn.shanyougame.com/public/js/jquery.min.js";
		loadScript(jqUrl, jqCallback);

		// 调整游戏窗口大小
		$(".game-tpl-container").css({
			width: game_width+"px",
			height: game_height+"px"
		});

		// 将分享蒙版提到上面一层
		$(".game-tpl-container").before($(".shareMask"));

		// 一键复制到我的活动 按钮
		$("#btn-copy-case").on("click", function() {
			if (!$(this).hasClass("disabled")) {
				$(this).addClass("disabled").text("创建中");
				$.ajax({
					url: "/webAjax/CopyTplCase",
					data: {"game_id" : game_info['game_id']},
					dataType: "json",
					type: "POST",
					success: function(result) {
						if (result['code'] == 0) {
							location.href = "/webCustom/workbench/id/"+result.game_id;
						} else {
							showRemind("系统错误");
							$("#btn-copy-case").removeClass("disabled").text("一键创建我的活动");
						}
					},
					error: function(err) {
						showRemind("网络连接失败");
						console.log(err);
						$("#btn-copy-case").removeClass("disabled").text("一键创建我的活动");
					}
				});
			}
		});
	}

	// 抽奖按钮配置
	if (game_type != 2) {
		var lottery_tag = false;
		if (gift_config) {
			for (var index in gift_config) {
				if (gift_config[index].type == 5) {
					lottery_tag = true;
					break;
				}
			}
		}
		if (lottery_tag) $('.game-over-menu .lottery-btn').show();
	}
}
// 分享设置
configManager.prototype.shareConfig = function(_config) {
	var imgHtml = "<img src='"+_config["pic"]+"' style='display:none;'>";
	$("body").children().first().before(imgHtml);
}
// 表单信息设置
configManager.prototype.msgConfig = function(_config) {
	if (_config['msg']['type'] != null) {
		var str = '';
		str += "<div class='form-desc' style='margin-bottom:14px;'>"+((_config['msg']["desc"]) ? _config['msg']["desc"] : "为了便于活动的进行，请您填写一下信息，便于我们在您中奖后与您联系。")+"</div>";
		for(var i=0,len=_config['msg']['list'].length;i<len;i++) {
			str += ('<div><label>' + _config['msg']['list'][i] + ':</label><input type="text" class="main-border" data-key="' + _config['msg']['list'][i] + '"/></div>');
		}
		var height = len > 3 ? 45+(len-3)*5 : 45;
		$(".form-box").css('height',height+'%');
		$('#form-mask .label-box').append(str);
	}
}
// 文本设置
configManager.prototype.textConfig = function(_config) {
	// 最高分配置
	$('.score-text .score').each(function(k,v){
		v.innerHTML = bestScore;
	});

	// 游戏名称
	if (configJson["game-title-img-show"]) { // 显示图片
		var html = "<img src='"+configJson["game-title-img"]+"' />";
		$('.game-title').html(html);

		// 适配
		var img = new Image();
		img.onload = function() {
			var ratio = img.width/img.height;
			if (ratio > 6) {
				$('.game-title img').css("height", game_width*0.8/ratio+"px");
			} else {
				$('.game-title img').css("height", "0.5rem");
			}
		};
		img.src = configJson["game-title-img"];

	} else { // 显示文本
		$('.game-title').text(game_info['name']);
	}

	// 品牌文字
	$('.brand-text').text(_config['brand-text']);

	// 对话框文字[待定]，已无效
	// $('.prompt-box .text-content').text(_config['prompt-text']);

	// 活动规则
	var text = getActivityText();
	$('.text-box .text-content').html(text);

	// 活动已结束通知框
    var text_content = "活动已于"+ game_info['end_time'].slice(0,10) +"结束，您可以继续游戏，但是将无法获得活动奖品。";
	$('#prompt-box-mask').find('.text-content').text(text_content);

	// 分享引导文字
	$('.shareLabel').text(_config['shareLabel']);

	// 已拆封礼物描述，已无效
	// $('.gift-description').text(_config['gift-text']);

	// 分享登录文案
	$('.share-sign-in .game-wechat-text').text(_config['game-wechat-text']);

	//按钮改名字
	$('#start').text(_config['start']); // 开始按钮
	$('.game-rule-btn').text(_config['game-rule-btn']); // 活动规则按钮
	$('.share-btn').text(_config['share-btn']); // 分享给好友按钮
	$('.rank-btn').text(_config['rank-btn']); // 排行榜按钮
	$('#challenge').text(_config['challenge']); // 挑战按钮
	$('.play-again-btn').text(_config['play-again-btn']); // 再玩一次按钮

	// 构建活动规则
	function getActivityText() {
		// 活动时间
		var text = '<h3>活动时间</h3><p>' + game_info['start_time'].slice(0,16) + ' 至 ' + game_info['end_time'].slice(0,16) + '</p>';
		text += '<h3>活动规则</h3><p>' + _config['activity-text'] + '</p>';
		// 众里寻他特别说明
		if (configJson["text"]["game-title-text"] == "众里寻他") {
			text += '<h3>寻找目标</h3>';
			text += "<img src='"+configJson["platform"]["texture"]["man"][0]["url"]+"'>";
		}
		// 是否显示奖品发放规则
		var show_gift = true;
		if (configJson["activity-gift-show"]) {
			if (configJson["activity-gift-show"] == "yes") {
				show_gift = true;
			} else {
				show_gift = false;
			}
		}
		// 奖品发放规则
		if (gift_config && show_gift) {
			if (gift_config.length > 0) { // 有设置奖品
				var html = "<h3>奖品说明</h3>";
				for (var gift_index in gift_config) {
					var condition_text = "";
					// 表头
					if (gift_config[gift_index].type == 1) {
						html += "<p>按排名获奖</p><table><tr><th>名次</th><th>名称</th><th>总数</th></tr>";
					} else if (gift_config[gift_index].type == 3) {
						html += "<p>分享即可获奖</p><table><tr><th>名称</th><th>总数</th></tr>";
					} else if (gift_config[gift_index].type == 4) {
						if (gift_config[gift_index].cycle) {
							var cycle = gift_config[gift_index].cycle;
							html += "<p>参加即可获奖</p><table><tr><th>名称</th><th>"+(cycle == "day" ? "每天" : (cycle == "week" ? "每周" : "每月"))+"</th></tr>";
						} else {
							html += "<p>参加即可获奖</p><table><tr><th>名称</th><th>总数</th></tr>";
						}
					} else if (gift_config[gift_index].type == 5) {
						html += "<p>抽奖获奖</p>";
						if (gift_config[gift_index].cycle) {
							cycle = gift_config[gift_index].cycle;
							html += "<p>周期性抽奖，"+(cycle == "day" ? "每天" : (cycle == "week" ? "每周" : "每月"))+"可抽"+gift_config[gift_index]["cycle_num"]+"次</p>";
						} else {
							html += "<p>固定次数抽奖，活动期间每个用户有"+game_info["limit_times"]+"次抽奖机会</p>";
						}
						html += "<table><tr><th>抽奖条件</th><th>名称</th><th>总数</th></tr>";
					}
					// 表内容
					if (gift_config[gift_index].prize) {
						var first_row = true;
						for (var index in gift_config[gift_index].prize) {
							if (gift_config[gift_index].type == 1) {
								if (gift_config[gift_index].prize[index]["interval"][0] == gift_config[gift_index].prize[index]["interval"][1]) {
									condition_text = "<td>第"+gift_config[gift_index].prize[index]["interval"][0]+'名</td>';
								} else {
									condition_text = "<td>第"+gift_config[gift_index].prize[index]["interval"][0]+'-'+gift_config[gift_index].prize[index]["interval"][1]+'名</td>';
								}
							} else if (gift_config[gift_index].type == 5) {
								condition_text = "<td rowspan='"+gift_config[gift_index].prize.length+"'>";
								if (gift_config[gift_index]["condition"] == "score") {
									if (game_type == 1 || game_type == 3) {
										condition_text += "分数大于"+gift_config[gift_index]["score"]+"分";
									} else if (game_type == 4) {
										if (tpl_info["section"] == 1) { // 只有1关
											condition_text += "通关后";
										} else {
											condition_text += "通过第"+gift_config[gift_index]["score"]+"关";
										}
									}
								} else if (gift_config[gift_index]["condition"] == "play") {
									condition_text += "参加即可";
								} else if (gift_config[gift_index]["condition"] == "share") {
									condition_text += "成功分享";
								}
	                			condition_text += "</td>";
							}

							if (gift_config[gift_index].type == 5) { // 抽奖合并条件
		    					if (first_row) {
		    						first_row = false;
		    					} else {
		    						condition_text = "";
		    					}
							}
							var num = gift_config[gift_index].prize[index]["total_num"];
							if (gift_config[gift_index].type == 4 && gift_config[gift_index]["cycle"]) {
								num = gift_config[gift_index]["cycle_num"];
							}
							html += "<tr>"+condition_text+"<td>"+gift_config[gift_index].prize[index]["gift_name"]+"</td><td>"+num+"</td></tr>";
						}
					}
					html += "</table>";
					// 额外抽奖机会
					if (gift_config[gift_index].type == 5 && gift_config[gift_index].add_chance) {
						html += "<p>附：分享可获得额外抽奖机会</p>";
					}
				}
				text += html;
			}
		}
		// 商户名称
		if (game_info["m_name"]) {
			text += "<h3>商户名称</h3><p>"+game_info["m_name"]+"</p>";
		}
		// 公众号二维码
		if (configJson["activity-qrcode-show"]) {
			text += "<h3>公众号二维码</h3><img id='activity-qrcode-img' src='"+configJson["activity-qrcode"]+"' /><p style='text-align:center;'>长按二维码关注</p>";
		}
		return text;
	}
}
// 样式设置
configManager.prototype.styleConfig = function(_config){
	// 样式修改
	this.color = _config['color'];
	this.background = _config['background'];
	this.gameTitleColor = _config['game-title-color'];
	this.brand = _config['brand'];
	this.rankLogo = _config.rankLogo;
	this.banner = _config.banner;

	// 结束界面得分文本颜色
	$(".game-score-box").css("color", _config['score-text']);

	// 最高分文本颜色
	$(".score-text").css("color", _config['best-score-text']);

	// loading界面
	// 加载页背景
	if (_config['loadingColor'].indexOf("#") > -1) { // 纯色
		$('#loading').css('background-color', _config['loadingColor']).css("background-image", "none");
	} else { // 图片
		$('#loading').css('background-image', "url("+_config['loadingColor']+")").css("background-color", "transparent");
	}
	$('#loading-img').attr('src',_config['loadingBanner']); // 加载页横幅
	$('#loading .bar').css('background-color', _config['barColor']); // 加载页进度条颜色

	// 色彩方案
	$('.main-color').css('background-color',this.color['main']); // 主色调
	$('.deputy-color').css('background-color',this.color['deputy']); // 副色调

	// 活动规则文本颜色
	$('.text-box .text-content').css("color",_config['activity-text']);

	// 按钮阴影颜色
	$('.main-btn').css('border-bottom-color',this.color['main-shadow']); // 主色调
	$('.deputy-btn').css('border-bottom-color',this.color['deputy-shadow']); // 副色调

	// 所有边框颜色
	$('.main-border').css('border-color',this.color['main']); // 主色调

	// 排行榜特殊颜色
	$('#myself-score .wechat-name').css('color',this.color['main']); // 主色调
	$('#myself-score .score').css('color',this.color['main']); // 主色调

	// 游戏名称颜色
	$('.game-title-color').css('color',this.gameTitleColor);

	// 底部链接
	// $('.brand-icon').find('img').attr('src',this.brand['brand-icon']); // 底部图片，已无效
	$(".icon").css('color',this.brand['brand-text']); // 底部链接文本颜色

	// 分享蒙版文字颜色
	$('.shareLabel').css('color',_config['shareLabel']);

	// 未拆封礼品包装图片
	$('.prize-box img').attr('src',_config['prize-box-img']);
	
	// 已拆封礼品包装图片
	$('.receive-box img').attr('src',_config['receive-box-img']);

	// 已拆封礼品文字描述颜色
	$('.receive-box .text-content').css('color',_config['receive-text']);

	// 分享登录文案颜色
	$('.game-wechat-text').css('color',_config['share-text-color']);
	
	// 活动时间颜色，已失效
	// $('.action-time-label').css('color',_config['action-time-label']);

	// 背景图片
	for(var key in this.background) {
		if(this.background[key].indexOf('#') == 0) { // 纯色
			$('#'+key).css('background-color',this.background[key]);
		} else { // 图片
			$('#'+key).css('background-image','url('+this.background[key]+')');
		}
	}

	// 横幅
	for(var key in this.banner) {
		if (key != "game-over-menu" || game_type != 2) { // 抽奖类结束界面横幅不需要替换
			$('#'+key).find('.game-img img').attr('src',this.banner[key]);
		}
	}
}
var config = new configManager(configJson);  //配置平台



/*-------------------------------------------

				创建游戏实例

-------------------------------------------*/
if (game_type == 1) { // 得分类-phaser
	var gameManager = new Game(bestScore, configJson, 'game_div');
} else if (game_type == 2) { // 抽奖类-DOM
	if (typeof gameStart != "undefined") { // 摇一摇抽大奖特殊处理
		var gameInited = false;
	} else {
		var gameManager = new Game(bestScore, configJson, 'game_div');
	}
} else if (game_type == 3) { // 得分类-DOM
	var gameManager = new Game(bestScore, configJson, 'game_div');
} else if (game_type == 4) { // 通关类-phaser
	var gameManager = new Game(bestScore, configJson, 'game_div');
} else if (game_type == 5) { // 生成类-DOM
	var gameManager = new Game(bestScore, configJson, 'game_div');
}



/*-------------------------------------------

				屏幕旋转能处理

-------------------------------------------*/
// 屏幕旋转回调
function rotation() {
	// 绑定事件
	window.addEventListener("orientationchange", orientationChanged, false);

	// 初始化游戏
	function initGame(){
		gameManager.init();
		window.game = gameManager.instance;
	}

	// 方向改变
	function orientationChanged() {
		if(window.orientation==180 || window.orientation==0){ // 竖屏状态，可以正常初始化游戏
			// 更改字体大小
			changeHTML();

			// 初始化游戏
			if (game_type == 1 || game_type == 3 || game_type == 4 || game_type == 5) { // 分数类/通关类/生成类
				if (!gameManager.isInit) initGame();
				if (game) game.paused = false;
			} else if (game_type == 2) { // 抽奖类
				if (typeof gameStart != "undefined") {
					gameInit();
				} else {
					if (!gameManager.isInit) initGame();
					if (game) game.paused = false;
				}
			}

			// 隐藏旋转屏幕提示
			$("#rotate-box").css("display", "none");
		} else if (window.orientation == 90 || window.orientation == -90) {
			// 显示旋转屏幕提示
			$("#rotate-box").css("display", "-webkit-box");
			// phaser暂停游戏
			if (game_type == 1 || game_type == 4) {
				if (gameManager.isInit) game.paused = true;
			}
		}
	}

	// 默认执行一次
	orientationChanged();

	// PC用，由于PC浏览器直接访问orientation会是underfined，因此直接初始化
	if (game_type == 1 || game_type == 3 || game_type == 4 || game_type == 5) {
		if (window.orientation == undefined && !gameManager.isInit) initGame();
	} else if (game_type == 2) {
		if (typeof gameStart != "undefined") {
			if (window.orientation == undefined && !gameInited) gameInit();
		} else {
			if (window.orientation == undefined && !gameManager.isInit) initGame();
		}
	}
}
// 直接执行一次回调
rotation();