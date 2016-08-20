/*-------------------------------------------

			  touch事件定义

-------------------------------------------*/
var touch = 'click';
if ('ontouchstart' in document.documentElement || (window.navigator.maxTouchPoints && window.navigator.maxTouchPoints >= 1)) {
    touch = 'tap';
}



/*-------------------------------------------

			  提交失败

-------------------------------------------*/
// 重试
$("#btn-submit-again").on(touch, function() {
    $("#modal-submit-error").hide();
    var request = $("#btn-submit-again").attr("name");
    if (request == "score") {
        sendGameScore();
    } else if (request == "lottery") {
        sendLottery(last_callback);
    }
});
// 返回
$("#btn-back-to-home").on(touch, function() {
    $("#modal-submit-error").hide();
    // 跳转
    var change = $("#btn-back-to-home").attr("name");
    if (change == "start-menu") {
        $('#start-menu').show();
    }
});


/*-------------------------------------------

			  弹出框相关

-------------------------------------------*/
// 对话框队列
var alertbox = [];

// 对话框关闭按钮
$('.close-btn').on(touch, function(e) {
    var dialog = $(this).parent();
    var mask = dialog.parent();
    fadeOutUp(mask);
    e.stopPropagation();
});

// 排行榜关闭按钮
$('.rankClose').on(touch, function(e) {
    var dialog = $(this).parent().parent();
    var mask = dialog.parent();
    fadeOutUp(mask);
    e.stopPropagation();
});

// 隐藏弹出框内容
function fadeOutUp(mask) {
    var dialog = mask.children();
    dialog.addClass('animated fadeOutUp');
    if (alertbox.length > 0) {
        alertbox.shift();
        if (alertbox.length > 0) {
            fadeInDown(alertbox[0]);
        }
    }
    setTimeout(function() {
        mask.hide();
        dialog.removeClass('animated fadeOutUp');
    }, 1000);
}

// 显示弹出框内容
function fadeInDown(mask) {
    mask.show();
    var dialog = mask.children();
    dialog.addClass('animated fadeInDown');
    setTimeout(function() {
        dialog.removeClass('animated fadeInDown');
    }, 1000);
}

// 显示弹出框
function showBox() {
    if (alertbox.length > 0) {
        fadeInDown(alertbox[0]);
    }
}

// 显示提示
function showMessage(obj) {
    $("#message-mask .message-box").text(obj.text);
    $('#message-mask').show();
    setTimeout(function() {
        $('#message-mask').hide();
    }, obj.time || 3000);
}



/*-------------------------------------------

			  测试版本提示相关

-------------------------------------------*/
// 关闭按钮
$(".test-remind-close").on(touch, function() {
    $(".test-remind-div").hide();
});
// 显示测试版本提示
if ((game_test == 1) && (location.hash != "#publish") && (location.hash != "#wait")) {
    $(".test-remind-div").show();
}



/*-------------------------------------------

				悬浮窗按钮

-------------------------------------------*/
// 是否正在移动悬浮窗标记
var giftcenter_moving = false;

// 绑定点击结束事件
$('.btn-giftcenter').on("touchend", function(e) {
    if (!giftcenter_moving) { // 已停止
        if (gift_center_data.length > 1) { // 奖品多于一个，显示列表
            showGiftCenter();
        } else { // 奖品只有一个，显示单个
            if (toread == 1) { // 只有这个未读了，发送已读信息
                sendReadGift(toread_arr[0]);
            }
            setSingleGift(gift_center_data[0]);
            showGiftCenterSingle();
        }
    } else { // 刚拖动完
        giftcenter_moving = false;
        // 靠边
        var x = last_giftcenter_location.x;
        var y = last_giftcenter_location.y;

        var location = ["left", "top"];
        if (x > game_width / 2) location[0] = "right";
        if (y > game_height / 2) location[1] = "bottom";
        var delta_x = game_width / 2 - Math.abs(game_width / 2 - x);
        var delta_y = game_height / 2 - Math.abs(game_height / 2 - y);
        var last_location = location[0];
        if (delta_x > delta_y) last_location = location[1];

        if (last_location == "left") {
            x = 30;
        } else if (last_location == "right") {
            x = game_width - 30;
        } else if (last_location == "top") {
            y = 30;
        } else if (last_location == "bottom") {
            y = game_height - 30;
        }
        var _x = x / 60 * 100;
        var _y = -(game_height - y) / 60 * 100;
        $(".btn-giftcenter").css({
            "transform": "translate3d(" + _x + "%, " + _y + "%, 0)",
            "-webkit-transform": "translate3d(" + _x + "%, " + _y + "%, 0)"
        });
    }
    e.stopPropagation();
});

