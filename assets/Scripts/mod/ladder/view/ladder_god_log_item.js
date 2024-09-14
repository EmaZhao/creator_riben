// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     大神风采 item
// <br/>Create: 2019-08-10 16:05:00
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var PlayerHead = require("playerhead");
var BattleController = require("battle_controller");
var RoleController = require("role_controller");
var ChatController = require("chat_controller");
var TimeTool = require("timetool");

var Ladder_god_log_itemPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("ladder", "ladder_god_log_item");
    },

    // 可以初始化声明一些变量的
    initConfig: function () {

    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel: function () {
        this.container = this.seekChild("container");
        this.time_lb = this.seekChild("time_label", cc.Label);
        this.rank_lb_1 = this.seekChild("rank_label_1", cc.Label);
        this.name_lb_1 = this.seekChild("name_label_1", cc.Label);
        this.rank_lb_2 = this.seekChild("rank_label_2", cc.Label);
        this.name_lb_2 = this.seekChild("name_label_2", cc.Label);
        this.btn_watch = this.seekChild("btn_watch");

        this.role_head_1 = new PlayerHead();
        this.role_head_1.show();
        this.role_head_1.setScale(0.8);
        this.role_head_1.setPosition(60, 88);
        this.role_head_1.setParent(this.container);
        this.role_head_1.addCallBack(function () {
            this._onClickRoleHead(1);
        }.bind(this))

        this.role_head_2 = new PlayerHead();
        this.role_head_2.show();
        this.role_head_2.setScale(0.8);
        this.role_head_2.setPosition(480, 88);
        this.role_head_2.setParent(this.container);
        this.role_head_2.addCallBack(function () {
            this._onClickRoleHead(2);
        }.bind(this))
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {
        Utils.onTouchEnd(this.btn_watch, function () {
            if (this.data && this.data.replay_id && this.data.atk_srv_id) {
                BattleController.getInstance().csRecordBattle(this.data.replay_id, this.data.atk_srv_id);
            }
        }.bind(this), 1)
    },

    setData: function (data) {
        this.data = data;
        if (this.root_wnd)
            this.onShow();
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow: function (params) {
        if (this.data == null) return
        data = this.data;

        this.time_lb.string = TimeTool.getYMDHMS(data.time || 0);

        //进攻方
        this.role_head_1.setHeadRes(data.atk_face);
        this.rank_label_1.string = cc.js.formatStr(Utils.TI18N("排名：%s"), data.atk_rank || 0);
        this.name_lb_1.string = Utils.transformNameByServ(data.atk_name, data.atk_srv_id);

        //防守方
        this.role_head_2.setHeadRes(data.def_face);
        this.rank_label_2.string = cc.js.formatStr(Utils.TI18N("排名：%s"), data.def_rank || 0);
        this.name_lb_2.string = Utils.transformNameByServ(data.def_name, data.def_srv_id);

        if (data.ret == 1) {
            this.role_head_1.showBattleResultIcon(1);
            this.role_head_2.showBattleResultIcon(0);
        } else {
            this.role_head_1.showBattleResultIcon(0);
            this.role_head_2.showBattleResultIcon(1);
        }
    },

    _onClickRoleHead: function (index) {
        let roleVo = RoleController.getInstance().getRoleVo();
        if (this.data) {
            let rid = "";
            let srv_id = "";
            if (index == 1) {
                rid = this.data.atk_rid;
                srv_id = this.data.atk_srv_id;
            } else if (index == 2) {
                rid = this.data.def_rid;
                srv_id = this.data.def_srv_id;
            }
            if (rid && srv_id) {
                if (srv_id == "robot") {
                    message(Utils.TI18N("神秘人太高冷，不给查看"));
                } else if (roleVo.rid == rid && roleVo.srv_id == srv_id) {
                    message(Utils.TI18N("你不认识你自己了么？"));
                } else {
                    let f_data = { rid: rid, srv_id: srv_id };
                    ChatController.getInstance().openFriendInfo(f_data, cc.v2(0, 0));
                }
            }
        }
    },

    setExtendData: function (replay_srv_id) {
        this.replay_srv_id = replay_srv_id;
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide: function () {

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete: function () {
        if(this.role_head_1){
            this.role_head_1.deleteMe();
            this.role_head_1 = null;
        }
        if(this.role_head_2){
            this.role_head_2.deleteMe();
            this.role_head_2 = null;
        }
    },
})