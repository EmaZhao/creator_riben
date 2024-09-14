// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-04-26 16:06:14
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var ArenaConst = require("arena_const");
var RoleHeadItem = require("role_head_item");
var PlayerHead = require("playerhead");
var BattleController = require("battle_controller");
var FriendController = require("friend_controller");
var ArenaController = require("arena_controller");

var Arena_champion_my_guess_itemPanel = cc.Class({
    extends: BasePanel,
    ctor: function() {
        this.prefabPath = PathTool.getPrefabPath("arena", "arena_champion_my_guess_item");
    },

    // 可以初始化声明一些变量的
    initConfig: function() {

    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel: function() {
        this.left_role_nd = this.seekChild("left_role");
        this.right_role_nd = this.seekChild("right_role");
        this.left_name_lb = this.seekChild("left_name", cc.Label);
        this.right_name_lb = this.seekChild("right_name", cc.Label);
        this.success_img_nd = this.seekChild("success_img");

        this.match_step_lb = this.seekChild("match_step", cc.Label);
        this.result_label_lb = this.seekChild("result_label", cc.Label);
        this.role_name_nd = this.seekChild("role_name");
        this.role_name_lb = this.seekChild("role_name", cc.Label);

        this.assets_img_sp = this.seekChild("assets_img", cc.Sprite);
        this.assets_value_lb = this.seekChild("assets_value", cc.Label);
        this.assets_value_nd = this.seekChild("assets_value");
        this.assets_container_nd = this.seekChild("assets_container");

        this.info_btn_nd = this.seekChild("info_btn");
        this.check_fight_btn_nd = this.seekChild("check_fight_btn");

        this.match_step_lb = this.seekChild("match_step", cc.Label);

        this.role_name_y = this.role_name_nd.y;
        this.assets_y = this.assets_container_nd.y;
        this.left_success_x = -268;
        this.right_success_x = -107;

        this.left_head = new PlayerHead();
        this.left_head.setParent(this.left_role_nd);
        this.left_head.show();

        this.right_head = new PlayerHead();
        this.right_head.setParent(this.right_role_nd);
        this.right_head.show();

        this.info_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickInfoBtn, this);
        this.check_fight_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickCheckFightBtn, this);
        this.left_role_nd.on(cc.Node.EventType.TOUCH_END, this.onClickLeftRole, this);
        this.right_role_nd.on(cc.Node.EventType.TOUCH_END, this.onClickRightRole, this);
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function() {

    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow: function(params) {
        if (this.data)
            this.updateWidgets();
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide: function() {

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete: function() {

    },

    setData: function(data) {
        this.data = data;
        if (this.root_wnd)
            this.updateWidgets();
    },

    updateWidgets: function() {
        if (this.data.ret == 0) { // 正在进行中
            this.success_img_nd.active = false;
            this.info_btn_nd.active = false;
            this.check_fight_btn_nd.active = false;
            this.role_name_nd.active = true;
            this.assets_container_nd.y = this.assets_y;
            this.result_label_lb.string = Utils.TI18N("投注:");
            var color_1 = Config.color_data.data_color16[175];
            this.assets_value_nd.color = new cc.Color().fromHEX(color_1);
            this.assets_value_lb.string = this.data.bet;
            if (this.data.target == 1) {
                this.role_name_lb.string = this.data.a_name;
            } else {
                this.role_name_lb.string = this.data.b_name;
            }
        } else {
            this.success_img_nd.active = true;
            this.info_btn_nd.active = true;
            this.check_fight_btn_nd.active = true;
            this.role_name_nd.active = false;
            this.assets_container_nd.y = this.role_name_y;
            if (this.data.target == this.data.ret) { // 这个时候是胜利的 
                this.result_label_lb.string = Utils.TI18N("得到:");
                var color_1 = Config.color_data.data_color16[202];
                this.assets_value_nd.color = new cc.Color().fromHEX(color_1);
                this.assets_value_lb.string = this.data.get_bet;
            } else {
                this.result_label_lb.string = Utils.TI18N("失去:");
                var color_1 = Config.color_data.data_color16[183];
                this.assets_value_nd.color = new cc.Color().fromHEX(color_1);
                this.assets_value_lb.string = this.data.bet;
            }

            if (this.data.ret == 1) { // 左边赢了
                this.success_img_nd.x = this.left_success_x;
            } else {
                this.success_img_nd.x = this.right_success_x;
            }
        }

        var item_res = PathTool.getItemRes(19);
        this.loadRes(item_res, function(item_sf) {
            this.assets_img_sp.spriteFrame = item_sf;
        }.bind(this));

        this.left_head.setHeadRes(this.data.a_face)
        this.right_head.setHeadRes(this.data.b_face)

        this.left_name_lb.string = this.data.a_name;
        this.right_name_lb.string = this.data.b_name;

        this.match_step_lb.string = ArenaConst.getMatchStepDesc2(this.data.step, this.data.round);
    },

    onClickInfoBtn: function() {
        ArenaController.getInstance().openArenaChampionReportWindow(true, this.data);
    },

    onClickCheckFightBtn: function() {
        if (this.data && this.data.replay_id != 0) {
            BattleController.getInstance().csRecordBattle(this.data.replay_id);
        }
    },

    onClickRightRole: function() {
        FriendController.getInstance().openFriendCheckPanel(true, { srv_id: this.data.a_srv_id, rid: this.data.a_rid });
    },

    onClickLeftRole: function() {
        FriendController.getInstance().openFriendCheckPanel(true, { srv_id: this.data.b_srv_id, rid: this.data.b_rid });
    },

})