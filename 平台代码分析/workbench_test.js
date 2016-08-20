/* 测试定制 */
var TestCustom = function() {
	this.initSelectHtml(false);
	this.bindEvents();
	this.checkTestLogic();
    $("#custom-share-complete-desc > td > .note").hide();
    $("#custom-group-share-setting .note").hide();
};
TestCustom.prototype = {
	answer_no: ["A", "B", "C", "D"],
	question_select_html: "",
	result_select_html: "",
	logic: [],
	error_logic: [],
	error_remind_tag: true,

	// 初始化选项
	initSelectHtml: function(update, edit) {
		var self = this;
		this.question_select_html = "";
		var index = 1;
		$(".custom-question-block").each(function() {
			var text = $(this).find(".question .text").html();
			self.question_select_html += "<span name='"+index+"'>"+index+"."+text+"</span>";
			index++;
		});
		index = 1;
		this.result_select_html = "";
		$(".custom-result-block").each(function() {
			var text = $(this).find(".result-title .text").html();
			self.result_select_html += "<span name='"+index+"'>"+index+"."+text+"</span>";
			index++;
		});

		// 需要更新
		if (update) {
			// 重新布置html
			$(".test-answer-select .question-dropdown[name='next-type']").each(function() {
				var type = $(this).find(".question-dropdown-value").attr("name");
				if (type == "result") {
					$(this).next().find(".dropdown").html(self.result_select_html);
				} else {
					$(this).next().find(".dropdown").html(self.question_select_html);
				}
			});
			// 绑定选项点击事件
			$(".test-answer-select .question-dropdown[name='next-detail'] .dropdown span").on("click", function(e) {
				var value = $(this).attr("name");
				var text = $(this).text();
				var container = $(this).parent().parent();
				// 设置值
				$(container).find(".question-dropdown-value").text(text).attr("name", value);
				// 折叠
				self.toggleDropDown(container);
				// 保存
				self.setData();
				e.stopPropagation();
			});
			if (edit) {
				$(".test-answer-select .question-dropdown[name='next-detail'] .question-dropdown-value").each(function() {
					var value = $(this).attr("name");
					var text;
					$(this).parent().find(".dropdown span").each(function() {
						var _value = $(this).attr("name");;
						var _text = $(this).text();
						if (_value == value) {
							text = _text;
							return false;
						}
					});
					$(this).text(text);
				});
			} else {
				// 判断是否有已经被删除的
				$(".test-answer-select .question-dropdown[name='next-detail'] .question-dropdown-value").each(function() {
					var value = $(this).attr("name");
					var text = $(this).text();
					var enable = false;
					$(this).parent().find(".dropdown span").each(function() {
						var _value = $(this).attr("name");;
						var _text = $(this).text();
						if (_value == value && _text == text) {
							enable = true;
							return false;
						}
					});
					if (!enable) { // 选中的已经被删掉
						var first_obj = $(this).parent().find(".dropdown span").first();
						$(this).attr("name", $(first_obj).attr("name"));
						$(this).text($(first_obj).text());
					}
				});
			}
		}
	},
	// 绑定事件
	bindEvents: function() {
		var self = this;

		// 跳转
		$("body").on("click", function() {
			$(".test-answer-select .question-dropdown .dropdown").addClass("hidden");
			$(".test-answer-select .question-dropdown .glyphicon").removeClass("glyphicon-triangle-top").addClass("glyphicon-triangle-bottom");
		});

		// 问题编辑按钮
		$(".custom-question-block .btn-edit").on("click", function() {
			self.editQuestion($(this).parents(".custom-question-block"), "edit");
		});
		// 问题编辑 确定按钮
		$("#btn-test-question-edit-confirm").on("click", function() {
			self.confirmEditQuestion($(this).attr("name"));
		});
		// 问题编辑 取消按钮
		$("#btn-test-question-edit-cancel").on("click", function() {
			self.cancelEditQuestion($(this).attr("name"));
		});
		// 问题删除按钮
		$(".custom-question-block .btn-delete").on("click", function() {
			self.deleteQuestion($(this).parents(".custom-question-block"));
		});
		// 问题添加按钮
		$("#btn-test-question-add").on("click", function() {
			self.addQuestion();
		});

		// 结果编辑按钮
		$(".custom-result-block .btn-edit").on("click", function() {
			self.editResult($(this).parents(".custom-result-block"), "edit");
		});
		// 结果编辑 确定按钮
		$("#btn-test-result-edit-confirm").on("click", function() {
			self.confirmEditResult($(this).attr("name"));
		});
		// 结果编辑 取消按钮
		$("#btn-test-result-edit-cancel").on("click", function() {
			self.cancelEditResult($(this).attr("name"));
		});
		// 结果删除按钮
		$(".custom-result-block .btn-delete").on("click", function() {
			self.deleteResult($(this).parents(".custom-result-block"));
		});
		// 结果添加按钮
		$("#btn-test-result-add").on("click", function() {
			self.addResult();
		});

		// 问题图片删除按钮
		$(".question-img-delelte").on("click", function() {
			$("#pic-test-question-img .custom-pic-div").css("background-image", "url(/images/web/pic-empty.png)");
			$(".question-img-delelte").css("visibility", "hidden");
		});
		// 添加答案按钮
		$("#btn-test-answer-add").on("click", function() {
			$(".a-block-container .answer-block.hidden").first().removeClass("hidden");
			$("#question-test-add-dropdown .dropdown span.hidden").first().removeClass("hidden");
			self.resortAnswer();
			if ($(".a-block-container .answer-block.hidden").length <= 0) {
				$("#btn-test-answer-add").addClass("hidden");
			}
			$(".btn-question-edit-delete").css("visibility", "visible")
		});
		// 删除答案按钮
		$(".btn-question-edit-delete").on("click", function() {
			$(this).parent().find("input").val("");
			$(this).parent().addClass("hidden");
			if ($("#question-add-dropdown .dropdown span.hidden").length > 0) {
				$("#question-add-dropdown .dropdown span.hidden").first().prev().addClass("hidden");
			} else {
				$("#question-add-dropdown .dropdown span").last().addClass("hidden");
			}
			self.resortAnswer();
			if ($(".a-block-container .answer-block.hidden").length >= 2) {
				$(".btn-question-edit-delete").css("visibility", "hidden");
			}
			$("#btn-test-answer-add").removeClass("hidden");
		});

		// 跳转类型
		$(".test-answer-select .question-dropdown[name='next-type']").on("click", function(e) {
			if (!$(this).hasClass("disabled")) {
				$(".test-answer-select .question-dropdown .dropdown").addClass("hidden");
				$(".test-answer-select .question-dropdown .glyphicon").removeClass("glyphicon-triangle-top").addClass("glyphicon-triangle-bottom");
				self.toggleDropDown(this);
			}
			e.stopPropagation();
		});
		$(".test-answer-select .question-dropdown[name='next-type'] .dropdown span").on("click", function(e) {
			var value = $(this).attr("name");
			var text = $(this).text();
			var container = $(this).parent().parent();
			if ($(container).find(".question-dropdown-value").attr("name") != "value") {
				self.switchNextType(container, value);
				// 设置值
				$(container).find(".question-dropdown-value").text(text).attr("name", value);
				// 保存
				self.setData();
			} else {
				// 设置值
				$(container).find(".question-dropdown-value").text(text).attr("name", value);
			}
			
			// 折叠
			self.toggleDropDown(container);
			e.stopPropagation();
		});

		// 跳转详情
		$(".test-answer-select .question-dropdown[name='next-detail']").on("click", function(e) {
			if (!$(this).hasClass("disabled")) {
				$(".test-answer-select .question-dropdown .dropdown").addClass("hidden");
				$(".test-answer-select .question-dropdown .glyphicon").removeClass("glyphicon-triangle-top").addClass("glyphicon-triangle-bottom");
				self.toggleDropDown(this);
			}
			e.stopPropagation();
		});
		$(".test-answer-select .question-dropdown[name='next-detail'] .dropdown span").on("click", function(e) {
			var value = $(this).attr("name");
			var text = $(this).text();
			var container = $(this).parent().parent();
			// 设置值
			$(container).find(".question-dropdown-value").text(text).attr("name", value);
			// 折叠
			self.toggleDropDown(container);
			// 保存
			self.setData();
			e.stopPropagation();
		});
	},
	// 删除结果
	deleteResult: function(block_obj) {
		if ($(".custom-result-block").length > 1) {
			// 删除结果
			$(block_obj).remove();
			// 重新排序
			this.resortResult();
			// 重新初始化选项
			this.initSelectHtml(true);
			// 设置数据
			this.setData();
			// 如果只剩下一个问题，则不能再删除
			if ($(".custom-result-block").length <= 1) $(".custom-result-block .btn-delete").addClass("disabled");
		}
	},
	// 添加结果
	addResult: function() {
		if ($(".custom-result-block").length < 20) {
			// 增加DOM
			$(".custom-result").append("<div class='custom-result-block editing'></div>");
			// 进入编辑状态
			var block_obj = $(".custom-result .custom-result-block").last();
			this.editResult(block_obj, "add");
		}
	},
	// 编辑结果
	editResult: function(block_obj, type) {
		$(block_obj).addClass("editing");
		// 隐藏原本内容
		$(block_obj).children().addClass("hidden");
		// 置入编辑容器
		$(block_obj).append($("#custom-test-result-edit-container"));
		$("#custom-test-result-edit-container").removeClass("hidden");
		// 隐藏添加结果按钮
		$("#btn-test-result-add").addClass("hidden");
		// 禁止编辑或删除其他结果
		$(".custom-result-block .btn-container img").addClass("disabled");
		// 不同状态
		if (type == "add") {
			this.resetEditResultData();
			$("#btn-test-result-edit-confirm").text("创建结果");
		} else if (type == "edit") {
			this.setEditResultData(block_obj);
			$("#btn-test-result-edit-confirm").text("确认修改");
		}
		$("#btn-test-result-edit-confirm").attr("name", type);
		$("#btn-test-result-edit-cancel").attr("name", type);
	},
	// 取消编辑结果
	cancelEditResult: function(type) {
		var block_obj = $("#custom-test-result-edit-container").parent();
		// 可以编辑或删除其他问题
		$(".custom-result-block .btn-container img").removeClass("disabled");
		// 如果问题少于20个，则显示添加问题按钮
		if ($(".custom-result-block").length < 20) $("#btn-test-result-add").removeClass("hidden");
		// 将编辑容器移除
		$("#custom-test-result-edit-container").addClass("hidden");
		$("#btn-test-result-add").after($("#custom-test-result-edit-container"));
		// 显示原本内容
		if (type == "add") {
			$(block_obj).remove();
		} else if (type == "edit") {
			$(block_obj).children().removeClass("hidden");
		}
		$(block_obj).removeClass("editing");
	},
	// 确认编辑问题
	confirmEditResult: function(type) {
		if (this.checkResult()) {
			var block_obj = $("#custom-test-result-edit-container").parent();
			// 将编辑容器移除
			$("#custom-test-result-edit-container").addClass("hidden");
			$("#btn-test-result-add").after($("#custom-test-result-edit-container"));
			// 更改内容
			this.changeResult(block_obj, type);
			// 重新初始化选项
			this.initSelectHtml(true, (type == "add" ? false: true));
			// 可以编辑或删除其他问题
			$(".custom-result-block .btn-container img").removeClass("disabled");
			// 如果问题少于20个，则显示添加问题按钮
			if ($(".custom-result-block").length < 20) $("#btn-test-result-add").removeClass("hidden");
			// 重新排序
			this.resortResult();
			// 保存
			$(block_obj).removeClass("editing");
			this.setData();
		}
	},
	// 检查问题内容
	checkResult: function() {
		var title = $("#input-test-result-edit-title").val();
		var detail = $("#input-test-result-edit-detail").val();
		if (title.length == 0) {
			showRemind("结果标题不能为空");
			$("#input-test-result-edit-title").focus();
			return false;
		} else if (title.length > 15) {
			showRemind("结果标题限制为15个字");
			$("#input-test-result-edit-title").focus();
			return false;
		} else if (detail.length == 0) {
			showRemind("结果详情不能为空");
			$("#input-test-result-edit-detail").focus();
			return false;
		} else if (detail.length > 50) {
			showRemind("结果详情限制为50个字");
			$("#input-test-result-edit-detail").focus();
			return false;
		}
		return true;
	},
	// 创建问题内容
	createResult: function(data) {
		var title = data.title;
		var detail = data.detail;
		var html = "<div class='result-title'><div class='no'>1.</div><div class='text'>"+title+"</div>";
		html += "<div class='btn-container'><img src='/images/web/icon-pencil.png' alt='' class='btn-edit'><img src='/images/web/icon-trash.png' alt='' class='btn-delete'></div>";
		html += "</div><div class='result-detail'>"+detail+"</div>";
		return html;
	},
	// 更改问题内容
	changeResult: function(block_obj, type) {
		var self = this;
		var data = {};
		data.title = $("#input-test-result-edit-title").val();
		data.detail = $("#input-test-result-edit-detail").val();
		// 填充
		$(block_obj).html(this.createResult(data));
		// 问题编辑按钮
		$(block_obj).find(".btn-edit").on("click", function() {
			self.editResult($(this).parents(".custom-result-block"), "edit");
		});
		// 问题删除按钮
		$(block_obj).find(".btn-delete").on("click", function() {
			self.deleteResult($(this).parents(".custom-result-block"));
		});
	},
	// 设置编辑的数据（编辑）
	setEditResultData: function(block_obj) {
		// 获取数据
		var title = $(block_obj).find(".result-title .text").text();
		var detail = $(block_obj).find(".result-detail").html();
		// 填充
		$("#input-test-result-edit-title").val(title);
		$("#input-test-result-edit-detail").val(detail);
	},
	// 重置编辑的数据(新增)
	resetEditResultData: function() {
		$("#input-test-result-edit-title").val("");
		$("#input-test-result-edit-detail").val("");
	},
	// 重新排序 结果
	resortResult: function() {
		var index = 1;
		$(".custom-result-block .result-title .no").each(function() {
			$(this).text(index++ +".");
		});
	},

	// 展开/折叠
	toggleDropDown: function(obj) {
		if ($(obj).find(".dropdown").hasClass("hidden")) {
			$(obj).find(".dropdown").removeClass("hidden");
			$(obj).find(".glyphicon").removeClass("glyphicon-triangle-bottom").addClass("glyphicon-triangle-top");
		} else {
			$(obj).find(".dropdown").addClass("hidden");
			$(obj).find(".glyphicon").removeClass("glyphicon-triangle-top").addClass("glyphicon-triangle-bottom");
		}
	},
	// 切换状态
	switchNextType: function(obj, type) {
		var self = this;
		$(obj).next().find(".dropdown").html((type == "result" ? this.result_select_html : this.question_select_html));
		$(obj).next().find(".dropdown span").on("click", function(e) {
			var value = $(this).attr("name");
			var text = $(this).text();
			var container = $(this).parent().parent();
			// 设置值
			$(container).find(".question-dropdown-value").text(text).attr("name", value);
			// 折叠
			self.toggleDropDown(container);
			// 保存
			self.setData();
			e.stopPropagation();
		});
		var value = $(obj).next().find(".dropdown span").first().attr("name");
		var text = $(obj).next().find(".dropdown span").first().text();
		$(obj).next().find(".question-dropdown-value").text(text).attr("name", value);
	},
	// 删除问题
	deleteQuestion: function(block_obj) {
		if ($(".custom-question-block").length > 1) {
			// 删除问题
			$(block_obj).remove();
			// 重新排序
			this.resortQuestion();
			// 重新初始化选项
			this.initSelectHtml(true);
			// 设置数据
			this.setData();
			// 如果只剩下一个问题，则不能再删除
			if ($(".custom-question-block").length <= 1) $(".custom-question-block .btn-delete").addClass("disabled");
		}
	},
	// 添加问题
	addQuestion: function() {
		if ($(".custom-question-block").length < 20) {
			// 增加DOM
			$(".custom-question").append("<div class='custom-question-block editing'></div>");
			// 进入编辑状态
			var block_obj = $(".custom-question .custom-question-block").last();
			this.editQuestion(block_obj, "add");
		}
	},
	// 编辑问题
	editQuestion: function(block_obj, type) {
		$(block_obj).addClass("editing");
		// 隐藏原本内容
		$(block_obj).children().addClass("hidden");
		// 置入编辑容器
		$(block_obj).append($("#custom-test-question-edit-container"));
		$("#custom-test-question-edit-container").removeClass("hidden");
		// 隐藏添加问题按钮
		$("#btn-test-question-add").addClass("hidden");
		// 禁止编辑或删除其他问题
		$(".custom-question-block .btn-container img").addClass("disabled");
		// 不同状态
		if (type == "add") {
			this.resetEditData();
			$("#btn-test-question-edit-confirm").text("创建问题");
			$(".question-img-delelte").css("visibility", "hidden");
		} else if (type == "edit") {
			this.setEditData(block_obj);
			$("#btn-test-question-edit-confirm").text("确认修改");
		}
		$("#btn-test-question-edit-confirm").attr("name", type);
		$("#btn-test-question-edit-cancel").attr("name", type);
	},
	// 确认编辑问题
	confirmEditQuestion: function(type) {
		if (this.checkQuestion()) {
			var block_obj = $("#custom-test-question-edit-container").parent();
			// 将编辑容器移除
			$("#custom-test-question-edit-container").addClass("hidden");
			$("#btn-test-question-add").after($("#custom-test-question-edit-container"));
			// 更改内容
			this.changeQuestion(block_obj, type);
			// 重新初始化选项
			this.initSelectHtml(true, (type == "add" ? false: true));
			// 可以编辑或删除其他问题
			$(".custom-question-block .btn-container img").removeClass("disabled");
			// 如果问题少于20个，则显示添加问题按钮
			if ($(".custom-question-block").length < 20) $("#btn-test-question-add").removeClass("hidden");
			// 重新排序
			this.resortQuestion();
			// 保存
			$(block_obj).removeClass("editing");
			this.setData();
		}
	},
	// 检查问题内容
	checkQuestion: function() {
		var question = $("#input-test-question-edit-q").val();
		if (question.length == 0) {
			showRemind("问题不能为空");
			$("#input-test-question-edit-q").focus();
			return false;
		} else if (question.length > 50) {
			showRemind("问题限制为50个字");
			$("#input-test-question-edit-q").focus();
			return false;
		}
		var answer_tag = true;
		$(".a-block-container .answer-block").each(function() {
			if (!$(this).hasClass("hidden")) {
				var answer = $(this).find("input[name='input-test-question-edit-a']").val();
				if (answer.length == 0) {
					showRemind("选项不能为空");
					$(this).find("input[name='input-test-question-edit-a']").focus();
					answer_tag = false;
					return false;
				} else if (answer.length > 15) {
					showRemind("选项限制为15个字");
					$(this).find("input[name='input-test-question-edit-a']").focus();
					answer_tag = false;
					return false;
				}
			}
		});
		return answer_tag;
	},
	// 创建问题内容
	createQuestion: function(data) {
		var question = data.question;
		var right = data.right;
		var answers = data.answers;
		var answers_data = data.answers_data;
		var img = data.img;
		var html = "<div class='question'><div class='no'>1.</div><div class='text'>"+question+"</div><div class='btn-container'><img src='/images/web/icon-pencil.png' alt='' class='btn-edit'><img src='/images/web/icon-trash.png' alt='' class='btn-delete'></div></div>";
		html += "<div class='answer-container'><div class='custom-pic' style='pointer-events: none;'><div class='custom-pic-img'><div class='custom-pic-div' style='background-image:url("+img+")'></div></div><div class='custom-pic-size' name=''></div></div>";
		html += "<div class='answer test-answer'>";
		for (var i in answers) {
			html += "<div class='answer-block'><span class='no'>"+this.answer_no[i]+".</span><span class='text'>"+answers[i]+"</span></div>";
			html += "<div class='test-answer-select'>";
			html += "<div>跳转至</div>";
			html += "<div class='question-dropdown' name='next-type'><span name='"+answers_data[i]["next-type"]+"' class='question-dropdown-value'>"+(answers_data[i]["next-type"] == "result" ? "结果" : "问题")+"</span><span class='glyphicon glyphicon-triangle-bottom'></span><div class='dropdown hidden'><span name='question'>问题</span><span name='result'>结果</span></div></div>";
			html += "<div class='question-dropdown' name='next-detail'><span name='"+answers_data[i]["next-detail"]+"' class='question-dropdown-value'>"+answers_data[i]["next-detail-text"]+"</span><span class='glyphicon glyphicon-triangle-bottom'></span><div class='dropdown hidden'>"+(answers_data[i]["next-type"] == "result" ? this.result_select_html : this.question_select_html)+"</div></div>";
			html += "</div>";
		}
		html += "</div></div>";
		return html;
	},
	// 更改问题内容
	changeQuestion: function(block_obj, type) {
		var self = this;
		var data = {};
		data.question = $("#input-test-question-edit-q").val();
		data.answers = [];
		data.answers_data = [];
		var answer_index = $(block_obj).index();
		var answer_data_index = 0;
		$(".a-block-container .answer-block").each(function() {
			if (!$(this).hasClass("hidden")) {
				var answer = $(this).find("input[name='input-test-question-edit-a']").val();
				data.answers.push(answer);

				var answer_initial = (type == "add") ? "" : platform_config["game"]["questions"][answer_index]["answer"][answer_data_index];
				if (answer_initial) {
					var next_type = (answer_initial["jump"] ? "question" : "result");
					var next_detail = next_type == "question" ? answer_initial["jump"] : answer_initial["result"];
					var next_detail_text = (answer_index+1)+"."+(next_type == "question" ? platform_config["game"]["questions"][next_detail-1]["question"] : platform_config["game"]["results"][next_detail-1]["title"]);
				} else {
					var next_type = "result";
					var next_detail = "1";
					var next_detail_text = "1."+platform_config["game"]["results"][0]["title"];
				}
				data.answers_data.push({
					"next-type": next_type,
					"next-detail": next_detail,
					"next-detail-text": next_detail_text
				});
				answer_data_index++;
			}
		});
		data.img = $("#pic-test-question-img .custom-pic-div").css("background-image");
		data.img = workBench.assetsPanel.getImageUrl(data.img);
		// 填充
		$(block_obj).html(this.createQuestion(data));
		// 问题编辑按钮
		$(block_obj).find(".btn-edit").on("click", function() {
			self.editQuestion($(this).parents(".custom-question-block"), "edit");
		});
		// 问题删除按钮
		$(block_obj).find(".btn-delete").on("click", function() {
			self.deleteQuestion($(this).parents(".custom-question-block"));
		});
		// 跳转类型
		$(block_obj).find(".test-answer-select .question-dropdown[name='next-type']").on("click", function(e) {
			if (!$(this).hasClass("disabled")) {
				$(".test-answer-select .question-dropdown .dropdown").addClass("hidden");
				$(".test-answer-select .question-dropdown .glyphicon").removeClass("glyphicon-triangle-top").addClass("glyphicon-triangle-bottom");
				console.log(self);
				self.toggleDropDown(this);
			}
			e.stopPropagation();
		});
		$(block_obj).find(".test-answer-select .question-dropdown[name='next-type'] .dropdown span").on("click", function(e) {
			var value = $(this).attr("name");
			var text = $(this).text();
			var container = $(this).parent().parent();
			if ($(container).find(".question-dropdown-value").attr("name") != "value") {
				self.switchNextType(container, value);
			}
			// 设置值
			$(container).find(".question-dropdown-value").text(text).attr("name", value);
			// 折叠
			self.toggleDropDown(container);
			e.stopPropagation();
		});

		// 跳转详情
		$(block_obj).find(".test-answer-select .question-dropdown[name='next-detail']").on("click", function(e) {
			if (!$(this).hasClass("disabled")) {
				$(".test-answer-select .question-dropdown .dropdown").addClass("hidden");
				$(".test-answer-select .question-dropdown .glyphicon").removeClass("glyphicon-triangle-top").addClass("glyphicon-triangle-bottom");
				console.log(self)
				self.toggleDropDown(this);
			}
			e.stopPropagation();
		});
		$(block_obj).find(".test-answer-select .question-dropdown[name='next-detail'] .dropdown span").on("click", function(e) {
			var value = $(this).attr("name");
			var text = $(this).text();
			var container = $(this).parent().parent();
			// 设置值
			$(container).find(".question-dropdown-value").text(text).attr("name", value);
			// 折叠
			self.toggleDropDown(container);
			// 保存
			self.setData();
			e.stopPropagation();
		});
	},
	// 取消编辑问题
	cancelEditQuestion: function(type) {
		var block_obj = $("#custom-test-question-edit-container").parent();
		// 可以编辑或删除其他问题
		$(".custom-question-block .btn-container img").removeClass("disabled");
		// 如果问题少于20个，则显示添加问题按钮
		if ($(".custom-question-block").length < 20) $("#btn-test-question-add").removeClass("hidden");
		// 将编辑容器移除
		$("#custom-test-question-edit-container").addClass("hidden");
		$("#btn-test-question-add").after($("#custom-test-question-edit-container"));
		// 显示原本内容
		if (type == "add") {
			$(block_obj).remove();
		} else if (type == "edit") {
			$(block_obj).children().removeClass("hidden");
		}
		$(block_obj).removeClass("editing");
	},
	// 设置编辑的数据（编辑）
	setEditData: function(block_obj) {
		// 获取数据
		var question = $(block_obj).find(".question .text").html();
		var answers = [];
		$(block_obj).find(".answer-container .answer-block").each(function(k, v) {
			answers.push($(v).find(".text").text());
		});
		var img = $(block_obj).find(".custom-pic-div").css("background-image");
		img = workBench.assetsPanel.getImageUrl(img);
		// 填充
		$("#pic-test-question-img .custom-pic-div").css("background-image", "url("+img+")");
		if (img.indexOf('/images/web/pic-empty.png') > -1) {
			$(".question-img-delelte").css("visibility", "hidden");
		} else {
			$(".question-img-delelte").css("visibility", "visible");
		}
		$("#input-test-question-edit-q").val(question);
		$(".a-block-container .answer-block").addClass("hidden");
		$(".a-block-container .btn-question-edit-delete").css("visibility", "hidden");
		for (var i = 0; i < answers.length; i++) {
			$(".a-block-container .answer-block").eq(i).removeClass("hidden");
			$(".a-block-container .answer-block").eq(i).find("input[name='input-test-question-edit-a']").val(answers[i]);
			$(".a-block-container .answer-block").eq(i).find(".btn-question-edit-delete").css("visibility", "visible");
		}
		if (answers.length >= 4) $("#btn-test-answer-add").addClass("hidden");
		this.resortAnswer();
	},
	// 重置编辑的数据(新增)
	resetEditData: function() {
		$("#pic-test-question-img .custom-pic-div").css("background-image", "url(/images/web/pic-empty.png)");
		$("#input-test-question-edit-q").val("");
		$(".a-block-container .answer-block").addClass("hidden");
		$(".a-block-container .btn-question-edit-delete").css("visibility", "hidden");
		$(".a-block-container .answer-block input[name='input-test-question-edit-a']").val("");
		$(".a-block-container .answer-block").eq(0).removeClass("hidden");
		$(".a-block-container .answer-block").eq(1).removeClass("hidden");
		$("#btn-test-answer-add").removeClass("hidden");
	},
	// 设置数据（最终）
	setData: function() {
		// 问题
		var questions = [];
		$(".custom-question-block").each(function() {
			if (!$(this).hasClass("editing")) {
				var obj = {};
				obj.question = $(this).find(".question .text").html();
				obj.answer = [];
				$(this).find(".answer-block").each(function(k, v) {
					var answer_data = {value: "", jump: "", result: ""};
					answer_data.value = $(v).find(".text").text();
					var type = $(v).next().find(".question-dropdown[name='next-type'] .question-dropdown-value").attr("name");
					if (type == "result") {
						answer_data.result = $(v).next().find(".question-dropdown[name='next-detail'] .question-dropdown-value").attr("name");
					} else {
						answer_data.jump = $(v).next().find(".question-dropdown[name='next-detail'] .question-dropdown-value").attr("name");
					}
					obj.answer.push(answer_data);
				});
				var img = $(this).find(".custom-pic-div").css("background-image");
				img = workBench.assetsPanel.getImageUrl(img);
				if (img.indexOf("/images/web/pic-empty.png") < 0) {
					obj.url = img;
				} else {
					obj.url = "";
				}
				questions.push(obj);
			}
		});
		platform_config["game"]["questions"] = questions;
		// 答案
		var results = [];
		$(".custom-result-block").each(function() {
			var title = $(this).find(".result-title .text").text();
			var detail = $(this).find(".result-detail").html();
			results.push({title: title, detail: detail});
		});
		platform_config["game"]["results"] = results;

		if (!this.checkTestLogic()) {
			// 更新自定义界面
			workBench.menuCustom.process();
			// 保存
			this.error_remind_tag = true;
			workBench.save();
		} else if (this.error_remind_tag) { // 还没有提醒过
			showRemind("测试逻辑存在问题，请检查");
			this.error_remind_tag = false;
		}
	},
	// 重新排序 问题
	resortQuestion: function() {
		var index = 1;
		$(".custom-question-block .question .no").each(function() {
			$(this).text(index++ +".");
		});
	},
	// 重新排序 答案 编辑状态
	resortAnswer: function() {
		var self = this;
		var index = 0;
		$(".a-block-container .answer-block").each(function() {
			if (!$(this).hasClass("hidden")) {
				$(this).find(".no").text(self.answer_no[index++]+".");
			}
		});
	},

	// 检查测试逻辑
	checkTestLogic: function() {
		this.logic = [];
		this.error_logic = [];
		this.recurseTestLogin(0, 0, ["start"]);
		return this.drawTestLogic();
	},
	// 递归测试逻辑
	recurseTestLogin: function(question_index, answer_index, current_quene) {
		var question = platform_config["game"]["questions"][question_index];
		var answer = question["answer"][answer_index];
		if (answer["jump"]) { // 跳到下一题
			var value = "jump-"+answer["jump"];
			if (current_quene.indexOf(value) > -1 || value == "jump-1") { // 死循环
				var data = current_quene.slice(0);
				data.push(value);
				data.push("wrong");
				this.logic.push(data);

				// 记录错误逻辑
				var find_tag = false;
				for (var index in this.error_logic) {
					if (this.error_logic[index].question_index == question_index
						&& this.error_logic[index].answer_index == answer_index) {
						find_tag = true;
						break;
					}
				}
				if (!find_tag) this.error_logic.push({question_index: question_index, answer_index: answer_index});
			} else { // 跳到下一题继续
				current_quene.push(value);
				this.recurseTestLogin(parseInt(answer["jump"]-1), 0, current_quene);
			}
		} else if (answer["result"]) { // 到达终点，结束
			var value = "result-"+answer["result"];
			var data = current_quene.slice(0);
			data.push(value);
			data.push("end");
			this.logic.push(data);
		}
		// 看看是否还有其他答案
		if (answer_index == question["answer"].length-1) {
			current_quene.pop();
		}
		if (answer_index < question["answer"].length-1) { // 还有其他答案
			this.recurseTestLogin(question_index, answer_index+1, current_quene);
		}
	},
	// 绘制测试逻辑
	drawTestLogic: function() {
		// 测试流程绘制
		// var wrong_tag = false;
		// $(".custom-test-logic").html("");
		// for (var i in this.logic) {
		// 	var wrong = false;
		// 	var html = "<div><span>"+(parseInt(i)+1)+".</span>";
		// 	for (var j in this.logic[i]) {
		// 		if (this.logic[i][j] == "end") {
		// 			html += "<span>结束</span>";
		// 		} else if (this.logic[i][j] == "wrong") {
		// 			html += "<span>×</span>";
		// 			wrong = true;
		// 			wrong_tag = true;
		// 		} else {
		// 			if (this.logic[i][j] == "start") {
		// 				html += "<span>开始</span>"; 
		// 			} else if (this.logic[i][j].indexOf("jump") > -1) {
		// 				html += "<span>问题"+this.logic[i][j].split("-")[1]+"</span>"; 
		// 			} else if (this.logic[i][j].indexOf("result") > -1) {
		// 				html += "<span>结果"+this.logic[i][j].split("-")[1]+"</span>"; 
		// 			}
		// 			html += "<span>-></span>";
		// 		}
		// 	}
		// 	html += "</div>";
		// 	$(".custom-test-logic").append(html);
		// 	if (wrong) $(".custom-test-logic").children().last().css("color", "#b22222");
		// }
		// 错误逻辑提示
		$(".test-answer-select .question-dropdown").removeClass("wrong");
		for (var index in this.error_logic) {
			var question_index = this.error_logic[index].question_index;
			var answer_index = this.error_logic[index].answer_index;
			$(".custom-question-block").eq(question_index).find(".test-answer-select").eq(answer_index).find(".question-dropdown").addClass("wrong");
		}
		return (this.error_logic.length > 0);
		// return wrong_tag;
	}
};