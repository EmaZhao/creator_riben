// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-05-08 17:15:18
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var GuildwarEvent = require("guildwar_event");
var GuildwarConst = require("guildwar_const");

var Guildwar_award_boxPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("guildwar", "guildwar_award_box_item");
    },

    // 可以初始化声明一些变量的
    initConfig: function () {
        this.ctrl = require("guildwar_controller").getInstance();
        this.model = this.ctrl.getModel();
        this.size = cc.size(206, 218);
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel: function () {
        this.container = this.seekChild("container");

        this.iamge_box_sp = this.seekChild("image_box", cc.Sprite);
        this.name_txt_lb = this.seekChild("name_txt", cc.Label);
        this.name_txt_lb.node.active = false;

    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {
        // this.addGlobalEvent(GuildwarEvent.UpdateSingleBoxDataEvent, function () {
        //     this.onShow();
        // }, this)

        this.container.on(cc.Node.EventType.TOUCH_END, function () {
            if (this.data == null) return
            this.ctrl.requestGetBoxAward(this.data.order)
        }, this)
    },

    setData: function (data) {
        if (this.data != null) {
            if (this.update_self_event != null) {
                this.data.unbind(this.update_self_event);
                this.update_self_event = null;
            }
        }
        if (data != null) {
            this.data = data;
            if (this.update_self_event == null) {
                this.update_self_event = this.data.bind(GuildwarEvent.UpdateSingleBoxDataEvent, function () {
                    this.onShow();
                }, this)
            }
        }
        if (this.root_wnd)
            this.onShow();
        // this.data = data;
        // if (this.root_wnd)
        //     this.onShow();
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow: function () {
        if (this.data == null) return

        //是否已经被开启
        if (this.data.rid == 0) {
            this.iamge_box_sp.node.active = true;
            this.name_txt_lb.node.active = false;
            if (this.item_node) {
                this.item_node.setVisible(false);
            }
            //加载金或者铜宝箱，避免重复加载
            if (!this.load_image_flag) {
                this.load_image_flag = true;
                if (this.data.status == GuildwarConst.box_type.gold) {
                    this.loadRes(PathTool.getUIIconPath("bigbg/guildwar", "guildwar_3"), function (sp) {
                        this.iamge_box_sp.spriteFrame = sp;
                    }.bind(this));
                } else if (this.data.status == GuildwarConst.box_type.copper) {
                    this.loadRes(PathTool.getUIIconPath("bigbg/guildwar", "guildwar_4"), function (sp) {
                        this.iamge_box_sp.spriteFrame = sp;
                    }.bind(this));
                }
            }
        } else {
            this.iamge_box_sp.node.active = false;
            this.name_txt_lb.node.active = true;
            if (this.item_node == null) {
                this.item_node = ItemsPool.getInstance().getItem("backpack_item");
                this.item_node.initConfig(false, 1, false, true);
                this.item_node.setPosition(0, 20);
                this.item_node.show();
                this.item_node.setParent(this.container);
            }
            this.item_node.setVisible(true);
            this.item_node.setData({ bid: this.data.item_id, num: this.data.item_num });
            this.name_txt_lb.string = this.data.name;
            var role_vo = require("role_controller").getInstance().getRoleVo();
            if (this.data.rid == role_vo.rid && this.data.sid == role_vo.srv_id) {
                this.name_txt_lb.node.color = new cc.Color(36, 144, 3)
            }
        }
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide: function () {

    },


    suspendAllActions: function () {
        if (this.data != null) {
            if (this.update_self_event != null) {
                this.data.unbind(this.update_self_event);
                this.update_self_event = null;
            }
            this.data = null;
        }
    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete: function () {
        if (this.item_node) {
            this.item_node.deleteMe();
            this.item_node = null;
        }
        this.suspendAllActions();
    },
})