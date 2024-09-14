// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     天梯英雄殿
// <br/>Create: 2019-07-24 16:55:47
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var LadderController = require("ladder_controller");
var LadderEvent = require("ladder_event");
var RoleEvent = require("role_event");
var RoleController = require("role_controller");
var FriendController = require("friend_controller");
var LadderConst = require("ladder_const");

var Ladder_top_threeWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("ladder", "ladder_top_three_window");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Big;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig: function () {
        this.state_list = {};
        this.ctrl = LadderController.getInstance();
        this.model = this.ctrl.getModel();
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack: function () {
        this.background = this.seekChild("background");
        this.background.scale = FIT_SCALE;
        let main_container = this.seekChild("main_container");
        let title_label = this.seekChild(main_container, "title_label", cc.Label);
        title_label.string = Utils.TI18N("英雄殿");

        let tips_label = this.seekChild(main_container, "tips_label", cc.Label);
        tips_label.string = Utils.TI18N("*每日点赞可获天梯积分奖励");

        this.close_btn = this.seekChild("close_btn");

        for (let i = 1; i <= 3; i++) {
            let statue = this.seekChild(main_container, "statue_" + i);
            let desc = statue.getChildByName("desc").getComponent(cc.Label);
            desc.string = Utils.TI18N("虚位以待");
            let state_data = {};
            state_data.model = statue.getChildByName("model");
            state_data.role_name = statue.getChildByName("role_name").getComponent(cc.Label);
            state_data.guild_name = statue.getChildByName("guild_name").getComponent(cc.Label);
            state_data.worship_btn = statue.getChildByName("worship_btn").getComponent(cc.Button);
            state_data.label = statue.getChildByName("label").getComponent(cc.Label);
            state_data.btn_check = statue.getChildByName("btn_check").getComponent(cc.Button);
            state_data.desc = desc;
            state_data.worship_num = 0;
            this.state_list[i] = state_data;
        }
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {
        Utils.onTouchEnd(this.close_btn, function () {
            this.ctrl.openLadderTopThreeWindow(false)
        }.bind(this), 2)
        Utils.onTouchEnd(this.background, function () {
            this.ctrl.openLadderTopThreeWindow(false)
        }.bind(this), 2)

        for (let i = 1; i <= 3; i++) {
            let state_data = this.state_list[i];
            if (state_data && state_data.worship_btn) {
                state_data.worship_btn.node.on("click", function () {
                    this._onClickBtnWorship(i);
                }.bind(this))
            }
            if (state_data && state_data.btn_check) {
                state_data.btn_check.node.on("click", function () {
                    this._onClickBtnCheck(i);
                }.bind(this))
            }
        }

        this.addGlobalEvent(LadderEvent.UpdateLadderTopThreeRoleData, function (data) {
            this.setData(data);
        }, this)

        this.addGlobalEvent(RoleEvent.WorshipOtherRole, function (rid, srv_id, idx) {
            if (idx != null && this.state_data[idx]) {
                let state_panel = this.state_list[idx];
                state_panel.worship_num = state_panel.worship_num + 1;
                state_panel.label.string = state_panel.worship_num;
                Utils.setGreyButton(state_panel.worship_btn);

            }
        }, this)
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd: function (params) {
        this.ctrl.requestTopThreeRoleData();
    },

    _onClickBtnWorship: function (index) {
        let data = this.getRoleDataByRank(index);
        if (data) {
            let rid = data.rid;
            let srv_id = data.srv_id;
            RoleController.getInstance().sender10316(rid, srv_id, index, WorshipType.ladder);
        }
    },

    _onClickBtnCheck: function (index) {
        let data = this.getRoleDataByRank(index);
        if (data) {
            let rid = data.rid;
            let srv_id = data.srv_id;
            FriendController.getInstance().openFriendCheckPanel(true, { srv_id: srv_id, rid: rid })
        }
    },

    setData:function(data){
        data = data || {};
        this.data = data;
        for( let i  = 1;i<= 3;i++){
            let state_panel = this.state_list[i];
            let role_data = this.getRoleDataByRank(i);
            if(role_data){
                state_panel.model.x = 5000;
                state_panel.role_name.node.x = 5000;
                state_panel.guild_name.node.x = 5000;
                state_panel.worship_btn.node.x = 5000;
                state_panel.desc.node.x = 5000;

                state_panel.role_name.string = role_data.name;
                let gname = role_data.gname;
                if(!gname || gname == ""){
                    gname = Utils.TI18N("暂无");
                }
                state_panel.guild_name.string = cc.js.formatStr(Utils.TI18N("公会:%s"),gname);
                state_panel.label.string = role_data.worship;
                state_panel.worship_num = role_data.worship;
                if(role_data.worship_status == 0){

                }
            }
        }
    },

    getRoleDataByRank:function(rank){
        this.data = this.data || {};
        let role_data = null;
        for(let k in this.data){
            let v = this.data[k];
            if(v.rank == rank){
                role_data = v;
                break
            }
        }
        return role_data
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack: function () {

        this.model.updateLadderRedStatus(LadderConst.RedType.TopThree, false)
        this.ctrl.openLadderTopThreeWindow(false)
    },
})