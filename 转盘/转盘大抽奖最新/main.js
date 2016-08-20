/**
 * Created by zhiqiang.zeng on 16/7/25.
 */
/**
 * Created by zhiqiang.zeng on 16/7/25.
 */

//需要修改该模版,因为我要使用CANVAS,所以需要从PHASER的脚手架中,把相关的东西搬运过来。

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
    //承接图片对象,上面的imgs写的时图片路径,此处是对应的返回的图片对象
    imgArr: {},
    game: {},


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
            this.canvasSize.width = this.game.width = window.innerWidth * 2;
            this.canvasSize.height = this.game.height = window.innerHeight * 2;
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

        //接口
        var arr = [{name: "一等奖", url: "f2.png"}, {name: "二等奖", url: "f2.png"}, {name: "三等奖", url: "f2.png"}];

        // 加载图片资源
        // 所有需要加载的图片资源都写到这里来
        this.imgs = {
            // role: config['role'],
            // role1: config['role1'],
            //       role2: config['role2'],
            //       role3: config['role3'],
            //       bg: config['bg'],
            //       button: config['button'],
            //       time: '//24haowan-cdn.shanyougame.com/dance/img/time.png'

            bg: "bg1.png",
            hoop: "bg111.png",
            hoop2: "bg113.png",
            btn: "btn.png",
            thanks: "f1.png",
            gift: "f2.png"
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
        //if (this.device.platform == "android") audioList = {bg: config['music_bg']};
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
        //     var loading_lock = true;
        //     setTimeout(function () {
        //         loading_lock = false;
        //         // if (imgLoaded && audioLoaded) {
        //         $('.bar').width('2.6rem');
        //         setTimeout(function () {
        //             //if (!skip) showBox();
        //             self.create();
        //         }, 500);
        //         // }
        //     }, 3000);
        //
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
        var self = this;
        var temp = 0;
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        var outer = this.game.width * 0.37;
        var centerX = this.game.width / 2;
        var centerY = this.game.height / 2;
        var step = Math.PI * 2 / 10;
        var rigA = Math.PI / 2;
        //这里踩了个坑,还好DEBUG出来了,化成弧度值
        var rot = 0;
        var rotA = 0;

        var timer = null;
        var touLock = false;

        var gift_config = [{name: "一等奖", id: 199}, {name: "二等奖", id: 12}];

        //绘制并缩放

        //ctx.drawImage(this.imgArr["bg"], 0, 0,this.imgArr["bg"].width,this.imgArr["bg"].height,0,0,this.game.width,this.game.height);
        var bgs = this.game.width / this.imgArr["bg"].width;
        this.draw(ctx, this.imgArr["bg"], 0, 0, bgs);

        // ctx.arc(centerX,centerY,outer,0,10*step);
        // ctx.fillStyle="white";
        // ctx.fill()

        var step6 = step * 10 / 6;
        for (var i = 0; i < 6; i++) {
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            if (i % 2 != 0) {
                ctx.fillStyle = "white"
            } else {
                ctx.fillStyle = "rgb(255,218,48)"
            }
            ctx.strokeStyle = "rgb(237,71,59)";
            ctx.lineWidth = 5;
            ctx.arc(centerX, centerY, outer, step6 * i - rigA, step6 * (i + 1) - rigA);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        }
        //横线修正,修正起点与终点交接的横线
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = "rgb(237,71,59)";
        ctx.lineWidth = 5;
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX, centerY - outer);
        ctx.stroke();
        ctx.restore();

        //画文字跟图片

        for (var i = 0; i < 6; i++) {

            ctx.save();
            var step9 = i * step6 + step6 / 2;

            ctx.translate(this.game.width / 2 + Math.sin(step9) * outer * 0.85, this.game.height / 2 - Math.cos(step9) * outer * 0.85);
            ctx.beginPath();

            ctx.fillStyle = "#000";
            ctx.font = "40px 微软雅黑";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";


            ctx.rotate(Math.PI * (i * 2 + 1) / 6);

            if (i == 0) {
                if (gift_config[0]) {
                    ctx.fillText(gift_config[0].name, 0, 0)
                } else {
                    ctx.fillText("谢谢参与", 0, 0);
                }
            } else if (i == 1) {
                if (gift_config[3]) {
                    ctx.fillText(gift_config[3].name, 0, 0)
                } else {
                    ctx.fillText("谢谢参与", 0, 0);
                }
            } else if (i == 2) {
                if (gift_config[1]) {
                    ctx.fillText(gift_config[1].name, 0, 0)
                } else {
                    ctx.fillText("谢谢参与", 0, 0);
                }
            } else if (i == 3) {
                if (gift_config[4]) {
                    ctx.fillText(gift_config[4].name, 0, 0)
                } else {
                    ctx.fillText("谢谢参与", 0, 0);
                }
            } else if (i == 4) {
                if (gift_config[2]) {
                    ctx.fillText(gift_config[2].name, 0, 0)
                } else {
                    ctx.fillText("谢谢参与", 0, 0);
                }
            } else if (i == 5) {

                ctx.fillText("谢谢参与", 0, 0);
            }

            ctx.restore();
        }

        for (var i = 0; i < 6; i++) {

            ctx.save();
            var step9 = i * step6 + step6 / 2;

            ctx.translate(this.game.width / 2 + Math.sin(step9) * outer * 0.7, this.game.height / 2 - Math.cos(step9) * outer * 0.7);
            ctx.beginPath();


            ctx.rotate(Math.PI * (i * 2 + 1) / 6);

            this.draw(ctx, this.imgArr["thanks"], 0 - this.imgArr["thanks"].width / 2, 0, 1);

            ctx.restore();
        }

        //hoop
        var hoops = this.game.width / this.imgArr["hoop"].width;
        var hoopsS = 0.88;
        var hoopFlag = true;
        self.draw(ctx, self.imgArr["hoop2"], centerX - self.game.width * hoopsS / 2, centerY - self.game.width * hoopsS / 2, hoops * hoopsS)
        setInterval(function () {
            if (hoopFlag) {
                self.draw(ctx, self.imgArr["hoop"], centerX - self.game.width * hoopsS / 2, centerY - self.game.width * hoopsS / 2, hoops * hoopsS)
                hoopFlag = false;
            } else {
                self.draw(ctx, self.imgArr["hoop2"], centerX - self.game.width * hoopsS / 2, centerY - self.game.width * hoopsS / 2, hoops * hoopsS)
                hoopFlag = true;
            }
        }, 500);

        //旋转动画测试
        // setInterval(function(){
        //     for (var i = 0; i < 6; i++) {
        //         ctx.save();
        //         ctx.beginPath();
        //         ctx.moveTo(centerX, centerY);
        //         if (i % 2 == 0) {
        //             ctx.fillStyle = "white"
        //         } else {
        //             ctx.fillStyle = "rgb(255,218,48)"
        //         }
        //         ctx.strokeStyle = "rgb(237,71,59)";
        //         ctx.lineWidth = 5;
        //         ctx.arc(centerX, centerY, outer, step6 * i - rigA-10, step6 * (i + 1) - rigA-10);
        //         ctx.fill();
        //         ctx.stroke();
        //         ctx.restore();
        //     }
        // },300);

        //btn
        var btns = this.game.width / this.imgArr["btn"].width * 0.26;
        this.draw(ctx, this.imgArr["btn"], centerX - this.imgArr["btn"].width * btns / 2, centerY - this.imgArr["btn"].height * btns / 2, btns)
        //btn event 无法使用TAP事件,因为TAP事件不能获取坐标
        var R = 0, timer2;

        $("canvas").on("touchstart", function (e) {
            if (!touLock) {
                console.log('touch');
                if (e.changedTouches[0].clientX > (centerX / 2 - self.game.width * 0.26 / 4) && e.changedTouches[0].clientX < (centerX / 2 + self.game.width * 0.26 / 4)) {
                    if (e.changedTouches[0].clientY > (centerY / 2 - self.game.width * 0.26 / 4) && e.changedTouches[0].clientY < (centerY / 2 + self.game.width * 0.26 / 4)) {
                        //点击成功
                        touLock = true;
                        if (!timer) {
                            timer = setInterval(function () {

                                rot += 15 / 180 * Math.PI;
                                //console.log(rotA)
                                // rot += rotA;
                                for (var i = 0; i < 6; i++) {
                                    ctx.save();
                                    ctx.beginPath();
                                    ctx.moveTo(centerX, centerY);
                                    if (i % 2 != 0) {
                                        ctx.fillStyle = "white"
                                    } else {
                                        ctx.fillStyle = "rgb(255,218,48)"
                                    }
                                    ctx.strokeStyle = "rgb(237,71,59)";
                                    ctx.lineWidth = 5;
                                    ctx.arc(centerX, centerY, outer, step6 * i - rigA + rot, step6 * (i + 1) - rigA + rot);
                                    ctx.fill();
                                    ctx.stroke();
                                    ctx.restore();
                                }

                                //画文字与图片
                                for (var i = 0; i < 6; i++) {
                                    ctx.save();
                                    var step9 = i * step6 + step6 / 2 + rot;

                                    ctx.translate(self.game.width / 2 + Math.sin(step9) * outer * 0.85, self.game.height / 2 - Math.cos(step9) * outer * 0.85);
                                    ctx.beginPath();
                                    ctx.fillStyle = "#000";
                                    ctx.font = "40px 微软雅黑";
                                    ctx.textAlign = "center";
                                    ctx.textBaseline = "middle";

                                    ctx.rotate(Math.PI * (i * 2 + 1) / 6 + rot);

                                    if (i == 0) {
                                        if (gift_config[0]) {
                                            ctx.fillText(gift_config[0].name, 0, 0)
                                        } else {
                                            ctx.fillText("谢谢参与", 0, 0);
                                        }
                                    } else if (i == 1) {
                                        if (gift_config[3]) {
                                            ctx.fillText(gift_config[3].name, 0, 0)
                                        } else {
                                            ctx.fillText("谢谢参与", 0, 0);
                                        }
                                    } else if (i == 2) {
                                        if (gift_config[1]) {
                                            ctx.fillText(gift_config[1].name, 0, 0)
                                        } else {
                                            ctx.fillText("谢谢参与", 0, 0);
                                        }
                                    } else if (i == 3) {
                                        if (gift_config[4]) {
                                            ctx.fillText(gift_config[4].name, 0, 0)
                                        } else {
                                            ctx.fillText("谢谢参与", 0, 0);
                                        }
                                    } else if (i == 4) {
                                        if (gift_config[2]) {
                                            ctx.fillText(gift_config[2].name, 0, 0)
                                        } else {
                                            ctx.fillText("谢谢参与", 0, 0);
                                        }
                                    } else if (i == 5) {

                                        ctx.fillText("谢谢参与", 0, 0);
                                    }

                                    ctx.restore();
                                }

                                for (var i = 0; i < 6; i++) {

                                    ctx.save();
                                    var step9 = i * step6 + step6 / 2 + rot;

                                    ctx.translate(self.game.width / 2 + Math.sin(step9) * outer * 0.7, self.game.height / 2 - Math.cos(step9) * outer * 0.7);
                                    ctx.beginPath();


                                    ctx.rotate(Math.PI * (i * 2 + 1) / 6 + rot);

                                    self.draw(ctx, self.imgArr["thanks"], 0 - self.imgArr["thanks"].width / 2, 0, 1);

                                    ctx.restore();
                                }


                                R += rot;
                                self.draw(ctx, self.imgArr["btn"], centerX - self.imgArr["btn"].width * btns / 2, centerY - self.imgArr["btn"].height * btns / 2, btns)


                            }, 30);

                            setTimeout(function () {
                                timer2 = setInterval(function () {

                                    //0
                                    // if(rot%(Math.PI*2)>5.73&&(rot%(Math.PI*2)<5.78)){
                                    //     clearInterval(timer);
                                    //     clearInterval(timer2)
                                    // }
                                    //5
                                    // if(rot%(Math.PI*2)>0.5&&(rot%(Math.PI*2)<0.55)) {
                                    //     clearInterval(timer);
                                    //     clearInterval(timer2)
                                    // }
                                    //4
                                    // if(rot%(Math.PI*2)>1.55&&(rot%(Math.PI*2)<1.6)) {
                                    //     clearInterval(timer);
                                    //     clearInterval(timer2)
                                    // }
                                    //3
                                    // if(rot%(Math.PI*2)>2.6&&(rot%(Math.PI*2)<2.63)) {
                                    //     clearInterval(timer);
                                    //     clearInterval(timer2)
                                    // }
                                    //2
                                    // if(rot%(Math.PI*2)>3.65&&(rot%(Math.PI*2)<3.7)) {
                                    //     clearInterval(timer);
                                    //     clearInterval(timer2)
                                    // }
                                    //1
                                    // if(rot%(Math.PI*2)>4.7&&(rot%(Math.PI*2)<4.75)) {
                                    //     clearInterval(timer);
                                    //     clearInterval(timer2)
                                    // }

                                    result(12)

                                }, 100)

                            }, 600);


                        }
                    }
                }
            }
        });

        //控制转盘转到哪里结束
        function result(id) {
            for(var i=0,len=gift_config.length;i<len;i++){
                if(gift_config[i].id==id){
                    if(i==0){
                        index=0;
                        break;
                    }else if(i==1){
                        index=2;
                        break;

                    }else if(i==2){
                        index=4;
                        break;

                    }else if(i==3){
                        index=1
                        break;

                    }else if(i==4){
                        index=3;
                        break;

                    }else if(i==5){
                        index=5;
                        break;

                    }
                }
            }
            switch (index) {
                case 0:
                    if (rot % (Math.PI * 2) > 5.73 && (rot % (Math.PI * 2) < 5.78)) {
                        clearInterval(timer);
                        clearInterval(timer2)
                    }
                    break;
                case 1:
                    if (rot % (Math.PI * 2) > 4.7 && (rot % (Math.PI * 2) < 4.75)) {
                        clearInterval(timer);
                        clearInterval(timer2)
                    }
                    break;
                case 2:
                    if (rot % (Math.PI * 2) > 3.65 && (rot % (Math.PI * 2) < 3.7)) {
                        clearInterval(timer);
                        clearInterval(timer2)
                    }
                    break;
                case 3:
                    if (rot % (Math.PI * 2) > 2.6 && (rot % (Math.PI * 2) < 2.63)) {
                        clearInterval(timer);
                        clearInterval(timer2)
                    }
                    break;
                case 4:
                    if (rot % (Math.PI * 2) > 1.55 && (rot % (Math.PI * 2) < 1.6)) {
                        clearInterval(timer);
                        clearInterval(timer2)
                    }
                    break;
                case 5:
                    if (rot % (Math.PI * 2) > 0.5 && (rot % (Math.PI * 2) < 0.55)) {
                        clearInterval(timer);
                        clearInterval(timer2)
                    }
                    break;
            }
        }


        // 设置游戏内容
        this.gameContent = $("#" + this.domId).html();

        //测试用，上线时删掉
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
    },

    //工具函数,封装drawImage
    draw: function (ctx, img, x, y, scale) {
        ctx.drawImage(img, 0, 0, img.width, img.height, x, y, img.width * scale, img.height * scale);
    }

}