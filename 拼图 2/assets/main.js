/**
 * Created by zhiqiang.zeng on 16/7/25.
 */

//此模版为DOM模版的扩展版本,加入了CANVAS

// 测试用，直接启动
var gameManager;
$(document).ready(function () {
    gameManager = new Game(0, {}, 'game_div');
    gameManager.init();
});

/**
 * DOM得分类游戏框架
 * game_tpl type 3
 */
var Game = function (bestScore, config, domId) {
    this.bestScore = bestScore || 0;
    this.config = config;
    this.domId = domId || '';
};
/* 游戏属性 */
Game.prototype = {
    // 得分
    score: 0,
    // 最高得分
    bestScore: 0,
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
    //画布设置
    canvasSize: {},
    //图片对象
    imgArr: [],

    // 初始化-设备信息
    initDevice: function () {
        this.device.width = window.innerWidth;
        this.device.height = window.innerHeight;
        if (window.innerWidth > window.innerHeight) {
            this.device.width = window.innerHeight;
            this.device.height = window.innerWidth;
        }
        this.device.platform = (navigator.userAgent.toLowerCase().indexOf('android') < 0) ? 'apple' : 'android';
        this.device.type = (this.device.width > 700) ? 'pad' : 'mobile';
    },

    initCanvasSize: function () {
        if (window.innerWidth < window.innerHeight) {
            this.canvasSize.width = window.innerWidth * 2;
            this.canvasSize.height = window.innerHeight * 2;
            this.canvasSize.ratio = this.canvasSize.width / this.canvasSize.height;
        }
    },

    initCanvas: function () {
        $("#game_div").append("<canvas id='canvas'></canvas>");
        //这里的写法必须用DOM写,用ZEPTO会和zepto的width接口冲突
        document.getElementById("canvas").width = this.canvasSize.width;
        document.getElementById("canvas").height = this.canvasSize.height;
        //上面的设置画布的大小,下面是设置画布在浏览器中被渲染的大小,通过此法解决手机上资源模糊
        $("canvas").css("width", this.canvasSize.width / 2);
        $("canvas").css("height", this.canvasSize.height / 2);
    },

    // 初始化-游戏
    init: function () {
        var self = this;
        // 初始化设备信息
        this.initDevice();
        // 初始化画布大小
        this.initCanvasSize();
        // 设置已进入初始化阶段
        this.isInit = true;
        //创建画布
        this.initCanvas();
        // 加载资源
        this.load();

    },

    // 加载资源
    load: function () {
        var self = this;

        var config = this.config['game'];
        // 加载图片资源
        // 所有需要加载的图片资源都写到这里来
        this.imgs = {
            1:"assets/images/1.png",
            2:"assets/images/2.png",
            3:"assets/images/3.png",
            4:"assets/images/4.png",
            5:"assets/images/5.png",
            6:"assets/images/6.png",
            7:"assets/images/7.png",
            8:"assets/images/8.png",
            "bg":"assets/images/bg.png",
            "clock":"assets/images/clock.png"
        };
        var imgLoaded = false;
        var currentLoadedImg = 0;
        var totalImg = Object.keys(this.imgs).length;
        for (var index in this.imgs) {
            if (this.imgs[index].indexOf("#") != 0) {
                self.imgArr[index] = new Image();
                self.imgArr[index].onload = self.imgArr[index].onerror = function () {
                    ++currentLoadedImg;
                    $('.bar').width(2.6 * (0.8 * currentLoadedImg / totalImg + 0.2 * currentLoadedAudio / totalAudio) + 'rem');
                    if (currentLoadedImg == totalImg) {
                        imgLoaded = true;
                        // if (audioLoaded && !loading_lock) {
                        //  $('.bar').width('2.6rem');
                        //  setTimeout(function() {

                        //      self.create();
                        //  }, 500);
                        // }
                    }
                }
                self.imgArr[index].src = this.imgs[index];
            } else {
                totalImg--;
            }
        }

        // 加载音频资源
        // 所有需要加载的音频资源都写到这里来
        var audioList = {
            // bg: config['music_bg'],
            // right: config['music_right'],
            // wrong: config['music_wrong']
        };
        if (this.device.platform == "android") audioList = {bg: config['music_bg']};
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
                    // if (imgLoaded && !loading_lock) {
                    //  $('.bar').width('2.6rem');
                    //  setTimeout(function() {
                    //      self.create();
                    //  }, 500);
                    // }
                }
            }
        }

        // 加载时间锁
        // var loading_lock = true;
        // setTimeout(function () {
        //     loading_lock = false;
        //     // if (imgLoaded && audioLoaded) {
        //     $('.bar').width('2.6rem');
        //     setTimeout(function () {
        //         //if (!skip) showBox();
        //         self.create();
        //     }, 500);
        //     // }
        // }, 3000);

        setTimeout(function () {
            $('.bar').width('2.6rem')
            self.create()
        }, 0)

    },

    // 开始状态
    create: function () {
        // // 添加背景
        // if (this.config['game']['bg'].indexOf('#') == 0) {
        //  $("#game_div").css("background-color", this.config['game']['bg']);
        // } else {
        //  $("#game_div").css("background-image", 'url('+this.imgs['bg']+')');
        // }
        // // 配置元素
        // $("#role1").attr("src", this.imgs["role"]);
        // $("#role2").attr("src", this.imgs["role1"]);
        // $("#role3").attr("src", this.imgs["role1"]);
        // $("#key1").attr("src", this.imgs['button']);
        // $("#key2").attr("src", this.imgs['button']);
        // $("#key3").attr("src", this.imgs['button']);
        // $(".timer img").attr("src", this.imgs['time']);
        // // 隐藏加载界面
        // $('#loading').hide();
        // // 显示开始菜单页面 使用dom构建
        // if (skip) { // 如果是工作台里面的直接进入游戏界面
        //  this.play();
        // } else {
        //  $('#start-menu').show();
        // }

        //var $("#game_div")

        // 设置游戏内容
        this.gameContent = $("#" + this.domId).html();

        // 测试用，上线时删掉
        this.play();
    },

    // 游戏状态
    play: function () {
        // 此处写游戏逻辑
        var self = this;

        // if (skip) {
        //  game.state.start('play');
        // } else {
        //  setGameScore({
        //      'game_score':score,
        //      'game_id':game_info['game_id'],
        //      'device_type':self.device.platform
        //  });
        //  self.end();
        // }
    },

    // 结束状态
    end: function () {
        this.reset();
    },

    // 重置游戏数据和dom结构
    reset: function () {
        // 测试用，直接把内容替换掉
        $("#" + this.domId).children().remove();
        $("#" + this.domId).html(this.gameContent);
    },

    // 再玩一次
    replay: function () {
        this.play();
    }

}