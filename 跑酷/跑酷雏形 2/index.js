/**
 * Created by zhiqiang.zeng on 16/7/23.
 */
/**
 * Created by zhiqiang.zeng on 16/7/18.
 */
var gameManager;
$(document).ready(function () {
    gameManager = new Game();
    gameManager.init();
});
/**
 提交分数 接口
 setGameScore({
		'game_score':score,
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
                //game.stage.backgroundColor = '#aaa';
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
                // var deadLine = false;
                // setTimeout(function() {
                // 	deadLine = true;
                // }, 3000);
                // 加载完成回调
                function callback() {
                    game.state.start('create');
                    // if (deadLine == true) { // 到deadline了
                    // 	// 隐藏加载界面
                    // 	$('#loading').hide();
                    // 	// 显示提示框，在game.php里面加载的
                    // 	showBox();
                    // 	// 进入create状态
                    // 	game.state.start('create');
                    // } else { // 还没到deadline
                    // 	setTimeout(function(){
                    // 		callback();
                    // 	}, 1000);
                    // }
                }

                // 全部文件加载完成
                game.load.onLoadComplete.add(callback);
                // 文件加载完成
                game.load.onFileComplete.add(function (progress) {
                    $('.bar').width(2.6 * progress / 100 + 'rem');
                });
                // 加载资源
                game.load.image("bg", "assets/bg.png");
                game.load.image("bga", "assets/bga.png");
                game.load.image("trackLR", "assets/leftright.png");
                game.load.image("trackM", "assets/mid.png");
                game.load.image("roleA", "assets/a.png");
                game.load.image("roleB", "assets/b.png");

                game.load.image("barrier", "assets/3.png");
                game.load.image("trap", "assets/1.png");
                game.load.image("money", "assets/4.png");
                game.load.image("fence", "assets/2.png");

                game.load.image("handL", "assets/hand2.png");
                game.load.image("handR", "assets/hand3.png");
                game.load.image("handJ", "assets/hand1.png");

                game.load.image("star", "assets/star.png");

                game.load.image("die", "assets/die.png");

                game.load.atlasJSONArray("role", "assets/roleTp.png", "assets/roleTp.json");
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
                // self.musicManager = new MusicManager(game, self.device, ['bgMusic','click']);
                // 显示开始菜单页面 使用dom构建
                // $('#start-menu').show();
            }
        };

        // State - play
        // 游戏界面

        //通用代码块
        var side;

        var center;
        var left;
        var right;

        var role;
        var fence = [];
        var monster = [];
        var i = 0;

        var btnLock = true;
        //跳跃的时间,会随着速度增加而减少跳跃时间
        var jumpTime = 0;
        var scoreT = 0;
        var scoreText;
        var star;
        //游戏的速度,会随着时间而增加,同时,到了800以后不再增加,而是生成两个障碍物
        var speed = 400;
        var scroll = 0;
        var scoreScroll = 0;
        // TAP锁,防止重复触发TAP函数
        var tapLock = false;
        //是否生成两个障碍物
        var isTwo = false;
        var TIME = 0;
        var createSpeed = 800;

        var timerTP = null;

        var timeScroll = 0;
        var jumpComplete = true;

        //游戏引导页面 注意顺序 右 左 跳 这三个引导可以封装
        // game.States.guideRight = function () {
        //     this.create = function () {
        //
        //
        //         side = game.world.width / 3;
        //
        //         center = game.world.centerX;
        //         left = center - side;
        //         right = center + side;
        //
        //         game.stage.backgroundColor = "rgb(247, 224, 131)";
        //
        //         role = game.add.image(0, 0, "role");
        //         role.anchor.setTo(0.5, 1);
        //         var rate = side * 0.8 / role.width;
        //         role.scale.setTo(rate, rate);
        //         role.position.x = center;
        //         role.position.y = game.world.height * 0.7;
        //
        //         var fenceLeft = game.add.image(0, 0, "fence");
        //         fenceLeft.anchor.setTo(0.5, 1);
        //         var rate = side * 0.8 / fenceLeft.width;
        //         fenceLeft.scale.setTo(rate, rate);
        //         fenceLeft.position.x = left;
        //         fenceLeft.position.y = game.world.height * 0.5;
        //
        //         var fenceMiddle = game.add.image(0, 0, "fence");
        //         fenceMiddle.anchor.setTo(0.5, 1);
        //         var rate = side * 0.8 / fenceMiddle.width;
        //         fenceMiddle.scale.setTo(rate, rate);
        //         fenceMiddle.position.x = center;
        //         fenceMiddle.position.y = game.world.height * 0.5
        //
        //         //提示向右滑动的动画,group+tween
        //         var group = game.add.group();
        //         group.create(0, 0, "cake");
        //         //group.anchor.setTo(0.5,1);
        //         group.position.x = center - group.width / 2;
        //         group.position.y = game.height * 0.1
        //         //tween
        //         game.add.tween(group).to({x: right - group.width / 2}, 2000, null, true, 200, -1, false)
        //         game.add.tween(group).to({alpha: 0}, 2000, null, true, 200, -1, false)
        //
        //         $("body").on("swipeRight", function () {
        //             game.add.tween(role).to({x: right}, 100, null, true, 0, 0, false);
        //             setTimeout(function(){
        //                 game.state.start("guideLeft");
        //             },200)
        //         });
        //
        //     }
        // };
        //
        // game.States.guideLeft = function () {
        //     this.create=function(){
        //         //解绑
        //         $("body").off("swipeRight");
        //
        //         game.stage.backgroundColor = "rgb(247, 224, 131)";
        //
        //         role = game.add.image(0, 0, "role");
        //         role.anchor.setTo(0.5, 1);
        //         var rate = side * 0.8 / role.width;
        //         role.scale.setTo(rate, rate);
        //         role.position.x = right;
        //         role.position.y = game.world.height * 0.7;
        //
        //
        //         var fenceRight = game.add.image(0, 0, "fence");
        //         fenceRight.anchor.setTo(0.5, 1);
        //         var rate = side * 0.8 / fenceRight.width;
        //         fenceRight.scale.setTo(rate, rate);
        //         fenceRight.position.x = right;
        //         fenceRight.position.y = game.world.height * 0.5
        //
        //         //提示向右滑动的动画,group+tween
        //         var group = game.add.group();
        //         group.create(0, 0, "cake");
        //         //group.anchor.setTo(0.5,1);
        //         group.position.x = center - group.width / 2;
        //         group.position.y = game.height * 0.1
        //         //tween
        //         game.add.tween(group).to({x: left - group.width / 2}, 2000, null, true, 200, -1, false)
        //         game.add.tween(group).to({alpha: 0}, 2000, null, true, 200, -1, false)
        //
        //         $("body").on("swipeLeft", function () {
        //             game.add.tween(role).to({x: center}, 100, null, true, 0, 0, false);
        //             setTimeout(function(){
        //                 game.state.start("guideJump");
        //             },200)
        //         });
        //     }
        // };
        //
        // game.States.guideJump = function () {
        //     this.create=function(){
        //
        //         $("body").off("swipeLeft");
        //         game.stage.backgroundColor = "rgb(247, 224, 131)";
        //
        //         role = game.add.image(0, 0, "role");
        //         role.anchor.setTo(0.5, 1);
        //         var rate = side * 0.8 / role.width;
        //         role.scale.setTo(rate, rate);
        //         role.position.x = center;
        //         role.position.y = game.world.height * 0.7;
        //
        //         var fenceLeft = game.add.image(0, 0, "fence");
        //         fenceLeft.anchor.setTo(0.5, 1);
        //         var rate = side * 0.8 / fenceLeft.width;
        //         fenceLeft.scale.setTo(rate, rate);
        //         fenceLeft.position.x = left;
        //         fenceLeft.position.y = game.world.height * 0.5;
        //
        //         var fenceMiddle = game.add.image(0, 0, "fence");
        //         fenceMiddle.anchor.setTo(0.5, 1);
        //         var rate = side * 0.8 / fenceMiddle.width;
        //         fenceMiddle.scale.setTo(rate, rate);
        //         fenceMiddle.position.x = center;
        //         fenceMiddle.position.y = game.world.height * 0.5
        //
        //         var fenceRight = game.add.image(0, 0, "fence");
        //         fenceRight.anchor.setTo(0.5, 1);
        //         var rate = side * 0.8 / fenceRight.width;
        //         fenceRight.scale.setTo(rate, rate);
        //         fenceRight.position.x = right;
        //         fenceRight.position.y = game.world.height * 0.5
        //
        //         //提示向右滑动的动画,group+tween
        //         var group = game.add.group();
        //         group.create(0, 0, "cake");
        //         //group.anchor.setTo(0.5,1);
        //         group.position.x = center - group.width / 2;
        //         group.position.y = game.height * 0.1
        //         //tween
        //         //game.add.tween(group).to({x: left - group.width / 2}, 2000, null, true, 200, -1, false)
        //         game.add.tween(group).to({alpha: 0}, 1000, null, true, 200, -1, false)
        //         $("body").on("tap",function(){
        //             console.log(1)
        //         })
        //     }
        // };

        game.States.play = function () {
            this.create = function () {

                // var groupM = game.add.group();
                // groupM.enableBody=true;
                //groupM.create(0,0,"fence")

                side = game.world.width / 3;

                center = game.world.centerX;
                left = center - side;
                right = center + side;

                var bg = game.add.image(0, 0, "bg");
                var bgs = game.world.width / bg.width;
                bg.scale.setTo(bgs, bgs);

                //使用bgMap接收bg图像,然后放进tileSprite中,因为tile无法进行自动缩放
                // var bgMap = game.make.bitmapData(game.world.width, game.world.height);
                //
                // var bgaImg = game.add.image(0, 0, "bga");
                // var bgaImgs = game.world.width / bgaImg.width;
                // bgaImg.scale.setTo(bgaImgs, bgaImgs);
                // bgaImg.destroy();
                //
                // bgMap.draw(bgaImg, 0, 0);
                //
                // var bga = game.add.tileSprite(0, 0, game.world.width, game.world.height, bgMap);
                // bga.autoScroll(0, speed);


                //新方法
                var bgTP=game.add.image(0,0,"bga");
                bgTP.destroy();

                var bga = game.add.tileSprite(0, 0, game.world.width, game.world.height, "bga");
                var bgas=game.world.width/bgTP.width;
                bga.tileScale.setTo(bgas, bgas);
                bga.autoScroll(0, speed/bgas);



                // var trackL=game.add.tileSprite(0,0,side,game.world.height,"trackLR");
                // //var tracks=side/trackL.width;
                // //trackL.scale.setTo(tracks,tracks);
                // var trackM=game.add.tileSprite(side,0,side,game.world.height,"trackM");
                // //trackM.scale.setTo(tracks,tracks);
                // var trackR=game.add.tileSprite(side*2,0,side,game.world.height,"trackLR");
                //trackR.scale.setTo(tracks,tracks);

                // trackL.autoScroll(0,bgSpeed);
                // trackM.autoScroll(0,bgSpeed);
                // trackR.autoScroll(0,bgSpeed);


                role = game.add.sprite(0, 0, "role");
                role.animations.add("run", [0, 1], 5, true);
                role.animations.add("jump", [2], 5, true);

                role.animations.play("run");

                role.anchor.setTo(0.5, 1);
                var rate = side * 0.6 / role.width;
                role.scale.setTo(rate, rate);
                role.position.x = center;
                role.position.y = game.world.height * 0.8;
                game.physics.enable(role, Phaser.Physics.ARCADE);

                //role.body.setSize(0.6,0.6,0,role.width*0.6);

                //game.physics.startSystem(Phaser.Physics.ARCADE);

                setTimeout(guideR, 0);
                setTimeout(guideRT, 1500);
                setTimeout(guideL, 2000);
                setTimeout(guideLT, 3500);
                setTimeout(guideJ, 4000);
                setTimeout(guideJT, 5500);

                //引导关结束后的定时器
                setTimeout(function () {
                    //引导关结束后开始递增速度
                    speedAdd.start();
                    //引导关结束后开始正式生成障碍物,同时障碍物的生成速度会分段改变
                    monsterCreateSpeed.start();
                }, 6000);

                //从一开始便执行的分数定时器以及改变跳跃时间
                var scoreTimer = game.time.create();
                scoreTimer.loop(100, function () {
                    scroll += speed / 10;
                    scoreAdd();
                    jumpTime = returnMinJTime();
                });
                scoreTimer.start();

                function guideR() {
                    createMonster("fence", center, speed);
                    createMonster("fence", left, speed);
                }

                function guideRT() {
                    var group = game.add.group();
                    group.create(0, 0, "handR");
                    //group.anchor.setTo(0.5,1);
                    group.position.x = center - group.width / 2;
                    group.position.y = game.height * 0.1
                    //tween
                    game.add.tween(group).to({x: right - group.width / 2}, 1000, null, true, 200, 0, false)
                    game.add.tween(group).to({alpha: 0}, 1000, null, true, 200, 0, false)
                }

                function guideL() {
                    createMonster("fence", right, speed);
                }

                function guideLT() {
                    var group = game.add.group();
                    group.create(0, 0, "handL");
                    //group.anchor.setTo(0.5,1);
                    group.position.x = center - group.width / 2;
                    group.position.y = game.height * 0.1
                    //tween
                    game.add.tween(group).to({x: left - group.width / 2}, 1000, null, true, 200, 0, false)
                    game.add.tween(group).to({alpha: 0}, 1000, null, true, 200, 0, false)
                }

                function guideJ() {
                    //createMonster("fence", left, speed);
                    //createMonster("fence", right, speed);
                    createMonster("fence", center, speed);
                }

                function guideJT() {
                    var handJ = game.add.image(center, game.height * 0.1, "handJ");
                    handJ.anchor.setTo(0.5, 0);
                    game.add.tween(handJ).to({alpha: 0}, 1000, null, true, 200, 0, false);
                }

                var monsters = ["fence", "trap", "money", "barrier"];
                var posin = [left, center, right];


                // game.time.advancedTiming = true;

                $('body').on('swipeLeft', function () {
                    if (role.position.x == right) {
                        game.add.tween(role).to({x: center}, 100, null, true, 0, 0, false);
                    } else {
                        game.add.tween(role).to({x: left}, 100, null, true, 0, 0, false);
                    }
                });

                $("body").on("swipeRight", function () {
                    if (role.position.x == left) {
                        game.add.tween(role).to({x: center}, 100, null, true, 0, 0, false);
                    } else {
                        game.add.tween(role).to({x: right}, 100, null, true, 0, 0, false);
                    }
                });

                $("body").on("tap", function () {
                    // if (role) {
                    //     var center = role.position.x;
                    //     role.destroy()
                    // }
                    // role = game.add.sprite(0, 0, "roleA");
                    // role.anchor.setTo(0.5, 1);
                    // var rate = side * 0.8 / role.width;
                    // role.scale.setTo(rate, rate);
                    // role.position.x = center;
                    // role.position.y = game.world.height * 0.8;
                    if (!tapLock) {
                        //是否可以跳跃,有500MS的最小跳跃间隙
                        tapLock = true;
                        //跳跃是否完成,这个参数作为跳跃时判断死亡的重要参数
                        jumpComplete = false;
                        role.animations.play("jump");
                        game.add.tween(role.scale).to({
                            x: 1.5 * rate,
                            y: 1.5 * rate
                        }, jumpTime, Phaser.Easing.Sinusoidal.Out, true, 0, 0, false);
                        setTimeout(function () {
                            game.add.tween(role.scale).to({
                                x: rate,
                                y: rate
                            }, jumpTime, Phaser.Easing.Sinusoidal.In, true, 0, 0, false);
                        }, jumpTime);
                        setTimeout(function () {
                            // setTimeout(function () {
                                tapLock = false;
                            // }, 500);
                            jumpComplete = true;
                            role.animations.play("run")
                        }, jumpTime * 2)
                    }
                });

                // 参数分别是 控制怪物类型,位置
                function createMonster(obj, pos, speed, isTrue) {

                    monster[i] = game.add.sprite(pos, 0, obj);
                    monster[i].anchor.setTo(0.5, 1);
                    var rateF = side * 0.5 / monster[i].width;
                    monster[i].scale.setTo(rateF, rateF);

                    monster[i].outOfBoundsKill = true;
                    monster[i].checkWorldBounds = true;

                    game.physics.enable(monster[i], Phaser.Physics.ARCADE);
                    monster[i].body.setSize(0.6, 0.6,0,monster[i].width*0.4);
                    monster[i].body.velocity.y = speed;
                    //console.log(monster[i]);
                    i++;
                    if (isTrue) {
                        var nPos = posin[game.rnd.between(0, 2)];
                        var nObj = monsters[game.rnd.between(0, 3)];
                        while (nPos == pos) {
                            nPos = posin[game.rnd.between(0, 2)];
                        }
                        monster[i] = game.add.sprite(nPos, 0, nObj);
                        monster[i].anchor.setTo(0.5, 1);
                        var rateF = side * 0.5 / monster[i].width;
                        monster[i].scale.setTo(rateF, rateF);

                        monster[i].outOfBoundsKill = true;
                        monster[i].checkWorldBounds = true;

                        game.physics.enable(monster[i], Phaser.Physics.ARCADE);
                        monster[i].body.setSize(0.6, 0.6,0,monster[i].width*0.4);
                        monster[i].body.velocity.y = speed;
                        //console.log(monster[i]);
                        i++;
                    }
                }

                // function createFence(pos){
                //     fence[i]=game.add.sprite(pos,0,"fence");
                //     fence[i].anchor.setTo(0.5, 1);
                //     var rateF = side * 0.6 / fence[i].width;
                //     fence[i].scale.setTo(rateF, rateF);
                //
                //     fence[i].outOfBoundsKill=true;
                //     fence[i].checkWorldBounds=true;
                //
                //     game.physics.enable(fence[i], Phaser.Physics.ARCADE);
                //     fence[i].body.velocity.x=0
                //     fence[i].body.velocity.y = 300;
                //     i++;
                // }

                //分数增加函数 从一开始就执行
                function scoreAdd() {
                    if (scoreText) {
                        star.destroy();
                        scoreText.destroy();
                    }
                    var tp = Math.floor((scroll - scoreScroll) / 200);
                    if (tp > 0) {
                        scoreScroll = scroll;
                    }
                    scoreT += tp;
                    star = game.add.image(center - 20, game.world.height * 0.06, "star");
                    star.anchor.setTo(1, 0);
                    scoreText = game.add.text(center + 80, game.world.height * 0.06, scoreT, {
                        fontSize: "50px",
                        fill: '#FAF8EF'
                    });
                    scoreText.anchor.setTo(1, 0);
                }

                //人物起跳的最少需要时间 从一开始就执行
                function returnMinJTime() {
                    var roleH = side * 0.6;
                    var obj = side * 0.5;
                    return ((roleH + obj) / speed * 1000) * 1.1 / 2
                }

                //正式开始游戏 生成障碍物
                //写分段函数的定时器,以分数为分段调用 引导关结束后执行
                var flag1 = null, flag2 = null, flag3 = null, flag4 = null;

                var monsterTimer1 = game.time.create();
                monsterTimer1.loop(1000, function () {
                    // var tp = Math.floor((scroll - timeScroll));
                    // if (tp > 1500) {
                    //     timeScroll=scroll;
                    //     createMonster(monsters[game.rnd.between(0, 3)], posin[game.rnd.between(0, 2)], speed, isTwo)
                    // }
                    flag1 = true;
                    createMonster(monsters[game.rnd.between(0, 3)], posin[game.rnd.between(0, 2)], speed, isTwo)
                });

                var monsterTimer2 = game.time.create();
                monsterTimer2.loop(700, function () {
                    flag2 = true;
                    createMonster(monsters[game.rnd.between(0, 3)], posin[game.rnd.between(0, 2)], speed, isTwo)
                });

                var monsterTimer3 = game.time.create();
                monsterTimer3.loop(1000, function () {
                    flag3 = true;
                    createMonster(monsters[game.rnd.between(0, 3)], posin[game.rnd.between(0, 2)], speed, isTwo)
                });

                var monsterTimer4 = game.time.create();
                monsterTimer4.loop(700, function () {
                    flag4 = true;
                    createMonster(monsters[game.rnd.between(0, 3)], posin[game.rnd.between(0, 2)], speed, isTwo)
                });

                //生成障碍物的控制器,引导关后开始执行,根据分数改变生成怪物的速度
                var monsterCreateSpeed = game.time.create();
                monsterCreateSpeed.loop(100, function () {
                    if (!flag1) {
                        monsterTimer1.start()
                    }
                    if (scoreT > 30 && scoreT < 80) {
                        if (!flag2) {
                            monsterTimer1.stop();
                            monsterTimer2.start()
                        }
                    }
                    if (scoreT > 80 && scoreT < 144) {
                        if (!flag3) {
                            monsterTimer2.stop();
                            monsterTimer3.start()
                        }
                    }
                    if (scoreT > 144) {
                        if (!flag4) {
                            monsterTimer3.stop();
                            monsterTimer4.start();
                        }
                    }
                });

                // timerTP=setTimeout(function(){
                //             createMonster(monsters[game.rnd.between(0, 3)], posin[game.rnd.between(0, 2)], speed,isTwo)
                //             setTimeout(arguments.callee,createSpeed)
                // },createSpeed)

                //速度增加函数 一开始就执行
                var speedAdd = game.time.create();
                speedAdd.loop(100, function () {
                    speed += 1.5;
                    createSpeed -= 500;
                    bga.autoScroll(0, speed/bgas);

                    for (var i = 0, len = monster.length; i < len; i++) {
                        if (monster[i].body) {
                            monster[i].body.velocity.y = speed;
                        }
                    }
                    if (scoreT > 100 && scoreT < 170) {
                        speedAdd.stop();
                    }
                    //分数超过170,再次加速,憋死
                    if (scoreT > 170) {
                        speed += 0.5;
                    }
                    if (scoreT > 80) {
                        isTwo = true;
                    }

                })
            };
            this.update = function () {
                // 每一帧更新都会触发

                game.world.bringToTop(role);
                //碰撞判断 还没处理跳高判断
                // 增加跳高处理 tapLock为FALSE时,此时为非跳跃状态 可以判断死亡
                if (jumpComplete) {
                    for (var i = 0, len = monster.length; i < len; i++) {
                        game.physics.arcade.overlap(role, monster[i], function () {
                            this.lap(monster[i])
                        }, null, this);
                        //console.log(role.position.y);
                    }
                }
            };

            // this.render = function () {
            //     for (var i = 0, len = monster.length; i < len; i++) {
            //         game.debug.body(monster[i]);
            //     }
            // };

            //碰撞回调
            this.lap = function (obj, Z) {
                if (obj.key == "money") {
                    scoreT++;
                    obj.destroy();
                } else {
                    // var die = game.add.image(obj.position.x, obj.position.y, "die");
                    // die.anchor.setTo(0.5, 1);
                    // var rate = side * 0.8 / die.width;
                    // die.scale.setTo(rate, rate);
                    // this.gameEnd();
                }
            };

// this.render = function() {
//     console.log(game.time.fps);
// }
// this.render = function() {
//     game.debug.body(role);
// };
// 游戏结束
            this.gameEnd = function () {
                game.paused = true;
                console.log("得分是: ");
                //alert("得分是: " + scoreT);
            };
        }
        ;

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
        game.state.add('guideLeft', game.States.guideLeft);
        game.state.add('guideRight', game.States.guideRight);
        game.state.add('guideJump', game.States.guideJump);
        game.state.add('play', game.States.play);
        game.state.add('end', game.States.end);
        game.state.start('boot');
    }
}
;

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