// 最后位置
var last_giftcenter_location = {};

// 绑定移动事件
$('.btn-giftcenter').on('touchmove', function(e) {
    if (e.touches) {
        giftcenter_moving = true;
        var x = e.touches[0].clientX;
        var y = e.touches[0].clientY;
        x = x < 30 ? 30 : x;
        x = x > game_width - 30 ? game_width - 30 : x;
        y = y < 30 ? 30 : y;
        y = y > game_height - 30 ? game_height - 30 : y;
        last_giftcenter_location.x = x;
        last_giftcenter_location.y = y;
        var _x = x / 60 * 100;
        var _y = -(game_height - y) / 60 * 100;
        $(".btn-giftcenter").css({
            "transform": "translate3d(" + _x + "%, " + _y + "%, 0)",
            "-webkit-transform": "translate3d(" + _x + "%, " + _y + "%, 0)"
        });
    }
    e.stopPropagation();
    e.preventDefault();
});

// 绑定开始点击事件
$('.btn-giftcenter').on("touchstart", function(e) {
    if (giftcenter_moving) giftcenter_moving = false;
});


/*-------------------------------------------

				奖品中心界面

-------------------------------------------*/
// 游戏名称
$(".giftcenter-container .game-name").text(game_info['name']);

// 商户名称
$(".giftcenter-container .m-name").text(game_info['m_name']);

// 奖品中心关闭按钮
$('.giftcenter-container .btn-close').on(touch, function(e) {
    hideGiftCenter();
    e.stopPropagation();
});

// 显示
function showGiftCenter() {
    $(".giftcenter-container").removeClass("hidden");
    setTimeout(function() {
        $(".giftcenter-container").removeClass("bounceInUp");
    }, 1000);
}

// 隐藏
function hideGiftCenter() {
    $(".giftcenter-container").addClass("bounceOutDown");
    setTimeout(function() {
        $(".giftcenter-container").addClass("hidden").removeClass("bounceOutDown").addClass("bounceInUp");
    }, 1000);
}



/*-------------------------------------------

				奖品详情界面

-------------------------------------------*/
// 奖品队列
var gift_to_show = [];

// 是否显示兑奖详情按钮
if (game_info['prize_url']) {
    if (game_info['prize_url'] == "http://") {
        $(".giftcenter-container .desc").removeClass("hidden");
    } else {
        $(".giftcenter-container .desc").addClass("hidden");
        $(".giftcenter-btn").removeClass("hidden").attr("href", game_info['prize_url']);
    }
} else {
    $(".giftcenter-container .desc").removeClass("hidden");
}

// 关闭按钮
$('.giftcenter-container-single .btn-close').on(touch, function(e) {
    hideGiftCenterSingle();
    alertbox.shift();
    showBox();
    e.stopPropagation();
});

