<?php 
	// 奖品配置
	$gift_config = CJSON::decode($game_info["gift_config"], true);
	$original_gift = CJSON::decode($game_info["original_gift"], true);
	$all_gift_config = CJSON::decode($game_info["all_gift_config"], true);
	// 表单配置
	$default_msg_config = CJSON::decode($game_info["default_msg_config"], true);
	// 额外信息
	$tpl_ext_info = CJSON::decode($tpl_info["ext_info"], true);
	$tpl_ext_info_disable = empty($tpl_ext_info) ? null : (empty($tpl_ext_info["disable"]) ? null : $tpl_ext_info["disable"]);
	$tpl_ext_info_css = empty($tpl_ext_info) ? null : (empty($tpl_ext_info["css"]) ? null : $tpl_ext_info["css"]);
	$numberString = array("一", "二", "三", "四", "五", "六", "七", "八", "九", "十");

	$replace_str = "{score}";
	$replace_str_cn = "分数";
	if ($tpl_info["type"] == 2) { // 抽奖类
		$replace_str = "{result}";
		$replace_str_cn = "奖品名称";
	} else if ($tpl_info["type"] == 4) { // 通关类
		$replace_str = "{level}";
		$replace_str_cn = "关卡数";
	}
?>

<link rel="stylesheet" href="//24haowan-cdn.shanyougame.com/public/css/ios-switch.css">
<link rel="stylesheet" href="/css/dev/workbench.css?v=<?php echo Yii::app()->params['version']; ?>">
<!-- 类型CSS -->
<?php if ($tpl_info["type"] == 2): ?>
<link rel="stylesheet" href="/css/t/lottery.css?v=<?php echo Yii::app()->params['version']; ?>">
<?php elseif ($tpl_info["type"] == 3): ?>
<link rel="stylesheet" href="/css/t/dom.css?v=<?php echo Yii::app()->params['version']; ?>">
<?php elseif ($tpl_info["type"] == 4): ?>
<link rel="stylesheet" href="/css/t/level.css?v=<?php echo Yii::app()->params['version']; ?>">
<?php endif; ?>
<!-- 额外CSS -->
<?php if (!empty($tpl_ext_info_css)): ?>
<?php foreach ($tpl_ext_info_css as $css): ?>
<link rel="stylesheet" href="<?php echo $css; ?>?v=<?php echo Yii::app()->params['version']; ?>">
<?php endforeach; ?>
<?php endif; ?>



<!-- 顶部导航 -->
<div id="ul-container">
	<ul>
		<li class="active" name="basic"><a href="javascript:;">基本信息</a></li>
		<li name="assets" id="assets-nav-0"><a href="javascript:;"><div class="icon-loading-pay"></div>加载页</a></li>
		<li name="assets" id="assets-nav-1"><a href="javascript:;">开始页</a></li>
		<li name="assets" id="assets-nav-2"><a href="javascript:;">活动页</a></li>
		<li name="assets" id="assets-nav-3"><a href="javascript:;">结束页</a></li>
		<li name="gameinfo"><a href="javascript:;">营销设置</a></li>
		<li name="share"><a href="javascript:;">分享设置</a></li>
	</ul>
</div>

<!-- 左侧预览手机 -->
<div class="preview-wrapper">
	<div class="preview-container">
		<!-- 侧边的条 -->
		<div class="preview-show-qrcode">
			<div>扫码预览</div>
			<img src="//24haowan-cdn.shanyougame.com/public/images/web/icon-show-qrcode-gray.png">
		</div>
		<!-- 二维码预览 -->
		<div class="qrcode-container">
			<img src="/webCustom/DownloadQr/game_id/<?php echo $game_info['game_id']; ?>/test/1">
            <button class="btn btn-g btn-l" ><a href="/webCustom/DownloadQr/game_id/<?php echo $game_info['game_id']; ?>/test/1">下载二维码</a></button>
		</div>
		<!-- 加载页 -->
		<div id="preview-custom-0" class="preview-custom-container hidden">
			<div id="loading" style="<?php echo (strpos($platform_config["style"]["loadingColor"], "#") === 0) ? ("background-color:".$platform_config["style"]["loadingColor"].";") : ("background-image:url('".$platform_config["style"]["loadingColor"]."');"); ?>">
				<div class="box">
					<img id="loading-img" src="<?php echo $platform_config["style"]["loadingBanner"]; ?>">
		            <div class="progress">
						<div class="bar" style="width: 65%;background-color: <?php echo $platform_config["style"]["barColor"]; ?>"></div>
					</div>
				</div>
			</div>
		</div>
		<!-- 开始页 -->
		<div id="preview-custom-1" class="preview-custom-container">
			<div id="start-menu" style="<?php echo (strpos($platform_config["style"]["background"]["start-menu"], "#") === 0) ? ("background-color:".$platform_config["style"]["background"]["start-menu"].";") : ("background-image:url('".$platform_config["style"]["background"]["start-menu"]."');"); ?>">
				<div class="best-score">
					<span class="score-icon"><img src="//24haowan-cdn.shanyougame.com/public/images/t/rankIcon.svg"></span>
					<span class="score-text" style="color: <?php echo $platform_config["style"]["best-score-text"]; ?>">最好成绩:<span class="score">10000</span></span>
				</div>
				<div class="start-menu-main">
					<div class="custom-container">
						<div class="game-title game-title-color" style="<?php echo "color:".$platform_config["style"]["game-title-color"]; ?>"><span class="<?php echo empty($platform_config["game-title-img"]) ? "" : ($platform_config["game-title-img-show"] ? "hidden" : ""); ?>"><?php echo $game_info['name']; ?></span><img src="<?php echo empty($platform_config["game-title-img"]) ? "" : $platform_config["game-title-img"]; ?>" class="<?php echo empty($platform_config["game-title-img"]) ? "hidden" : ($platform_config["game-title-img-show"] ? "" : "hidden"); ?>"></div>
						<div class="game-img game-img-start-menu"><img src="<?php echo $platform_config["style"]["banner"]["start-menu"]; ?>"></div>
					</div>
					<div class="game-start-btn deputy-color deputy-btn" id="start" style="<?php echo "background:".$platform_config["style"]["color"]["deputy"].";border-bottom:2px solid ".$platform_config["style"]["color"]["deputy-shadow"]; ?>"><?php echo $platform_config["text"]["start"]; ?></div>
					<div class="game-rule-btn main-color main-btn" style="<?php echo "background:".$platform_config["style"]["color"]["main"].";border-bottom:2px solid ".$platform_config["style"]["color"]["main-shadow"]; ?>"><?php echo $platform_config["text"]["game-rule-btn"]; ?></div>
				</div>
				<div class="start-menu-foot">
					<div class="bottom-logo" style="<?php if (!empty($platform_config["bottom-show"])) echo $platform_config["bottom-show"] ? "" : "display:none" ?>">
						<?php if ($platform_config["text"]["brand-text"] != ""):  ?>
						<span class="icon" style="color: <?php echo $platform_config["style"]["brand"]["brand-text"]; ?>"><?php echo $platform_config["text"]["brand-text"]; ?></span>
						<?php else: ?>
						<span class="icon" style="color: <?php echo $platform_config["style"]["brand"]["brand-text"]; ?>">24好玩微信活动定制</span>
						<?php endif; ?>
					</div>
				</div>
			</div>

			<?php 
				$giftActivityText = "";
				$giftActivityTextShow = true;
				if (!empty($platform_config["activity-gift-show"])) {
					if ($platform_config["activity-gift-show"] == "yes") {
						$giftActivityTextShow = true;
					} else {
						$giftActivityTextShow = false;
					}
				}
				if (!empty($gift_config) && $giftActivityTextShow) {
					$giftActivityText .= "<div id='activity-prize-container'><h3>奖品说明</h3>";
					foreach ($gift_config as $gift_config_item) {
						$conditionText = "";

						// 表头
						$type = "";
						if ($gift_config_item["type"] == 1) {
							$type = "rank";
							$giftActivityText .= "<p>按排名获奖</p><table><tr><th>名次</th><th>名称</th><th>总数</th></tr>";
						} else if ($gift_config_item["type"] == 3) {
							$type = "share";
							$giftActivityText .= "<p>分享即可获奖</p><table><tr><th>名称</th><th>总数</th></tr>";
						} else if ($gift_config_item["type"] == 4) {
							$type = "play";
							if (!empty($gift_config_item["cycle"])) {
								$cycle = $gift_config_item["cycle"];
								$giftActivityText .= "<p>参加即可获奖</p><table><tr><th>名称</th><th>".($cycle == "day" ? "每天" : ($cycle == "week" ? "每周" : "每月"))."</th></tr>";
							} else {
								$giftActivityText .= "<p>参加即可获奖</p><table><tr><th>名称</th><th>总数</th></tr>";
							}
						} else if ($gift_config_item["type"] == 5) {
							$type = "lottery";
							$giftActivityText .= "<p>抽奖获奖</p>";
							if (!empty($gift_config_item["cycle"])) {
								$cycle = $gift_config_item["cycle"];
								$giftActivityText .= "<p>周期性抽奖，".($cycle == "day" ? "每天" : ($cycle == "week" ? "每周" : "每月"))."可抽".$gift_config_item["cycle_num"]."次</p>";
							} else {
								$giftActivityText .= "<p>固定次数抽奖，活动期间每个用户有".$game_info["limit_times"]."次抽奖机会</p>";
							}
							$giftActivityText .= "<table><tr><th>抽奖条件</th><th>名称</th><th>总数</th></tr>";
						}
		                if (!empty($gift_config_item["prize"])) {
							$first_row = true;
		    				foreach ($gift_config_item["prize"] as $key => $prize) {
			                	if ($gift_config_item["type"] == 1) { // 按排名获奖
			                		if ($prize["interval"][0] == $prize["interval"][1]) {
			                			$conditionText = "<td>第".$prize["interval"][0].'名</td>';
			                		} else {
										$conditionText = "<td>第".$prize["interval"][0].'-'.$prize["interval"][1].'名</td>';
			                		}
								} else if ($gift_config_item["type"] == 5) {
									$conditionText = "<td rowspan='".count($gift_config_item["prize"])."'>";
									if ($gift_config_item["condition"] == "score") {
										if ($tpl_info["type"] == 1 || $tpl_info["type"] == 3) {
											$conditionText .= "分数大于".$gift_config_item["score"]."分";
										} else if ($tpl_info["type"] == 4) {
											if ($tpl_info["section"] == 1) { // 只有一关
												$conditionText .= "通关后";
											} else {
												$conditionText .= "通过第".$gift_config_item["score"]."关";
											}
										}
									} else if ($gift_config_item["condition"] == "play") {
										$conditionText .= "参加即可";
									} else if ($gift_config_item["condition"] == "share") {
										$conditionText .= "成功分享";
									}
		                			$conditionText .= "</td>";
								}

								if ($gift_config_item["type"] == 5) { // 抽奖合并条件
			    					if ($first_row) {
			    						$first_row = false;
			    					} else {
			    						$conditionText = "";
			    					}
								}

		    					$gift_name = "";
		    					if (!empty($user_gift_list)) {
		    						foreach($user_gift_list as $gift) {
		    							if ($gift["id"] == $prize["gift_id"]) {
		    								$gift_name = $gift["name"];
		    							}
		    						}
		    					}

		    					$num = 0;
		    					if ($type == "share" || $type == "play") {
		    						$num = $all_gift_config[$type]["num"];
		    						if ($type == "play" && !empty($gift_config_item["cycle"])) {
		    							$num = $all_gift_config[$type]["cycle_num"];
		    						}
		    					} else if ($type == "rank") {
		    						$num = $all_gift_config["rank"][$key]["num"];
		    					} else if ($type == "lottery") {
		    						$num = $all_gift_config["lottery"]["prize"][$key]["num"];
		    					}
		    					$giftActivityText .= "<tr>".$conditionText."<td>".$gift_name."</td><td>".$num."</td></tr>";
		    				}
		                }
		                $giftActivityText .= "</table>";

		                if ($gift_config_item["type"] == 5 && !empty($gift_config_item["add_chance"])) {
		                	$giftActivityText .= "<p>附：分享可获得额外抽奖机会</p>";
		                }
					}
					$giftActivityText .= "</div>";
				}
			?>
			<?php 
				$m_name_text = "";
				if (!empty($game_info['m_name'])) {
					$m_name_text = "<div id='mname-container'><h3>商户名称</h3><p>".$game_info['m_name']."</p></div>";
				}
			?>
			<?php 
				$activity_qrcode_text = "";
				if (!empty($platform_config["activity-qrcode"])) {
					if ($platform_config["activity-qrcode-show"]) {
						$activity_qrcode_text = "<div id='activity-qrcode-container'><h3>公众号二维码</h3><img id='activity-qrcode-img' src='".$platform_config["activity-qrcode"]."'><p style='text-align:center'>长按二维码关注</p></div>";
					}
				}
			?>
			<!-- 活动规则 活动公告 -->
			<div class="mask hidden" id="text-box-mask">
				<div class="text-box main-border" style="<?php echo "border-color:".$platform_config["style"]["color"]["main"].";"; ?> ">
					<div class="text-box-title main-color" style="<?php echo "background:".$platform_config["style"]["color"]["main"].";"; ?>">活动规则</div>
					<div class="text-content" style="color:<?php echo $platform_config["style"]["activity-text"]; ?>"><h3>活动时间</h3><p><?php echo substr($game_info["start_time"], 0, 16); ?> 至 <?php echo substr($game_info["end_time"], 0, 16); ?></p><h3>活动规则</h3><p><?php echo $platform_config["text"]["activity-text"]; ?></p><?php echo $giftActivityText; ?><?php echo $m_name_text; ?><?php echo $activity_qrcode_text; ?></div>
					<div class="close-btn main-color main-btn" style="<?php echo "background:".$platform_config["style"]["color"]["main"].";border-bottom:2px solid ".$platform_config["style"]["color"]["main-shadow"]; ?>">知道了</div>
				</div>
			</div>
            <div class="test-remind-div">测试版本，请勿外传。<img class="test-remind-close" src="//24haowan-cdn.shanyougame.com/public/images/t/icon-close-white.png"></div>
		</div>
		<!-- 游戏页 -->
		<iframe src="" class="preview-frame" id="preview-frame"></iframe>
		<!-- 结束页 -->
		<div id="preview-custom-3" class="hidden preview-custom-container">
			<?php if ($tpl_info["type"] == 1 || $tpl_info["type"] == 3):  ?>
			<!-- 结束界面 得分类 -->
			<div id="game-over-menu" class="game-over-menu" style="<?php echo (strpos($platform_config["style"]["background"]["game-over-menu"], "#") === 0) ? ("background-color:".$platform_config["style"]["background"]["game-over-menu"].";") : ("background-image:url('".$platform_config["style"]["background"]["game-over-menu"]."');"); ?>">
				<div class="best-score">
					<span class="score-icon"><img src="//24haowan-cdn.shanyougame.com/public/images/t/rankIcon.svg"></span>
					<span class="score-text" style="color: <?php echo $platform_config["style"]["best-score-text"]; ?>">最好成绩:<span class="score">10000</span></span>
				</div>
				<div class="gameover-menu-main">
					<div class="custom-container">
						<div class="game-img game-img-game-over-menu"><img src="<?php echo $platform_config["style"]["banner"]["game-over-menu"]; ?>"></div>
						<div class="game-score-box main-border" style="border-color: <?php echo $platform_config["style"]["color"]["main"]; ?>;color: <?php echo $platform_config["style"]["score-text"]; ?>">
							<div class="centerBox">
								<p class="scoreLabel">分数</p><p class="score">10000</p>
							</div>
						</div>
						<div class="gameover-remind">&nbsp;</div>
					</div>
					<div class="play-again-btn deputy-color deputy-btn" style="<?php echo "background:".$platform_config["style"]["color"]["deputy"].";border-bottom:2px solid ".$platform_config["style"]["color"]["deputy-shadow"]; ?>"><?php echo $platform_config["text"]["play-again-btn"]; ?></div>
					<div class="rank-btn main-color main-btn <?php if(isset($platform_config['disable-rank'])) echo $platform_config['disable-rank'] ? "hidden" : ""; ?>" style="<?php echo "background:".$platform_config["style"]["color"]["main"].";border-bottom:2px solid ".$platform_config["style"]["color"]["main-shadow"]; ?>"><?php echo $platform_config["text"]["rank-btn"]; ?></div>
					<div class="game-rule-btn main-color main-btn" style="<?php echo "background:".$platform_config["style"]["color"]["main"].";border-bottom:2px solid ".$platform_config["style"]["color"]["main-shadow"]; ?>"><?php echo $platform_config["text"]["game-rule-btn"]; ?></div>
				</div>
				<div class="gameover-menu-foot">
					<div class="bottom-logo" style="<?php if (!empty($platform_config["bottom-show"])) echo $platform_config["bottom-show"] ? "" : "display:none" ?>">
						<?php if ($platform_config["text"]["brand-text"] != ""):  ?>
						<span class="icon" style="color: <?php echo $platform_config["style"]["brand"]["brand-text"]; ?>"><?php echo $platform_config["text"]["brand-text"]; ?></span>
						<?php else: ?>
						<span class="icon" style="color: <?php echo $platform_config["style"]["brand"]["brand-text"]; ?>">24好玩微信活动定制</span>
						<?php endif; ?>
					</div>
				</div>
			</div>
			<?php elseif ($tpl_info["type"] == 2) : ?>
			<!-- 结束页面 抽奖类 -->
			<div id="game-over-menu" class="game-over-menu" style="<?php echo (strpos($platform_config["style"]["background"]["game-over-menu"], "#") === 0) ? ("background-color:".$platform_config["style"]["background"]["game-over-menu"].";") : ("background-image:url('".$platform_config["style"]["background"]["game-over-menu"]."');"); ?>">
				<div class="gameover-menu-main">
					<div class="custom-container">
						<div class="gift-has-container">
							<div class="game-img"><img src="//24haowan-cdn.shanyougame.com/public/images/t/lottery.png"></div>
							<div class="game-over-text">
								<span>恭喜获得</span>
								<span class="game-over-text-gift-name">爱心巧克力</span>
							</div>
							<div class="game-over-gift-remind">点击奖品图片查看详情</div>
							<div class="gameover-remind hidden"></div>
						</div>
						<div class="gift-empty-container hidden">
							<div class="game-img"><img src="//24haowan-cdn.shanyougame.com/public/images/t/cry.png"></div>
							<div class="game-over-text">真可惜，没有获奖！</div>
							<div class="gameover-remind">分享后还可以获得额外一次抽奖机会哦！</div>
						</div>
					</div>
					<div class="play-again-btn deputy-color deputy-btn" style="<?php echo "background:".$platform_config["style"]["color"]["deputy"].";border-bottom:2px solid ".$platform_config["style"]["color"]["deputy-shadow"]; ?>"><?php echo $platform_config["text"]["play-again-btn"]; ?></div>
					<div class="game-rule-btn main-color main-btn" style="<?php echo "background:".$platform_config["style"]["color"]["main"].";border-bottom:2px solid ".$platform_config["style"]["color"]["main-shadow"]; ?>"><?php echo $platform_config["text"]["game-rule-btn"]; ?></div>
				</div>
	    		<div class="gameover-menu-foot">
					<div class="bottom-logo" style="<?php if (!empty($platform_config["bottom-show"])) echo $platform_config["bottom-show"] ? "" : "display:none" ?>">
						<?php if ($platform_config["text"]["brand-text"] != ""):  ?>
						<span class="icon" style="color: <?php echo $platform_config["style"]["brand"]["brand-text"]; ?>"><?php echo $platform_config["text"]["brand-text"]; ?></span>
						<?php else: ?>
						<span class="icon" style="color: <?php echo $platform_config["style"]["brand"]["brand-text"]; ?>">24好玩微信活动定制</span>
						<?php endif; ?>
					</div>
				</div>
			</div>
			<?php elseif ($tpl_info["type"] == 4): ?>
			<!-- 结束页面 通关类 -->
			<div id="game-over-menu" class="game-over-menu" style="<?php echo (strpos($platform_config["style"]["background"]["game-over-menu"], "#") === 0) ? ("background-color:".$platform_config["style"]["background"]["game-over-menu"].";") : ("background-image:url('".$platform_config["style"]["background"]["game-over-menu"]."');"); ?>">
				<div class="best-score">
					<span class="score-icon" id="game-over-rank-btn"><img src="//24haowan-cdn.shanyougame.com/public/images/t/rankIcon.svg" alt=""></span>
					<span class="score-text" style="color: <?php echo $platform_config["style"]["best-score-text"]; ?>">最好成绩:<span class="score">1</span><span>关</span></span>
				</div>
		        <div class="test-remind-div hidden">测试版本，请勿外传。<img class="test-remind-close" src="//24haowan-cdn.shanyougame.com/public/images/t/icon-close-white.png"></div>
				<div class="gameover-menu-main">
					<div class="custom-container">
						<div class="game-img game-img-game-over-menu"><img src="<?php echo $platform_config["style"]["banner"]["game-over-menu"]; ?>" alt=""></div>
						<?php if ($tpl_info["section"] == 1):  ?>
						<div class="gameover-text">恭喜你，挑战成功，邀请好友来试试吧。</div>
						<?php else: ?>
						<div class="gameover-text">恭喜你，你完成所有共<?php echo $tpl_info["section"]; ?>个关卡，棒极了！</div>
						<?php endif; ?>
						<div class="gameover-remind">&nbsp;</div>
					</div>
					<div class="play-again-btn deputy-color deputy-btn" style="<?php echo "background:".$platform_config["style"]["color"]["deputy"].";border-bottom:2px solid ".$platform_config["style"]["color"]["deputy-shadow"]; ?>"><?php echo $platform_config["text"]["play-again-btn"]; ?></div>
					<div class="game-rule-btn main-color main-btn" style="<?php echo "background:".$platform_config["style"]["color"]["main"].";border-bottom:2px solid ".$platform_config["style"]["color"]["main-shadow"]; ?>"><?php echo $platform_config["text"]["game-rule-btn"]; ?></div>
				</div>
	    		<div class="gameover-menu-foot">
					<div class="bottom-logo" style="<?php if (!empty($platform_config["bottom-show"])) echo $platform_config["bottom-show"] ? "" : "display:none" ?>">
						<?php if ($platform_config["text"]["brand-text"] != ""):  ?>
						<span class="icon" style="color: <?php echo $platform_config["style"]["brand"]["brand-text"]; ?>"><?php echo $platform_config["text"]["brand-text"]; ?></span>
						<?php else: ?>
						<span class="icon" style="color: <?php echo $platform_config["style"]["brand"]["brand-text"]; ?>">24好玩微信活动定制</span>
						<?php endif; ?>
					</div>
				</div>
			</div>
			<?php elseif ($this->game_type == 5): ?>
			<!-- 结束页面 -->
			<div id="game-over-menu" class="game-over-menu" style="<?php echo (strpos($platform_config["style"]["background"]["game-over-menu"], "#") === 0) ? ("background-color:".$platform_config["style"]["background"]["game-over-menu"].";") : ("background-image:url('".$platform_config["style"]["background"]["game-over-menu"]."');"); ?>">
				<div class="gameover-menu-main">
					<div class="custom-container"></div>
					<div class="play-again-btn deputy-color deputy-btn" style="<?php echo "background:".$platform_config["style"]["color"]["deputy"].";border-bottom:2px solid ".$platform_config["style"]["color"]["deputy-shadow"]; ?>"><?php echo $platform_config["text"]["play-again-btn"]; ?></div>
					<div class="game-rule-btn main-color main-btn" style="<?php echo "background:".$platform_config["style"]["color"]["main"].";border-bottom:2px solid ".$platform_config["style"]["color"]["main-shadow"]; ?>"><?php echo $platform_config["text"]["game-rule-btn"]; ?></div>
				</div>
				<div class="gameover-menu-foot">
					<div class="bottom-logo" style="<?php if (!empty($platform_config["bottom-show"])) echo $platform_config["bottom-show"] ? "" : "display:none" ?>">
						<?php if ($platform_config["text"]["brand-text"] != ""):  ?>
						<span class="icon" style="color: <?php echo $platform_config["style"]["brand"]["brand-text"]; ?>"><?php echo $platform_config["text"]["brand-text"]; ?></span>
						<?php else: ?>
						<span class="icon" style="color: <?php echo $platform_config["style"]["brand"]["brand-text"]; ?>">24好玩微信活动定制</span>
						<?php endif; ?>
					</div>
				</div>
			</div>
			<?php endif; ?>

			<!-- 分享蒙版 -->
			<div class="shareMask hidden" id="shareMask">
				<div class="shareLabel main-color" style="<?php echo "color:".$platform_config["style"]["shareLabel"].";background:".$platform_config["style"]["color"]["main"]; ?>"><?php echo $platform_config["text"]["shareLabel"]; ?></div>
			</div>

			<!-- 获得奖品 已拆封 -->
			<?php
				$currentGiftId = "";
				$currentGiftImg = "";
				$currentGiftName = "";
				if (!empty($gift_config)) {
					$currentGiftId = $gift_config[0]["prize"][0]["gift_id"];
				} else if (!empty($all_gift_config["rank"])) {
					$currentGiftId = $all_gift_config["rank"][0]["gift_id"];
				} else if (!empty($all_gift_config["share"])) {
					$currentGiftId = $all_gift_config["share"]["gift_id"];
				} else if (!empty($all_gift_config["play"])) {
					$currentGiftId = $all_gift_config["play"]["gift_id"];
				} else if (!empty($all_gift_config["lottery"])) {
					$currentGiftId = $all_gift_config["lottery"]["prize"][0]["gift_id"];
				} else {
					$currentGiftId = "";
				}
				if (empty($currentGiftId)) {
					$currentGiftImg = "//24haowan-cdn.shanyougame.com/new_platform/image/prize.svg";
				} else {
					foreach ($user_gift_list as $gift_list_item) {
						if ($gift_list_item["id"] == $currentGiftId) {
							$currentGiftImg = $gift_list_item["gift_img"];
							$currentGiftName = $gift_list_item["name"];
							if ($gift_list_item["gift_type"] == 2) {
								$currentGiftImg = "//24haowan-cdn.shanyougame.com/public/images/web/icon-giftmoney-common.png";
							} else if ($gift_list_item["gift_type"] == 3) {
								$currentGiftImg = "//24haowan-cdn.shanyougame.com/public/images/web/icon-giftmoney-random.png";
							}
						}
					}
				}
			?>
			<div class="mask hidden" id="receive-mask">
				<div class="receive-box main-border" style="border-color: <?php echo $platform_config["style"]["color"]["main"]; ?>">
					<div class="text-box-title main-color" style="background:<?php echo $platform_config["style"]["color"]["main"]; ?>">获得奖品</div>
					<div class="text-content">
						<img id="prize-img" src="<?php echo $currentGiftImg; ?>" alt="">
						<span class="gift-description">恭喜你获得<?php echo empty($currentGiftName) ? "精美礼品" : $currentGiftName; ?>
						</span>
					</div>
					<div class="close-btn main-color main-btn" style="<?php echo "background:".$platform_config["style"]["color"]["main"].";border-bottom:2px solid ".$platform_config["style"]["color"]["main-shadow"]; ?>">立即领取</div>
				</div>
			</div>

			<!-- 奖品详情 单个奖品 -->
		    <div class="giftcenter-container-single hidden">
		    	<img src="//24haowan-cdn.shanyougame.com/public/images/t/icon-close.png" class="btn-close" style="z-index: 10;">
		    	<!-- <div class="top-container">
		    		<img src="<?php // echo empty(Yii::app()->session['headimgurl'])? '//24haowan-cdn.shanyougame.com/public/images/dev/head-example.png' : Yii::app()->session['headimgurl'] ?>" class="img-head">
		    		<span class="nickname">微信名称</span>
		    	</div> -->
		    	<div class="content">
		    		<img src="//24haowan-cdn.shanyougame.com/public/images/t/prize.svg" class="gift-img">
		    		<div class="gift-name">精美奖品</div>
		    		<div class="gift-remind"></div>
		    		<div class="gift-detail">
		    			<div class="barcode-block">
		    				<div id="barcode"></div>
		    				<div class="barcode-text"></div>
		    			</div>
		    			<div class="gift-detail-block">
		    				<span class="label">活动名称</span>
		    				<span class="game-name"><?php echo $game_info["name"]; ?></span>
		    			</div>
		    			<!-- <div class="gift-detail-block">
		    				<span class="label">商户名称</span>
		    				<span class="m-name"><?php // echo $game_info["m_name"]; ?></span>
		    			</div> -->
		    			<div class="gift-detail-block">
		    				<span class="label">获奖时间</span>
		    				<span class="gift-get-time"><?php echo date('Y-m-d H:i'); ?></span>
		    			</div>
		    			<!-- <div class="gift-detail-block">
		    				<span class="label">获奖条件</span>
		    				<span class="gift-condition"></span>
		    			</div> -->
		    		</div>
		    	</div>
		    	<a class="giftcenter-btn <?php echo empty($game_info['prize_url']) ? "hidden" : ""; ?>">兑奖详情</a>
		    </div>

			<!-- 信息登记 -->
			<div class="mask hidden" id="form-mask">
				<div class="form-box main-border" style="border-color: <?php echo $platform_config["style"]["color"]["main"]; ?>">
					<div class="text-box-title main-color" style="background:<?php echo $platform_config["style"]["color"]["main"]; ?>">信息登记</div>
					<div class="text-content">
						<div class="form-desc"><?php echo empty($platform_config["message"]["msg"]["desc"]) ? "为了便于活动的进行，请您填写以下信息，便于我们在您中奖后与您联系。" : $platform_config["message"]["msg"]["desc"]; ?></div>
						<div class="label-box">
							<?php if(!empty($platform_config["message"]["msg"])): ?>
							<?php foreach($platform_config["message"]["msg"]["list"] as $msgKey) :  ?>
							<div>
								<label><?php echo $msgKey; ?>:</label><input type="text" class="main-border" data-key="<?php echo $msgKey; ?>" style="border-color: <?php echo $platform_config["style"]["color"]["main"]; ?>">
							</div>
							<?php endforeach; ?>
							<?php else: ?>
							<div>
								<label>姓名:</label><input type="text" class="main-border" data-key="姓名" style="border-color: <?php echo $platform_config["style"]["color"]["main"]; ?>">
							</div>
							<div>
								<label>电话:</label><input type="text" class="main-border" data-key="手机" style="border-color: <?php echo $platform_config["style"]["color"]["main"]; ?>">
							</div>
							<div>
								<label>QQ:</label><input type="text" class="main-border" data-key="QQ" style="border-color: <?php echo $platform_config["style"]["color"]["main"]; ?>">
							</div>
							<?php endif; ?>
						</div>
					</div>
					<div class="close-btn main-color main-btn" id="submit" style="<?php echo "background:".$platform_config["style"]["color"]["main"].";border-bottom:2px solid ".$platform_config["style"]["color"]["main-shadow"]; ?>">提交</div>
				</div>
			</div>

			<!-- 排行榜 -->
			<!-- <div class="rank-mask hidden" id="rank">
				<div class="rankBox main-border" style="border-color: <?php // echo $platform_config["style"]["color"]["main"]; ?>">
					<div class="rankMain main-border" style="border-color: <?php // echo $platform_config["style"]["color"]["main"]; ?>">
						<div class="rankLogo"><img src="<?php // echo $platform_config["style"]["rankLogo"]; ?>"></div>
						<div class="rankClose"><img src="//24haowan-cdn.shanyougame.com/public/images/t/closeBtn.svg"></div>
						<div class="rankContent">
							<div class="friendContent content">
								<div class="number">100位好友</div>
								<ol>
									<li id="myself-score"><span class="rankNum"><img src="//24haowan-cdn.shanyougame.com/public/images/t/no1.svg"></span><div class="wechat-img"><img src="//www.touxiang.cn/uploads/20140102/02-062942_384.jpg"></div><span class="wechat-name" style="color:<?php // echo $platform_config["style"]["color"]["main"]; ?>">我</span><div class="score" style="color:<?php // echo $platform_config["style"]["color"]["main"]; ?>">10000</div></li>
									<li><span class="rankNum"><img src="//24haowan-cdn.shanyougame.com/public/images/t/no2.svg"></span><div class="wechat-img"><img src="//www.touxiang.cn/uploads/20140102/02-062942_384.jpg"></div><span class="wechat-name" >名字不够长还玩什么游戏</span><div class="score">10000</div></li>
									<li><span class="rankNum"><img src="//24haowan-cdn.shanyougame.com/public/images/t/no3.svg"></span><div class="wechat-img"><img src="//www.touxiang.cn/uploads/20140102/02-062942_384.jpg"></div><span class="wechat-name" >名字不够长还玩什么游戏</span><div class="score">10000</div></li>
									<li><span class="rankNum">1000</span><div class="wechat-img"><img src="//www.touxiang.cn/uploads/20140102/02-062942_384.jpg" ></div><span class="wechat-name" >名字不够长还玩什么游戏</span><div class="score">10000</div></li>
									<li><span class="rankNum">5</span><div class="wechat-img"><img src="//www.touxiang.cn/uploads/20140102/02-062942_384.jpg" ></div><span class="wechat-name" >名字不够长还玩什么游戏</span><div class="score">10000</div></li>
								</ol>
								<div class="moreFirend more">查看更多</div>
							</div>
							<div class="playerContent content">
								<div class="number">100位玩家</div>
								<ol>
									<li><span class="rankNum"><img src="//24haowan-cdn.shanyougame.com/public/images/t/no1.svg" ></span><div class="wechat-img"><img src="//www.touxiang.cn/uploads/20140102/02-062942_384.jpg" ></div><span class="wechat-name" >名字不够长还玩什么游戏</span><div class="score" >10000</div></li>
									<li><span class="rankNum"><img src="//24haowan-cdn.shanyougame.com/public/images/t/no2.svg" ></span><div class="wechat-img"><img src="//www.touxiang.cn/uploads/20140102/02-062942_384.jpg" ></div><span class="wechat-name" >名字不够长还玩什么游戏</span><div class="score" >10000</div></li>
									<li><span class="rankNum"><img src="//24haowan-cdn.shanyougame.com/public/images/t/no3.svg" ></span><div class="wechat-img"><img src="//www.touxiang.cn/uploads/20140102/02-062942_384.jpg" ></div><span class="wechat-name" >名字不够长还玩什么游戏</span><div class="score" >10000</div></li>
									<li><span class="rankNum">4</span><div class="wechat-img"><img src="//www.touxiang.cn/uploads/20140102/02-062942_384.jpg" ></div><span class="wechat-name" >名字不够长还玩什么游戏</span><div class="score" >10000</div></li>
									<li><span class="rankNum">5</span><div class="wechat-img"><img src="//www.touxiang.cn/uploads/20140102/02-062942_384.jpg" ></div><span class="wechat-name" >名字不够长还玩什么游戏</span><div class="score" >10000</div></li>
								</ol>
								<div class="morePlayer more">查看更多</div>
							</div>
						</div>
					</div>
				</div>
			</div> -->
            <div class="test-remind-div">测试版本，请勿外传。<img class="test-remind-close" src="//24haowan-cdn.shanyougame.com/public/images/t/icon-close-white.png"></div>
		</div>
		<!-- 分享页 -->
		<div id="preview-custom-4" class="hidden preview-custom-container">
			<div class="share-sign-in" style="<?php echo (strpos($platform_config["style"]["background"]["share-sign-in"], "#") === 0) ? ("background-color:".$platform_config["style"]["background"]["share-sign-in"].";") : ("background-image:url('".$platform_config["style"]["background"]["share-sign-in"]."');"); ?>">
				<div class="share-menu-main">
					<div class="game-wechat-img" style="background-image:url('<?php echo empty(Yii::app()->session['headimgurl'])? '//24haowan-cdn.shanyougame.com/public/images/dev/head-example.png' : Yii::app()->session['headimgurl'] ?>');"></div>
					<?php 
						$replace_value_game_wechat_text = ceil(rand(1,100));
						if ($tpl_info["type"] == 2) { // 抽奖
							$replace_value_game_wechat_text = "iphone6";
						} else if ($tpl_info["type"] == 4) { // 通关
							$replace_value_game_wechat_text = ceil(rand(1,10));
						}
					?>
					<div class="game-wechat-text" style="<?php echo "color:".$platform_config["style"]["share-text-color"]; ?>"><?php echo str_ireplace($replace_str, $replace_value_game_wechat_text, $platform_config["text"]["game-wechat-text"]); ?></div>
					<div class="game-img game-img-share-sign-in"><img src="<?php echo $platform_config["style"]["banner"]["share-sign-in"]; ?>" ></div>
					<div class="game-title game-title-color" style="<?php echo "color:".$platform_config["style"]["game-title-color"]; ?>"><span><?php echo $game_info['name']; ?></span></div>
					<div class="game-start-btn deputy-color deputy-btn" id="challenge" style="<?php echo "background:".$platform_config["style"]["color"]["deputy"].";border-bottom:2px solid ".$platform_config["style"]["color"]["deputy-shadow"]; ?>"><?php echo $platform_config["text"]["challenge"]; ?></div>
				</div>
				<div class="share-menu-foot">
					<div class="bottom-logo" style="<?php if (!empty($platform_config["bottom-show"])) echo $platform_config["bottom-show"] ? "" : "display:none" ?>">
						<?php if ($platform_config["text"]["brand-text"] != ""):  ?>
						<span class="icon" style="color: <?php echo $platform_config["style"]["brand"]["brand-text"]; ?>"><?php echo $platform_config["text"]["brand-text"]; ?></span>
						<?php else: ?>
						<span class="icon" style="color: <?php echo $platform_config["style"]["brand"]["brand-text"]; ?>">24好玩微信活动定制</span>
						<?php endif; ?>
					</div>
				</div>
			</div>
            <div class="test-remind-div">测试版本，请勿外传。<img class="test-remind-close" src="//24haowan-cdn.shanyougame.com/public/images/t/icon-close-white.png"></div>
		</div>
		<!-- 微信界面 -->
		<div id="preview-wechat" class="preview-custom-container hidden">
			<div class="top"></div>
			<div class="body" id="wechat-body-1">
				<div class="content content-left">
					<div class="title"><?php echo $platform_config["message"]["share"]["title-default"]; ?></div>
					<div class="pic" style="background-image:url('<?php echo $platform_config["message"]["share"]["pic"]; ?>');"></div>
					<div class="desc"><?php echo $platform_config["message"]["share"]["desc-default"]; ?></div>
				</div>
				<img class="head" src="//24haowan-cdn.shanyougame.com/public/images/dev/icon-head.jpg">
			</div>
			<div class="body" id="wechat-body-2">
				<img class="head" src="//24haowan-cdn.shanyougame.com/public/images/dev/icon-head.jpg">
				<div class="content content-right">
					<?php 
						$replace_value_share = ceil(rand(1,100));
						if ($tpl_info["type"] == 2) { // 抽奖
							$replace_value_share = "iphone6";
						} else if ($tpl_info["type"] == 4) { // 通关
							$replace_value_share = ceil(rand(1,10));
						}
					?>
					<div class="title"><?php echo str_ireplace($replace_str, $replace_value_share, $platform_config["message"]["share"]["title"]); ?></div>
					<div class="pic" style="background-image:url('<?php echo $platform_config["message"]["share"]["pic"]; ?>');"></div>
					<div class="desc"><?php echo str_ireplace($replace_str, $replace_value_share, $platform_config["message"]["share"]["desc"]); ?></div>
				</div>
			</div>
			<div class="bottom"></div>
		</div>
		<!-- 播放按钮 -->
		<div class="preview-refresh" id="preview-refresh"></div>
	</div>
