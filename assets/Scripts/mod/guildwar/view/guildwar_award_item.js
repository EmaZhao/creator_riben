// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-05-13 11:47:43
// --------------------------------------------------------------------
var PathTool = require("pathtool");

var Guildwar_award_itemPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("guildwar", "guilewar_award_list_item");
    },

    // 可以初始化声明一些变量的
    initConfig: function () {
        this.ctrl = require("guildwar_controller").getInstance();
        this.model = this.ctrl.getModel();
        this.item_list = {};
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel: function () {
        this.main_container = this.seekChild("main_container");
        this.image_sp = this.seekChild("image", cc.Sprite);
        this.range_lb = this.seekChild("rank_label_2", cc.Label);
        this.good_con = this.seekChild("good_con");

        // this.scroll_view = this.seekChild("scroll_view");
        // this.scroll_content = this.seekChild(this.scroll_view, "container");
        // this.scroll_view_size = this.scroll_view.getContentSize();
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {

    },

    setData: function (data) {
        this.data = data;
        if (this.root_wnd)
            this.onShow();
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow: function (params) {
        if (this.data == null) return
        var data = this.data;
        if (data.num == 1) {
            this.image_sp.node.active = true;
            this.range_lb.node.active = false;
            this.loadRes(PathTool.getUIIconPath("common", "common_2001"), function (sp) {
                this.image_sp.spriteFrame = sp;
            }.bind(this))
        } else if (data.num == 2) {
            this.image_sp.node.active = true;
            this.range_lb.node.active = false;
            this.loadRes(PathTool.getUIIconPath("common", "common_2002"), function (sp) {
                this.image_sp.spriteFrame = sp;
            }.bind(this))
        } else if (data.num == 3) {
            this.image_sp.node.active = true;
            this.range_lb.node.active = false;
            this.loadRes(PathTool.getUIIconPath("common", "common_2003"), function (sp) {
                this.image_sp.spriteFrame = sp;
            }.bind(this))
        } else {
            this.image_sp.node.active = false;
            this.range_lb.node.active = true;
            this.range_lb.string = cc.js.formatStr("%s~%s", data.pre_num, data.num);
        }

        var scale = 0.8;
        var index = 1;
        for (var i in data.award) {
            var award = data.award[i];
            var bid = award[0];
            var num = award[1];
            var item_conf = Utils.getItemConfig(bid);
            if (item_conf) {
                var item = this.item_list[i];
                if (!item) {
                    item = ItemsPool.getInstance().getItem("backpack_item");
                    item.initConfig(false, scale, false, true);
                    this.item_list[i] = item;
                    item.setParent(this.good_con);
                    item.show();
                }
                item.setData({ bid: bid, num: num });
                item.setPosition(index * 110 - 20, 48);
                index = index + 1;
            }
        }
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide: function () {

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete: function () {

    },
})