// 显示
function showGiftCenterSingle() {
    $(".giftcenter-container-single").removeClass("hidden");
    // 判断是否出现滑动提示
    if (!localStorage["24haowan_giftcenter_scroll"] && $(".giftcenter-container-single .content")[0].scrollHeight > game_height) {
        $("#giftcenter-arrow-down").show();
        $(".giftcenter-container-single .content").on("scroll", giftCenterSingleScroll);
    }
    // 是否将底部UI浮起
    if ($(".giftcenter-container-single .content")[0].scrollHeight > game_height) {
        $(".giftcenter-bottom-single").removeClass("over");
    } else {
        $(".giftcenter-bottom-single").addClass("over");
    }
    setTimeout(function() {
        $(".giftcenter-container-single").removeClass("bounceInUp");
    }, 1000);
}

// 隐藏
function hideGiftCenterSingle() {
    $(".giftcenter-container-single").addClass("bounceOutDown");
    setTimeout(function() {
        $(".giftcenter-container-single").addClass("hidden").removeClass("bounceOutDown").addClass("bounceInUp");
    }, 1000);
}

// 滚动事件
function giftCenterSingleScroll() {
    var scrollTop = $(".giftcenter-container-single .content")[0].scrollTop;
    if (scrollTop > 10) {
        localStorage["24haowan_giftcenter_scroll"] = "yes";
        $("#giftcenter-arrow-down").hide();
        $(".giftcenter-container-single .content").off("scroll", giftCenterSingleScroll);
    }
}

// 设置单个奖品的信息
function setSingleGift(data) {
    var barcode_tag = true; // 默认显示条形码
    // 红包特殊处理
    if (data.rp_type) {
        if (data.rp_type == 2 || data.rp_type == 3) {
            data.gift_name += "(" + data.rp_total + "元)";
            barcode_tag = false;
        }
        if (data.rp_type == 2) {
            data.gift_img = "/images/t/giftmoney-common-opened.png";
        } else if (data.rp_type == 3) {
            data.gift_img = "/images/t/giftmoney-common-opened.png";
        }
    }
    // $(".giftcenter-container-single .img-head").attr("src", data.headimgurl); // 头像
    // $(".giftcenter-container-single .nickname").text(data.name); // 用户昵称
    $(".giftcenter-container-single .gift-img").attr("src", data.gift_img); // 奖品图片
    $(".giftcenter-container-single .gift-name").text(data.gift_name); // 奖品名称
    $(".giftcenter-container-single .game-name").text(game_info['name']); // 游戏名称
    // $(".giftcenter-container-single .m-name").text(game_info['m_name']); // 商户名称
    $(".giftcenter-container-single .gift-get-time").text(data.create_time.slice(0, 16)); // 获奖时间
    // 生成条形码
    if (barcode_tag && data.code) {
        var code = data.code.toString()
        $("#barcode").barcode(code, "ean13", { barWidth: 2, barHeight: 35, showHRI: false });
        $(".barcode-block").removeClass("hidden");
        $(".barcode-text").text("兑换码 " + code);
    }
    // 获奖条件
    // var gift_condition;
    // if (data.gift_type == 1) {
    // 	gift_condition = "按排名获奖 第"+data.rank+"名";
    // } else if (data.gift_type == 3) {
    // 	gift_condition = "分享即可获奖";
    // } else if (data.gift_type == 4) {
    // 	gift_condition = "参与即可获奖";
    // } else if (data.gift_type == 5) {
    // 	gift_condition = "抽奖获奖";
    // }
    // $(".giftcenter-container-single .gift-condition").text(gift_condition);
    // 额外抽奖机会提示
    if (data.add_chance == "yes") {
        $(".giftcenter-container-single .gift-remind").text("分享后还可以获得一次抽奖机会噢！");
    } else {
        $(".giftcenter-container-single .gift-remind").text("");
    }
    // 兑奖方式
    $(".gift-check-way").css("display", "none"); // 隐藏所有兑奖方式
    $(".giftcenter-container-single .giftcenter-btn").css("display", "none"); // 隐藏点击兑奖按钮
    var check_info = (data.check_info) ? (data.check_info.length > 0 ? JSON.parse(data.check_info) : {}) : {};
    var default_desc;
    if (data.check_way == 0) { // 无需兑奖
        $(".gift-check-way[name='none']").css("display", "-webkit-box");
        default_desc = "活动结束后，我们将会主动与你联系发放活动奖品。";
    } else if (data.check_way == 1) { // 线下兑奖
        $(".gift-check-way[name='offline']").css("display", "-webkit-box");
        $(".gift-check-way[name='offline'] .gift-address").text(check_info["address"]);
        $(".gift-check-way[name='offline'] .gift-phone").text(check_info["phone"]);
        default_desc = "请携带奖品兑换码前往以上地址领取奖品。";
    } else if (data.check_way == 2) { // 网址兑奖
        // $(".gift-check-way[name='link']").css("display", "-webkit-box");
        // $(".gift-check-way[name='link'] .gift-link").text(check_info["link"]);
        $(".giftcenter-container-single .giftcenter-btn").text("点击兑奖");
        $(".giftcenter-container-single .giftcenter-btn").css("display", "block");
        $(".giftcenter-container-single .giftcenter-btn").attr("href", check_info["link"]);
        default_desc = "点击以下链接前往兑奖网页，领取奖品。";
    } else if (data.check_way == 3) { // 公众号兑奖
        $(".gift-check-way[name='qrcode']").css("display", "block");
        $(".gift-check-way[name='qrcode'] .gift-qrcode").attr("src", check_info["qrcode"]);
        $(".giftcenter-container-single .desc").addClass("hidden");

        default_desc = "关注公众号，联系客服领取奖品。";
    }

    // 兑奖说明
    var desc = check_info.desc;
    if (!desc) desc = default_desc;
    $(".gift-detail-block .gift-desc").text(desc);
    $(".giftcenter-container-single .desc").addClass("hidden");

    // 有关核销，兑奖链接的处理
    if (data.check != "none") {
        if (data.check == "yes") { // 已核销
            $(".giftcenter-container-single .giftcenter-btn").addClass("verified").text("已核销").removeAttr("href").css("display", "block");
        } else if (data.check == "no") {
            if (data.check_way != 2) {
                $(".giftcenter-container-single .giftcenter-btn").removeClass("verified").text("点击兑奖").css("display", "none");
            }
        }
    }
}

