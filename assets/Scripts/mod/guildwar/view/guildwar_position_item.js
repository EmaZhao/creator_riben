// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     联盟战 据点
// <br/>Create: 2019-05-08 10:14:55
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var GuildwarConst = require("guildwar_const");
var RoleController = require("role_controller")
var GuildwarEvent = require("guildwar_event");

var Guildwar_position_itemPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("guildwar", "guildwar_position");
    },

    // 可以初始化声明一些变量的
    initConfig: function () {
        this.star_list = {};
        this.ctrl = require("guildwar_controller").getInstance();
        this.model = this.ctrl.getModel();
        this.color_1 = new cc.Color(123, 194, 244);
        this.color_2 = new cc.Color(244, 140, 123);
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel: function () {
        this.container = this.seekChild("container");

        this.build_sp = this.seekChild("build", cc.Sprite);
        this.name_label_lb = this.seekChild("name_label", cc.Label);
        this.attk_label_lb = this.seekChild("attk_label", cc.Label);
        this.pos_bg_nd = this.seekChild("pos_bg");
        this.pos_label_lb = this.seekChild(this.pos_bg_nd, "pos_label", cc.Label);
        this.image_success_nd = this.seekChild("image_success");
        this.image_success_nd.zIndex = 10;
        this.image_buff = this.seekChild(this.image_success_nd,"image_buff", cc.Sprite);
        this.loadRes(PathTool.getIconPath("bufficon", "2"), function (sp) {
                this.image_buff.spriteFrame = sp;
            }.bind(this))
        var temp_index = {
            [1]: 3,
            [2]: 2,
            [3]: 1
        }
        for (var i = 1; i <= 3; i++) {
            var star = this.seekChild("star_" + i);
            if (star) {
                star.active = false;
                var index = temp_index[i];
                this.star_list[index] = star;
            }
        }


        if (this.parent_nd) {
            this.setParentIndex(this.parent_nd, this.z_index);
        }
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {
        Utils.onTouchEnd(this.container, function () {
            if (this.cur_position_type == GuildwarConst.positions.others && this.data && this.data.pos) {
                var guildwar_status = this.model.getGuildWarStatus();
                if (guildwar_status == GuildwarConst.status.settlement) {
                    message(Utils.TI18N("本次公会战已结束啦，不能再挑战了哦"));
                } else {
                    this.ctrl.openAttkPositionWindow(true, this.data.pos);
                }
            } else if (this.cur_position_type == GuildwarConst.positions.myself && this.data && this.data.pos) {
                var role_vo = RoleController.getInstance().getRoleVo();
                if (role_vo.gid != 0) {
                    this.ctrl.openDefendLookWindow(true, role_vo.gid, role_vo.gsrv_id, this.data.pos) // 我方据点直接打开据点防守记录
                }
            }
        }.bind(this), 1)
    },

    setData: function (data, position_type) {
        if (this.data != null) {
            if (this.update_self_event != null) {
                this.data.unbind(this.update_self_event);
                this.update_self_event = null;
            }
        }
        if (data != null) {
            this.data = data;
            if (this.update_self_event == null) {
                this.update_self_event = this.data.bind(GuildwarEvent.UpdateGuildWarPositionDataEvent, function () {
                    this.onShow();
                }, this)
            }
        }
        this.cur_position_type = position_type;
        if (this.root_wnd)
            this.onShow();
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow: function (params) {
        if (this.data == null) return
        if (this.data.hp == 0) {
            this.loadRes(PathTool.getUIIconPath("guildwar", "guildwar_1020"), function (sp) {
                this.build_sp.spriteFrame = sp;
            }.bind(this))
            if (!this.special_sk) {
                this.special_sk = this.seekChild("special_sk", sp.Skeleton);
                var res = cc.js.formatStr("spine/%s/action.atlas", PathTool.getEffectRes(326))
                this.loadRes(res, function (res_object) {
                    this.special_sk.skeletonData = res_object;
                    this.special_sk.setAnimation(1, PlayerAction.action, true)
                }.bind(this))
            }
            this.special_sk.node.active = true;
        } else {
            this.loadRes(PathTool.getUIIconPath("guildwar", "guildwar_1017"), function (sp) {
                this.build_sp.spriteFrame = sp;
            }.bind(this))
            if (this.special_sk) {
                this.special_sk.node.active = false;
            }
        }
        for (var i = 1; i < 4; i++) {
            var star = this.star_list[i];
            if (this.data.hp < i) {
                star.active = true;
            } else {
                star.active = false;
            }
        }

        this.pos_label_lb.string = this.data.pos;

        var guild_srvid = "";
        if (this.cur_position_type == GuildwarConst.positions.others) {
            var enemy_baseinfo = this.model.getEnemyGuildWarBaseInfo();
            guild_srvid = enemy_baseinfo.g_sid || "";
        } else {
            var role_vo = RoleController.getInstance().getRoleVo();
            guild_srvid = role_vo.gsrv_id || "";
        }

        var index = guild_srvid.search("_");
        var srv_index = 1;
        if (index != null) {
            srv_index = guild_srvid.substring(index + 1);
        }
        var name_str = cc.js.formatStr("[S%s]%s", srv_index, this.data.name);
        this.name_label_lb.string = name_str;
        this.attk_label_lb.string = Utils.TI18N(cc.js.formatStr("戦力:%d", this.data.power));

        this.image_success_nd.active = false;
        if (this.cur_position_type == GuildwarConst.positions.myself) {
            this.name_label_lb.node.color = this.color_1;
        } else {
            this.name_label_lb.node.color = this.color_2;
            this.image_success_nd.active = this.data.hp <= 0;
        }
        var name_size = this.name_label_lb.node.getContentSize();
        var name_pos_x = this.name_label_lb.node.x;
        this.pos_bg_nd.x = name_pos_x - name_size.width / 2;
    },

    //获取pos
    getPositionPos: function () {
        return this.data.pos
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

    getPosition: function () {
        if (this.root_wnd) {
            return cc.v2(this.root_wnd.x, this.root_wnd.y)
        } else {
            return cc.v2(0, 0);
        }
    },

    setParentIndex: function (parent, index) {
        if (this.root_wnd) {
            parent.addChild(this.root_wnd, index);
        } else {
            this.parent_nd = parent;
            this.z_index = index;
        }
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide: function () {

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete: function () {
        if (this.special_sk) {
            this.special_sk.setToSetupPose();
            this.special_sk.clearTracks();
        }
        this.suspendAllActions();
    },
})