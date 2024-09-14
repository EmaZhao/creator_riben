// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-13 11:40:16
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var ArenaEvent = require("arena_event");
var ArenaConst = require("arena_const");
var BattleController = require("battle_controller");
var PartnerConst = require("partner_const");
var HeroEvent = require("hero_event");

var ArenaChampionMyMatchPanel = cc.Class({
    extends: BasePanel,
    ctor: function() {
        this.prefabPath = PathTool.getPrefabPath("arena", "arena_champion_my_match_panel");

        this.ctrl = arguments[0];
        this.model = this.ctrl.getChamPionModel();
        this.vs_panel = null;
    },

    // 可以初始化声明一些变量的
    initConfig: function() {

    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel: function() {
        Utils.getNodeCompByPath("container/my_log_btn/label", this.root_wnd, cc.Label).string = Utils.TI18N("记录");
        this.container_nd = this.seekChild("container");
        this.notice_txt_nd = this.seekChild("notice_txt");
        this.notice_txt_lb = this.seekChild("notice_txt", cc.Label);
        // 创建英雄panel
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function() {
        // 收到保存布阵成功，重新请求一下20252我的战斗信息。
        this.addGlobalEvent(HeroEvent.Update_Save_Form, function(data) { // 冠军赛个人信息
            // if not data then return end
            // if data.type &&  data.type == PartnerConst.Fun_Form.ArenaChampion then
            //     this.is_save_form = true
            //     controller:requestMyChampionMatch()
            // end
            // sender20252
            cc.log("UUUUUUUUUUUUUUUUUU");
            cc.log(data);

            if (data && data.type == PartnerConst.Fun_Form.ArenaChampion) {
                this.ctrl.sender20252();
            }
        }.bind(this));

        this.addGlobalEvent(ArenaEvent.UpdateMyMatchInfoEvent, function(data) { // 冠军赛个人信息
            this.updateFightInfo(data);
        }.bind(this));
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow: function(params) {
        this.updateBaseInfo();
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide: function() {

    },

    onVisible: function(status) {
        if (status) {
            this.is_change_tab = true;
        }
    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete: function() {
        if (this.vs_panel) {
            this.vs_panel.deleteMe();
            this.vs_panel = null;
        }

    },

    // 设置对战数据
    updateFightInfo: function(data) {
        if (!data) return;
        if (!this.vs_panel) {
            var VsPanel = require("arena_champion_vs_panel");
            this.vs_panel = new VsPanel();
            this.vs_panel.setParent(this.container_nd);
            this.vs_panel.show();
        }

        // if self.is_change_tab == false then
        //     local base_info = model:getBaseInfo()
        //     if base_info and base_info.flag == 2 and data.replay_id ~= 0 and getNorKey(base_info.step, base_info.round) == getNorKey(data.step, data.round) then   -- 这个时候要切换观战模式
        //         BattleController:getInstance():csRecordBattle(data.replay_id) 
        //     end
        // end
        if (this.root_wnd && this.root_wnd.active && !this.is_change_tab) {
            var base_info = this.model.getBaseInfo();
            if (base_info && base_info.flag == 2 && data.replay_id != 0 && this.cur_data && !this.cur_data.replay_id) {
                var base_info_key = base_info.step + "_" + base_info.round;
                var data_key = data.step + "_" + data.round;
                if (base_info_key == data_key) {
                    BattleController.getInstance().csRecordBattle(data.replay_id);
                }
            }
        }

        this.vs_panel.updateFightInfo(data);
        this.cur_data = data;
        this.is_change_tab = false;
    },

    // 更新双方基础信信息
    updateBothSidesBaseInfo: function() {

    },

    // 主界面基础信息更新
    updateBaseInfo: function() {
        if (this.root_wnd) {
            this.updateChampionMyStepStatusInfo();
            this.ctrl.sender20252();
        }
    },

    // 显示自己是否进入到指定的阶段
    updateChampionMyStepStatusInfo: function() {
        var base_info = this.model.getBaseInfo();
        var role_info = this.model.getRoleInfo();
        if (!base_info || !role_info) return;

        // 只要排名大于32,那么就是未进入32强
        this.notice_txt_nd.active = true;
        var title_str = null;
        if (base_info.step == ArenaConst.champion_step.match_32 && role_info.rank > 32) {
            title_str = Utils.TI18N("您未进入32强");
        } else {
            if (base_info.step == ArenaConst.champion_step.match_32) {
                if (base_info.round == 2 && role_info.rank > 16) {
                    title_str = Utils.TI18N("您未进入16强");
                } else if (base_info.round == 3 && role_info.rank > 8) {
                    title_str = Utils.TI18N("您未进入8强");
                } else {
                    this.notice_txt_nd.active = false;
                }
            } else if (base_info.step == ArenaConst.champion_step.match_4) {
                if (base_info.round == 1 && role_info.rank > 4) { // 未进入4强强
                    title_str = Utils.TI18N("您未进4强赛");
                } else if (base_info.round == 2 && role_info.rank > 2) { // 未进入决赛
                    title_str = Utils.TI18N("您未进入决赛");
                } else {
                    this.notice_txt_nd.active = false;
                }
            } else {
                this.notice_txt_nd.active = false;
            }
        }

        if (title_str)
            this.notice_txt_lb.string = title_str;
    },


})