// 获得单个奖品
function getSingleGift() {
    if (gift_to_show.length > 0) {
        var data = gift_to_show.shift();
        sendReadGift(data.gift_record_id);
        setSingleGift(data);
        showGiftCenterSingle();
    }
}

// 发送已读通知
var toread = 0;
var toread_arr = [];

function sendReadGift(log_id) {
    $(".giftcenter-container .gift-item-container .not-read[name='" + log_id + "']").removeClass("not-read").attr("name", "");
    if (toread_arr.indexOf(log_id) > -1) {
        toread_arr.splice(toread_arr.indexOf(log_id), 1);
        toread--;
        if (toread <= 0) {
            $(".toread-num").addClass("hidden");
        } else {
            $(".toread-num").text(toread).removeClass("hidden");
        }
    }
    $.ajax({
        url: '/GameAjax/ReadGiftInfo',
        type: 'post',
        dataType: 'json',
        data: { id: log_id },
    });
}

// 显示奖品详情 根据record_id
function showSingleGiftByRecordId(record_id) {
    if (record_id) {
        var data;
        for (var index in gift_center_data) {
            var current_id = (gift_center_data[index]["gift_record_id"]) ? gift_center_data[index]["gift_record_id"] : gift_center_data[index]["id"];
            if (current_id == record_id) {
                data = gift_center_data[index];
                break;
            }
        }
        setSingleGift(data);
        showGiftCenterSingle();
    } else {
        return false;
    }
}



