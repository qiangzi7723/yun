var workBench;
$(document).ready(function() {
	workBench = new WorkBench();
});

// 加载脚本
function loadScript(url, callback){
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
        script.onload = function() {
            callback();
        };
    }
    script.src = url;
    document.body.appendChild(script);
}

// 显示提示
function showRemind(text) {
	$("#remind-loading").addClass("hidden");
	$("#remind-text").html(text);
	$("#remind-container").fadeIn(300, function() {
		setTimeout(function() {
			$("#remind-container").fadeOut(300);
		}, 2000);
	});
}
// 加载提示
function showLoading(text) {
	$("#remind-loading").removeClass("hidden");
	$("#remind-text").html(text);
	$("#remind-container").fadeIn(300);
}

// 离开网页的提示
function leaveAlert(event) {
	return '您可能有数据还没有保存，请确认'; 
}

/* 工作台 */
var WorkBench = function() {
	this.resize();
	// 显示页面内容
	$(".page-content").css("opacity", 1);

	this.basicCustom = new BasicCustom(); // 基本信息
	this.assetsCustom = new AssetsCustom(); // 资源替换
	this.gameInfoCustom = new GameInfoCustom(); // 营销设置
	this.shareCustom = new ShareCustom(); // 分享设置

	this.gamePreview = new GamePreview(); // 发布预览模态框
	this.sceneCustom = new SceneCustom(); // 添加场景模态框
	
	this.giftmoneyModal = new GiftmoneyModal(); // 红包充值
	this.assetsPanel = new AssetsPanel(); // 素材库
	this.textPanel = new TextPanel(); // 文本修改面板
	this.colorPanel = new ColorPanel(); // 纯色修改面板
	this.authModal = new AuthModal(); // 公众号授权
	this.authErrorModal = new AuthErrorModal(); // 公众号授权异常

	// 验证身份-补充电话信息
	if (contact_phone == "no") {
		loadScript("/js/webCustom/workbench_mobile_add.js", function() {
			workBench.mobileAddModal = new MobileAddModal();
		});
	}
	// 付费升级
	if (upgrade == "no") {
		loadScript("/js/webCustom/workbench_upgrade.js", function() {
			workBench.upgrade = new Upgrade();
		});
	}
	// 自定义界面
	if (tpl_ext_info["custom"]) {
		loadScript("/js/webCustom/workbench_custom_menu.js", function() {
			workBench.menuCustom = new MenuCustom();
		});
	}

	this.bindEvents();
	this.keepAlive();
	this.resetGameStyle();
	this.checkGiftMoney();

	if (m_name == "") {
		$("#mname-remind-container").fadeIn(300);
		$("#user-custom-name").focus();
		if (game_status == "wait") {
			m_name = "24好玩";
			$("#user-custom-name").val(m_name);
			this.save();
		} else {
			$("#mname-remind-container").fadeIn(300);
		}
	}

	// 根据游戏状态修改顶部按钮
	if (draft == "yes") {
		$("#workbench-save").removeClass("hidden");
	} else {
		if (game_status != "wait") {
			this.setSaveRemind("publish");
			$("#workbench-publish").addClass("hidden");
			$("#workbench-exit").removeClass("hidden");
		} else {
			$("#workbench-publish").removeClass("hidden");
			$("#workbench-exit").addClass("hidden");
		}
	}

	// 是否显示测试地址
	if (draft == "yes" || game_status == "wait") {
		$("#workbench-test").attr("href", location.origin+"/webCustom/game/game_id/"+game_id).removeClass("hidden");
	}

	// 是否显示营销设置的导航
	var gameinfo_gift = false;
	if (gift_config) {
		gameinfo_gift = (gift_config.length > 0) ? true : false;
	}
	var gameinfo_feedback = (platform_config["message"]["msg"].type) ? true : false;
	var gameinfo_link = (giftcenter_link.length > 0) ? true : false;
	if (!gameinfo_gift && !gameinfo_feedback && !gameinfo_link && game_status != "wait") $("#ul-container li[name='gameinfo']").addClass("hidden");

	// 启用iframe
	$("#preview-frame").attr("src", location.origin+"/WebCustom/game/game_id/"+game_id + "?skip=1");

	// 管理员界面特别处理
	if (workbench_admin) {
		$(".user-login-container").hide(); // 账号信息
		$(".exit-container").hide(); // 退出按钮
		$("#workbench-sync").removeClass("hidden"); // 同步按钮
	}
};
WorkBench.prototype = {
	basicCustom: null, // 基本信息页
	assetsCustom: null, // 资源替换页
	shareCustom: null, // 分享设置页
	gameInfoCustom: null, // 游戏信息设置页

	gamePreview: null, // 游戏预览
	sceneCustom: null, // 场景设置
	upgrade: null, // 付费升级
	giftmoneyModal: null, // 红包充值
	assetsPanel: null, // 素材库
	textPanel: null, // 文本修改面板
	colorPanel: null, // 纯色修改面板
	authModal: null, // 公众号授权
	menuCustom: null, // 界面自定义

	tplImgTag: false, // 是否需要合成图片标记
	currentPage: 1, // 当前步骤
	pages: ["basic", "assets", "gameinfo", "share"], // 步骤名称

	// 绑定事件
	bindEvents: function() {
		var self = this;

		// 窗口大小变化
		window.onresize = this.resize;

		// 导航
		$("#ul-container").find("li").on("click", function() {
			self.togglePage($(this).attr("name"), this);
		});

		// 发布按钮
		$("#workbench-publish").on("click", function() {
			if (contact_phone == "no") { // 手机号补充检查
				workBench.mobileAddModal.show();
			} else if (m_name.length <= 0) { // 商户名称的检查
				$("#mname-remind-container").fadeIn(300);
				workBench.togglePage("basic");
			} else if (giftmoney_config.need_num > 0) { // 红包没有充够钱
				workBench.togglePage("gameinfo");
				$("#giftmoney-pay-btn").click();
			} else {
				// 抽奖类，必须配置抽奖才能发布
				if (game_type == 2) { 
					var lottery_error = true;
					if (gift_config) {
						for (var index in gift_config) {
							if (gift_config[index].type == 5) {
								lottery_error = false;
							}
						}
					}
					if (lottery_error) {
						showRemind("当前还没有配置抽奖接口，由于该游戏为抽奖类游戏，请配置完毕后再发布游戏。");
					} else {
						self.gamePreview.show();
					}
				} 
                // 问答测试类，如果游戏逻辑有问题，则不允许发布  yeqingwen  2016-08-19 09:48
                else if ( workBench.assetsCustom.testCustom&&(workBench.assetsCustom.testCustom.checkTestLogic()) ){
                    showRemind("发布失败，测试逻辑异常，请检查！");
                }else {
					self.gamePreview.show();
				}
			}
		});

		// 同步按钮
		// 只有管理员模式才会出现
		if (workbench_admin) {
			$("#workbench-sync").on("click", function() {
				self.sync();
			});
		}

		// 保存按钮
		// 只有为草稿情况下才会出现
		if (draft == "yes") {
			$("#workbench-save").on("click", function() {
				self.save();
				if (!$(this).hasClass("disabled")) self.sendDraft();
			});
		}

		// 刷新按钮
		$("#preview-refresh").on("click", function() {
			self.refresh();
		});

		// 说明按钮
		$(".title-q").mouseenter(function() {
			$(this).next().removeClass("hidden");
		});
		$(".title-q").mouseleave(function() {
			$(this).next().addClass("hidden");
		});
		$(".custom-nav-item[name='4']").mouseenter(function() {
			$(this).find(".custom-desc-share").removeClass("hidden");
		});
		$(".custom-nav-item[name='4']").mouseleave(function() {
			$(this).find(".custom-desc-share").addClass("hidden");
		});

		// 手机扫码预览
        var fade_out_time;
		$(".preview-show-qrcode").mouseenter(function() {
			$(".qrcode-container").stop().fadeIn(300);
		});
		$(".preview-show-qrcode").mouseleave(function() {
            clearTimeout(fade_out_time);
            fade_out_time = setTimeout(function(){
                $(".qrcode-container").stop().fadeOut(300);
            },500);
		});
        // 鼠标移动到二维码区域，则二维码一直显示
        $(".qrcode-container").mouseenter(function(){
            clearTimeout(fade_out_time);
            $(".qrcode-container").stop().fadeIn(300);
        });
        $(".qrcode-container").mouseleave(function(){
            clearTimeout(fade_out_time);
            $(".qrcode-container").stop().fadeOut(300);
        });
        $(".qrcode-container").mousedown(function(e) {
        	if (e.which == 3) setTimeout(function() {$(".qrcode-container").stop().fadeIn(300);}, 10);
        });
        // 显示测试游戏的提示，如果是已经发布的游戏，则不显示
        $(".test-remind-close").on("click", function(){
            $(".test-remind-div").hide();
        });
        if(game_status=='publish') {
            $(".test-remind-div").hide();
        }

		// 只能在手机上体验的
		if (platform_config["mobileOnly"]) {
			$("#preview-frame").mouseenter(function() {
				$(".qrcode-container").stop().fadeIn(300);
			});
		} else {
			$("#preview-frame").off('mouseenter');
		}

		// 保存重试按钮
		$("#save-again").on("click", function() {
			self.save();
		});

		// 退出按钮
		$("#workbench-exit").on("click", function() {
			location.href = "/webCustom/mygame";
		});

		// 发布失败关闭按钮
		$("#publish-failed-close").on("click", function() {
			$("#publish-failed-container").fadeOut(300);
		});

		// 商户名称提示按钮
		$("#mname-remind-btn").on("click", function() {
			$("#mname-remind-container").fadeOut(300);
		});

        // 帮助提示
        $(".help-btn-container a").on('mouseover', function() {
            var img_obj = $(this).children().eq(0);
            img_obj.attr('src', "//24haowan-cdn.shanyougame.com/public/images/web/icon-workbench-help-"+$(img_obj).data('img-type')+"-green.png");
        });
        $(".help-btn-container a").on('mouseout', function() {
            var img_obj = $(this).children().eq(0);
            img_obj.attr('src', "//24haowan-cdn.shanyougame.com/public/images/web/icon-workbench-help-"+$(img_obj).data('img-type')+".png");
        });
	},

	// 切换页面
	togglePage: function(page, obj) {
		if (m_name == "") {
			$("#mname-remind-container").fadeIn(300);
			$("#user-custom-name").focus();
		} else {
			this.assetsPanel.hide();
			this.currentPage = page;

			// 隐藏活动规则
			$("#text-box-mask").addClass("hidden");

			// 高亮导航
			$(obj).addClass("active").siblings().removeClass("active");

			// 显示对应页面
			this.hideAll();
			$("#"+this.currentPage+"-container").removeClass("hidden");

			// 显示对应的预览界面
			this.hidePreview();
			if (this.currentPage == "basic") {
				$("#preview-custom-1").removeClass("hidden");
			} else if (this.currentPage == "assets") { // 资源替换
				var assets_page = $(obj).attr("id").split("assets-nav-")[1];
				this.assetsCustom.currentPage = assets_page;
				this.assetsCustom.togglePanel(assets_page);
				$("#preview-custom-"+assets_page).removeClass("hidden");
			} else if (this.currentPage == "share") { // 分享设置
				$("#preview-wechat").removeClass("hidden");
			} else if (this.currentPage == "gameinfo") { // 营销设置
				$("#preview-custom-3").removeClass("hidden");
				// $("#receive-mask").removeClass("hidden");
				$(".giftcenter-container-single").removeClass("hidden");
			}
		}
	},

	// 隐藏所有页面
	hideAll: function() {
		$("#basic-container").addClass("hidden");
		$("#assets-container").addClass("hidden");
		$("#gameinfo-container").addClass("hidden");
		$("#share-container").addClass("hidden");
	},

	// 隐藏预览界面
	hidePreview: function() {
		$(".preview-custom-container").addClass("hidden");
		// $("#preview-frame").addClass("hidden");
		// $("#preview-frame").css("visibility", "hidden");
		$("#rank").addClass("hidden");
		$("#shareMask").addClass("hidden");
		$("#form-mask").addClass("hidden");
		// $("#receive-mask").addClass("hidden");
		$(".giftcenter-container-single").addClass("hidden");
		$("#preview-wechat").addClass("hidden");
	},

	// 设置保存提醒
	setSaveRemind: function(state) {
		var self = this;
		if (draft == "no") {
			// 更新时间
			var time = new Date();
			var hour = time.getHours();
			var minute = time.getMinutes();
			hour = (parseInt(hour) < 10) ? "0"+hour : hour;
			minute = (parseInt(minute) < 10) ? "0"+minute : minute;
			time = hour+":"+minute;
			$(".save-container").find(".time").text(time);

			// 不同状态的处理
			if (state == "giftmoney") {
				$(".save-container").find(".fail").removeClass("hidden").siblings().addClass("hidden");
				$(".save-alert-container .giftmoney").removeClass("hidden").siblings().addClass("hidden");
			} else {
				$(".save-container").find("."+state).removeClass("hidden").siblings().addClass("hidden");
			}
		}
	},

	// 显示保存提醒
	showSaveContainer: function() {
		if (draft == "no") this.setSaveRemind("loading");
	},

	// 保存
	save: function(callback) {
		var self = this;
		if (draft == "no") this.leaveRemind("on");
		if (game_status != "wait" && giftmoney_config.need_num > 0) { // 红包还没有充够钱，不给保存
			this.showSaveContainer();
			this.setSaveRemind("giftmoney");
		} else {
			if (platform_config["platform"]["texture"] && self.tplImgTag) { // 需要合成图片
				this.showSaveContainer();
				var self = this;

				// 构建合成图片数据
				var tplArr = {};
				for (var key in platform_config["platform"]["texture"]) {
					var tplObj = {};
					for (var index in platform_config["platform"]["texture"][key]) {
						var fileName = platform_config["platform"]["texture"][key][index]["fileName"];
						tplObj[fileName] = platform_config["platform"]["texture"][key][index]["url"];
					}
					tplArr[key] = tplObj;
				}

				// 发送请求-合成图片
				$.ajax({
					type: "POST",
					dataType: "json",
					url: "/WebAjax/TpImg",
					data: {file_list : tplArr},
					success: function(result) {
						if (result.code == 0) {
							self.tplImgTag = false;
							// 配置表
							for (var key in result.data) {
								var json = result.data[key]["json_file"];
								var img = result.data[key]["img_file"];
								platform_config["game"][key] = [img, json];
							}
							if (callback) { // 有回调
								self.sendSave(callback);
							} else { // 无回调
								self.sendSave(function(result) {
									if (result.code == 0) {
										self.setSaveRemind("success");
									} else if (result.code == -4) {
										self.setSaveRemind("fail");
										$("#mname-remind-container").fadeIn(300);
										workBench.togglePage("basic");
									} else if (result.code == 99) {
										showRemind("您的账号已经注销登录，请重新登录！");
										setTimeout(function() {
											location.href = "/web/login#"+location.href;
										}, 1500);
									} else {
										self.setSaveRemind("fail");
									}
								});
							}
						} else if (result.code == -1) {
							self.setSaveRemind("fail");
						} else if (result.code == -2) {
							self.setSaveRemind("fail");
						} else if (result.code == 99) {
							showRemind("您的账号已经注销登录，请重新登录！");
							setTimeout(function() {
								location.href = "/web/login#"+location.href;
							}, 1500);
						} else {
							self.setSaveRemind("fail");
						}
					},
					error: function(error) {
						self.setSaveRemind("fail");
					}
				});
			} else { // 不需要合成图片
				if (callback) { // 有回调
					this.sendSave(callback);
				} else { // 无回调
					this.sendSave(function(result) {
						if (result.code == 0) {
							self.setSaveRemind("success");
						} else if (result.code == -4) {
							self.setSaveRemind("fail");
							$("#mname-remind-container").fadeIn(300);
							workBench.togglePage("basic");
						} else if (result.code == 99) {
							showRemind("您的账号已经注销登录，请重新登录！");
							setTimeout(function() {
								location.href = "/web/login#"+location.href;
							}, 1500);
						} else {
							self.setSaveRemind("fail");
						}
					});
				}
			}
		}
	},

	// 发送请求-修改游戏
	sendSave : function(callback) {
		this.showSaveContainer();
		var self = this;
		$.ajax({
			type: "POST",
			dataType: "json",
			url: "/WebAjax/EditCustomGame",
			data: {
				game_id : game_id,
				platform_config : JSON.stringify(platform_config),
				name : game_name,
				describe : game_describe,
				start_time : start_time,
				end_time : end_time,
				msg_config : JSON.stringify(platform_config["message"]["msg"]),
				gift_config : JSON.stringify(gift_config),
				all_gift_config : JSON.stringify(all_gift_config),
				default_msg_config : JSON.stringify(default_msg_config),
				scene : scene,
				m_name: m_name,
				limit_times: limit_times,
				prize_url: giftcenter_link
			},
			success: function(result) {
				callback(result);
				if (game_status == "wait") self.checkGiftMoney();
				if (draft == "no") self.leaveRemind("off");
			},
			error: function(error) {
				self.setSaveRemind("fail");
			}
		});
	},

	// 同步更新
	sync: function() {
		showLoading("同步中");
		$.ajax({
			type: "POST",
			dataType: "json",
			url: "/webAjax/CopyToTpl",
			data: {game_id : game_id},
			success: function(result) {
				if (result.code == 0) {
					showRemind("同步成功!");
				} else if (result.code == 99) {
					showRemind("您的账号已经注销登录，请重新登录！");
					setTimeout(function() {
						location.href = "/web/login#"+location.href;
					}, 1500);
				} else {
					showRemind("系统错误");
				}
			},
			error: function(error) {
				showRemind("网络连接错误");
			}
		});
	},

	// 查询红包信息
	checkGiftMoney: function() {
		$.ajax({
			type: "POST",
			dataType: "json",
			url: "/webAjax/GetRpInfo",
			data: {game_id : game_id},
			success: function(result) {
				if (result.code == 0) {
					giftmoney_config = result.data;
					workBench.giftmoneyModal.resetGiftMoney();
				} else if (result.code == 99) {
					showRemind("您的账号已经注销登录，请重新登录！");
					setTimeout(function() {
						location.href = "/web/login#"+location.href;
					}, 1500);
				} else {
					showRemind("系统错误");
				}
			},
			error: function(error) {
				showRemind("网络连接错误");
			}
		});
	},

	// 刷新游戏预览
	refresh : function() {
		var self = this;
		this.save(function(result) {
			if (result.code == 0) {
                if (self.assetsCustom.currentPage == 2) $("#preview-frame").attr("src", location.origin+"/WebCustom/game/game_id/"+game_id + "?skip=1");
				self.setSaveRemind("success");
			} else if (result.code == -1) {
				self.setSaveRemind("fail");
			} else if (result.code == -2) {
				self.setSaveRemind("fail");
			} else {
				self.setSaveRemind("fail");
			}
		});
	},

	// 发送请求-修改游戏状态为发布
	publish: function() {
		var self = this;
        var enroll = 'no';
        if( $("#enroll-activity").is(':checked') ) {
            enroll = 'yes';
        }
		$.ajax({
			type: "POST",
			dataType: "json",
			url: "/WebAjax/EditGameStatus",
            // data: {game_id : game_id, status: "publish", end_time: end_time },
            // 是否参与七夕活动
			data: {game_id : game_id, status: "publish", end_time: end_time, qixi: enroll},
			success: function(result) {
				if (result.code == 0) {
					self.gamePreview.hide();
					$("#publish-success").fadeIn(300, function() {
						setTimeout(function() {
							location.href = "/WebCustom/mygame";
						}, 2000);
					});
				} else if (result.code == -1) {
					showRemind("啊哦_(:з」∠)_<br>发布失败了，再试一次吧~");
				} else if (result.code == -2) {
					showRemind("啊哦_(:з」∠)_<br>发布失败了，再试一次吧~");
				} else if (result.code == -3) {
					showRemind("啊哦_(:з」∠)_<br>发布失败了，再试一次吧~");
				} else if (result.code == -4) {
					showRemind("啊哦_(:з」∠)_<br>发布失败了，再试一次吧~");
				} else if (result.code == -5) {
					showRemind("活动结束时间不能小于当前时间");
					self.togglePage("basic");
				} else if (result.code == -7) {
					$("#mname-remind-container").fadeIn(300);
					workBench.togglePage("basic");
				} else if (result.code == 99) {
					showRemind("您的账号已经注销登录，请重新登录！");
					setTimeout(function() {
						location.href = "/web/login#"+location.href;
					}, 1500);
				} else {
					showRemind("啊哦_(:з」∠)_<br>发布失败了，再试一次吧~");
				}
			},
			error: function(error) {
				showRemind("网络连接错误");
			}
		});
	},

	// 发送请求-从草稿保存到我的游戏
	sendDraft: function() {
		var self = this;
		$("#workbench-save").addClass("disabled");
		showLoading("活动保存中");
		$.ajax({
			type: "POST",
			dataType: "json",
			url: "/webAjax/SaveDraftGame",
			data: {game_id : game_id},
			success: function(result) {
				if (result.code == 0) {
					setTimeout(function() {
						draft = "no";
						$("#workbench-save").addClass("hidden");
						$("#workbench-publish").removeClass("hidden");
						showRemind("活动保存成功，您现在可以发布活动了。");
					}, 1500);
				} else if (result.code == -1) {
					showRemind("你无权编辑此游戏");
				} else if (result.code == -2) {
					showRemind("游戏不存在");
				} else if (result.code == 99) {
					showRemind("您的账号已经注销登录，请重新登录！");
					setTimeout(function() {
						location.href = "/web/login#"+location.href;
					}, 1500);
				} else {
					showRemind("系统错误");
				}
			},
			error: function(error) {
				showRemind("网络连接错误");
			}
		});
	},

	// 保持在线
	keepAlive : function() {
		setInterval(function() {
			$.ajax({
				type: "POST",
				dataType: "json",
				url: "/WebAjax/KeepAlive",
				data: {},
				error: function(error) {
					showRemind("网络连接错误");
				}
			});
		}, 900000);
	},

	// 离开网页提示
	leaveRemind: function(tag) {
		if (tag == "on") {
			$(window).bind("beforeunload", leaveAlert);
		} else {
			$(window).unbind("beforeunload");
		}
	},

	// 网页大小变化
	resize: function() {
		var scrollbar_width = window.innerWidth - $(".page-content").width();
		// 顶部导航栏
		if (window.innerWidth <= 1409) {
			$("#ul-container").css("width", window.innerWidth-310);
		} else {
			$("#ul-container").css("width", "78%");
		}
		// 左侧手机
		var mobile_enable_height = (window.innerHeight-130)*0.8;
		mobile_enable_height = (mobile_enable_height > 600) ? 600 : mobile_enable_height;
		mobile_enable_height = (mobile_enable_height < 465) ? 465 : mobile_enable_height;
		var mobile_width = mobile_enable_height*360/600;

		$(".preview-wrapper").css("width", mobile_width);
		$(".preview-container").css({
			"width": mobile_width,
			"height": mobile_enable_height
		});
		// 更新字体大小
		var width = mobile_width*0.92;
		var size = width*100/375;
		$("html").css("font-size", size+"px");

		// 手机刷新按钮
		$("#preview-refresh").css({
			"height": mobile_width*0.13
		});

		// 营销设置提醒
		$(".gameinfo-bottom-feedback").css({
			width: $("#main-container").width(),
			left: $("#main-container").offset().left
		});

		// 更新图片介绍宽度
		$(".pic-desc.over").css("width", $("#main-container")[0].clientWidth);
		$(".pic-desc-over-container").css("max-width", $("#main-container")[0].clientWidth-50+"px");
	},

	// 设置活动页面样式
	resetGameStyle: function() {
		// 游戏标题
		var img = new Image();
		img.onload = function() {
			var ratio = img.width/img.height;
			if (ratio > 6) {
				$('.game-title img').css("height", $(".preview-wrapper").width()*0.8/ratio+"px");
			} else {
				$('.game-title img').css("height", "0.5rem");
			}
		};
		img.src = platform_config["game-title-img"];
	}
};