</div>

<!-- 主要配置区域 -->
<div class="main-custom-container" id="main-container">
	<!-- 基本信息 -->
	<div class="custom-container" id="basic-container">
		<div class="custom-detail-container">
			<div class="custom-detail">
				<!-- 活动信息 -->
				<div class="custom-group">
					<div class="title">活动信息</div>
					<div class="detail">
						<div class="custom-text">
							<div>
								<span>活动名称</span>
								<input class="input-text input-text-l <?php echo ($game_info['status'] == "wait") ? "" : "disabled"; ?>" id="text-game-title-text" maxlength="20" value="<?php echo $game_info['name']; ?>" <?php echo ($game_info['status'] == "wait") ? "" : "readonly='readonly'"; ?> name="<?php echo $platform_config["style"]["game-title-color"]; ?>">
								<div class="lock-container <?php echo ($game_info['status'] == "wait") ? "hidden" : ""; ?>">
									<img src="//24haowan-cdn.shanyougame.com/public/images/web/icon-workbench-lock.png">
									<div class="lock-content">活动上线中，游戏名称不可修改。</div>
								</div>
								<div class="text-color-remind-container <?php echo ($game_info['status'] == "wait") ? "" : "hidden"; ?>">
									<img src="//24haowan-cdn.shanyougame.com/public/images/web/icon-workbench-A.png">
									<div class="text-color-content">点击可以自定义文字颜色。</div>
								</div>
							</div>
						</div>
						<div class="custom-text" style="margin-top: 10px;">
							<div>
								<span>商户名称</span>
								<input class="input-text input-text-l <?php echo ($game_info['status'] == "wait") ? "" : "disabled"; ?>" id="user-custom-name" value="<?php echo empty($game_info['m_name']) ? "" : $game_info['m_name']; ?>" <?php echo ($game_info['status'] == "wait") ? "" : "readonly='readonly'"; ?>>
								<div class="lock-container <?php echo ($game_info['status'] == "wait") ? "hidden" : ""; ?>">
									<img src="//24haowan-cdn.shanyougame.com/public/images/web/icon-workbench-lock.png">
									<div class="lock-content">活动上线中，商户名称不可修改。</div>
								</div>
							</div>
						</div>
						<div class="custom-date" style="margin-top: 10px">
							<div class="date-input-container">
								<span class="label-text">开始时间</span>
				                <div class="date-input-group <?php echo ($game_info['status'] == "wait") ? "" : "disabled"; ?>">
				                	<input id="start-date" readonly="readonly" data-date-format="yyyy-mm-dd hh:00" value="<?php echo date('Y-m-d H:00', strtotime($game_info["start_time"])); ?>" <?php echo ($game_info['status'] == "wait") ? "" : "readonly='readonly'"; ?>>
				                	<?php if ($game_info['status'] == "wait"): ?>
				                	<span class="glyphicon glyphicon-calendar"></span>
				                	<?php else: ?>
				                	<div class="lock-container <?php echo ($game_info['status'] == "wait") ? "hidden" : ""; ?>">
										<img src="//24haowan-cdn.shanyougame.com/public/images/web/icon-workbench-lock.png">
										<div class="lock-content">活动上线中，开始时间不可修改。</div>
									</div>
									<?php endif; ?>
				                </div>
							</div>
							<div class="date-input-container">
								<span class="label-text">结束时间</span>
				                <div class="date-input-group">
				                	<input id="end-date" readonly="readonly" data-date-format="yyyy-mm-dd hh:00" value="<?php echo date('Y-m-d H:00', strtotime($game_info["end_time"])); ?>">
				                	<span class="glyphicon glyphicon-calendar"></span>
				                </div>
							</div>
						</div>
						<div class="custom-access" style="margin-top: 10px">
							<span>访问模式</span>
							<div class="btn-group" role="group">
								<button type="button" class="btn btn-normal <?php echo $game_info['limit_player'] == "yes" ? "" : "active"; ?> <?php echo $game_info["status"] != "wait" ? "disabled" : ""; ?>" name="no" <?php echo $game_info["status"] != "wait" ? "disabled" : ""; ?>>开放访问</button>
								<button type="button" class="btn btn-normal <?php echo $game_info['limit_player'] == "yes" ? "active" : ""; ?> <?php echo $game_info["status"] != "wait" ? "disabled" : ""; ?>" name="yes" <?php echo $game_info["status"] != "wait" ? "disabled" : ""; ?>>密钥访问</button>
								<div class="custom-access-desc">使用于内部活动或者商品销售相关的促销活动，每个用户需要独立的访问密钥。 <a href="https://www.24haowan.com/help/qaDetail/id/123" target="_blank">*点击此处了解更多*</a></div>
							</div>
						</div>
					</div>
				</div>
				<!-- 配色方案 -->
				<div class="custom-group">
					<div class="title">
						配色方案<img class="title-q" src="//24haowan-cdn.shanyougame.com/public/images/web/icon-questionmark-gray.png">
						<div class="custom-desc hidden">选择配色方案可以修改整个游戏所有的边框和按钮颜色。</div>
					</div>
					<div class="detail">
						<div class="custom-color <?php if($platform_config["style"]["color"]["main"] == "#1db494") echo "active"; ?>" name="1">
							<div class="custom-color-second" style="background: #1db494;"></div>
							<div class="custom-color-main" style="background: #ffb837;"></div>
						</div>
						<div class="custom-color <?php if($platform_config["style"]["color"]["main"] == "#743543") echo "active"; ?>" name="2">
							<div class="custom-color-second" style="background: #743543;"></div>
							<div class="custom-color-main" style="background: #e34459;"></div>
						</div>
						<div class="custom-color <?php if($platform_config["style"]["color"]["main"] == "#4464af") echo "active"; ?>" name="3">
							<div class="custom-color-second" style="background: #4464af;"></div>
							<div class="custom-color-main" style="background: #1b9fc6;"></div>
						</div>
						<div class="custom-color <?php if($platform_config["style"]["color"]["main"] == "#b18266") echo "active"; ?>" name="4">
							<div class="custom-color-second" style="background: #b18266;"></div>
							<div class="custom-color-main" style="background: #ffea00;"></div>
						</div>
						<div class="custom-color <?php if($platform_config["style"]["color"]["main"] == "#6d4e86") echo "active"; ?>" name="5">
							<div class="custom-color-second" style="background: #6d4e86;"></div>
							<div class="custom-color-main" style="background: #a867ab;"></div>
						</div>
						<div class="custom-color <?php if($platform_config["style"]["color"]["main"] == "#9ca7d4") echo "active"; ?>" name="6">
							<div class="custom-color-second" style="background: #9ca7d4;"></div>
							<div class="custom-color-main" style="background: #efb0b8;"></div>
						</div>
						<div class="custom-color <?php if($platform_config["style"]["color"]["main"] == "#b5dfc7") echo "active"; ?>" name="7">
							<div class="custom-color-second" style="background: #b5dfc7;"></div>
							<div class="custom-color-main" style="background: #df585f;"></div>
						</div>
						<div class="custom-color <?php if($platform_config["style"]["color"]["main"] == "#e98aa2") echo "active"; ?>" name="8">
							<div class="custom-color-second" style="background: #e98aa2;"></div>
							<div class="custom-color-main" style="background: #e2664e;"></div>
						</div>
					</div>
				</div>
				<!-- 底部横幅 -->
				<?php if (isset($platform_config["bottom-show"])): ?>
				<div class="custom-group">
					<div class="title">
						底部横幅<img class="title-q" src="//24haowan-cdn.shanyougame.com/public/images/web/icon-questionmark-gray.png">
						<div class="custom-desc hidden">底部横幅将显示在游戏开始页、结束页和分享登录页。可以根据需要修改显示名称和点击跳转的链接</div>
					</div>
					<div class="detail" id="bottom-link-detail">
						<div style="line-height:46px;">
							<span>显示横幅</span>
							<div class="bottom-link-select">
								<input type="radio" name="bottom-show" value="true" <?php echo $platform_config["bottom-show"] === true ? "checked" : ""; ?>>
								<span>显示</span>
							</div>
							<div class="bottom-link-select">
								<input type="radio" name="bottom-show" value="false" <?php echo $platform_config["bottom-show"] === true ? "" : "checked"; ?>>
								<span>隐藏</span>
							</div>
						</div>
						<div id="bottom-link-container" class="<?php echo $platform_config["bottom-show"] === true ? "" : "hidden"; ?>">
							<div class="custom-text">
								<div>
									<span>链接名称</span>
									<input type="text" class="input-text input-text-l" id="text-brand-text" value="<?php echo empty($platform_config["text"]["brand-text"]) ? "24好玩微信活动定制" : $platform_config["text"]["brand-text"]; ?>" name="<?php echo $platform_config["style"]["brand"]["brand-text"]; ?>">
									<div class="text-color-remind-container">
										<img src="//24haowan-cdn.shanyougame.com/public/images/web/icon-workbench-A.png">
										<div class="text-color-content">点击可以自定义文字颜色。</div>
									</div>
								</div>
							</div>
							<div style="line-height:46px;">
								<span>链接地址</span>
								<div class="bottom-link-select">
									<input type="radio" name="bottom-link-set" value="false" <?php echo $platform_config["bottom-link-set"] === true ? "" : "checked"; ?>>
									<span>无链接</span>
								</div>
								<div class="bottom-link-select">
									<input type="radio" name="bottom-link-set" value="true" <?php echo $platform_config["bottom-link-set"] === true ? "checked" : ""; ?>>
									<span>跳转页面</span>
								</div>
							</div>
							<div class="custom-text <?php echo $platform_config["bottom-link-set"] ? "" : "hidden"; ?>">
								<div>
									<span>链接地址</span>
									<input type="text" class="input-text input-text-l" id="text-brand-link" value="<?php echo $platform_config["bottom-link"]; ?>">
								</div>
							</div>
						</div>
					</div>
				</div>
				<?php endif; ?>
			</div>
		</div>
	</div>
	<!-- 资源替换 -->
	<div class="custom-container hidden" id="assets-container">
		<div class="custom-detail-container">
			<!-- 加载页 -->
			<div class="custom-detail" id="custom-detail-0">
				<div class="custom-group" style="position: relative;">
					<div class="title"><?php echo ($game_info['upgrade'] == "yes") ? "图片" : "想修改这个页面？"; ?></div>
					<div class="detail">
						<div class="custom-pic <?php echo ($game_info["upgrade"] == "yes") ? "" : "disabled"; ?>" name="bg" id="pic-loadingColor">
							<div class="custom-pic-img">
								<?php if(strpos($platform_config["style"]["loadingColor"], "#") !== 0): ?>
								<div class="custom-pic-div" style="background-image:url('<?php echo $platform_config["style"]["loadingColor"];?>');"  name="pic"></div>
								<?php else: ?>
								<div class="custom-pic-div" style="background-color:<?php echo $platform_config["style"]["loadingColor"];?>;" name="<?php echo $platform_config["style"]["background"]["start-menu"];?>"></div>
								<?php endif; ?>
							</div>
							<div class="custom-pic-size" name="<?php echo empty($platform_config["style"]["loadingColor-ext-desc"]) ? "" : $platform_config["style"]["loadingColor-ext-desc"]; ?>">750px*1254px</div>
							<div class="custom-pic-name">加载页背景</div>
						</div>
						<div class="custom-pic <?php echo ($game_info["upgrade"] == "yes") ? "" : "disabled"; ?>" name="pic" id="pic-loadingBanner">
							<div class="custom-pic-img">
								<div class="custom-pic-div" style="background-image:url('<?php echo $platform_config["style"]["loadingBanner"]; ?>');"></div>
							</div>
							<div class="custom-pic-size" name="<?php echo empty($platform_config["style"]["loadingBanner-ext-desc"]) ? "" : $platform_config["style"]["loadingBanner-ext-desc"]; ?>">300px*335px</div>
							<div class="custom-pic-name">加载页横幅</div>
						</div>
						<div class="clear"></div>
					</div>
					<div class="pic-desc"><input type="text" class="input-text"></div>
				</div>
				<!-- 配色选择 -->
				<div class="custom-group">
					<div class="title">进度条</div>
					<div class="detail">
						<div class="custom-pure-color" id="color-barColor">
							<span class="text-title">颜色</span>
							<span class="color" style="background: <?php echo $platform_config["style"]["barColor"]; ?>" name="<?php echo $platform_config["style"]["barColor"]; ?>"></span>
						</div>
					</div>
				</div>

				<!-- 升级提示 -->
				<div class="loading-upgrade-container <?php echo $game_info["upgrade"] == "yes" ? "hidden" : ""; ?>">
					<div><img src="//24haowan-cdn.shanyougame.com/public/images/web/icon-loading-pay-yellow.png">嘿，升级之后才可以修改加载页哦！</div>
					<div class="desc">如果您暂时不想付费，同样可以定制除了加载页的其他所有页面。</div>
					<button class="btn btn-l btn-g" id="loading-upgrade-btn">马上升级</button>
				</div>
			</div>
			<!-- 开始页 -->
			<div class="custom-detail custom-assets-detail hidden" id="custom-detail-1">
				<?php if (isset($platform_config["game-title-img-show"])): ?>
				<div class="custom-group">
					<div class="title">自定义标题图片</div>
					<div class="detail">
						<div style="line-height:46px;">
							<span>替换文字横幅</span>
							<div class="game-title-img-select">
								<input type="radio" name="game-title-img-show" value="true" <?php echo $platform_config["game-title-img-show"] ? "checked" : ""; ?>>
								<span>替换</span>
							</div>
							<div class="game-title-img-select">
								<input type="radio" name="game-title-img-show" value="false" <?php echo $platform_config["game-title-img-show"] ? "" : "checked"; ?>>
								<span>不替换</span>
							</div>
						</div>
						<div style="margin-left: 97px;" class="custom-pic <?php echo $platform_config["game-title-img-show"] ? "" : "hidden"; ?>" name="pic" id="pic-game-title-img">
							<div class="custom-pic-img">
								<div class="custom-pic-div" style="background-image:url('<?php echo $platform_config["game-title-img"]; ?>');"></div>
							</div>
							<div class="custom-pic-size" name="<?php echo empty($platform_config["game-title-img-ext-desc"]) ? "" : $platform_config["game-title-img-ext-desc"]; ?>"><?php echo empty($platform_config["game-title-img-size"]) ? "" : $platform_config["game-title-img-size"]; ?></div>
							<div class="custom-pic-name">标题横幅</div>
						</div>
					</div>
					<div class="pic-desc"><input type="text" class="input-text"></div>
				</div>
				<?php endif; ?>
				<div class="custom-group">
					<div class="title">图片</div>
					<div class="detail">
						<div class="custom-pic" name="bg" id="pic-background-start-menu">
							<div class="custom-pic-img">
								<?php if(strpos($platform_config["style"]["background"]["start-menu"], "#") !== 0): ?>
								<div class="custom-pic-div" style="background-image:url('<?php echo $platform_config["style"]["background"]["start-menu"];?>');"  name="pic"></div>
								<?php else: ?>
								<div class="custom-pic-div" style="background-color:<?php echo $platform_config["style"]["background"]["start-menu"];?>;" name="<?php echo $platform_config["style"]["background"]["start-menu"];?>"></div>
								<?php endif; ?>
							</div>
							<div class="custom-pic-size" name="<?php echo empty($platform_config["style"]["background"]["ext_desc"]) ? "" : $platform_config["style"]["background"]["ext_desc"]; ?>">750px*1254px</div>
							<div class="custom-pic-name">开始页背景</div>
						</div>
						<div class="custom-pic" name="pic" id="pic-banner-start-menu">
							<div class="custom-pic-img">
								<div class="custom-pic-div" style="background-image:url('<?php echo $platform_config["style"]["banner"]["start-menu"]; ?>');"></div>
							</div>
							<div class="custom-pic-size" name="<?php echo empty($platform_config["style"]["banner"]["ext_desc"]) ? "" : $platform_config["style"]["banner"]["ext_desc"]; ?>"><?php echo empty($platform_config["style"]["banner"]["size"]) ? "" : $platform_config["style"]["banner"]["size"]; ?></div>
							<div class="custom-pic-name">开始页横幅</div>
						</div>
						<div class="clear"></div>
					</div>
					<div class="pic-desc"><input type="text" class="input-text"></div>
				</div>
				<div class="custom-group">
					<div class="title">活动规则弹出框</div>
					<div class="detail">
						<!-- 说明文字 -->
						<div class="custom-text">
							<div>
								<span style="line-height:46px;width:100px;">说明文字</span>
								<textarea rows="5" class="input-textarea input-textarea-l" id="text-activity-text" name="multi"><?php echo $platform_config["text"]["activity-text"]; ?></textarea>
							</div>
							<div class="note">*如果您的游戏有涉及到奖品发放的活动，建议您将发奖规则填写上去</div>
						</div>
						<!-- 公众号二维码 -->
						<?php if (!empty($platform_config["activity-qrcode"])): ?>
						<div class="actvity-qrcode-container">
							<div style="line-height:46px;">
								<span>公众号二维码</span>
								<div class="activity-qrcode-select">
									<input type="radio" name="activity-qrcode-show" value="true" <?php echo $platform_config["activity-qrcode-show"] ? "checked" : ""; ?>>
									<span>显示</span>
								</div>
								<div class="activity-qrcode-select">
									<input type="radio" name="activity-qrcode-show" value="false" <?php echo $platform_config["activity-qrcode-show"] ? "" : "checked"; ?>>
									<span>隐藏</span>
								</div>
							</div>
							<div class="custom-pic <?php echo $platform_config["activity-qrcode-show"] ? "" : "disabled hidden"; ?>" name="pic" id="pic-activity-qrcode">
								<div class="custom-pic-img">
									<div class="custom-pic-div" style="background-image:url('<?php echo $platform_config["activity-qrcode"]; ?>');"></div>
								</div>
								<div class="custom-pic-size" name="<?php echo empty($platform_config["activity-qrcode-ext-desc"]) ? "" : $platform_config["activity-qrcode-ext-desc"]; ?>">344px*344px</div>
								<div class="custom-pic-name">公众号二维码</div>
							</div>
							<div class="clear"></div>
							<div class="pic-desc over"><input type="text" class="input-text"></div>
						</div>
						<?php endif; ?>
						<!-- 奖品发放规则 -->
						<?php if (!empty($platform_config["activity-gift-show"])): ?>
						<div class="actvity-gift-container">
							<div style="line-height:46px;">
								<span>奖品发放规则</span>
								<div class="activity-gift-select">
									<input type="radio" name="activity-gift-show" value="yes" <?php echo ($platform_config["activity-gift-show"] == "yes") ? "checked" : ""; ?>>
									<span>显示</span>
								</div>
								<div class="activity-gift-select">
									<input type="radio" name="activity-gift-show" value="no" <?php echo ($platform_config["activity-gift-show"] == "yes") ? "" : "checked"; ?>>
									<span>隐藏</span>
								</div>
							</div>
						</div>
						<?php endif; ?>
					</div>
				</div>
			</div>
			<!-- 活动页 -->
			<div class="custom-detail hidden" id="custom-detail-2">
				<!-- 玩法说明 -->
				<div class="custom-group">
					<div class="title">玩法说明</div>
					<div class="detail">
						<div><?php echo $default_platform_config["text"]["activity-text"]; ?></div>
					</div>
				</div>

				<!-- 动画元素 -->
				<?php if (!empty($platform_config["platform"]["texture"])): ?>
				<div class="custom-group">
					<div class="title">动画元素</div>
					<div class="detail">
						<?php foreach($platform_config["platform"]["texture"] as $textureKey => $textureValue): ?>
						<div>
						<?php foreach($textureValue as $textureItemKey => $textureItem): ?>
							<div class="custom-pic" name="pic" id="pic-texture-<?php echo $textureKey; ?>-<?php echo $textureItemKey; ?>">
								<div class="custom-pic-img">
									<div class="custom-pic-div" style="background-image:url('<?php echo $textureItem["url"]; ?>');"></div>
								</div>
								<div class="custom-pic-size" name="<?php echo empty($textureItem["ext_desc"]) ? "" : $textureItem["ext_desc"]; ?>"><?php echo empty($textureItem["size"]) ? "" : $textureItem["size"]; ?></div>
								<div class="custom-pic-name"><?php echo $textureItem["name"]; ?></div>
							</div>
						<?php endforeach; ?>
						<div class="clear"></div>
						</div>
						<?php endforeach; ?>
					</div>
					<div class="pic-desc"><input type="text" class="input-text"></div>
				</div>
				<?php endif; ?>

				<!-- 游戏元素 -->
				<?php if (!empty($platform_config["platform"]["game"])): ?>
				<div class="custom-group">
					<div class="title">图片</div>
					<div class="detail">
						<!-- 背景 -->
						<?php if (!empty($platform_config["platform"]["game"]["bg"])): ?>
						<div class="custom-pic" name="bg" id="pic-game-bg">
							<div class="custom-pic-img">
								<?php if(strpos($platform_config["platform"]["game"]["bg"]["url"], "#") !== 0): ?>
								<div class="custom-pic-div" style="background-image:url('<?php echo $platform_config["platform"]["game"]["bg"]["url"];?>');"  name="pic"></div>
								<?php else: ?>
								<div class="custom-pic-div" style="background-color:<?php echo $platform_config["platform"]["game"]["bg"]["url"];?>;" name="<?php echo $platform_config["platform"]["game"]["bg"]["url"];?>"></div>
								<?php endif; ?>
							</div>
							<div class="custom-pic-size" name="<?php echo empty($platform_config["platform"]["game"]["bg"]["ext_desc"]) ? "" : $platform_config["platform"]["game"]["bg"]["ext_desc"]; ?>">750px*1254px</div>
							<div class="custom-pic-name"><?php echo $platform_config["platform"]["game"]["bg"]["name"];?></div>
						</div>
						<?php endif; ?>
						<!-- 元素 -->
						<?php foreach($platform_config["platform"]["game"] as $key => $value): ?>
						<?php if (strpos($key, "bg_") !== FALSE && $key != "bg" && $key != "color"): ?>
						<div class="custom-pic" name="bg" id="pic-game-<?php echo $key; ?>">
							<div class="custom-pic-img">
								<div class="custom-pic-div" style="background-image:url('<?php echo $value["url"]; ?>');"></div>
							</div>
							<div class="custom-pic-size" name="<?php echo empty($value["ext_desc"]) ? "" : $value["ext_desc"]; ?>"><?php echo empty($value["size"]) ? "" : $value["size"]; ?></div>
							<div class="custom-pic-name"><?php echo $value["name"]; ?></div>
						</div>
						<?php elseif (strpos($key, "music_") === FALSE && $key != "bg" && $key != "color"): ?>
						<div class="custom-pic" name="pic" id="pic-game-<?php echo $key; ?>">
							<div class="custom-pic-img">
								<div class="custom-pic-div" style="background-image:url('<?php echo $value["url"]; ?>');"></div>
							</div>
							<div class="custom-pic-size" name="<?php echo empty($value["ext_desc"]) ? "" : $value["ext_desc"]; ?>"><?php echo empty($value["size"]) ? "" : $value["size"]; ?></div>
							<div class="custom-pic-name"><?php echo $value["name"]; ?></div>
						</div>
						<?php endif; ?>
						<?php endforeach; ?>
						<div class="clear"></div>
					</div>
					<div class="pic-desc"><input type="text" class="input-text"></div>
				</div>
				<?php endif; ?>

				<!-- 可配置元素 -->
				<?php if (!empty($platform_config["platform"]["configurable"])): ?>
				<?php foreach($platform_config["platform"]["configurable"] as $item_key => $item): ?>
				<div class="custom-group">
					<div class="title">
						<span><?php echo $item["name"]; ?></span>
						<div class="configurable-num">
							<span>个数</span>
							<span class="glyphicon glyphicon-minus-sign configurable-minus" name="<?php echo $item_key; ?>"></span>
							<input type="text" class="input-text" readonly="readonly" value="<?php echo count($item["elements"]); ?>">
							<span class="glyphicon glyphicon-plus-sign configurable-plus" name="<?php echo $item_key; ?>"></span>
						</div>
					</div>
					<div class="detail">
						<?php for($i = 0; $i < count($item["elements"]); $i++): ?>
						<div class="custom-pic" name="pic" id="pic-configurable-<?php echo $item_key; ?>-<?php echo $i; ?>">
							<div class="custom-pic-img">
								<div class="custom-pic-div" style="background-image:url('<?php echo $item["elements"][$i]; ?>');"></div>
							</div>
							<div class="custom-pic-size" name="<?php echo empty($item["ext_desc"]) ? "" : (empty($item["ext_desc"][$i]) ? "" : $item["ext_desc"][$i]); ?>"><?php echo empty($item["size"]) ? "" : isset($item["size"][$i])?$item["size"][$i]:"" ; ?></div>
							<div class="custom-pic-name"><?php echo $item["name"].($i+1); ?></div>
						</div>
						<?php endfor; ?>
					</div>
					<div class="pic-desc"><input type="text" class="input-text"></div>
				</div>
				<?php endforeach; ?>
				<?php endif; ?>

				<!-- 问答类游戏 -->
				<?php if ($tpl_info["tpl_id"] == 35): ?>
				<?php $answer_no = array('A', 'B', 'C', 'D'); ?>
				<!-- 问题清单 -->
				<div class="custom-group">
					<div class="title">问题清单</div>
					<div class="detail">
						<div class="custom-question">
							<?php foreach ($platform_config["game"]["questions"] as $key => $question): ?>
							<div class="custom-question-block">
								<div class="question">
									<div class="no"><?php echo $key+1; ?>.</div>
									<div class="text"><?php echo $question["question"]; ?></div>
									<div class="btn-container">
										<img src="//24haowan-cdn.shanyougame.com/public/images/web/icon-pencil.png" alt="" class="btn-edit">
										<img src="//24haowan-cdn.shanyougame.com/public/images/web/icon-trash.png" alt="" class="btn-delete">
									</div>
								</div>
								<div class="answer-container">
									<div class="custom-pic" style="pointer-events: none;">
										<div class="custom-pic-img">
											<div class="custom-pic-div" style="background-image:url(<?php echo empty($question["url"]) ? "//24haowan-cdn.shanyougame.com/public/images/web/pic-empty.png" : $question["url"]; ?>)"></div>
										</div>
										<div class="custom-pic-size" name=""></div>
									</div>
									<div class="answer">
										<?php foreach ($question["answers"] as $answer_key => $answer): ?>
										<div class="answer-block <?php echo $answer_key == $question["right"][0] ? "active" : ""; ?>">
											<span class="no"><?php echo $answer_no[$answer_key]; ?>.</span>
											<span class="text"><?php echo $answer; ?></span></div>
										<?php endforeach; ?>
									</div>
								</div>
							</div>
							<?php endforeach; ?>
						</div>
						<div id="btn-question-add">
							<img src="//24haowan-cdn.shanyougame.com/public/images/web/icon-plus.png" alt="">
						</div>
						<!-- 编辑容器 -->
						<div class="edit-container hidden" id="custom-question-edit-container">
							<div class="q-container">
								<div class="text-title">问题</div>
								<div class="custom-pic" name="pic" id="pic-question-img">
									<div class="custom-pic-img">
										<div class="custom-pic-div" style="background-image:url(//24haowan-cdn.shanyougame.com/public/images/web/pic-empty.png)"></div>
									</div>
									<div class="custom-pic-size" name="<?php echo empty($platform_config["game"]["q_img_size"]["ext_desc"]) ? "" : $platform_config["game"]["q_img_size"]["ext_desc"]; ?>"><?php echo empty($platform_config["game"]["q_img_size"]["size"]) ? "" : $platform_config["game"]["q_img_size"]["size"]; ?></div>
									<div class="custom-pic-name" style="display: none;">问题图片</div>
									<div class="question-img-delelte"><img src="//24haowan-cdn.shanyougame.com/public/images/web/icon-trash-white.png" alt=""></div>
								</div>
								<textarea id="input-question-edit-q" rows="4" class="input-textarea" placeholder="问题限制50个字。" maxlength="50"></textarea>
							</div>
							<div class="pic-desc"><input type="text" class="input-text"></div>
							<div class="a-container">
								<div class="text-title">问题答案</div>
								<div class="a-block-container">
									<div class="answer-block">
										<div class="no">A.</div>
										<input type="text" class="input-text" name="input-question-edit-a" placeholder="答案描述，限制15个字。" maxlength="15">
										<img src="//24haowan-cdn.shanyougame.com/public/images/web/icon-trash.png" alt="" class="btn-question-edit-delete" style="visibility: hidden">
									</div>
									<div class="answer-block">
										<div class="no">B.</div>
										<input type="text" class="input-text" name="input-question-edit-a" placeholder="答案描述，限制15个字。" maxlength="15">
										<img src="//24haowan-cdn.shanyougame.com/public/images/web/icon-trash.png" alt="" class="btn-question-edit-delete" style="visibility: hidden">
									</div>
									<div class="answer-block hidden">
										<div class="no">C.</div>
										<input type="text" class="input-text" name="input-question-edit-a" placeholder="答案描述，限制15个字。" maxlength="15">
										<img src="//24haowan-cdn.shanyougame.com/public/images/web/icon-trash.png" alt="" class="btn-question-edit-delete" style="visibility: hidden">
									</div>
									<div class="answer-block hidden">
										<div class="no">D.</div>
										<input type="text" class="input-text" name="input-question-edit-a" placeholder="答案描述，限制15个字。" maxlength="15">
										<img src="//24haowan-cdn.shanyougame.com/public/images/web/icon-trash.png" alt="" class="btn-question-edit-delete" style="visibility: hidden">
									</div>
									<div id="btn-answer-add">
										<img src="//24haowan-cdn.shanyougame.com/public/images/web/icon-plus.png" alt="">
									</div>
								</div>
							</div>
							<div class="true-answer">
								<div class="text-title">正确答案</div>
								<div class="question-dropdown" id="question-add-dropdown">
									<span name="A" class="question-dropdown-value">A</span>
									<span class="glyphicon glyphicon-triangle-bottom"></span>
									<div class="dropdown hidden">
										<span name="A">A</span>
										<span name="B">B</span>
										<span name="C" class="hidden">C</span>
										<span name="D" class="hidden">D</span>
									</div>
								</div>
							</div>
							<div class="bottom-btn-container">
								<button class="btn btn-g btn-s" id="btn-question-edit-confirm">创建问题</button>
								<span id="btn-question-edit-cancel">取消</span>
							</div>
						</div>
					</div>
				</div>
				<?php endif; ?>

				<!-- 测试类游戏 -->
				<?php if ($tpl_info["tpl_id"] == 37): ?>
				<?php $answer_no = array('A', 'B', 'C', 'D'); ?>
				<!-- 问题设置 -->
				<div class="custom-group">
					<div class="title">问题设置</div>
					<div class="detail">
						<div class="custom-question">
							<?php
								$question_select_html = "";
								$result_select_html = "";
								foreach ($platform_config["game"]["questions"] as $key => $question) {
									$question_select_html .= "<span name='".($key+1)."'>".($key+1).".".$question["question"]."</span>";
								}
								foreach ($platform_config["game"]["results"] as $key => $result) {
									$result_select_html .= "<span name='".($key+1)."'>".($key+1).".".$result["title"]."</span>";
								}
							?>
							<?php foreach ($platform_config["game"]["questions"] as $key => $question): ?>
							<div class="custom-question-block">
								<div class="question">
									<div class="no"><?php echo $key+1; ?>.</div>
									<div class="text"><?php echo $question["question"]; ?></div>
									<div class="btn-container">
										<img src="//24haowan-cdn.shanyougame.com/public/images/web/icon-pencil.png" alt="" class="btn-edit">
										<img src="//24haowan-cdn.shanyougame.com/public/images/web/icon-trash.png" alt="" class="btn-delete">
									</div>
								</div>
								<div class="answer-container">
									<div class="custom-pic" style="pointer-events: none;">
										<div class="custom-pic-img">
											<div class="custom-pic-div" style="background-image:url(<?php echo empty($question["url"]) ? "//24haowan-cdn.shanyougame.com/public/images/web/pic-empty.png" : $question["url"]; ?>)"></div>
										</div>
										<div class="custom-pic-size" name=""></div>
									</div>
									<div class="answer test-answer">
										<?php foreach ($question["answer"] as $answer_key => $answer): ?>
										<div class="answer-block">
											<span class="no"><?php echo $answer_no[$answer_key]; ?>.</span>
											<span class="text"><?php echo $answer["value"]; ?></span>
										</div>
										<div class="test-answer-select">
											<div>跳转至</div>
											<?php if (empty($answer["result"])): ?>
											<div class="question-dropdown" name="next-type">
												<span name="question" class="question-dropdown-value">问题</span>
												<span class="glyphicon glyphicon-triangle-bottom"></span>
												<div class="dropdown hidden">
													<span name="question">问题</span>
													<span name="result">结果</span>
												</div>
											</div>
											<?php $jump_text = $platform_config["game"]["questions"][$answer["jump"]-1]["question"]; ?>
											<div class="question-dropdown" name="next-detail">
												<span name="<?php echo $answer["jump"]; ?>" class="question-dropdown-value"><?php echo $answer["jump"].".".$jump_text; ?></span>
												<span class="glyphicon glyphicon-triangle-bottom"></span>
												<div class="dropdown hidden"><?php echo $question_select_html; ?></div>
											</div>
											<?php else: ?>
											<div class="question-dropdown" name="next-type">
												<span name="result" class="question-dropdown-value">结果</span>
												<span class="glyphicon glyphicon-triangle-bottom"></span>
												<div class="dropdown hidden">
													<span name="question">问题</span>
													<span name="result">结果</span>
												</div>
											</div>
											<?php $result_text = $platform_config["game"]["results"][$answer["result"]-1]["title"]; ?>
											<div class="question-dropdown" name="next-detail">
												<span name="<?php echo $answer["result"]; ?>" class="question-dropdown-value"><?php echo $answer["result"].".".$result_text; ?></span>
												<span class="glyphicon glyphicon-triangle-bottom"></span>
												<div class="dropdown hidden"><?php echo $result_select_html; ?></div>
											</div>
											<?php endif; ?>
										</div>
										<?php endforeach; ?>
									</div>
								</div>
							</div>
							<?php endforeach; ?>
						</div>
						<div id="btn-test-question-add">
							<img src="//24haowan-cdn.shanyougame.com/public/images/web/icon-plus.png" alt="">
						</div>
						<!-- 编辑容器 -->
						<div class="edit-container hidden" id="custom-test-question-edit-container">
							<div class="q-container">
								<div class="text-title">问题</div>
								<div class="custom-pic" name="pic" id="pic-test-question-img">
									<div class="custom-pic-img">
										<div class="custom-pic-div" style="background-image:url(//24haowan-cdn.shanyougame.com/public/images/web/pic-empty.png)"></div>
									</div>
									<div class="custom-pic-size" name="<?php echo empty($platform_config["game"]["q_img_size"]["ext_desc"]) ? "" : $platform_config["game"]["q_img_size"]["ext_desc"]; ?>"><?php echo empty($platform_config["game"]["q_img_size"]["size"]) ? "" : $platform_config["game"]["q_img_size"]["size"]; ?></div>
									<div class="custom-pic-name" style="display: none;">问题图片</div>
									<div class="question-img-delelte"><img src="//24haowan-cdn.shanyougame.com/public/images/web/icon-trash-white.png" alt=""></div>
								</div>
								<textarea id="input-test-question-edit-q" rows="4" class="input-textarea" placeholder="问题限制50个字。" maxlength="50"></textarea>
							</div>
							<div class="pic-desc"><input type="text" class="input-text"></div>
							<div class="a-container">
								<div class="text-title">选项</div>
								<div class="a-block-container">
									<div class="answer-block">
										<div class="no">A.</div>
										<input type="text" class="input-text" name="input-test-question-edit-a" placeholder="选项描述，限制15个字。" maxlength="15">
										<img src="//24haowan-cdn.shanyougame.com/public/images/web/icon-trash.png" alt="" class="btn-question-edit-delete" style="visibility: hidden">
									</div>
									<div class="answer-block">
										<div class="no">B.</div>
										<input type="text" class="input-text" name="input-test-question-edit-a" placeholder="选项描述，限制15个字。" maxlength="15">
										<img src="//24haowan-cdn.shanyougame.com/public/images/web/icon-trash.png" alt="" class="btn-question-edit-delete" style="visibility: hidden">
									</div>
									<div class="answer-block hidden">
										<div class="no">C.</div>
										<input type="text" class="input-text" name="input-test-question-edit-a" placeholder="选项描述，限制15个字。" maxlength="15">
										<img src="//24haowan-cdn.shanyougame.com/public/images/web/icon-trash.png" alt="" class="btn-question-edit-delete" style="visibility: hidden">
									</div>
									<div class="answer-block hidden">
										<div class="no">D.</div>
										<input type="text" class="input-text" name="input-test-question-edit-a" placeholder="选项描述，限制15个字。" maxlength="15">
										<img src="//24haowan-cdn.shanyougame.com/public/images/web/icon-trash.png" alt="" class="btn-question-edit-delete" style="visibility: hidden">
									</div>
									<div id="btn-test-answer-add">
										<img src="//24haowan-cdn.shanyougame.com/public/images/web/icon-plus.png" alt="">
									</div>
								</div>
							</div>
							<div class="bottom-btn-container">
								<button class="btn btn-g btn-s" id="btn-test-question-edit-confirm">创建问题</button>
								<span id="btn-test-question-edit-cancel">取消</span>
							</div>
						</div>
					</div>
				</div>
				<!-- 测试结果 -->
				<div class="custom-group">
					<div class="title">测试结果</div>
					<div class="detail">
						<div class="custom-result">
							<?php foreach ($platform_config["game"]["results"] as $key => $result): ?>
							<div class="custom-result-block">
								<div class="result-title">
									<div class="no"><?php echo $key+1; ?>.</div>
									<div class="text"><?php echo $result["title"]; ?></div>
									<div class="btn-container">
										<img src="//24haowan-cdn.shanyougame.com/public/images/web/icon-pencil.png" alt="" class="btn-edit">
										<img src="//24haowan-cdn.shanyougame.com/public/images/web/icon-trash.png" alt="" class="btn-delete">
									</div>
								</div>
								<div class="result-detail"><?php echo $result["detail"]; ?></div>
							</div>
							<?php endforeach; ?>
						</div>
						<div id="btn-test-result-add">
							<img src="//24haowan-cdn.shanyougame.com/public/images/web/icon-plus.png" alt="">
						</div>
						<!-- 编辑容器 -->
						<div class="edit-container hidden" id="custom-test-result-edit-container">
							<div class="title-container">
								<span>标题</span>
								<input type="text" class="input-text" placeholder="限制15个字。" maxlength="15" id="input-test-result-edit-title">
							</div>
							<div class="detail-container">
								<span>详情</span>
								<textarea id="input-test-result-edit-detail" rows="4" class="input-textarea" placeholder="问题限制50个字。" maxlength="50"></textarea>
							</div>
							<div class="bottom-btn-container">
								<button class="btn btn-g btn-s" id="btn-test-result-edit-confirm">创建结果</button>
								<span id="btn-test-result-edit-cancel">取消</span>
							</div>
						</div>
					</div>
				</div>
				<!-- 测试逻辑 -->
				<!-- <div class="custom-group">
					<div class="title">测试流程</div>
					<div class="detail">
						<div class="custom-test-logic"></div>
					</div>
				</div> -->
				<?php endif; ?>

				<!-- 生成类游戏 -->
				<?php if ($tpl_info["tpl_id"] == 39): ?>
				<div class="custom-group">
					<div class="title">标签设置</div>
					<div class="detail">
						<div class="custom-generate">
							<div class="desc">每个参与者的性格标签会分别根据星座（随机选取8个）、生日的日期尾数（随机选取3个）、以及其他类别（随机选取3个）进行生成。</div>
							<div class="desc" style="margin-bottom: 15px;">所有标签使用“|”进行分割，每个标签最长8个字。</div>
							<div class="custom-generate-block">
								<div class="tags-title">星座标签</div>
								<div class="tags-container" name="ctags">
									<div class="dropdown-container">
										<div class="tags-dropdown" name="ctags">
											<?php $ctags_first_key; ?>
											<?php foreach ($platform_config["game"]["tags"]["ctags"] as $key => $value): ?>
											<?php if (empty($ctags_first_key)) $ctags_first_key = $key; ?>
											<?php endforeach; ?>
											<span class="tags-dropdown-value"><?php echo $ctags_first_key; ?></span>
											<span class="glyphicon glyphicon-triangle-bottom"></span>
											<div class="dropdown hidden">
												<?php foreach ($platform_config["game"]["tags"]["ctags"] as $key => $value): ?>
												<span><?php echo $key; ?></span>
												<?php endforeach; ?>
											</div>
										</div>
									</div>
									<textarea class="input-textarea" name="input-tags" rows="3"><?php echo join("|", $platform_config["game"]["tags"]["ctags"][$ctags_first_key]); ?></textarea>
									<div class="note">每组最少8个标签、最多16个。</div>
								</div>
							</div>
							<div class="custom-generate-block">
								<div class="tags-title">生日尾数</div>
								<div class="tags-container" name="dtags">
									<div class="dropdown-container">
										<div class="tags-dropdown" name="dtags">
											<?php $dtags_first_key; ?>
											<?php foreach ($platform_config["game"]["tags"]["dtags"] as $key => $value): ?>
											<?php if (empty($dtags_first_key)) $dtags_first_key = $key; ?>
											<?php endforeach; ?>
											<span class="tags-dropdown-value"><?php echo $dtags_first_key; ?></span>
											<span class="glyphicon glyphicon-triangle-bottom"></span>
											<div class="dropdown hidden">
												<?php foreach ($platform_config["game"]["tags"]["dtags"] as $key => $value): ?>
												<span><?php echo $key; ?></span>
												<?php endforeach; ?>
											</div>
										</div>
									</div>
									<textarea class="input-textarea" name="input-tags" rows="3"><?php echo join("|", $platform_config["game"]["tags"]["dtags"][$dtags_first_key]); ?></textarea>
									<div class="note">每组最少3个标签、最多8个。</div>
								</div>
							</div>
							<div class="custom-generate-block">
								<div class="tags-title">其他标签</div>
								<div class="tags-container" name="other">
									<textarea class="input-textarea" name="input-tags" rows="3"><?php echo join("|", $platform_config["game"]["tags"]["other"]); ?></textarea>
									<div class="note">每组最少3个标签、最多8个。</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<?php endif; ?>

				<!-- 二维码 -->
				<?php if (!empty($platform_config["game"]["qrcode"])): ?>
				<div class="custom-group">
					<div class="title">二维码配置</div>
					<div class="detail">
						<div class="custom-game-qrcode">
							<div class="custom-game-qrcode-block">
								<div class="game-qrcode-title">二维码图片</div>
								<div class="game-qrcode-container">
									<div class="select-container">
										<div class="select-block">
											<input type="radio" name="game-qrcode-type" value="none" <?php echo (empty($platform_config["game"]["qrcode"]["pic"]) && empty($platform_config["game"]["qrcode"]["url"])) ? "checked" : "" ?>>
											<span>活动首页</span>
										</div>
										<div class="select-block">
											<input type="radio" name="game-qrcode-type" value="link" <?php echo (empty($platform_config["game"]["qrcode"]["pic"]) && !empty($platform_config["game"]["qrcode"]["url"])) ? "checked" : "" ?>>
											<span>自定义链接</span>
										</div>
										<div class="select-block">
											<input type="radio" name="game-qrcode-type" value="pic" <?php echo (!empty($platform_config["game"]["qrcode"]["pic"])) ? "checked" : "" ?>>
											<span>自定义图片</span>
										</div>
									</div>
									<input type="text" style="margin-top:10px;" class="input-text <?php echo (empty($platform_config["game"]["qrcode"]["pic"]) && !empty($platform_config["game"]["qrcode"]["url"])) ? "" : "hidden"; ?>" id="input-game-qrcode-link" placeholder="请输入二维码图片的链接" value="<?php echo $platform_config["game"]["qrcode"]["url"]; ?>">
									<div style="margin-top:10px;" class="custom-pic <?php echo empty($platform_config["game"]["qrcode"]["pic"]) ? "hidden" : ""; ?>" name="pic" id="pic-game-qrcode">
										<div class="custom-pic-img">
											<div class="custom-pic-div" style="background-image:url('<?php echo empty($platform_config["game"]["qrcode"]["pic"]) ? "//24haowan-cdn.shanyougame.com/game_tpl/activity-qrcode.jpg" : $platform_config["game"]["qrcode"]["pic"]; ?>');" name="pic"></div>
										</div>
										<div class="custom-pic-size" name="<?php echo empty($platform_config["game"]["qrcode"]["ext_desc"]) ? "" : $platform_config["game"]["qrcode"]["ext_desc"]; ?>"><?php echo empty($platform_config["game"]["qrcode"]["size"]) ? "" : $platform_config["game"]["qrcode"]["size"]; ?></div>
										<div class="custom-pic-name">二维码</div>
									</div>
								</div>
							</div>
							<div class="custom-game-qrcode-block">
								<div class="game-qrcode-title">二维码文案</div>
								<div class="game-qrcode-container">
									<input type="text" class="input-text" id="input-game-qrcode-text" value="<?php echo $platform_config["game"]["qrcode"]["text"]; ?>" placeholder="请输入二维码文案，限制15个字" maxlength="15">
								</div>
							</div>
						</div>
					</div>
				</div>
				<?php endif; ?>

				<!-- 配色选择 -->
				<?php if (!empty($platform_config["platform"]["game"]["color"])): ?>
				<div class="custom-group">
					<div class="title">配色选择</div>
					<div class="detail">
						<?php foreach ($platform_config["platform"]["game"]["color"] as $key => $color): ?>
						<div class="custom-pure-color" id="color-<?php echo $key; ?>">
							<span class="text-title"><?php echo $color["name"]; ?></span>
							<span class="color" style="background: <?php echo $color["color"]; ?>" name="<?php echo $color["color"]; ?>"></span>
						</div>
						<?php endforeach; ?>
					</div>
				</div>
				<?php endif; ?>
	
				<!-- 音乐/音效 -->
				<?php $music_exist = false; ?>
				<?php foreach($platform_config["platform"]["game"] as $key => $value): ?>
				<?php if (strpos($key, "music_") !== FALSE) { $music_exist = true;break; } ?>
				<?php endforeach; ?>
				<?php if ($music_exist): ?>
				<div class="custom-group">
					<div class="title">
						音乐<img class="title-q" src="//24haowan-cdn.shanyougame.com/public/images/web/icon-questionmark-gray.png">
						<div class="custom-desc hidden custom-desc-music">MP3格式，大小不超过1M</div>
					</div>
					<div class="detail">
						<div class="custom-music">
							<?php foreach($platform_config["platform"]["game"] as $key => $value): ?>
							<?php if (strpos($key, "music_") !== FALSE): ?>
							<div id="music-container-<?php echo $key; ?>">
								<span class="label-text"><?php echo $value["name"]; ?></span>
								<div class="select-div">
									<div class="select-container">
										<button class="music-button" name="<?php echo $key; ?>">
											<span class="glyphicon glyphicon-play"></span>
											<span class="glyphicon glyphicon-pause hidden"></span>
										</button>
										<div class="play-container">
											<div class="name">
												<span><?php echo $value["name"]; ?></span>
												<span class="play-time">00:00</span>
											</div>
											<div class="play-progress"></div>
										</div>
									</div>
								</div>
								<button class="btn btn-g btn-s upload">本地上传</button>
								<button class="btn btn-y btn-s reset" name="<?php echo $key; ?>">素材复原</button>
								<audio src="<?php echo $value["url"]; ?>" name="<?php echo $key; ?>"></audio>
								<input type="file" id="file-<?php echo $key; ?>" accept=".mp3">
							</div>
							<?php endif; ?>
							<?php endforeach; ?>
						</div>
					</div>
				</div>
				<?php endif; ?>
			</div>
			<!-- 结束页 -->
			<div class="custom-detail hidden" id="custom-detail-3">
				<div class="custom-group">
					<div class="title">图片</div>
					<div class="detail">
						<div class="custom-pic" name="bg" id="pic-background-game-over-menu">
							<div class="custom-pic-img">
								<?php if(strpos($platform_config["style"]["background"]["game-over-menu"], "#") !== 0): ?>
								<div class="custom-pic-div" style="background-image:url('<?php echo $platform_config["style"]["background"]["game-over-menu"];?>');"  name="pic"></div>
								<?php else: ?>
								<div class="custom-pic-div" style="background-color:<?php echo $platform_config["style"]["background"]["game-over-menu"];?>;" name="<?php echo $platform_config["style"]["background"]["game-over-menu"];?>"></div>
								<?php endif; ?>
							</div>
							<div class="custom-pic-size" name="<?php echo empty($platform_config["style"]["background"]["ext_desc"]) ? "" : $platform_config["style"]["background"]["ext_desc"]; ?>">750px*1254px</div>
							<div class="custom-pic-name">结束页背景</div>
						</div>
						<?php if ($tpl_info["type"] == 1 || $tpl_info["type"] == 3 || $tpl_info["type"] == 4): ?>
						<div class="custom-pic" name="pic" id="pic-banner-game-over-menu">
							<div class="custom-pic-img">
								<div class="custom-pic-div" style="background-image:url('<?php echo $platform_config["style"]["banner"]["game-over-menu"]; ?>');" ></div>
							</div>
							<div class="custom-pic-size" name="<?php echo empty($platform_config["style"]["banner"]["ext_desc"]) ? "" : $platform_config["style"]["banner"]["ext_desc"]; ?>"><?php echo empty($platform_config["style"]["banner"]["size"]) ? "" : $platform_config["style"]["banner"]["size"]; ?></div>
							<div class="custom-pic-name">结束页横幅</div>
						</div>
						<?php endif; ?>
						<div class="clear"></div>
					</div>
					<div class="pic-desc"><input type="text" class="input-text"></div>
				</div>
				<?php if ($tpl_info["type"] == 1 || $tpl_info["type"] == 3): ?>
				<?php if (isset($platform_config["disable-rank"])): ?>
				<div class="custom-group">
					<div class="title">排行榜</div>
					<div class="detail">
						<div>
							<input class="ios-switch ios-switch-anim" type="checkbox" <?php echo $platform_config["disable-rank"] ? "checked" : ""; ?> id="checkbox-disable-rank">
							<span>隐藏排行榜</span>
						</div>
					</div>
				</div>
				<?php endif; ?>
				<?php endif; ?>
			</div>
		</div>
	</div>
	<!-- 营销信息设置 -->
	<div class="custom-container hidden" id="gameinfo-container">
		<div class="custom-detail-container">
			<div class="custom-detail" style="background: transparent;">
				<?php if (empty($tpl_ext_info_disable) || (!empty($tpl_ext_info_disable["market"]) && !in_array("all", $tpl_ext_info_disable["market"]))): ?>
				<!-- 红包充值 -->
				<div id="giftmoney-pay-container" class="giftmoney-pay-container">
					<button class="btn btn-g btn-s" id="giftmoney-pay-btn">充值</button>
					<img src="//24haowan-cdn.shanyougame.com/public/images/web/icon-coin.png">
					<div style="font-weight: bold;">
                        设置的红包奖品总金额：<span id="giftmoney-pay-total">10000</span>元
                        <span class="giftmoney-pay-need">还需充值：<span id="giftmoney-pay-need">5000</span>元</span>
                    </div>
					<div style="font-size: 12px;">
						已充值金额：<span id="giftmoney-pay-payed">5000</span>元
						<span class="giftmoney-pay-total">合计: <span id="giftmoney-pay-count">1020</span>元</span>
					</div>
				</div>
				<!-- 奖品设置 -->
				<?php if ($tpl_info['type'] == 1 || $tpl_info['type'] == 3 || $tpl_info['type'] == 4): ?>
				<!-- 参与即可获奖 -->
				<?php 
					$gift_name = "";
					$gift_type = "";
					$rest_num = 0;
					if (!empty($user_gift_list) && !empty($all_gift_config)) {
						if (!empty($all_gift_config["play"])) {
							foreach($user_gift_list as $gift) {
								if ($gift["id"] == $all_gift_config["play"]["gift_id"]) {
									$gift_name = $gift["name"];
									$gift_type = $gift["gift_type"];
									$rest_num = $gift["left_num"];
									if ($gift_type == 2 || $gift_type == 3) {
										$gift_name = ($all_gift_config["play"]["sum"]/$all_gift_config["play"]["num"])."元".$gift_name;
									}
								}
							}
						}
					}
					$gift_config_play = false;
					$sended_play = 0;
					$cycle_enable_play = false;
					$cycle_play = "day";
					$cycle_num_play = 1;
					$repeat_play = "no";
					if (!empty($all_gift_config["play"])) {
						if (!empty($all_gift_config["play"]["cycle"])) {
							$cycle_enable_play = true;
							$cycle_play = $all_gift_config["play"]["cycle"];
							$cycle_num_play = $all_gift_config["play"]["cycle_num"];
							$repeat_play = $all_gift_config["play"]["repeat"];
						}
					}
					if (!empty($gift_config)) {
						foreach ($gift_config as $gift_config_index => $gift_config_item) {
							if ($gift_config_item["type"] == 4) {
								$gift_config_play = true;
								if (!empty($original_gift[$gift_config_index]["cycle"])) {
									$sended_play = $original_gift[$gift_config_index]["prize"][0]["num"] - $gift_config_item["prize"][0]["num"];
								}
								break;
							}
						}
					}
				?>
				<div class="custom-info-block <?php echo ($gift_config_play) ? "" : "empty-info"; ?> <?php echo ($game_info['status'] != "wait" && !$gift_config_play) ? "hidden" : ""; ?>" id="custom-play">
					<div class="title">
						<input class="ios-switch ios-switch-anim prize-switch <?php echo ($game_info["lock_gift"] != "yes") ? "" : "disabled"; ?>" type="checkbox" name="play" <?php echo ($game_info["lock_gift"] != "yes") ? "" : "disabled"; ?> <?php if (!empty($gift_config)) echo ($gift_config_play) ? "checked" : ""; ?>>
						<img src="//24haowan-cdn.shanyougame.com/public/images/web/icon-market-play.png" alt="" class="icon">
						<span>参加即可获奖</span>
						<span class="note hidden">参与游戏即可获得奖品</span>
					</div>
					<div class="custom-info-detail hidden">
						<div class="custom-prize-block">
							<table class="custom-prize-block-table" name="play">
								<tr>
									<th>发奖方式</th>
									<td>
										<div class="prize-cycle-select">
											<input type="radio" class="<?php echo $game_info["lock_gift"] == "yes" ? "disabled" : ""; ?>" name="prize-cycle-play" value="once" <?php echo $cycle_enable_play ? "" : "checked"; ?> <?php echo $game_info["lock_gift"] == "yes" ? "disabled" : ""; ?>>
											<span>每玩家仅可获得一次奖品</span>
										</div>
										<div class="prize-cycle-select">
											<input type="radio" class="<?php echo $game_info["lock_gift"] == "yes" ? "disabled" : ""; ?>" name="prize-cycle-play" value="cycle" <?php echo $cycle_enable_play ? "checked" : ""; ?> <?php echo $game_info["lock_gift"] == "yes" ? "disabled" : ""; ?>>
											<span>周期性发奖</span>
										</div>
									</td>
								</tr>
								<tr class="tr-cycle <?php echo $cycle_enable_play ? "" : "hidden"; ?>">
									<th>发奖周期</th>
									<td style="text-align: left;">
										<div class="prize-cycle-dropdown <?php echo $game_info["lock_gift"] == "yes" ? "disabled" : ""; ?>" id="prize-cycle-dropdown-play">
											<?php 
												$cycle_text_play = "每天";
												if ($cycle_enable_play) {
													$cycle_text_play = ($cycle_play == "day") ? "每天" : (($cycle_play == "week") ? "每周" : "每月");
												}
											?>
											<span name="<?php echo $cycle_play; ?>" class="prize-cycle-dropdown-value"><?php echo $cycle_text_play; ?></span>
											<span class="glyphicon glyphicon-triangle-bottom"></span>
											<div class="dropdown hidden">
												<span name="day">每天</span>
												<span name="week">每周</span>
												<span name="month">每月</span>
											</div>
										</div>
										<div class="prize-cycle-remind">
											<img class="title-q" src="//24haowan-cdn.shanyougame.com/public/images/web/icon-questionmark-gray.png">
											<div class="custom-desc hidden" style="width: 250px;left: -68px;">
												<div>每天按自然天为一周期。</div>
												<div>每周按周一至周日为一个周期。</div>
												<div>每月按1号至次月1号前为一个周期。</div>
											</div>
										</div>
										<div class="prize-cycle-total">按当前活动时间算，共<span>10</span>期</div>
									</td>
								</tr>
								<tr>
									<th class="num-th"><?php echo ($cycle_enable_play) ? $cycle_text_play : "奖品"; ?>数量</th>
									<td>
										<table class="play-table">
											<tr>
												<th style="<?php echo ($gift_type == 3 || $gift_type == 2) ? "width:33%" : "width:50%"; ?>">奖品</th>
												<th style="width: 33%;" class="play-giftmoney-common hidden">
													<span><?php echo ($gift_type == 3) ? "平均" : "单个"; ?>金额</span>
													<img src="//24haowan-cdn.shanyougame.com/public/images/web/icon-workbench-info.png" class="giftmoney-price-remind-img">
													<div class="giftmoney-price-remind-text hidden">单个红包金额在1元－200元之间，活动发布后将不可修改。</div>
												</th>
												<th style="width:50%;" class="prize-num-th">
													<span>数量</span>
													<img src="//24haowan-cdn.shanyougame.com/public/images/web/icon-workbench-info.png" class="giftmoney-num-remind-img hidden">
													<div class="giftmoney-num-remind-text hidden">如果已经充值了红包需要减少红包总额，剩余金额将在活动结束后72h内原路返还到充值账号内。</div>
												</th>
											</tr>
											<tr>
												<td>
													<button class="btn btn-g btn-s play-prize-btn <?php echo ($game_info["lock_gift"] != "yes") ? "" : "disabled"; ?>" name="<?php echo empty($all_gift_config["play"]) ? "" : $all_gift_config["play"]["gift_id"].'-'.$gift_type; ?>"><?php echo empty($all_gift_config["play"]) ? "选择奖品" : $gift_name; ?></button>
												</td>
												<td style="padding-right: 10px;" class="play-giftmoney-common hidden">
													<input type="text" class="input-text" name="input-giftmoney-common" value="<?php echo ($gift_type == 2 || $gift_type == 3) ? (int)($all_gift_config["play"]["sum"]/$all_gift_config["play"]["num"]) : ""; ?>">
												</td>
												<td style="position:relative;">
													<input type="text" class="input-text" name="num" value="<?php if ($cycle_enable_play) {echo $all_gift_config["play"]["cycle_num"];} else {echo empty($all_gift_config["play"]) ? "" : $all_gift_config["play"]["num"];} ?>">
													<?php if (!$cycle_enable_play): ?>
													<div class="note <?php echo ($game_info['status'] != 'wait') ? "" : "hidden"; ?>"><?php echo empty($all_gift_config["play"]) ? "&nbsp;" : "已发放数：<span class='sended'>".$sended_play."</span>"; ?></div>
													<?php endif; ?>
												</td>
											</tr>
										</table>
									</td>
								</tr>
								<tr class="tr-cycle <?php echo $cycle_enable_play ? "" : "hidden"; ?>">
									<th>奖品总数</th>
									<td style="text-align: left;">
										<div style="position: relative;">
											<input type="text" class="input-text" style="width: 120px;" name="input-cycle-total" value="<?php echo empty($all_gift_config["play"]) ? "" : $all_gift_config["play"]["num"]; ?>">
											<div class="cycle-total-remind-container">根据当前活动期数及每周期奖品设置，需要至少<span>500</span>个奖品总数，才可保证每周期足额发放奖品。</div>
											<?php if ($cycle_enable_play): ?>
											<div class="note <?php echo ($game_info['status'] != 'wait') ? "" : "hidden"; ?>"><?php echo empty($all_gift_config["play"]) ? "&nbsp;" : "已发放数：<span class='sended'>".$sended_play."</span>"; ?></div>
											<?php endif; ?>
										</div>
									</td>
								</tr>
							</table>
							
						</div>
						<div class="custom-info-bottom">
							<button class="btn btn-g btn-s confirm-btn" name="play">确定</button>
							<button class="btn btn-s cancel-btn" name="play">取消</button>
						</div>
					</div>
					<div class="custom-info-preview <?php if (!empty($gift_config)) {echo ($gift_config_play) ? "" : "hidden";} else {echo "hidden";}; ?>" name='play'>
						<table id="custom-info-preview-play">
							<tr>
								<th style="width: 90%;">奖品名</th>
								<th style="width: 10%;">数量</th>
							</tr>
							<?php if ($gift_config_play): ?>
							<?php 
								$gift_name = "";
								$gift_type = "";
								foreach($user_gift_list as $gift) {
									if ($gift["id"] == $all_gift_config["play"]["gift_id"]) {
										$gift_name = $gift["name"];
										$gift_type = $gift["gift_type"];
									}
								}
								if ($gift_type == 2 || $gift_type == 3) {
									$gift_name .= '（共'.$all_gift_config["play"]["sum"]."元）";
								}
							?>
							<tr>
								<td><?php echo $gift_name; ?></td>
								<td><?php echo $all_gift_config["play"]["num"]; ?></td>
							</tr>
							<?php endif; ?>
						</table>
						<button class="btn custom-info-preview-edit" name="play">修改</button>
					</div>
				</div>
				<!-- 分享即可获奖 -->
				<?php 
					$gift_name = "";
					$gift_type = "";
					$rest_num = 0;
					if (!empty($user_gift_list) && !empty($all_gift_config)) {
						if (!empty($all_gift_config["share"])) {
							foreach($user_gift_list as $gift) {
								if ($gift["id"] == $all_gift_config["share"]["gift_id"]) {
									$gift_name = $gift["name"];
									$gift_type = $gift["gift_type"];
									$rest_num = $gift["left_num"];
									if ($gift_type == 2 || $gift_type == 3) {
										$gift_name = ($all_gift_config["share"]["sum"]/$all_gift_config["share"]["num"])."元".$gift_name;
									}
								}
							}
						}
					}
					$gift_config_share = false;
					$sended_share = 0;
					if (!empty($gift_config)) {
						foreach ($gift_config as $gift_config_index => $gift_config_item) {
							if ($gift_config_item["type"] == 3) {
								$gift_config_share = true; 
								$sended_share = $original_gift[$gift_config_index]["prize"][0]["num"] - $gift_config_item["prize"][0]["num"];
								break;
							}
						}
					}
				?>
				<div class="custom-info-block <?php echo ($gift_config_share) ? "" : "empty-info"; ?> <?php echo ($game_info['status'] != "wait" && !$gift_config_share) ? "hidden" : ""; ?>" id="custom-share">
					<div class="title">
						<input class="ios-switch ios-switch-anim prize-switch <?php echo ($game_info["lock_gift"] != "yes") ? "" : "disabled"; ?>" type="checkbox" name="share" <?php echo ($game_info["lock_gift"] != "yes") ? "" : "disabled"; ?> <?php if (!empty($gift_config)) echo ($gift_config_share) ? "checked" : ""; ?>>
						<img src="//24haowan-cdn.shanyougame.com/public/images/web/icon-market-share.png" alt="" class="icon">
						<span>分享后可获奖</span>
						<span class="note hidden">将游戏分享出去即可获得奖品</span>
					</div>
					<div class="custom-info-detail hidden">
						<div class="custom-prize-block">
							<table class="share-table">
								<tr>
									<th style="<?php echo ($gift_type == 3 || $gift_type == 2) ? "width:33%" : "width:50%"; ?>">奖品</th>
									<th style="width: 33%;" class="share-giftmoney-common hidden">
										<span><?php echo ($gift_type == 3) ? "平均" : "单个"; ?>金额</span>
										<img src="//24haowan-cdn.shanyougame.com/public/images/web/icon-workbench-info.png" class="giftmoney-price-remind-img">
										<div class="giftmoney-price-remind-text hidden">单个红包金额在1元－200元之间，活动发布后将不可修改。</div>
									</th>
									<th style="width:50%;" class="prize-num-th">
										<span>数量</span>
										<img src="//24haowan-cdn.shanyougame.com/public/images/web/icon-workbench-info.png" class="giftmoney-num-remind-img hidden">
										<div class="giftmoney-num-remind-text hidden">如果已经充值了红包需要减少红包总额，剩余金额将在活动结束后72h内原路返还到充值账号内。</div>
									</th>
								</tr>
								<tr>
									<td>
										<button class="btn btn-g btn-s share-prize-btn <?php echo ($game_info["lock_gift"] != "yes") ? "" : "disabled"; ?>" name="<?php echo empty($all_gift_config["share"]) ? "" : $all_gift_config["share"]["gift_id"].'-'.$gift_type; ?>"><?php echo empty($all_gift_config["share"]) ? "选择奖品" : $gift_name; ?></button>
									</td>
									<td  style="padding-right: 10px;" class="share-giftmoney-common hidden">
										<input type="text" class="input-text" name="input-giftmoney-common" value="<?php echo ($gift_type == 2 || $gift_type == 3) ? (int)($all_gift_config["share"]["sum"]/$all_gift_config["share"]["num"]) : ""; ?>">
									</td>
									<td style="position:relative;">
										<input type="text" class="input-text" name="num" value="<?php echo empty($all_gift_config["share"]) ? "" : $all_gift_config["share"]["num"]; ?>">
										<div class="note <?php echo ($game_info['status'] != 'wait') ? "" : "hidden"; ?>"><?php echo empty($all_gift_config["share"]) ? "&nbsp;" : "已发放数：<span class='sended'>".$sended_share."</span>"; ?></div>
										<?php if ($game_info["status"] != "wait"): ?>
										<div class="num-remind-container">活动上线中，奖品数量不能小于已发放数量</div>
										<?php endif; ?>
									</td>
								</tr>
							</table>
						</div>
						<div class="note" style="margin-top:6px;">*每个用户仅能获奖一次，多次分享也只会获取一份奖品。</div>
						<div class="custom-info-bottom">
							<button class="btn btn-g btn-s confirm-btn" name="share">确定</button>
							<button class="btn btn-s cancel-btn" name="share">取消</button>
						</div>
					</div>
					<div class="custom-info-preview <?php if (!empty($gift_config)) {echo ($gift_config_share) ? "" : "hidden";} else {echo "hidden";}; ?>" name='share'>
						<table id="custom-info-preview-share">
							<tr>
								<th style="width: 90%;">奖品名</th>
								<th style="width: 10%;">数量</th>
							</tr>
							<?php if ($gift_config_share): ?>
							<?php 
								$gift_name = "";
								$gift_type = "";
								foreach($user_gift_list as $gift) {
									if ($gift["id"] == $all_gift_config["share"]["gift_id"]) {
										$gift_name = $gift["name"];
										$gift_type = $gift["gift_type"];
									}
								}
								if ($gift_type == 2 || $gift_type == 3) {
									$gift_name .= '（共'.$all_gift_config["share"]["sum"]."元）";
								}
							?>
							<tr>
								<td><?php echo $gift_name; ?></td>
								<td><?php echo $all_gift_config["share"]["num"]; ?></td>
							</tr>
							<?php endif; ?>
						</table>
						<button class="btn custom-info-preview-edit" name="share">修改</button>
					</div>
				</div>
				<?php endif; ?>
				<!-- 抽奖获奖 -->
				<?php 
					$gift_config_lottery = false;
					$condition_text = "";
					$lottery_prizes;

					$cycle_enable_lottery = false;
					$cycle_lottery = "day";
					$cycle_num_lottery = 1;
					$repeat_lottery = "";
					if (!empty($all_gift_config["lottery"])) {
						if (!empty($all_gift_config["lottery"]["cycle"])) {
							$cycle_enable_lottery = true;
							$cycle_lottery = $all_gift_config["lottery"]["cycle"];
							$cycle_num_lottery = $all_gift_config["lottery"]["cycle_num"];
							$repeat_lottery = $all_gift_config["lottery"]["repeat"];
						}
					}

					if (!empty($gift_config)) {
						foreach ($gift_config as $gift_config_index => $gift_config_item) {
							if ($gift_config_item["type"] == 5) {
								$gift_config_lottery = true;
								if ($gift_config_item["condition"] == "play") {
									$condition_text = "直接抽奖";
								} else if ($gift_config_item["condition"] == "score") {
									$condition_text = "达到".$gift_config_item["score"]."分参与抽奖";
								} else if ($gift_config_item["condition"] == "share") {
									$condition_text = "分享后抽奖";
								}
								$lottery_prizes = $gift_config_item["prize"];
								break;
							}
						}
					}
				?>
				<div class="custom-info-block <?php echo ($gift_config_lottery) ? "" : "empty-info"; ?> <?php echo ($game_info['status'] != "wait" && !$gift_config_lottery) ? "hidden" : ""; ?>" id="custom-lottery">
					<div class="title">
						<input class="ios-switch ios-switch-anim prize-switch <?php echo ($game_info["lock_gift"] != "yes") ? "" : "disabled"; ?>" type="checkbox" name="lottery" <?php echo ($game_info["lock_gift"] != "yes") ? "" : "disabled"; ?> <?php if (!empty($gift_config)) echo ($gift_config_lottery) ? "checked" : ""; ?>>
						<img src="//24haowan-cdn.shanyougame.com/public/images/web/icon-market-lottery.png" alt="" class="icon">
						<span>抽奖获奖</span>
						<span class="note hidden">采用抽奖方式随机发放奖品</span>
					</div>
					<div class="custom-info-detail hidden">
						<!-- 抽奖形式 -->
						<div class="lottery-way-container">	
							<div class="text-title">抽奖形式</div>
							<div>
								<div class="select-inline-block">
									<input type="radio" name="lottery-way" value="times" <?php echo $cycle_enable_lottery ? "" : "checked"; ?> <?php echo ($game_info["lock_gift"] != "yes") ? "" : "disabled"; ?>>
									<span>固定次数</span>
								</div>
								<div class="select-inline-block">
									<input type="radio" name="lottery-way" value="cycle" <?php echo $cycle_enable_lottery ? "checked" : ""; ?> <?php echo ($game_info["lock_gift"] != "yes") ? "" : "disabled"; ?>>
									<span>周期性重复抽奖</span>
								</div>
							</div>
						</div>
						<!-- 抽奖次数 -->
						<div class="lottery-times-container <?php echo $cycle_enable_lottery ? "hidden" : ""; ?>">
							<div class="text-title">抽奖次数</div>
							<div>
								<input type="text" class="input-text <?php echo ($game_info["lock_gift"] != "yes") ? "" : "disabled"; ?>" id="input-limit-times" value="<?php echo ($game_info['limit_times'] < 0) ? 1 : $game_info['limit_times']; ?>" <?php echo ($game_info["lock_gift"] == "yes") ? "readonly='readonly'" : ""; ?>>
								<span>次</span>
							</div>
						</div>
						<!-- 抽奖周期 -->
						<div class="lottery-cycle-container <?php echo $cycle_enable_lottery ? "" : "hidden"; ?>">
							<div class="text-title">抽奖周期</div>
							<div>
								<div class="prize-cycle-dropdown <?php echo $game_info["lock_gift"] == "yes" ? "disabled" : ""; ?>" id="prize-cycle-dropdown-lottery">
									<?php 
										$cycle_text_lottery = "每天";
										if ($cycle_enable_lottery) {
											$cycle_text_lottery = ($cycle_lottery == "day") ? "每天" : (($cycle_lottery == "week") ? "每周" : "每月");
										}
									?>
									<span name="<?php echo $cycle_lottery; ?>" class="prize-cycle-dropdown-value"><?php echo $cycle_text_lottery; ?></span>
									<span class="glyphicon glyphicon-triangle-bottom"></span>
									<div class="dropdown hidden">
										<span name="day">每天</span>
										<span name="week">每周</span>
										<span name="month">每月</span>
									</div>
								</div>
								<div class="prize-cycle-remind">
									<img class="title-q" src="//24haowan-cdn.shanyougame.com/public/images/web/icon-questionmark-gray.png">
									<div class="custom-desc hidden" style="width: 250px;left: -68px;">
										<div>每天按自然天为一周期。</div>
										<div>每周按周一至周日为一个周期。</div>
										<div>每月按1号至次月1号前为一个周期。</div>
									</div>
								</div>
								<div class="prize-cycle-total">按当前活动时间算，共<span>10</span>期</div>
							</div>
						</div>
						<!-- 每人每天抽奖 -->
						<div class="lottery-cycle-num-container <?php echo $cycle_enable_lottery ? "" : "hidden"; ?>">
							<div class="text-title">每人每天抽奖</div>
							<div>
								<input type="text" class="input-text" id="lottery-cycle-num" value="<?php echo $cycle_num_lottery; ?>">
								<span>次</span>
							</div>
						</div>
						<!-- 每人最多中奖 -->
						<div class="lottery-cycle-repeat-container <?php echo $cycle_enable_lottery ? "" : "hidden"; ?>">
							<div class="text-title">每人最多中奖</div>
							<div>
								<input type="text" class="input-text" id="lottery-cycle-repeat" value="<?php echo empty($repeat_lottery) ? 1 : $repeat_lottery; ?>">
								<span>次</span>
							</div>
						</div>
						<!-- 抽奖条件 （抽奖类默认为直接抽奖） -->
						<div class="lottery-condition-container <?php echo $tpl_info["type"] == 2 ? "hidden" : ""; ?>">
							<div class="text-title">抽奖条件</div>
							<div>
								<div class="select-inline-block">
									<input type="radio" name="lottery-condition" value="play" <?php echo empty($all_gift_config["lottery"]) ? "checked" : ($all_gift_config["lottery"]["condition"] == "play" ? "checked": ""); ?> <?php echo ($game_info["lock_gift"] != "yes") ? "" : "disabled"; ?>>
									<span>直接抽奖</span>
								</div>
								<div class="select-inline-block">
									<input type="radio" name="lottery-condition" value="score" <?php echo empty($all_gift_config["lottery"]) ? "" : ($all_gift_config["lottery"]["condition"] == "score" ? "checked": ""); ?> <?php echo ($game_info["lock_gift"] != "yes") ? "" : "disabled"; ?>>
									<?php if ($tpl_info["type"] == 1 || $tpl_info["type"] == 3): ?>
									<span>分数大于</span>
									<?php elseif ($tpl_info["type"] == 4): ?>
									<span>完成第</span>
									<?php endif; ?>
									<input type="text" class="input-text <?php echo ($game_info["lock_gift"] != "yes") ? "" : "disabled"; ?> <?php echo empty($all_gift_config["lottery"]) ? "disabled" : ($all_gift_config["lottery"]["condition"] == "score" ? "": "disabled"); ?>" id="lottery-condition-score"
										value="<?php echo empty($all_gift_config["lottery"]) ? "" : ($all_gift_config["lottery"]["condition"] == "score" ? $all_gift_config["lottery"]["score"] : ""); ?>"
										<?php echo ($game_info["lock_gift"] != "yes") ? "" : "readonly='readonly'"; ?>
										<?php echo empty($all_gift_config["lottery"]) ? "readonly='readonly'" : ($all_gift_config["lottery"]["condition"] == "score" ? "": "readonly='readonly'"); ?>>
									<?php if ($tpl_info["type"] == 1 || $tpl_info["type"] == 3): ?>
									<span>分</span>
									<?php elseif ($tpl_info["type"] == 4): ?>
									<span>关</span>
									<?php endif; ?>
									<?php if ($tpl_info["type"] == 1 || $tpl_info["type"] == 3): ?>
										<?php if(!empty($tpl_info['score_level'])): ?>
										<?php if ($score_level = CJSON::decode($tpl_info['score_level'], true)): ?>
										<div class="score-desc-container hidden">
											<div><span>新手</span><span><?php echo "0-".$score_level[0]; ?></span></div>
											<?php for ($i = 0; $i < count($score_level); $i++): ?>
											<?php 
												$score_level_text = "";
												$score_level_score = "";
												if ($i == 0) {
													$score_level_text = "普通";
													$score_level_score = $score_level[$i]."-".$score_level[$i+1];
												} else if ($i == 1) {
													$score_level_text = "高手";
													$score_level_score = $score_level[$i]."-".$score_level[$i+1];
												} else if ($i == 2) {
													$score_level_text = "大神";
													$score_level_score = $score_level[$i]."及以上";
												}
											?>
											<div><span><?php echo $score_level_text; ?></span><span><?php echo $score_level_score; ?></span></div>
											<?php endfor; ?>
										</div>
										<?php endif; ?>
										<?php endif; ?>
									<?php elseif ($tpl_info["type"] == 4): ?>
									<div class="score-desc-container hidden">
										<div><span>活动共</span><span><?php echo $tpl_info["section"]; ?>关</span></div>
									</div>
									<?php endif; ?>
								</div>
								<div class="select-inline-block">
									<input type="radio" name="lottery-condition" value="share" <?php echo empty($all_gift_config["lottery"]) ? "" : ($all_gift_config["lottery"]["condition"] == "share" ? "checked": ""); ?> <?php echo ($game_info["lock_gift"] != "yes") ? "" : "disabled"; ?>>
									<span>分享成功后</span>
								</div>
							</div>
						</div>
						<!-- 附加选项 -->
						<div class="lottery-add-chance-container <?php echo empty($all_gift_config["lottery"]) ? "" : ($all_gift_config["lottery"]["condition"] == "share" ? "hidden": ""); ?>">
							<div class="text-title">附加选项</div>
							<div>
								<input class="ios-switch ios-switch-anim" type="checkbox" name="add-chance" <?php echo empty($all_gift_config["lottery"]) ? "" : (empty($all_gift_config["lottery"]["add_chance"]) ? "": "checked"); ?> <?php echo ($game_info["lock_gift"] != "yes") ? "" : "disabled"; ?>>
								<span>成功分享可获得额外一次抽奖机会</span>
							</div>
						</div>
						<!-- 奖品具体配置 -->
						<button class="btn btn-g btn-s <?php echo ($game_info["lock_gift"] != "yes") ? "" : "disabled"; ?>" id="btn-lottery-prize-add" style="margin-top: 10px;">添加奖品</button>
						<div class="custom-prize-block">
							<div class="lottery-percent-main">
								<span>中奖概率</span>
								<input type="text" class="input-text" name="percent" id="input-lottery-percent" value="<?php echo empty($all_gift_config["lottery"]) ? "" : $all_gift_config["lottery"]["percent"]; ?>">
								<span>%</span>
							</div>
							<div class="lottery-remind-text">
								<span class="remind-title">奖品</span>
								<span class="remind-detail">可以设置多种奖品，玩家若得奖随机获得一种奖品，中奖几率均匀分布，奖品数越多中奖率越高。</span>
							</div>
							<?php if (!empty($all_gift_config["lottery"])): ?>
							
							<?php 
								$total_lottery_num = 0;
								for ($i = 0; $i < count($all_gift_config["lottery"]["prize"]); $i++) {
									$total_lottery_num += $all_gift_config["lottery"]["prize"][$i]["num"];
								}
							?>

							<?php for ($i = 0; $i < count($all_gift_config["lottery"]["prize"]); $i++): ?>
							<?php 
								$gift_name = "";
								$gift_type = "";
								foreach($user_gift_list as $gift) {
									if ($gift["id"] == $all_gift_config["lottery"]["prize"][$i]["gift_id"]) {
										$gift_name = $gift["name"];
										$gift_type = $gift["gift_type"];
										if ($gift_type == 2 || $gift_type == 3) {
											$gift_name = ($all_gift_config["lottery"]["prize"][$i]["sum"]/$all_gift_config["lottery"]["prize"][$i]["num"])."元".$gift_name;
										}
									}
								}
								$sended_rank = 0;
								$percent = 0;
								if (!empty($gift_config)) {
									foreach ($gift_config as $gift_config_index => $gift_config_item) {
										if ($gift_config_item["type"] == 5) {
											$sended_rank = $original_gift[$gift_config_index]["prize"][$i]["num"] - $gift_config_item["prize"][$i]["num"];
										}
									}
								}
								$percent = round($all_gift_config["lottery"]["prize"][$i]["num"]/$total_lottery_num*$all_gift_config["lottery"]["percent"], 3);
							?>

							<div class="lottery-block">
								<div>
									<span>奖品<?php echo $numberString[$i]; ?></span>
									<img src="//24haowan-cdn.shanyougame.com/public/images/web/icon-close.png" class="btn-delete <?php echo (count($all_gift_config["lottery"]["prize"]) > 1 && $game_info["lock_gift"] != "yes") ? "" : "hidden"; ?>">
								</div>
								<table class="lottery-table">
									<tr>
										<th style="width: 25%;">奖品</th>
										<th style="width: 25%;" class="lottery-giftmoney-common hidden">
											<span><?php echo ($gift_type == 3) ? "平均" : "单个"; ?>金额</span>
											<img src="//24haowan-cdn.shanyougame.com/public/images/web/icon-workbench-info.png" class="giftmoney-price-remind-img">
											<div class="giftmoney-price-remind-text hidden">单个红包金额在1元－200元之间，活动发布后将不可修改。</div>
										</th>
										<th style="width:50%;" class="prize-num-th">
											<span>数量</span>
											<img src="//24haowan-cdn.shanyougame.com/public/images/web/icon-workbench-info.png" class="giftmoney-num-remind-img hidden">
											<div class="giftmoney-num-remind-text hidden">如果已经充值了红包需要减少红包总额，剩余金额将在活动结束后72h内原路返还到充值账号内。</div>
										</th>
										<th style="width: 25%;">中奖率</th>
									</tr>
									<tr>
										<td><button class="btn btn-g btn-s lotter-prize-btn <?php echo ($game_info["lock_gift"] != "yes") ? "" : "disabled"; ?>" name="<?php echo $all_gift_config["lottery"]["prize"][$i]["gift_id"].'-'.$gift_type; ?>"><?php echo $gift_name; ?></button></td>
										<td class="lottery-giftmoney-common hidden">
											<input type="text" class="input-text" name="input-giftmoney-common" value="<?php echo ($gift_type == 2 || $gift_type == 3) ? (int)($all_gift_config["lottery"]["prize"][$i]["sum"]/$all_gift_config["lottery"]["prize"][$i]["num"]) : ""; ?>">
										</td>
										<td>
											<div class="lottery-num-container">
												<input type="text" class="input-text" name="num" value="<?php echo $all_gift_config["lottery"]["prize"][$i]["num"]; ?>">
												<div class="note <?php echo ($game_info['status'] != 'wait') ? "" : "hidden"; ?>">已发放数：<span class='sended'><?php echo $sended_rank; ?></span></div>
												<?php if ($game_info["status"] != "wait"): ?>
												<div class="num-remind-container">活动上线中，奖品数量不能小于已发放数量</div>
												<?php endif; ?>
											</div>
										</td>
										<td>
											<span class="lottery-prize-percent"><?php echo $percent; ?></span>
											<span>%</span>
										</td>
									</tr>
								</table>
							</div>
							<?php endfor; ?>
							<?php else: ?>
							<div class="lottery-block">
								<div>
									<span>奖品一</span>
									<img src="//24haowan-cdn.shanyougame.com/public/images/web/icon-close.png" class="btn-delete hidden">
								</div>
								<table class="lottery-table">
									<tr>
										<th style="width: 25%;">奖品</th>
										<th style="width: 25%;" class="lottery-giftmoney-common hidden">
											<span>单个金额</span>
											<img src="//24haowan-cdn.shanyougame.com/public/images/web/icon-workbench-info.png" class="giftmoney-price-remind-img">
											<div class="giftmoney-price-remind-text hidden">单个红包金额在1元－200元之间，活动发布后将不可修改。</div>
										</th>
										<th style="width: 50%;" class="prize-num-th">
											<span>数量</span>
											<img src="//24haowan-cdn.shanyougame.com/public/images/web/icon-workbench-info.png" class="giftmoney-num-remind-img hidden">
											<div class="giftmoney-num-remind-text hidden">如果已经充值了红包需要减少红包总额，剩余金额将在活动结束后72h内原路返还到充值账号内。</div>
										</th>
										<th style="width: 25%;">中奖率</th>
									</tr>
									<tr>
										<td><button class="btn btn-g btn-s lotter-prize-btn <?php echo ($game_info["lock_gift"] != "yes") ? "" : "disabled"; ?>" name="">选择奖品</button></td>
										<td class="lottery-giftmoney-common hidden">
											<input type="text" class="input-text" name="input-giftmoney-common" value="">
										</td>
										<td>
											<div class="lottery-num-container">
												<input type="text" class="input-text" name="num">
												<div class="note hidden">已发放数：<span class='sended'>0</span></div>
											</div>
										</td>
										<td>
											<span class="lottery-prize-percent">0</span>
											<span>%</span>
										</td>
									</tr>
								</table>
							</div>
							<?php endif; ?>
						</div>
						<div class="note" style="margin-top:6px;">*活动期间每个用户默认仅有一次抽奖机会。</div>
						<div class="custom-info-bottom">
							<button class="btn btn-g btn-s confirm-btn" name="lottery">确定</button>
							<button class="btn btn-s cancel-btn" name="lottery">取消</button>
						</div>
					</div>
					<div class="custom-info-preview <?php if (!empty($gift_config)) {echo ($gift_config_lottery) ? "" : "hidden";} else {echo "hidden";}; ?>" name='lottery'>
						<table id="custom-info-preview-lottery">
							<?php if ($gift_config_lottery): ?>
							<tr>
								<th style="width:45%;"><?php echo $condition_text; ?></th>
								<th style="width:45%;">总中奖率: <?php echo empty($all_gift_config["lottery"]) ? "" : $all_gift_config["lottery"]["percent"]; ?>%</th>
								<th style="width:10%;"></th>
							</tr>
							<tr>
								<th>奖品名</th>
								<th>中奖率</th>
								<th>数量</th>
							</tr>
							<?php for ($i = 0; $i < count($all_gift_config["lottery"]["prize"]); $i++): ?>
							<?php 
								$gift_name = "";
								$gift_type = "";
								foreach($user_gift_list as $gift) {
									if ($gift["id"] == $all_gift_config["lottery"]["prize"][$i]["gift_id"]) {
										$gift_name = $gift["name"];
										$gift_type = $gift["gift_type"];
									}
								}
								if ($gift_type == 2 || $gift_type == 3) {
									$gift_name .= '（共'.$all_gift_config["lottery"]["prize"][$i]["sum"]."元）";
								}
								$percent = round($all_gift_config["lottery"]["prize"][$i]["num"]/$total_lottery_num*$all_gift_config["lottery"]["percent"], 3);
							?>
							<tr>
								<td><?php echo $gift_name ?></td>
								<td><?php echo $percent; ?>%</td>
								<td><?php echo $all_gift_config["lottery"]["prize"][$i]["num"]; ?></td>
							</tr>
							<?php endfor; ?>
							<?php endif; ?>
						</table>
						<button class="btn custom-info-preview-edit" name="lottery">修改</button>
					</div>
				</div>
				<?php if (($tpl_info['type'] == 1 || $tpl_info['type'] == 3)): ?>
				<?php if (empty($tpl_ext_info_disable) || (!empty($tpl_ext_info_disable["market"]) && !in_array("rank", $tpl_ext_info_disable["market"]))): ?>
				<!-- 按排名获奖 -->
				<?php 
					$gift_config_rank = false;
                    if(!empty($gift_config)) {
                        foreach ($gift_config as $gift_config_item) {
                            if ($gift_config_item["type"] == 1) {
                                $gift_config_rank = true; 
                                break;
                            }
                        }
                    }
				?>
				<div class="custom-info-block <?php echo ($gift_config_rank) ? "" : "empty-info"; ?> <?php echo ($game_info['status'] != "wait" && !$gift_config_rank) ? "hidden" : ""; ?>" id="custom-rank">
					<div class="title">
						<input class="ios-switch ios-switch-anim prize-switch <?php echo ($game_info["lock_gift"] != "yes") ? "" : "disabled"; ?>" type="checkbox" name="rank" <?php echo ($game_info["lock_gift"] != "yes") ? "" : "disabled"; ?> <?php if (!empty($gift_config)) echo ($gift_config_rank) ? "checked" : ""; ?>>
						<img src="//24haowan-cdn.shanyougame.com/public/images/web/icon-market-rank.png" alt="" class="icon">
						<span>按排名获奖</span>
						<span class="note hidden">根据活动结束后的游戏排名获得奖品</span>
					</div>
					<div class="custom-info-detail hidden">
						<button class="btn btn-g btn-s" id="btn-prize-add" style="margin-top: 10px;">添加奖品</button>
						<?php if (!empty($all_gift_config["rank"])): ?>
						<?php for ( $i = 0; $i < count($all_gift_config["rank"]); $i++): ?>
						<?php 
							$gift_name = "";
							$gift_type = "";
							foreach($user_gift_list as $gift) {
								if ($gift["id"] == $all_gift_config["rank"][$i]["gift_id"]) {
									$gift_name = $gift["name"];
									$gift_type = $gift["gift_type"];
									if ($gift_type == 2 || $gift_type == 3) {
										$gift_name = ($all_gift_config["rank"][$i]["sum"]/$all_gift_config["rank"][$i]["num"])."元".$gift_name;
									}
								}
							}
							$sended_rank = 0;
							if (!empty($gift_config)) {
								foreach ($gift_config as $gift_config_index => $gift_config_item) {
									if ($gift_config_item["type"] == 1) {
										$sended_rank = $original_gift[$gift_config_index]["prize"][$i]["num"] - $gift_config_item["prize"][$i]["num"];
									}
								}
							}
						?>
						<div class="custom-prize-block" id="rank-prize-block-<?php echo $i+1; ?>">
							<?php if ($i >= 1 && $game_info["lock_gift"] != "yes"): ?>
							<img src="//24haowan-cdn.shanyougame.com/public/images/dev/icon-close.png" class="modal-close">
							<?php endif; ?>
							<div class="title">奖品<?php echo $numberString[$i]; ?></div>
							<table class="rank-table">
								<tr>
									<th style="width:25%">奖品</th>
									<th style="width: 25%;" class="rank-giftmoney-common hidden">
										<span><?php echo ($gift_type == 3) ? "平均" : "单个"; ?>金额</span>
										<img src="//24haowan-cdn.shanyougame.com/public/images/web/icon-workbench-info.png" class="giftmoney-price-remind-img">
										<div class="giftmoney-price-remind-text hidden">单个红包金额在1元－200元之间，活动发布后将不可修改。</div>
									</th>
									<th style="width:50%;" class="prize-num-th">
										<span>数量</span>
										<img src="//24haowan-cdn.shanyougame.com/public/images/web/icon-workbench-info.png" class="giftmoney-num-remind-img hidden">
										<div class="giftmoney-num-remind-text hidden">如果已经充值了红包需要减少红包总额，剩余金额将在活动结束后72h内原路返还到充值账号内。</div>
									</th>
									<th style="width:25%">排名区间</th>
								</tr>
								<tr>
									<td>
										<button class="btn btn-g btn-s rank-prize-btn <?php echo ($game_info["lock_gift"] != "yes") ? "": "disabled"; ?>" name="<?php echo $all_gift_config["rank"][$i]["gift_id"].'-'.$gift_type; ?>"><?php echo $gift_name; ?></button>
									</td>
									<td style="padding-left:10px;" class="rank-giftmoney-common hidden">
										<input type="text" class="input-text" name="input-giftmoney-common" value="<?php echo ($gift_type == 2 || $gift_type == 3) ? (int)($all_gift_config["rank"][$i]["sum"]/$all_gift_config["rank"][$i]["num"]) : ""; ?>">
									</td>
									<td style="padding-left:10px;">
										<input type="text" class="input-text" name="num" value="<?php echo $all_gift_config["rank"][$i]["num"]; ?>">
										<div class="note <?php echo ($game_info['status'] != 'wait') ? "" : "hidden"; ?>">已发放数：<span class="sended" name="<?php echo $all_gift_config["rank"][$i]["gift_id"]; ?>"><?php echo $sended_rank; ?></span></div>
									</td>
									<td>
										<span name="min" style="display: inline-block;text-align: center;"><?php echo $all_gift_config["rank"][$i]["interval"][0]; ?></span>
										<span style="display: inline-block;width: 20px;text-align: center;">~</span>
										<span name="max" style="display: inline-block;text-align: center;"><?php echo $all_gift_config["rank"][$i]["interval"][1]; ?></span>
									</td>
								</tr>
							</table>
						</div>
						<?php endfor; ?>
						<?php else: ?>
						<div class="custom-prize-block" id="rank-prize-block-1">
							<div class="title">奖品一</div>
							<table class="rank-table">
								<tr>
									<th style="width:25%">奖品</th>
									<th style="width: 25%;" class="rank-giftmoney-common hidden">
										<span>单个金额</span>
										<img src="//24haowan-cdn.shanyougame.com/public/images/web/icon-workbench-info.png" class="giftmoney-price-remind-img">
										<div class="giftmoney-price-remind-text hidden">单个红包金额在1元－200元之间，活动发布后将不可修改。</div>
									</th>
									<th style="width:50%;" class="prize-num-th">
										<span>数量</span>
										<img src="//24haowan-cdn.shanyougame.com/public/images/web/icon-workbench-info.png" class="giftmoney-num-remind-img hidden">
										<div class="giftmoney-num-remind-text hidden">如果已经充值了红包需要减少红包总额，剩余金额将在活动结束后72h内原路返还到充值账号内。</div>
									</th>
									<th style="width:25%">排名区间</th>
								</tr>
								<tr>
									<td>
										<button class="btn btn-g btn-s rank-prize-btn <?php echo ($game_info["lock_gift"] != "yes") ? "" : "disabled"; ?>" name="">选择奖品</button>
									</td>
									<td style="padding-left:10px;" class="rank-giftmoney-common hidden">
										<input type="text" class="input-text" name="input-giftmoney-common" value="">
									</td>
									<td style="padding-left:10px;">
										<input type="text" class="input-text" name="num">
										<div class="note">&nbsp;</div>
									</td>
									<td>
										<span name="min" style="display: inline-block;text-align: center;">1</span>
										<span style="display: inline-block;width: 20px;text-align: center;">~</span>
										<span name="max" style="display: inline-block;text-align: center;"></span>
									</td>
								</tr>
							</table>
						</div>
						<?php endif; ?>
						<div class="custom-info-bottom">
							<button class="btn btn-g btn-s confirm-btn" name="rank">确定</button>
							<button class="btn btn-s cancel-btn" name="rank">取消</button>
						</div>
					</div>
					<div class="custom-info-preview <?php if (!empty($gift_config)) {echo ($gift_config_rank) ? "" : "hidden";} else {echo "hidden";}; ?>" name='rank'>
						<table id="custom-info-preview-rank">
							<tr>
								<th style="width: 45%;">奖品名</th>
								<th style="width: 45%;">排名区间</th>
								<th style="width: 10%;">数量</th>
							</tr>
							<?php if ($gift_config_rank): ?>
							<?php for ($i = 0; $i < count($all_gift_config["rank"]); $i++): ?>
							<?php 
								$gift_name = "";
								$gift_type = "";
								foreach($user_gift_list as $gift) {
									if ($gift["id"] == $all_gift_config["rank"][$i]["gift_id"]) {
										$gift_name = $gift["name"];
										$gift_type = $gift["gift_type"];
									}
								}
								if ($gift_type == 2 || $gift_type == 3) {
									$gift_name .= '（共'.$all_gift_config["rank"][$i]["sum"]."元）";
								}
							?>
							<tr>
								<td><?php echo $gift_name; ?></td>
								<td><?php if ($all_gift_config["rank"][$i]["interval"][0] == $all_gift_config["rank"][$i]["interval"][1]) {echo "第".$all_gift_config["rank"][$i]["interval"][0]."名";} else {echo "第".$all_gift_config["rank"][$i]["interval"][0].'-'.$all_gift_config["rank"][$i]["interval"][1].'名';} ?></td>
								<td><?php echo $all_gift_config["rank"][$i]["num"]; ?></td>
							</tr>
							<?php endfor; ?>
							<?php endif; ?>
						</table>
						<button class="btn custom-info-preview-edit" name="rank">修改</button>
					</div>
				</div>
				<?php endif; ?>
				<?php endif; ?>
				<!-- 报名信息 -->
				<div class="custom-info-block <?php echo empty($platform_config["message"]["msg"]) ? "empty-info" : ""; ?> <?php echo ($game_info['status'] != "wait" && empty($platform_config["message"]["msg"])) ? "hidden" : ""; ?>" id="custom-feedback">
					<div class="title">
						<input class="ios-switch ios-switch-anim prize-switch <?php echo ($game_info["status"] != "wait") ? "disabled" : ""; ?>" type="checkbox" name="feedback"  <?php echo ($game_info["status"] != "wait") ? "disabled" : ""; ?> <?php echo empty($platform_config["message"]["msg"]) ? "" : "checked"; ?>>
						<img src="//24haowan-cdn.shanyougame.com/public/images/web/icon-market-feedback.png" alt="" class="icon">
						<span>报名信息</span>
						<span class="note hidden">收集用户的相关信息</span>
					</div>
					<div class="custom-info-detail hidden">
						<div class="custom-feedback-block">
							<div class="feedback-label">填写时间</div>
							<div class="feedback-time-container">
								<div>
									<input type="radio" name="feedback-time" value="1" <?php echo ($game_info["status"] != "wait") ? "disabled" : ""; ?> <?php if (!empty($default_msg_config)) echo ($default_msg_config["type"] == 1) ? "checked" : ""; ?> <?php echo empty($default_msg_config) ? "checked" : ""; ?>>
									<span>游戏开始前填写</span>
								</div>
								<div>
									<input type="radio" name="feedback-time" value="2"  <?php echo ($game_info["status"] != "wait") ? "disabled" : ""; ?> <?php if (!empty($default_msg_config)) echo ($default_msg_config["type"] == 2) ? "checked" : ""; ?>>
									<span>游戏结束后填写</span>
								</div>
							</div>
							<div class="feedback-label">填写说明</div>
							<textarea rows="5" class="input-textarea input-textarea-l" id="text-feedback-desc" name="multi" style="width: 100%;margin-bottom: 14px;padding:10px;"><?php echo empty($default_msg_config['desc']) ? "为了便于活动的进行，请您填写以下信息，便于我们在您中奖后与您联系。" : $default_msg_config['desc']; ?></textarea>
							<div class="feedback-label">字段清单</div>
							<div class="feedback-add-container">
								<?php if (!empty($default_msg_config)): ?>
								<?php for($i = 0; $i < count($default_msg_config["list"]); $i++): ?>
								<div><span><?php echo $i+1; ?>.</span><button class="btn btn-g btn-s <?php echo ($game_info["status"] != "wait") ? "disabled" : ""; ?>"><?php echo $default_msg_config["list"][$i]; ?></button><img src="//24haowan-cdn.shanyougame.com/public/images/dev/icon-delete.png" class="btn-feedback-delete"></div>
								<?php endfor; ?>
								<?php else: ?>
								<div><span>1.</span><button class="btn btn-g btn-s <?php echo ($game_info["status"] != "wait") ? "disabled" : ""; ?>">姓名</button><img src="//24haowan-cdn.shanyougame.com/public/images/dev/icon-delete.png" class="btn-feedback-delete" style="<?php echo ($game_info["status"] != "wait") ? "display:none" : ""; ?>"></div>
								<div><span>2.</span><button class="btn btn-g btn-s <?php echo ($game_info["status"] != "wait") ? "disabled" : ""; ?>">电话</button><img src="//24haowan-cdn.shanyougame.com/public/images/dev/icon-delete.png" class="btn-feedback-delete" style="<?php echo ($game_info["status"] != "wait") ? "display:none" : ""; ?>"></div>
								<div><span>3.</span><button class="btn btn-g btn-s <?php echo ($game_info["status"] != "wait") ? "disabled" : ""; ?>">QQ</button><img src="//24haowan-cdn.shanyougame.com/public/images/dev/icon-delete.png" class="btn-feedback-delete" style="<?php echo ($game_info["status"] != "wait") ? "display:none" : ""; ?>"></div>
								<?php endif; ?>
							</div>
							<button class="btn btn-y btn-s <?php echo ($game_info["status"] != "wait") ? "disabled" : ""; ?>" id="btn-feedback-add"><span class="glyphicon glyphicon-plus" style="margin-right: 2px;"></span>自定义</button>
						</div>
						<div class="custom-info-bottom">
							<button class="btn btn-g btn-s confirm-btn <?php echo ($game_info["status"] != "wait") ? "disabled" : ""; ?>" name="feedback">确定</button>
							<button class="btn btn-s cancel-btn <?php echo ($game_info["status"] != "wait") ? "disabled" : ""; ?>" name="feedback">取消</button>
						</div>
					</div>
					<div class="custom-info-preview <?php echo empty($platform_config["message"]["msg"]) ? "hidden" : ""; ?>" name='feedback'>
						<div id="custom-info-preview-feedback">
							<?php if($platform_config["message"]["msg"]): ?>
							<div class="preview-label"><?php echo ($platform_config["message"]["msg"]["type"] == 1) ? "游戏开始前填写" : "游戏结束后填写"; ?></div>
							<div>
								<?php for($i = 0; $i < count($platform_config["message"]["msg"]["list"]); $i ++): ?>
								<span><?php echo ($i+1).'、'.$platform_config["message"]["msg"]["list"][$i]; ?></span>
								<?php endfor; ?>
							</div>
							<?php endif; ?>
						</div>
						<button class="btn custom-info-preview-edit" name="feedback">修改</button>
					</div>
				</div>
				<?php endif; ?>
				<!-- 公众号授权 -->
				<div class="custom-info-block" id="custom-auth">
					<div class="title">
						<input class="ios-switch ios-switch-anim prize-switch <?php echo ($game_info["status"] != "wait") ? "disabled" : ""; ?>" type="checkbox" name="auth"  <?php echo ($game_info["status"] != "wait") ? "disabled" : ""; ?>>
						<img src="//24haowan-cdn.shanyougame.com/public/images/web/icon-market-auth.png" alt="" class="icon">
						<span>公众号授权</span>
						<span class="note hidden">授权后，可以更多曝光用户自己的公众号</span>
					</div>
					<div class="custom-info-detail hidden">
						<div class="custom-auth-block">
							<div class="auth-status">授权状态：<span>尚未授权</span>，当前仅支持经过认证的微信服务号。</div>
							<a class="auth-btn" target="_blank">
								<img src="//24haowan-cdn.shanyougame.com/public/images/web/icon-weixin-auth-btn.png">
								<span>微信公众号授权</span>
							</a>
							<div class="auth-remind">注意：在跳转授权完成后，请不要马上关闭页面，等待跳转返回平台后再关闭窗口。</div>
							<div class="auth-desc">
								<div class="desc-title">
									<span>开通授权后将会获得以下功能</span>
									<a href="/help/qaDetail/id/118" target='_blank'>更多详情</a>
								</div>
								<div class="detail">进入游戏登录时，将会展示用户公众号的名称。</div>
								<!-- <div class="detail">用户获得的微信红包，将会通过用户自己的公众号进行发放。</div> -->
								<div class="detail">用户关注公众号后才可领取奖品。（即将开通）</div>
							</div>
						</div>
						<div class="custom-info-bottom">
							<button class="btn btn-g btn-s confirm-btn <?php echo ($game_info["status"] != "wait") ? "disabled" : ""; ?>" name="auth">确定</button>
							<button class="btn btn-s cancel-btn <?php echo ($game_info["status"] != "wait") ? "disabled" : ""; ?>" name="auth">取消</button>
						</div>
					</div>
					<div class="custom-info-preview hidden" name='auth'>
						<div id="custom-info-preview-auth"></div>
						<button class="btn custom-info-preview-edit" name="auth">修改</button>
					</div>
				</div>
			</div>
		</div>
		
		<!-- 编辑奖品 -->
		<div class="modal-prize-add-container" id="modal-prize-add" style="display: none;">
			<!-- 创建奖品 -->
			<div class="modal-prize-add-div">
				<img src="//24haowan-cdn.shanyougame.com/public/images/web/icon-close-gray.png" class="btn-close">
				<div class="title">编辑奖品</div>
				<!-- 奖品类型 -->
				<div class="prize-add-select-container">
					<div class="prize-add-select">
						<input type="radio" name="prize-add-type" value="normal" checked>
						<span>普通奖品</span>
					</div>
					<div class="prize-add-select">
						<input type="radio" name="prize-add-type" value="giftmoney">
						<span>微信红包</span>
					</div>
				</div>
				<!-- 普通奖品 -->
				<div class="prize-add-normal-container">
					<table>
						<tr>
							<th>名称</th>
							<td>
								<input type="text" class="input-text" id="input-prize-add-name" placeholder="请输入奖品名称">
								<button class="btn btn-w" id="btn-prize-add-choose" name="">从模板选择</button>
							</td>
						</tr>
						<tr>
							<th>奖品图片</th>
							<td>
								<div class="custom-pic" name="pic" id="input-prize-add-img">
									<div class="custom-pic-img">
										<div class="custom-pic-div" style="background-image:url('//24haowan-cdn.shanyougame.com/new_platform/image/prize.svg');"  name="pic"></div>
									</div>
								</div>
							</td>
						</tr>
						<tr>
							<th>兑奖方式</th>
							<td>
								<div class="prize-add-dropdown" id="prize-add-dropdown">
									<span name="none" class="prize-add-dropdown-value">无需兑奖</span>
									<span class="glyphicon glyphicon-triangle-bottom"></span>
									<div class="dropdown hidden">
										<span name="none">无需兑奖</span>
										<span name="qrcode">公众号兑奖</span>
										<span name="link">网址兑奖</span>
										<span name="offline">线下兑奖</span>
									</div>
								</div>
								<a href="/help/qaDetail/id/114" target="_blank" class="prize-add-help">如何对奖品进行核销？</a>
							</td>
						</tr>
						<tr class="qrcode hidden">
							<th>公众号</th>
							<td>
								<div class="custom-pic" name="pic" id="input-prize-add-qrcode">
									<div class="custom-pic-img">
										<div class="custom-pic-div" style="background-image:url('//24haowan-cdn.shanyougame.com/game_tpl/activity-qrcode.jpg');"  name="pic"></div>
									</div>
								</div>
							</td>
						</tr>
						<tr class="link hidden">
							<th>兑奖链接</th>
							<td><input type="text" class="input-text" id="input-prize-add-link" value="http://" placeholder="请输入兑奖链接"></td>
						</tr>
						<tr class="offline hidden">
							<th>兑奖地址</th>
							<td><input type="text" class="input-text" id="input-prize-add-address" placeholder="请输入兑奖地址"></td>
						</tr>
						<tr class="offline hidden">
							<th>联系电话</th>
							<td><input type="text" class="input-text" id="input-prize-add-phone" placeholder="请输入联系电话"></td>
						</tr>
						<tr>
							<th>兑奖说明</th>
							<td>
								<textarea class="input-textarea input-textarea-l" id="input-prize-add-desc" rows="3" placeholder="请输入兑奖说明（200字以内）" maxlength="200">活动结束后，我们将会主动与你联系发放活动奖品。</textarea>
							</td>
						</tr>
					</table>
					<div class="prize-add-save-container">
						<input type="checkbox" name="prize-add-save">
						<span>保存到常用奖品库</span>
					</div>
				</div>
				<!-- 微信红包 -->
				<div class="prize-add-giftmoney-container hidden">
					<table>
						<tr>
							<th>红包类型</th>
							<td>
								<div class="prize-add-select-container" style="margin-bottom: 0px;">
									<div class="prize-add-select">
										<input type="radio" name="prize-add-giftmoney-type" value="2" checked>
										<span>普通红包</span>
									</div>
									<div class="prize-add-select">
										<input type="radio" name="prize-add-giftmoney-type" value="3">
										<span>拼手气红包</span>
									</div>
								</div>
							</td>
						</tr>
						<tr>
							<th>红包金额</th>
							<td>
								<input type="text" class="input-text" id="input-prize-add-giftmoney-num" placeholder="1-200元" maxlength="3">
								<span class="note prize-add-giftmoney-remind">固定金额红包，每个红包金额为固定值。</span>
							</td>
						</tr>
					</table>
					<div class="note">微信红包由24好玩公众号或微信官方服务号自动发放，如已开通公众号授权，红包将由用户认证的公众号进行发放。</div>
				</div>
				<!-- 底部按钮 -->
				<div class="bottom">
					<button class="btn btn-g btn-s" id="btn-prize-add-confirm">保存</button>
					<span id="btn-prize-add-cancel">取消</span>
				</div>
			</div>
			<!-- 我的模板 -->
			<div class="modal-prize-self-div" id="modal-prize-list">
				<div class="title">
					<img src="//24haowan-cdn.shanyougame.com/public/images/web/icon-arrow-left.png" class="btn-back">
					<span>从我的模板选择</span>
				</div>
				<table class="datatable">
					<thead>
						<tr>
							<th>奖品图片</th>
							<th>奖品名称</th>
							<th>兑奖方式</th>
						</tr>
					</thead>
					<tbody></tbody>
				</table>
				<div class="prize-toolbar">
					<div class="page-group">
						<span class="glyphicon glyphicon-triangle-left page-prev"></span>
						<span class="page-text"></span>
						<span class="glyphicon glyphicon-triangle-right page-next"></span>
					</div>
				</div>
			</div>
		</div>

		<!-- 营销接口反馈 -->
		<a href="//haowan24.mikecrm.com/f.php?t=bSVP69" target="_blank" class="gameinfo-bottom-feedback">没有你想要的营销接口？告诉我们，马上帮你实现！</a>
	</div>
	<!-- 分享设置 -->
	<div class="custom-container hidden" id="share-container">
		<div class="custom-detail-container">
			<div class="custom-detail">
				<div class="custom-group">
					<div class="title">分享文案设置<img class="title-q" src="//24haowan-cdn.shanyougame.com/public/images/web/icon-questionmark-gray.png">
						<div class="custom-desc hidden">定制活动参与者通过微信分享出去后的文案、图片以及跳转链接。</div>
					</div>
					<div class="detail">
						<table class="custom-share-table">
							<tr>
								<td>分享文案</td>
								<td>
									<?php if (!empty($platform_config["message"]["share"]["union"])): ?>
									<div class="share-union-select">
										<input type="radio" name="share-union" value="yes" <?php echo $platform_config["message"]["share"]["union"] == "yes" ? "checked" : ""; ?>>
										<span>统一文案</span>
									</div>
									<div class="share-union-select">
										<input type="radio" name="share-union" value="no" <?php echo $platform_config["message"]["share"]["union"] == "yes" ? "" : "checked"; ?>>
										<span>根据游戏完成状态区分文案</span>
									</div>
									<?php endif; ?>
								</td>
							</tr>
							<tr>
								<td>默认标题</td>
								<td>
									<input class="input-text input-text-l" id="input-share-title-default" value="<?php echo $platform_config["message"]["share"]["title-default"]; ?>">
								</td>
							</tr>
							<tr>
								<td>默认详情</td>
								<td>
									<input class="input-text input-text-l" id="input-share-desc-default" value="<?php echo $platform_config["message"]["share"]["desc-default"]; ?>">
								</td>
							</tr>
							<tr id="custom-share-complete-title" class="<?php echo empty($platform_config["message"]["share"]["union"]) ? "" : ($platform_config["message"]["share"]["union"] == "yes" ? "hidden" : ""); ?>">
								<td>完成游戏标题</td>
								<td>
									<input class="input-text input-text-l" id="input-share-title" value="<?php echo $platform_config["message"]["share"]["title"]; ?>">
								</td>
							</tr>
							<tr id="custom-share-complete-desc" class="<?php echo empty($platform_config["message"]["share"]["union"]) ? "" : ($platform_config["message"]["share"]["union"] == "yes" ? "hidden" : ""); ?>">
								<td>完成游戏详情</td>
								<td>
									<input class="input-text input-text-l" id="input-share-desc" value="<?php echo $platform_config["message"]["share"]["desc"]; ?>">
									<div class="note" style="font-size:12px;line-height:30px;">*若需要插入<?php echo $replace_str_cn; ?>，请输入<?php echo $replace_str; ?>。</div>
								</td>
							</tr>
							<tr>
								<td>分享小图标</td>
								<td>
									<div class="custom-pic" name="info-share">
										<div class="custom-pic-img">
											<div class="custom-pic-div" style="background-image:url('<?php echo $platform_config["message"]["share"]["pic"]; ?>');"></div>
										</div>
										<div class="custom-pic-size" name="<?php echo empty($platform_config["message"]["share"]["pic-ext-desc"]) ? "" : $platform_config["message"]["share"]["pic-ext-desc"]; ?>">100px*100px</div>
										<div class="custom-pic-name">分享小图片</div>
									</div>
								</td>
							</tr>
							<tr>
								<td colspan="2" class="pic-desc-over-container">
									<div class="pic-desc over"><input type="text" class="input-text"></div>
								</td>
							</tr>
							<?php if (isset($platform_config["message"]["share"]["link"])): ?>
							<tr>
								<td>分享链接</td>
								<td>
									<div class="share-union-select">
										<input type="radio" name="share-link" value="share" <?php echo $platform_config["message"]["share"]["link"] == "share" ? "checked" : ""; ?>>
										<span>分享登录页</span>
									</div>
									<div class="share-union-select">
										<input type="radio" name="share-link" value="custom" <?php echo $platform_config["message"]["share"]["link"] == "share" ? "" : "checked"; ?>>
										<span>自定义链接</span>
									</div>
									<input class="input-text input-text-l <?php echo $platform_config["message"]["share"]["link"] == "share" ? "hidden" : ""; ?>" id="input-share-link" value="<?php echo ($platform_config["message"]["share"]["link"] == "share") ? "http://" : $platform_config["message"]["share"]["link"]; ?>" placeholder="请输入自定义分享链接">
								</td>
							</tr>
							<?php endif; ?>
						</table>
					</div>
				</div>
				<div class="custom-group <?php echo isset($platform_config["message"]["share"]["link"]) ? ($platform_config["message"]["share"]["link"] != "share" ? "hidden" : "") : ""; ?>" id="custom-group-share-setting">
					<div class="title">分享登录页设置</div>
					<div class="detail">
						<table class="custom-share-table">
							<tr>
								<td>登录页图片</td>
								<td class="custom-share-login-container">
									<div class="custom-pic" name="bg" id="pic-background-share-sign-in">
										<div class="custom-pic-img">
											<?php if(strpos($platform_config["style"]["background"]["share-sign-in"], "#") !== 0): ?>
											<div class="custom-pic-div" style="background-image:url('<?php echo $platform_config["style"]["background"]["share-sign-in"];?>');"  name="pic"></div>
											<?php else: ?>
											<div class="custom-pic-div" style="background-color:<?php echo $platform_config["style"]["background"]["share-sign-in"];?>;" name="<?php echo $platform_config["style"]["background"]["share-sign-in"];?>"></div>
											<?php endif; ?>
										</div>
										<div class="custom-pic-size" name="<?php echo empty($platform_config["style"]["background"]["ext-desc"]) ? "" : $platform_config["style"]["background"]["ext-desc"]; ?>">750px*1254px</div>
										<div class="custom-pic-name">分享登录页背景</div>
									</div>
									<?php if ($tpl_info["type"] != 2): ?>
									<div class="custom-pic" name="pic" id="pic-banner-share-sign-in">
										<div class="custom-pic-img">
											<div class="custom-pic-div" style="background-image:url('<?php echo $platform_config["style"]["banner"]["share-sign-in"]; ?>');"></div>
										</div>
										<div class="custom-pic-size" name="<?php echo empty($platform_config["style"]["banner"]["ext-desc"]) ? "" : $platform_config["style"]["banner"]["ext-desc"]; ?>"><?php echo empty($platform_config["style"]["banner"]["size"]) ? "" : $platform_config["style"]["banner"]["size"] ?></div>
										<div class="custom-pic-name">分享登录页横幅</div>
									</div>
									<?php endif; ?>
								</td>
							</tr>
							<tr>
								<td colspan="2" class="pic-desc-over-container">
									<div class="pic-desc over"><input type="text" class="input-text"></div>
								</td>
							</tr>
							<tr>
								<td>登录页文案</td>
								<td>
									<div class="custom-text">
										<div style="margin-bottom:0px;">
											<input class="input-text input-text-l" id="text-game-wechat-text" value="<?php echo $platform_config["text"]["game-wechat-text"]; ?>" name="<?php echo $platform_config["style"]["share-text-color"]; ?>">
											<div class="text-color-remind-container">
												<img src="//24haowan-cdn.shanyougame.com/public/images/web/icon-workbench-A.png">
												<div class="text-color-content">点击可以自定义文字颜色。</div>
											</div>
										</div>
										<div class="note" style="line-height:24px;padding-left: 0px;">*若需要插入<?php echo $replace_str_cn; ?>，请输入<?php echo $replace_str; ?></div>
									</div>
								</td>
							</tr>
						</table>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<!-- 右侧面板 -->
