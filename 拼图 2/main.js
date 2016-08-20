/**
 * Created by zhiqiang.zeng on 16/7/18.
 */
// var gameManager;
// $(document).ready(function () {
//     gameManager = new Game();
//     gameManager.init();
// });
/**
 提交分数 接口
 setGameScore({
		'game_score':score
		'game_id':game_info['game_id'],
		'device_type':self.device.platform
	});
 **/
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
    // 音乐管理器
    musicManager: null,
    // 插入的domId
    domId: null,
    // 设备信息
    device: {
        type: null,
        platform: null,
        width: 0,
        height: 0
    },
    // 画布大小
    canvasSize: {
        width: 0,
        height: 0,
        ratio: 0
    },
    // phaser游戏对象实例
    instance: null,

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
    // 初始化-画布大小
    initCanvasSize: function () {
        if (window.innerWidth < window.innerHeight) {
            this.canvasSize.width = window.innerWidth * 2;
            this.canvasSize.height = window.innerHeight * 2;
            this.canvasSize.ratio = this.canvasSize.width / this.canvasSize.height;
        }
    },
    // 初始化-游戏
    init: function () {
        var self = this;
        var supSelf=this;
        // 初始化设备信息
        this.initDevice();
        // 初始化画布大小
        this.initCanvasSize();
        // 设置已进入初始化阶段
        this.isInit = true;
        // 创建游戏实例
        this.instance = new Phaser.Game(this.canvasSize.width, this.canvasSize.height, Phaser.CANVAS, this.domId);
        // 创建游戏状态
        this.instance.States = {};

        var game = this.instance;
        // State - boot
        // 加载加载页所需资源
        game.States.boot = function () {
            this.preload = function () {
                // 设置画布大小
                $(game.canvas).css("width", self.canvasSize.width / 2);
                $(game.canvas).css("height", self.canvasSize.height / 2);
                // 设置默认背景颜色
                game.stage.backgroundColor = '#aaa';
            };
            this.create = function () {
                // 进入preload状态
                game.state.start('preload');
            };
        };

        // State - preload
        // 加载游戏所需资源
        game.States.preload = function () {
            this.preload = function () {
                // 说明：加载页面至少显示3秒，由deadline控制是否允许进入下一个状态
                var deadLine = false;
                setTimeout(function() {
                	deadLine = true;
                }, 3000);
                // 加载完成回调
                function callback() {
                    game.state.start('create');
                    if (deadLine == true) { // 到deadline了
                    	// 隐藏加载界面
                    	$('#loading').hide();
                    	// 显示提示框，在game.php里面加载的
                    	showBox();
                    	// 进入create状态
                    	game.state.start('create');
                    } else { // 还没到deadline
                    	setTimeout(function(){
                    		callback();
                    	}, 1000);
                    }
                }

                // 全部文件加载完成
                game.load.onLoadComplete.add(callback);
                // 文件加载完成
                game.load.onFileComplete.add(function (progress) {
                    $('.bar').width(2.6 * progress / 100 + 'rem');
                });
                // 加载资源
                game.load.image("1", "assets/images/1.png");
                game.load.image("2", "assets/images/2.png");
                game.load.image("3", "assets/images/3.png");
                game.load.image("4", "assets/images/4.png");
                game.load.image("5", "assets/images/5.png");
                game.load.image("6", "assets/images/6.png");
                game.load.image("7", "assets/images/7.png");
                game.load.image("8", "assets/images/8.png");
                game.load.image("bg", "assets/images/bg.png");
                game.load.image("clock", "assets/images/clock.png");
                game.load.image("yep","assets/images/yep.png");

                // var config = self.config['game'];
                // if(config['bg'].indexOf('#') != 0){
                // 	game.load.image('bg',config['bg']);
                // }
                // game.load.atlasJSONArray('fort', "assets/images/fort.png", "assets/images/fort.json");
                // game.load.image('foreground', "assets/images/foreground.png");
                // game.load.image('ball_blue', "assets/images/ball_blue.png");
                // game.load.image('ball_yellow', "assets/images/ball_yellow.png");
                // game.load.image('clock', "assets/images/clock.png");
                // game.load.image('boom', "assets/images/boom.png");
                // game.load.image('plus', "assets/images/plus.png");
                // game.load.image('minus', "assets/images/minus.png");
                //加载音效
                // game.load.audio('bgMusic',config['music_bg']);
                // if (self.device.platform != 'android') {
                // 	game.load.audio('click',config['music_click']);
                // }
            };
        };

        // State - create
        // 开始界面
        game.States.create = function () {
            this.create = function () {
                game.state.start('play');
                // 创建音乐管理器
                self.musicManager = new MusicManager(game, self.device, ['bgMusic','click']);
                // 显示开始菜单页面 使用dom构建
                $('#start-menu').show();
            }
        };

        //此方法借用Arvin的,可以用来画圆角边框
        CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
            this.beginPath();
            this.moveTo(x + r, y);
            this.arcTo(x + w, y, x + w, y + h, r);
            this.arcTo(x + w, y + h, x, y + h, r);
            this.arcTo(x, y + h, x, y, r);
            this.arcTo(x, y, x + w, y, r);
            this.closePath();
            return this;
        };


        var delta = 5;
        var imgList = [];

        //交换拼图的数组
        var puzzleList = [];


        //配置函数  配置游戏的难度以及图片
        var puzzleConfig = [
            {img: "1", num: 2},
            {img: "6", num: 3},
            {img: "3", num: 3},
            {img: "4", num: 3},
            {img: "5", num: 4},
            {img: "2", num: 4},
            {img: "7", num: 4},
            {img: "8", num: 5}
        ];

        //游戏总时间
        var time = 0;
        var timer = null;
        //拼图数目

        // State - play
        // 游戏界面
        game.States.play = function () {
            this.create = function () {

                // if(self.config['game']['bg'].indexOf('#') == 0){
                // 	game.stage.backgroundColor = self.config['game']['bg'];
                // } else {
                // 	var bg = game.add.image(0, 0, "bg");
                // 	bg.width = self.canvasSize.width;
                // 	bg.height = self.canvasSize.height;
                // }
                // 此处写游戏逻辑

                var self = this;

                if (self.config && self.config['game']['bg'].indexOf('#') == 0) {
                    game.stage.backgroundColor = self.config['game']['bg'];
                } else {
                    var bg = game.add.image(0, 0, "bg");
                    var bgsc = game.world.width / bg.width;
                    bg.scale.setTo(bgsc, bgsc);
                }

                //钟表
                var clockPy = game.world.height * 0.07;
                var timeText = game.add.text(game.world.width * 0.8, clockPy, 30, {fontSize: "60px", fill: '#FAF8EF'});
                var clock = game.add.image(game.world.width * 0.7, clockPy, "clock");
                var clocksc = 60 / clock.width;
                clock.scale.setTo(clocksc, clocksc);

                //分数框
                var scoreText = game.add.text(game.world.width * 0.08, clockPy, "LEVEL:1", {
                    fontSize: "60px",
                    fill: '#FAF8EF'
                });


                //参数对象,传进来 图片名称 切割数目
                function init(imgObj,flag) {

                    time+=30;
                    supSelf.score++;
                    scoreText.text="LEVEL:"+supSelf.score;

                    //从LEVEL进阶到2开始每次执行
                    if (!flag) {

                        //刷新时间,避免误解
                        timeText.text = time;

                        //补上添加时间的动画效果
                        var atime=game.add.text(game.world.width * 0.9, clockPy+game.world.height*0.01, "+30",{fontSize: "40px", fill: '#FAF8EF'})
                        atime.alpha=0.5;
                        game.add.tween(atime).to({y:clockPy},1200,null,true,0,0,true);
                        game.add.tween(atime).to({alpha:1},1200,null,true,0,0,true);
                        setTimeout(function(){
                            atime.destroy()
                        },1200)
                    }

                    timer = game.time.create();
                    timer.loop(1000, function () {
                        time--;
                        timeText.text = time;
                    });

                    var tipNum = 3;
                    var tipText = game.add.text(game.world.centerX, game.world.height * 0.15, "你还有3秒记住原图", {
                        fontSize: "60px",
                        fill: '#FAF8EF'
                    });
                    tipText.anchor.setTo(0.5, 0);

                    var tipTimer = game.time.create();
                    tipTimer.loop(1000, function () {
                        tipNum--;
                        tipText.text = "你还有" + tipNum + "秒记住原图";
                    });
                    tipTimer.start();

                    puzzleList = [];
                    imgList = [];

                    //新建一个白色的背景
                    var fgSize = game.world.width * 0.9;
                    rectBitmap = game.add.bitmapData(fgSize, fgSize);
                    rectBitmap.context.roundRect(0, 0, fgSize, fgSize, 0);
                    rectBitmap.context.fillStyle = "#FAF8EF";
                    rectBitmap.context.fill();


                    block = game.add.image(game.world.centerX, game.world.centerY + 20, rectBitmap);
                    block.anchor.setTo(0.5, 0.5);

                    //绘制小方块

                    var startPx = game.world.centerX - block.width / 2 + delta;
                    var startPy = game.world.centerY - block.height / 2 + 20 + delta;

                    //参数可修改
                    side = (block.width - (imgObj.num + 1) * delta) / imgObj.num;

                    var originImg = game.add.image(0, 0, imgObj.img);
                    // var originImgsc = side*2/ originImg.width;
                    // originImg.scale.setTo(originImgsc, originImgsc);
                    originImg.destroy();

                    var bitWidth = originImg.width / imgObj.num;



                    //绘制拼图
                    for (var i = 0; i < imgObj.num; i++) {
                        for (var j = 0; j < imgObj.num; j++) {
                            //var pic=game.add.sprite(startPx+(delta+side)*i,startPy+(delta+side)*j,"1");
                            // var picsc=side*2/pic.width;
                            // pic.scale.setTo(1/picsc,1/picsc);
                            // cropRect = new Phaser.Rectangle(0, 0, side, side);
                            // pic.crop(cropRect);

                            var bitMap = game.add.bitmapData(side, side);
                            bitMap.copy(originImg, bitWidth * i, bitWidth * j, bitWidth, bitWidth, 0, 0, side, side);
                            var temp = game.add.image(startPx + (delta + side) * i, startPy + (delta + side) * j, bitMap);
                            temp.correctX = startPx + (delta + side) * i;
                            temp.correctY = startPy + (delta + side) * j;
                            temp.inputEnabled = true;
                            imgList.push(temp);
                        }
                    }

                    // var yep=game.add.image(game.world.centerX,game.world.centerY+20,"yep");
                    // var yepsc=block.width/yep.width*0.6;
                    // yep.scale.setTo(0,0);
                    // yep.anchor.setTo(0.5,0.5);
                    // game.add.tween(yep.scale).to({x:yepsc,y:yepsc},500,Phaser.Easing.Quadratic.Out,true,0,0,false);
                    // setTimeout(function () {
                    //     game.add.tween(yep.scale).to({x:1,y:1},800,Phaser.Easing.Quadratic.In,true,0,0,false);
                    // },500);

                    //游戏3秒记忆阶段结束,正式开始
                    setTimeout(function () {
                        //开始总时间计时
                        timer.start();

                        tipTimer.stop();
                        tipText.destroy();
                        //打乱顺序
                        for (var i = 0; i < imgObj.num * imgObj.num; i++) {

                            var rnd = game.rnd.between(0, imgObj.num * imgObj.num - 1);
                            interchange(imgList[rnd], imgList[i]);

                        }
                        //解除锁定点击事件
                        game.input.onDown.active = true;
                    }, 3000);

                }

                //晋级函数
                function nextLevel(flag) {
                    init(puzzleConfig[0],flag);
                    puzzleConfig.splice(0, 1);
                }

                //初始化
                nextLevel(true);
                //添加点击事件,仅需绑定一次
                game.input.onDown.add(function () {
                    var pos = arguments[0];
                    var clientX = pos.clientX;
                    var clientY = pos.clientY;
                    //console.log(checkInputIsOnSpriteList(imgList));
                    for (var i = 0; i < imgList.length; i++) {
                        if (clientX > imgList[i].position.x / 2 && clientX < imgList[i].boundX / 2) {
                            if (clientY > imgList[i].position.y / 2 && clientY < imgList[i].boundY / 2) {
                                puzzleList.push(imgList[i]);
                                puzzleList[0].alpha=0.3;
                                if (puzzleList.length == 2) {
                                    setTimeout(function () {
                                        interchange(puzzleList[0], puzzleList[1]);
                                        puzzleList[0].alpha=1;
                                        puzzleList = [];
                                        //判断是否通关
                                        var isWin = checkIsWin();
                                        if (isWin) {
                                            //封锁点击事件,同时绑定当前关卡结束事件
                                            game.input.onDown.active = false;
                                            timer.destroy();

                                            var yep=game.add.image(game.world.centerX,game.world.centerY+20,"yep");
                                            var yepsc=block.width/yep.width*0.6;
                                            yep.scale.setTo(0,0);
                                            yep.anchor.setTo(0.5,0.5);

                                            game.add.tween(yep.scale).to({x:yepsc,y:yepsc},500,Phaser.Easing.Quadratic.Out,true,0,0,false);
                                            setTimeout(function () {
                                                game.add.tween(yep.scale).to({x:1,y:1},800,Phaser.Easing.Quadratic.In,true,0,0,false);
                                            },500);

                                            setTimeout(nextLevel,1500);
                                        }
                                    }, 0)
                                }
                            }
                        }
                    }
                });

                //时间死亡事件
                var dieTimer=game.time.create();
                dieTimer.loop(500,function () {
                    if(time<=0){
                        self.gameEnd();
                    }
                });
                dieTimer.start();


                //交换两个对象的位置以及边界位置
                function interchange(a, b) {

                    var tempX = a.position.x;
                    var tempY = a.position.y;
                    var temp2X = b.position.x;
                    var temp2Y = b.position.y;

                    a.position.x = temp2X;
                    a.position.y = temp2Y;
                    a.boundX = temp2X + side;
                    a.boundY = temp2Y + side;

                    b.position.x = tempX;
                    b.position.y = tempY;
                    b.boundX = tempX + side;
                    b.boundY = tempY + side;

                }

                //判断合成顺序是否正确,即是否通关
                function checkIsWin() {
                    for (var i = imgList.length; i--;) {
                        if (imgList[i].position.x != imgList[i].correctX || imgList[i].position.y != imgList[i].correctY) {
                            return false;
                        }
                    }
                    return true;
                }

            };

            this.update = function () {
                // 每一帧更新都会触发

            };
            // 游戏结束
            this.gameEnd = function () {
                game.paused = true;
                console.log("得分是: " + self.score);
                alert("得分是: " + self.score);
            };
        };

        // State - end
        // 游戏结束界面
        game.States.end = function () {
            this.create = function () {
                // 游戏结束
            }
        };

        // 添加游戏状态
        game.state.add('boot', game.States.boot);
        game.state.add('preload', game.States.preload);
        game.state.add('create', game.States.create);
        game.state.add('play', game.States.play);
        game.state.add('end', game.States.end);
        game.state.start('boot');
    }
};