/* 基本信息 */
var BasicCustom = function() {
	this.currentColorNum = parseInt($(".custom-color.active").attr("name"))-1;
	this.bindEvents();
};
BasicCustom.prototype = {
	currentColorNum : 0, // 当前颜色方案
	colorGroup : [
		{second : ["#ffb837", "#eb940b"], main : ["#1db494", "#1aa98b"]},
		{second : ["#e34459", "#bc3748"], main : ["#743543", "#5d333d"]},
		{second : ["#1b9fc6", "#116c99"], main : ["#4464af", "#192c79"]},
		{second : ["#ffea00", "#e5d200"], main : ["#b18266", "#956d56"]},
		{second : ["#a867ab", "#8d5590"], main : ["#6d4e86", "#563c6b"]},
		{second : ["#efb0b8", "#e08691"], main : ["#9ca7d4", "#66719e"]},
		{second : ["#df585f", "#b8353c"], main : ["#b5dfc7", "#90d2ac"]},
		{second : ["#e2664e", "#b8353c"], main : ["#e98aa2", "#e25c7e"]}
	], // 配色方案
	startTimeTmp: null, // 开始时间缓存
	endTimeTmp: null, // 结束时间缓存

	// 获取日期字符串
	getDateStr: function(addtime) {
		var date = new Date();
		if (addtime) {
			date = new Date(date.getTime()+addtime);
		}
		var current_time;
		current_time = date.getFullYear();
		current_time += "-" + (((date.getMonth()+1) < 10) ? ("0"+(date.getMonth()+1)) : date.getMonth()+1);
		current_time += "-"+ (((date.getDate()) < 10) ? ("0"+date.getDate()) : date.getDate());
		current_time += " "+(((date.getHours()) < 10) ? ("0"+date.getHours()) : date.getHours())+":00:00";
		return current_time;
	},

	// 绑定事件
	bindEvents : function() {
		var self = this;

		// 游戏名称（仅在未发布状态可以编辑）
		if (game_status == "wait") {
			// 游戏名称改变事件
			$("#text-game-title-text").on("change", function() {
				var content = $(this).val();
				$(".game-title span").text(content);
				$("#activity-info-name").text(content);
				$(".game-name").text(content);
				game_name = content;
				workBench.save();
			});
			// 游戏名称输入事件
			$("#text-game-title-text").on("input", function() {
				var content = $(this).val();
				$(".game-title span").text(content);
				$("#activity-info-name").text(content);
				$(".game-name").text(content);
			});
		}
		
		// 商家名称（仅在未发布状态可以编辑）
		if (game_status == "wait") {
			// 商家名称改变事件
			$("#user-custom-name").on("change", function() {
				var content = $(this).val();
				if (content.length <= 0) {
					showRemind("商家名称不能为空！");
					$("#user-custom-name").val(m_name).focus();
				} else {
					m_name = content;
					workBench.assetsCustom.updateActivityView(false, false, false, true);
					workBench.save();
				}
				$(".m-name").text(m_name);
				$("#activity-info-mname").text(m_name);
			});
		}

		// 开始时间（仅在未发布状态可以编辑）
		if (game_status == "wait") {
			// 初始化日期选择组件
			$("#start-date").datetimepicker({
				language:  'zh-CN',
				autoclose: true,
				todayHighlight: true,
				bootcssVer : 3,
				minView : "day"
			});
			// 日期输入框聚焦事件
			$("#start-date").on("focus", function() {
				$(".date-input-group").removeClass("active");
				$(this).parent().addClass("active");
			});
			// 日期选择组件 显示事件
			$('#start-date').datetimepicker().on("show", function(ev) {
				self.startTimeTmp = $(ev.currentTarget).val()+":00";
			});
			// 日期选择组件 隐藏事件
			$("#start-date").datetimepicker().on("hide", function(ev) {
				$("#start-date").parent().removeClass("active");
				start_time = $(ev.currentTarget).val()+":00";
				var current_time = self.getDateStr();
				if (start_time >= end_time) {
					showRemind("开始时间不能大于等于结束时间");
					start_time = current_time;
					$(ev.currentTarget).val(start_time.substr(0, 16));
				}
				// 实时更新
				var text = "活动时间："+start_time.substr(0, 16)+" 至 "+end_time.substr(0, 16);
				workBench.assetsCustom.updateActivityView(true);
				$("#activity-info-start-time").text(start_time.substr(0, 16));
				if (self.startTimeTmp != start_time) {
					workBench.gameInfoCustom.setCycle();
					workBench.save();
				}
			});
			// 日历按钮
			$("#start-date").next().on("click", function() {
				$(this).prev().focus();
				$(this).prev().datetimepicker('show');
			});
		}

		// 结束时间
		// 初始化日期选择组件
		$("#end-date").datetimepicker({
			language:  'zh-CN',
			autoclose: true,
			todayHighlight: true,
			bootcssVer : 3,
			minView : "day"
		});
		// 日期输入框聚焦事件
		$("#end-date").on("focus", function() {
			$(".date-input-group").removeClass("active");
			$(this).parent().addClass("active");
		});
		// 日期选择组件 显示事件
		$('#end-date').datetimepicker().on("show", function(ev) {
			self.endTimeTmp = $(ev.currentTarget).val()+":00";
		});
		// 日期选择组件 隐藏事件
		$('#end-date').datetimepicker().on("hide", function(ev) {
			$("#end-date").parent().removeClass("active");
			end_time = $(ev.currentTarget).val()+":00";
			platform_config["text"]["prompt-text"] = "活动已于"+end_time.substr(0,10)+"结束,继续游戏还能获得平台钻石,但无法获得活动奖品";
			var current_time = self.getDateStr();
			if (end_time <= current_time) {
				showRemind("结束时间不能小于等于当前时间");
				end_time = self.getDateStr(3600*1000*24*7);
				$(ev.currentTarget).val(end_time.substr(0, 16));
			} else if (end_time <= start_time) {
				showRemind("结束时间不能小于等于开始时间");
				end_time = self.getDateStr(3600*1000*24*7);
				$(ev.currentTarget).val(end_time.substr(0, 16));
			}
			// 实时更新
			var text = "活动时间："+start_time.substr(0, 16)+" 至 "+end_time.substr(0, 16);
			workBench.assetsCustom.updateActivityView(true);
			$("#activity-info-end-time").text(end_time.substr(0, 16));
			if (self.endTimeTmp != end_time) {
				workBench.gameInfoCustom.setCycle();
				workBench.save();
			}
		});
		// 日历按钮
		$("#end-date").next().on("click", function() {
			$(this).prev().focus();
			$(this).prev().datetimepicker('show');
		});

		// 访问模式
		var timer_access_desc;
		$(".custom-access button").on("click", function() {
			if (!$(this).hasClass("disabled")) {
				$(this).addClass("active").siblings().removeClass("active");
				limit_player = $(this).attr("name");
				self.setLimitPlayer();
			}
		});
		$(".custom-access button[name='yes']").mouseenter(function() {
			$(".custom-access-desc").css("display", "block");
		});
		$(".custom-access button[name='yes']").mouseleave(function() {
			timer_access_desc = setTimeout(function() {
				$(".custom-access-desc").css("display", "none");
			}, 500);
		});
		$(".custom-access-desc").mouseenter(function() {
			clearTimeout(timer_access_desc);
			$(".custom-access-desc").css("display", "block");
		});
		$(".custom-access-desc").mouseleave(function() {
			$(".custom-access-desc").css("display", "none");
		});

		// 配色方案
		$(".custom-color").on("click", function() {
			var num = parseInt($(this).attr("name"))-1;
			self.changeColor(num);
			$(".custom-color").removeClass("active");
			$(this).addClass("active");
		});
		
		// 隐藏底部横幅
		$("input[name='bottom-show']").on("click", function() {
			if ($(this).val() == "true") {
				self.showBottom();
			} else {
				self.hideBottom();
			}
			workBench.save();
		});

		// 设置底部横幅的推广链接
		$("input[name='bottom-link-set']").on("click", function() {
			if ($(this).val() == "true") {
				platform_config["bottom-link-set"] = true;
				$(this).parent().parent().next().removeClass("hidden");
			} else {
				platform_config["bottom-link-set"] = false;
				$("#text-brand-link").val("");
				$(this).parent().parent().next().addClass("hidden");
			}
			platform_config["bottom-link"] = $("#text-brand-link").val();
			workBench.save();
		});

		// 公司名称输入框
		$("#text-brand-text").on("input", function() {
			$(".icon").html($(this).val());
			platform_config["text"]["brand-text"] = $(this).val();
		});

		// 公司名称输入框
		$("#text-brand-text").on("change", function() {
			$(".icon").html($(this).val());
			platform_config["text"]["brand-text"] = $(this).val();
			workBench.save();
		});

		// 推广链接输入框
		$("#text-brand-link").on("change", function() {
			var link = $(this).val();
			if (link.indexOf("http") < 0) {
				link = "http://" + link;
			}
			platform_config["bottom-link"] = link;
			$(this).val(link);
			workBench.save();
		});
	},

	// 切换配色方案
	changeColor : function(num) {
		if (num != this.currentColorNum) {
			this.currentColorNum = num;
			var colorGroup = this.colorGroup[num];
			var main = colorGroup["main"][0];
			var main_shadow = colorGroup["main"][1];
			var second = colorGroup["second"][0];
			var second_shadow = colorGroup["second"][1];
			$(".main").css("background", main);
			$(".second").css("background", second);
			// 配置表
			platform_config.style.color.main = main;
			platform_config.style.color["main-shadow"] = main_shadow;
			platform_config.style.color.deputy = second;
			platform_config.style.color["deputy-shadow"] = second_shadow;
			// 实时更新
			$(".main-color").css("background-color", main);
			$(".deputy-color").css("background-color", second);
			$(".main-btn").css("border-bottom", "2px solid "+main_shadow);
			$(".deputy-btn").css("border-bottom", "2px solid "+second_shadow);
			$('.main-border').css('border-color', main);
			$('#myself-score .wechat-name').css('color', main);
			$('#myself-score .score').css('color', main);
			workBench.save();
		}
	},

	// 显示底部信息 
	showBottom: function() {
		platform_config["bottom-show"] = true;

		$("#bottom-link-container").removeClass("hidden");

		// $("#bottom-link-detail").removeClass("disabled");
		// $("#bottom-link-detail input[type='text']").removeClass("disabled").removeAttr("readonly");
		// $("#checkbox-bottom-link").prop("disabled", false);
		$(".bottom-logo").show();
	},

	// 隐藏底部信息
	hideBottom: function() {
		platform_config["bottom-show"] = false;

		$("#bottom-link-container").addClass("hidden");

		// $("#bottom-link-detail").addClass("disabled");
		// $("#bottom-link-detail input[type='text']").addClass("disabled").attr("readonly", "readonly");
		// $("#checkbox-bottom-link").prop("disabled", true);
		$(".bottom-logo").hide();
	},

	// 设置访问模式
	setLimitPlayer: function() {
		$.ajax({
			type: "POST",
			dataType: "json",
			url: "/webAjax/SetLimitPlayer",
			data: {game_id: game_id, limit: limit_player},
			success: function(result) {
				if (result.code == 0) {
					if (limit_player == "yes") {
						showRemind("设置密钥访问成功");
					}
				} else if (result.code == 99) {
					showRemind("您的账号已经注销登录，请重新登录！");
					setTimeout(function() {
						location.href = "/web/login#"+location.href;
					}, 1500);
				} else {
					showRemind("系统错误");
				}
			},
			error: function(error) {
				showRemind("网络连接错误");
			}
		});
	}
};

/* 资源替换 */
var AssetsCustom = function() {
	this.bindEvents();
	// 音乐定制
	loadScript("/js/webCustom/workbench_music.js", function() {
		workBench.assetsCustom.musicCustom = new MusicCustom();
	});
	// 特别定制
	if (tpl_id == 35) { // 问答
		loadScript("/js/webCustom/workbench_question.js", function() {
			workBench.assetsCustom.questionCustom = new QuestionCustom();
		});
	} else if (tpl_id == 37) { // 测试
		loadScript("/js/webCustom/workbench_test.js", function() {
			workBench.assetsCustom.testCustom = new TestCustom();
		});
	} else if (tpl_id == 39) { // 生成
		loadScript("/js/webCustom/workbench_generate.js", function() {
			workBench.assetsCustom.generateCustom = new GenerateCustom();
		});
	}
};
AssetsCustom.prototype = {
	currentPage : 0, // 当前页ID
	questionCustom: null, // 问答定制
	testCustom: null, // 测试定制
	generateCustom: null, // 生成类定制
	musicCustom: null, // 音乐定制

	// 绑定事件
	bindEvents : function() {
		var self = this;

		// 图片
		$(".custom-pic[name='pic']").on("click", function(e) {
			if (!$(this).hasClass("disabled")) workBench.assetsPanel.show($(this), "pic");
			e.stopPropagation();
		});
		$(".custom-pic[name='info-share']").on("click", function(e) {
			if (!$(this).hasClass("disabled")) workBench.assetsPanel.show($(this), "pic");
			e.stopPropagation();
		});
		$(".custom-pic[name='bg']").on("click", function(e) {
			if (!$(this).hasClass("disabled")) workBench.assetsPanel.show($(this), "bg");
			e.stopPropagation();
		});

		// 可配置元素个数
		$(".configurable-minus").on("click", function() {
			var num = parseInt($(this).next().val());
			if (num > 1) {
				var key = $(this).attr("name");
				self.removeConfigurableItem(key);
				$(this).next().val(num-1);
			}
		});
		$(".configurable-plus").on("click", function() {
			var key = $(this).attr("name");
			self.addConfigurableItem(key);
			var num = parseInt($(this).prev().val());
			$(this).prev().val(num+1);
		});

		// 活动规则
		$("#text-activity-text").on("change", function() {
			var content = $(this).val();
			platform_config["text"]["activity-text"] = content;

			self.updateActivityView(false, content);
			workBench.save();
		});
		$("#text-activity-text").on("input", function() {
			var content = $(this).val();
			self.updateActivityView(false, content);
		});
		$("#text-activity-text").on("focus", function() {
			$("#text-box-mask").removeClass("hidden");
		});
		// 活动规则关闭按钮
		$("#text-box-mask .close-btn").on("click", function() {
			$("#text-box-mask").addClass("hidden");
		});
		// 开始页点击图片时隐藏活动规则
		$("#custom-detail-1 .custom-pic").on("click", function() {
			$("#text-box-mask").addClass("hidden");
		});
		$("#pic-activity-qrcode").on("click", function() {
			$("#text-box-mask").removeClass("hidden");
		});

		// 分享登录文案
		var pattern = /\{score\}/ig;
		if (game_type == 2) { // 抽奖类
			pattern = /\{result\}/ig;
		} else if (game_type == 4) { // 通关类
			pattern = /\{level\}/ig;
		}
		$("#text-game-wechat-text").on("change", function() {
			var content = $(this).val();
			platform_config["text"]["game-wechat-text"] = content;
			var replace_str = Math.ceil(Math.random()*100);
			if (game_type == 2) { // 抽奖类
				replace_str = "iphone6";
			} else if (game_type == 4) { // 通关类
				replace_str = Math.ceil(Math.random()*10);
			}
			content = content.replace(pattern, replace_str);
			$(".game-wechat-text").text(content);
			workBench.save();
		});
		$("#text-game-wechat-text").on("input", function() {
			var content = $(this).val();
			var replace_str = Math.ceil(Math.random()*100);
			if (game_type == 2) { // 抽奖类
				replace_str = "iphone6";
			} else if (game_type == 4) { // 通关类
				replace_str = Math.ceil(Math.random()*10);
			}
			content = content.replace(pattern, replace_str);
			$(".game-wechat-text").text(content);
		});
		
		// 公众号二维码开关
		$("input[name='activity-qrcode-show']").on("click", function() {
			$("#text-box-mask").removeClass("hidden");
			self.toggleActivityQrcode(($(this).val() == "true"));
		});

		// 奖品发放规则开关
		$("input[name='activity-gift-show']").on("click", function() {
			$("#text-box-mask").removeClass("hidden");
			self.toggleActivityGift($(this).val());
		});

		// 隐藏排行榜开关
		$("#checkbox-disable-rank").on("click", function() {
			self.toggleDisableRank($(this).prop("checked"));
			platform_config["disable-rank"] = $(this).prop("checked");
			workBench.save();
		});

		// 自定义标题图片
		$(".game-title-img-select input[name='game-title-img-show']").on("click", function() {
			self.toggleGameTitleImg($(this).val());
		});

		// 二维码配置切换
		$("input[name='game-qrcode-type']").on("click", function() {
			self.switchGameQrcodeType($(this).val());
		});

		// 二维码链接
		$("#input-game-qrcode-link").on("change", function() {
			var link = $(this).val();
			if (link.length <= 0) {
				showRemind("自定义链接不能为空");
				$(this).focus().val("http://");
			} else if (link.indexOf("http") < 0) {
				link = "http://"+link;
			}
			self.setGameQrcodeData();
		});

		// 二维码文案
		$("#input-game-qrcode-text").on("change", function() {
			var content = $(this).val();
			if (content.length <= 0) {
				showRemind("文案不能为空");
				$(this).focus();
			} else if (content.length > 15) {
				showRemind("文案不能超过15个字");
				$(this).focus();
			} else {
				self.setGameQrcodeData();
			}
		});
	},
	// 切换面板
	togglePanel: function(id) {
		workBench.assetsPanel.hide();
		this.currentPage = parseInt(id);

		// 高亮导航
		$("#assets-container").find(".custom-nav-item").removeClass("active");
		$("#assets-container").find("div.custom-nav-item[name='"+this.currentPage+"']").addClass("active");

		// 切换面板
		$("#assets-container").find(".custom-detail").addClass("hidden");
		$("#custom-detail-"+id).removeClass("hidden");

		// 显示对应的预览界面
		workBench.hidePreview();
		if (this.currentPage == 2) { // 游戏页
			if ($("#preview-frame").attr("src") == "") {
                $("#preview-frame").attr("src", location.origin+"/WebCustom/game/game_id/"+game_id + "?skip=1"+ '#' + game_status );
			}
		} else {
			$("#preview-custom-"+this.currentPage).removeClass("hidden");
		}
	},
	// 更新活动规则
	updateActivityView: function(time, content, gift_tag, m_name_tag, qrcode_tag) {
		if (time) { // 需要更新时间
			var html = start_time.slice(0,16) + ' 至 ' + end_time.slice(0,16);
			$('.text-box .text-content').find("p").first().html(html);
		}
		if (typeof content !== "undefined" && content != false) { // 需要更新内容
			$('.text-box .text-content').find("p").first().next().next().html(content);
		}

		if (platform_config["activity-gift-show"]) {
			if (platform_config["activity-gift-show"] == "yes") { // 需要显示
				gift_tag = true;
			} else { // 不需要显示
				gift_tag = false;
				$("#activity-prize-container").remove();
			}
		}

		if (gift_tag) { // 需要更新奖品信息
			if (gift_config.length > 0) { // 有设置奖品
				if ($("#activity-prize-container").length == 0) { // 之前没有设置奖品
					var html = "<div id='activity-prize-container'></div>";
					if ($("#mname-container").length > 0) {
						$("#mname-container").before(html);
					} else if ($("#activity-qrcode-container").length > 0) {
						$("#activity-qrcode-container").before(html);
					} else {
						$('.text-box .text-content').append(html);
					}
				}
				var html = "<h3>奖品说明</h3>";
				for (var gift_index in gift_config) {
					var condition_text = "";

					// 表头
					var type = "";
					if (gift_config[gift_index].type == 1) {
						type = "rank";
						html += "<p>按排名获奖</p><table><tr><th>名次</th><th>名称</th><th>总数</th></tr>";
					} else if (gift_config[gift_index].type == 3) {
						type = "share";
						html += "<p>分享即可获奖</p><table><tr><th>名称</th><th>总数</th></tr>";
					} else if (gift_config[gift_index].type == 4) {
						type = "play";
						if (gift_config[gift_index]["cycle"]) { // 周期性发奖
							var cycle = gift_config[gift_index]["cycle"];
							html += "<p>参加即可获奖</p><table><tr><th>名称</th><th>"+(cycle == "day" ? "每天" : (cycle == "week" ? "每周" : "每月"))+"</th></tr>";
						} else {
							html += "<p>参加即可获奖</p><table><tr><th>名称</th><th>总数</th></tr>";
						}
					} else if (gift_config[gift_index].type == 5) {
						type = "lottery";
						html += "<p>抽奖获奖</p>";
						if (gift_config[gift_index].cycle) {
							cycle = gift_config[gift_index].cycle;
							html += "<p>周期性抽奖，"+(cycle == "day" ? "每天" : (cycle == "week" ? "每周" : "每月"))+"可抽"+gift_config[gift_index]["cycle_num"]+"次</p>";
						} else {
							html += "<p>固定次数抽奖，活动期间每个用户有"+limit_times+"次抽奖机会</p>";
						}
						html += "<table><tr><th>抽奖条件</th><th>名称</th><th>总数</th></tr>";
					}

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
										if (game_section == 1) { // 只有1关
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

							var gift_name = "";
							for (var i in user_gift_list) {
								var gift_id = gift_config[gift_index].prize[index]["gift_id"];
								if (user_gift_list[i]["id"] == gift_id) {
									gift_name = user_gift_list[i]["name"];
								}
							}

							var num = 0;
							if (type == "share" || type == "play") {
								num = all_gift_config[type]["num"];
								if (type == "play" && gift_config[gift_index]["cycle"]) { // 周期性
									num = all_gift_config[type]["cycle_num"];
								}
							} else if (type == "rank") {
								num = all_gift_config[type][index]["num"];
							} else if (type == "lottery") {
								num = all_gift_config[type].prize[index]["num"];
							}
							html += "<tr>"+condition_text+"<td>"+gift_name+"</td><td>"+num+"</td></tr>";
						}
					}
					html += "</table>";

					if (gift_config[gift_index].type == 5 && gift_config[gift_index].add_chance) {
						html += "<p>附：分享可获得额外抽奖机会</p>";
					}
				}
				$("#activity-prize-container").html(html);
			} else { // 无设置奖品
				$("#activity-prize-container").remove();
			}
		}
		
		if (m_name_tag) { // 需要更新商户名称
			if ($("#mname-container").length == 0) {
				var html = "<div id='mname-container'></div>";
				$('.text-box .text-content').append(html);
			}
			$("#mname-container").html("<h3>商户名称</h3><p>"+m_name+"</p>");
		}
		if (qrcode_tag) { // 需要更新二维码
			if (platform_config["activity-qrcode-show"]) {
				if ($("#activity-qrcode-container").length == 0) {
					var html = "<div id='activity-qrcode-container'></div>";
					$('.text-box .text-content').append(html);
				}
				$("#activity-qrcode-container").html("<h3>公众号二维码</h3><img id='activity-qrcode-img' src="+platform_config["activity-qrcode"]+"><p style='text-align:center'>长按二维码关注</p>");
			} else {
				$("#activity-qrcode-container").html("");
			}
		}
	},
	// 添加可配置元素
	addConfigurableItem: function(key) {
		var currentIndex = platform_config["platform"]["configurable"][key]["elements"].length - 1;
		var name = platform_config["platform"]["configurable"][key]["name"];
		var size = platform_config["platform"]["configurable"][key]["size"] ? platform_config["platform"]["configurable"][key]["size"][0] : "";
		var url = default_platform_config["platform"]["configurable"][key]["elements"][0];
		if (currentIndex+1 < default_platform_config["platform"]["configurable"][key]["elements"].length) {
			url = default_platform_config["platform"]["configurable"][key]["elements"][currentIndex+1];
			if (size != "") size = default_platform_config["platform"]["configurable"][key]["size"][currentIndex+1];
		}
		// 新增一个图片
		var html = "<div class='custom-pic' name='pic' id='pic-configurable-"+key+"-"+(currentIndex+1)+"'><div class='custom-pic-img'><div class='custom-pic-div' style='background-image:url("+url+");'></div></div><div class='custom-pic-size'>"+size+"</div><div class='custom-pic-name'>"+name+(currentIndex+2)+"</div></div>";
		$("#pic-configurable-"+key+"-"+currentIndex).parent().append(html);
		// 绑定事件
		$("#pic-configurable-"+key+"-"+(currentIndex+1)).on("click", function(e) {
			workBench.assetsPanel.show($(this), "pic");
			e.stopPropagation();
		});
		// 配置表
		platform_config["platform"]["configurable"][key]["elements"].push(url);
		platform_config["game"][key].push(url);
		workBench.save();
	},
	// 删除可配置元素
	removeConfigurableItem: function(key) {
		var currentIndex = platform_config["platform"]["configurable"][key]["elements"].length - 1;
		$("#pic-configurable-"+key+"-"+currentIndex).remove();
		// 配置表
		platform_config["platform"]["configurable"][key]["elements"].splice(platform_config["platform"]["configurable"][key]["elements"].length-1, 1);
		platform_config["game"][key].splice(platform_config["game"][key].length-1, 1);
		workBench.save();
	}, 
	// 显示/隐藏公众号二维码
	toggleActivityQrcode: function(tag) {
		platform_config["activity-qrcode-show"] = tag;
		if (tag) {
			$("#pic-activity-qrcode").removeClass("hidden");
			$("#pic-activity-qrcode").removeClass("disabled");
		} else {
			$("#pic-activity-qrcode").addClass("hidden");
			$("#pic-activity-qrcode").addClass("disabled");
		}
		this.updateActivityView(false, false, false, false, true);
		workBench.save();
	},
	// 显示/隐藏奖品发放规则
	toggleActivityGift: function(tag) {
		platform_config["activity-gift-show"] = tag;
		this.updateActivityView(false, false, false, false, true);
		workBench.save();
	},
	// 显示/隐藏排行榜
	toggleDisableRank: function(tag) {
		if (tag) {
			$(".rank-btn").addClass("hidden");
		} else {
			$(".rank-btn").removeClass("hidden");
		}
	},
	// 替换标题图片
	toggleGameTitleImg: function(tag) {
		if (tag == "true") { // 替换
			platform_config["game-title-img-show"] = true;
			$("#pic-game-title-img").removeClass("hidden");
			$(".game-title span").addClass("hidden");
			$(".game-title img").removeClass("hidden");
			workBench.resetGameStyle();
		} else {
			platform_config["game-title-img-show"] = false;
			$("#pic-game-title-img").addClass("hidden");
			$(".game-title span").removeClass("hidden");
			$(".game-title img").addClass("hidden");
		}
		workBench.save();
	},
	// 切换二维码类型
	switchGameQrcodeType: function(type) {
		if (type == "none") { // 活动首页
			$("#pic-game-qrcode").addClass("hidden");
			$("#input-game-qrcode-link").val("").addClass("hidden");
		} else if (type == "link") {
			$("#pic-game-qrcode").addClass("hidden");
			$("#input-game-qrcode-link").removeClass("hidden");
			if ($("#input-game-qrcode-link").val() == "") $("#input-game-qrcode-link").val("http://");
		} else if (type == "pic") {
			$("#pic-game-qrcode").removeClass("hidden");
			$("#input-game-qrcode-link").val("").addClass("hidden");
		}
		this.setGameQrcodeData();
	},
	// 设置二维码数据
	setGameQrcodeData: function() {
		var type = $("input[name='game-qrcode-type']:checked").val();
		if (type == "none") { // 活动首页
			platform_config["game"]["qrcode"]["url"] = "";
			platform_config["game"]["qrcode"]["pic"] = "";
		} else if (type == "link") {
			platform_config["game"]["qrcode"]["url"] = $("#input-game-qrcode-link").val();
			platform_config["game"]["qrcode"]["pic"] = "";
		} else if (type == "pic") {
			platform_config["game"]["qrcode"]["url"] = "";
			platform_config["game"]["qrcode"]["pic"] = workBench.assetsPanel.getImageUrl($("#pic-game-qrcode .custom-pic-div").css("background-image"));
		}
		platform_config["game"]["qrcode"]["text"] = $("#input-game-qrcode-text").val();
		workBench.save();
	}
};

