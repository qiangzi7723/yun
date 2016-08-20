/**-----------------------------------------------
 *
 * 抽奖类游戏框架 DOM
 * game_tpl type=4
 *
 * 注意事项（请仔细阅读）：
 * 1.获取窗口大小window.innerWidth、window.innerHeight时，使用game_width, game_height来代替，本地开发时将自定义这两个变量。
 * 2.注释带“测试用”的代码块要认真阅读，如无特别说明，上线时应将代码块注释。
 * 3.注释带“上线用”的代码块要认真阅读，如无特别说明，上线时应取消代块的注释。
 * 4.游戏场景基本分为加载（preload）、开始（create）、游戏（play）、结束（end），实际情况则根据游戏内容而定，开发时要注意场景之间切换所需要做的操作。
 * 5.接入平台后能获取的全局变量说明：（以下参数请勿修改）
 *        game_width     Number        游戏宽度
 *        game_height  Number    游戏高度
 *        case_tag     Boolean    是否为案例
 *        skip         Boolean    是否跳过开始界面和结束界面，并循环游戏
 *        configJson     Object        游戏配置表
 *        tpl_info     Object        模板信息（数据库表：game_tpl）
 *        game_info    Object        游戏信息（数据库表：custom_game）
 *        bestScore     Number        最高得分/关卡数（抽奖类可忽略）
 *        game_test     Number        0-正式环境 1-测试环境
 *        gift_config     Array        游戏奖品配置
 *        game_type     Number        游戏类型（对应game_tpl中的type）
 *        best_rank     Number        最高排名（通关类、抽奖类可忽略）
 *        play_times     Number        游戏次数
 *        left_times     Number        剩余可游戏次数（若为-1，则表示无限次）
 *        first_play     Number        0-不是第一次游戏 1-第一次游戏
 * 6.新建游戏配置表请务必注意复制的是不是最新的配置，以免有字段的遗漏或丢失。
 *
 * 关于平台调用游戏操作：
 * 1.开始按钮（仅当left_times > 0时）
 *        gameManager.play();
 * 2.再抽一次按钮（仅当left_times > 0时）
 *        gameManager.replay();
 * 3.分享获得额外一次抽奖机会，点击奖品时
 *        gameManager.replay();
 *
 * 关于游戏调用平台操作：
 * 1.加载完毕，显示提示框
 *        showBox()
 * 2.抽奖结束回调（如大转盘、刮刮乐等需要延后显示结束页面的才需要调用）
 *        lotteryEnd()
 *
 * 关于平台的接入，请参考文档：
 * https://docs.google.com/document/d/1wJZly0FEdk5rYvRNmh2wclIWEBBz_N8ayYrik1wLZ-U/edit
 *
 * 关于framework的维护：
 * 1.如有对framework进行修改，则须在提交SVN前跟开发人员说明，以免造成沟通上的失误。
 * 2.如有新的注意事项，请添加到头部的代码说明中。
 *
 * -----------------------------------------------*/

// 测试用 - 启动游戏
var gameManager;
$(document).ready(function () {
    gameManager = new Game(0, {}, 'game_div');
    gameManager.init();
});
var game_width = window.innerWidth;
var game_height = window.innerHeight;

