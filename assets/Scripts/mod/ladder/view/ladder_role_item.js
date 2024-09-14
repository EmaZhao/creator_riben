// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     天梯主界面单个英雄
// <br/>Create: 2019-07-25 16:24:25
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var LadderController = require("ladder_controller");
var BaseRole = require("baserole");

var Ladder_role_itemPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("ladder", "ladder_role_item");
    },

    // 可以初始化声明一些变量的
    initConfig: function () {
        this.ctrl = LadderController.getInstance();
        this.model = this.ctrl.getModel();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel: function () {
        this.size = cc.size(243, 280);

        this.container = this.seekChild("container");
        this.touch_layer = this.seekChild("touch_layer");
        this.image_line_sp = this.seekChild("image_line", cc.Sprite);
        this.rank_label_lb = this.seekChild("rank_label", cc.Label);
        this.name_label_lb = this.seekChild("name_label", cc.Label);
        this.attk_label_lb = this.seekChild("attk_label", cc.Label);
        this.atk_icon_nd = this.seekChild("atk_icon");
        this.pos_role_nd = this.seekChild("pos_role");
        this.attk_image = this.seekChild("attk_image");
        this.rank_bg = this.seekChild("rank_bg");
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {
        Utils.onTouchEnd(this.touch_layer, function () {
            let is_open = this.model.getLadderIsOpen();
            if (is_open) {
                this.ctrl.openLadderRoleInfoWindow(true, this.data);
            } else {
                let txt_cfg = Config.sky_ladder_data.data_const["close_text"];
                if (txt_cfg) {
                    message(cc.js.formatStr(Utils.TI18N("每%s天梯争霸"), txt_cfg.desc));
                }
            }
        }.bind(this), 1)
    },

    setData: function (data) {
        this.data = data;
        if (this.root_wnd) {
            this.onShow();
        }
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow: function () {
        if (this.data == null) return
        let data = this.data;
        let is_open = this.model.getLadderIsOpen();
        if (!data.rank || data.rank == 0) {
            this.rank_label_lb.string = Utils.TI18N("未上榜");
        } else {
            this.rank_label_lb.string = cc.js.formatStr(Utils.TI18N("第%s名"), data.rank);
        }
        let rank_size = this.rank_label_lb.node.getContentSize();
        this.rank_label_lb._forceUpdateRenderData(true);
        this.rank_bg.setContentSize(cc.size(rank_size.width + 10, 30));

        if (is_open) {
            this.name_label_lb.string = Utils.transformNameByServ(data.name, data.srv_id);
            this.attk_label_lb.string = data.power || 0;
            this.attk_label_lb._forceUpdateRenderData(true);
            let label_size = this.attk_label_lb.node.getContentSize();
            this.attk_image.active = true;
            this.atk_icon_nd.active = true;
            this.atk_icon_nd.x = 121 - label_size.width / 2;
        } else {
            this.name_label_lb.string = Utils.TI18N("虚位以待");
            let txt_cfg = Config.sky_ladder_data.data_const["close_text"];
            if (txt_cfg) {
                this.attk_label.string = txt_cfg.desc;
            }
            this.attk_image.active = false;
            this.atk_icon_nd.active = false;
        }
        if (this.role_spine && data.look) {
            this.role_spine.setData(BaseRole.type.role, data.look, PlayerAction.show, true, 0.7);
        }
        if (data.look && this.role_spine == null) {
            this.role_spine = new BaseRole();
            this.role_spine.setParent(this.pos_role);
            this.role_spine.setPosition(0, 130);
            this.role_spine.setAnchorPoint(0.5, 0);
            this.role_spine.setData(BaseRole.type.role, data.look, PlayerAction.show, true, 0.7);
        }

        //设置底框
        let res_path = this.getRoleBoxResPath(data.rank);
        if (res_path) {
            this.loadRes(res_path, function (sp) {
                this.image_line_sp.spriteFrame = sp;
            }.bind(this))
            this.image_line_sp.node.active = true;
        } else {
            this.image_line_sp.node.active = false;
        }
    },

    getRoleBoxResPath: function (rank) {
        let res_path = null;
        let box_config = Config.sky_ladder_data.data_const.role_box;
        let index = 0;
        if (box_config && box_config.val != null) {
            for (let k in box_config.val) {
                let v = box_config.val[k];
                if (rank >= v[0] && (rank <= v[0] || v[1] == 0)) {
                    index = k;
                }
            }
        }
        if (index == 1) {
            res_path = PathTool.getUIIconPath("ladder", "ladder_1019");
        } else if (index == 2) {
            res_path = PathTool.getUIIconPath("ladder", "ladder_1018");
        } else if (index == 3) {
            res_path = PathTool.getUIIconPath("ladder", "ladder_1017");
        } else if (index == 4) {
            res_path = PathTool.getUIIconPath("ladder", "ladder_1016");
        }

        return res_path
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide: function () {

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete: function () {
        if (this.role_spine) {
            this.role_spine.deleteMe();
            this.role_spine = null;
        }
    },
})