<div class="main-panel" id="main-panel">
	<!-- 模板信息活动配置 -->
	<div class="activity-panel">
		<div class="activity-info-block">
			<div class="activity-info-title">模板信息</div>
			<table>
				<tr>
					<th>模板名称</th>
					<td id="activity-info-tpl-name"><?php echo $tpl_info['name']; ?></td>
				</tr>
				<tr>
					<th>模板版本</th>
					<td id="activity-info-upgrade"><?php echo ($game_info['upgrade'] == 'yes') ? "升级版" : "免费版"; ?></td>
				</tr>
				<tr>
					<th>模板类型</th>
					<?php 
						$activity_info_type = "";
						if ($tpl_info['type'] == 1 || $tpl_info['type'] == 3) {
							$activity_info_type = "分数类";
						} else if ($tpl_info['type'] == 2) {
							$activity_info_type = "抽奖类";
						} else if ($tpl_info['type'] == 4) {
							$activity_info_type = "通关类";
						}
					?>
					<td><?php echo $activity_info_type; ?></td>
				</tr>
			</table>
			<button class="btn btn-g btn-l <?php echo ($game_info['upgrade'] == "yes") ? "hidden" : ""; ?>" id="workbench-upgrade">模板升级</button>
		</div>
		<div class="activity-info-block">
			<div class="activity-info-title">活动配置</div>
			<table>
				<tr>
					<th>活动名称</th>
					<td id="activity-info-name" style="line-height:26px;"><?php echo $game_info['name']; ?></td>
				</tr>
				<tr>
					<th>商户名称</th>
					<td id="activity-info-mname" style="line-height:26px;"><?php echo empty($game_info['m_name']) ? "24好玩" : $game_info['m_name']; ?></td>
				</tr>
				<tr>
					<th>开始时间</th>
					<td id="activity-info-start-time"><?php echo date('Y-m-d H:i', strtotime($game_info['start_time'])); ?></td>
				</tr>
				<tr>
					<th>结束时间</th>
					<td id="activity-info-end-time"><?php echo date('Y-m-d H:i', strtotime($game_info['end_time'])); ?></td>
				</tr>
			</table>
		</div>
	</div>
	<!-- 资源替换定制 -->
	<div class="custom-panel hidden">
		<!-- 标题 -->
		<div class="asset-title-panel">
			<div class="asset-title">背景 - 开始页背景</div>
		</div>
		<!-- 搜索 -->
		<div class="search-panel">
			<input type="text" id="assets-search" placeholder="请输入关键字搜索">
			<img src="//24haowan-cdn.shanyougame.com/public/images/web/icon-close-gray.png" class="search-empty hidden" id="assets-search-empty">
		</div>
		<!-- 导航 -->
		<div class="nav-panel">
			<div class="nav active" name="public">
				<img src="//24haowan-cdn.shanyougame.com/public/images/web/icon-assets-public.png" class="normal">
				<img src="//24haowan-cdn.shanyougame.com/public/images/web/icon-assets-public-white.png" class="active">
				<span>公共</span>
			</div>
			<div class="nav" name="self">
				<img src="//24haowan-cdn.shanyougame.com/public/images/web/icon-assets-pic.png" class="normal">
				<img src="//24haowan-cdn.shanyougame.com/public/images/web/icon-assets-pic-white.png" class="active">
				<span>我的</span>
			</div>
			<div class="nav" name="color">
				<img src="//24haowan-cdn.shanyougame.com/public/images/web/icon-assets-color.png" class="normal">
				<img src="//24haowan-cdn.shanyougame.com/public/images/web/icon-assets-color-white.png" class="active">
				<span>纯色</span>
			</div>
		</div>
		<!-- 分类 -->
		<div class="assets-type-panel">
			<div class="assets-type-btn active" name="el"><span>元素</span></div>
			<div class="assets-type-btn" name="bg"><span>背景</span></div>
			<div class="assets-type-btn" name="prize"><span>奖品</span></div>
		</div>
		<!-- 详细面板 -->
		<div class="assets-panel">
			<!-- 公共 -->
			<div class="assets-panel-detail assets-panel-public">
				<!-- 默认配置 -->
				<div class="divider grid-tpl-divider"><span>默认配置</span></div>
				<div class="grid-tpl">
					<!-- 游戏素材 -->
					<?php foreach ($default_platform_config["game"] as $key => $default_platform_config_game): ?>
					<?php if (strpos($key, "music_") !== 0 && !is_array($default_platform_config_game) && strpos($default_platform_config_game, "#") !== 0): ?>
					<div class="grid-item loading <?php echo $key == "bg" ? "grid-item-bg" : "grid-item-el"; ?>">
						<img src="<?php echo $default_platform_config_game; ?>">
						<img src="//24haowan-cdn.shanyougame.com/public/images/web/icon-assets-info-white.png" class="grid-item-info-btn">
					</div>
					<?php endif; ?>
					<?php endforeach; ?>
					<!-- 可配置元素 -->
					<?php if (!empty($default_platform_config["platform"]["configurable"])): ?>
					<?php foreach ($default_platform_config["platform"]["configurable"] as $default_platform_configurable): ?>
					<?php foreach ($default_platform_configurable["elements"] as $default_platform_configurable_item): ?>
					<div class="grid-item loading grid-item-el">
						<img src="<?php echo $default_platform_configurable_item; ?>">
						<img src="//24haowan-cdn.shanyougame.com/public/images/web/icon-assets-info-white.png" class="grid-item-info-btn">
					</div>
					<?php endforeach; ?>
					<?php endforeach; ?>
					<?php endif; ?>
					<!-- 动画元素 -->
					<?php if (!empty($default_platform_config["platform"]["texture"])): ?>
					<?php foreach ($default_platform_config["platform"]["texture"] as $default_platform_texture): ?>
					<?php foreach ($default_platform_texture as $default_platform_texture_item): ?>
					<div class="grid-item loading grid-item-el">
						<img src="<?php echo $default_platform_texture_item["url"]; ?>">
						<img src="//24haowan-cdn.shanyougame.com/public/images/web/icon-assets-info-white.png" class="grid-item-info-btn">
					</div>
					<?php endforeach; ?>
					<?php endforeach; ?>
					<?php endif; ?>
					<!-- 背景 -->
					<?php if (strpos($default_platform_config["style"]["background"]["start-menu"], "#") !== 0): ?>
					<div class="grid-item loading grid-item-bg">
						<img src="<?php echo $default_platform_config["style"]["background"]["start-menu"]; ?>">
						<img src="//24haowan-cdn.shanyougame.com/public/images/web/icon-assets-info-white.png" class="grid-item-info-btn">
					</div>
					<?php endif; ?>
					<!-- 横幅 -->
					<div class="grid-item loading grid-item-el">
						<img src="<?php echo $default_platform_config["style"]["banner"]["start-menu"]; ?>">
						<img src="//24haowan-cdn.shanyougame.com/public/images/web/icon-assets-info-white.png" class="grid-item-info-btn">
					</div>
					<!-- 分享小图 -->
					<div class="grid-item loading grid-item-el">
						<img src="<?php echo $default_platform_config["message"]["share"]["pic"]; ?>">
						<img src="//24haowan-cdn.shanyougame.com/public/images/web/icon-assets-info-white.png" class="grid-item-info-btn">
					</div>
					<!-- 标题横幅 -->
					<?php if (!empty($platform_config["game-title-img"])): ?>
					<div class="grid-item loading grid-item-el" name="game-title-img">
						<img src="<?php echo $default_platform_config["game-title-img"]; ?>">
						<img src="//24haowan-cdn.shanyougame.com/public/images/web/icon-assets-info-white.png" class="grid-item-info-btn">
					</div>
					<!-- 奖品图片 -->
					<div class="grid-item loading grid-item-prize">
						<img src="//24haowan-cdn.shanyougame.com/new_platform/image/prize.svg">
						<img src="//24haowan-cdn.shanyougame.com/public/images/web/icon-assets-info-white.png" class="grid-item-info-btn">
					</div>
					<?php endif; ?>
				</div>
				<!-- 搜索不到结果 -->
				<div class="grid-public-empty hidden">
					<img src="//24haowan-cdn.shanyougame.com/public/images/web/icon-assets-alert-gray.png">
					<span>啊哦……没有找到相关图片……<br>换个关键词试试看吧~</span>
				</div>
				<div class="grid-public"></div>
			</div>
			<!-- 我的 -->
			<div class="assets-panel-detail assets-panel-self hidden">
				<div class="grid-self"></div>
				<div class="grid-self-empty hidden">
					<img src="//24haowan-cdn.shanyougame.com/public/images/web/icon-assets-alert-gray.png">
					<span>啊哦……你还没有上传图片哦……</span>
				</div>
			</div>
			<!-- 纯色 -->
			<div class="assets-panel-detail assets-panel-color hidden">
				<div id="assets-custom-color-btn">
					<span>+自定义颜色</span>
					<input id="assets-color-kit" value="#FFFFFF" style="display:none">
				</div>
				<div class="assets-color-block" name="#F65C57" style="background: #F65C57"></div>
				<div class="assets-color-block" name="#F9BC36" style="background: #F9BC36"></div>
				<div class="assets-color-block" name="#FDF834" style="background: #FDF834"></div>
				<div class="assets-color-block" name="#9FE058" style="background: #9FE058"></div>
				<div class="assets-color-block" name="#48B505" style="background: #48B505"></div>
				<div class="assets-color-block" name="#4CB1FF" style="background: #4CB1FF"></div>
				<div class="assets-color-block" name="#5A70FF" style="background: #5A70FF"></div>
				<div class="assets-color-block" name="#B360EA" style="background: #B360EA"></div>
			</div>
		</div>
		<!-- 底部按钮组 -->
		<div class="btn-panel">
			<input type="file" id="assets-upload-input" style="display:none;" accept="image/png, image/jpeg" multiple>
			<button class="btn btn-l" id="assets-upload">
				<div id="assets-upload-text">
					<img src="//24haowan-cdn.shanyougame.com/public/images/web/icon-assets-upload.png">
					<span>本地上传</span>
					<img src="//24haowan-cdn.shanyougame.com/public/images/web/icon-assets-upload-warn.png" id="assets-uploading-warn" class="hidden">
					<div id="assets-uploading-ques">
						<img src="//24haowan-cdn.shanyougame.com/public/images/web/icon-workbench-ques.png">
						<div>仅支持PNG/JPG格式，文件大小在1MB以下的图片文件。</div>
					</div>
				</div>
				<div id="assets-uploading-text" class="hidden">
					<span class="filename"></span>
					<span class="filenum"></span>
					<img src="//24haowan-cdn.shanyougame.com/public/images/web/icon-close-white.png" id="assets-uploading-cancel" style="width: 14px;height: 14px;">
				</div>
				<div id="assets-upload-progress"></div>
			</button>
			<button class="btn" id="assets-reset">
				<img src="//24haowan-cdn.shanyougame.com/public/images/web/icon-reset.png" style="width: auto;height: auto;margin-top: -2px;">
				<span>素材复原</span>
			</button>
		</div>
		<!-- 图片详情 -->
		<div class="assets-detail-panel">
			<div class="assets-detail-content">
				<img src="">
				<div class="assets-type">PNG</div>
				<div class="assets-size">300 * 400 PX</div>
				<div class="assets-file-size"></div>
				<a class="btn btn-g btn-l" href="" download>下载素材</a>
			</div>
		</div>
	</div>
	<!-- 文字颜色修改 -->
	<div class="text-panel hidden">
		<div class="text-color-container">
			<div class="text-color-title">
				<img src="//24haowan-cdn.shanyougame.com/public/images/web/icon-workbench-font.png">
				<span>自定义文字颜色</span>
				<span> - </span>
				<span class="name">活动名称</span>
			</div>
			<div class="text-color-block-container">
				<div id="text-color-btn">
					<span>+自定义颜色</span>
					<input id="text-color-kit" value="#FFFFFF" style="display:none">
				</div>
				<div class="text-color-block" name="#FFFFFF" style="color: #FFFFFF">活动名称</div>
				<div class="text-color-block" name="#6C6C6C" style="color: #6C6C6C">活动名称</div>
				<div class="text-color-block" name="#000000" style="color: #000000">活动名称</div>
				<div class="text-color-block" name="#F65C57" style="color: #F65C57">活动名称</div>
				<div class="text-color-block" name="#F9BC36" style="color: #F9BC36">活动名称</div>
				<div class="text-color-block" name="#FDF834" style="color: #FDF834">活动名称</div>
				<div class="text-color-block" name="#48B505" style="color: #48B505">活动名称</div>
				<div class="text-color-block" name="#4CB1FF" style="color: #4CB1FF">活动名称</div>
			</div>
		</div>
	</div>
	<!-- 纯色修改 -->
	<div class="color-panel hidden">
		<div class="color-container">
			<div class="color-title">
				<span>颜色</span>
				<span> - </span>
				<span class="name">活动名称</span>
			</div>
			<div class="color-block-container">
				<div id="color-btn">
					<span>+自定义颜色</span>
					<input id="color-kit" value="#FFFFFF" style="display:none">
				</div>
				<div class="color-block" name="#F65C57" style="background: #F65C57"></div>
				<div class="color-block" name="#F9BC36" style="background: #F9BC36"></div>
				<div class="color-block" name="#FDF834" style="background: #FDF834"></div>
				<div class="color-block" name="#9FE058" style="background: #9FE058"></div>
				<div class="color-block" name="#48B505" style="background: #48B505"></div>
				<div class="color-block" name="#4CB1FF" style="background: #4CB1FF"></div>
				<div class="color-block" name="#5A70FF" style="background: #5A70FF"></div>
				<div class="color-block" name="#B360EA" style="background: #B360EA"></div>
			</div>
		</div>
	</div>