/* 营销设置 */
var GameInfoCustom = function() {
	// 调整表单输入框高度
	var len = $("#form-mask").find(".label-box").children().length;
	var height = len > 3 ? 45+(len-3)*5 : 45;
	$(".form-box").css('height',height+'%');
	this.initFreezeData();
	this.initPrizeIndex();
	this.bindEvents();
	this.prizeAddModal = new PrizeAddModal();

	this.resortBlock();
	this.setCycle();
	this.setCycleTotal();
	this.initBarcode();
	if (location.origin.toLowerCase().indexOf("24haowan.i.shanyougame.com") < 0) this.getAuthStatus();

	if (typeof this.prizeIndex["lottery"] != "undefined") this.previewLottery();
};
GameInfoCustom.prototype = {
	// 当前页ID
	currentPage : 1,
	// 序号
	numArr : ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十"],
	// 创建奖品模态框
	prizeAddModal: null,
	// 奖品数量下限
	freeze: {},
	// 各类获奖下标
	prizeIndex: {},
	// 当前公众号授权ID
	w_id: null,
	// 是否已启用公众号
	w_enable: false,
	// 授权公众号名称
	w_nickname: "",

	// 绑定事件
	bindEvents : function() {
		var self = this;

		// 周期
		$("body").on("click", function() {
			$(".prize-cycle-dropdown .dropdown").addClass("hidden");
			$(".prize-cycle-dropdown .glyphicon").removeClass("glyphicon-triangle-top").addClass("glyphicon-triangle-bottom");
		});

		$(".custom-info-block").on("click", function() {
			if ($(this).hasClass("empty-info")) self.togglePanel(this);
		});
		$(".custom-info-detail").on("click", function(e) {
			$(".prize-cycle-dropdown .dropdown").addClass("hidden");
			$(".prize-cycle-dropdown .glyphicon").removeClass("glyphicon-triangle-top").addClass("glyphicon-triangle-bottom");
			e.stopPropagation();
		});

		// 编辑按钮
		$("#gameinfo-container").find(".custom-info-preview-edit").on("click", function(e) {
			self.togglePanel($(this).parent().parent());
			e.stopPropagation();
		});
		// 取消按钮
		$("#gameinfo-container").find(".custom-info-bottom").find(".cancel-btn").on("click", function(e) {
			if (!$(this).hasClass("disabled")) self.cancelItem(this);
			e.stopPropagation();
		});
		$(".feedback-add-container").keypress(function(event) {
		    var keycode = (event.keyCode ? event.keyCode : event.which);  
		    if (keycode == '13') {
		    	$(this).find("input").blur();
		    }
		});
		// 开关
		$("#gameinfo-container").find(".prize-switch").on("click", function(e) {
			if (!$(this).hasClass("disabled")) {
				if ($(this).prop("checked")) { // 启用
					self.choose(this);
				} else { // 未启用
					self.dechoose(this);
				}
			}
			e.stopPropagation();
		});
		// 选择奖品
		$("#gameinfo-container").find(".custom-prize-block").find("button").on("click", function() {
			if (!$(this).hasClass("disabled")) {
				var id = $(this).attr("name");
				self.prizeAddModal.show(id, this);
			}
		});
		// 添加奖项
		$("#btn-prize-add").on("click", function(e) {
			e.stopPropagation();
			if (!$(this).hasClass("disabled")) self.addRankPrize();
		});
		// 删除奖项
		$("#custom-rank").find(".custom-prize-block").find(".modal-close").on("click", function(e) {
			var gift_id = $(this).parent().find("button").attr("name");
			$(this).parent().remove();
			self.updateRankInterval();
			self.reIndexRank();
			e.stopPropagation();
		});
		// 奖品数量
		$("#custom-rank").find("input[name='num']").on("input", function() {
			self.setRankData(this);
		});
		$("#custom-rank").find("input[name='num']").on("change", function() {
			self.setRankData(this, true);
		});
		$("#custom-share").find("input[name='num']").on("input", function() {
			self.setShareData(this);
		});
		$("#custom-share").find("input[name='num']").on("change", function() {
			self.setShareData(this, true);
		});
		$("#custom-play").find("input[name='num']").on("input", function() {
			self.setPlayData(this);
		});
		$("#custom-play").find("input[name='num']").on("change", function() {
			self.setPlayData(this, true);
		});
		$("#custom-lottery").find("input[name='num']").on("input", function() {
			self.setLotteryData(this);
		});
		$("#custom-lottery").find("input[name='num']").on("change", function() {
			self.setLotteryData(this, true);
		});
		$("#input-lottery-percent").on("change", function() {
			self.setLotteryPercent(this);
		});
		// 确定按钮
		$("#gameinfo-container").find(".custom-info-bottom").find(".confirm-btn").on("click", function(e) {
			if (!$(this).hasClass("disabled")) self.confirmItem(this);
			e.stopPropagation();
		});
		// 添加自定义选项
		$("#btn-feedback-add").on("click", function(e) {
			if (!$(this).hasClass("disabled")) self.addFeedback();
			e.stopPropagation();
		});
		// 预设自定义选项
		$(".preset-btn-container").find("button").on("click", function() {
			if (!$(this).hasClass("disabled")) {
				var content = $(this).text();
				var isExist = false;
				$(".feedback-add-container").find("button").each(function() {
					if ($(this).text() == content) {
						isExist = true;
					}
				});
				if (isExist) {
					showRemind("请勿添加重复信息");
				} else {
					var index = $(".feedback-add-container").find("div").length+1;
					var html = "<div><span>"+index+".</span><button class='btn btn-g btn-s'>"+content+"</button><img src='/images/dev/icon-delete.png' class='btn-feedback-delete'></div>";
					$(".feedback-add-container").append(html);
					$(".feedback-add-container").find("img").last().on("click", function() {
						$(this).parent().remove();
						self.updateMsgView();
						self.reIndexFeedback();
					});
					self.updateMsgView();
				}
			}
		});
		// 填写说明输入框
		$("#text-feedback-desc").on("input", function() {
			self.updateMsgView(true);
		});
		$("#text-feedback-desc").on("change", function() {
			self.updateMsgView(true);
		});
		// 添加抽奖奖品
		$("#btn-lottery-prize-add").on("click", function(e) {
			if (!$(this).hasClass("disabled")) self.addLotteryPrize();
			e.stopPropagation();
		});
		// 删除抽奖奖品
		$("#custom-lottery").find(".btn-delete").on("click", function(e) {
			$(this).parent().parent().remove();
			self.reIndexLottery();
			if ($(".lottery-block").length <= 1) {
				$(".lottery-block").find(".btn-delete").addClass("hidden");
			} else {
				$(".lottery-block").find(".btn-delete").removeClass("hidden");
			}
			self.calLotteryPercent();
			e.stopPropagation();
		});

		if (game_status == "wait") {
			// 删除自定义选项
			$(".btn-feedback-delete").on("click", function() {
				$(this).parent().remove();
				self.updateMsgView();
				self.reIndexFeedback();
			});
		}

		// 抽奖条件
		$("input[name='lottery-condition']").on("click", function() {
			if ($(this).val() == "share") {
				$(".lottery-add-chance-container").addClass("hidden");
			} else {
				$(".lottery-add-chance-container").removeClass("hidden");
			}

			if ($(this).val() == "score" && game_status == "wait") {
				$("#lottery-condition-score").prop("readonly", false).removeClass("disabled");
			} else {
				$("#lottery-condition-score").prop("readonly", true).addClass("disabled");
			}
		});
		$("#lottery-condition-score").on("focus", function() {
			if (!$(this).hasClass("disabled")) $(this).parent().find(".score-desc-container").removeClass("hidden");
		});
		$("#lottery-condition-score").on("blur", function() {
			if (!$(this).hasClass("disabled")) $(this).parent().find(".score-desc-container").addClass("hidden");
		});

		// 发奖周期-选择周期
		$(".prize-cycle-dropdown").on("click", function(e) {
			if (!$(this).hasClass("disabled")) {
				self.toggleCycle(this);
			}
			e.stopPropagation();
		});
		$(".prize-cycle-dropdown .dropdown span").on("click", function(e) {
			var cycle = $(this).attr("name");
			var text_cycle = $(this).text();
			var container = $(this).parent().parent();
			// 设置值
			$(container).find(".prize-cycle-dropdown-value").text(text_cycle).attr("name", cycle);
			// 设置周期
			var type = $(container).attr("id").split("prize-cycle-dropdown-")[1];
			self.setCycle(type);
			// 折叠
			self.toggleCycle(container);
			e.stopPropagation();
		});

		// 发奖周期-选择发奖方式
		$(".prize-cycle-select input").on("click", function() {
			if (!$(this).hasClass("disabled")) {
				var tableObj = $(this).parent().parent().parent().parent();
				if ($(this).val() == "once") { // 仅一次
					$(tableObj).find(".tr-cycle").addClass("hidden");
					$(tableObj).find(".num-th").text("奖品数量");
				} else { // 周期
					$(tableObj).find(".tr-cycle").removeClass("hidden");
					$(tableObj).find(".num-th").text("每天数量");
				}
				$(tableObj).find("input[name='input-cycle-total']").val("");
				$(tableObj).find("input[name='num']").val("");
			}
		});

		// 发奖周期-奖品总数
		$(".custom-prize-block-table[name='play'] input[name='input-cycle-total']").on("focus", function() {
			self.setCycleTotal();
		});

		// 公众号授权按钮
		$(".auth-btn").on("click", function() {
			workBench.authModal.show();
			self.getAuthUrl();
		});

		// 抽奖形式
		$("input[name='lottery-way']").on("click", function() {
			if ($(this).val() == "times") {
				$(".lottery-times-container").removeClass("hidden");
				$(".lottery-cycle-container").addClass("hidden");
				$(".lottery-cycle-num-container").addClass("hidden");
				$(".lottery-cycle-repeat-container").addClass("hidden");
			} else if ($(this).val() == "cycle") {
				$(".lottery-times-container").addClass("hidden");
				$(".lottery-cycle-container").removeClass("hidden");
				$(".lottery-cycle-num-container").removeClass("hidden");
				$(".lottery-cycle-repeat-container").removeClass("hidden");
			}
		});
	},
	// 初始化奖品下线配置
	initFreezeData: function() {
		if (original_gift_config.length > 0) {
			for (var i = 0; i < original_gift_config.length; i++) {
				var type = original_gift_config[i].type;
				if (type == 3) { // 分享即可获奖
					var freeze = original_gift_config[i].prize[0].num - left_gift_config[i].prize[0].num;
					this.freeze["share"] = freeze;
				} else if (type == 4) { // 参加即可获奖
					var freeze = original_gift_config[i].prize[0].num - left_gift_config[i].prize[0].num;
					this.freeze["play"] = freeze;
				} else if (type == 5) {
					var freeze = [];
					for (var index in original_gift_config[i].prize) {
						var sended = original_gift_config[i].prize[index].num - left_gift_config[i].prize[index].num;
						freeze.push(sended);
					}
					this.freeze["lottery"] = freeze;
				}
			}
		}
	},
	// 初始化奖品下标
	initPrizeIndex: function() {
		for (var index in gift_config) {
			var type = gift_config[index].type;
			if (type == 1) {
				this.prizeIndex["rank"] = index;
			} else if (type == 3) {
				this.prizeIndex["share"] = index;
			} else if (type == 4) {
				this.prizeIndex["play"] = index;
			} else if (type == 5) {
				this.prizeIndex["lottery"] = index;
			}
		}
	},


	// 设置排行榜配置
	setRankData: function(inputObj, change) {
		var content = parseInt($(inputObj).val());
		var pattern = /^\d+$/;
		var tableObj = $(inputObj).parent().parent().parent();
		var blockObj = $(tableObj).parent().parent();
		var gift_id = $(blockObj).find("button").attr("name");
		if (pattern.exec(content)) {
			// 当前项赋值
			var min = parseInt($(tableObj).find("span[name='min']").text()); // 最小排名
			var max = min+content-1;
			$(tableObj).find("span[name='max']").text(max);

			// 改后面的项
			blockObj = $(blockObj).next();
			while ($(blockObj).hasClass("custom-prize-block")) {
				var min = max+1;
				$(blockObj).find("span[name='min']").text(min);
				var num = parseInt($(blockObj).find("input").val());
				if (pattern.exec(num)) {
					max = min+num-1;
					$(blockObj).find("span[name='max']").text(max);
				}
				blockObj = $(blockObj).next();
			}
		} else {
			// 清空排名
			$(tableObj).find("span[name='max']").text("");
		}
	},
	// 设置抽奖配置
	setLotteryData: function(inputObj, change) {
		var content = $(inputObj).val();
		var pattern = /^\d+$/;
		if (!pattern.exec(content)) {
			showRemind("奖品数量格式不正确");
			$(inputObj).focus();
		} else if (content <= 0) {
			showRemind("奖品数量至少为1");
			$(inputObj).focus();
		} else {
			this.calLotteryPercent();
		}
	},
	// 设置抽奖概率
	setLotteryPercent: function(inputObj) {
		var content = $(inputObj).val();
		var pattern = /^\d+$/;

        var data_ok = true;
        if(content.toString().indexOf(".") > -1) {
            if( content.toString().split(".")[1].length > 2 ) {
                data_ok = false;
            }
        }
        if(!data_ok) {
            showRemind("中奖概率格式不正确");
            $(inputObj).focus();
        }
        else if ( !((parseFloat(content)>=0.01)&&(parseFloat(content)<=100)) ) {
            showRemind("请输入0.01%-100%的中奖概率");
            $(inputObj).focus();
        }
        else {
			this.calLotteryPercent();
		}
	},
	// 计算抽奖各奖品中奖概率
	calLotteryPercent: function() {
		// 获取中奖概率
		var total_percent = $("#input-lottery-percent").val();
		if (!total_percent) total_percent = 0;
		// 计算总数
		var total = 0;
		$(".lottery-block").each(function() {
			total += parseInt($(this).find("input[name='num']").val());
		});
		// 计算各奖品中奖概率
		$(".lottery-block").each(function() {
			var num = $(this).find("input[name='num']").val();
			var pattern = /^\d+$/;
			if (pattern.exec(num)) {
				num = parseInt(num);
				var percent = num/total*10000 * total_percent;
				percent = ((Math.round(percent))/10000).toFixed(3);
				$(this).find(".lottery-prize-percent").text(percent);
			}
		});
	},
	// 设置分享配置
	setShareData: function(inputObj, change) {
		var content = parseInt($(inputObj).val());
		var blockObj = $(inputObj).parent().parent().parent();
		var pattern = /^\d+$/;
		var gift_id = $(blockObj).find("button").attr("name");
		var freeze = this.freeze["share"];
		if (change) {
			if (content < freeze) {
				showRemind("奖品数量不能低于已发放数量");
				$(inputObj).val(freeze).focus();
			}
		}
	},
	// 设置参与配置
	setPlayData: function(inputObj, change) {
		var content = parseInt($(inputObj).val());
		var blockObj = $(inputObj).parent().parent().parent();
		var pattern = /^\d+$/;
		var gift_id = $(blockObj).find("button").attr("name");
		var freeze = this.freeze["play"];
		if (change) {
			if (content < freeze) {
				showRemind("奖品数量不能低于已发放数量");
				$(inputObj).val(freeze).focus();
			}
			if (pattern.exec(content)) {
				if ($(".custom-prize-block-table input[name='input-cycle-total']").val() == "") {
					var cycle_num = parseInt($(".custom-prize-block-table[name='play'] input[name='num']").val());
					var cycle = $(".custom-prize-block-table[name='play']").find(".prize-cycle-total span").text();
					$(".custom-prize-block-table input[name='input-cycle-total']").val(parseInt(cycle_num*cycle));
				}
			}
		}
	},

	// 重新编号
	reIndexRank: function() {
		var self = this;
		var index = 0;
		$("#custom-rank").find(".custom-prize-block").each(function() {
			$(this).find(".title").text("奖品"+self.numArr[index++]);
		});
	},
	// 重新编号抽奖
	reIndexLottery: function() {
		var self = this;
		var index = 0;
		$("#custom-lottery").find(".lottery-block").each(function() {
			$(this).find("span").first().text("奖品"+self.numArr[index++]);
		});
	},
	// 更新排行的排名
	updateRankInterval: function() {
		var min = 1, max = 0;
		var pattern = /^\d+$/;
		$("#custom-rank").find(".custom-prize-block").each(function() {
			var num = parseInt($(this).find("input[name='num']").val());
			if (pattern.exec(num)) {
				max = min+num-1;
				$(this).find("span[name='min']").text(min);
				$(this).find("span[name='max']").text(max);
				min = max+1;
			} else {
				min = max+1;
				$(this).find("span[name='min']").text(min);
				$(this).find("span[name='max']").text("");
			}
		});
	},
	// 切换显示面板
	togglePanel: function(targetObj) {
		var type = $(targetObj).attr("id").split("-")[1];
		// 发布以后没有配的奖品就不能打开
		var toggleTag = true;
		if (game_status != "wait") {
			if (typeof this.prizeIndex[type] === "undefined") {
				toggleTag = false;
			}
		}
		if (type == "auth") toggleTag = true;
		if (toggleTag) {
			var isHidden = $(targetObj).find(".custom-info-detail").hasClass("hidden");
			// 显示相应面板
			$("#gameinfo-container").find(".custom-info-detail").addClass("hidden");
			$("#gameinfo-container").find(".custom-info-block").removeClass("active");
			$("#gameinfo-container").find(".title .note").addClass("hidden");
			for (var index in gift_config) {
				if (gift_config[index].type == 1) {
					$("#custom-rank").find(".custom-info-preview").removeClass("hidden");
				} else if (gift_config[index].type == 3) {
					$("#custom-share").find(".custom-info-preview").removeClass("hidden");
				} else if (gift_config[index].type == 4) {
					$("#custom-play").find(".custom-info-preview").removeClass("hidden");
				} else if (gift_config[index].type == 5) {
					$("#custom-lottery").find(".custom-info-preview").removeClass("hidden");
				}
			}
			if (platform_config.message.msg.type) {
				$("#custom-feedback").find(".custom-info-preview").removeClass("hidden");
			}

			if (isHidden) {
				$("#custom-"+type).find(".custom-info-detail").removeClass("hidden");
				$("#custom-"+type).find(".title .note").removeClass("hidden");
				$("#custom-"+type).find(".custom-info-preview").addClass("hidden");
				$("#custom-"+type).addClass("active");
				if (type == "feedback") {
					$("#form-mask").removeClass("hidden");
					// $("#receive-mask").addClass("hidden");
					$(".giftcenter-container-single").addClass("hidden");
				} else {
					$("#form-mask").addClass("hidden");
					// $("#receive-mask").removeClass("hidden");
					$(".giftcenter-container-single").removeClass("hidden");
				}
			} else {
				var enable_tag = false;
				for (var index in gift_config) {
					if ((type == "rank" && gift_config[index].type == 1)
						|| (type == "share" && gift_config[index].type == 3)
						|| (type == "play" && gift_config[index].type == 4)
						|| (type == "lottery" && gift_config[index].type == 5)) {
						enable_tag = true;
						break;
					}
				}
				if (enable_tag) $("#custom-"+type).find(".custom-info-preview").removeClass("hidden");
			}
		}
	},

	// 确定使用
	confirmItem: function(targetObj) {
		var self = this;
		var type = $(targetObj).attr("name");
		var container = $(targetObj).parent().parent().parent();
		var error = false;
		if (type == "auth") { // 公众号授权
			this.setAuth();
			error = true;
		} else if (type == "feedback") { // 用户信息
			var feedback_time = $("input[name='feedback-time']:checked").val();
			var feedback_data = [];
			$(".feedback-add-container").find("button").each(function() {
				feedback_data.push($(this).text());
			});
			if ($(".feedback-add-container").find("button").length == 0) {
				showRemind("至少要保留一个信息项");
				error = true;
			} else {
				var desc = $("#text-feedback-desc").val();
				platform_config["message"]["msg"] = {
					type : feedback_time,
					list : feedback_data,
					desc : desc
				}
				default_msg_config = {
					type : feedback_time,
					list : feedback_data,
					desc : desc
				}
				this.previewFeedback();
			}
		} else if (type == "lottery") { // 抽奖
			if (self.checkLotteryPrize()) {
				var index = 0;
				all_gift_config["lottery"] = {percent: 0, prize: [], condition: "play", score: 0};
				// 中奖概率
				var percent = parseFloat($("#input-lottery-percent").val());
				all_gift_config["lottery"]["percent"] = percent;
				// 中奖条件
				var condition = $("input[name='lottery-condition']:checked").val();
				all_gift_config["lottery"]["condition"] = condition;
				// 得分条件
				var condition_score = 0;
				if (condition == "score") {
					condition_score = parseInt($("#lottery-condition-score").val());
				}
				// 通关类默认减1分
				if (game_type == 4) { 
					condition_score--;
				}
				all_gift_config["lottery"]["score"] = condition_score;
				// 附加条件
				var add_chance;
				if ($("input[name='add-chance']").prop("checked") && (condition == "play" || condition == "score")) {
					add_chance = "share";
					all_gift_config["lottery"]["add_chance"] = add_chance;
				}
				if (typeof self.prizeIndex["lottery"] !== "undefined") {
					gift_config[self.prizeIndex["lottery"]] = {type: 5, prize: []};
				}
				$("#custom-lottery").find(".lottery-block").each(function() {
					var num = $(this).find("input[name='num']").val();
					var prize_id = $(this).find("button").attr("name").split("-")[0];
					var gift_type = $(this).find("button").attr("name").split("-")[1];
					if (typeof self.prizeIndex["lottery"] === "undefined") { // 之前没有定义过
						gift_config.push({type: 5, prize: [], percent: percent, condition: condition, score: condition_score});
						self.prizeIndex["lottery"] = gift_config.length-1;
					} else {
						gift_config[self.prizeIndex["lottery"]]["condition"] = condition;
						gift_config[self.prizeIndex["lottery"]]["percent"] = percent;
						gift_config[self.prizeIndex["lottery"]]["score"] = condition_score;
					}
					if (add_chance) gift_config[self.prizeIndex["lottery"]]["add_chance"] = add_chance;
					gift_config[self.prizeIndex["lottery"]]["prize"][index] = {
						gift_id: prize_id,
						num: num,
						gift_type: gift_type
					};
					all_gift_config["lottery"]["prize"][index] = {
						gift_id: prize_id,
						num: num,
						gift_type: gift_type
					};
					// 红包特殊处理
					if (gift_type == 2 || gift_type == 3) {
						var price = $(this).find("input[name='input-giftmoney-common']").val();
						var total = parseInt(price * num);
						gift_config[self.prizeIndex["lottery"]]["prize"][index]["sum"] = total;
						all_gift_config["lottery"]["prize"][index]["sum"] = total;
					}
					index++;
				});
				// 抽奖形式
				var lottery_way = $("input[name='lottery-way']:checked").val();
				if (lottery_way == "times") { // 抽奖次数
					limit_times = $("#input-limit-times").val();
				} else { // 周期性
					limit_times = -1;
					// 周期
					var cycle = $(".lottery-cycle-container .prize-cycle-dropdown-value").attr("name");
					all_gift_config["lottery"]["cycle"] = cycle;
					gift_config[self.prizeIndex["lottery"]]["cycle"] = cycle;
					// 每人每天抽奖
					var cycle_num = $("#lottery-cycle-num").val();
					all_gift_config["lottery"]["cycle_num"] = cycle_num;
					gift_config[self.prizeIndex["lottery"]]["cycle_num"] = cycle_num;
					// 每人最多中奖
					var repeat = $("#lottery-cycle-repeat").val();
					all_gift_config["lottery"]["repeat"] = repeat;
					gift_config[self.prizeIndex["lottery"]]["repeat"] = repeat;
				}
				workBench.assetsCustom.updateActivityView(false, false, true);
				this.previewLottery();
			} else {
				error = true;
			}
		} else if (type == "rank") { // 按排行获奖
			if (self.checkRankPrize()) {
				var index = 0;
				all_gift_config["rank"] = [];
				if (typeof self.prizeIndex["rank"] !== "undefined") {
					gift_config[self.prizeIndex["rank"]] = {type: 1, prize: []};
				}
				$("#custom-rank").find(".custom-prize-block").each(function() {
					var num = $(this).find("input[name='num']").val();
					var prize_id = $(this).find("button").attr("name").split("-")[0];
					var gift_type = $(this).find("button").attr("name").split("-")[1];
					var min = $(this).find("span[name='min']").text();
					var max = $(this).find("span[name='max']").text();
					var interval = [min, max];
					if (typeof self.prizeIndex["rank"] === "undefined") { // 之前没有定义过
						gift_config.push({type: 1, prize: []});
						self.prizeIndex["rank"] = gift_config.length-1;
					}
					gift_config[self.prizeIndex["rank"]]["prize"][index] = {
						gift_id: prize_id,
						num: num,
						interval: interval,
						gift_type: gift_type
					};
					all_gift_config["rank"][index] = {
						gift_id: prize_id,
						num: num,
						interval: interval,
						gift_type: gift_type
					};
					// 红包特殊处理
					if (gift_type == 2 || gift_type == 3) {
						var price = $(this).find("input[name='input-giftmoney-common']").val();
						var total = parseInt(price * num);
						gift_config[self.prizeIndex["rank"]]["prize"][index]["sum"] = total;
						all_gift_config["rank"][index]["sum"] = total;
					}
					index++;
				});
				workBench.assetsCustom.updateActivityView(false, false, true);
				this.previewRank();
			} else {
				error = true;
			}
		} else {
			if (self.checkOtherPrize(type)) {
				var num = $(container).find("input[name='num']").val();
				var prize_id = $(container).find(".custom-prize-block").find("button").attr("name").split("-")[0];
				var gift_type = $(container).find(".custom-prize-block").find("button").attr("name").split("-")[1];
				var prize_type = (type == "share") ? 3 : 4;

				if (type == "play") {
					var cycle_enable = ($("input[name='prize-cycle-play']:checked").val() == "once") ? false : true;
					if (cycle_enable) {
						var cycle = $(".custom-prize-block-table[name='play'] .prize-cycle-dropdown-value").attr("name");
						var cycle_num = num;
						num = $(container).find("input[name='input-cycle-total']").val();
						var repeat = "yes";
					}
				}

				if (typeof self.prizeIndex[type] === "undefined") { // 之前没有定义过
					if (type == "play" && cycle_enable) {
						gift_config.push({type: prize_type, prize: [], cycle: cycle, cycle_num: cycle_num, repeat: repeat});
						self.prizeIndex[type] = gift_config.length-1;
					} else {
						gift_config.push({type: prize_type, prize: []});
						self.prizeIndex[type] = gift_config.length-1;
					}
				}
				gift_config[self.prizeIndex[type]]["type"] = prize_type;
				gift_config[self.prizeIndex[type]]["prize"] = [{
					gift_id: prize_id,
					num: num,
					gift_type: gift_type
				}];
				all_gift_config[type] = {
					gift_id: prize_id,
					num: num,
					gift_type: gift_type
				}
				if (type == "play" && cycle_enable) {
					gift_config[self.prizeIndex[type]].cycle = cycle;
					gift_config[self.prizeIndex[type]].cycle_num = cycle_num;
					gift_config[self.prizeIndex[type]].repeat = repeat;
					all_gift_config[type].cycle = cycle;
					all_gift_config[type].cycle_num = cycle_num;
					all_gift_config[type].repeat = repeat;
				}

				// 红包特殊处理
				if (gift_type == 2 || gift_type == 3) {
					var price = $(container).find("input[name='input-giftmoney-common']").val();
					var total = parseInt(price * num);
					gift_config[self.prizeIndex[type]]["prize"][0]["sum"] = total;
					all_gift_config[type]["sum"] = total;
				}
				workBench.assetsCustom.updateActivityView(false, false, true);
				if (type == "share") {
					this.previewShare();
				} else if (type == "play") {
					this.previewPlay();
				}
			} else {
				error = true;
			}
		}
		if (!error) {
			// 去除面板的开关
			$("#custom-"+type).removeClass("empty-info");
			// 选中
			$(container).find(".prize-switch").prop("checked", true);
			// 收起
			$(container).find(".custom-info-detail").addClass("hidden");
			$(container).find(".title .note").addClass("hidden");
			$(container).find(".custom-info-preview").removeClass("hidden");
			$(container).removeClass("active");
			if (game_status != "wait") self.calGiftMoney(); 
			workBench.save();
			self.resortBlock();
		}
	},
	// 取消使用
	cancelItem: function(targetObj) {
		var container = $(targetObj).parent().parent().parent();
		$(container).find(".custom-info-detail").addClass("hidden");
		$(container).find(".title .note").addClass("hidden");
		if ($(targetObj).parent().parent().parent().find(".prize-switch").prop("checked")) $(container).find(".custom-info-preview").removeClass("hidden");
		$(container).removeClass("active");
	},

	// 添加排名获奖奖项
	addRankPrize: function() {
		var self = this;
		if (this.checkRankPrize()) {
			var index = $("#custom-rank").find(".custom-prize-block").length;
			var min_num = parseInt($("#custom-rank").find(".custom-info-bottom").prev().find("span[name='max']").text())+1;
			var html = "<div class='custom-prize-block' id='rank-prize-block-"+index+"'><img src='//24haowan-cdn.shanyougame.com/public/images/dev/icon-close.png' class='modal-close'><div class='title'>奖品"+this.numArr[index]+"</div>"+
				"<table class='rank-table'>"+
				"<tr><th style='width:25%'>奖品</th>"+
				"<th style='width: 25%;' class='rank-giftmoney-common hidden'><span>单个金额</span><img src='//24haowan-cdn.shanyougame.com/public/images/web/icon-workbench-info.png' class='giftmoney-price-remind-img'><div class='giftmoney-price-remind-text hidden'>单个红包金额在1元－200元之间，活动发布后将不可修改。</div></th>"+
				"<th style='width:50%;' class='prize-num-th'><span>数量</span><img src='//24haowan-cdn.shanyougame.com/public/images/web/icon-workbench-info.png' class='giftmoney-num-remind-img hidden'><div class='giftmoney-num-remind-text hidden'>如果已经充值了红包需要减少红包总额，剩余金额将在活动结束后72h内原路返还到充值账号内。</div></th>"+
				"<th style='width:25%'>排名区间</th></tr>"+
				"<tr><td><button class='btn btn-g btn-s rank-prize-btn' name=''>选择奖品</button></td>"+
				"<td class='rank-giftmoney-common hidden'><input type='text' class='input-text' name='input-giftmoney-common' value=''></td>"+
				"<td style='padding-left:10px;'><input type='text' class='input-text' name='num'><div class='note'>&nbsp;</div></td>"+
				"<td><span name='min' style='display: inline-block;text-align: center;'>"+min_num+"</span><span style='display: inline-block;width: 20px;text-align: center;'>~</span><span name='max' style='display: inline-block;text-align: center;'></span></td></tr></table>"+
				"</div>";
			$("#custom-rank").find(".custom-info-bottom").before(html);
			var obj = $("#custom-rank").find(".custom-info-bottom").prev();
			// 数量
			$(obj).find("input[name='num']").on("input", function() {
				self.setRankData(this);
			});
			$(obj).find("input[name='num']").on("change", function() {
				self.setRankData(this, true);
			});
			// 选择奖品
			$(obj).find("button").on("click", function() {
				if (!$(this).hasClass("disabled")) {
					var id = $(this).attr("name");
					self.prizeAddModal.show(id, this);
				}
			}); 
			// 删除按钮
			$(obj).find(".modal-close").on("click", function(e) {
				var gift_id = $(this).parent().find("button").attr("name");
				$(this).parent().remove();
				self.updateRankInterval();
				self.reIndexRank();
				e.stopPropagation();
			});
			// 取消冒泡
			$(obj).on("click", function(e) {
				e.stopPropagation();
			});
			// 红包提示
			$(obj).find(".giftmoney-num-remind-img").mouseenter(function() {
				$(this).next().removeClass("hidden");
			});
			$(obj).find(".giftmoney-num-remind-img").mouseleave(function() {
				$(this).next().addClass("hidden");
			});
			$(obj).find(".giftmoney-price-remind-img").mouseenter(function() {
				$(this).next().removeClass("hidden");
			});
			$(obj).find(".giftmoney-price-remind-img").mouseleave(function() {
				$(this).next().addClass("hidden");
			});
		}
	},
	// 添加排名获奖奖项
	addLotteryPrize: function() {
		var self = this;
		if (this.checkLotteryPrize()) {
			var index = $("#custom-lottery").find(".lottery-block").length;			
			if (index >= 5) {
				showRemind("奖品最多设置5个");
			} else {
				var html = "<div class='lottery-block'><div><span>奖品"+this.numArr[index]+"</span><img src='//24haowan-cdn.shanyougame.com/public/images/web/icon-close.png' class='btn-delete'></div><table class='lottery-table'><tr><th style='width: 25%;'>奖品</th>"+
					"<th style='width: 25%;' class='lottery-giftmoney-common hidden'><span>单个金额</span><img src='//24haowan-cdn.shanyougame.com/public/images/web/icon-workbench-info.png' class='giftmoney-price-remind-img'><div class='giftmoney-price-remind-text hidden'>单个红包金额在1元－200元之间，活动发布后将不可修改。</div></th>"+
					"<th style='width: 50%;' class='prize-num-th'><span>数量</span><img src='//24haowan-cdn.shanyougame.com/public/images/web/icon-workbench-info.png' class='giftmoney-num-remind-img hidden'><div class='giftmoney-num-remind-text hidden'>如果已经充值了红包需要减少红包总额，剩余金额将在活动结束后72h内原路返还到充值账号内。</div></th>"+
					"<th style='width: 25%;'>中奖率</th></tr>"+
					"<tr><td><button class='btn btn-g btn-s lotter-prize-btn' name=''>选择奖品</button></td>"+
					"<td class='lottery-giftmoney-common hidden'><input type='text' class='input-text' name='input-giftmoney-common' value=''></td>"+
					"<td><div class='lottery-num-container'><input type='text' class='input-text' name='num'><div class='note hidden'>已发放数：<span class='sended'>0</span></div></div></td>"+
					"<td><span class='lottery-prize-percent'>0</span><span>%</span></td></tr></table></div>";

				$("#custom-lottery").find(".custom-prize-block").append(html);
				var obj = $("#custom-lottery").find(".lottery-block").last();
				// 数量
				$(obj).find("input[name='num']").on("input", function() {
					self.setLotteryData(this);
				});
				$(obj).find("input[name='num']").on("change", function() {
					self.setLotteryData(this, true);
				});
				// 选择奖品
				$(obj).find("button").on("click", function() {
					if (!$(this).hasClass("disabled")) {
						var id = $(this).attr("name");
						self.prizeAddModal.show(id, this);
					}
				});
				// 删除按钮
				$(obj).find(".btn-delete").on("click", function(e) {
					$(this).parent().parent().remove();
					self.reIndexLottery();
					if ($(".lottery-block").length <= 1) {
						$(".lottery-block").find(".btn-delete").addClass("hidden");
					} else {
						$(".lottery-block").find(".btn-delete").removeClass("hidden");
					}
					self.calLotteryPercent();
					e.stopPropagation();
				});
				// 取消冒泡
				$(obj).on("click", function(e) {
					e.stopPropagation();
				});
				// 红包提示
				$(obj).find(".giftmoney-num-remind-img").mouseenter(function() {
					$(this).next().removeClass("hidden");
				});
				$(obj).find(".giftmoney-num-remind-img").mouseleave(function() {
					$(this).next().addClass("hidden");
				});
				$(obj).find(".giftmoney-price-remind-img").mouseenter(function() {
					$(this).next().removeClass("hidden");
				});
				$(obj).find(".giftmoney-price-remind-img").mouseleave(function() {
					$(this).next().addClass("hidden");
				});
				$(".lottery-block").find(".btn-delete").removeClass("hidden");
			}
		}
	},

	// 检查排名获奖奖项
	checkRankPrize: function() {
		var self = this;
		var tag = true;
		var pattern_num = /^\d+$/;
		$("#custom-rank").find(".custom-prize-block").each(function() {
			var num = $(this).find("input[name='num']").val();
			var prize_id = $(this).find("button").attr("name").split("-")[0];
			var gift_type = $(this).find("button").attr("name").split("-")[1];
			var prize_name = $(this).find("button").text();
			var min = parseInt($(this).find("span[name='min']").text());
			var max = parseInt($(this).find("span[name='max']").text());
			var interval = [min, max];
			var index = parseInt($(this).attr("id").split("rank-prize-block-")[1])-1;
			
			// 判断是否已经被删除
			var enable_tag = false;
			for (var index in user_gift_list) {
				if (user_gift_list[index]["id"] == prize_id && user_gift_list[index]["enable"] == "yes") {
					enable_tag = true;
				}
			}
			if (gift_type == 2 || gift_type == 3) {
				var price = $(this).find("input[name='input-giftmoney-common']").val();
				if (!pattern_num.exec(price)) {
					showRemind("单个金额只可以输入正整数");
					$(this).find("input[name='input-giftmoney-common']").focus();
					tag = false;
					return false;
				} else if (parseInt(price) < 1) {
					showRemind("单个红包最小金额为1元");
					$(this).find("input[name='input-giftmoney-common']").focus();
					tag = false;
					return false;
				} else if (parseInt(price) > 200) {
					showRemind("单个红包最大金额为200元");
					$(this).find("input[name='input-giftmoney-common']").focus();
					tag = false;
					return false;
				}
			}
			if ($("#custom-rank").find(".custom-info-detail").hasClass("hidden") && prize_id == "") {
				showRemind("要先填写完奖品信息才能启用哦~");
				tag = false;
				return false;
			} else if (prize_id == "") {
				showRemind("请先选择奖品");
				tag = false;
				return false;
			} else if (!pattern_num.exec(num)) {
				showRemind("数量只可以输入正整数");
				$(this).find("input[name='num']").focus();
				tag = false;
				return false;
			} else if (num == 0) {
				showRemind("奖品数量至少为1");
				$(this).find("input[name='num']").focus();
				tag = false;
				return false;
			} else if (!enable_tag) {
				showRemind("奖品"+prize_name+"已被删除，请重新选择");
				tag = false;
				return false;
			} 
		});
		return tag;
	},
	// 检查抽奖获奖
	checkLotteryPrize: function() {
		var self = this;
		var tag = true;
		var pattern_num = /^\d+$/;
		var lottery_times = $("#input-limit-times").val(); // 抽奖次数
		
		// 周期抽奖
		var lottery_way = $("input[name='lottery-way']:checked").val();
		if (lottery_way == "cycle") {
			var cycle_num = $("#lottery-cycle-num").val();
			var repeat = $("#lottery-cycle-repeat").val();
			if (!pattern_num.exec(cycle_num)) {
				showRemind("每人每天抽奖次数格式不正确");
				$("#lottery-cycle-num").focus();
				return false;
			} else if (cycle_num <= 0) {
				showRemind("每人每天抽奖至少1次");
				$("#lottery-cycle-num").focus().val("1");
				return false;
			} else if (!pattern_num.exec(repeat)) {
				showRemind("每人最多中奖次数格式不正确");
				$("#lottery-cycle-repeat").focus();
				return false;
			} else if (repeat <= 0) {
				showRemind("每人最多中奖至少1次");
				$("#lottery-cycle-repeat").focus().val("1");
				return false;
			}
		}
		// 抽奖条件
		var condition = $("input[name='lottery-condition']:checked").val();
		if (condition == "score") {
			var condition_score = parseInt($("#lottery-condition-score").val());
			if (!pattern_num.exec(condition_score)) {
				if (game_type == 1 || game_type == 3) {
					showRemind("达到的分数的格式不正确");
				} else if (game_type == 4) {
					showRemind("达到的关卡数的格式不正确");
				}
				$("#lottery-condition-score").focus();
				tag = false;
				return tag;
			}
			if (game_type == 4) {
				if (condition_score > game_section) {
					showRemind("活动总共"+game_section+"关");
					$("#lottery-condition-score").focus();
					tag = false;
					return tag;
				}
			}
		}
		var percent = $("#input-lottery-percent").val();
        var data_ok = true;

        if(percent.toString().indexOf(".") > -1) {
            if( percent.toString().split(".")[1].length > 2 ) {
                data_ok = false;
            }
        }
        if (!data_ok) {
            showRemind("中奖概率格式不正确");
            $("#input-lottery-percent").focus();
            tag = false;
        } else if (!((percent >= 0.01) && (percent <= 100))) {
			showRemind("请输入0.01%-100%的中奖概率");
			$("#input-lottery-percent").focus();
			tag = false;
		} else if (!pattern_num.exec(lottery_times)) {
			showRemind("抽奖次数格式不正确");
            $("#input-limit-times").focus();
            tag = false;
		} else if (lottery_times <= 0) {
			showRemind("抽奖次数至少为1次");
            $("#input-limit-times").focus().val("1");
            tag = false;
		} else {
			var lotter_block_index = 0;
			$(".lottery-block").each(function() {
				var num = $(this).find("input[name='num']").val();
				var prize_id = $(this).find("button").attr("name").split("-")[0];
				var gift_type = $(this).find("button").attr("name").split("-")[1];
				var prize_name = $(this).find("button").text();
				var freeze = 0;
				if (self.freeze["lottery"] && prize_id >= 0) {
					freeze = self.freeze["lottery"][lotter_block_index++];
				}
				// 判断是否已经被删除
				var enable_tag = false;
				for (var index in user_gift_list) {
					if (user_gift_list[index]["id"] == prize_id && user_gift_list[index]["enable"] == "yes") {
						enable_tag = true;
					}
				}
				if (gift_type == 2 || gift_type == 3) {
					var price = $(this).find("input[name='input-giftmoney-common']").val();
					if (!pattern_num.exec(price)) {
						showRemind("单个金额只可以输入正整数");
						$(this).find("input[name='input-giftmoney-common']").focus();
						tag = false;
						return false;
					} else if (parseInt(price) < 1) {
						showRemind("单个红包最小金额为1元");
						$(this).find("input[name='input-giftmoney-common']").focus();
						tag = false;
						return false;
					} else if (parseInt(price) > 200) {
						showRemind("单个红包最大金额为200元");
						$(this).find("input[name='input-giftmoney-common']").focus();
						tag = false;
						return false;
					}
				}
				if (prize_id == "") {
					showRemind("请先选择奖品");
					tag = false;
					return false;
				} else if (!pattern_num.exec(num)) {
					showRemind("数量只可以输入正整数");
					$(this).find("input[name='num']").focus();
					tag = false;
					return false;
				} else if (num == 0) {
					showRemind("奖品数量至少为1");
					$(this).find("input[name='num']").focus();
					tag = false;
					return false;
				} else if (num < freeze) {
					showRemind("不能小于已分配的奖品数");
					$(this).find("input[name='num']").focus();
					tag = false;
					return false;
				} else if (!enable_tag) {
					showRemind("奖品"+prize_name+"已被删除，请重新选择");
					tag = false;
					return false;
				}
			});
		}
		return tag;
	},
	// 检查参与和分享后获奖
	checkOtherPrize: function(type) {
		var tag = false;
		var container = $("#custom-"+type);
		var num = $(container).find("input[name='num']").val();
		var prize_id = $(container).find(".custom-info-detail").find("button").attr("name").split("-")[0];
		var gift_type = $(container).find(".custom-info-detail").find("button").attr("name").split("-")[1];
		var pattern_num = /^\d+$/;

		if (type == "play") {
			var cycle_enable = ($("input[name='prize-cycle-play']:checked").val() == "once") ? false : true;
			if (cycle_enable) {
				var cycle = $(".custom-prize-block-table[name='play'] .prize-cycle-dropdown-value").attr("name");
				var cycle_num = num;
				num = $(container).find("input[name='input-cycle-total']").val();
				var repeat = "yes";
			}
		}

		var freeze = 0;
		if (prize_id) {
			freeze = this.freeze[type];
		}
		if (gift_type > 1) freeze = 0;
		// 判断是否已经被删除
		var enable_tag = false;
		for (var index in user_gift_list) {
			if (user_gift_list[index]["id"] == prize_id && user_gift_list[index]["enable"] == "yes") {
				enable_tag = true;
			}
		}
		if (gift_type == 2 || gift_type == 3) {
			var price = $(container).find("input[name='input-giftmoney-common']").val();
			if (!pattern_num.exec(price)) {
				showRemind("单个金额只可以输入正整数");
				$(container).find("input[name='input-giftmoney-common']").focus();
				return false;
			} else if (parseInt(price) < 1) {
				showRemind("单个红包最小金额为1元");
				$(container).find("input[name='input-giftmoney-common']").focus();
				return false;
			} else if (parseInt(price) > 200) {
				showRemind("单个红包最大金额为200元");
				$(container).find("input[name='input-giftmoney-common']").focus();
				return false;
			}
		}
		if ($("#custom-"+type).find(".custom-info-detail").hasClass("hidden") && prize_id == "") {
			showRemind("要先填写完奖品信息才能启用哦~");
			tag = false;
			return false;
		} else if (prize_id == "") {
			showRemind("要先填写完奖品信息才能启用哦~");
		} else if (!pattern_num.exec(num)) {
			showRemind("数量只可以输入正整数");
			if (type == "play" && cycle_enable) {
				$(container).find("input[name='input-cycle-total']").focus();
			} else {
				$(container).find("input[name='num']").focus();
			}
		} else if (num == 0) {
			showRemind("奖品数量至少为1");
			$(container).find("input[name='num']").focus();
		} else if (num < freeze) {
			showRemind("不能小于已分配的奖品数");
			if (type == "play" && cycle_enable) {
				$(container).find("input[name='input-cycle-total']").focus();
			} else {
				$(container).find("input[name='num']").focus();
			}
		} else if (!enable_tag) {
			showRemind("该奖品已被删除，请重新选择");
		} else {
			// 配置了周期性发奖的
			if (type == "play" && cycle_enable) {
				if (!pattern_num.exec(cycle_num)) {
					showRemind("数量只可以输入正整数");
					$(container).find("input[name='num']").focus();
				} else if (cycle_num == 0) {
					showRemind("奖品数量至少为1");
					$(container).find("input[name='num']").focus();
				} else {
					tag = true;
				}
			} else {
				tag = true;
			}
		}
		return tag;
	},

	// 添加自定义选项
	addFeedback: function() {
		var self = this;
		var index = $(".feedback-add-container").find("div").length+1;
		var html = "<div><span>"+index+".</span><input class='input-text input-text-l' maxlength='5'></div>";
		$(".feedback-add-container").append(html);
		$(".feedback-add-container").find("input").last().focus().on("blur", function() {
			var content = $(this).val();
			if (content == "") {
				$(this).parent().remove();
			} else {
				var isExist = false;
				$(".feedback-add-container").find("button").each(function() {
					if ($(this).text() == content) {
						isExist = true;
					}
				});
				if (isExist) {
					showRemind("请勿添加重复信息");
					$(this).focus();
				} else {
					var html = "<button class='btn btn-g btn-s'>"+content+"</button><img src='/images/dev/icon-delete.png' class='btn-feedback-delete'>";
					$(this).after(html);
					var parent = $(this).parent();
					$(parent).find("img").on("click", function() {
						$(this).parent().remove();
						self.updateMsgView();
						self.reIndexFeedback();
					});
					$(this).remove();
					self.updateMsgView();
				}
			}
		});
	},
	// 重新排序
	reIndexFeedback: function() {
		var index = 1;
		$(".feedback-add-container").find("span").each(function() {
			$(this).text(index++ +".");
		});
		if ($(".feedback-add-container").children().length == 0) {
			$("#custom-feedback").find(".prize-switch").prop("checked", false);
		}
	},

	// 勾选
	choose: function(targetObj) {
		var type = $(targetObj).attr("name");
		var container = $(targetObj).parent().parent();

		// 展开
		$(targetObj).prop("checked", false);
		if (type == "feedback") {
			if ($(container).find(".custom-info-detail").hasClass("hidden")) this.togglePanel($("#custom-feedback"));
		} else if (type == "rank") {
			if ($(container).find(".custom-info-detail").hasClass("hidden")) this.togglePanel($("#custom-rank"));
		} else if (type == "lottery") {
			if ($(container).find(".custom-info-detail").hasClass("hidden")) this.togglePanel($("#custom-lottery"));
		} else {
			if ($(container).find(".custom-info-detail").hasClass("hidden")) this.togglePanel($("#custom-"+type));
		}
	},
	// 取消勾选
	dechoose: function(targetObj) {
		var self = this;
		var type = $(targetObj).attr("name");
		var container = $(targetObj).parent().parent();
		if (!$(container).find(".custom-info-detail").hasClass("hidden")) $(container).find(".custom-info-detail").addClass("hidden")
		if (type == "feedback") {
			platform_config["message"]["msg"] = {};
		} else if (type == "auth") { // 公众号授权
			this.cancelAuth();
		} else {
			var prize_index = this.prizeIndex[type];
			gift_config.splice(prize_index, 1);
			delete(this.prizeIndex[type]);
			for (var index in this.prizeIndex) {
				if (prize_index < this.prizeIndex[index]) {
					this.prizeIndex[index] -= 1;
				}
			}
			workBench.assetsCustom.updateActivityView(false, false, true);
		}
		//  else if (type == "link") {
		// 	giftcenter_link = "";
		// 	$("#input-giftcenter-link").val("http://");
		// 	$(".giftcenter-btn").addClass("hidden");
		// } 

		if (type != "auth") {
			$(targetObj).prop("checked", false);
			$(container).find(".custom-info-preview").addClass("hidden");
			$(container).addClass("empty-info");
			$(container).find(".title .note").addClass("hidden");
			if (game_status != "wait") self.calGiftMoney(); 
			workBench.save();
			$(container).removeClass("active");
			this.resortBlock();
		}
	},

	// 更新奖项界面
	updateGiftView : function(name, src) {
		$(".gift-img").attr("src", src);
		$(".gift-name").text(name);
	},
	// 更新信息收集界面
	updateMsgView : function(desc_tag) {
		if (desc_tag) {
			$("#form-mask").find(".form-desc").text($("#text-feedback-desc").val());
		} else {
			// 清空
			$("#form-mask").find(".label-box").children().remove();
			$(".feedback-add-container").find("button").each(function() {
				var html = "<div><label>"+$(this).text()+":</label><input type='text' class='main-border' data-key='"+$(this).val()+"' style='border-color: "+platform_config["style"]["color"]["main"]+"'></div>";
				$("#form-mask").find(".label-box").append(html);
			});
			// 修改框高度
			var len = $("#form-mask").find(".label-box").children().length;
			var height = len > 3 ? 45+(len-3)*5 : 45;
			$(".form-box").css('height',height+'%');
		}
	},

	// 计算红包总价钱
	calGiftMoney: function() {
		if (gift_config.length > 0) {
			var sum = 0;
			for (var i = 0; i < gift_config.length; i++) {
				for (var j = 0; j < gift_config[i].prize.length; j++) {
					var gift_type = gift_config[i].prize[j]["gift_type"];
					if (gift_type == 2 || gift_type == 3) {
						sum += parseInt(gift_config[i].prize[j]["sum"]);
					}
				}
			}
			giftmoney_config.total_num = sum;

			workBench.giftmoneyModal.resetGiftMoney();
		}
	},

	// 预览-排行
	previewRank: function() {
		var html = "<tr><th style='width: 45%;'>奖品名</th><th style='width: 45%;'>排名区间</th><th style='width: 10%;'>数量</th></tr>";
		var self = this;
		for (var index in gift_config[self.prizeIndex["rank"]]["prize"]) {
			html += "<tr>";
			// 奖品名称
			var gift_id = gift_config[self.prizeIndex["rank"]]["prize"][index]["gift_id"];
			var gift_name = this.getGiftName(gift_id);
			if (gift_config[this.prizeIndex["rank"]]["prize"][index]["gift_type"] == 2) {
				gift_name += "("+parseInt(gift_config[this.prizeIndex["rank"]]["prize"][index]["sum"]/gift_config[this.prizeIndex["rank"]]["prize"][index]["num"])+"元）";
			} else if (gift_config[this.prizeIndex["rank"]]["prize"][index]["gift_type"] == 3) {
				gift_name += "(平均"+parseInt(gift_config[this.prizeIndex["rank"]]["prize"][index]["sum"]/gift_config[this.prizeIndex["rank"]]["prize"][index]["num"])+"元）";
			}
			// 排名
			var interval = "第"+gift_config[self.prizeIndex["rank"]]["prize"][index]["interval"][0]+"-"+gift_config[self.prizeIndex["rank"]]["prize"][index]["interval"][1]+"名";
			if (gift_config[self.prizeIndex["rank"]]["prize"][index]["interval"][0] == gift_config[self.prizeIndex["rank"]]["prize"][index]["interval"][1]) {
				interval = "第"+gift_config[self.prizeIndex["rank"]]["prize"][index]["interval"][0]+"名";
			}
			html += "<td>"+gift_name+"</td><td>"+interval+"</td><td>"+gift_config[self.prizeIndex["rank"]]["prize"][index]["num"]+"</td>";
			html += "</tr>";
		}
		$("#custom-info-preview-rank").html(html);
	},
	// 预览-分享
	previewShare: function() {
		var html = "<tr><th style='width: 90%;'>奖品名</th><th style='width: 10%;'>数量</th></tr>";
		html += "<tr>";
		// 奖品名称
		var gift_id = gift_config[this.prizeIndex["share"]]["prize"][0]["gift_id"];
		var gift_name = this.getGiftName(gift_id);
		if (gift_config[this.prizeIndex["share"]]["prize"][0]["gift_type"] == 2) {
			gift_name += "("+parseInt(gift_config[this.prizeIndex["share"]]["prize"][0]["sum"]/gift_config[this.prizeIndex["share"]]["prize"][0]["num"])+"元）";
		} else if (gift_config[this.prizeIndex["share"]]["prize"][0]["gift_type"] == 3) {
			gift_name += "(平均"+parseInt(gift_config[this.prizeIndex["share"]]["prize"][0]["sum"]/gift_config[this.prizeIndex["share"]]["prize"][0]["num"])+"元）";
		}
		html += "<td>"+gift_name+"</td><td>"+gift_config[this.prizeIndex["share"]]["prize"][0]["num"]+"</td>";
		html += "</tr>";
		$("#custom-info-preview-share").html(html);
	},
	// 预览-参与
	previewPlay: function() {
		var html = "<tr><th style='width: 90%;'>奖品名</th><th style='width: 10%;'>数量</th></tr>";
		// 周期性变化
		if (typeof this.prizeIndex["play"] != "undefined") {
			if (gift_config[this.prizeIndex["play"]]["cycle"]) {
				var cycle_text = "每天";
				if (gift_config[this.prizeIndex["play"]]["cycle"] == "week") {
					cycle_text = "每周";
				} else if (gift_config[this.prizeIndex["play"]]["cycle"] == "month") {
					cycle_text = "每月";
				}
				html = "<tr><th style='width: 40%;'>奖品名</th><th style='width: 20%;'>"+cycle_text+"数量</th><th style='width: 20%;' >发奖周期</th><th style='width: 20%;'>总数量</th></tr>";
			}
		}

		html += "<tr>";
		// 奖品名称
		var gift_id = gift_config[this.prizeIndex["play"]]["prize"][0]["gift_id"];
		var gift_name = this.getGiftName(gift_id);
		if (gift_config[this.prizeIndex["play"]]["prize"][0]["gift_type"] == 2) {
			gift_name += "("+parseInt(gift_config[this.prizeIndex["play"]]["prize"][0]["sum"]/gift_config[this.prizeIndex["play"]]["prize"][0]["num"])+"元）";
		} else if (gift_config[this.prizeIndex["play"]]["prize"][0]["gift_type"] == 3) {
			gift_name += "(平均"+parseInt(gift_config[this.prizeIndex["play"]]["prize"][0]["sum"]/gift_config[this.prizeIndex["play"]]["prize"][0]["num"])+"元）";
		}
		html += "<td>"+gift_name+"</td>";
		if (gift_config[this.prizeIndex["play"]]["cycle"]) {
			html += "<td>"+gift_config[this.prizeIndex["play"]]["cycle_num"]+"</td>";
			html += "<td>"+this.getCycle(gift_config[this.prizeIndex["play"]]["cycle"])+"</td>";
		}
		html += "<td>"+gift_config[this.prizeIndex["play"]]["prize"][0]["num"]+"</td>";
		html += "</tr>";
		$("#custom-info-preview-play").html(html);
	},
	// 预览-抽奖
	previewLottery: function() {
		var self = this;
		var condition_text = "";
		if (gift_config[self.prizeIndex["lottery"]]["condition"] == "play") {
			condition_text = "直接抽奖";
		} else if (gift_config[self.prizeIndex["lottery"]]["condition"] == "score") {
			condition_text = "达到"+gift_config[self.prizeIndex["lottery"]]["score"]+"分参与抽奖";
		} else if (gift_config[self.prizeIndex["lottery"]]["condition"] == "share") {
			condition_text = "分享后抽奖";
		}
		var total_percent = gift_config[self.prizeIndex["lottery"]]["percent"];
		var html = "<tr><th style='width:45%;'>"+condition_text+"</th><th style='width:45%;'>总中奖率: "+total_percent+"%</th><th style='width:10%;'></th></tr>";
		if (gift_config[self.prizeIndex["lottery"]]["cycle"]) { // 周期性抽奖
			var cycle = gift_config[self.prizeIndex["lottery"]]["cycle"];
			var cycle_num = gift_config[self.prizeIndex["lottery"]]["cycle_num"];
			var cycle_repeat = gift_config[self.prizeIndex["lottery"]]["repeat"];
			var cycle_text = "每天";
			if (cycle == "week") {
				cycle_text = "每周";
			} else if (cycle == "month") {
				cycle_text = "每月";
			}
			html = "<tr><th style='width:30%;'>"+condition_text+"</th><th style='width:40%;'>周期性抽奖: "+cycle_text+"，共"+this.getCycle(cycle)+"期。</th><th style='width:30%;'></th></tr>";
			html += "<th style='width:30%;'>总中奖率: "+total_percent+"%</th><th style='width:40%;'>"+cycle_text+"抽奖次数: "+cycle_num+"次</th><th style='width:30%;'>每人最多中奖："+cycle_repeat+"次</th></tr>";
		}
		html += "<tr><th>奖品名</th><th>中奖率</th><th>数量</th></tr>";
		var total_lottery_num = 0;
		for (var index in gift_config[self.prizeIndex["lottery"]]["prize"]) {
			total_lottery_num += parseInt(gift_config[self.prizeIndex["lottery"]]["prize"][index]["num"]);
		}
		for (var index in gift_config[self.prizeIndex["lottery"]]["prize"]) {
			html += "<tr>";
			// 奖品名称
			var gift_id = gift_config[self.prizeIndex["lottery"]]["prize"][index]["gift_id"];
			var gift_name = this.getGiftName(gift_id);
			if (gift_config[this.prizeIndex["lottery"]]["prize"][index]["gift_type"] == 2) {
				gift_name += "("+parseInt(gift_config[this.prizeIndex["lottery"]]["prize"][index]["sum"]/gift_config[this.prizeIndex["lottery"]]["prize"][index]["num"])+"元）";
			} else if (gift_config[this.prizeIndex["lottery"]]["prize"][index]["gift_type"] == 3) {
				gift_name += "(平均"+parseInt(gift_config[this.prizeIndex["lottery"]]["prize"][index]["sum"]/gift_config[this.prizeIndex["lottery"]]["prize"][index]["num"])+"元）";
			}
			var num = parseInt(gift_config[self.prizeIndex["lottery"]]["prize"][index]["num"]);
			var gift_percent = num/total_lottery_num*gift_config[self.prizeIndex["lottery"]]["percent"]*10000;
			gift_percent = ((Math.round(gift_percent))/10000).toFixed(3);
			html += "<td>"+gift_name+"</td><td>"+gift_percent+"%</td><td>"+num+"</td>";
			html += "</tr>";
		}
		$("#custom-info-preview-lottery").html(html);
	},
	// 预览-反馈信息
	previewFeedback: function() {
		var html = "<div class='preview-label'>"+((platform_config['message']['msg']['type'] == 1) ? '游戏开始前填写' : '游戏结束后填写')+"</div>";
		html += "<div>";
		for (var i = 0; i < platform_config["message"]["msg"]["list"].length; i++) {
			html += "<span>"+parseInt(i+1)+"、"+platform_config["message"]["msg"]["list"][i]+"</span>";
		}
		html += "</div>";
		$("#custom-info-preview-feedback").html(html);
	},
	// 预览-公众号授权
	previewAuth: function() {
		$("#custom-info-preview-auth").text("已授权的公众号："+this.w_nickname);
	},

	// 根据奖品ID获取奖品名称
	getGiftName: function(gift_id) {
		var gift_name = "";
		for (var i in user_gift_list) {
			if (user_gift_list[i]["id"] == gift_id) {
				gift_name = user_gift_list[i]["name"];
				return gift_name;
			}
		}
	},

	// 置顶操作
	resortBlock: function() {
		var current_top = $("#giftmoney-pay-container");
		// 奖品
		var queue = [[4, "play"], [3, "share"], [5, "lottery"], [1, "rank"]];
		for (var i = 0; i < queue.length; i++) {
			var type_index = queue[i][0];
			var type = queue[i][1];
			var find_tag = false;
			for (var index in gift_config) {
				if (gift_config[index].type == type_index) {
					$(current_top).after($("#custom-"+type));
					current_top = $("#custom-"+type);
					find_tag = true;
				}
			}
			if (!find_tag) {
				$("#gameinfo-container .custom-detail").children().last().after($("#custom-"+type));
			}
		}
		// 反馈信息
		if (platform_config.message.msg.type) {
			$(current_top).after($("#custom-feedback"));
			current_top = $("#custom-feedback");
		} else {
			$("#gameinfo-container .custom-detail").children().last().after($("#custom-feedback"));
		}
		// 公众号
		if (this.w_enable) {
			$(current_top).after($("#custom-auth"));
		} else {
			$("#gameinfo-container .custom-detail").children().last().after($("#custom-auth"));
		}
	},

	// 展开/折叠发奖周期
	toggleCycle: function(obj) {
		if ($(obj).find(".dropdown").hasClass("hidden")) {
			$(obj).find(".dropdown").removeClass("hidden");
			$(obj).find(".glyphicon").removeClass("glyphicon-triangle-bottom").addClass("glyphicon-triangle-top");
		} else {
			$(obj).find(".dropdown").addClass("hidden");
			$(obj).find(".glyphicon").removeClass("glyphicon-triangle-top").addClass("glyphicon-triangle-bottom");
		}
	},
	// 计算周期
	getCycle: function(cycle) {
		if (start_time < end_time) {
			var date_s = new Date(start_time);
			var date_e = new Date(end_time);
			var delta = date_e.getTime() - date_s.getTime();
			if (cycle == "day") {
				var day_time = 86400000;
				if (date_e.getHours() >= date_s.getHours()) {
					return Math.ceil(delta/day_time);
				} else {
					return Math.ceil(delta/day_time)+1;
				}
			} else if (cycle == "week") {
				var week_time = 604800000;
				if (Math.floor(delta/week_time) == 0) { // 不超过一周
					var day_s = (date_s.getDay() == 0) ? 7 : date_s.getDay();
					var day_e = (date_e.getDay() == 0) ? 7 : date_e.getDay();
					if (day_e > day_s) { // 没有跨过
						return 1;
					} else { // 跨过周日
						if (date_s.getDate() == date_e.getDate()) {
							return 1;
						} else {
							return 2;
						}
					}
				} else {
					var increase = 0;
					var day_s = (date_s.getDay() == 0) ? 7 : date_s.getDay();
					var day_e = (date_e.getDay() == 0) ? 7 : date_e.getDay();
					if (day_e > day_s) { // 没有跨过
						increase = 0;
					} else { // 跨过周日
						increase = 1;
					}
					return (Math.ceil(delta/week_time)+increase);
				}
			} else if (cycle == "month") {
				return (date_e.getFullYear() - date_s.getFullYear())*12 + (date_e.getMonth() - date_s.getMonth()) + 1;
			}
		} else {
			return 1;
		}
	},
	// 设置周期提示
	setCycle: function(type) {
		var tag_play = type ? ((type == "play") ? true : false) : true;
		var tag_lottery = type ? ((type == "lottery") ? true : false) : true;

		// 参与获奖
		if (tag_play) {
			var tableObj = $(".custom-prize-block-table[name='play']");
			var cycle = $(tableObj).find(".prize-cycle-dropdown-value").attr("name");
			var text_cycle = $(tableObj).find(".prize-cycle-dropdown-value").text();
			// 显示周期
			$(tableObj).find(".prize-cycle-total span").text(this.getCycle(cycle));
			// 修改表头
			$(tableObj).find(".num-th").text(text_cycle+"数量");
			// 如果已配置好的话，修改预览
			if (typeof this.prizeIndex["play"] != "undefined") {
				if (gift_config[this.prizeIndex["play"]]["cycle"]) {
					this.previewPlay();
				}
			}
		}

		// 抽奖获奖
		if (tag_lottery) {
			var cycle = $(".lottery-cycle-container .prize-cycle-dropdown-value").attr("name");
			var text_cycle = $(".lottery-cycle-container .prize-cycle-dropdown-value").text();
			// 显示周期
			$(".lottery-cycle-container .prize-cycle-total span").text(this.getCycle(cycle));
			// 修改表头
			$(".lottery-cycle-num-container .text-title").text("每人"+text_cycle+"抽奖");
			// 如果已配置好的话，修改预览
			if (typeof this.prizeIndex["lottery"] != "undefined") {
				if (gift_config[this.prizeIndex["lottery"]]["cycle"]) {
					this.previewLottery();
				}
			}
		}
	},
	// 设置周期总数提示（参与获奖）
	setCycleTotal: function() {
		var cycle_num = parseInt($(".custom-prize-block-table[name='play'] input[name='num']").val());
		var cycle = $(".custom-prize-block-table[name='play']").find(".prize-cycle-total span").text();
		if (cycle_num > 0) {
			$(".custom-prize-block-table[name='play'] input[name='input-cycle-total']").next().find("span").text(parseInt(cycle_num*cycle));
		} else {
			$(".custom-prize-block-table[name='play'] input[name='input-cycle-total']").next().find("span").text("0");
		}
	},

	// 初始化条形码
	initBarcode: function() {
		var code = "123456789012".toString();
		$("#barcode").barcode(code, "ean13", { barWidth: 2, barHeight: 35, showHRI: false });
		$(".barcode-text").text("兑换码 " + code);
	},

	// 获取授权状态
	getAuthStatus: function() {
		var self = this;
		$.ajax({
			type: "POST",
			dataType: "json",
			url: "/wxop/ajax/GetGameAuth",
			data: {game_id: game_id},
			success: function(result) {
				if (result.code == 0) {
					if (result.data != "") {
						self.setAuthStatus("yes", result.data);
					} else {
						self.getAuthUrl();
						self.setAuthStatus("no");
					}
					self.resortBlock();
				} else if (result.code == 99) {
					showRemind("您的账号已经注销登录，请重新登录！");
					setTimeout(function() {
						location.href = "/web/login#"+location.href;
					}, 1500);
				} else {
					if (result.nick_name) {
						$("#auth-error-img").attr("src", result.head_img);
						$(".auth-error-nickname").text(result.nick_name);
					}
					self.getAuthUrl();
					self.setAuthStatus("cancel", {nick_name: result.nick_name});
					workBench.authErrorModal.show();
				}
			},
			error: function(error) {
				showRemind("网络连接错误");
				console.log(error);
			}
		});
	},
	// 获取授权地址
	getAuthUrl: function() {
		$.ajax({
			type: "POST",
			dataType: "json",
			url: "/wxop/ajax/GetAuthUrl",
			data: {game_id: game_id},
			success: function(result) {
				if (result.code == 0) {
					$(".auth-btn").attr("href", result.url);
					$("#auth-error-btn").attr("href", result.url).removeClass("disabled");
					$("#btn-auth-again").parent().attr("href", result.url);
				} else if (result.code == 99) {
					showRemind("您的账号已经注销登录，请重新登录！");
					setTimeout(function() {
						location.href = "/web/login#"+location.href;
					}, 1500);
				} else {
					showRemind("系统错误");
				}
			},
			error: function(error) {
				showRemind("网络连接错误");
				console.log(error);
			}
		});
	},
	// 设置授权状态
	setAuthStatus: function(status, data) {
		if (status == "yes") { // 已授权
			// 判断是否有效的授权
			var tag = false;
			if (data.wx_info.service_type_info == 2 && data.wx_info.verify_type_info != -1) { // 已认证服务号
				if (data.wx_info.func_info) {
					if (data.wx_info.func_info.indexOf(4) > -1) tag = true; 
				}
			}
			if (tag) { // 授权有效
				$(".auth-status").html("已授权公众号："+data.wx_info.nick_name+"&nbsp;&nbsp;&nbsp;<a href='/help/qaDetail/id/119' target='_blank'>取消授权</a>");
				$(".auth-btn").addClass("hidden");
				$(".auth-remind").addClass("hidden");
				this.w_id = data.wx_info.id;
				this.w_nickname = data.wx_info.nick_name;
				if (data.enable == "yes") {
					this.w_enable = true;
					$("#custom-auth .ios-switch").prop("checked", true);
					$("#custom-info-preview-auth").text("已授权的公众号："+data.wx_info.nick_name);
					if ($("#ul-container li[name='gameinfo']").hasClass("hidden")) $("#ul-container li[name='gameinfo']").removeClass("hidden");
					this.previewAuth();
					$("#custom-auth").find(".custom-info-preview").removeClass("hidden");
				} else {
					this.w_enable = false;
					$("#custom-auth .ios-switch").prop("checked", false);
				}
			} else { // 授权无效
				$(".auth-status").html("授权状态：<span>尚未授权</span>，当前仅支持经过认证的微信服务号。");
				$(".auth-btn").removeClass("hidden");
				$(".auth-remind").removeClass("hidden");
				this.w_id = null;
			}
		} else if (status == "no") { // 未授权
			$(".auth-status").html("授权状态：<span>尚未授权</span>，当前仅支持经过认证的微信服务号。");
			$(".auth-btn").removeClass("hidden");
			$(".auth-remind").removeClass("hidden");
			this.w_id = null;
		} else if (status == "cancel") {
			if ($("#ul-container li[name='gameinfo']").hasClass("hidden")) $("#ul-container li[name='gameinfo']").removeClass("hidden");
			$(".auth-status").html("授权状态：<span>你已取消"+data.nick_name+"公众号授权，请重新授权。</span>");
			$(".auth-btn").removeClass("hidden");
			$(".auth-remind").removeClass("hidden");
			this.w_id = null;
			$("#custom-auth .ios-switch").removeClass("disabled").prop("disabled", false);
		}
	},
	// 启用公众号授权
	setAuth: function() {
		var self = this;
		showLoading("启用授权中");
		$.ajax({
			type: "POST",
			dataType: "json",
			url: "/wxop/ajax/setGameAuth",
			data: {game_id: game_id, w_id: this.w_id},
			success: function(result) {
				if (result.code == 0) {
					showRemind("启用授权成功");
					self.w_enable = true;
					// 去除面板的开关
					$("#custom-auth").removeClass("empty-info");
					// 选中
					$("#custom-auth").find(".prize-switch").prop("checked", true);
					// 收起
					$("#custom-auth").find(".custom-info-detail").addClass("hidden");
					$("#custom-auth").find(".title .note").addClass("hidden");
					$("#custom-auth").find(".custom-info-preview").removeClass("hidden");
					$("#custom-auth").removeClass("active");
					workBench.save();
					self.previewAuth();
					self.resortBlock();
				} else if (result.code == 99) {
					showRemind("您的账号已经注销登录，请重新登录！");
					setTimeout(function() {
						location.href = "/web/login#"+location.href;
					}, 1500);
				} else {
					showRemind("系统错误");
				}
			},
			error: function(error) {
				showRemind("网络连接错误");
				console.log(error);
			}
		});
	},
	// 取消启用公众号授权
	cancelAuth: function() {
		var self = this;
		showLoading("停止启用授权中");
		$.ajax({
			type: "POST",
			dataType: "json",
			url: "/wxop/ajax/delGameAuth",
			data: {game_id: game_id, w_id: this.w_id},
			success: function(result) {
				if (result.code == 0) {
					showRemind("停止启用授权成功");
					self.w_enable = false;
					$("#custom-auth .ios-switch").prop("checked", false);
					$("#custom-auth").find(".custom-info-preview").addClass("hidden");
					$("#custom-auth").addClass("empty-info");
					$("#custom-auth").find(".title .note").addClass("hidden");
					workBench.save();
					$("#custom-auth").removeClass("active");
					self.resortBlock();
				} else if (result.code == 99) {
					showRemind("您的账号已经注销登录，请重新登录！");
					setTimeout(function() {
						location.href = "/web/login#"+location.href;
					}, 1500);
				} else {
					showRemind("系统错误");
				}
			},
			error: function(error) {
				showRemind("网络连接错误");
				console.log(error);
			}
		});
	}
};