/*-------------------------------------------

				 开始界面

-------------------------------------------*/
// 开始按钮
$('#start-menu .game-start-btn').on(touch, function() {
    if (game_type == 1 || game_type == 4) { // 得分类、通关类
        if (game_info["tpl_id"] == 37) {
            gameManager.play();
        } else {
            game.state.start('play');
        }
        $('#start-menu').hide();
        $('.btn-giftcenter').hide();
        // 记录用户行为
        $("body").on('touchstart', userTouchRecord);
        $("body").on('touchmove', userTouchRecord);
        user_touch_records.push({ s: new Date().getTime() });
    } else if (game_type == 2) { // 抽奖类
        if (left_times > 0) { // 还有抽奖机会
            if (typeof gameStart != "undefined") { // 摇一摇抽大奖
                gameStart();
            } else {
                gameManager.play();
            }
            $('#start-menu').hide();
            $('.btn-giftcenter').hide();
        } else { // 已经没有抽奖机会
            fadeInDown($("#times-box-mask"));
            if (gift_config[0]["add_chance"]) { // 有额外分享机会
                if (gift_center_data.length < 2) { // 只获得了一个奖品
                    $(".lottery-share-remind").removeClass("hidden");
                }
            }
        }
    } else if (game_type == 3) { // 得分类dom
        gameManager.play();
        $('#start-menu').hide();
        $('.btn-giftcenter').hide();
        // 记录用户行为
        $("body").on('touchstart', userTouchRecord);
        $("body").on('touchmove', userTouchRecord);
        user_touch_records.push({ s: new Date().getTime() });
    }
});

// 活动规则按钮
$('#start-menu .game-rule-btn').on(touch, function() {
    fadeInDown($('#text-box-mask'));
});

// 排行榜按钮
$('#start-rank-btn').on(touch, function() {
    if (!$(this).hasClass("disabled")) showRank();
});

// 禁止滑动
$('#start-menu').on('touchmove', function(e) {
    e.preventDefault();
    e.stopPropagation();
});



/*-------------------------------------------

				  结束界面

-------------------------------------------*/
// 再玩一次按钮
$('.game-over-menu .play-again-btn').on(touch, function() {
    if (game_type == 1 || game_type == 4) { // 得分类
        if (game_info["tpl_id"] == 37) {
            gameManager.replay();
        } else {
            game.state.start('play');
            game.paused = false;
        }
        $('.game-over-menu').hide();
        $('.btn-giftcenter').hide();
        // 记录用户行为
        $("body").on('touchstart', userTouchRecord);
        $("body").on('touchmove', userTouchRecord);
        user_touch_records.push({ s: new Date().getTime() });
    } else if (game_type == 2) { // 抽奖类
        if (left_times > 0) { // 还有抽奖机会
            if (typeof gameStart != "undefined") {
                gameStart();
            } else {
                gameManager.replay();
            }
            $('.game-over-menu').hide();
            $('.btn-giftcenter').hide();
        } else { // 没有抽奖机会
            fadeInDown($("#times-box-mask"));
        }
    } else if (game_type == 3 || game_type == 5) { // 得分类/生成类 dom
        gameManager.replay();
        $('.game-over-menu').hide();
        $('.btn-giftcenter').hide();
        // 记录用户行为
        $("body").on('touchstart', userTouchRecord);
        $("body").on('touchmove', userTouchRecord);
        user_touch_records.push({ s: new Date().getTime() });
    }
});

// 禁止滑动
$('.game-over-menu').on('touchmove', function(e) {
    e.preventDefault();
    e.stopPropagation();
});

// 排行榜按钮 
$('#game-over-rank-btn').on(touch, function() {
    if (!$(this).hasClass("disabled")) showRank();
});

// 左上角排行榜按钮
$('.game-over-menu .rank-btn').on(touch, function() {
    if (!$(this).hasClass("disabled")) showRank();
});

// 分享按钮
$('.game-over-menu .share-btn').on(touch, function() {
    $('.shareMask').show();
});

// 活动规则按钮
$('.game-over-menu .game-rule-btn').on(touch, function() {
    fadeInDown($('#text-box-mask'));
});

