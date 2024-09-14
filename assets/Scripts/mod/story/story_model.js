// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      这里填写详细说明,主要填写该模块的功能简要
// <br/>Create: 2019-04-15 14:45:57
// --------------------------------------------------------------------
var StoryEvent     = require("story_event")
var RoleController = require("role_controller");

var StoryModel = cc.Class({
    extends: BaseClass,
    ctor: function () {
		this.ctrl = arguments[0];    	
    },

    properties: {
    },

    initConfig: function () {
    	this.save_drama_list = null;

		this.cur_story_bid = null; 	//  当前剧情bid
		this.cur_story = null;		//  当前剧情配置
		this.cur_act_list = null; 	//  当前动作列表
	    // 当前是否在剧情中
	    this.is_story_state = false; //  剧情状态
	    // 当前是否是剧情触发的战斗;
	    this.is_story_fight = false; //  战斗
	    // 保存缓存的剧情数据;
	    this.temp_story_list = [];
    },

	// 设置当前剧情配置
	setCurStory: function(data_list) {
		if (!this.save_drama_list)
			this.initDrama();		

	    // 是否已经执行过引导
	    for (var drama_i in this.save_drama_list) {
	    	if (this.save_drama_list[data_list.drama_bid])
	    		return
	    }
	    
	    // 这里看看需要不需要判断当前如果有窗体或者有全屏窗体打开的时候,也缓存剧情数据
	    if (this.is_story_state) { //判断是否在剧情状态
	    	cc.log("model缓存剧情");
	        if (this.cur_story_bid == data_list.drama_bid) return;
	        for (var story_i in this.temp_story_list) {
	        	var story_info = this.temp_story_list[story_i];
	        	if (story_info.drama_bid == data_list.drama_bid) {
	        		return
	        	}
	        }
	        this.temp_story_list.push(data_list);
	        return
	    }


		this.cur_story_bid = data_list.drama_bid;
		this.cur_story = Config.drama_data.data_get[data_list.drama_bid];

		if (this.cur_story && this.cur_story.act) {
			this.cur_act_list = this.cur_story.act;
			gcore.GlobalEvent.fire(StoryEvent.READ_CONFIG_COMPLETE);			
		} else {
			this.ctrl.send11100(this.cur_story_bid, 0)
		}
	},

	// 当剧情播放完成的时候判断一下是否有下一个剧情缓存
	isPlayNextStory: function() {
	    if (this.temp_story_list.length > 0) {
	        // var data_list = table.remove(self.temp_story_list, 1)
	        var data_list = this.temp_story_list.shift();
	        this.setCurStory(data_list);
	    }
	},

	//  取到当前剧情bid
	getCurStoryBid: function() {
		return this.cur_story_bid
	},

	//  取到当前剧情配置
	getCurStory: function() {
		return this.cur_story
	},

	//  取到当前动作列表
	getCurActList: function() {
		return this.cur_act_list
	},

	// 设置剧情状态
	setStoryState: function(bool) {
	    this.is_story_state = bool;
	    // 如果剧情已经结束，则判断下一个剧情
	    if (!bool) {
	        gcore.GlobalEvent.fire(StoryEvent.STORY_OVER);
	        this.isPlayNextStory()
	    }
	},

	isStoryState: function() {
	    return this.is_story_state;
	},

	// 设置状态
	setStoryFight: function(bool) {
	    this.is_story_fight = bool;
	},

	isStoryFight: function() {
	    return this.is_story_fight
	},

	// 清除剧情的数据
	clearActData: function() {
	    this.cur_story_bid = null;
	    this.cur_story = null;
	    this.cur_act_list = null;		
	},

	saveDrama: function(drama_id) {
		if (!this.save_drama_list[drama_id]) {
			this.save_drama_list[drama_id] = true;
	        var role_vo = RoleController.getInstance().getRoleVo();
	        cc.sys.localStorage.setItem("drama_data" + role_vo.srv_id + role_vo.rid, JSON.stringify(this.save_drama_list));		
		}
	},

	initDrama: function() {
	    var role_vo = RoleController.getInstance().getRoleVo();

	    var cache_data = cc.sys.localStorage.getItem("drama_data" + role_vo.srv_id + role_vo.rid);
	    if (cache_data) {
			this.save_drama_list = JSON.parse(cache_data) || {};
	    } else {
	    	this.save_drama_list = {};
	    }
	},

});