/* 编辑奖品模态框 */
var PrizeAddModal = function() {
	this.prizeListModal = new PrizeListModal();
	this.bindEvents();
};
PrizeAddModal.prototype = {
	// 目标按钮
	targetObj: null,
	// 奖品列表模态框
	prizeListModal: null,

	// 绑定事件
	bindEvents: function() {
		var self = this;

		$("#modal-prize-add").on("click", function() {
			$(".prize-add-dropdown .dropdown").addClass("hidden");
			$(".prize-add-dropdown .glyphicon").removeClass("glyphicon-triangle-top").addClass("glyphicon-triangle-bottom");
		});

		// 关闭按钮
		$("#modal-prize-add .btn-close").on("click", function() {
			self.hide();
		});
		// 保存按钮
		$("#btn-prize-add-confirm").on("click", function() {
			var type = $("input[name='prize-add-type']:checked").val();
			if (type == "normal") {
				if (self.checkNormal()) self.confirmAdd();
			} else if (type == "giftmoney") {
				if (self.checkGiftMoney()) self.confirmUse();
			}
		});
		// 取消按钮
		$("#btn-prize-add-cancel").on("click", function() {
			self.hide();
		});

		// 创建奖品类型（普通/红包）
		$("#modal-prize-add input[name='prize-add-type']").on("click", function() {
			if ($(this).val() == "normal") {
				$(".prize-add-normal-container").removeClass("hidden");
				$(".prize-add-giftmoney-container").addClass("hidden");
			} else {
				$(".prize-add-normal-container").addClass("hidden");
				$(".prize-add-giftmoney-container").removeClass("hidden");
			}
		});

		// 红包类型切换
		$("#modal-prize-add input[name='prize-add-giftmoney-type']").on("click", function() {
			if ($(this).val() == 2) { // 普通红包
				$(".prize-add-giftmoney-remind").text("固定金额红包，每个红包金额为固定值。");
			} else { // 拼手气红包
				$(".prize-add-giftmoney-remind").text("所有红包平均金额为设置的金额，但是会上下随机浮动。");
			}
		});

		// 兑奖方式
		$(".prize-add-dropdown").on("click", function(e) {
			if (!$(this).hasClass("disabled")) {
				self.toggleDropDown(this);
			}
			e.stopPropagation();
		});
		$(".prize-add-dropdown .dropdown span").on("click", function(e) {
			var type = $(this).attr("name");
			var text_type = $(this).text();
			var container = $(this).parent().parent();
			// 设置值
			$(container).find(".prize-add-dropdown-value").text(text_type).attr("name", type);
			// 显示对应的行
			$(".prize-add-normal-container tr.none").addClass("hidden");
			$(".prize-add-normal-container tr.link").addClass("hidden");
			$(".prize-add-normal-container tr.qrcode").addClass("hidden");
			$(".prize-add-normal-container tr.offline").addClass("hidden");
			$(".prize-add-normal-container tr."+type).removeClass("hidden");
			// 更改兑奖说明
			var default_desc;
			if (type == "offline") {
				default_desc = "请携带奖品兑换码前往以上地址领取奖品。";
			} else if (type == "link") {
				default_desc = "点击以下链接前往兑奖网页，领取奖品。";
			} else if (type == "qrcode") {
				default_desc = "关注公众号，联系客服领取奖品";
			} else {
				default_desc = "活动结束后，我们将会主动与你联系发放活动奖品。";
			}
			$("#input-prize-add-desc").val(default_desc);
			// 折叠
			self.toggleDropDown(container);
			e.stopPropagation();
		});

		// 从模板选择 按钮
		$("#btn-prize-add-choose").on("click", function() {
			self.prizeListModal.show($(this).attr("name"));
		});

		// 兑奖地址
		$("#input-prize-add-link").on("change", function() {
			var content = $(this).val();
			if (content.indexOf("http") < 0) {
				content = "http://" + content;
				$(this).val(content);
			}
		});
	},
	// 显示
	show: function(id, targetObj) {
		var self = this;
		this.targetObj = targetObj;

		if (id != "") {
			var gift_id = id.split("-")[0];
			var gift_type = id.split("-")[1];
			if (gift_type == 1) {
				var data = {};
				for (var index in user_gift_list) {
					if (gift_id == user_gift_list[index].id) {
						data.check_info = user_gift_list[index]["check_info"];
						if (data.check_info.length > 0) {
							data.check_info = JSON.parse(data.check_info);
						} else {
							data.check_info = {};
						}
						data.type = user_gift_list[index]["check_way"];
						if (data.type == 0) {
							data.type = "none";
						} else if (data.type == 1) {
							data.type = "offline";
						} else if (data.type == 2) {
							data.type = "link";
						} else if (data.type == 3) {
							data.type = "qrcode";
						}
						data.name = user_gift_list[index]["name"];
						data.img = user_gift_list[index]["gift_img"];
						data.gift_type = user_gift_list[index]["gift_type"];
						break;
					}
				}
				this.setData(data);
				$("input[name='prize-add-type']").first().click();
			} else if (gift_type == 2 || gift_type == 3) {
				var tableObj =  $(this.targetObj).parent().parent().parent().parent();
				var num = $(tableObj).find("input[name='input-giftmoney-common']").val();
				$("input[name='prize-add-giftmoney-type'][value='"+gift_type+"']").click();
				$("#input-prize-add-giftmoney-num").val(num);
				$("input[name='prize-add-type']").last().click();
			}
		}

		$("#modal-prize-add").fadeIn(300);
	},
	// 隐藏
	hide: function() {
		var self = this;
		$("#modal-prize-add").fadeOut(300, function() {
			self.reset();
		});
	},
	// 重置
	reset: function() {
		// 还原普通奖品
		$(".prize-add-normal-container input").val("");
		$(".prize-add-normal-container textarea").val("");
		// 更改兑奖说明
		$("#input-prize-add-desc").val("活动结束后，我们将会主动与你联系发放活动奖品。");
		// 显示对应的行
		$(".prize-add-normal-container tr.none").removeClass("hidden");
		$(".prize-add-normal-container tr.link").addClass("hidden");
		$(".prize-add-normal-container tr.qrcode").addClass("hidden");
		$(".prize-add-normal-container tr.offline").addClass("hidden");
		$("#prize-add-dropdown .prize-add-dropdown-value").text("无需兑奖").attr("name", "none");
		$("input[name='prize-add-save']").prop("checked", false);
		$("#input-prize-add-qrcode .custom-pic-div").css("background-image", "url('//24haowan-cdn.shanyougame.com/game_tpl/activity-qrcode.jpg')").removeClass("active");
		$("#input-prize-add-img .custom-pic-div").css("background-image", "url('//24haowan-cdn.shanyougame.com/new_platform/image/prize.svg')").removeClass("active");
		// 还原红包
		$("input[name='prize-add-giftmoney-type']").first().prop("checked", true);
		$("#input-prize-add-giftmoney-num").val("");
		$(".prize-add-giftmoney-remind").text("固定金额红包，每个红包金额为固定值。");
		// 切换到普通奖品
		$("input[name='prize-add-type']").first().prop("checked", true);
		$(".prize-add-normal-container").removeClass("hidden");
		$(".prize-add-giftmoney-container").addClass("hidden");
	},
	// 展开/折叠兑奖方式
	toggleDropDown: function(obj) {
		if ($(obj).find(".dropdown").hasClass("hidden")) {
			$(obj).find(".dropdown").removeClass("hidden");
			$(obj).find(".glyphicon").removeClass("glyphicon-triangle-bottom").addClass("glyphicon-triangle-top");
		} else {
			$(obj).find(".dropdown").addClass("hidden");
			$(obj).find(".glyphicon").removeClass("glyphicon-triangle-top").addClass("glyphicon-triangle-bottom");
		}
	},
	// 设置普通奖品数据
	setData: function(data) {
		$("#input-prize-add-name").val(data.name);
		$("#input-prize-add-img .custom-pic-div").css("background-image", "url("+data.img+")");
		// 兑奖方式
		var type = data.type;
		var type_text;
		var default_desc;
		if (type == "offline") {
			type_text = "线下兑奖";
			$("#input-prize-add-address").val(data.check_info["address"]);
			$("#input-prize-add-phone").val(data.check_info["phone"]);
			default_desc = "请携带奖品兑换码前往以上地址领取奖品。";
		} else if (type == "link") {
			type_text = "网址兑奖";
			$("#input-prize-add-link").val(data.check_info["link"]);
			default_desc = "点击以下链接前往兑奖网页，领取奖品。";
		} else if (type == "qrcode") {
			type_text = "公众号兑奖";
			$("#input-prize-add-qrcode .custom-pic-div").css("background-image", "url("+data.check_info["qrcode"]+")");
			default_desc = "关注公众号，联系客服领取奖品。";
		} else {
			type_text = "无需兑奖";
			default_desc = "活动结束后，我们将会主动与你联系发放活动奖品。";
		}
		// 兑奖说明
		var desc;
		if (data.check_info) desc = data.check_info["desc"];
		if (!desc) desc = default_desc;
		$("#input-prize-add-desc").val(desc);

		$("#prize-add-dropdown .prize-add-dropdown-value").text(type_text).attr("name", type);
		// 显示对应的行
		$(".prize-add-normal-container tr.none").addClass("hidden");
		$(".prize-add-normal-container tr.link").addClass("hidden");
		$(".prize-add-normal-container tr.qrcode").addClass("hidden");
		$(".prize-add-normal-container tr.offline").addClass("hidden");
		$(".prize-add-normal-container tr."+type).removeClass("hidden");
	},
	// 检查 - 普通奖品
	checkNormal: function() {
		var self = this;
		var name = $("#input-prize-add-name").val();
		if (name.length <= 0) {
			showRemind("奖品名称不能为空");
			$("#input-prize-add-name").focus();
			return false;
		} else {
	        // 兑奖方式与兑奖数据
	        var check_way = $("#prize-add-dropdown .prize-add-dropdown-value").attr("name");
	        if (check_way == "none") {
	        	check_way = 0;
	        	var desc = $("#input-prize-add-desc").val();
	        	if (desc.length <= 0) {
	        		showRemind("兑奖说明不能为空");
					$("#input-prize-add-desc").focus();
					return false;
	        	}
	        } else if (check_way == "offline") {
	        	check_way = 1;
	        	var address = $("#input-prize-add-address").val();
	        	var phone = $("#input-prize-add-phone").val();
	        	if (address.length <= 0) {
	        		showRemind("兑奖地址不能为空");
					$("#input-prize-add-address").focus();
					return false;
	        	} else if (phone.length <= 0) {
	        		showRemind("联系电话不能为空");
					$("#input-prize-add-phone").focus();
					return false;
	        	}
	        } else if (check_way == "link") {
	        	check_way = 2;
	        	var link = $("#input-prize-add-link").val();
	        	if (link.length <= 0) {
	        		showRemind("兑奖链接不能为空");
					$("#input-prize-add-link").focus();
					return false;
	        	}
	        }
		}
		return true;
	},
	// 保存 - 普通奖品
	confirmAdd: function() {
		var self = this;
		var name = $("#input-prize-add-name").val();
		var desc = " ";
		var num = 1000000;
		var img = $("#input-prize-add-img .custom-pic-div").css("background-image");
		img = workBench.assetsPanel.getImageUrl(img);
        var check = 'yes';
        var show = $("input[name='prize-add-save']").prop("checked") ? "yes" : "no"; // 是否保存到奖品库
        // 兑奖方式与兑奖数据
        var check_way = $("#prize-add-dropdown .prize-add-dropdown-value").attr("name");
        var check_info = "";
        var check_info_data = {"desc": $("#input-prize-add-desc").val()};
        if (check_way == "none") {
        	check_way = 0;
        } else if (check_way == "offline") {
        	check_way = 1;
        	check_info_data.address = $("#input-prize-add-address").val();
        	check_info_data.phone = $("#input-prize-add-phone").val()
        } else if (check_way == "link") {
        	check_way = 2;
        	var link = $("#input-prize-add-link").val();
        	if (link.indexOf("http") < -1) {
        		link = "http://" + link;
        	}
        	check_info_data.link = link;
        } else if (check_way == "qrcode") {
        	check_way = 3;
        	check_info_data.qrcode = workBench.assetsPanel.getImageUrl($("#input-prize-add-qrcode .custom-pic-div").css("background-image"));
        }
        check_info = JSON.stringify(check_info_data);

		var pattern = /^\d+$/;
		if (name == "") {
			showRemind("请输入奖品名称");
		} else if (desc == "") {
			showRemind("请输入奖品描述");
		} else if (num == "") {
			showRemind("请输入奖品数量");
		} else if (!pattern.exec(num)) {
			showRemind("奖品数量输入格式不正确");
		} else {
			$.ajax({
				type: "POST",
				dataType: "json",
				url: "/WebAjax/AddGift",
				data: {name: name, description: desc, img: img, num: num, check: check, show: show, check_way: check_way, check_info: check_info, work: "yes"},
				success: function(result) {
					if (result.code == 0) {
						// 添加数据
						user_gift_list.push({"id":result.gift_id, "name":name, "description":desc, "num":num, "gift_img":img, "left_num":num, "enable":"yes", "gift_type": 1, "check":check, "show":show, "check_way": check_way, "check_info": check_info, "work": "yes"});
						// 刷新一下
						self.prizeListModal.load();
						// 应用
						var data = {gift_id: result.gift_id, gift_name: name, gift_type: 1, gift_img: img};
						self.apply(data);
					} else if (result.code == -1) {
						showRemind("系统错误");
					} else if (result.code == -2) {
						showRemind("系统错误");
					} else if (result.code == -5) {
						showRemind("奖品名称重复，请重新输入");
					} else if (result.code == 99) {
						showRemind("您的账号已经注销登录，请重新登录！");
						setTimeout(function() {
							location.href = "/web/login#"+location.href;
						}, 1500);
					} else {
						showRemind("系统错误");
					}
				},
				error: function(error) {
					showRemind("网络错误");
					console.log(error);
				}
			});
		}
	},
	// 检查 - 红包
	checkGiftMoney: function() {
		var pattern = /^\d+$/;
		var num = $("#input-prize-add-giftmoney-num").val();
		if (!pattern.exec(num)) {
			showRemind("红包金额格式不正确");
			$("#input-prize-add-giftmoney-num").focus();
			return false;
		} else if (num > 200 || num <= 0) {
			showRemind("单个红包的平均金额为1-200元");
			$("#input-prize-add-giftmoney-num").focus();
			return false;
		} else {
			return true;
		}
	},
	// 保存 - 红包
	confirmUse: function() {
		var type = $("input[name='prize-add-giftmoney-type']:checked").val();
		var num = $("#input-prize-add-giftmoney-num").val();
		var gift_id, gift_name, gift_img;
		for (var index in user_gift_list) {
			if (user_gift_list[index].gift_type == type) {
				gift_id = user_gift_list[index]["id"];
				gift_name = user_gift_list[index]["name"];
				gift_img = user_gift_list[index]["gift_img"];
				break;
			}
		}
		var data = {gift_id: gift_id, num: num, gift_type: type, gift_name: gift_name, gift_img: gift_img};
		this.apply(data);
	},
	// 应用
	apply: function(data) {
		var gift_type = data.gift_type;
		var gift_id = data.gift_id;
		var name = data.gift_name;
		var img = data.gift_img;

		// 设置按钮
		$(this.targetObj).attr("name", gift_id+"-"+gift_type);

		if (gift_type == 2 || gift_type == 3) {
			$(this.targetObj).text(data.num+"元"+name);
		} else {
			$(this.targetObj).text(name);
		}
		// 红包特别处理
		var tableObj =  $(this.targetObj).parent().parent().parent().parent();
		var prize_type = $(tableObj).attr("class");
		if (prize_type.indexOf("share") > -1) {
			prize_type = "share";
		} else if (prize_type.indexOf("play") > -1) {
			prize_type = "play";
		} else if (prize_type.indexOf("lottery") > -1) {
			prize_type = "lottery";
		} else if (prize_type.indexOf("rank") > -1) {
			prize_type = "rank";
		}
		$(tableObj).find("."+prize_type+"-giftmoney-common").addClass("hidden");
		$(tableObj).find("."+prize_type+"-giftmoney-random").addClass("hidden");
		if (gift_type == 1) {
			if (prize_type == "rank" || prize_type == "lottery") {
				$(tableObj).find(".prize-num-th").css("width", "50%");
			} else {
				$(tableObj).find(".prize-num-th").css("width", "50%").prev().prev().css("width", "50%");
			}
			$(tableObj).find(".prize-num-th").find("span").text("数量").next().addClass("hidden");
		} else {
			// var type = (gift_type == 3) ? "random" : "common";

			// 为了统一普通红包和拼手气红包
			// var _type = type;
			// type = "common";

			$(tableObj).find("input[name='input-giftmoney-common']").val(data.num);

			// $(tableObj).find("."+prize_type+"-giftmoney-"+type).removeClass("hidden");
			// $(tableObj).find("th."+prize_type+"-giftmoney-"+type).find("span").first().text((_type == "random") ? "平均金额" : "单个金额");
			// $(tableObj).find(".input-giftmoney-"+type).val("");
			// if (prize_type == "rank" || prize_type == "lottery") {
			// 	$(tableObj).find(".prize-num-th").css("width", "25%");
			// } else {
			// 	$(tableObj).find(".prize-num-th").css("width", "33%").prev().prev().css("width", "33%");
			// }
			// $(tableObj).find(".prize-num-th").find("span").text("个数").next().removeClass("hidden");
		}
		// 更新图片
		workBench.gameInfoCustom.updateGiftView(name, img);

		this.hide();
	}
};