// 我要抽奖按钮
$('.game-over-menu .lottery-btn').on(touch, function() {
    if (canLottery()) fadeInDown($("#lottery-mask")); // 显示抽奖框
});

// 获取抽奖条件
function canLottery() {
    if (gift_config) {
        var lottery_config;
        for (var index in gift_config) {
            if (gift_config[index]["type"] == 5) {
                lottery_config = gift_config[index];
                break;
            }
        }
        if (lottery_config) {
            // 根据条件判断
            var condition = lottery_config["condition"];
            if (condition == "score") { // 按得分
                if (parseInt(bestScore) <= parseInt(lottery_config["score"])) {
                    var remind_text;
                    if (game_type == 1 || game_type == 3) { // 得分类
                        remind_text = "分数超过" + lottery_config["score"] + "分才可以抽奖噢！";
                    } else if (game_type == 5) {
                        if (tpl_info["section"] == 1) {
                            remind_text = "完成关卡后才可以抽奖噢！";
                        } else {
                            remind_text = "完成第" + lottery_config["score"] + "关后才可以抽奖噢！";
                        }
                    }
                    showMessage({ time: 3000, text: remind_text });
                    return false;
                }
            } else if (condition == "share") { // 按分享
                if (share_times <= 0) {
                    showMessage({ time: 3000, text: "将活动分享出去后才可以抽奖噢！" });
                    return false;
                }
            }
            // 抽奖次数判断
            if (left_times > 0) {
                return true;
            } else if (lottery_add_chance_tag) { // 没有抽奖次数，但额外分享可以获得一次抽奖(以服务端为准)
                showMessage({ time: 3000, text: "您的抽奖次数已用完，分享后还可获得一次额外机会。" });
                return false;
            } else { // 没有抽奖次数(以服务端为准)
                showMessage({ time: 3000, text: "您的抽奖次数已用完。" });
                return false;
            }
        } else { // 没有配置抽奖
            return false;
        }
    } else { // 没有配置奖品
        return false;
    }
}


// 抽奖类-结束界面图片
$(".gift-has-container .game-img").on(touch, function() {
    if (game_type == 2) {
        var record_id = $(this).attr("name");
        showSingleGiftByRecordId(record_id);
    }
});



/*-------------------------------------------

				  排行榜界面

-------------------------------------------*/
// 更多好友排行
$('.moreFirend').on(touch, function() {
    if ($(this).attr('data-touch') == 'true') {
        var pages = parseInt($(this).attr('data-num'));
        var type = 2;
        moreRankStr(pages, type, $(this));
    }
});

// 更多玩家排行
$('.morePlayer').on(touch, function() {
    if ($(this).attr('data-touch') == 'true') {
        var pages = parseInt($(this).attr('data-num'));
        var type = 1;
        moreRankStr(pages, type, $(this));
    }
});



/*-------------------------------------------

					分享

-------------------------------------------*/
// 分享蒙版页面
$('.shareMask').on(touch, function() {
    $(this).hide();
});

// 新高分弹出框 分享给好友按钮
$('#record-mask .share').on(touch, function() {
    $('.shareMask').show();
    e.stopPropagation();
});

// 分享蒙版
$("#record-mask").on(touch, function() {
    fadeOutUp($('#record-mask'));
})

// 禁止滑动
$('.shareMask').on('touchmove', function(e) {
    e.preventDefault();
    e.stopPropagation();
});



/*-------------------------------------------

				分享登录页

-------------------------------------------*/
// 分享登入页面
$('.share-sign-in .game-start-btn').on(touch, function() {
    $('.share-sign-in').hide();
    $('#start-menu').show();
});

// 禁止滑动
$('.share-sign-in').on('touchmove', function(e) {
    e.preventDefault();
    e.stopPropagation();
});



/*-------------------------------------------

				奖品弹出框

-------------------------------------------*/
// 普通奖品
$('.prize-box').on(touch, function() {
    $(this).parent().hide();
    getSingleGift();
});