/* 音乐管理器 */
var MusicManager = function (gameInstance, deviceInfo, assets) {
    this.gameInstance = gameInstance;
    this.deviceInfo = deviceInfo;
    this.assets = assets;
    this.init();
};
MusicManager.prototype = {
    // 游戏实例
    gameInstance: null,
    // 设备信息
    deviceInfo: null,
    // 资源
    assets: null,
    // 音乐对象
    musicObject: null,
    // 静音标记
    isBaned: false,
    // 是否播放中
    isPlaying: false,
    // 正在播放列表
    playingList: [],
    // 初始化
    init: function () {
        var self = this;
        if (this.assets) {
            this.musicObject = {};
            for (var index = 0, len = this.assets.length; index < len; index++) {
                var audio = this.gameInstance.add.audio(this.assets[index]);
                audio.name = this.assets[index];
                audio.onPause.add(function () {
                    self.playingList = self.playingList.splice(self.playingList.indexOf(audio.name), 1);
                    if (self.playingList.length == 0) self.isPlaying = false;
                });
                audio.onStop.add(function () {
                    self.playingList = self.playingList.splice(self.playingList.indexOf(audio.name), 1);
                    if (self.playingList.length == 0) self.isPlaying = false;
                });
                this.musicObject[this.assets[index]] = audio;
            }
        }
    },
    // 播放
    play: function (assetName, loop) {
        if (!this.isBaned) {
            var playTag = false;
            if (this.deviceInfo.platform == "apple") {
                playTag = true;
            } else if (this.deviceInfo.platform == "android" && !this.isPlaying) {
                playTag = true;
            }
            if (playTag) {
                if (loop) {
                    if (!this.musicObject[assetName].isPlaying) {
                        this.musicObject[assetName].loopFull();
                        this.playingList.push(assetName);
                    }
                } else {
                    if (!this.musicObject[assetName].isPlaying) {
                        this.musicObject[assetName].play();
                        this.playingList.push(assetName);
                    }
                }
                this.isPlaying = true;
            }
        }
    },
    resume: function () {
        for (var item in this.playingList) {
            var name = this.playingList[item];
            this.musicObject[name].resume();
        }
        this.isPlaying = true;
    },
    pause: function () {
        for (var item in this.playingList) {
            var name = this.playingList[item];
            this.musicObject[name].pause();
        }
        this.isPlaying = false;
    },
    stop: function () {
        for (var item in this.playingList) {
            var name = this.playingList[item];
            this.musicObject[name].stop();
        }
        this.isPlaying = false;
        this.playingList = [];
    },
    ban: function () {
        this.isBaned = true;
        this.pause();
    },
    disban: function () {
        this.isBaned = false;
        this.resume();
    }
};