/* 奖品列表模态框 */
var PrizeListModal = function() {
	this.bindEvents();
	this.load();
};
PrizeListModal.prototype = {
	currentPage: 1,
	totalPage: 1,
	targetObj: null,

	bindEvents: function() {
		var self = this;
		$("#modal-prize-list").find(".btn-back").on("click", function() {
			self.hide();
		});
		$("#modal-prize-list").find(".page-prev").on("click", function() {
			self.prev();
		});
		$("#modal-prize-list").find(".page-next").on("click", function() {
			self.next();
		});
	},
	// 发送请求-获取奖品信息
	load : function() {
		var self = this;
		$.ajax({
			type: "POST",
			dataType: "json",
			url: "/WebAjax/GetGiftInfo",
			data: {pages : this.currentPage, type: "self", limit: 5},
			success: function(result) {
				if (result.code == 0) {
					self.totalPage = Math.ceil(result.data.total/5);
					self.totalPage = (self.totalPage == 0) ? 1 : self.totalPage;
					self.reload(result.data["gift_list"]);
				} else if (result.code == -1) {
					showRemind("其他错误");
				} else if (result.code == -2) {
					showRemind("参数错误");
				} else if (result.code == -3) {
					showRemind("game_id错误");
				} else if (result.code == -4) {
					showRemind("你没有权限查看此数据");
				} else if (result.code == 99) {
					showRemind("您的账号已经注销登录，请重新登录！");
					setTimeout(function() {
						location.href = "/web/login#"+location.href;
					}, 1500);
				} else {
					showRemind("系统错误");
				}
			},
			error: function(error) {
				showRemind("网络连接错误");
			}
		});
	},
	// 重绘
	reload: function(data) {
		var self = this;
		$("#modal-prize-list").find(".page-text").text(this.currentPage+" / "+this.totalPage);
		$("#modal-prize-list .datatable tbody").html("");
		for (var index in data) {
			var id = data[index]["id"];
			var gift_type = data[index]["gift_type"];
			var gift_img = data[index]["gift_img"];
			if (gift_type == 2) {
				gift_img = "//24haowan-cdn.shanyougame.com/public/images/web/icon-giftmoney-common.png";
			} else if (gift_type == 3) {
				gift_img = "//24haowan-cdn.shanyougame.com/public/images/web/icon-giftmoney-random.png";
			}
			var name = data[index]["name"];
			var check_way = data[index]["check_way"];
			var check_way_text = "无需兑奖";
			if (check_way == 0) {
				check_way = "none";
				check_way_text = "无需兑奖";
			} else if (check_way == 1) {
				check_way = "offline";
				check_way_text = "线下兑奖";
			} else if (check_way == 2) {
				check_way = "link";
				check_way_text = "网址兑奖";
			} else if (check_way == 3) {
				check_way = "qrcode";
				check_way_text = "公众号兑奖";
			}
			var check_info = data[index]["check_info"];
			var html = "<tr id='gift-tr-"+id+"' name='"+gift_type+"'>";
			html += "<td class='hidden'>"+id+"</td>";
			html += "<td><img src='"+data[index]["gift_img"]+"'></td>";
			html += "<td><span class='prize-list-name'>"+name+"</span></td>";
			html += "<td><span class='prize-list-get-type' name='"+check_way+"'>"+check_way_text+"</span></td>";
			html += "<td class='hidden'><span class='prize-list-check-data'>"+check_info+"</span></td>";
			html += "</tr>";
			$("#modal-prize-list .datatable tbody").append(html);
		}
		if (data.length < 5) {
			for (var i = 0; i < 5-data.length; i++) {
				var html = "<tr class='hidden tr-empty'><td class='hidden'></td><td style='border-bottom: none;'>&nbsp;</td><td style='border-bottom: none;'>&nbsp;</td><td style='border-bottom: none;'>&nbsp;</td><td style='border-bottom: none;'><span class='btn-gift-use'>使用</span></td></tr>";
				$("#modal-prize-list .datatable tbody").append(html);
			}
		}
		// 使用按钮
		$("#modal-prize-list .datatable tbody").find("tr").each(function() {
			$(this).on("click", function() {
				if (!$(this).hasClass("tr-empty")) {
					self.select($(this));
				}
			});
		});
	},
	show: function(gift_id) {
		$("#modal-prize-list").fadeIn(0);
		$(".modal-prize-add-div").fadeOut(0);
	},
	hide: function() {
		$("#modal-prize-list").fadeOut(0);
		$(".modal-prize-add-div").fadeIn(0);
		this.reset();
	},
	reset: function() {
		
	},
	prev: function() {
		if (this.currentPage > 1) {
			this.currentPage--;
			this.load();
		}  
	},
	next: function() {
		if (this.currentPage < this.totalPage) {
			this.currentPage++;
			this.load();
		}
	},
	select: function(obj) {
		// 设置按钮
		var gift_id = $(obj).attr("id").split("gift-tr-")[1];
		var gift_type = $(obj).attr("name");
		var name = $(obj).find(".prize-list-name").text();
		var check_way = $(obj).find(".prize-list-get-type").attr("name");
		var check_info = $(obj).find(".prize-list-check-data").text();
		if (check_info.length > 0) {
			check_info = JSON.parse(check_info);
		} else {
			check_info = {};
		}

		// 设置已选的ID
		$("#btn-prize-add-choose").attr("name", gift_id+"-"+gift_type);
		
		// 更新图片
		var img = $(obj).find("img").attr("src");
		if (gift_type == 2) {
			img = "//24haowan-cdn.shanyougame.com/public/images/web/icon-giftmoney-common.png";
		} else if (gift_type == 3) {
			img = "//24haowan-cdn.shanyougame.com/public/images/web/icon-giftmoney-random.png";
		}

		// 设置数据
		var data = {
			name: name,
			img: img,
			gift_type: gift_type,
			type: check_way,
			check_info: check_info
		}
		workBench.gameInfoCustom.prizeAddModal.setData(data);

		this.hide();
	}
};

