// --------------------------------------------------------------------
// @author: @syg.com(必填, 创建模块的人员)
// @description:
//      红包子项
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------

var PathTool = require("pathtool");

var RedBagItem = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("redbag", "redbag_item");
        this.data = null;
        this.item_list = {};
        this.is_show_point = false;
        this.open_type = 0;
        this.star_list = {};
        this.is_can_get = true;

        this.zindex = null;
        this.action = null;
        this.func = null;
        this.black_bool = null;
        this.scale = null;
    },

    initPanel: function () {
        this.main_panel = this.seekChild("main_panel");
        this.label_panel = this.seekChild("label_panel");
        this.label_panel.active = false;

        this.title = this.seekChild(this.main_panel, "title", cc.Label);
        this.title.string = Utils.TI18N("我是红包标题");
        //中间资产图标
        this.coin_icon = this.seekChild(this.main_panel, "coin_icon", cc.Sprite);
        var res = PathTool.getUIIconPath("redbag", "redbag_4");
        this.loadRes(res, function (sf_obj) {
            this.coin_icon.spriteFrame = sf_obj;
        }.bind(this))

        //领完变灰
        this.black_bg = this.seekChild(this.main_panel, "black_bg");
        this.black_bg.active = true;
        //已领取标志
        this.finish_icon = this.seekChild(this.main_panel, "finish_icon");
        this.finish_icon.active = false;
        //红包状态
        this.status_icon = this.seekChild(this.main_panel, "status_icon", cc.Sprite);
        this.status_icon.node.active = false;

        //点击领取
        this.get_status = this.seekChild(this.main_panel, "get_status");
        this.get_status.active = false;

        //红包描述
        this.desc_label = this.seekChild(this.label_panel, "desc_label", cc.RichText);
        //发红包的人
        this.role_name = this.seekChild(this.label_panel, "role_name", cc.RichText);

        this.other_label = this.seekChild(this.label_panel, "other_label", cc.RichText);
        this.other_label.node.active = false;
        this.other_label.string = Utils.TI18N("向公会发送大量金币");

        if (this.zindex != null) {
            this.setLocalZOrder(this.zindex);
        }
        if (this.action != null) {
            this.runActionFunc(this.action, this.func);
        }
        if (this.black_bool != null) {
            this.showBlackBg(this.black_bool);
        }
        if (this.scale != null) {
            this.setScale(this.scale);
        }
    },

    registerEvent: function () {
        this.root_wnd.on(cc.Node.EventType.TOUCH_END, function () {
            if (this.call_fun) {
                this.call_fun(this,this.data);
            }
        }.bind(this))
    },

    setData: function (vo) {
        var data = vo;
        if (vo.open_type != null && vo.open_type == 1)
            data = vo.data;
        this.open_type = vo.open_type || 0;
        this.data = data;
        if (this.root_wnd)
            this.onShow();
    },

    onShow: function () {
        if (this.data == null) return
        var data = this.data;
        var res = PathTool.getUIIconPath("redbag", "redbag_4");
        if (this.open_type == 1) {
            var str = data.name || "";
            this.title.string = str;
            this.role_name.string = "";
            this.desc_label.string = "";
            this.get_status.active = false;
            this.other_label.node.active = true;
            var desc = data.desc || "";
            this.other_label.string = desc;
            res = PathTool.getUIIconPath("redbag", data.res_name);
        } else {
            var name = data.name || "";
            var post_num = data.post || 3;
            var post_config = gdata("guild_data", "data_position", [post_num]);
            if (post_config) {
                var post = post_config.name || "";
                var str = cc.js.formatStr(Utils.TI18N("来自<color=#ffea96>%s</c>(%s)"), name, post);
                this.role_name.string = str;
            }
            var config = gdata("guild_data", "data_guild_red_bag", [data.type]);
            if (config) {
                var name = config.name || "";
                this.title.string = name;
                res = PathTool.getUIIconPath("redbag", config.res_name);
                this.desc_label.string = config.desc;
            }
            this.updateStatus(data);
        }
        this.loadRes(res, function (sf_obj) {
            this.coin_icon.spriteFrame = sf_obj;
        }.bind(this))
    },

    updateStatus: function (data) {
        if (!data) return
        this.is_can_get = true;
        //是否已经领完
        var get_num = data.num;
        var max_num = data.max_num;
        this.is_finish = false;
        if (get_num >= max_num)
            this.is_finish = true;
        //是否过期
        var less_time = data.time - gcore.SmartSocket.getTime();
        this.is_out_time = false;
        if (less_time <= 0)
            this.is_out_time = true;
        //是否自己领完了
        this.my_status = data.flag;

        if (this.my_status == 1) {
            this.finish_icon.active = true;
            this.is_can_get = false;
        } else {
            this.finish_icon.active = false;
        }
        var res;
        if (this.is_finish == true) {
            res = PathTool.getUIIconPath("redbag", "txt_cn_redbag_3");
            this.is_can_get = false;
        } else if (this.is_out_time == true) {
            res = PathTool.getUIIconPath("redbag", "txt_cn_redbag_1");
            this.is_can_get = false;
        }
        if (res) {
            this.loadRes(res, function (sf_obj) {
                this.status_icon.spriteFrame = sf_obj;
            }.bind(this))
        }
        var bool = this.is_finish || this.is_out_time;
        this.status_icon.node.active = bool;
        var bool = this.is_finish || this.is_out_time || this.my_status == 1;
        this.black_bg.active = bool;

        CommonAction.breatheShineAction3(this.get_status, 0.8, 0.8);
        this.get_status.active = this.is_can_get;
    },

    getIsCanGet: function () {
        return this.is_can_get
    },

    clickHandler: function () {
        if (this.call_fun)
            this.call_fun(this.data);
    },

    addCallBack: function (call_fun) {
        this.call_fun = call_fun;
    },

    showBlackBg: function (bool) {
        this.black_bool = bool;
        if (this.root_wnd == null) return
        bool = bool || false;
        this.black_bg.active = bool;
    },

    setVisibleStatus: function (bool) {
        this.setVisible(bool)
    },

    getData: function () {
        return this.data
    },

    setLocalZOrder: function (value) {
        this.zindex = value;
        if (this.root_wnd == null) return
        this.root_wnd.zIndex = value;
    },

    setScale: function (value) {
        this.scale = value;
        if (this.root_wnd == null) return
        this.root_wnd.scale = value;
    },

    runActionFunc: function (action, func) {
        this.action = action;
        this.func = func;
        if (this.root_wnd == null) return
        this.root_wnd.runAction(action, func);
    },

    onDelete: function () {

    }
});

module.exports = RedBagItem;