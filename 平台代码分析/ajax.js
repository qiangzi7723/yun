/*-------------------------------------------

				  分享相关

-------------------------------------------*/
// 构建微信分享文案的参数
function createWxShare(config_share) {
	return function() {
        //将分享图片的链接地址更换为http
        var img_url = config_share['share']['pic'];
        img_url = img_url.replace(/^\/\//, "http://");
        img_url = img_url.replace(/^https:\/\//, "http://");
		var obj = {
			"title-default": config_share['share']['title-default'],
			"desc-default": config_share['share']['desc-default'],
			"title": config_share['share']['title'],
			"desc": config_share['share']['desc'],
			"imgUrl": img_url
		};
		return obj;
	}
}

// 设置分享参数
function wxReady(obj, score) {
	obj = obj || {};
	var link = "http://"+location.host+"/web/game/game_id/"+game_info['game_id']+'?from_user='+userId; // 分享链接
    if(game_test==1) {
        var link = "http://"+location.host+"/webCustom/game/game_id/"+game_info['game_id']+'?from_user='+userId; // 分享链接
    }
	var title = obj["title-default"]; // 分享标题
	var desc = obj["desc-default"]; // 分享文案
	//有分数才进入到分享登入页
	if (score) {
        link = "http://" + location.host + "/web/share/game_id/" + game_info['game_id']+"/test/"+game_test+"/from_user/"+userId +"#"+score;
		title = obj["title"];
		desc = obj["desc"];
	}
	// 抽奖类，并且中奖时，进入分享登录页附带中奖图片
	if (game_type == 2 && obj.gift_img && obj.gift_name) {
		link = "http://" + location.host + "/web/share/game_id/" + game_info['game_id']+"/test/"+game_test+"/from_user/"+userId+"#"+score+"?banner_img="+obj.gift_img+"&gift_name="+encodeURIComponent(obj.gift_name);
		title = obj["title"];
		desc = obj["desc"];
	}
	// 使用自定义链接
	if (configJson["message"]["share"]["link"] != "share") {
		link = configJson["message"]["share"]["link"];
	}
	wx.ready(function () {
		// 在这里调用 API
		//分享朋友圈
		wx.onMenuShareTimeline({
			title: title, // 分享标题
			link:  link, // 分享链接
			imgUrl: obj.imgUrl, // 分享图标
			success: function () { 
				shareCallBack();
			},
			cancel: function () { 
				$('.shareMask').hide();
			}
		});
		
		//分享朋友
		wx.onMenuShareAppMessage({
			title: title, // 分享标题
			desc: desc, // 分享描述
			link: link, // 分享链接
			imgUrl: obj.imgUrl, // 分享图标
			type: 'link', // 分享类型,music、video或link，不填默认为link
			dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
			success: function () {
				shareCallBack();
			},
			cancel: function () { 
				// 用户取消分享后执行的回调函数
				$('.shareMask').hide();
			}
		});
	});
}

// 设置默认分享参数
var wxShare = createWxShare(configJson['message']);
wxReady(wxShare());

// 微信分享回调
function shareCallBack() {
	// 提交分享接口
	$.ajax({
		url: "/GameAjax/ShareGame",
		data: {"game_id" : game_info['game_id']},
		type: "POST",
		success: function(data){
			data = JSON.parse(data);
			if (data['code'] == 0) {
				shareGameCallback(data);
			}
		},
		error: function(err){
			console.log(err);
		}
	})
}

// 提交分享接口回调
function shareGameCallback(data) {
	var gameData = data['data'];
	// 增加分享次数
	share_times++;
	// 分享即可获奖的奖品用完了
	share_gift_empty = false;
	// 隐藏分享蒙版
	$('.shareMask').hide();
	// 隐藏新高分弹出框
	if (game_type != 2) {
		if ($('#record-mask').css("display") == "block") {
			fadeOutUp($('#record-mask'));
		}
	}
	// 如果有配置奖品信息
	if (gameData) {
		// 分享即可获奖
		if (gameData['name']) {
			var gift_data = {
				check: gameData.check,
				code: gameData.code,
				rank: gameData.rank,
				headimgurl: gameData.headimgurl,
				name: gameData.user_name,
				gift_img: gameData.img,
				gift_name: gameData.name,
				create_time: gameData.create_time,
				gift_type: gameData.gift_type,
				gift_id: gameData.gift_id,
				gift_record_id: gameData.log_id,
				check_way: gameData.check_way,
				check_info: gameData.check_info
			}
			if (gameData['rp_type']) {
				gift_data.rp_type = gameData['rp_type'];
				gift_data.rp_total = gameData['rp_total'];
				if (gameData['rp_type'] == 2) { // 普通红包
					alertbox.push($("#giftmoney-common-mask"));
				} else if (gameData['rp_type'] == 3) { // 拼手气红包
					alertbox.push($("#giftmoney-random-mask"));
				}
			} else {
				alertbox.push($("#get-prize-mask"));
			}
			gift_center_data.push(gift_data);
			gift_to_show.push(gift_data);

			// 显示奖品中心
			$(".btn-giftcenter").show();
		} else {
			if (gift_center_data.length > 0) $(".btn-giftcenter").show();
		}
		// 有抽奖机会
		if (gameData['lottery_chance']) {
			if (game_type == 2) { // 抽奖类

			} else {
				alertbox.push($("#lottery-mask"));
			}
		}
		// 获得了额外一次抽奖机会
		if (gameData['add_chance_now'] && game_type == 2) {
			showMessage({text: "抽奖机会+1"});
		}

		// 同步抽奖次数
		if (typeof gameData["left_lottery_times"] != "undefined") {
			left_times = gameData["left_lottery_times"];
		}
		//  else {
		// 	left_times = 0;
		// }
	} else if (data['gift_left']) { // yeqingwen 2016-07-13 如果配置的有分享即可获奖，但是奖品库为空，则弹窗提示
        var local_storage_key = game_info['game_id'] + '_share_empty';
        if( !localStorage[local_storage_key] ) {
            var gift_empty_config = JSON.parse(data['gift_left']);
            var gift_empty_len = gift_empty_config.length;
            for (var i = 0; i < gift_empty_len; i++) {
                // 如果参与获奖的奖品数量为空，并且该用户没有获得过抽奖的奖品，则显示
                if ((gift_empty_config[i]['type'] == 3) && (gift_empty_config[i]['prize'][0]['num'] == 0) && (!hasGetGift(3))) {
                    $("#get-prize-empty-mask .text-content span").text('抱歉，分享获奖的奖品已经发完了');
                    share_gift_empty = true;
                    alertbox.push($('#get-prize-empty-mask'));
                    localStorage[local_storage_key] = "yes";
                    break;
                }
            }
        }
    }

	// 获取奖品列表，与服务器同步
	getGiftList();

	// 设置结束界面提示
	setGameoverRemind();

	// 隐藏抽奖次数提示框中的分享提示
	if (game_type == 2) $(".lottery-share-remind").addClass("hidden");

	// 显示弹窗
	showBox();
}



/*-------------------------------------------

			 提交分数/抽奖相关

-------------------------------------------*/
var last_score = 0; // 最后一次得分
var last_commit_data; // 最近一次提交的数据
var share_gift_empty = false; // 分享的奖品是否发完
var play_gift_empty_tag = false; // 参与获奖的奖品是否发完

// 提交分数/抽奖
function setGameScore() {
	var arg = arguments[0];
	var game_score = arg['game_score']; // 提交的分数
	var game_id = arg['game_id']; // 游戏ID
	var device_type = arg['device_type'] || null; // 设备类型
	var d = gd(game_score);
	last_score = game_score;

	// 设置分享参数
	var wxObj = wxShare();
	var reg = /\{score\}/ig;
	if (game_type == 1 || game_type == 3) { // 得分类，替换{score}
		if (parseInt(game_score) != 0) {
			wxObj["title"] = wxObj["title"].replace(reg, function(){return game_score});
			wxObj["desc"] = wxObj["desc"].replace(reg, function(){return game_score});
		}
	} else if (game_type == 4) { // 通关类，替换{level}
		reg = /\{level\}/ig;
		if (parseInt(game_score) != 0) {
			wxObj["title"] = wxObj["title"].replace(reg, function(){return game_score});
			wxObj["desc"] = wxObj["desc"].replace(reg, function(){return game_score});
		}
	}
	wxReady(wxObj, game_score);

	// 通关类结束页文案
	if (game_type == 4) {
		if (tpl_info["section"] == 1) { // 只有一关
			if (game_score == 0) {
				$(".gameover-text").text("真可惜，挑战失败，勇敢再试一次！");
			} else {
				$(".gameover-text").text("恭喜你，挑战成功，邀请好友来试试吧。");
			}
		} else { // 多关
			if (game_score == 0) {
				$(".gameover-text").text("真可惜，挑战失败，勇敢再试一次！");
			} else if (game_score < tpl_info["section"]) { // 没完全通关
				$(".gameover-text").text("恭喜你，完成了"+game_score+"个关卡，还有"+parseInt(tpl_info["section"]-game_score)+"关等你挑战，加油！");
			} else {
				$(".gameover-text").text("恭喜，你完成所有共"+tpl_info["section"]+"个关卡，棒极了！");
			}
		}
	}

	var _d = cd(game_score, d);
	// 提交分数/抽奖
	if (game_test == 1) { // 测试环境，不提交数据
		// 显示结束界面
		// $('.game-over-menu').show();
		if(tpl_info["tpl_id"] != 38) {
			toGameOverMenu();
		}
		// 显示得分
		$('.game-over-menu .centerBox .score').text(game_score);
		// 提示新高分
		if(game_score > bestScore) {
			$('#record-mask .scoreNum').text(game_score);
			alertbox.push($('#record-mask'));
			$('.score-text .score').each(function(k,v){
				v.innerHTML = game_score;
			});
		}
		// 显示提示框
		// showBox(); 
	} else { // 正式环境，提交数据
		_d = fs(game_score, pd(game_score, _d));
		var sign = gs();
		sign += "game_id="+game_id+"&";
		sign += "game_score="+_d+"&";
		sign += "device_type="+device_type+"&";
		sign += "timestamp="+d;

		// 上传用户操作日志
		user_touch_records.push({e: new Date().getTime()});
		if (game_score > 0.8 * game_info['max_score']) { // 只有大于阈值80的才会上传
			uploadLog();
		} else {
			user_touch_records = [];
		}

		// 上传数据
		var commit_data = {
			'game_id':game_id,
			'game_score':_d,
			'device_type':device_type,
			'timestamp':d,
			'sign':md5(sign)
		}
		last_commit_data = commit_data;

		// 发送请求
		sendGameScore();
	}
}

// 发送请求
function sendGameScore() {
	$(".loading-container").show();
	$.ajax({
		url: 'https://'+location.host+':8999/GameAjax/CommitScore',
        beforeSend: function(xhr) { 
            xhr.withCredentials = true;
        },
		type: 'POST',
		data: last_commit_data,
		timeout: 5000,
		success: function(data) {
			$(".loading-container").hide();
			data = JSON.parse(data);
			if (data['code'] == 0) {
				// 清空用户操作日志
				user_touch_records = [];
				$("body").off('touchstart', userTouchRecord);
				$("body").off('touchmove', userTouchRecord);
                // 提交回调
				setGameScoreCallback(data['data'], last_score);
			} else {
				fadeInDown($("#score-error-box-mask"));
				var gameData = {is_new_recode: 0, rank: 1};
				setGameScoreCallback(gameData, 0);
			}
		},
		error: function(err) {
			$(".loading-container").hide();
			$("#modal-submit-error").show();
			$("#btn-submit-again").attr("name", "score");
			$("#btn-back-to-home").attr("name", "start-menu");
		}
	});
}

// 提交分数回调
function setGameScoreCallback(gameData, game_score) {
	// 已经不是第一次玩
	first_play = 0;

	// 显示最终分数
	$('.game-over-menu .centerBox .score').text(game_score);

	// 判断是否显示新最高分数弹框
	if (game_type == 1 || game_type == 3) {
		if (gameData['is_new_recode'] == 1) {
			$('#record-mask .scoreNum').text(game_score);
			alertbox.push($('#record-mask'));
			$('.score-text .score').each(function(k,v) {
				v.innerHTML = game_score;
			});
			bestScore = game_score;
		}
	}

	// 在什么时候填写表单 1为游戏前 2为游戏后
	if (configJson['message']['msg']['type'] == 2 && form_info == 0) {
		alertbox.push($('#form-mask'));
	}

	// 同步抽奖次数
	if (gameData['gift']) {
		if (typeof gameData['gift']["left_lottery_times"] != "undefined") {
			left_times = gameData['gift']["left_lottery_times"];
		}
		//  else {
		// 	left_times = 0;
		// }
	}

	// 奖品为空标记
	play_gift_empty_tag = false;
	share_gift_empty = false;
	// 如果有配置奖品
	if (gameData['gift']) {
		// 普通奖品
		if (gameData['gift']['name']) {
			var gift_data = {
				check: gameData['gift'].check,
				code: gameData['gift'].code,
				rank: gameData['gift'].rank,
				headimgurl: gameData['gift'].headimgurl,
				name: gameData['gift'].user_name,
				gift_img: gameData['gift'].img,
				gift_name: gameData['gift'].name,
				create_time: gameData['gift'].create_time,
				gift_type: gameData['gift'].gift_type,
				gift_id: gameData['gift'].gift_id,
				gift_record_id: gameData['gift'].log_id,
				check_way: gameData['gift'].check_way,
				check_info: gameData['gift'].check_info
			}
			if (gameData['gift']['rp_type']) { // 红包
				gift_data.rp_type = gameData['gift']['rp_type'];
				gift_data.rp_total = gameData['gift']['rp_total'];
				if (gameData['gift']['rp_type'] == 2) { // 普通红包
					alertbox.push($("#giftmoney-common-mask"));
				} else if (gameData['gift']['rp_type'] == 3) { // 拼手气红包
					alertbox.push($("#giftmoney-random-mask"));
				}
			} else { // 普通奖品
				alertbox.push($("#get-prize-mask"));
			}
			gift_center_data.push(gift_data);
			gift_to_show.push(gift_data);

			if (tpl_info["tpl_id"] != 38) { // 铁人三项
				$(".btn-giftcenter").show(); // 显示奖品中心
			}
		}
        // yeqingwen 2016-07-13 如果配置的有参加即可获奖，但是奖品库为空，则弹窗提示
        else if (gameData['gift_left']) {
            var local_storage_key = game_info['game_id'] + '_play_empty';
            var gift_empty_config = JSON.parse(gameData['gift_left']);
            var gift_empty_len = gift_empty_config.length;
            for (var i = 0; i < gift_empty_len; i++) {
                // 如果参与获奖的奖品数量为空，并且该用户没有获得过抽奖的奖品，则显示
                if ((gift_empty_config[i]['type'] == 4) && (gift_empty_config[i]['prize'][0]['num'] == 0) && (!hasGetGift(4))) {
                	if( !localStorage[local_storage_key] ) {
                        $("#get-prize-empty-mask .text-content span").text('抱歉，参与获奖的奖品已经发完了');
                        alertbox.push($('#get-prize-empty-mask'));
                        localStorage[local_storage_key] = 'yes';
                        play_gift_empty_tag = true;
                        // break;
                    } else {
                    	play_gift_empty_tag = true;
                    }
                }
            }
            // 看看是否分享没有奖品了
        	for (var i = 0; i < gift_empty_len; i++) {
        		// 如果参与获奖的奖品数量为空，并且该用户没有获得过抽奖的奖品，则显示
                if ((gift_empty_config[i]['type'] == 3) && (gift_empty_config[i]['prize'][0]['num'] == 0) ) {
                    share_gift_empty = true;
                }
            }
        }

        // 周期性参与获奖的奖品发完了
        if (gameData['gift']["cycle_gift"] == "empty") {
        	var cycle_text;
        	for (var index in gift_config) {
        		if (gift_config[index].type == 4) {
        			if (gift_config[index].cycle) {
	        			var cycle = gift_config[index].cycle;
						if (!isLastCycle(game_info['end_time'], cycle)) {
							cycle_text = (cycle == "day" ? "今天" : ((cycle == "week") ? "本周" : "本月"));
							// 判断是否已经提醒过
							var date_str = getCycleFirst(cycle);
							var storage_key = date_str+"-cycle-empty";
							if (localStorage[storage_key]) {
								cycle_text = "";
							} else {
								localStorage[storage_key] = "yes";
							}
						}
					}
        		}
        	}
        	if (cycle_text) {
	        	$("#get-prize-empty-mask .text-content span").text('抱歉，'+cycle_text+'的参与奖品已发完');
	            alertbox.push($('#get-prize-empty-mask'));
        	}
        }

		// 有抽奖机会
		if (gameData['gift']['lottery_chance']) alertbox.push($("#lottery-mask"));
	}

	// 获取奖品列表，与服务器同步
	getGiftList();

	// 设置结束界面提示
	setGameoverRemind();

	// 设置最佳排名
	setBestRank(gameData["rank"]);

	// 结束界面处理
	if (tpl_info["tpl_id"] != 38) { // 铁人三项
		toGameOverMenu();
	}
}



/*-------------------------------------------

				提交抽奖

-------------------------------------------*/
var current_lottery_gift = "empty"; // 当前抽中的奖品
var lottery_add_chance_tag = false; // 是否有额外抽奖机会
var lottery_lock = false; // 抽奖锁
var last_callback; // 最后的回调

// 抽奖请求
function sendLottery(callback) {
	last_callback = callback;
	if (game_type == 2 && game_test == 1) {
		current_lottery_gift = "empty";
		if (last_callback) last_callback(current_lottery_gift);
		// 显示对应的界面
		$("#game-over-menu .gift-has-container").addClass("hidden");
		$("#game-over-menu .gift-empty-container").removeClass("hidden");
		// 结束界面处理
		if (tpl_info["tpl_id"] != 31 && tpl_info["tpl_id"] != 34 && tpl_info["tpl_id"] != 41) { // 大转盘、刮刮乐不显示
			toGameOverMenu();
		}
	} else {
		lottery_lock = true;
		$(".loading-container").show();
		$.ajax({
			url: "/GameAjax/getLuckyGift",
			data: {"game_id": game_info['game_id']},
			type: "POST",
			timeout: 5000,
			success: function(data) {
				$(".loading-container").hide();
				data = JSON.parse(data);
				if (data['code'] == 0) {
					setLotteryCallback(data['data']);
					if (last_callback) last_callback(current_lottery_gift);
					setTimeout(function() {
						lottery_lock = false;
					}, 1000);
				} else {
					showMessage({text: "抽奖失败"});
					lottery_lock = false;
				}
			},
			error: function(err) {
				$(".loading-container").hide();
				$("#modal-submit-error").show();
				$("#btn-submit-again").attr("name", "lottery");
				$("#btn-back-to-home").attr("name", "");
				lottery_lock = false;
			}
		});
	}
}

// 抽奖回调
function setLotteryCallback(gameData) {
	// 已经不是第一次玩
	first_play = 0;

	// 在什么时候填写表单 1为游戏前 2为游戏后
	if (configJson['message']['msg']['type'] == 2 && form_info == 0 && game_type == 2) {
		alertbox.push($('#form-mask'));
	}

	// 分享后时候能额外获得一次抽奖机会
	lottery_add_chance_tag = false;

	// 同步抽奖次数
	if (typeof gameData["left_lottery_times"] != "undefined") {
		left_times = gameData["left_lottery_times"];
	}
	//  else {
	// 	left_times = 0;
	// }

	if (gameData['lottery'] != "empty") { // 抽中了
		// 配置奖品信息
		var gift_data = {
			check: gameData['lottery'].check,
			code: gameData['lottery'].code,
			add_chance: gameData.add_chance,
			rank: gameData.rank,
			headimgurl: gameData.headimgurl,
			name: gameData.user_name,
			gift_img: gameData['lottery'].img,
			gift_name: gameData['lottery'].name,
			create_time: gameData.create_time,
			gift_type: 5,
			gift_id: gameData['lottery'].gift_id,
			gift_record_id: gameData['lottery'].log_id,
			check_way: gameData['lottery'].check_way,
			check_info: gameData['lottery'].check_info
		}
		if (gameData['lottery']['rp_type']) {
			gift_data.rp_type = gameData['lottery']['rp_type'];
			gift_data.rp_total = gameData['lottery']['rp_total'];
			if (gameData['lottery']['rp_type'] == 2) { // 普通红包
				gift_data.gift_img = "/images/t/giftmoney-common-opened.png";
			} else {
				gift_data.gift_img = "/images/t/giftmoney-common-opened.png";
			}
		}
		// 当前中奖的奖品
		current_lottery_gift = gift_data;
		if (game_type == 2) { // 抽奖类
			// 显示对应的界面
			$("#game-over-menu .gift-has-container").removeClass("hidden");
			$("#game-over-menu .gift-empty-container").addClass("hidden");
			// 配置奖品信息
			var gift_name = gameData['lottery'].name;
			var img_src = gameData['lottery'].img;
			if (gameData['lottery']['rp_type']) {
				gift_name += "(共"+gameData['lottery']['rp_total']+"元)";
				if (gameData['lottery']['rp_type'] == 2) { // 普通红包
					img_src = "/images/t/giftmoney-common-opened.png";
				} else {
					img_src = "/images/t/giftmoney-common-opened.png";
				}
			}
			$("#game-over-menu .gift-has-container .game-img").attr("name", gameData['lottery'].log_id);
			$("#game-over-menu .gift-has-container .game-img img").attr("src", img_src);
			$("#game-over-menu .gift-has-container .game-over-text-gift-name").text(gift_name);
			// 分享后能获得额外抽奖机会
			if (gameData.add_chance) {
				lottery_add_chance_tag = true;
				$(".gameover-remind").text("分享后还可以获得额外一次抽奖机会哦！");
			}
			// 设置分享
			var wxObj = wxShare();
			wxObj.gift_img = gift_data.gift_img;
			wxObj.gift_name = gameData['lottery'].name;
			var reg = /\{result\}/ig;
			wxObj["title"] = wxObj["title"].replace(reg, function(){return gameData['lottery'].name});
			wxObj["desc"] = wxObj["desc"].replace(reg, function(){return gameData['lottery'].name});
			wxReady(wxObj, 0);

			gift_center_data.push(gift_data);
			gift_to_show.push(gift_data);

			// 结束界面处理
			if (tpl_info["tpl_id"] != 31 && tpl_info["tpl_id"] != 34 && tpl_info["tpl_id"] != 41) { // 大转盘、刮刮乐不显示
				toGameOverMenu();
			}
		} else { // 非抽奖类
			gift_center_data.push(gift_data);
			gift_to_show.push(gift_data);

			// 隐藏抽奖提示框
			fadeOutUp($("#lottery-mask"));
			// 显示奖品
			getSingleGift();
			// 显示奖品中心
			$(".btn-giftcenter").show();
		}
	} else { // 没抽中
		if (game_type == 2) { // 抽奖类
			// 当前中奖的奖品
			current_lottery_gift = "empty";
			// 显示对应的界面
			$("#game-over-menu .gift-has-container").addClass("hidden");
			$("#game-over-menu .gift-empty-container").removeClass("hidden");
			// 结束界面处理
			if (tpl_info["tpl_id"] != 31 && tpl_info["tpl_id"] != 34 && tpl_info["tpl_id"] != 41) { // 大转盘、刮刮乐不显示
				toGameOverMenu();
			}
		} else { // 非抽奖类
			// 隐藏抽奖提示框
			fadeOutUp($("#lottery-mask"));
			// 如果设置了额外抽奖机会，则设置没抽中提示框的提示
			if (gameData['add_chance']) {
				$("#get-prize-none-mask .gift-remind").removeClass("hidden");
				$("#get-prize-none-mask .gift-remind-btn").removeClass("hidden");
				$("#get-prize-none-mask .gift-remind").prev().css("padding-bottom", "10px");
			} else {
				$("#get-prize-none-mask .gift-remind").addClass("hidden");
				$("#get-prize-none-mask .gift-remind-btn").addClass("hidden");
				$("#get-prize-none-mask .gift-remind").prev().css("padding-bottom", "20px");
			}
			// 显示没抽中提示框
			fadeInDown($('#get-prize-none-mask'));
			// 显示奖品中心
			if (gift_center_data.length > 0) $(".btn-giftcenter").show(); 
		}
	}

	// 获取奖品列表，与服务器同步
	getGiftList();

	// 设置结束界面提示
	setGameoverRemind();
}



/*-------------------------------------------

			 结束界面提示

-------------------------------------------*/
// 设置结束界面提示
function setGameoverRemind() {
	// 显示结束界面获奖提示
	$(".gameover-remind").removeClass("hidden");
	var gameover_remind = [];
	// 将已配置的可能出现的提示加入数组中
	for (var index in gift_config) {
		if (gift_config[index].type == 1) { // 排名
			var last_rank = gift_config[index].prize[gift_config[index].prize.length-1].interval[1];
			var text = "排名保持在前"+last_rank+"名，活动结束后即可获得奖品噢！";
			gameover_remind.push({text: text, type: 1});
		} else if (!share_gift_empty && gift_config[index].type == 3) { // 分享
			var text = "分享给好友即可获得奖品哦！";
			gameover_remind.push({text: text, type: 3});
		} else if (gift_config[index].type == 4) { // 参与
			if (!play_gift_empty_tag) { // 还有参与的奖品
				if (gift_config[index].cycle) {
					var cycle = gift_config[index].cycle;
					if (!isLastCycle(game_info['end_time'], cycle)) {
						var cycle_text = (cycle == "day" ? "每天" : ((cycle == "week") ? "每周" : "每月"));
						var text = "活动期内"+cycle_text+"都有奖，记得再回来领奖哦！";
						gameover_remind.push({text: text, type: 4});
					}
				}
			}
		} else if (gift_config[index].type == 5) { // 抽奖
			if (gift_config[index]["condition"] == "share") { // 分享抽奖
				var text = "分享给好友即可获得一次抽奖机会哦！";
				gameover_remind.push({text: text, type: 5, condition: "share"});
			} else if (gift_config[index]["condition"] == "score") { // 达到分数抽奖
				if (last_score <= gift_config[index]["score"]) {
					var delta =  gift_config[index]["score"] - last_score + 1;
					delta = Number(delta.toFixed(2));
					var text = "真可惜，还差"+delta+"分就可以参与抽奖了哦！";
					// 通关类特殊处理
					if (game_type == 4) {
						if (tpl_info["section"] == 1) { // 只有一关
							text = "通关后就可以参与抽奖了哦！"; 
						} else {
							text = "通过第"+gift_config[index]["score"]+"关就可以参与抽奖了哦！"; // 通关类特殊处理
						}
					}
					gameover_remind.push({text: text, type: 5, condition: "score"});
				}
			} else if (gift_config[index]["condition"] == "play") { // 直接抽奖

			}
			var cycle = gift_config[index]["cycle"];
			if (cycle) { // 是周期性抽奖
				if (!isLastCycle(game_info['end_time'], cycle)) {
					var cycle_text = (cycle == "day" ? "每天" : ((cycle == "week") ? "每周" : "每月"));
					var text = cycle_text+"都可以来抽奖，每人"+cycle_text+"有"+gift_config[index]["cycle_num"]+"次机会！";
					gameover_remind.push({text: text, type: 4});
				}
			}
		}
	}
	// 排序
	for (var index in gameover_remind) {
		if (gameover_remind[index]["type"] == 1) { // 排行放最后
			var obj = gameover_remind.splice(index, 1)[0];
			gameover_remind.push(obj);
		} else if (gameover_remind[index]["type"] == 3) { // 分享放最前面
			var obj = gameover_remind.splice(index, 1)[0];
			gameover_remind.unshift(obj);
		}
	}
	// 判断是否已经获得此奖品
	if (gift_center_data.length > 0) {
		for (var index in gift_center_data) {
			var gift_type = gift_center_data[index].gift_type;
			for (var i in gameover_remind) {
				if (gameover_remind[i].type == gift_type && gift_type != 4) { // 已经获得此奖品
					gameover_remind.splice(i, 1);
				}
			}
		}
	}
	// 显示到结束界面
	if (gameover_remind.length > 0) {
		$(".gameover-remind").text(gameover_remind[0]["text"]);
	} else {
		if (game_type == 2) { // 抽奖
			if (!lottery_add_chance_tag) $(".gameover-remind").addClass("hidden");
		} else {
			$(".gameover-remind").text("");
		}
	}
}



/*-------------------------------------------

			 排行榜相关

-------------------------------------------*/
var rank_user; // 用户的排名
var loading_rank = false; // 是否正在加载排行数据

// 显示排行榜
function showRank(){
	// 清空数据
	$('.friendContent ol').empty();
	$('.playerContent ol').empty();
	// 查看更多
	var more = $('.more');
	for (var i = 0,len = more.length; i < len; i++) {
		more.eq(i).attr('data-num', 2).attr('data-touch','true').text('查看更多');
	}
	// 测试数据
	if (game_test == 1) {
		var data = {
			"friend_rank_list": [{
				name: "玩家1",
				headimgurl: "//24haowan-cdn.shanyougame.com/new_platform/image/center.png",
				score: "3"
			},{
				name: "玩家2",
				headimgurl: "//24haowan-cdn.shanyougame.com/new_platform/image/center.png",
				score: "2"
			},{
				name: "玩家2",
				headimgurl: "//24haowan-cdn.shanyougame.com/new_platform/image/center.png",
				score: "1"
			}],
			"rank_list": [{
				name: "玩家1",
				headimgurl: "//24haowan-cdn.shanyougame.com/new_platform/image/center.png",
				score: "3"
			},{
				name: "玩家2",
				headimgurl: "//24haowan-cdn.shanyougame.com/new_platform/image/center.png",
				score: "2"
			},{
				name: "玩家2",
				headimgurl: "//24haowan-cdn.shanyougame.com/new_platform/image/center.png",
				score: "1"
			}],
			"friend_total_count": 3,
			"total_count": 3,
			"friend_user_result": {
				name: "玩家1",
				headimgurl: "http://wx.qlogo.cn/mmopen/ibUzh/64",
				score: "3",
				rank: 1,
				persent: 50
			},
			"user_result": {
				name: "玩家1",
				headimgurl: "http://wx.qlogo.cn/mmopen/ibUzh/64",
				score: "3",
				rank: 1,
				persent: 50
			}
		}
		setRank(data);
		// 显示排行榜
		fadeInDown($('#rank'));
	} else if (!loading_rank) {
		loading_rank = true;
		$.ajax({
			url:'/GameAjax/GetRank',
			data:{'game_id':game_info['game_id']},
			type:'POST',
			success: function(data){
				loading_rank = false;
				data = JSON.parse(data);
				if (data['code'] == 0) {
					rank_user = data['user_result'];
					data = data['data'];
					// 设置排行榜数据
					setRank(data);
					// 显示排行榜
					fadeInDown($('#rank'));
				}
			},
			error: function(err){
				loading_rank = false;
				console.log(err);
			}
		});
	}
}

// 设置排行榜数据
function setRank(data) {
	// 配置好友排行榜
	$('.friendContent .number').text(data['friend_total_count']+"位好友"); // 好友总数
	var str1 = rankStr(data['friend_rank_list'], data['friend_user_result'], "friend");
	$('.friendContent ol').append(str1);
	$('.moreFirend').attr('data-num','1');
	// 配置玩家排行榜
	$('.playerContent .number').text(data['total_count']+"位玩家"); // 玩家总数
	var str2 = rankStr(data['rank_list'], data['user_result'], "player");
	$('.playerContent ol').append(str2);
	$('.morePlayer').attr('data-num','1');
}

// 生成排行榜条目数据
function rankStr(data, user, type) {
	var user_rank = user['rank'];
	var str = '';
	for (var i = 0,len = data.length; i < len; i++) {
		var people = data[i];
		str += '<li><span class="rankNum">';
		if (i < 3) {
			str += '<img src="/images/t/no' + (i+1) + '.svg" ></span>';
		} else {
			str += ((i+1) + '</span>');
		}
		str += '<div class="wechat-img"><img src=' + people['headimgurl'] + '></div>';
		str += '<span class="wechat-name">' + people['name'] + '</span>';
		str += '<div class="score">' + parseFloat(people['score']) + '</div></li>';
	}
	if (type == 'friend') {
		if (user_rank > (i+1)) {
			str += '<div id="myself-score"><span class="rankNum">' + user_rank + 
                '</span><div class="wechat-img"><img src=' + user['headimgurl'] + 
                '></div><span class="wechat-name">'+ user['name'] +'</span>' + 
                '<div class="score">' + parseFloat(user['score']) + '</div></li>';
		}
	}
	return str;
}

// 获取更多排行信息
function moreRankStr(pages, type, btn) {
	btn.attr('data-touch','false');
	btn.text('加载中...');
	if (game_test == 1) {
		btn.text('没有更多了');
	} else if (!loading_rank) {
		loading_rank = true;
		$.ajax({
			url: '/GameAjax/GetMoreRank',
			type: 'POST',
			data: {'game_id': game_info['game_id'] , 'pages': pages , 'type': type},
			success: function(data){
				loading_rank = false;
				data = JSON.parse(data);
				console.log(data);
				if(data['code'] == 0) {
					// 修改按钮
					btn.attr('data-num',parseInt(pages)+1);
					data = data['data'];
					if (data) {
						// 加载样式进入
                        var str = rankStrMore(data,pages * 5);
						$('div#myself-score').remove();
						btn.parent().find('ol').append(str);
					}
					if (data == null || data.length < 5) {
						btn.text('没有更多了')
					} else if (data) {
						btn.attr('data-touch','true');
						btn.text('查看更多');
					}
				}
			},
			error: function(){
				loading_rank = false;
			}
		});
	}
}

// 生成排行榜条目数据 - 更多
function rankStrMore(data, offset) {
    var str = '';
    for (var i = 0,len = data.length; i < len; i++) {
        var people = data[i];
        str += '<li><span class="rankNum">';
        rank = offset + i + 1;
        if (rank < 3) {
            str += '<img src="/images/t/no' + (rank) + '.svg" ></span>';
        } else {
            str += ((rank) + '</span>');
        }
        str += '<div class="wechat-img"><img src=' + people['headimgurl'] + '></div>';
        str += '<span class="wechat-name">' + people['name'] + '</span>';
        str += '<div class="score">' + parseFloat(people['score']) + '</div></li>';
    }
    return str;
}

// 设置最佳排名
function setBestRank(rank) {
	if (best_rank > rank || first_play == 1) {
		best_rank = rank;
		$(".score-text .score-text-rank").text("第"+best_rank+"名");
	}
}


/*-------------------------------------------

			 奖品中心相关

-------------------------------------------*/
var gift_center_data = []; // 获奖信息

// 获取获奖信息
function getGiftList() {
	$.ajax({
	    url: '/GameAjax/GetGiftList',
	    type: 'post',
	    dataType: 'json',
	    data: {game_id: game_info["game_id"]},
	    success: function(result) {
	    	if (result.code == 0) {
	    		setGiftCenter(result.data);
	    	}
	    },
	    error: function(error) {
	    	console.log(error);
	    }
	});
}
if (game_test == 0) getGiftList();

// 配置奖品中心
function setGiftCenter(data) {
	if (data.length > 1) { // 列表
		// data = data.concat(data);

		$(".giftcenter-container .gift-item-container").html("");
		var img_head, nickname;
		var _toread = 0;
		var _toread_arr = [];
		for (var index in data) {
			if (!img_head) {
				img_head = data[index].headimgurl;
				$(".giftcenter-container .img-head").attr("src", img_head);
			}
			if (!nickname) {
				nickname = data[index].name;
				$(".giftcenter-container .nickname").text(nickname);
			}
			if (data[index].read == "no") {
				_toread++;
				_toread_arr.push(data[index].id);
			}
			var html = createGiftItem(data[index]);
			$(".giftcenter-container .gift-item-container").append(html);
		}
		// 注册查看详情事件
		$(".giftcenter-container .gift-item-container .gift-item-btn-detail").on("tap", function() {
			var record_id = $(this).attr("name");
			showSingleGiftByRecordId(record_id);
		});

		toread = _toread;
		toread_arr = _toread_arr;
		if (toread > 0) { // 有未读消息
			$(".toread-num").text(toread).removeClass("hidden");
		} else {
			$(".toread-num").addClass("hidden");
		}
		// 绑定未读消息事件
		$(".giftcenter-container .gift-item-container .not-read").on(touch, function() {
			sendReadGift($(this).attr("name"));
			$(this).removeClass("not-read");
		});
		gift_center_data = data;
	} else if (data.length == 1) { // 单个
		if (data[0].read == "no") {
			toread = 1;
			toread_arr = [data[0].id];
		}
		if (toread > 0) { // 有未读消息
			$(".toread-num").text(toread).removeClass("hidden");
		} else {
			$(".toread-num").addClass("hidden");
		}
		var gift_data = {
			check: data[0].check,
			code: data[0].code,
			rank: data[0].rank,
			headimgurl: data[0].headimgurl,
			name: data[0].name,
			gift_img: data[0].gift_img,
			gift_name: data[0].gift_name,
			create_time: data[0].create_time,
			gift_type: data[0].gift_type,
			gift_id: data[0].gift_id,
			gift_record_id: data[0].id,
			rp_type: data[0].gift_type_rp,
			rp_total: data[0].rp_total,
			check_way: data[0].check_way,
			check_info: data[0].check_info
		}
		gift_center_data =[gift_data];
	}
	if (data.length > 0 && ($("#start-menu").css("display") == "block" || $("#loading").css("display") == "block")) $(".btn-giftcenter").show();
}

// 构造奖品项
function createGiftItem(data) {
	if (data.gift_type_rp) { // 是红包
		if (data.gift_type_rp == 2 || data.gift_type_rp == 3) data.gift_name += "("+data.rp_total+"元)";
		if (data.gift_type_rp == 2) {
			data.gift_img = "/images/t/giftmoney-common-opened.png";
		} else if (data.gift_type_rp == 3) {
			data.gift_img = "/images/t/giftmoney-random-opened.png";
		}
	}
	var record_id = (data.gift_record_id) ? data.gift_record_id : data.id;
	var html = "<div class='gift-item-block "+((data.read == "no") ? "not-read" : "")+"' name='"+data.id+"'><img src='"+data.gift_img+"' class='gift-item-img'><div class='gift-item-info'><div><div class='gift-item-name'>"+data.gift_name+"</div><div class='gift-item-check "+((data.check == "yes") ? "" : "hidden")+"'><span>已核销</span></div></div></div><div class='gift-item-btn-detail' name='"+record_id+"'>查看详情</div></div>"
	return html;
}

//yeqingwe  查询是否已经获得奖品 2016-07-13
function hasGetGift(type) {
    var gift_len = gift_center_data.length;
    for (var i = gift_len - 1; i >= 0; i--) {
        if( gift_center_data[i]['gift_type']==type ) {
            return true;
        }
    }
    return false;
}



/*-------------------------------------------

			 周期相关

-------------------------------------------*/
// 计算周期
function isLastCycle(end_time, cycle) {
	var date = new Date();
	var arr = end_time.match(/(\d+)/g);
	var date_e = new Date(arr[0], arr[1]-1, arr[2], arr[3], arr[4], arr[5]);
	var delta = date_e.getTime() - date.getTime();

	if (date_e.getTime() >= date.getTime()) { // 在活动期内
		if (cycle == "day") {
			return (date_e.getDate() == date.getDate());
		} else if (cycle == "week") {
			var week_day = date_e.getDay();
			week_day = (week_day == 0) ? 7 : week_day;
			if (delta >= week_day * 86400000) { // 在一周以外
				return false;
			} else { // 在一周以外
				return true;
			}
		} else if (cycle == "month") {
			if (date_e.getMonth() == date.getMonth()) {
				return (date_e.getDate() >= date.getDate());
			} else {
				return false;
			}
		}
	} else {
		return true;
	}
}

// 获取本周期第一天
function getCycleFirst(cycle) {
	var date = new Date();
	var time = date.getTime();
	if (cycle == "day") {
		return date.getFullYear() +"-"+ (date.getMonth()+1)+"-"+date.getDate();
	} else if (cycle == "week") {
		var day = date.getDay();
		day = (day == 0) ? 7 : day;
		var delta_day = day - 1;
		time -= 86400000 * delta_day;
		var _date = new Date(time);
		return _date.getFullYear() +"-"+ (_date.getMonth()+1)+"-"+_date.getDate();
	} else if (cycle == "month") {
		return date.getFullYear() +"-"+ (date.getMonth()+1)+"-1";
	}
}