/* 分享信息设置 */
var ShareCustom = function() {
	this.init();
	this.bindEvents();
};
ShareCustom.prototype = {
	// 初始化
	init: function() {
		var union = platform_config["message"]["share"]["union"];
		if (union == "yes") {
			platform_config["message"]["share"]["title"] = platform_config["message"]["share"]["title-default"];
			platform_config["message"]["share"]["desc"] = platform_config["message"]["share"]["desc-default"];
		}
	},
	// 绑定事件
	bindEvents: function() {
		var self = this;

		var pattern = /\{score\}/ig;
		if (game_type == 2) { // 抽奖类
			pattern = /\{result\}/ig;
		} else if (game_type == 4) { // 通关类
			pattern = /\{level\}/ig;
		}
		// 未完成
		// 分享标题
		$("#input-share-title-default").on("change", function() {
			var content = $(this).val();
			if (pattern.exec(content)) {
				showRemind("无游戏成绩，不能插入分数");
				content = content.replace(pattern, "");
				$(this).focus().val(content);
				$("#preview-wechat").find(".title").first().text(content);
			} else {
				platform_config["message"]["share"]["title-default"] = content;
				if (platform_config["message"]["share"]["union"] == "yes") {
					platform_config["message"]["share"]["title"] = content;
				}
				workBench.save();
			}
		});
		$("#input-share-title-default").on("input", function() {
			var content = $(this).val();
			$("#preview-wechat").find(".title").first().text(content);
		});
		$("#input-share-title-default").on("focus", function() {
			$("#preview-custom-4").addClass("hidden");
		});
		// 分享文案
		$("#input-share-desc-default").on("change", function() {
			var content = $(this).val();
			if (pattern.exec(content)) {
				showRemind("无游戏成绩，不能插入分数");
				content = content.replace(pattern, "");
				$(this).focus().val(content);
				$("#preview-wechat").find(".desc").first().text(content);
			} else {
				platform_config["message"]["share"]["desc-default"] = content;
				if (platform_config["message"]["share"]["union"] == "yes") {
					platform_config["message"]["share"]["desc"] = content;
				}
				workBench.save();
			}
		});
		$("#input-share-desc-default").on("input", function() {
			var content = $(this).val();
			$("#preview-wechat").find(".desc").first().text(content);
		});
		$("#input-share-desc-default").on("focus", function() {
			$("#preview-custom-4").addClass("hidden");
		});
		// 已完成
		// 分享标题
		$("#input-share-title").on("change", function() {
			var content = $(this).val();
			platform_config["message"]["share"]["title"] = content;
			workBench.save();
		});
		$("#input-share-title").on("input", function() {
			var content = $(this).val();
			var replace_str = Math.ceil(Math.random()*100);
			if (game_type == 2) { // 抽奖类
				replace_str = "iphone6";
			} else if (game_type == 4) { // 通关类
				replace_str = Math.ceil(Math.random()*10);
			}
			content = content.replace(pattern, replace_str);
			$("#preview-wechat").find(".title").last().text(content);
		});
		$("#input-share-title").on("focus", function() {
			$("#preview-custom-4").addClass("hidden");
		});
		// 分享文案
		$("#input-share-desc").on("change", function() {
			var content = $(this).val();
			platform_config["message"]["share"]["desc"] = content;
			workBench.save();
		});
		$("#input-share-desc").on("input", function() {
			var content = $(this).val();
			var replace_str = Math.ceil(Math.random()*100);
			if (game_type == 2) { // 抽奖类
				replace_str = "iphone6";
			} else if (game_type == 4) { // 通关类
				replace_str = Math.ceil(Math.random()*10);
			}
			content = content.replace(pattern, replace_str);
			$("#preview-wechat").find(".desc").last().text(content);
		});
		$("#input-share-desc").on("focus", function() {
			$("#preview-custom-4").addClass("hidden");
		});

		// 统一文案选择
		$(".share-union-select input[name='share-union']").on("click", function() {
			self.toggleShareUnion($(this).val());
		});

		// 分享链接
		$(".share-union-select input[name='share-link']").on("click", function() {
			self.toggleShareLink($(this).val());
		});

		// 自定义分享链接
		$("#input-share-link").on("change", function() {
			if ($(this).val() == "") {
				$(this).val("http://");
				showRemind("自定义链接不能为空");
				$(this).focus();
			} else {
				var content = $(this).val();
				if (content.indexOf("http") < 0) {
					content = "http://"+content;
					$(this).val(content);
				}
				platform_config["message"]["share"]["link"] = content;
			}
			workBench.save();
		});
		$("#input-share-link").on("focus", function() {
			$("#preview-custom-4").addClass("hidden");
		});

		// 分享小图标
		$(".custom-pic[name='info-share']").on("click", function() {
			$("#preview-custom-4").addClass("hidden");
		});

		// 分享登录页元素 点击显示 分享登录页
		$("#pic-background-share-sign-in").on("click", function() {
			$("#preview-custom-4").removeClass("hidden");
		});
		$("#pic-banner-share-sign-in").on("click", function() {
			$("#preview-custom-4").removeClass("hidden");
		});
		$("#text-game-wechat-text").on("focus", function() {
			$("#preview-custom-4").removeClass("hidden");
		});
	},
	// 切换 统一文案
	toggleShareUnion: function(union) {
		platform_config["message"]["share"]["union"] = union;
		if (union == "yes") {
			$("#custom-share-complete-title").addClass("hidden");
			$("#custom-share-complete-desc").addClass("hidden");
			platform_config["message"]["share"]["title"] = platform_config["message"]["share"]["title-default"];
			platform_config["message"]["share"]["desc"] = platform_config["message"]["share"]["desc-default"];
		} else {
			$("#custom-share-complete-title").removeClass("hidden");
			$("#custom-share-complete-desc").removeClass("hidden");
			$("#input-share-title").val(default_platform_config["message"]["share"]["title"]);
			$("#input-share-desc").val(default_platform_config["message"]["share"]["desc"]);
			platform_config["message"]["share"]["title"] = default_platform_config["message"]["share"]["title"];
			platform_config["message"]["share"]["desc"] = default_platform_config["message"]["share"]["desc"];
		}
		// 隐藏分享登录页
		$("#preview-custom-4").addClass("hidden");
		workBench.save();
	},
	// 切换 分享链接
	toggleShareLink: function(share) {
		if (share == "share") { // 使用分享登录页
			$("#input-share-link").addClass("hidden");
			$("#custom-group-share-setting").removeClass("hidden");
			platform_config["message"]["share"]["link"] = "share";
			// 显示分享登录页
			$("#preview-custom-4").removeClass("hidden");
		} else { // 使用自定义链接
			var link = $("#input-share-link").val();
			if (link.length > 0) {
				if (link.indexOf("http") < 0) {
					link = "http://"+link;
				}
				platform_config["message"]["share"]["link"] = link;
			}
			$("#input-share-link").removeClass("hidden");
			$("#custom-group-share-setting").addClass("hidden");
			// 显示分享登录页
			$("#preview-custom-4").addClass("hidden");
		}
		workBench.save();
	}
};

/* 发布预览 */
var GamePreview = function() {
	this.bindEvents();
};
GamePreview.prototype = {
	bindEvents: function() {
		var self = this;
		$("#publish-confirm").on("click", function() {
			self.confirm();
		});
		$("#gamepreview").find(".modal-close").on("click", function() {
			self.hide();
		});
		$("#gamepreview-refresh").on("click", function() {
            $("#gamepreview-frame").attr("src", location.origin+"/WebCustom/game/game_id/"+game_id);
		});
		$("#scene-add").on("click", function() {
			workBench.sceneCustom.show();
		});
	},
	show: function() {
		$("#gamepreview").fadeIn(300, function() {
            $("#gamepreview-frame").attr("src", location.origin+"/WebCustom/game/game_id/"+game_id);
		});
	},
	hide: function() {
		$("#gamepreview").fadeOut(300);
	},
	confirm: function() {
		workBench.publish();
	}
};

/* 添加场景 */
var SceneCustom = function() {
	this.bindEvents();
};
SceneCustom.prototype = {
	// 序号
	numArr : ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十"],
	bindEvents: function() {
		var self = this;
		$("#btn-scene-add").on("click", function() {
			self.addScene();
		});
		$("#btn-scene-confirm").on("click", function() {
			self.confirm();
		});
		$("#modal-scene").find(".scene-block").find("img").on("click", function() {
			$(this).parent().parent().remove();
			self.reIndex();
		});
		$("#modal-scene").find(".modal-close").on("click", function() {
			self.hide();
		});
	},
	show: function() {
		var self = this;
		if (scene != "") {
			var sceneArr = scene.split("|");
			if (sceneArr) {
				$("#modal-scene").find(".scene-block-container").removeClass("hidden");
				for (var i = 0; i < sceneArr.length; i++) {
					var html = "<div class='scene-block'><div>场景"+this.numArr[i]+"</div><div><input type='text' class='input-text input-text-l' value='"+sceneArr[i]+"'><img src='/images/dev/icon-delete.png'></div></div>";
					$("#btn-scene-confirm").before(html);
					$("#btn-scene-confirm").prev().find("img").on("click", function() {
						$(this).parent().parent().remove();
						self.reIndex();
					});
				}
			}
		}
		workBench.gamePreview.hide();
		$("#modal-scene").fadeIn(300);
	},
	hide: function() {
		var self = this;
		$("#modal-scene").fadeOut(300, function() {
			self.reset();
		});
		workBench.gamePreview.show();
	},
	reset: function() {
		$("#modal-scene").find(".scene-block").remove();
		$("#modal-scene").find(".scene-block-container").addClass("hidden");
	},
	addScene: function() {
		var self = this;
		var index = $("#modal-scene").find(".scene-block").length;
		var html = "<div class='scene-block'><div>场景"+this.numArr[index]+"</div><div><input type='text' class='input-text input-text-l' value=''><img src='/images/dev/icon-delete.png'></div></div>";
		$("#btn-scene-confirm").before(html);
		$("#btn-scene-confirm").prev().find("img").on("click", function() {
			$(this).parent().parent().remove();
			self.reIndex();
		});
		$("#modal-scene").find(".scene-block-container").removeClass("hidden");
	},
	confirm: function() {
		var self = this;
		var tag = true;
		$("#modal-scene").find("input").each(function() {
			if ($(this).val() == "") {
				$(this).focus();
				tag = false;
				showRemind("请输入场景名称");
				$(this).focus();
				return false;
			}
		});
		if (tag) {
			scene = "";
			$("#modal-scene").find("input").each(function() {
				scene += $(this).val()+"|";
			});
			if (scene != "") scene = scene.substr(0, scene.length-1);
			$.ajax({
				type: "POST",
				dataType: "json",
				url: "/WebAjax/EditGameSence",
				data: {game_id : game_id, scene: scene},
				success: function(result) {
					if (result.code == 0) {
						showRemind("提交成功");
						setTimeout(function() {
							self.hide();
						}, 1000);
					} else if (result.code == -1) {
						showRemind("啊哦_(:з」∠)_<br>提交失败了，再来一次吧~");
					} else if (result.code == -2) {
						showRemind("啊哦_(:з」∠)_<br>提交失败了，再来一次吧~");
					} else if (result.code == -3) {
						showRemind("游戏未处于发布状态，不能添加");
					} else if (result.code == 99) {
						showRemind("您的账号已经注销登录，请重新登录！");
						setTimeout(function() {
							location.href = "/web/login#"+location.href;
						}, 1500);
					} else {
						showRemind("啊哦_(:з」∠)_<br>提交失败了，再来一次吧~");
					}
				},
				error: function(error) {
					showRemind("网络连接错误");
					console.log(error);
				}
			});
		}
	},
	reIndex: function() {
		if ($("#modal-scene").find(".scene-block").length > 0) {
			var index = 0;
			var self = this;
			$("#modal-scene").find(".scene-block").each(function() {
				$(this).children().first().text("场景"+self.numArr[index++]);
			});
		} else {
			$("#modal-scene").find(".scene-block-container").addClass("hidden");
		}
	}
};

/* 红包充值 */
var GiftmoneyModal = function() {
	this.bindEvents();
};
GiftmoneyModal.prototype = {
	order_id: null,
	// 绑定事件
	bindEvents: function() {
		var self = this;
		// 充值
		$("#giftmoney-pay-btn").on("click", function() {
			self.createOrder();
		});

		// 关闭按钮
		$("#giftmoney-close").on("click", function() {
			self.hide();
		});

		// 确认充值
		$("#giftmoney-pay-confirm").on("click", function() {
			self.confirmPay();
		});

		$(".giftmoney-num-remind-img").mouseenter(function() {
			$(this).next().removeClass("hidden");
		});
		$(".giftmoney-num-remind-img").mouseleave(function() {
			$(this).next().addClass("hidden");
		});
		$(".giftmoney-price-remind-img").mouseenter(function() {
			$(this).next().removeClass("hidden");
		});
		$(".giftmoney-price-remind-img").mouseleave(function() {
			$(this).next().addClass("hidden");
		});

		// 完成支付
		$("#btn-pay-giftmoney-complete").on("click", function() {
			$.ajax({
				type: 'post',
				dataType: 'json',
				data: {id: self.order_id},
				url: '/pay/RpAjax/CheckOrder',
				success: function(data) {
					if (data.code == 0) {
						if (data.status == "SUCCESS") {
							self.hide();
							giftmoney_config.need_num = 0;
							// $("#giftmoney-pay-container").hide();
							$("#giftmoney-pay-btn").hide();
							if (game_status != "wait") $(".save-alert-container .giftmoney").addClass("hidden").siblings().removeClass("hidden");
							workBench.checkGiftMoney();
							workBench.save();
						} else {
                            self.hide();
							// showRemind("订单还没有完成，请稍后再试");
						}
					} else if (data.code == -1) {
						showRemind("其他错误");
					} else if (data.code == -2) {
						showRemind("参数错误");
					} else if (data.code == -3) {
						showRemind("查找不到该订单");
					} else if (result.code == 99) {
						showRemind("您的账号已经注销登录，请重新登录！");
						setTimeout(function() {
							location.href = "/web/login#"+location.href;
						}, 1500);
					} else {
						showRemind("未知错误"+data);
					}
				},
				error: function(error) {
					showRemind("网络连接错误");
				}
			});
		});

		// 关闭按钮
		$("#giftmoney-modal .modal-wait .modal-close").on("click", function() {
			self.hide();
		});

		// 保存提示中 去充值按钮
		$("#save-giftmoney-pay").on("click", function() {
			workBench.togglePage("gameinfo");
			$("#giftmoney-pay-btn").click();
		});
	},
	// 显示
	show: function() {
		this.drawTable();
		$("#giftmoney-modal").fadeIn(300);
	},
	// 隐藏
	hide: function() {
		$("#giftmoney-modal").fadeOut(300, function() {
			$("#giftmoney-modal .giftmoney-modal-content").show();
			$("#giftmoney-modal .modal-wait").hide();
		});
	},
	// 绘制表格
	drawTable: function() {
		var sum = 0;
		// 表头
		var html = "<tr><th>获奖类型</th><th>红包类型</th><th>红包个数</th><th>红包总金额</th></tr>";
		if (gift_config.length > 0) {
			for (var i = 0; i < gift_config.length; i++) {
				var type_text = "";
				if (gift_config[i].type == 1) {
					type_text = "按排名获奖";
				} else if (gift_config[i].type == 3) {
					type_text = "分享后可获奖";
				} else if (gift_config[i].type == 4) {
					type_text = "参加后可获奖";
				} else if (gift_config[i].type == 5) {
					type_text = "抽奖获奖";
				}
				var th_tag = false;
				var giftmoney_arr = [];
				for (var j = 0; j < gift_config[i].prize.length; j++) {
					var gift_type = gift_config[i].prize[j]["gift_type"];
					if (gift_type == 2 || gift_type == 3) {
						giftmoney_arr.push(gift_config[i].prize[j]);
					}
				} 
				for (var index in giftmoney_arr) {
					var gift_type = giftmoney_arr[index]["gift_type"];
					html += "<tr>";
					if (!th_tag) {
						th_tag = true;
						html += "<td rowspan='"+giftmoney_arr.length+"'>"+type_text+"</td>";
					}
					var name = (gift_type == 2) ? "普通红包" : "拼手气红包";
					html += "<td>"+name+"</td><td>"+giftmoney_arr[index].num+"</td><td>"+giftmoney_arr[index].sum+"</td></tr>";
					sum += parseInt(giftmoney_arr[index].sum);
				}
			}
		}
		// 总计
		html += "<tr id='giftmoney-table-total-tr'><td colspan='3'>总计</td><td id='giftmoney-table-total'>"+sum+"</td></tr>";
		$("#giftmoney-modal-table").html(html);
	},
	// 确认充值
	confirmPay: function() {
		$("#giftmoney-modal .giftmoney-modal-content").hide();
		$("#giftmoney-modal .modal-wait").show();
	},
	// 设置红包配置
	resetGiftMoney: function() {
		$("#giftmoney-pay-total").text(parseInt(giftmoney_config.total_num));
		$("#giftmoney-pay-count").text(parseInt(giftmoney_config.total_num));
		$("#giftmoney-pay-payed").text(parseInt(giftmoney_config.pay_num));
		$("#giftmoney-pay-need").text(parseInt(giftmoney_config.total_num-giftmoney_config.pay_num));
		
		$("#giftmoney-modal-payed").text(parseInt(giftmoney_config.pay_num));
		$("#giftmoney-modal-need").text(parseInt(giftmoney_config.total_num-giftmoney_config.pay_num));
		
		giftmoney_config.need_num = parseInt(giftmoney_config.total_num-giftmoney_config.pay_num);

		if (giftmoney_config.total_num > 0) {
			$("#giftmoney-pay-container").show();
			if (giftmoney_config.total_num > giftmoney_config.pay_num) {
				$("#giftmoney-pay-btn").show();
			} else {
				$("#giftmoney-pay-btn").hide();
			}
		} else {
			$("#giftmoney-pay-container").hide();
		}
	},
	// 创建订单
	createOrder: function() {
		showLoading("获取数据中");
		var giftmoney_total = parseFloat(giftmoney_config.need_num) * 1.03;
		var self = this;
		$.ajax({
			type: "POST",
			dataType: "json",
			url: "/pay/RpAjax/GenWxOrder",
			data: {game_id: game_id, total: giftmoney_total},
			success: function(result) {
				if (result.code == 0) {
					self.order_id = result.id;
					$("#remind-container").hide();
					$("#giftmoney-pay-confirm").attr("href", "/pay/redPack/index/order_id/"+result.id);
					$("#btn-pay-giftmoney-repay").attr("href", "/pay/redPack/index/order_id/"+result.id);
					self.show();
				} else if (result.code == 99) {
					showRemind("您的账号已经注销登录，请重新登录！");
					setTimeout(function() {
						location.href = "/web/login#"+location.href;
					}, 1500);
				} else {
					showRemind("系统错误");
				}
			},
			error: function(error) {
				showRemind("网络连接错误");
			}
		});
	}
};

