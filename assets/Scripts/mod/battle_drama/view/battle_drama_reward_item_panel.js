// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-11 14:47:21
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var BattleDramaRewardItemPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("battledrama", "battle_drama_reward_item");
        this.controller = require("battle_drama_controller").getInstance();
    },

    // 可以初始化声明一些变量的
    initConfig:function(){
        this.drop_item_list = {};            // 创建完成的物品列表
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel:function(){
        this.comfirm_btn = this.seekChild("comfirm_btn");           // 领取
        this.goto_btn = this.seekChild("goto_btn");                 // 前往
        this.img_received = this.seekChild("img_received");     // 已领取图标
        this.name_label = this.seekChild("name_label", cc.Label);   // 关卡显示
        this.container = this.seekChild("content");                 // 物品滚动容器

        Utils.getNodeCompByPath("root/comfirm_btn/label", this.root_wnd, cc.Label).string = Utils.TI18N("领取");
        Utils.getNodeCompByPath("root/goto_btn/label", this.root_wnd, cc.Label).string = Utils.TI18N("前往");
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        Utils.onTouchEnd(this.comfirm_btn, function(){
            if(this.data){
                this.controller.send13009(this.data.id);
            }
        }.bind(this), 1)

        Utils.onTouchEnd(this.goto_btn, function(){
            this.controller.openDramaRewardWindow(false);
        }.bind(this), 1)
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow:function(params){
        this.updateData();
    },

    // 设置数据
    setData:function(data){
        this.data = data;
        if (this.root_wnd) {
            this.updateData()
        }
    },

    updateData:function(){
        var data = this.data;
        if (data) {
            var config = data.config_data;
            var str = cc.js.formatStr(Utils.TI18N("通关%s关(%s关/%s关)"), data.target_dun, data.cur_dun, data.target_dun);
            // 引导tag
            if (this.data.id == 1)
                this.comfirm_btn.ui_tag = config.limit_id;
            
            this.comfirm_btn.name = "comfirm_btn_" + (this.tmp_index + 1);

            this.name_label.string = str;
            if (data.sort_index == 3) {              // 已领取
                this.goto_btn.active = false;
                this.comfirm_btn.active = false;
                this.img_received.active = true;
            } else if (data.sort_index == 2) {       // 未达条件
                this.goto_btn.active = true;
                this.comfirm_btn.active = false;
                this.img_received.active = false;
            } else {                                  // 可领取
                this.goto_btn.active = false;
                this.comfirm_btn.active = true;
                this.img_received.active = false;
            }

            // 展示掉落物品
            this.updateDramaDropInfo(config.items);
        }
        // { config_data: config, id: config.id, is_received: pass_list[config.id] || false, cur_dun: floor, sort_index: 0, target_dun: target_config.floor };
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide:function(){

    },

    // 更新副本掉落物品展示信息
    updateDramaDropInfo: function (item_datas) {
        if (this.container == null || item_datas == null) return;
        for (var key in this.drop_item_list) {
            var item = this.drop_item_list[key];
            if (item) {
                item.setVisible(false);
            }
        }
        var scale = 0.75;
        var space_x = 10;
        var start_x = 5 + 60 * scale;

        // 创建物品显示对象
        for (let index = 0; index < item_datas.length; index++) {
            const element = item_datas[index];
            var item = this.createDramaDropItem(index, scale, space_x, start_x);
            if (item) {
                item.setData({ bid: element[0], num: element[1] });
                item.setVisible(true)
            }
        }
    },

    // 创建单个物品
    createDramaDropItem: function (index, scale, space_x, start_x) {
        var item = this.drop_item_list[index];
        if (item == null) {
            var _x = start_x + index * (120 * scale + space_x)
            item = ItemsPool.getInstance().getItem("backpack_item");
            item.setParent(this.container);
            item.initConfig(null, scale, false, true);
            item.setPosition(_x, 0);
            item.show();
            this.drop_item_list[index] = item;
        }
        return item;
    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete:function(){
        if (this.drop_item_list) {
            for (var key in this.drop_item_list) {
                var item = this.drop_item_list[key];
                if (item) {
                    item.deleteMe();
                }
            }
            this.drop_item_list = null;
        }
    },
})