</div>

<!-- 最终发布预览 -->
<div class="modal-container" id="gamepreview" style="background: rgba(0,0,0,0.6);">
	<div class="gamepreview-container">
		<img src="//24haowan-cdn.shanyougame.com/public/images/dev/icon-close.png" class="modal-close">
		<div class="gamepreview-phone">
			<img src="//24haowan-cdn.shanyougame.com/public/images/dev/phone.png" class="preview-mask">
			<iframe src="" class="preview-frame" id="gamepreview-frame"></iframe>
			<!-- <div class="preview-refresh" id="gamepreview-refresh"><span class="glyphicon glyphicon-refresh"></span></div> -->
		</div>
		<div class="gamepreview-qrcode">
			<img src="/webCustom/DownloadQr/game_id/<?php echo $game_info['game_id']; ?>/test/1">
			<div class="title">测试二维码</div>
			<div class="desc">测试二维码仅供体验使用，正式二维码和链接请在游戏发布后在“我的游戏”里点击“查看地址”获取</div>
			<div class="btn-container">
				<button class="btn btn-g btn-l" id="publish-confirm">确认发布</button>
                <a href="javascript:;" id="scene-add">需要将游戏投放到不同的场景?</a>
				<div class="enroll-activity hidden">
                    <input type="checkbox" id="enroll-activity"><span>参与七夕专题活动</span><a target="_blank" href="http://mp.weixin.qq.com/s?__biz=MzIwODI2NTA0Mg==&mid=2651909803&idx=1&sn=866baeae227ac9e250bba68a112625d9#rd">查看详情</a>
                </div>
			</div>
		</div>
	</div>
