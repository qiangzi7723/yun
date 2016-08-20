//注释,遗留的问题,无法重新开始,ADD.IMAGE要删除,是否修改

// var gameManager;
// $(document).ready(function() {
// 	gameManager = new Game();
// 	gameManager.init();
// });
/** 
	提交分数 接口
	setGameScore({
		'game_score':score,
		'game_id':game_info['game_id'],
		'device_type':self.device.platform
	});
**/
var Game = function(bestScore, config ,domId) {
	this.bestScore = bestScore || 0;
	this.config = config;
	this.domId = domId || '';
};

/* 游戏属性 */
Game.prototype = {
	// 得分
	score : 0,
	// 最高得分
	bestScore : 0,
	// 初始化标记
	isInit : false,
	// 音乐管理器
	musicManager : null,
	// 插入的domId
	domId : null,
	// 设备信息
	device : {
		type : null,
		platform : null,
		width : 0,
		height : 0
	},
	// 画布大小
	canvasSize : {
		width : 0,
		height : 0,
		ratio : 0
	},
	// phaser游戏对象实例
	instance : null,

	// 初始化-设备信息
	initDevice : function() {
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
	initCanvasSize : function() {
		if (window.innerWidth < window.innerHeight) {
			this.canvasSize.width = window.innerWidth * 2;
			this.canvasSize.height = window.innerHeight * 2;
			this.canvasSize.ratio = this.canvasSize.width/this.canvasSize.height;
		}
	},
	// 初始化-游戏
	init : function() {
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
		game.States.boot = function() {
			this.preload = function() {
				// 设置画布大小
				$(game.canvas).css("width", self.canvasSize.width/2);
				$(game.canvas).css("height", self.canvasSize.height/2);
				// 设置默认背景颜色
				game.stage.backgroundColor = '#aaa';
			};
			this.create = function() {
				// 进入preload状态
				game.state.start('preload');
			};
		};

		// State - preload
		// 加载游戏所需资源
		game.States.preload = function() {
			this.preload = function() {
				// 说明：加载页面至少显示3秒，由deadline控制是否允许进入下一个状态
				var deadLine = false;
				setTimeout(function() {
					deadLine = true;
				}, 3000);
				// 加载完成回调
				function callback(){
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
				game.load.onFileComplete.add(function(progress){
					$('.bar').width(2.6*progress/100 + 'rem');
				});
				// 加载资源
				//game.load.image('score', 'assets/images/score.png');

				//加载2048素材图片资源
				var config = self.config['game'];

				game.load.image("2",config['2']);
				game.load.image("4",config['4']);
				game.load.image("8",config['8']);
				game.load.image("16",config['16']);
				game.load.image("32",config['32']);
				game.load.image("64",config['64']);
				game.load.image("128",config['128']);
				game.load.image("256",config['256']);
				game.load.image("512",config['512']);
				game.load.image("1024",config['1024']);
				game.load.image("2048",config['2048']);
				game.load.image("box_bg",config['box_bg']);
                //
				// //加载音乐资源
				// game.load.audio("music_bgm","assets/audio/bgm.mp3");
				// game.load.audio("music_tap","assets/audio/tap_music.mp3");
				// game.load.audio("music_level","assets/audio/level_music.mp3");

				if(config['bg'].indexOf('#') != 0){
					game.load.image('bg',config['bg']);
				}
				// game.load.atlasJSONArray('fort', "assets/images/fort.png", "assets/images/fort.json");
				// game.load.image('foreground', "assets/images/foreground.png");
				// game.load.image('ball_blue', "assets/images/ball_blue.png");
				// game.load.image('ball_yellow', "assets/images/ball_yellow.png");
				// game.load.image('clock', "assets/images/clock.png");
				// game.load.image('boom', "assets/images/boom.png");
				// game.load.image('plus', "assets/images/plus.png");
				// game.load.image('minus', "assets/images/minus.png");
				//加载音效
				game.load.audio('music_bgm',config['music_bgm']);
				if (self.device.platform != 'android') {
					game.load.audio('music_tap',config['music_tap']);
					game.load.audio('music_level',config['music_level']);
				}
			};
		};

		// State - create
		// 开始界面
		game.States.create = function() {
			this.create = function() {
				game.state.start('play');
				// 创建音乐管理器
				self.musicManager = new MusicManager(game, self.device, ['music_bgm','music_tap','music_level']);
				// 显示开始菜单页面 使用dom构建
				$('#start-menu').show();
			}
		};


		var fontSize = '80px';
		var speed = 30;
		var delta = 12;
		var side;
		var radius = 20;
		var score = 0;
		var scoreText;
		var data = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
		var i;
		var j;
		var color = {
			num_a: "#776E65",
			num_b: "#FAF8EF",
			num_0: "#CDC1B4",
			num_2: "#EEE4DA",
			num_4: "#EDE0C8",
			num_8: "#F59563",
			num_16: "#F6923B",
			num_32: "#F6754A",
			num_64: "#F65E3B",
			num_128: "#A12A2A",
			num_256: "#FFCD43",
			num_512: "#FFDD80",
			num_1024: "#ED9389",
			num_2048: "#66262",
			num_4096: "#A12A2A",
			num_8192: "#FFCD43",
			num_16384: "#FFDD80",
			num_32768: "#ED9389",
			num_65536: "#66262"



		};
		var deltaGround = 200;

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

		var rectBitmap, rectGroup, block_background, game_json;
		// State - play
		// 游戏界面
		game.States.play = function(){
			this.create = function(){

				self.musicManager.play("music_bgm", true);

				//可配置的被背景色
				if(self.config['game']['bg'].indexOf('#') == 0){
					game.stage.backgroundColor = self.config['game']['bg'];
				} else {
					var bg = game.add.image(0, 0, "bg");
					bg.width = self.canvasSize.width;
					bg.height = self.canvasSize.height;
				}
				//game.stage.backgroundColor = '#71c5cf';

				// 新建一个背景板块：白色背景
				var new_width = game.world.width * 0.9;
				rectBitmap = game.add.bitmapData(new_width, new_width);
				rectBitmap.context.roundRect(0, 0, new_width, new_width, radius);
				rectBitmap.context.fillStyle = "#FAF8EF";
				rectBitmap.context.fill();
				var block = game.add.image(game.world.centerX, game.world.centerY - deltaGround, rectBitmap);
				block.anchor.setTo(0.5, 0.5);


				// 分数框
				//var score = game.add.sprite(block.x, block.y + block.height / 2 + 200, 'score');
				//score.anchor.setTo(0.5, 0.5);


				var start_point_x = game.world.centerX - block.width / 2 + delta;
				var start_point_y = (game.world.centerY - deltaGround) - block.height / 2 + delta;

				// 新建空白背景：空白的小方块
				var block_width = (new_width - 5 * delta) / 4;
				side = block_width;
				var bg_temp=game.add.image(0,0,"box_bg");
				var Y=side/bg_temp.width;
				bg_temp.destroy();

				//block_background = game.add.bitmapData(side, side);

				//block_background.context.roundRect(0, 0, side, side, 20);
				//block_background.context.fillStyle = "#CDC1B4";
				//block_background.context.fill();

				for (i = 0; i < 4; i++) {
					for (j = 0; j < 4; j++) {
						var x = calc(start_point_x, i, side);
						var y = calc(start_point_y, j, side);
						var bg_img=game.add.image(x, y, "box_bg");
						bg_img.scale.setTo(Y,Y);
					}
				}


				// 生成所有的方块
				var block_json = {};
				//下面的LEVEL栏也要用到这个
				var nums = [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048];
				var num_color;
				var num_background;

				//这里存在一个BUG,需要手动删除GAME.ADD.IMAGE的图片。肯定有其他方法解决
				var num_temp=game.add.sprite(0,0,"2")
				var X=side/num_temp.width;
				num_temp.destroy();

				for (i = 0; i < nums.length; i++) {
					// if (nums[i] <= 4 || nums[i] >= 245) {
					// 	num_color = color['num_a']
					// } else {
					// 	num_color = color['num_b']
					// }
					// num_background = color['num_' + nums[i]];
					// block_width
					block_json[nums[i]] = game.add.bitmapData(side, side);

					// block_json[nums[i]].context.roundRect(0, 0, side, side, radius);
					// block_json[nums[i]].context.fillStyle = num_background;
					// block_json[nums[i]].context.fill();
					// block_json[nums[i]].context.fillStyle = num_color;
					// block_json[nums[i]].context.font = "60px Arial";
					// var textWidth = block_json[nums[i]].context.measureText(nums[i].toString()).width;
					//block_json[nums[i]].context.fillText(nums[i].toString(), side / 2 - textWidth / 2, side / 2 + 30);

					var nums_img=game.add.image(0,0,nums[i]+"");
					nums_img.scale.setTo(X,X)
					block_json[nums[i]].draw(nums_img,0, 0);
					nums_img.destroy()
				}


				// 初始化
				rectGroup = game.add.group();
				game_json = {};
				// var data = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];

				//随机选取一个位置,赋值2表示这个位置产生的值是2
				var r_one = random_choice(data);
				data[r_one[0]][r_one[1]] = 2;
				//随机选取第二个位置
				// var r_two = random_choice(data);
				// data[r_two[0]][r_two[1]] = 2;

				// //方便调试
				// var r_one = random_choice(data);
				// data[r_one[0]][r_one[1]] = 4;
				// var r_one = random_choice(data);
				// data[r_one[0]][r_one[1]] = 16;var r_one = random_choice(data);
				// data[r_one[0]][r_one[1]] = 64;var r_one = random_choice(data);
				// data[r_one[0]][r_one[1]] = 8;
				// var r_one = random_choice(data);
				// data[r_one[0]][r_one[1]] = 4;var r_one = random_choice(data);
				// data[r_one[0]][r_one[1]] = 32;var r_one = random_choice(data);
				// data[r_one[0]][r_one[1]] = 32;var r_one = random_choice(data);
				// data[r_one[0]][r_one[1]] = 16;var r_one = random_choice(data);
				// data[r_one[0]][r_one[1]] = 64;var r_one = random_choice(data);
				// data[r_one[0]][r_one[1]] = 4;var r_one = random_choice(data);
				// data[r_one[0]][r_one[1]] = 2;

				// data[0][0] = 2;
				// data[0][1] = 4;
				// data[0][2] = 8;
				// data[0][3] = 0;
				// data[1][0] = 4;
				// data[1][1] = 8;
				// data[1][2] = 0;
				// data[1][3] = 2;
				// data[2][0] = 8;
				// data[2][1] = 0;
				// data[2][2] = 2;
				// data[2][3] = 4;
				// data[3][0] = 0;
				// data[3][1] = 2;
				// data[3][2] = 4;
				// data[3][3] = 8;



				var block_exam;
				for (i = 0; i < 4; i++) {
					for (j = 0; j < 4; j++) {
						if (data[i][j] != 0) {
							var r_x_location = calc(start_point_x, j, side);
							var r_y_location = calc(start_point_y, i, side);
							block_exam = game.add.image(r_x_location, r_y_location, block_json[data[i][j]]);
							game_json[i.toString() + j.toString()] = block_exam;
						}
					}
				}

				var can_update;
				var current_block_info;
				var previous_block_info;
				var swipeLock = true;
				var level_value=0;
				// 绑定事件 down
				$('body').on('swipeDown', function() {
					if (swipeLock){
						self.musicManager.play("music_tap", false);
						swipeLock = false;
						var move_to;
						can_update = false;
						for (j = 0; j < 4; j++) {
							move_to = 3;
							for (i = 3; i >= 0; i--) {
								if (data[i][j] != 0 && i < move_to) {
									var value = data[i][j];
									current_block_info = i.toString() + j.toString();
									previous_block_info = move_to.toString() + j.toString();
									if (data[i][j] == data[move_to][j]) {
										data[i][j] = 0;
										data[move_to][j] = value * 2;
										move_block_one(game_json, previous_block_info, current_block_info, start_point_x, start_point_y, move_to, i, j, block_json, value, true, data, can_update);
										move_to = move_to -1;
										can_update = true;
									} else {
										if (data[move_to][j] != 0) {
											move_to = move_to - 1;
										}
										if (i < move_to) {
											data[i][j] = 0;
											data[move_to][j] = value;
											move_block_one(game_json, previous_block_info, current_block_info, start_point_x, start_point_y, move_to, i, j, block_json, value, false, data, can_update);
											can_update = true;
										}
									}
								}
							}
						}
						// 随机生成新的方块...
						random_update(start_point_x, start_point_y, can_update, block_json, game_json, data);
						// scoreText.text = "score  "+get_max(data).toString();
						// self.score = get_max(data);
						setTimeout(function(){
							scoreText.text = "Level  " + self.score.toString();
						}, 100)
						if(!gameStatus(data)){
							console.log("Game Over!");
						}
						swipeLock = true;
					} 
				});


				// 绑定事件 up
				$('body').on('swipeUp', function() {
					if (swipeLock) {
						self.musicManager.play("music_tap", false);
						swipeLock = false;
						var move_to;
						can_update = false;
						for (j = 0; j < 4; j++) {
							move_to = 0;
							for (i = 0; i < 4; i++) {
								if (data[i][j] != 0 && i > move_to) {
									var value = data[i][j];
									current_block_info = i.toString() + j.toString();
									previous_block_info = move_to.toString() + j.toString();
									if (data[i][j] == data[move_to][j]) {
										data[i][j] = 0;
										data[move_to][j] = value * 2;
										move_block_one(game_json, previous_block_info, current_block_info, start_point_x, start_point_y, move_to, i, j, block_json, value, true, data, can_update);
										can_update = true;
										move_to = move_to + 1;
									} else {
										if (data[move_to][j] != 0) {
											move_to = move_to + 1;
										}
										if (i > move_to) {
											data[i][j] = 0;
											data[move_to][j] = value;
											move_block_one(game_json, previous_block_info, current_block_info, start_point_x, start_point_y, move_to, i, j, block_json, value, false, data, can_update);
											can_update = true;
										}
									}
								}
							}
						}
						// 随机生成新的方块...
						random_update(start_point_x, start_point_y, can_update, block_json, game_json, data);
						// scoreText.text = "score  "+get_max(data).toString();
						// self.score = get_max(data);
						setTimeout(function(){
							scoreText.text = "Level  " + self.score.toString();
						}, 100)
						if(!gameStatus(data)){
							console.log("Game Over!");
						}
						swipeLock = true;
					}
				});


				// 绑定事件 left
				$('body').on('swipeLeft', function() {
					if (swipeLock) {
						self.musicManager.play("music_tap", false);
						swipeLock = false;
						var move_to;
						can_update = false;
						for (i = 0; i < 4; i++) {
							move_to = 0;
							for (j = 0; j < 4; j++) {
								if (data[i][j] != 0 && j > move_to) {
									var value = data[i][j];
									current_block_info = i.toString() + j.toString();
									previous_block_info = i.toString() + move_to.toString();
									if (data[i][j] == data[i][move_to]) {
										data[i][j] = 0;
										data[i][move_to] = value * 2;
										move_block_two(game_json, previous_block_info, current_block_info, start_point_x, start_point_y, move_to, i, j, block_json, value, true, data, can_update);
										can_update = true;
										move_to = move_to + 1;
									} else {
										if (data[i][move_to] != 0) {
											move_to = move_to + 1;
										}
										if (j > move_to) {
											data[i][j] = 0;
											data[i][move_to] = value;
											move_block_two(game_json, previous_block_info, current_block_info, start_point_x, start_point_y, move_to, i, j, block_json, value, false, data, can_update);
											can_update = true;
										}
									}
								}
							}
						}
						// 随机生成新的方块...
						random_update(start_point_x, start_point_y, can_update, block_json, game_json, data);
						// scoreText.text = "score  "+get_max(data).toString();
						// self.score = get_max(data);
						setTimeout(function(){
							scoreText.text = "Level  " + self.score.toString();
						}, 100)
						if(!gameStatus(data)){
							console.log("Game Over!");
						}
						swipeLock = true;
					}	
				});


				// 绑定事件 right
				$('body').on('swipeRight', function() {
					if (swipeLock) {
						self.musicManager.play("music_tap", false);
						swipeLock = false;
						var move_to;
						can_update = false;
						for (i = 0; i < 4; i++) {
							move_to = 3;
							for (j = 3; j >= 0; j--) {
								if (data[i][j] != 0 && j < move_to) {
									var value = data[i][j];
									current_block_info = i.toString() + j.toString();
									previous_block_info = i.toString() + move_to.toString();
									if (data[i][j] == data[i][move_to]) {
										data[i][j] = 0;
										data[i][move_to] = value * 2;
										move_block_two(game_json, previous_block_info, current_block_info, start_point_x, start_point_y, move_to, i, j, block_json, value, true, data, can_update);
										move_to = move_to - 1;
										can_update = true;
									} else {
										if (data[i][move_to] != 0) {
											move_to = move_to - 1;
										}
										if (j < move_to) {
											data[i][j] = 0;
											data[i][move_to] = value;
											move_block_two(game_json, previous_block_info, current_block_info, start_point_x, start_point_y, move_to, i, j, block_json, value, false, data, can_update);
											can_update = true;
										}
									}
								}
							}
						}
						// 随机生成新的方块...
						random_update(start_point_x, start_point_y, can_update, block_json, game_json, data);
						// scoreText.text = "score  "+get_max(data).toString();
						// self.score = get_max(data);
						setTimeout(function(){
							scoreText.text = "Level  " + self.score.toString();
						}, 100)
						if(!gameStatus(data)){
							console.log("Game Over!");
						}
						swipeLock = true;
					}	
				});


				// score  block.x, block.y + block.height / 2 + 200
				scoreText = game.add.text(block.x, block.y + block.height / 2 + 200 + 20, "Level  "+level_value, { fontSize: fontSize, fill: '#FAF8EF'});
				// scoreText = game.add.text(score.x, score.y + 20, "score  "+'2', { fontSize: fontSize, fill: '#FAF8EF'});
				scoreText.anchor.setTo(0.5, 0.5);


				function move_block_one(game_json, previous_block_info, current_block_info, start_point_x, start_point_y,
										move_to, i, j, block_json, value, flag, data, can_update) {
					var tween;
					var obj;
					var previous = game_json[previous_block_info];
					var current = game_json[current_block_info];
					if (flag) {
						tween = game.add.tween(game_json[current_block_info]).to({y: calc(start_point_y, move_to, side)}, speed, Phaser.Easing.Circular.None, true, 0);
						tween.onComplete.add(function() {
							previous.kill();
							current.kill();
							game_json[move_to.toString() + j.toString()] = game.add.image(calc(start_point_x, j, side), calc(start_point_y, move_to, side), block_json[value * 2]);
							//修改成为LEVEL显示
							if(value>level_value){
								self.musicManager.play("music_level", false);
								self.score = nums.indexOf(value)+1;
								level_value=value;
							}
						});
					} else {
						obj = game_json[current_block_info];
						game_json[move_to.toString() + j.toString()] = game_json[current_block_info];
						game_json[current_block_info] = null;
						game.add.tween(obj).to({y: calc(start_point_y, move_to, side)}, speed, Phaser.Easing.Circular.None, true, 0);
					}
				}

				function move_block_two(game_json, previous_block_info, current_block_info, start_point_x, start_point_y,
										move_to, i, j, block_json, value, flag, data, can_update) {
					var tween;
					var obj;
					var previous = game_json[previous_block_info];
					var current = game_json[current_block_info];
					if (flag) {
						tween = game.add.tween(game_json[current_block_info]).to({x: calc(start_point_x, move_to, side)}, speed, Phaser.Easing.Circular.None, true, 0);
						tween.onComplete.add(function() {
							previous.kill();
							current.kill();
							game_json[i.toString() + move_to.toString()] = game.add.image(calc(start_point_x, move_to, side), calc(start_point_y, i, side), block_json[value * 2]);
							if(value>level_value){
								self.musicManager.play("music_level", false);
								self.score = nums.indexOf(value)+1;
								level_value=value;
							}
						});
					} else {
						obj = game_json[current_block_info];
						game_json[i.toString() + move_to.toString()] = game_json[current_block_info];
						game_json[current_block_info] = null;
						game.add.tween(obj).to({x: calc(start_point_x, move_to, side)}, speed, Phaser.Easing.Circular.None, true, 0);
					}
				}

				function random_update(start_point_x, start_point_y, can_update, block_json, game_json, data) {
					// 随机生成新的方块...
					if (can_update) {
						var new_num = random_create();
						var new_position = random_choice(data);
						if (new_position) {
							setTimeout(function(){
								var new_i = new_position[0];
								var new_j = new_position[1];
								data[new_i][new_j] = new_num;
								// for (var index in data) console.log(new_i, new_j, new_num);
								game_json[new_i.toString() + new_j.toString()] = game.add.image(calc(start_point_x, new_j, side), calc(start_point_y, new_i, side), block_json[new_num]);
								return [[new_i, new_j], new_num];
							}, speed + 50)
						} else {
							setTimeout(function(){
								return false;
							}, speed + 50)
						}
					}
				}

				function random (start_num, end_num) {
					// 在区间中生成随机整数
					return Math.floor(Math.random() * (end_num + 1 - start_num) * start_num) + 1
				}

				function get_max(data) {
					// 获取矩阵中的最大值
					var max_num = 0;
					for (i = 0; i < 4; i++) {
						for (j = 0; j < 4; j++) {
							if (data[i][j] > max_num) {
								max_num = data[i][j];
							}
						}
					}
					return max_num
				}

				function random_choice(table){
					// 从数组中随机选择值
					var temp = [];
					for (i = 0; i < table.length; i++){
						for(j = 0; j < table[0].length; j++){
							if(table[i][j] == 0){
								temp.push([i, j])
							}
						}
					}
					if (temp == []) {
						return false
					} else {
						return temp[random(1, temp.length) - 1]
					}
				}

				function random_create(){
					// 随机生成2或者4
					var r_num = random(1, 100);
					if (r_num > 30) {
						return 2
					} else {
						return 4
					}
				}

				function calc (start_point, index, side) {
					return start_point + index * (side + delta)
				}


				var playState = this;
				function gameStatus(data) {
					var game_status = false;
					for(i = 0; i < data.length; i++) {
						for(j = 0; j < data[0].length; j++){
							var dataUp = i - 1 < 0 ? undefined : data[i -1][j];
							var dataDown = i + 1 < data.length ? data[i + 1][j] : undefined;
							var dataLeft = j - 1 < 0 ? undefined : data[i][j - 1];
							var dataRight = j + 1 < data.length ? data[i][j + 1] : undefined;
							var dataAround = [dataUp, dataDown, dataLeft, dataRight];
							if(dataAround.indexOf(data[i][j]) >= 0 || data[i][j] == 0){
								game_status = true;
								break;
							} else {
								game_status = false;
							}
						}
						if(game_status){
							break
						}
					}
					if (!game_status){
						playState.gameEnd()
						console.log("OVER");
					}
					return game_status;
				}

				// if(self.config['game']['bg'].indexOf('#') == 0){
				// 	game.stage.backgroundColor = self.config['game']['bg'];
				// } else {
				// 	var bg = game.add.image(0, 0, "bg");
				// 	bg.width = self.canvasSize.width;
				// 	bg.height = self.canvasSize.height;
				// }
				// 此处写游戏逻辑

				//self.musicManager.play("bgMusic", true);
				//this.gameEnd();


			};
			this.update = function() {
				// 每一帧更新都会触发
			};
			// 游戏结束
			this.gameEnd = function() {
				game.paused = true;
				console.log("级别是: "+self.score);
				alert("级别是: "+self.score);

				level_value=0;
				self.score=0;
				//不起效果
				game.state.start("end");

			};
		};
		
		// State - end
		// 游戏结束界面
		game.States.end = function() {
			this.create = function() {
				// 游戏结束
				//为什么不起效果
				console.log(1)
				game.state.start("play");
			}
		};

		// 添加游戏状态
		game.state.add('boot',game.States.boot);
		game.state.add('preload',game.States.preload);
		game.state.add('create',game.States.create);
		game.state.add('play',game.States.play);
		game.state.add('end',game.States.end);
		game.state.start('boot');
	}
};



/* 音乐管理器 */
var MusicManager = function(gameInstance, deviceInfo, assets) {
	this.gameInstance = gameInstance;
	this.deviceInfo = deviceInfo;
	this.assets = assets;
	this.init();
};
MusicManager.prototype = {
	// 游戏实例
	gameInstance : null,
	// 设备信息
	deviceInfo : null,
	// 资源
	assets : null,
	// 音乐对象
	musicObject : null,
	// 静音标记
	isBaned : false,
	// 是否播放中
	isPlaying : false,
	// 正在播放列表
	playingList : [],
	// 初始化
	init : function() {
		var self = this;
		if (this.assets) {
			this.musicObject = {};
			for (var index=0,len = this.assets.length;index<len;index++) {
				var audio = this.gameInstance.add.audio(this.assets[index]);
				audio.name = this.assets[index];
				audio.onPause.add(function() {
					self.playingList = self.playingList.splice(self.playingList.indexOf(audio.name), 1);
					if (self.playingList.length == 0) self.isPlaying = false;
				});
				audio.onStop.add(function() {
					self.playingList = self.playingList.splice(self.playingList.indexOf(audio.name), 1);
					if (self.playingList.length == 0) self.isPlaying = false;
				});
				this.musicObject[this.assets[index]] = audio;
			}
		}
	},
	// 播放
	play : function(assetName, loop) {
		if (!this.isBaned) {
			var playTag = false;
			if (this.deviceInfo.platform == "apple") {
				playTag = true;
			} else if (this.deviceInfo.platform == "android" && !this.isPlaying) {
				playTag = true;
			}
			if (playTag) {
				if (loop) {
					if (!this.musicObject[assetName].isPlaying){
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
	resume : function() {
		for (var item in this.playingList) {
			var name = this.playingList[item];
			this.musicObject[name].resume();
		}
		this.isPlaying = true;
	},
	pause : function() {
		for (var item in this.playingList) {
			var name = this.playingList[item];
			this.musicObject[name].pause();
		}
		this.isPlaying = false;
	},
	stop : function() {
		for (var item in this.playingList) {
			var name = this.playingList[item];
			this.musicObject[name].stop();
		}
		this.isPlaying = false;
		this.playingList = [];
	},
	ban : function() {
		this.isBaned = true;
		this.pause();
	},
	disban : function() {
		this.isBaned = false;
		this.resume();
	}
};
