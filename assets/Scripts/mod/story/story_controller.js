// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      这里填写详细说明,主要填写该模块的功能简要
// <br/>Create: 2019-04-15 14:45:57
// --------------------------------------------------------------------
var StoryView = require("story_view");

var StoryController = cc.Class({
    extends: BaseController,
    ctor: function () {
    },

    // 初始化配置数据
    initConfig: function () {
        var StoryModel = require("story_model");

        this.model = new StoryModel(this);
        this.model.initConfig();
        this.view = new StoryView(this);
    },

    // 返回当前的model
    getModel: function () {
        return this.model;
    },

    // 注册监听事件
    registerEvents: function () {
        // this.init_role_event = gcore.GlobalEvent.bind(EventId.EVT_ROLE_CREATE_SUCCESS, function() {
        //     for (var drama_i in Config.drama_data.data_get) {
        //         var config = Config.drama_data.data_get[drama_i];
        //         var server_data = {};
        //         server_data.drama_bid = config.bid;
        //         this.handle11101(server_data);
        //     }
        // }.bind(this))
    },

    // 注册协议接受事件
    registerProtocals: function () {
        this.RegisterProtocal(11101, this.handle11101.bind(this));   // 服务端触发剧情
        this.RegisterProtocal(11102, this.handle11102.bind(this));   // 跳过剧情
        this.RegisterProtocal(11100, this.handle11100.bind(this));        
    },

    handle11101: function(data_list) {
        cc.log("收到服务端执行剧情协议")
        // return
        cc.log(data_list);
        this.model.setCurStory(data_list);
    },

    send11102: function(drama_bid) {
        var protocal = {};
        protocal.drama_bid = drama_bid;
        this.SendProtocal(11102, protocal);
    },

    handle11102: function(data_list) {
        if (this.model) {
            if (data_list.code == 1)
                gcore.GlobalEvent.fire(StoryEvent.SKIP_STORY);
        }
    },

    send11100: function(drama_bid, step_id) {
        cc.log("通知服务端剧情步骤" + "--" + drama_bid  + "--" + step_id);
        
        var protocal = {};
        protocal.drama_bid = drama_bid;
        protocal.step_id = step_id;
        this.SendProtocal(11100, protocal);        
    },

    handle11100: function(data) {
        if (this.view)
            this.view.playStepOver();
    },

    isInStory: function() {
        if (!this.model) return false;
        return this.model.isStoryState();
    },

});

module.exports = StoryController;