var Game = function (bestScore, config, domId) {
    // this.bestScore = bestScore || 0;
    this.config = config;
    this.domId = domId || '';
};
Game.prototype = {
    // 初始化标记
    isInit: false,
    // 插入的domId
    domId: null,
    // 设备信息
    device: {
        type: null,
        platform: null,
        width: 0,
        height: 0
    },
    // 游戏内容，方便重置游戏
    gameContent: null,
    // 音频
    audios: {},
    // 图片
    imgs: {},
    // 音乐是否已经播放过
    isPlayed: false,

    // 初始化-设备信息
    initDevice: function () {
        this.device.width = game_width;
        this.device.height = game_height;
        if (game_width > game_height) {
            this.device.width = game_height;
            this.device.height = game_width;
        }
        this.device.platform = (navigator.userAgent.toLowerCase().indexOf('android') < 0) ? 'apple' : 'android';
        this.device.type = (this.device.width > 700) ? 'pad' : 'mobile';
    },

    // 初始化-游戏
    init: function () {
        var self = this;
        // 初始化设备信息
        this.initDevice();
        // 设置已进入初始化阶段
        this.isInit = true;
        // 加载资源
        this.load();
    },

    // 加载资源
    load: function () {
        var self = this;

        // 上线用 - 配置表中游戏内容的配置
        // var config = this.config['game'];

        // 加载图片资源
        // 所有需要加载的图片资源都写到这里来
        this.imgs = {
            checkBox: "assets/image/checkBox3.png",
            bg: "assets/image/bg2.png",
            title: "assets/image/title.png",
            flash: "assets/image/flash.png",
            flash2: "assets/image/flash2.png",
            btn: "assets/image/btn.png",
            pull: "assets/image/pull.png",
            flashs: "assets/image/flashs.png",

            0: "assets/image/0.png",
            1: "assets/image/1.png",
            2: "assets/image/2.png",
            3: "assets/image/3.png",

            // branchImg: "//24haowan-cdn.shanyougame.com/jinhouyaotao/assets/img/2.png",
            // main_treeImg: "//24haowan-cdn.shanyougame.com/jinhouyaotao/assets/img/1.png",
            // leaf1Img: "//24haowan-cdn.shanyougame.com/jinhouyaotao/assets/img/4.png",
            // leaf2Img: "//24haowan-cdn.shanyougame.com/jinhouyaotao/assets/img/3.png",
            // groundImg: "//24haowan-cdn.shanyougame.com/jinhouyaotao/assets/img/7.png",
            // directionImg: "//24haowan-cdn.shanyougame.com/jinhouyaotao/assets/img/direction.png",
            // fallThingsImg: config['fallThingsImg'],
            // specileImg: config['specileImg'],
            // shakeRemindImg: "//24haowan-cdn.shanyougame.com/jinhouyaotao/assets/img/shake.png"
        };
        var imgLoaded = false;
        var currentLoadedImg = 0;
        var totalImg = Object.keys(this.imgs).length;
        for (var index in this.imgs) {
            if (this.imgs[index].indexOf("#") != 0) {
                var img = new Image();
                img.onload = img.onerror = function () {
                    ++currentLoadedImg;
                    $('.bar').width(2.6 * (0.8 * currentLoadedImg / totalImg + 0.2 * currentLoadedAudio / totalAudio) + 'rem');
                    if (currentLoadedImg == totalImg) {
                        imgLoaded = true;
                    }
                }
                img.src = this.imgs[index];
            } else {
                totalImg--;
            }
        }

        // 加载音频资源
        // 所有需要加载的音频资源都写到这里来
        var audioList = {
            // music_shake_sound: config['music_shake_sound'],
            // music_bg: config['music_bgm'],
            // music_clkGoldApple: config['music_clkGoldApple']
        };
        // 安卓系统只加载背景音乐
        if (this.device.platform == "android") {
            audioList = {
                // music_bg: config['music_bgm']
            };
        }

        var audioLoaded = false;
        var currentLoadedAudio = 0;
        var totalAudio = (this.device.platform == "android") ? 1 : Object.keys(audioList).length;
        for (var index in audioList) {
            this.audios[index] = new Audio();
            this.audios[index].addEventListener("canplaythrough", audioOnload, false);
            this.audios[index].src = audioList[index];
            this.audios[index].load();
        }
        // 音频加载完毕回调
        function audioOnload() {
            this.removeEventListener("canplaythrough", audioOnload);
            ++currentLoadedAudio;
            if (currentLoadedAudio <= totalAudio) {
                $('.bar').width(2.6 * (0.8 * currentLoadedImg / totalImg + 0.2 * currentLoadedAudio / totalAudio) + 'rem');
                if (currentLoadedAudio == totalAudio) {
                    audioLoaded = true;
                }
            }
        }

        // 加载时间锁，目的是为了让加载页至少停留3秒
        var loading_lock = true;
        setTimeout(function () {
            loading_lock = false;
            $('.bar').width('2.6rem');
            setTimeout(function () {
                // 进入create状态
                self.create();
            }, 500);
        }, 100);
    },

    // 开始状态
    create: function () {
        // 上线用 - 设置游戏背景
        // if (configJson["game"]["bg"].indexOf("#") != 0) {
        // 	$("#game_div").css({
        // 		"background-image": "url('"+configJson["game"]["bg"]+"')",
        // 		"background-color": "transparent"
        // 	});
        // } else {
        // 	$("#game_div").css({
        // 		"background-image": "none",
        // 		"background-color": configJson["game"]["bg"]
        // 	});
        // }

        // 设置游戏内容，用于快速复原


        this.gameContent = $("#" + this.domId).html();
        $("#game_div").css("background-image", "url(" + this.imgs["bg"] + ")");

        // 上线用 - 隐藏加载界面、显示开始界面、显示弹出框
        // 隐藏加载界面
        // $('#loading').hide();
        // 显示开始界面
        // if (skip) {
        // 	this.play();
        // } else {
        // 	showBox();
        // 	$('#start-menu').show();
        // }

        // 测试用 - 直接进入游戏
        this.play();
    },

    // 游戏状态
    play: function () {
        // 此处写游戏逻辑
        var self = this;

        // 移动端浏览器第一次播放音乐会有卡顿现象，音乐先播放一下可以解决此问题。
        if (!this.isPlayed) {
            for (var index in this.audios) {
                this.audios[index].muted = true;
                this.audios[index].play();
                this.audios[index].pause();
                this.audios[index].currentTime = 0;
                this.audios[index].muted = false;
            }
            this.isPlayed = true;
        }

        // 上线用 - 显示抽奖类游戏的抽奖次数
        // $(".times-text").text("剩余次数："+left_times+"次");

        // 禁止按住拖动事件
        document.getElementsByTagName('html')[0].ontouchmove = function (e) {
            e.preventDefault();
            e.stopPropagation();
        };

        // 上线用 - 抽奖接口，游戏结束时调用
        //    gift_data的数据如下：（方便游戏显示抽奖结果）
        // {
        // 	check: gameData['lottery'].check,
        // 	code: gameData['lottery'].code,
        // 	add_chance: gameData.add_chance,
        // 	rank: gameData.rank,
        // 	headimgurl: gameData.headimgurl,
        // 	name: gameData.user_name,
        // 	gift_img: gameData['lottery'].img,
        // 	gift_name: gameData['lottery'].name,
        // 	create_time: gameData.create_time,
        // 	gift_type: 5,
        // 	gift_id: gameData['lottery'].gift_id,
        // 	gift_record_id: gameData['lottery'].log_id,
        // 	check_way: gameData['lottery'].check_way,
        // 	check_info: gameData['lottery'].check_info
        // }
        // sendLottery(function(gift_data) {
        // 		alert("来自抽奖接口的回调");
        // });

        // 进入结束状态，具体进入时间由实际情况而定

        //老虎机背景
        var checkBox = $(".checkBox");
        checkBox.css("background-image", "url(" + this.imgs["checkBox"] + ")");
        //老虎机标题
        var title = $(".title");
        title.css("background-image", "url(" + this.imgs["title"] + ")");
        //老虎机灯光
        // var flash=document.getElementsByClassName("flash")[0];
        var flash = $(".flash");
        for (var i = 0; i < 10; i++) {
            if (i % 2) {
                flash.append("<div class='fs2'></div>")

            } else {
                flash.append("<div class='fs'></div>")
            }
        }



        // var flash = document.getElementsByClassName("flash")[0];
        // // flash.css("background-image", "url(" + this.imgs["flash"] + ")");
        // flash.style.backgroundImage="url(" + this.imgs["flashs"] + ")"
        // //灯光动画
        // var fls=true;
        // setInterval(function () {
        //     if(fls){
        //         flash.style.backgroundImage="url(" + self.imgs["flashs"] + ")"
        //         fls=false;
        //     }else{
        //         flash.style.backgroundImage="url(" + self.imgs["flashs"] + ")"
        //         fls=true;
        //     }
        // },1000);

        // window.requestAnimationFrame(function () {
        //     if(fls){
        //         flash.css("background-image", "url(" + self.imgs["flash"] + ")");
        //         fls=false;
        //     }else{
        //         flash.css("background-image", "url(" + self.imgs["flash2"] + ")");
        //         fls=true;
        //     }
        //     window.requestAnimationFrame(arguments.callee)
        // })

        // setInterval(function () {
        //     if(fls){
        //         $("#test1").animate({opacity:0})
        //         $("#test2").animate({opacity:1})
        //         fls=false
        //     }else{
        //         $("#test1").animate({opacity:1})
        //         $("#test2").animate({opacity:0})
        //         fls=true
        //     }
        //
        // },500);


        //老虎机拉杆
        var pull = $(".pull");
        // pull.css("background-image", "url(" + this.imgs["pull"] + ")");
        //老虎机按钮
        var btn = $("#btn");
        btn.css("background-image", "url(" + this.imgs["btn"] + ")");


        //游戏逻辑部分


        var num_wrap = $(".num-wrap");
        var num_row = $("#row1");
        var num_unit = $("<div class='num-unit'></div>");

        //组建unit单元组件
        for (var i = 4; i--;) {
            box = $("<div class='num'></div>");
            box.css("background-image", "url(assets/image/" + i + '.png' + ")");
            num_unit.append(box);
            box.wrap("<div class='num-bg'></div>")
        }

        //克隆组件,并添加到num_row中
        for (var i = 0; i < 10; i++) {
            var unit = num_unit.clone();
            num_row.append(unit);
        }

        //根据组件的高度,设定位置
        num_row.css("transform", "translate3d(0," + (-num_row.height() + $(".num-bg").height() * 2.5) + "px,0)");
        var v = parseInt(-num_row.height() + $(".num-bg").height() * 2.5);

        //添加二行和三行,分别是row2 row3
        var row2 = num_row.clone();
        row2.attr("id", "row2");
        row2.css("left", "33%");
        num_wrap.append(row2);

        var row3 = num_row.clone();
        row3.attr("id", "row3");
        row3.css("left", "66%");
        num_wrap.append(row3);

        var side = $(".num-bg").height();

        //渲染的图片数目,决定索引的循环
        var giftNum = 4;
        //根据图片数目,得出45附近循环完一周的loop数目
        var loops = 30 - 30 % giftNum;

        var tapLock = false;




        //中奖的配置表,2 1 3 分别表示第一个转到索引2的图片 其中索引从0开始
        cfg = [2, 1, 3];

        $("#btn-put").on("swipeDown",go);
        $("#btn").on("tap", go);
        this.gameContent = $("#" + this.domId).html();

        function go() {
            if (!tapLock) {
                //添加按钮动画
                $("#btn").addClass('animated rubberBand');
                //添加拉杆动效
                $(".bl").css("transition","0.6s");
                $(".bl").css("transition-timing-function", "cubic-bezier(.91,0,.94,1)");
                $(".bl").css("transform","translateY(0.88rem)");

                $(".pl").css("transition","0.6s");
                $(".pl").css("transition-timing-function", "cubic-bezier(.91,0,.94,1)");
                $(".pl").css("transform","rotateX(110deg)");


                tapLock = true;

                $.each($(".num-row"), function (i) {
                    var _num = $(this);
                    setTimeout(function () {
                        _num.css("transition-duration", "4s");
                        _num.css("transition-timing-function", "cubic-bezier(0.785, 0.135, 0.150, 1.03)");
                        _num.css("transform", "translate3d(0," + (v + side * loops + side * (cfg[i] - 1)) + "px,0)");
                    }, 300 * i);
                })
            }
        }

    },

    // 结束状态
    end: function () {
        this.reset();
    },

    // 重置游戏数据和dom结构
    reset: function () {
        // 直接把内容替换掉，
        $("#" + this.domId).children().remove();
        $("#" + this.domId).html(this.gameContent);
    },

    // 再玩一次
    replay: function () {
        this.play();
    }

}