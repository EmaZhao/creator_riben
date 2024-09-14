// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-04-24 11:17:12
// --------------------------------------------------------------------
var PathTool = require("pathtool");

var Rank_reward_itemPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("rank", "rank_reward_item");
    },

    // 可以初始化声明一些变量的
    initConfig: function () {
        this.item_list = [];

    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel: function () {
        this.rank_img_sp = this.seekChild("rank_img", cc.Sprite);
        this.rank_label_lb = this.seekChild("rank_label", cc.Label);
        this.con_nd = this.seekChild("con");
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {

    },

    setData: function (data) {
        if (this.data && this.data.rank1 == data.rank1) return
        this.data = data;
        if (this.root_wnd)
            this.onShow();
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow: function (params) {
        if (this.data == null) return
        var data = this.data;

        if (data.rank1 <= 3) {
            this.rank_label_lb.string = "";
            this.rank_img_sp.node.active = true;
            var res_id = PathTool.getUIIconPath("common", "common_200" + data.rank1);
            this.loadRes(res_id, function (sp) {
                this.rank_img_sp.spriteFrame = sp;
            }.bind(this))
        } else {
            this.rank_img_sp.node.active = false;
            var str = null;
            if (data.rank1 && data.rank2) {
                if (data.rank2 == 9999) {
                    str = cc.js.formatStr("%s+", data.rank1);
                } else {
                    str = cc.js.formatStr("%s~%s", data.rank1, data.rank2);
                }
            } else {
                str = data.rank1;
            }
            this.rank_label_lb.string = str
        }

        if (this.item_list) {
            for (var i in this.item_list) {
                var v = this.item_list[i];
                if (v) {
                    v.setVisible(false)
                }
            }
        }

        var scale = 0.9;
        var offsetX = 14;
        var item_width = BackPackItem.Width * scale;
        var index = 0;

        for (var i in data.award) {
            var v = data.award[i];
            if (!this.item_list[i]) {
                const item = ItemsPool.getInstance().getItem("backpack_item");
                item.initConfig(false, scale, false, true);
                item.show();
                item.setParent(this.con_nd);
                this.item_list[i] = item;
                item.setData({ bid: v.bid, num: v.num });
                item.setPosition(index * (item_width + offsetX) + 60, 0);
            } else {
                var _item = this.item_list[i];
                _item.setVisible(true);
                _item.setData({ bid: v.bid, num: v.num });
                _item.setPosition(index * (item_width + offsetX) + 60, 0);
            }
            index = index + 1
        }
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide: function () {

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete: function () {
        if (this.item_list) {
            for (var i in this.item_list) {
                var v = this.item_list[i];
                if (v) {
                    v.deleteMe();
                    v = null;
                }
            }
        }
    },
})