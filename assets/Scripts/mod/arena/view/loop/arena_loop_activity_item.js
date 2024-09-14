var PathTool = require("pathtool");

var ArenaLoopActivityPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("arena", "arean_loop_activity_item");
    },

    // 可以初始化声明一些变量的
    initConfig:function() {

    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel:function() {
        this.rank_img_nd  = this.seekChild("rank_img");
        this.rank_img_sp  = this.seekChild("rank_img", cc.Sprite);
        this.rank_txt_nd  = this.seekChild("rank_txt");
        this.rank_txt_lb  = this.seekChild("rank_txt", cc.Label);
        this.role_rank_lb = this.seekChild("role_rank", cc.Label);

        this.list_items = {};
        for (var item_i = 0; item_i < 2; item_i++) {
            var item_nd = this.seekChild("item_nd_" + item_i);
            this.list_items[item_i] = ItemsPool.getInstance().getItem("backpack_item");
            this.list_items[item_i].setParent(item_nd);
            this.list_items[item_i].setExtendData({scale: 0.8});
            this.list_items[item_i].setDefaultTip(true, false);
            this.list_items[item_i].show();
        }
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function() {

    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow:function(params) {
        this.updateWidgets();
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide:function() {

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete:function() {
        if(this.list_items){
            for(let i in this.list_items){
                if(this.list_items[i]){
                    this.list_items[i].deleteMe();
                    this.list_items[i] = null;
                }
            }
            this.list_items = null
        }
    },

    setData: function(active_data) {
        if (!active_data) return;
        this.active_data = active_data;
        if (this.root_wnd)
            this.updateWidgets();
    },

    updateWidgets: function() {
        if (this.active_data.min == this.active_data.max &&　this.active_data.max > 0 &&  this.active_data.max <= 3) {
            this.rank_img_nd.active = true;
            this.rank_txt_nd.active = false;
            var icon_path = PathTool.getUIIconPath("common", "common_200" + this.active_data.max)
            this.loadRes(icon_path, function(rank_sf) {
                this.rank_img_sp.spriteFrame = rank_sf;
            }.bind(this))
        } else if (this.active_data.min > 3) {
            this.rank_img_nd.active = false;
            this.rank_txt_nd.active = true;

            this.rank_txt_lb.string = this.active_data.min + "~" +　this.active_data.max;
        }

        for (var item_i in this.active_data.items) {
            var item_data = {};
            item_data.bid = this.active_data.items[item_i][0];
            item_data.num = this.active_data.items[item_i][1];            
            this.list_items[item_i].setData(item_data);
        }
    },
})