// 获得抽奖机会（非抽奖类的才会显示这个框）
$('.lottery-box').on(touch, function() {
    sendLottery(); // 发送抽奖请求
});

// 红包奖品
$('.giftmoney-box').on(touch, function() {
    $(this).parent().hide();
    getSingleGift();
});

// 没有获得奖品 分享按钮
$("#get-prize-none-mask .gift-remind-btn").on("click", function() {
    fadeOutUp($("#get-prize-none-mask"));
    $('.shareMask').show();
});



/*-------------------------------------------

				提交表单

-------------------------------------------*/
$('#submit').off(touch).on(touch, function() {
    var name = {};
    var finish = true; //标注是否为空
    $('#form-mask .label-box input').each(function(k, v) {
        if (finish == true) {
            if (v.value.trim() == '') {
                finish = false;
                showMessage({ time: 3000, text: '您还未填写:' + v.getAttribute('data-key') });
            } else {
                name[v.getAttribute('data-key')] = v.value;
            }
        }
    });
    if (finish == true) { // 信息无误
        // 禁止输入框再输入，并取消焦点
        $('#form-mask .label-box input').prop("disabled", true).prop("readonly", true).blur();
        document.activeElement.blur();

        // 发送信息
        $.ajax({
            url: "/GameAjax/CollectUserInfo",
            data: { "game_id": game_info['game_id'], "name": JSON.stringify(name) },
            type: "POST",
            success: function(data) {
                data = JSON.parse(data);
                if (data['code'] == 0) {
                    form_info = 1;
                }
                fadeOutUp($('#form-mask'));
            },
            error: function(err) {
                console.log(err);
            }
        });
    }
});



/*-------------------------------------------

				记录用户行为

-------------------------------------------*/
var user_touch_records = []; // 用户数据
var last_move_record_time; // 最后滑动记录时间

// 记录用户数据
function userTouchRecord(e) {
    var tag = true;
    var type = (e.type == "touchstart") ? "s" : "m";
    var timestamp = new Date().getTime();
    if (!last_move_record_time) {
        last_move_record_time = timestamp;
    } else {
        if (type == "m" && (timestamp - last_move_record_time) < 100) tag = false;
        last_move_record_time = timestamp;
    }
    if (tag) {
        timestamp = timestamp.toString().slice(5, 13);
        var item = [timestamp, type];
        if (e.touches) {
            if (e.touches.length > 0) {
                var touch_locations = [];
                for (var i = 0; i < e.touches.length; i++) {
                    touch_locations.push(e.touches[i].clientX);
                    touch_locations.push(e.touches[i].clientY);
                    touch_locations.push(e.touches[i].screenX);
                    touch_locations.push(e.touches[i].screenY);
                }
                item.push(touch_locations);
            }
        }
        user_touch_records.push(item);
    }
}

// 上传记录
function uploadLog() {
    var logger = new window.Tracker('cn-shenzhen.log.aliyuncs.com', '24haowan-game-play', 'play_log');
    var data = JSON.stringify(user_touch_records);
    data = data.slice(0, 10000);
    logger.push('game_id', game_info["game_id"]);
    logger.push('user_id', userId);
    logger.push('data', data);
    logger.logger();
    user_touch_records = [];
}



/*-------------------------------------------

			暂停蒙版（工作台才显示）

-------------------------------------------*/
if (configJson["mobileOnly"]) {
    $(".pause-mask-cnt").text("此活动需使用手机特性，请扫码体验。");
} else {
    $(".pause-mask").on(touch, function() {
        $(".pause-mask").hide();
        if (game) {
            game.paused = false;
        } else if (gameManager) {
            // 在原本基础上加这行代码,控制DOM框架的暂停
            //特殊处理
            if (game_info["tpl_id"] != 37 && game_info["tpl_id"] != 35) {
                gameManager.play();
            }
        }

    });
}