</div>

<!-- 添加场景 -->
<div class="modal-container" id="modal-scene">
	<div class="scene-container">
		<img src="//24haowan-cdn.shanyougame.com/public/images/dev/icon-close.png" class="modal-close" style="margin-top: -24px;margin-left: -16px;">
		<div class="title">场景设置</div>
		<div class="note">若您的游戏需要投放到多个场景进行推广宣传，设置不同的场景后，可以导出不同的带参数的二维码，在统计数据的时候便于查看从不同场景进入游戏的用户情况。</div>
		<button class="btn btn-g btn-s" id="btn-scene-add">添加场景</button>
		<div class="scene-block-container hidden">
			<button class="btn btn-g btn-l" id="btn-scene-confirm">提交</button>
		</div>
	</div>
</div>

<!-- 发布成功 -->
<div class="modal-container" id="publish-success">
	<div class="publish-container">恭喜~发布成功</br>｡:.ﾟヽ( * ´∀` )ﾉﾟ.:｡</div>
</div>

<!-- 提示框 -->
<div class="remind-container" style="display:none;" id="remind-container">
	<div class="remind-div">
		<img id="remind-loading" src="//24haowan-cdn.shanyougame.com/public/images/dev/icon-loading.png" class="hidden"></img>
		<div id="remind-text"></div>
	</div>
</div>

<!-- 升级付费 -->
<div class="pay-remind-container">
	<!-- 功能说明框 -->
	<div class="modal-remind">
		<div class="top-container">
			<img src="//24haowan-cdn.shanyougame.com/public/images/dev/icon-close.png" id="btn-cancel-upgrade" class="modal-close">
			<div class="title">升级模板</div>
			<div class="desc-container" style="margin-bottom: 30px;">
				<img src="//24haowan-cdn.shanyougame.com/public/images/web/icon-upgrade-desc-bg.png">
				<div class="text-container">
					<div>修改载入页背景</div>
					<div>替换载入页默认背景为自定义图片或纯色背景，由你选择。</div>
				</div>
			</div>
			<div class="desc-container">
				<img src="//24haowan-cdn.shanyougame.com/public/images/web/icon-upgrade-desc-logo.png">
				<div class="text-container">
					<div>修改载入页logo</div>
					<div>替换载入页默认logo为商家的logo，在玩家等待的时候也能见缝插针做宣传。</div>
				</div>
			</div>
			<div class="pay-num">￥ 200元/活动</div>
		</div>
		<div class="bottom-container">
			<a href="/pay/cashier/index/game_id/<?php echo $game_info["game_id"]; ?>" target="_blank"><button class="btn-l btn btn-g" id="btn-confirm-pay">马上升级</button></a>
		</div>
	</div>
	<!-- 等待支付 -->
	<div class="modal-wait">
		<img src="//24haowan-cdn.shanyougame.com/public/images/dev/icon-close.png" class="modal-close" style="margin-top: -24px;margin-right: -38px;">
		<div class="text-container">
			<div>请您在新打开的页面完成支付</div>
			<div>付款完成前请不要关闭此窗口</div>
			<div>完成付款后请根据您的情况点击以下按钮：</div>
		</div>
		<div class="btn-container">
			<button class="btn btn-g btn-l" id="btn-pay-complete">完成支付</button>
			<a href="/pay/cashier/index/game_id/<?php echo $game_info["game_id"]; ?>" target="_blank"><button class="btn btn-l" id="btn-repay">重新支付</button></a>
		</div>
		<div class="contact-container">
			<div>付款遇到问题请添加24好玩H5营销公众号（yx24haowan）联系客服</div>
			<img src="//24haowan-cdn.shanyougame.com/public/images/web/qrcode-contact.png">
		</div>
	</div>
</div>

<!-- 红包充值 -->
<div id="giftmoney-modal">
	<!-- 红包信息 -->
	<div class="giftmoney-modal-content">
		<img src="//24haowan-cdn.shanyougame.com/public/images/dev/icon-close.png" id="giftmoney-close">
		<div class="title">
			<img src="//24haowan-cdn.shanyougame.com/public/images/web/icon-giftmoney-s.png">
			<span>红包充值提醒</span>
		</div>
        <p>您的红包奖品还未完成充值，充值完成后才能发布游戏噢。</p>
        <p>了解有关发票与退款等问题，请<a href="https://www.24haowan.com/help/qaDetail/id/68" target="_blank">点击这里</a>。</p>
		<!-- <div class="giftmoney-remind">游戏里使用到的红包奖品详情如下：</div> -->
		<table id="giftmoney-modal-table"></table>
        <div id="giftmoney-modal-payed-container" class="giftmoney-remind">您已充值红包：<span id="giftmoney-modal-payed">5000</span>元，还需充值：<span id="giftmoney-modal-need">5000</span>元</div>
        <a class="btn btn-l btn-g" href="" target="_blank" id="giftmoney-pay-confirm">确认充值</a>
        
		<!-- <div class="giftmoney-alert">
			<img src="//24haowan-cdn.shanyougame.com/public/images/web/icon-workbench-info.png">
			<span>退款：若充值的红包在活动时间内未发放完毕，剩余金额将在活动结束后72h内原路返还到充值账号内。</span>
            <p>发票：红包为代发放，不可开具发票。如需提供流水对账，可在统计后台导出或与客服联系。</p>
		</div> -->
	</div>
	<!-- 等待支付 -->
	<div class="modal-wait">
		<img src="//24haowan-cdn.shanyougame.com/public/images/dev/icon-close.png" class="modal-close" style="margin-top: -24px;margin-right: -38px;">
		<div class="text-container">
			<div>请您在新打开的页面完成支付</div>
			<div>付款完成前请不要关闭此窗口</div>
			<div>完成付款后请根据您的情况点击以下按钮：</div>
		</div>
		<div class="btn-container">
			<button class="btn btn-g btn-l" id="btn-pay-giftmoney-complete">完成支付</button>
			<a href="" target="_blank" id="btn-pay-giftmoney-repay"><button class="btn btn-l" id="btn-repay">重新支付</button></a>
		</div>
		<div class="contact-container">
			<div>付款遇到问题请添加24好玩H5营销公众号（yx24haowan）联系客服</div>
			<img src="//24haowan-cdn.shanyougame.com/public/images/web/qrcode-contact.png">
		</div>
	</div>
</div>

<!-- 发布失败提示框 -->
<div id="publish-failed-container">
	<div class="publish-failed-content">
		<img src="//24haowan-cdn.shanyougame.com/public/images/dev/icon-close.png" id="publish-failed-close">
		<div class="title">
			<img src="//24haowan-cdn.shanyougame.com/public/images/web/icon-workbench-info.png">
			<span>啊哦……发布失败……</span>
		</div>
		<div class="remind-text">请稍后再试试吧~或者您可以联系我们的客服求助~</div>
		<img src="//24haowan-cdn.shanyougame.com/public/images/web/qrcode-contact.png" class="qrcode">
		<div class="contact-text">扫一扫添加客服微信，联系客服（微信号：hellomiao12345）<br>或者拨打客服电话：18922151868</div>
	</div>
</div>

<!-- 需要补全商户信息提示框 -->
<div id="mname-remind-container">
	<div class="mname-remind-content">
		<div class="title">
			<img src="//24haowan-cdn.shanyougame.com/public/images/web/icon-workbench-info.png">
			<span>抱歉！由于平台升级，您要先补充商户名称信息才能进行下一步修改操作哦~</span>
		</div>
		<img src="//24haowan-cdn.shanyougame.com/public/images/web/pic-mname-remind.png" class="pic">
		<button class="btn btn-l btn-g" id="mname-remind-btn">我知道了</button>
	</div>
</div>

<!-- 上传文件失败提示 -->
<div id="upload-error-modal">
	<div class="content">
		<div class="title">
			<img src="//24haowan-cdn.shanyougame.com/public/images/web/icon-assets-alert-white.png">
			<span></span>
		</div>
		<table></table>
		<button class="btn btn-g btn-s" id="upload-error-modal-btn">我知道了</button>
	</div>
</div>

<!-- 公众号授权提示 -->
<div class="auth-modal" id="auth-modal">
	<div class="auth-cnt">
		<img src="//24haowan-cdn.shanyougame.com/public/images/web/icon-close-gray.png" class="btn-close">
		<div class="top">
			<div>请在新打开的页面完成微信公众号授权</div>
			<div>授权完成前请不要关闭本窗口</div>
			<div>完成授权后，请根据您的情况点击以下按钮</div>
		</div>
		<div class="bottom">
			<div class="btn-container">
				<button class="btn btn-g btn-l" id="btn-auth-complete">完成认证</button>
				<a href="" target="_blank"><button class="btn btn-l" id="btn-auth-again">重新发起认证</button></a>
			</div>
			<div>遇到问题，请点击<a href="/web/contact" target="_blank">这里</a>。</div>
		</div>
	</div>
</div>

<!-- 公众号授权异常 -->
<div class="auth-error-modal" id="auth-error-modal">
	<div class="auth-error-cnt">
		<div class="title">微信公众号授权异常</div>
		<div class="content">
			<div class="text-remind">检测到活动绑定的公众号<span class="auth-error-nickname">24好玩</span>已取消授权，为了避免用户信息的异常，当前活动已停止访问，请尽快重新授权。</div>	
			<div class="mp-container">
				<img src="" alt="" id="auth-error-img">
				<span class="auth-error-nickname">24好玩</span>
			</div>
			<div class="btn-container">
				<a href="" class="btn btn-g btn-s disabled" id="auth-error-btn">去授权</a>
				<span id="auth-error-cancel">取消</span>
			</div>
		</div>
	</div>
</div>

<!-- 验证身份 - 补充电话信息 -->
<div class="mobile-add-modal" id="mobile-add-modal">
	<div class="mobile-add-cnt">
		<img id="btn-mobile-add-close" src="//24haowan-cdn.shanyougame.com/public/images/web/icon-close-gray.png">
		<div class="title">验证身份</div>
		<div class="content">
			<div class="text-remind">为了更好的为您服务，请在活动发布前补充您的手机号信息。</div>	
			<div class="mobile-add-container">
				<input type="text" class="input-text" placeholder="请输入手机号" maxlength="11" id="input-mobile-add-phone">
				<div class="code-container">
					<input type="text" class="input-text" id="input-mobile-add-code" placeholder="请输入验证码">
					<button class="btn btn-g" id="btn-mobile-add-code">获取验证码</button>
				</div>
				<button class="btn btn-g" id="btn-mobile-add-confirm">完成验证</button>
			</div>
		</div>
	</div>
</div>

<script type="text/javascript">
var workbench_admin = false;
var game_id = "<?php echo $game_info['game_id']; ?>"; // 游戏ID
var game_name = "<?php echo $game_info['name']; ?>"; // 游戏名称
var m_name = "<?php echo $game_info['m_name']; ?>"; // 商户名称
var game_describe = "<?php echo $game_info['describe']; ?>"; // 游戏描述
var start_time = "<?php echo $game_info['start_time']; ?>"; // 游戏开始时间
var end_time = "<?php echo $game_info['end_time']; ?>"; // 游戏结束时间
var game_status = "<?php echo $game_info['status']; ?>"; // 游戏状态
var limit_times = "<?php echo $game_info['limit_times']; ?>"; // 游戏限制次数
var upgrade = "<?php echo $game_info['upgrade']; ?>"; // 是否升级（yes/no）
var giftcenter_link = "<?php echo $game_info['prize_url']; ?>"; // 兑奖链接
var draft = "<?php echo $game_info['draft']; ?>"; // 是否为草稿
var game_type = <?php echo $tpl_info["type"]; ?>; // 模板类型
var limit_player = "<?php echo $game_info['limit_player']; ?>"; // 访问模式（yes/no）
var game_section = <?php echo empty($tpl_info["section"]) ? 1 : $tpl_info["section"]; ?>; // 模板关卡数
var contact_phone = "<?php echo $contact_phone; ?>"; // 是否已补充手机号
var tpl_id = "<?php echo $tpl_info['tpl_id']; ?>"; // 模板ID

var tpl_ext_info = JSON.parse('<?php echo empty($tpl_info['ext_info']) ? '{}' : $tpl_info['ext_info']; ?>');

var user_pic_list = JSON.parse('<?php echo preg_replace("/\'/", "#", $user_img_list); ?>'); // 用户图片列表
var user_gift_list = <?php echo empty($user_gift_list) ? "[]" : CJSON::encode($user_gift_list); ?>; // 用户奖品列表

var totalPrize = 0; // 用户可用奖品数量
var lock_gift = <?php echo ($game_info['lock_gift'] == "yes") ? "true" : "false"; ?>; // 用户是否可以修改奖品

var scene = "<?php echo $game_info['scene']; ?>"; // 游戏场景
var default_platform_config = <?php echo empty($default_platform_config) ? "" : CJSON::encode($default_platform_config); ?>; // 默认游戏配置
var platform_config = <?php echo empty($platform_config) ? "" : CJSON::encode($platform_config); ?>; // 定制游戏配置

var all_gift_config = JSON.parse('<?php echo empty($game_info["all_gift_config"]) ? "{}" : $game_info["all_gift_config"]; ?>'); // 所有的奖品配置
var gift_config = JSON.parse('<?php echo empty($game_info["gift_config"]) ? "[]" : $game_info["gift_config"]; ?>'); // 当前使用的奖品配置
var original_gift_config = JSON.parse('<?php echo empty($game_info["original_gift"]) ? "[]" : $game_info["original_gift"]; ?>'); // 上线时确定的奖品配置
var left_gift_config = gift_config; // 剩余奖品的配置
gift_config = original_gift_config; // 未发布钱奖品的配置

var default_msg_config = JSON.parse('<?php echo empty($game_info["default_msg_config"]) ? "{}" : $game_info["default_msg_config"]; ?>'); // 默认信息配置
var giftmoney_config = {total_num: 0, left_num: 0, pay_num: 0}; // 红包配置
</script>