/* 素材库 */
var AssetsPanel = function() {
	this.initUserPicList();
	this.bindEvents();
	this.grid_tpl_content = $(".grid-tpl").html();
};
AssetsPanel.prototype = {
	searching: false, // 是否正在搜索
	last_search: "", // 最后搜索

	loaded_public: false, // 公共素材库是否已经加载完
	grid_public: null, // 公共素材库瀑布流
	public_page: 0, // 公共素材第几页

	loading_self: false, // 我的是否正在加载
	loaded_self: false, // 是否已经加载完
	grid_self: null, // 我的瀑布流
	index_self: 0, // 我的素材最后加载到的素材下标

	grid_tpl: null, // 默认素材瀑布流

	isInited: false, // 是否已初始化
	targetObj : null, // 目标图片
	currentSelect : null, // 当前选择图片
	currentPage : 1, // 当前页数
	totalPage: 1, // 总页数
	currentType: 'pic', // 当前类型
	tplImgs: [],
	selectingColor: false, // 是否正在选择颜色
	currentColor: null, // 当前选中颜色

	upload_files: [], // 当前要上传的队列
	upload_files_index: 0, // 当前上传下标
	upload_error: [], // 当前上传文件错误信息
	uploaded_files: [], // 已上传成功文件
	last_upload_length: 0, // 最近一次上传的文件数量
	upload_cancel_tag: false, // 取消上传

	current_assets_type: "el", // 当前选中的元素的类型
	assets_type: {"el":"元素", "bg":"背景", "prize":"奖品"},

	current_pic_desc: null, // 当前图片说明对象

	current_show_type: null, // 当前显示的分类

	grid_tpl_content: null, // 默认配置HTML内容
	user_pic_list: {"el": [], "bg": [], "prize":[]}, // 分好类的用户图片列表

	// 分类
	initUserPicList: function() {
		this.user_pic_list = {"el": [], "bg": [], "prize":[]};
		if (user_pic_list.length > 0) {
			for (var index in user_pic_list) {
				var type = user_pic_list[index]["type"];
				type = (type == "pr") ? "prize" : type;
				this.user_pic_list[type].push(user_pic_list[index]);
			}
		}
	},
	// 绑定事件
	bindEvents: function() {
		var self = this;

		$("body").on("click", function() {
			if (!self.selectingColor && !workBench.textPanel.selectingColor) self.hide();
		});

		$(".pic-desc").on("click", function(e) {
			e.stopPropagation();
		});

		$("#main-panel").on("click", function(e) {
			e.stopPropagation();
		});

		// 搜索输入框
		$("#assets-search").on("input", function() {
			var content = $(this).val();
			if (content.length <= 0) {
				$(this).next().addClass("hidden");
			} else {
				$(this).next().removeClass("hidden");
			}
		});
		// 清空输入框
		$("#assets-search-empty").on("click", function() {
			$("#assets-search").val("");
			$(this).addClass("hidden");
			self.search("", 1, 30);
		});
		// 回车搜索
		$("#assets-search").keypress(function(event) {  
		    var keycode = (event.keyCode ? event.keyCode : event.which);  
		    if (keycode == '13') {
		    	var key = $("#assets-search").val();
		    	self.search(key, 1, 30);
		    }
		});

		// 导航
		$(".nav-panel .nav").on("click", function() {
			if (!$(this).hasClass("disabled")) {
				var type = $(this).attr("name");
				self.togglePanel(type);
			}
		});

		// 注册滚动加载事件
		$(".assets-panel-public").on("scroll", function() {
			var height = $(".assets-panel-public")[0].clientHeight;
			var scroll_height = $(".assets-panel-public")[0].scrollHeight;
			var scroll_top = $(".assets-panel-public")[0].scrollTop;
			if (scroll_top+height >= scroll_height*0.8) {
				self.search(self.last_search, self.public_page+1, 30);
			}
		});
		$(".assets-panel-self").on("scroll", function() {
			var height = $(".assets-panel-self")[0].clientHeight;
			var scroll_height = $(".assets-panel-self")[0].scrollHeight;
			var scroll_top = $(".assets-panel-self")[0].scrollTop;
			if (scroll_top+height >= scroll_height*0.8) {
				self.loadSelf();
			}
		});

		// 资源详情
		$(".assets-detail-panel").on("click", function() {
			$(".assets-detail-panel").stop().fadeOut(300);
		});
		// 下载素材
		$(".assets-detail-panel a").on("click", function(e) {
			e.stopPropagation();
		});

		// 素材复原
		$("#assets-reset").on("click", function() {
			self.resetImg();
		});

		// 本地上传
		$("#assets-upload").on("click", function() {
			if (!$(this).hasClass("disabled")) $("#assets-upload-input").click();
		});
		$("#assets-upload-input").on("change", function() {
			var files = $(this)[0].files;
			if (files.length > 10) {
				showRemind("一次最多只能上传10张图片哦~");
			} else {
				self.uploadStart(files);
			}
		});

		// 颜色块
		$(".assets-color-block").on("click", function() {
			self.changeImg($(this).attr("name"));
		});

		// 自定义颜色
		$("#assets-custom-color-btn").on("click", function() {
			self.showColorPicker();
		});

		$("#upload-error-modal").on("click", function(e) {
			e.stopPropagation();
		});

		// 上传错误提示
		$("#assets-uploading-warn").on("click", function(e) {
			e.stopPropagation();
			$("#upload-error-modal").fadeIn(300);
		});

		// 上传错误我知道了
		$("#upload-error-modal-btn").on("click", function(e) {
			$("#upload-error-modal").fadeOut(300);
			e.stopPropagation();
		});

		// 取消上传
		$("#assets-uploading-cancel").on("click", function(e) {
			e.stopPropagation();
			self.cancelUpload();
		});

		// 分类按钮
		$(".assets-type-btn").on("click", function(e) {
			e.stopPropagation();
			self.toggleAssetsType($(this).attr("name"));
		});

		// 创建公共瀑布流
		self.grid_public = $('.grid-public').masonry({
			itemSelector: '.grid-item',
			percentPosition: true,
			transitionDuration: 0
		});

		// 创建我的瀑布流
		self.grid_self = $('.grid-self').masonry({
			itemSelector: '.grid-item',
			percentPosition: true,
			transitionDuration: 0
		});

		// 资源说明输入框
		$(".pic-desc input").on("change", function() {
			var ext_desc = $(this).val();
			self.changeExtDesc(ext_desc);
		});
	},
	// 切换导航
	togglePanel: function(type) {
		$(".nav-panel .nav[name='"+type+"']").addClass("active").siblings().removeClass("active");
		$(".assets-panel-"+type).removeClass("hidden").siblings().addClass("hidden");
		if (type == "search") {
			$(".assets-panel-public").removeClass("hidden").siblings().addClass("hidden");
			$(".nav-panel .nav[name='public']").addClass("active").siblings().removeClass("active");
			$(this.grid_public).masonry('layout');
			$(self.grid_tpl).masonry('layout');
		} else if (type == "self") {
			$(this.grid_self).masonry('layout');
		} else if (type == "public") {
			$(this.grid_tpl).masonry('layout');
			$(this.grid_public).masonry('layout');
		} else if (type == "color") {

		}
	},
	// 搜索
	search: function(key, page, pageSize, switchType) {
		var self = this;
		// 判断是否已经搜索过
		var search_tag = false;
		if (key != this.last_search) {
			search_tag = true;
		} else if (page > this.public_page) {
			search_tag = true;
		} else if (switchType) {
			search_tag = true;
		}
		if (search_tag && !this.searching) {
			this.searching = true;
			var type = (this.current_show_type == "prize") ? "pr" : this.current_show_type;
			$.ajax({
				type: 'post',
				dataType: 'json',
				data: {key: key, page: page, total: pageSize, type: type},
				url: '/webAjax/GetPubImg',
				success: function(data) {
					if (data.code == 0) {
						var clear = (self.last_search != key) ? true : false;
						clear = clear || switchType;
						if (key != "") self.togglePanel("search");
						self.last_search = key;
						self.public_page = page;
						self.loadSearch(data.data, clear);
					} else if (data.code == 99) {
						showRemind("您的账号已经注销登录，请重新登录！");
						setTimeout(function() {
							location.href = "/web/login#"+location.href;
						}, 1500);
					} else {
						showRemind("系统错误");
						self.searching = false;
					}
				},
				error: function(error) {
					self.searching = false;
					showRemind("网络错误");
					console.log(error);
				}
			});
		}
	},
	// 加载搜索数据
	loadSearch: function(data, clear) {
		var self = this;
		// 清空
		if (clear) {
			// 清空元素
			$(self.grid_public).children().each(function() {
				$(self.grid_public).masonry('remove', this);
			});
			// 滚动到顶部
			$(".assets-panel-public")[0].scrollTop = 0;
			// 重新注册滚动事件
			$(".assets-panel-public").on("scroll", function() {
				var height = $(".assets-panel-public")[0].clientHeight;
				var scroll_height = $(".assets-panel-public")[0].scrollHeight;
				var scroll_top = $(".assets-panel-public")[0].scrollTop;
				if (scroll_top+height >= scroll_height*0.8) {
					self.search(self.last_search, self.public_page+1, 30);
				}
			});
			// 重置高度
			$(self.grid_public).css("height", "0px");
		}
		// 是否显示默认配置
		if (this.last_search == "") {
			$(".grid-tpl-divider").removeClass("hidden");
			$(this.grid_tpl).removeClass("hidden");
			$(self.grid_tpl).imagesLoaded().always(function() {
				$(self.grid_tpl).find(".grid-loading-container").remove();
				$(self.grid_tpl).find(".loading").removeClass("loading");
			 	$(self.grid_tpl).masonry('layout');
			});
		} else {
			$(".grid-tpl-divider").addClass("hidden");
			$(this.grid_tpl).addClass("hidden");
		}
		// 加载
		if (data.length > 0) {
			$(".grid-public-empty").addClass("hidden");
			// 显示加载中
			var last_top = parseInt($(self.grid_public).css("height"))+10;
			$(self.grid_public).append("<div class='grid-loading-container' style='top:"+last_top+"px;'><img src='//24haowan-cdn.shanyougame.com/public/images/web/icon-loading.png' /><span>正在加载</span></div>");
			for (var index in data) {
				var src = data[index].url;
				var fileSize = "";
				if (data[index].size) {
					if (data[index].size > 1024) {
						fileSize = (data[index].size/1024).toFixed(1) + "MB";
					} else {
						fileSize = data[index].size + "KB";
					}
				}
				var item = $('<div class="grid-item loading"><img src="'+src+'" name="'+fileSize+'"><img src="//24haowan-cdn.shanyougame.com/public/images/web/icon-assets-info-white.png" class="grid-item-info-btn"></div>');
				$(self.grid_public).append(item).masonry('appended', item);
				// 绑定事件
				// 信息
				$(self.grid_public).find(".grid-item").last().find(".grid-item-info-btn").on("click", function(e) {
					var img = $(this).prev();
					self.showAssetsDetail(img);
					e.stopPropagation();
				});
				// 替换
				$(self.grid_public).find(".grid-item").last().find("img").first().on("click", function() {
					$(".grid-item").removeClass("active");
					$(this).addClass("active").siblings().removeClass("active");
					self.currentSelect = $(this);
					self.changeImg();
				});
			}
			// 重新布局
			$(self.grid_public).imagesLoaded().always(function() {
				$(self.grid_public).find(".grid-loading-container").remove();
				$(self.grid_public).find(".loading").removeClass("loading");
			 	$(self.grid_public).masonry('layout');
			 	self.searching = false;
			});
		} else {
			self.searching = false;
			if (self.public_page <= 1) {
				// 清空
				$(self.grid_public).children().each(function() {
					$(self.grid_public).masonry('remove', this);
				});
				$(".grid-public-empty").removeClass("hidden");
			} else {
				$(".assets-panel-public").off("scroll");
			}
			self.loaded_public = true;
		}
	},
	// 加载我的数据
	loadSelf: function(clear) {
		var self = this;
		// 清空
		if (clear) {
			// 重置当前下标
			this.index_self = 0;
			// 清空元素
			$(self.grid_self).children().each(function() {
				$(self.grid_self).masonry('remove', this);
			});
			// 滚动到顶部
			$(".assets-panel-self")[0].scrollTop = 0;
			// 重新注册滚动事件
			$(".assets-panel-self").on("scroll", function() {
				var height = $(".assets-panel-self")[0].clientHeight;
				var scroll_height = $(".assets-panel-self")[0].scrollHeight;
				var scroll_top = $(".assets-panel-self")[0].scrollTop;
				if (scroll_top+height >= scroll_height*0.8) {
					self.loadSelf();
				}
			});
			// 重置高度
			$(self.grid_self).css("height", "0px");
		}
		if (this.user_pic_list[this.current_show_type].length > 0) {
			if (!self.loading_self) {
				self.loading_self = true;

				var data = this.user_pic_list[this.current_show_type];

				// 显示加载中
				var last_top = parseInt($(self.grid_self).css("height"))+10;
				$(self.grid_self).append("<div class='grid-loading-container' style='top:"+last_top+"px;'><img src='//24haowan-cdn.shanyougame.com/public/images/web/icon-loading.png' /><span>正在加载</span></div>");
			
				// 计算起始和结束下标
				if (this.index_self == 0) { // 第一次加载
					var start_index = 0;
					this.index_self = (data.length > 30) ? 29 : data.length-1;
				} else { // 不是第一次加载
					var start_index = this.index_self+1;
					this.index_self += 30;
					this.index_self = (this.index_self > data.length-1) ? data.length-1 : this.index_self;
				}

				// 判断是否已经全部加载完
				if (this.index_self == data.length-1) {
					this.loaded_self = true;
					$(".assets-panel-self").off("scroll");
				}

				if (start_index <= this.index_self) {
					// 加载
					for (var i = start_index; i <= this.index_self; i++) {
						var src = data[i].url;
						var fileSize = "";
						if (data[i].size) {
							if (data[i].size > 1024) {
								fileSize = (data[i].size/1024).toFixed(1) + "MB";
							} else {
								fileSize = data[i].size + "KB";
							}
						}
						var item = $('<div class="grid-item loading"><img src="'+src+'" name="'+fileSize+'"><img src="//24haowan-cdn.shanyougame.com/public/images/web/icon-assets-info-white.png" class="grid-item-info-btn"></div>');
						$(self.grid_self).append(item).masonry('appended', item);
						// 绑定事件
						// 信息
						$(self.grid_self).find(".grid-item").last().find(".grid-item-info-btn").on("click", function(e) {
							var img = $(this).prev();
							self.showAssetsDetail(img);
							e.stopPropagation();
						});
						// 替换
						$(self.grid_self).find(".grid-item").last().find("img").first().on("click", function() {
							$(".grid-item").removeClass("active");
							$(this).addClass("active").siblings().removeClass("active");
							self.currentSelect = $(this);
							self.changeImg();
						});
					}
					// 重新布局
					$(self.grid_self).imagesLoaded().always(function() {
						$(self.grid_self).find(".grid-loading-container").remove();
						$(self.grid_self).find(".loading").removeClass("loading");
					 	$(self.grid_self).masonry('layout');
					 	self.loading_self = false;
					});
				} else {
					self.loading_self = false;
				}
			}
		} else {
			self.loading_self = false;
			$(".grid-public-empty").removeClass("hidden");
		}
	},
	// 显示详情面板
	showAssetsDetail: function(imgObj) {
		var src = $(imgObj).attr("src");
		// 文件大小
		var fileSize = $(imgObj).attr("name");
		$(".assets-detail-panel .assets-file-size").text(fileSize);
		// 尺寸
		var img = new Image();
		img.onload = function() {
			var w = img.width;
			var h = img.height;
			var size_str = w+" * "+h+" PX";
			$(".assets-detail-panel .assets-size").text(size_str);
		};
		img.src = src;
		// 图片
		$(".assets-detail-panel img").attr("src", src);
		// 下载链接
		$(".assets-detail-panel a").attr("href", src);
		// 图片类型
		var type = "";
		src = src.toLowerCase();
		if (src.indexOf(".png") > -1) {
			type = "PNG";
		} else if (src.indexOf(".jpg") > -1 || src.indexOf(".jpeg") > -1) {
			type = "JPG";
		} else if (src.indexOf(".svg") > -1) {
			type = "SVG";
		}
		$(".assets-detail-panel .assets-type").text(type);
		$(".assets-detail-panel").stop().fadeIn(300);
	},
	// 显示
	show: function(targetObj, type) {
		var self = this;
		this.targetObj = targetObj;
		this.currentType = type;

		// 隐藏信息模态窗、其他面板
		$(".assets-detail-panel").stop().fadeOut(0);
		$(".custom-panel").removeClass("hidden").siblings().addClass("hidden");

		// 媒体类型
		if (this.currentType == "pic") {
			this.current_assets_type = "el";
		} else if (this.currentType == "bg") {
			this.current_assets_type = "bg";
		}

		// 清除上一次的highlight
		$(".grid-item").removeClass("active");
		$(self.grid_self).masonry('remove', $(".grid-self .highlight-item"));
		$(self.grid_public).masonry('remove', $(".grid-public .highlight-item"));
		// 高亮目标
		$(".custom-pic").removeClass("active");
		$(this.targetObj).addClass("active");
		
		// 显示图片介绍
		this.showPicDesc();
		// 设置标题
		this.setAssetTitle();

		var src;
		if ($(this.targetObj).attr("id") == "input-prize-add-img") { // 新增奖品
			src = $(this.targetObj).find(".custom-pic-div").css("background-image");
            this.current_assets_type = "prize";
		} else if ($(this.targetObj).attr("id") == "input-prize-add-qrcode") { // 公众号二维码
			src = $(this.targetObj).find(".custom-pic-div").css("background-image");
			this.current_assets_type = "el";
		} else { // 资源替换
			// 更换图片
			src = $(this.targetObj).find(".custom-pic-div").css("background-image");
			if (src == "none") { // 原来选的是纯色的
				// 启用纯色模块
				$(".nav-panel .nav[name='color']").removeClass("disabled");
				this.togglePanel("color");
				// 高亮颜色
				var bgColor = $(this.targetObj).find(".custom-pic-div").attr("name");
				var color_tag = false;
				$(".assets-color-block").each(function() {
					if ($(this).attr("name") == bgColor) {
						color_tag = true; 
						return false;
					}
				});
				if (!color_tag) {
					$("#assets-color-kit").val(bgColor);
					$("#assets-color-kit").spectrum('set', $("#assets-color-kit").val());
					this.previewColor(bgColor, true);
				}
			} else { // 原来选的是图片
				// 禁用纯色模块
				if (this.currentType != "bg") {
					$(".nav-panel .nav[name='color']").addClass("disabled");
				} else {
					$(".nav-panel .nav[name='color']").removeClass("disabled");
				}
			}
		}

		// 高亮分类
		this.toggleAssetsType(this.current_assets_type);
	},
	hide: function() {
		// 隐藏图片介绍
		$(this.current_pic_desc).slideUp(200);
		this.current_pic_desc = null;
		// 显示活动信息面板
		$(".activity-panel").removeClass("hidden").siblings().addClass("hidden");
		// 取消高亮
		$(".custom-pic").removeClass("active");
	},
	// 判断是否为公共素材
	isPublic: function(_src) {
		var src;
		if (_src.indexOf("/public_resource/") > -1) {
			return "public";
		}
		if (_src.indexOf("/new_platform/image/prize.svg") > -1) {
            return false;
		} else {
			// 逐项检测
			// 自定义标题图片
			if (platform_config["game-title-img"]) {
				if (_src.indexOf(default_platform_config["game-title-img"]) > -1) return "tpl";
			}
			// 背景
			if (_src.indexOf(default_platform_config["style"]["background"]["start-menu"]) > -1) return "tpl";
			// 横幅
			if (_src.indexOf(default_platform_config["style"]["banner"]["start-menu"]) > -1) return "tpl";
			// 游戏素材
			for (var index in default_platform_config["game"]) {
				if (index.indexOf("music_") < 0 
					&& default_platform_config["game"][index].indexOf("#") != 0 
					&& !(default_platform_config["game"][index] instanceof Array)) {
					if (_src.indexOf(default_platform_config["game"][index]) > -1) return "tpl";
				}
			}
			// 动画素材
			if (default_platform_config["platform"]["texture"]) {
				for (var texture_name in default_platform_config["platform"]["texture"]) {
					for (var index in default_platform_config["platform"]["texture"][texture_name]) {
						if (_src.indexOf(default_platform_config["platform"]["texture"][texture_name][index]["url"]) > -1) return "tpl";
					}
				}
			}
			// 可配置元素
			if (default_platform_config["platform"]["configurable"]) {
				for (var configurable_name in default_platform_config["platform"]["configurable"]) {
					for (var index in default_platform_config["platform"]["configurable"][configurable_name]["elements"]) {
						if (_src.indexOf(default_platform_config["platform"]["configurable"][configurable_name]["elements"][index]) > -1) return "tpl";
					}
				}
			}
		}
		return false;
	},
	// 高亮并置顶当前图片
	highlightImg: function(src, grid, isPublic) {
		if (isPublic == "tpl") {
			var search_src = src.split("/");
			search_src = "/"+search_src[search_src.length-1];

			var tag_game_title_img = false;
			if ($(this.targetObj).attr("id") == "pic-game-title-img") { // 自定义标题图片
				var _src = $(".grid-tpl .grid-item[name='game-title-img']").find("img").first().attr("src");
				if (_src.indexOf(search_src) > -1) {
					$(".grid-tpl .grid-item[name='game-title-img']").addClass("active");
					tpl_tag = true;
					tag_game_title_img = true;
				}
			}

			if (!tag_game_title_img) {
				$(".grid-tpl .grid-item").each(function() {
					var _src = $(this).find("img").first().attr("src");
					if (_src.indexOf(search_src) > -1) {
						tpl_tag = true;
						$(this).addClass("active");
						return false;
					}
				});
			}
		} else {
			var self = this;
			var fileSize = "";
			var item = $('<div class="grid-item active highlight-item loading"><img src="'+src+'" name="'+fileSize+'"><img src="//24haowan-cdn.shanyougame.com/public/images/web/icon-assets-info-white.png" class="grid-item-info-btn"></div>');
			$(grid).prepend(item).masonry('prepended', item);
			// 绑定事件
			// 信息
			$(grid).find(".grid-item").first().find(".grid-item-info-btn").on("click", function(e) {
				var img = $(this).prev();
				self.showAssetsDetail(img);
				e.stopPropagation();
			});
			// 替换
			$(grid).find(".grid-item").first().find("img").first().on("click", function() {
				$(this).addClass("active").siblings().removeClass("active");
				self.currentSelect = $(this);
				self.changeImg();
			});
			// 重新布局
			$(grid).imagesLoaded().always(function() {
				$(grid).find(".grid-loading-container").remove();
				$(grid).find(".loading").removeClass("loading");
			 	$(grid).masonry('layout');
			});
		}
	},
	// 重置图片
	resetImg : function() {
		var src;
		if ($(this.targetObj).attr("id")) {
			if ($(this.targetObj).attr("id") == "pic-test-question-img"
				|| $(this.targetObj).attr("id") == "pic-question-img") {
				src = "//24haowan-cdn.shanyougame.com/public/images/web/pic-empty.png";
			} else if ($(this.targetObj).attr("id") == "input-prize-add-img") {
				src = "//24haowan-cdn.shanyougame.com/new_platform/image/prize.svg";
			} else if ($(this.targetObj).attr("id") == "input-prize-add-qrcode") {
				src = "//24haowan-cdn.shanyougame.com/game_tpl/activity-qrcode.jpg";
			} else {
				// 资源替换
				var id = $(this.targetObj).attr("id").split("pic-")[1];
				if (id == "game-qrcode") { // 二维码图片
					src = "//24haowan-cdn.shanyougame.com/game_tpl/activity-qrcode.jpg";
				} else if (id.indexOf("background") > -1) { // 背景
					id = id.split("background-")[1];
					src = default_platform_config["style"]["background"][id];
				} else if (id == "game-title-img") { // 自定义标题横幅
					src = default_platform_config["game-title-img"];
				} else if (id.split("-")[0] == "game") { // 游戏素材
					id = id.split("game-")[1];
					src = default_platform_config["platform"]["game"][id].url;
				} else if (id.indexOf("texture") > -1) { // 动画素材
					var texture_name = id.split("texture-")[1].split("-")[0];
					var frame = parseInt(id.split("texture-")[1].split("-")[1]);
					src = default_platform_config["platform"]["texture"][texture_name][frame].url;
				} else if (id.indexOf("banner") > -1) { // 横幅
					id = id.split("banner-")[1];
					src = default_platform_config["style"]["banner"][id]; 
				} else if (id.indexOf("brand") > -1) { // 商家
					id = id.substr(6);
					src = default_platform_config["style"]["brand"][id];
				} else if (id == "loadingColor") { // 加载背景
					src = default_platform_config["style"]["loadingColor"];
				} else if (id == "loadingBanner") { // 加载横幅
					src = default_platform_config["style"]["loadingBanner"];
				} else if (id == "activity-qrcode") { // 活动规则公众号二维码
					src = default_platform_config["activity-qrcode"];
				} else if (id.indexOf("configurable") > -1) { // 可配置元素
					id = id.split("configurable-")[1];
					var name = id.split("-")[0];
					var index = id.split("-")[1];
					src = default_platform_config["platform"]["configurable"][name]["elements"][index];
				}
			}
		} else {
			// 分享设置
			var type = $(this.targetObj).attr("name").split("-")[1];
			if (type == "share") { // 分享图片
				src = default_platform_config["message"]["share"]["pic"];
			} else if (type == "prize") { // 奖品图片
				src = "//24haowan-cdn.shanyougame.com/new_platform/image/prize.svg";
			}
		}
		if (src.indexOf("#") === 0) { // 纯色
			$("#bg-selector-color-kit").spectrum('set', src);
			this.changeImg(src);
		} else { // 图片
			$(".grid-self").children().removeClass("active");
			// 将当前选择选中默认图片
			var img = new Image();
			img.src = src;
			this.currentSelect = img;
			this.changeImg();
		}
	},
	// 替换图片
	changeImg: function(color) {
		var value = "";
		// 高亮
		$(".grid-item").removeClass("active");
		$(this.currentSelect).parent().addClass("active");
		if (this.currentType == "bg" && color) { // 如果是纯色背景
			color = color.toUpperCase();
			// 换成纯色背景
			$(this.targetObj).find(".custom-pic-div").css({
				"background-color" : color,
				"background-image" : "none"
			}).attr("name", color);
			value = color;
		} else {
			// 换成图片
			var src = $(this.currentSelect).attr("src");
			$(this.targetObj).find(".custom-pic-div").css({
				"background-color" : "#f6f6f6",
				"background-image" : "url('"+src+"')"
			}).attr("name", "pic");
			value = src;
		}
		// 配置表
		if ($(this.targetObj).attr("id")) {
			// 资源替换
			var id = $(this.targetObj).attr("id").split("pic-")[1];
			if (id == "game-qrcode") { // 游戏二维码图片
				platform_config["game"]["qrcode"]["pic"] = value;
			} else if (id == "question-img") { // 问答类 问题图片
				if (value != "//24haowan-cdn.shanyougame.com/public/images/web/pic-empty.png") {
					$(".question-img-delelte").css("visibility", "visible");
				} else {
					$(".question-img-delelte").css("visibility", "hidden");
				}
			} else if (id == "test-question-img") { // 测试类 问题图片
				if (value != "//24haowan-cdn.shanyougame.com/public/images/web/pic-empty.png") {
					$(".question-img-delelte").css("visibility", "visible");
				} else {
					$(".question-img-delelte").css("visibility", "hidden");
				}
			} else if (id.indexOf("background") > -1) { // 背景
				id = id.split("background-")[1];
				platform_config["style"]["background"][id] = value;
				// 实时更新
				var obj;
				if (id == "start-menu") {
					obj = $("#start-menu");
				} else if (id == "game-over-menu") {
					obj = $(".game-over-menu");
				} else if (id == "share-sign-in") {
					obj = $(".share-sign-in");
				}
				if (value.indexOf("#") === 0) { // 纯色
					$(obj).css("background-color", value);
					$(obj).css("background-image", "none");
				} else { // 图片
					$(obj).css("background-color", "none");
					$(obj).css("background-image", "url('"+value+"')");
				}
			} else if (id == "game-title-img") { // 自定义标题图片
				platform_config["game-title-img"] = value;
				$(".game-title img").attr("src", value);
				workBench.resetGameStyle();
			} else if (id.split("-")[0] == "game") { // 游戏素材
				id = id.split("game-")[1];
				platform_config["platform"]["game"][id].url = value;
				platform_config["game"][id] = value;
			} else if (id.split("-")[0] == "texture") { // 动画素材
				id = id.split("texture-")[1];
				var key = id.split("-")[0];
				var index = id.split("-")[1];
				platform_config["platform"]["texture"][key][index].url = value;

				// 判断合图大小
				if (!this.tplImgs[key]) this.tplImgs[key] = [];
				var self = this;
				this.tplImgs[key][index] = new Image();
				this.tplImgs[key][index].onload = function() {
					if (self.tplImgs[key][index].width > 500 || self.tplImgs[key][index].height > 500) {
						var url = platform_config["platform"]["texture"][key][index].url;
                        if(url.indexOf('img-2.24haowan.shanyougame.com')>=0) {
                            platform_config["platform"]["texture"][key][index].url = url + "@500h_500w.png";
                        }
                        else {
                            platform_config["platform"]["texture"][key][index].url = url;
                        }
					}
				}
				this.tplImgs[key][index].src = value;

				workBench.tplImgTag = true;
			} else if (id.indexOf("banner") > -1) { // 横幅
				id = id.split("banner-")[1];
				platform_config["style"]["banner"][id] = value;
				$(".game-img-"+id).find("img").attr("src", value);
			} else if (id.indexOf("brand") > -1) { // 商家
				id = id.substr(6);
				platform_config["style"]["brand"][id] = value;
				// 实时更新
				$(".brand-icon").find("img").attr("src", value);
			} else if (id.split("-")[0] == "configurable") { // 可配置元素
				id = id.split("configurable-")[1];
				var key = id.split("-")[0];
				var index = id.split("-")[1];
				platform_config["platform"]["configurable"][key]["elements"][index] = value;
				platform_config["game"][key][index] = value;
			} else if (id == "loadingColor") { // 加载背景
				if (upgrade == "yes") {
					platform_config["style"]["loadingColor"] = value;
					if (value.indexOf("#") === 0) { // 纯色
						$("#loading").css("background-color", value);
						$("#loading").css("background-image", "none");
					} else { // 图片
						$("#loading").css("background-color", "none");
						$("#loading").css("background-image", "url('"+value+"')");
					}
				}
			} else if (id == "loadingBanner") { // 加载横幅
				if (upgrade == "yes") {
					platform_config["style"]["loadingBanner"] = value;
					$("#loading-img").attr("src", value);
				}
			} else if (id == "activity-qrcode") { // 活动规则公众号二维码
				platform_config["activity-qrcode"] = value;
				workBench.assetsCustom.updateActivityView(false, false, false, false, true);
			}
		} else {
			// 游戏信息设置
			var type = $(this.targetObj).attr("name").split("-")[1];
			if (type == "share") {
				// 分享设置
				$("#preview-wechat").find(".pic").css("background-image", "url('"+value+"')");
		        value = value.replace(/^\/\//, "http://");
		        value = value.replace(/^https:\/\//, "http://");
				platform_config["message"]["share"]["pic"] = value;
			} else if (type == "prize") {
				// 奖项设置
				workBench.gameInfoCustom.updateGiftView($(this.targetObj).parent().parent());
			}
		}
		workBench.save();
	},
	// 上传图片
	uploadImg: function() {
		var self = this;

		if (self.upload_files.length > 0 && self.upload_files_index < self.upload_files.length) {
			var form = new FormData();
			form.append("upload_file", self.upload_files[self.upload_files_index]);
			var upload_type = (self.current_assets_type == "prize") ? "pr" : self.current_assets_type;
			form.append("type", upload_type);
			var url = "/WebAjax/Uploadfile";
			var name = self.upload_files[self.upload_files_index].name;
			if (self.upload_files[self.upload_files_index].name.length > 12) {
				name = self.upload_files[self.upload_files_index].name.substr(0, 6);
				name += "...";
				name += self.upload_files[self.upload_files_index].name.substr(self.upload_files[self.upload_files_index].name.length-6, self.upload_files[self.upload_files_index].name.length-1);
			}
			$("#assets-uploading-text span.filename").text(name);
			var num = (self.upload_files_index) + "/" + self.upload_files.length;
			$("#assets-uploading-text span.filenum").text(num);

			// XMLHttpRequest 对象
			var xhr = new XMLHttpRequest();
			xhr.open("post", url, true);
			xhr.setRequestHeader("X-Requested-With","XMLHttpRequest"); 
			xhr.send(form);

			// 回调函数
			xhr.onreadystatechange = function() {
				if (xhr.readyState == 4) {
					if (!self.upload_cancel_tag) {
						var file = self.upload_files[self.upload_files_index];
						var name = file.name;
						if (file.name.length > 12) {
							name = file.name.substr(0, 6);
							name += "...";
							name += file.name.substr(file.name.length-6, file.name.length-1);
						}
						if (xhr.status == 200) {
							var response = xhr.responseText;
							var result = JSON.parse(response);

							// 从xml字符串转换成xml对象
							if (result.code == 0) {
								// 添加到数组中
								var imgObj = {"name":file.name, "url":result.url, "size": result.size, "type": (upload_type == "pr") ? "prize" : upload_type};
								user_pic_list.unshift(imgObj);
								self.user_pic_list[self.current_assets_type].unshift(imgObj);
								// 添加到待添加数组中
								self.uploaded_files.push(imgObj);
							} else if (result.code == -1) {
								self.upload_error.push({"file_name": name, "error": "系统错误"});
							} else if (result.code == -2) {
								self.upload_error.push({"file_name": name, "error": "系统错误"});
							} else if (result.code == -3) {
								self.upload_error.push({"file_name": name, "error": "文件超过规定大小（1MB）"});
							} else if (result.code == -5) {
								self.upload_error.push({"file_name": name, "error": "文件类型不符（仅限PNG、JPG）"});
							}
						} else {
							self.upload_error.push({"file_name": name, "error": "网络传输错误"});
						}
						// 继续上传
						var percent = (self.upload_files_index+1)/self.upload_files.length*100;
						$("#assets-upload-progress").css("width", percent+"%");
						self.upload_files_index++;
						self.uploadImg();
					}
				}
			}
		} else { // 上传完毕
			self.uploadDone();
		}
	},
	// 上传完毕
	uploadDone: function() {
		var self = this;
		if (self.uploaded_files.length > 0) {
			// 当前显示的类型不是 选中元素的类型，先切换过去
			if (this.current_show_type != this.current_assets_type) { 
				this.toggleAssetsType(this.current_assets_type);
			} else {
				this.loadSelf(true);
			}
			// 切换到我的
			self.togglePanel("self");
			// 重新布局
			$(self.grid_self).imagesLoaded().always(function() {
				$(self.grid_self).find(".grid-loading-container").remove();
				$(self.grid_self).find(".loading").removeClass("loading");
			 	$(self.grid_self).masonry('layout');
			});
		}
		// 清空输入
		$("#assets-upload-input").val("");
		self.upload_files = [];
		self.uploaded_files = [];
		self.upload_files_index = 0;
		$("#assets-upload").removeClass("disabled");
		// 进度条
		$("#assets-upload-progress").css("width", "100%");
		$("#assets-uploading-text").addClass("hidden");
		$("#assets-upload-text").removeClass("hidden");
		// 检查是否有错误
		if (self.upload_error.length > 0) {
			$("#assets-upload-progress").addClass("warn");
			$("#assets-uploading-ques").addClass("hidden");
			$("#assets-uploading-warn").removeClass("hidden");
			self.setUploadError();
		} else {
			$("#assets-upload-progress").removeClass("warn");
			$("#assets-uploading-ques").removeClass("hidden");
			$("#assets-uploading-warn").addClass("hidden");
		}
	},
	// 开始上传
	uploadStart: function(files) {
		var self = this;
		$("#assets-uploading-warn").addClass("hidden");
		$("#assets-upload-progress").removeClass("warn");
		// 进度条
		$("#assets-upload-progress").css("width", "0px");
		$("#assets-uploading-text").removeClass("hidden");
		$("#assets-upload-text").addClass("hidden");
		// 禁用
		$("#assets-upload").addClass("disabled");
		self.upload_error = [];
		for (var i = 0; i < files.length; i ++) {
			self.upload_files.push(files[i]);
		}
		self.upload_cancel_tag = false;
		self.last_upload_length = self.upload_files.length;
		self.uploadImg();
	},
	// 取消上传
	cancelUpload: function() {
		var self = this;
		self.upload_cancel_tag = true;
		self.uploadDone();
	},
	// 设置上传错误信息
	setUploadError: function() {
		var self = this;
		var error_num = self.upload_error.length;
		var total_num = self.last_upload_length;
		var success_num = self.last_upload_length - error_num;
		var str = "您共上传"+total_num+"张图片。其中"+success_num+"张图片上传成功。以下"+error_num+"张图片上传失败。";
		$("#upload-error-modal .title span").text(str);
		$("#upload-error-modal .table").html("");
		if (self.upload_error.length > 0) {
			var html = "";
			for (var i in self.upload_error) {
				html += "<tr>";
				html += "<td style='width: 10%;text-align:center'><img src='//24haowan-cdn.shanyougame.com/public/images/web/icon-assets-remove-white.png'></td>";
				html += "<td style='width: 45%;'>"+self.upload_error[i]["file_name"]+"</td>";
				html += "<td style='width: 45%;'>"+self.upload_error[i]["error"]+"</td>";
				html += "</tr>";
			}
			$("#upload-error-modal table").html(html);
		}
	},
	// 预览颜色
	previewColor: function(color, showTag) {
		if (!self.currentColor) {
			self.currentColor = color;
			showTag = false;
		}
		if (!showTag) {
			$("#assets-custom-color-btn").css({
				"background": color,
				"border-color": color,
				"color": "white"
			});
			$("#assets-custom-color-btn").off("mouseenter mouseleave");
			$("#assets-custom-color-btn").hover(function() {
			    $(this).css({
			    	"background-color": color,
			    	"border-color": color
			    });
			}, function() {
			    $(this).css({
			    	"background-color": color,
			    	"border-color": color
			    });
			});
			if (this.currentType == "bg" && color) { // 如果是纯色背景
				// 换成纯色背景
				$(this.targetObj).find(".custom-pic-div").css({
					"background-color" : color,
					"background-image" : "none"
				}).attr("name", color);
				value = color;
			}
			if ($(this.targetObj).attr("id")) {
				var id = $(this.targetObj).attr("id").split("pic-")[1];
				if (id.indexOf("background") > -1) { // 背景
					id = id.split("background-")[1];
					var obj;
					if (id == "start-menu") {
						obj = $("#start-menu");
					} else if (id == "game-over-menu") {
						obj = $(".game-over-menu");
					} else if (id == "share-sign-in") {
						obj = $(".share-sign-in");
					}
					$(obj).css("background-color", value);
					$(obj).css("background-image", "none");
				} else if (id == "loadingColor") { // 加载背景
					if (upgrade == "yes") {
						$("#loading").css("background-color", value);
						$("#loading").css("background-image", "none");
					}
				}
			}
		}
	},
	// 显示选择颜色面板
	showColorPicker: function(color) {
		var self = this;
		$("#assets-color-kit").spectrum({
		    allowEmpty: false,
		    color: self.currentColor,
		    showInput: true,
		    containerClassName: "full-spectrum",
		    showInitial: false,
		    showPalette: false,
		    showAlpha: false,
		    preferredFormat: "hex",
		    show: function() {
		    	self.selectingColor = true;
		    },
		    move: function(color) {
		    	var bgColor = color.toHexString().toUpperCase();
		    	self.previewColor(bgColor);
		    	self.currentColor = bgColor;
		    },
		    hide: function() {
		    	self.selectingColor = false;
		    	$("#assets-color-kit").spectrum('destroy');
		    	$("#assets-color-kit").css("display", "none");
		    },
		    change: function(color) {
		    	var bgColor = color.toHexString().toUpperCase();
		    	self.previewColor(bgColor);
		    	self.currentColor = bgColor;
		    }
		});
		$(".sp-choose").on("click", function() {
			self.changeImg(self.currentColor);
		});
		$("#assets-color-kit").spectrum('show');
	},
	// 获取图像URL
	getImageUrl: function(src) {
		var result = src;
		result = result.split('url(')[1];
		result = result.substr(0, result.length-1);
		result = result.replace(/\"/g, "");
		return result;
	},
	// 设置标题
	setAssetTitle: function() {
		var asset_title;
		if ($(this.targetObj).attr("id") == "input-prize-add-img") { // 添加奖品
			asset_title = "奖品图片";
		} else if ($(this.targetObj).attr("id") == "input-prize-add-qrcode") { // 兑奖链接 - 公众号
			asset_title = "公众号二维码";
		} else {
			// 配置表
			if ($(this.targetObj).attr("id")) {
				// 资源替换
				var id = $(this.targetObj).attr("id").split("pic-")[1];
				if (id == "game-qrcode") {
					asset_title = "二维码图片";
				} else if (id == "question-img") {	
					asset_title = "问题图片";
				} else if (id == "test-question-img") {
					asset_title = "问题图片";
				} else if (id.indexOf("background") > -1) { // 背景
					id = id.split("background-")[1];
					if (id == "start-menu") {
						asset_title = "开始页背景";
					} else if (id == "game-over-menu") {
						asset_title = "结束页背景";
					} else if (id == "share-sign-in") {
						asset_title = "分享登录页背景";
					}
				} else if (id == "game-title-img") { // 自定义标题图片
					asset_title = "自定义标题图片";
				} else if (id.split("-")[0] == "game") { // 游戏素材
					id = id.split("game-")[1];
					asset_title = platform_config["platform"]["game"][id].name;
				} else if (id.split("-")[0] == "texture") { // 动画素材
					id = id.split("texture-")[1];
					var key = id.split("-")[0];
					var index = id.split("-")[1];
					asset_title = platform_config["platform"]["texture"][key][index].name;
				} else if (id.indexOf("banner") > -1) { // 横幅
					id = id.split("banner-")[1];
					if (id == "start-menu") {
						asset_title = "开始页横幅";
					} else if (id == "game-over-menu") {
						asset_title = "结束页横幅";
					} else if (id == "share-sign-in") {
						asset_title = "分享登录页横幅";
					}
				} else if (id.indexOf("brand") > -1) { // 商家
					
				} else if (id.split("-")[0] == "configurable") { // 可配置元素
					id = id.split("configurable-")[1];
					var key = id.split("-")[0];
					var index = id.split("-")[1];
					asset_title = platform_config["platform"]["configurable"][key]["name"];
				} else if (id == "loadingColor") { // 加载背景
					asset_title = "加载页背景";
				} else if (id == "loadingBanner") { // 加载横幅
					asset_title = "加载页横幅";
				} else if (id == "activity-qrcode") { // 活动规则公众号二维码
					asset_title = "公众号二维码";
				}
			} else {
				// 游戏信息设置
				var type = $(this.targetObj).attr("name").split("-")[1];
				if (type == "share") {
					asset_title = "分享小图片";
				} else if (type == "prize") {
					asset_title = "奖品图片";
				}
			}
		}
		asset_title = this.assets_type[this.current_assets_type] + " - " + asset_title;
		$(".asset-title-panel .asset-title").text(asset_title);
	},
	// 显示图片介绍
	showPicDesc: function() {
		if (this.current_pic_desc) {
			$(this.current_pic_desc).stop().slideUp(200);
		}
		var size = $(this.targetObj).find(".custom-pic-size").text();
		if (size != "") {
			var ext_desc = $(this.targetObj).find(".custom-pic-size").attr("name");
			var size_width = size.split("*")[0].replace("px", "");
			var size_height = size.split("*")[1].replace("px", "");
			// 设置当前介绍的对象
			this.current_pic_desc = $(this.targetObj).parents(".custom-group").find(".pic-desc");
			if ($(this.current_pic_desc).hasClass("over")) {
				$(this.current_pic_desc).css("width", $("#main-container")[0].scrollWidth);
			} else {
				$(this.current_pic_desc).css("width", "100%");
			}
			
			// 判断显示的类型
			if (!workbench_admin) { // 非管理员模式，显示文本
				if (this.current_assets_type == "el") {
					if (ext_desc) {
						$(this.current_pic_desc).text("元素类型，可替换为其他透明底图标或图片。"+ext_desc);
					} else {
						$(this.current_pic_desc).text("元素类型，可替换为其他透明底图标或图片。建议尺寸"+size_width+"像素x"+size_height+"像素");
					}
				} else if (this.current_assets_type == "bg") {
					if (ext_desc) {
						$(this.current_pic_desc).text("背景类型，可替换为纯色或不透明底图片。"+ext_desc);
					} else {
						$(this.current_pic_desc).text("背景类型，可替换为纯色或不透明底图片。建议尺寸"+size_width+"像素x"+size_height+"像素");
					}
				}
			} else { // 管理员模式，显示输入框
				if (ext_desc) {
					$(this.current_pic_desc).find("input").val(ext_desc);
				} else {
					$(this.current_pic_desc).find("input").val("");
				}
			}
			// 显示
			$(this.current_pic_desc).stop().slideDown(200);
		}
	},
	// 修改图片额外说明
	changeExtDesc: function(ext_desc) {
		// 配置表
		if ($(this.targetObj).attr("id")) {
			// 资源替换
			var id = $(this.targetObj).attr("id").split("pic-")[1];
			if (id.indexOf("background") > -1) { // 背景
				platform_config["style"]["background"]["ext_desc"] = ext_desc;
			} else if (id == "game-title-img") { // 自定义标题图片
				platform_config["game-title-img-ext-desc"] = ext_desc;
			} else if (id.split("-")[0] == "game") { // 游戏素材
				id = id.split("game-")[1];
				platform_config["platform"]["game"][id]["ext_desc"] = ext_desc;
			} else if (id.split("-")[0] == "texture") { // 动画素材
				id = id.split("texture-")[1];
				var key = id.split("-")[0];
				var index = id.split("-")[1];
				platform_config["platform"]["texture"][key][index]["ext_desc"] = ext_desc;
			} else if (id.indexOf("banner") > -1) { // 横幅
				id = id.split("banner-")[1];
				platform_config["style"]["banner"]["ext_desc"] = ext_desc;
			} else if (id.split("-")[0] == "configurable") { // 可配置元素
				id = id.split("configurable-")[1];
				var key = id.split("-")[0];
				var index = id.split("-")[1];
				if (!platform_config["platform"]["configurable"][key]["ext_desc"]) {
					platform_config["platform"]["configurable"][key]["ext_desc"] = [];
				}
				platform_config["platform"]["configurable"][key]["ext_desc"][index] = ext_desc;
			} else if (id == "loadingColor") { // 加载背景
				platform_config["style"]["loadingColor-ext-desc"] = ext_desc;
			} else if (id == "loadingBanner") { // 加载横幅
				platform_config["style"]["loadingBanner-ext-desc"] = ext_desc;
			} else if (id == "activity-qrcode") { // 活动规则公众号二维码
				platform_config["activity-qrcode-ext-desc"] = ext_desc;
			}
		} else {
			// 游戏信息设置
			var type = $(this.targetObj).attr("name").split("-")[1];
			if (type == "share") {
				platform_config["message"]["share"]["pic-ext-desc"] = ext_desc;
			}
		}
		$(this.targetObj).find(".custom-pic-size").attr("name", ext_desc);
		workBench.save();
	},
	// 切换分类
	toggleAssetsType: function(type) {
		var self = this;

		if (type != this.current_show_type) {
			// 高亮分类
			this.current_show_type = type;
			$(".assets-type-btn[name='"+this.current_show_type+"']").addClass("active").siblings().removeClass("active");

			// 筛选默认配置
			$(self.grid_tpl).masonry('destroy');
			$(".grid-tpl").html(this.grid_tpl_content).find(".grid-item").each(function() {
				if (!$(this).hasClass("grid-item-"+type)) $(this).remove();
			});

			// 创建默认配置的瀑布流
			this.grid_tpl = $('.grid-tpl').masonry({
				itemSelector: '.grid-item',
				percentPosition: true,
				transitionDuration: 0
			});
			$(self.grid_tpl).imagesLoaded().always(function() {
				$(self.grid_tpl).find(".grid-loading-container").remove();
				$(self.grid_tpl).find(".loading").removeClass("loading");
			 	$(self.grid_tpl).masonry('layout');
			});

			// 绑定默认配置的事件
			$(self.grid_tpl).find(".grid-item").each(function() {
				$(this).find(".grid-item-info-btn").on("click", function(e) {
					var img = $(this).prev();
					self.showAssetsDetail(img);
					e.stopPropagation();
				});
			});
			// 替换
			$(self.grid_tpl).find(".grid-item").each(function() {
				$(this).find("img").first().on("click", function() {
					$(".grid-item").removeClass("active");
					$(this).addClass("active").siblings().removeClass("active");
					self.currentSelect = $(this);
					self.changeImg();
				});
			});

			// 重新加载公共
			this.search(this.last_search, 1, 30, true);

			// 重新加载我的
			this.loadSelf(true);
		} else {
			$('.grid-public').masonry('layout');
	        $('.grid-self').masonry('layout');
	        $('.grid-tpl').masonry('layout');
		}
	}
};

/* 文本修改面板 */
var TextPanel = function() {
	this.bindEvents();
};
TextPanel.prototype = {
	targetObj: null,
	colors: [],
	selectingColor: false,
	currentColor: null,

	// 绑定事件
	bindEvents: function() {
		var self = this;
		if (game_status == "wait") {
			// 活动名称
			$("#text-game-title-text").on("click", function(e) {
				self.show(this, "活动名称");
				e.stopPropagation();
			});
		}
		// 分享登录文案
		$("#text-game-wechat-text").on("click", function(e) {
			self.show(this, "分享登录文案");
			e.stopPropagation();
		});
		// 链接名称
		$("#text-brand-text").on("click", function(e) {
			self.show(this, "链接名称");
			e.stopPropagation();
		});

		$("body").on("click", function() {
			if (!self.selectingColor && !workBench.assetsPanel.selectingColor) self.hide();
		});

		// 颜色块
		$(".text-color-block").on("click", function() {
			self.changeTextColor($(this).attr("name"));
			$(this).addClass("active").siblings().removeClass("active");
		});

		// 自定义颜色
		$("#text-color-btn").on("click", function() {
			self.showColorPicker();
		});

		// 文本输入框后面提示
		$(".text-color-remind-container").on("click", function(e) {
			$(this).parent().find("input").first().click();
			e.stopPropagation();
		});
	},
	// 显示
	show: function(targetObj, name) {
		this.targetObj = targetObj;
		var color = $(targetObj).attr("name");
		// 高亮颜色
		if (color) {
			color = color.toUpperCase();
			if ($(".text-color-block[name='"+color+"']").length > 0) {
				$(".text-color-block[name='"+color+"']").addClass("active").siblings().removeClass("active");
			} else {
				this.previewColor(color, true);
				$("#text-color-btn").addClass("active").siblings().removeClass("active");
				$("#text-color-btn").attr("name", color);
			}
		} else {
			$(".text-color-block-container").children().removeClass("active");
		}
		// 显示名字
		$(".text-color-title .name").text(name);
		$(".text-color-block").text(name);
		// 显示面板
		$(".text-panel").removeClass("hidden").siblings().addClass("hidden");
	},
	// 隐藏
	hide: function() {
		$(".activity-panel").removeClass("hidden").siblings().addClass("hidden");
	},
	// 预览颜色
	previewColor: function(color, showTag) {
		if (!self.currentColor) {
			self.currentColor = color;
			showTag = false;
		}
		if (!showTag) {
			$("#text-color-btn").css({
				"color": color,
				"background-image": "url('//24haowan-cdn.shanyougame.com/public/images/web/bg-text-block.png')",
				"background-repeat": "repeat",
				"background-size": "contain",
				"background-color": "#F3F3F3"
			});
			$("#text-color-btn").off("mouseenter mouseleave");
			$("#text-color-btn").hover(function() {
			    $(this).css({
					"color": color,
					"background-image": "url('//24haowan-cdn.shanyougame.com/public/images/web/bg-text-block.png')",
					"background-repeat": "repeat",
					"background-size": "contain",
					"background-color": "#F3F3F3"
				});
			}, function() {
			    $(this).css({
					"color": color,
					"background-image": "url('//24haowan-cdn.shanyougame.com/public/images/web/bg-text-block.png')",
					"background-repeat": "repeat",
					"background-size": "contain",
					"background-color": "#F3F3F3"
				});
			});
		}
	},
	// 更换颜色
	changeTextColor: function(color) {
		$(this.targetObj).attr("name", color);
		var id = $(this.targetObj).attr("id");
		var key;
		if (id.indexOf("game-title-text") > -1) { // 活动名称
			platform_config["style"]["game-title-color"] = color;
			$('.game-title-color').css('color', color);
		} else if (id.indexOf("game-wechat-text") > -1) { // 分享登录文案
			platform_config["style"]["share-text-color"] = color;
			$('.game-wechat-text').css('color', color);
		} else if (id.indexOf("brand-text") > -1) {
			platform_config["style"]["brand"]["brand-text"] = color;
			$('.icon').css('color', color);
		}
		workBench.save();
	},
	// 显示选择颜色面板
	showColorPicker: function(color) {
		var self = this;
		$("#text-color-kit").spectrum({
		    allowEmpty: false,
		    color: self.currentColor,
		    showInput: true,
		    containerClassName: "full-spectrum",
		    showInitial: false,
		    showPalette: false,
		    showAlpha: false,
		    preferredFormat: "hex",
		    show: function() {
		    	self.selectingColor = true;
		    },
		    move: function(_color) {
		    	var color = _color.toHexString().toUpperCase();
		    	self.previewColor(color);
		    	self.currentColor = color;
		    },
		    hide: function() {
		    	self.selectingColor = false;
		    	$("#text-color-kit").spectrum('destroy');
		    	$("#text-color-kit").css("display", "none");
		    },
		    change: function(_color) {
		    	var color = _color.toHexString().toUpperCase();
		    	self.previewColor(color);
		    	self.currentColor = color;
		    }
		});
		$(".sp-choose").on("click", function() {
			self.changeTextColor(self.currentColor);
			$("#text-color-btn").addClass("active").siblings().removeClass("active");
		});
		$("#text-color-kit").spectrum('show');
	}
};

/* 纯色修改面板 */
var ColorPanel = function() {
	this.bindEvents();
};
ColorPanel.prototype = {
	targetObj: null,
	colors: [],
	selectingColor: false,
	currentColor: null,

	// 绑定事件
	bindEvents: function() {
		var self = this;
		$(".custom-pure-color .color").on("click", function(e) {
			self.show($(this).parent());
			e.stopPropagation();
		});

		$("body").on("click", function() {
			if (!self.selectingColor && !workBench.assetsPanel.selectingColor) self.hide();
		});

		// 颜色块
		$(".color-panel .color-block").on("click", function() {
			self.changeColor($(this).attr("name"));
			$(this).addClass("active").siblings().removeClass("active");
		});

		// 自定义颜色
		$("#color-btn").on("click", function() {
			self.showColorPicker();
		});
	},
	// 显示
	show: function(targetObj) {
		this.targetObj = targetObj;
		var color = $(targetObj).find(".color").attr("name");
		// 高亮颜色
		if (color) {
			color = color.toUpperCase();
			if ($(".color-panel .color-block[name='"+color+"']").length > 0) {
				$(".color-panel .color-block[name='"+color+"']").addClass("active").siblings().removeClass("active");
			} else {
				this.previewColor(color, true);
				$("#color-btn").addClass("active").siblings().removeClass("active");
				$("#color-btn").attr("name", color);
			}
		} else {
			$(".color-block-container").children().removeClass("active");
		}
		// 显示名字
		var name = $(this.targetObj).find(".text-title").text();
		$(".color-panel .color-title .name").text(name);
		// 显示面板
		$(".color-panel").removeClass("hidden").siblings().addClass("hidden");
	},
	// 隐藏
	hide: function() {
		$(".activity-panel").removeClass("hidden").siblings().addClass("hidden");
	},
	// 预览颜色
	previewColor: function(color, showTag) {
		if (!self.currentColor) {
			self.currentColor = color;
			showTag = false;
		}
		if (!showTag) {
			$("#color-btn").css({
				"background": color,
				"border-color": color,
				"color": "white"
			});
			$("#color-btn").off("mouseenter mouseleave");
			$("#color-btn").hover(function() {
			    $(this).css({
			    	"background-color": color,
			    	"border-color": color
			    });
			}, function() {
			    $(this).css({
			    	"background-color": color,
			    	"border-color": color
			    });
			});
		}
	},
	// 更换颜色
	changeColor: function(color) {
		$(this.targetObj).find(".color").attr("name", color).css("background", color);
		var id = $(this.targetObj).attr("id").split("color-")[1];
		if (id == "barColor") {
			platform_config["style"]["barColor"] = color;
			$(".bar").css("background-color", color);
		} else {
			platform_config["game"]["color"][id] = color;
		}
		workBench.save();
	},
	// 显示选择颜色面板
	showColorPicker: function(color) {
		var self = this;
		$("#color-kit").spectrum({
		    allowEmpty: false,
		    color: self.currentColor,
		    showInput: true,
		    containerClassName: "full-spectrum",
		    showInitial: false,
		    showPalette: false,
		    showAlpha: false,
		    preferredFormat: "hex",
		    show: function() {
		    	self.selectingColor = true;
		    },
		    move: function(_color) {
		    	var color = _color.toHexString().toUpperCase();
		    	self.previewColor(color);
		    	self.currentColor = color;
		    },
		    hide: function() {
		    	self.selectingColor = false;
		    	$("#color-kit").spectrum('destroy');
		    	$("#color-kit").css("display", "none");
		    },
		    change: function(_color) {
		    	var color = _color.toHexString().toUpperCase();
		    	self.previewColor(color);
		    	self.currentColor = color;
		    }
		});
		$(".sp-choose").on("click", function() {
			self.changeColor(self.currentColor);
			$("#color-btn").addClass("active").siblings().removeClass("active");
		});
		$("#color-kit").spectrum('show');
	}
};

/* 公众号授权 */
var AuthModal = function() {
	this.bindEvents();
};
AuthModal.prototype = {
	// 绑定事件
	bindEvents: function() {
		var self = this;
		$("#auth-modal .btn-close").on("click", function() {
			self.hide();
		});
		$("#btn-auth-complete").on("click", function() {
			location.reload();
		});
	},
	// 显示
	show: function() {
		$("#auth-modal").fadeIn(300);
	},
	// 隐藏
	hide: function() {
		$("#auth-modal").fadeOut(300);
	}
}

/* 公众号授权异常 */
var AuthErrorModal = function() {
	this.bindEvents();
};
AuthErrorModal.prototype = {
	// 绑定事件
	bindEvents: function() {
		var self = this;
		$("#auth-error-cancel").on("click", function() {
			self.hide();
		});
	},
	// 显示
	show: function() {
		$("#auth-error-modal").fadeIn(300);
	},
	// 隐藏
	hide: function() {
		$("#auth-error-modal").fadeOut(300);
	}
};