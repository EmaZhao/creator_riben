// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      这里填写详细说明,主要填写该模块的功能简要
// <br/>Create: 2019-03-04 21:12:18
// --------------------------------------------------------------------
var MainuiController = require("mainui_controller");
var SceneEvent = require("mainscene_event");
var LoginEvent = require("login_event");
var BattleConst = require("battle_const");
var RoleController = require("role_controller");
var RoleEvent = require("role_event");
var Endless_trailEvent = require("endless_trail_event");


var Endless_trailController = cc.Class({
    extends: BaseController,
    ctor: function () {
    },

    // 初始化配置数据
    initConfig: function () {
        var Endless_trailModel = require("endless_trail_model");

        this.model = new Endless_trailModel();
        this.model.initConfig();
        this.cache_buff_data = null;
    },

    // 返回当前的model
    getModel: function () {
        return this.model;
    },

    // 注册监听事件
    registerEvents: function () {

        if(this.init_role_event == null){
            this.init_role_event = gcore.GlobalEvent.bind(EventId.EVT_ROLE_CREATE_SUCCESS,(function(){
                gcore.GlobalEvent.unbind(this.init_role_event);
                this.init_role_event = null;
                
                // this.role_vo = RoleController.getInstance().getRoleVo();
                // if(this.role_vo!=null){
                //     this.requestInitProtocal(true);
                //     if(this.role_assets_event == null){
                //         this.role_assets_event = this.role_vo.bind(EventId.UPDATE_ROLE_ATTRIBUTE, function(key, value){
                //             if(key == "lev"){
                //                 this.requestInitProtocal();
                //             }else if(key == "open_day"){
                //                 this.requestInitProtocal();
                //             }
                //         }.bind(this))
                //     }
                // }

            }).bind(this))
        }

        if(this.battle_enter_event == null){
            this.battle_enter_event = gcore.GlobalEvent.bind(EventId.ENTER_FIGHT,(function(combat_type){
                if(combat_type == BattleConst.Fight_Type.Endless){
                    this.openEndlessBattleView(true);
                }
            }).bind(this))
        }

        //  断线重连的时候
        if(this.re_link_game_event == null){
            this.re_link_game_event = gcore.GlobalEvent.bind(LoginEvent.RE_LINK_GAME,(function(){
                this.requestInitProtocal(true);
            }).bind(this))
        }

        //  如果是竞技场退出战斗的话，并且也是存在当前请求打开竞技场面板的情况下，则打开竞技场面板
        if(this.battle_exit_event == null){
            this.battle_exit_event = gcore.GlobalEvent.bind(EventId.EXIT_FIGHT,(function(combat_type){
                this.openEndlessBattleView(false);
                if(combat_type == BattleConst.Fight_Type.Endless){
                    this.openEndlessBuffView(false);
                }
            }).bind(this))
        }


    },

    // 注册协议接受事件
    registerProtocals: function () {
        this.RegisterProtocal(23900, this.handle23900) // 基础信息
        this.RegisterProtocal(23901, this.handle23901) // 挑战无尽
        this.RegisterProtocal(23902, this.handle23902) //战斗界面信息
        this.RegisterProtocal(23903, this.handle23903) //首通奖励展示
        this.RegisterProtocal(23904, this.handle23904) //领取奖励通关奖励
        this.RegisterProtocal(23905, this.handle23905) //已派出伙伴信息
        this.RegisterProtocal(23906, this.handle23906) //领取奖励通关奖励
        this.RegisterProtocal(23907, this.handle23907) //可雇佣伙伴列表信息
        this.RegisterProtocal(23908, this.handle23908) //派出伙伴
        this.RegisterProtocal(23909, this.handle23909) //雇佣伙伴
        this.RegisterProtocal(23910, this.handle23910) //Buff列表
        this.RegisterProtocal(23911, this.handle23911) //选择Buff
    },

    checkIsOpen:function(show_desc){
        var open_config = Config.endless_data.data_const.open_lev;
        if(open_config == null)return false;
        var is_open = MainuiController.getInstance().checkIsOpenByActivate(open_config.val);
        if(show_desc == true && is_open == false){
            message(open_config.desc)
        }
        return is_open
    },

    requestInitProtocal:function(force){
        var is_open = this.checkIsOpen();
        if(is_open == true){
            this.send23900();
            this.send23903();
            this.send23906();
            if(this.role_assets_event){
                this.role_vo.unbind(this.role_assets_event)
                this.role_assets_event = null;
            }
        }
    },

    // 协议相关
    send23900:function(formation_type, pos_info){
        var protocol = {};
        this.SendProtocal(23900, protocol);
    },

    handle23900:function(data){
        if(data){
            this.model.setEndlessData(data);
        }
    },

    send23901:function(formation_type, pos_info, hallows_id){
        var protocol = {};
        protocol.formation_type = formation_type;
        protocol.pos_info = pos_info;
        protocol.hallows_id = hallows_id;
        this.SendProtocal(23901,protocol);
    },

    handle23901:function(data){
        message(data.msg)
    },
    
    send23902:function(){
        var protocol = {};
        this.SendProtocal(23902,protocol);
    },

    handle23902:function(data){
        this.model.setEndlessBattleData(data)
    },

    send23903:function(){
        var protocol = {};
        this.SendProtocal(23903, protocol);
    },

    handle23903:function(data){
        if(data){
            this.model.setFirstData(data);
        }
    },

    send23904:function(id){
        var protocol = {};
        protocol.id = id;
        this.SendProtocal(23904, protocol);
    },

    handle23904:function(data){
        message(data.msg);
        if(data.code == 1){
            this.openEndlessRewardTips(false);
        }
    },

    send23905:function(){
        var protocol = {};
        this.SendProtocal(23905, protocol);
    },

    handle23905:function(data){
        if(data){
            this.model.setSendPartnerData(data);
        }
    },

    send23906:function(){
        var protocol = {};
        this.SendProtocal(23906, protocol)
    },

    handle23906:function(data){
        if(data){
            this.model.setHasHirePartnerData(data);
        }
    },

    send23907:function(){
        var protocol = {};
        this.SendProtocal(23907, protocol);
    },

    handle23907:function(data){
        if(data){
            this.model.setHirePartnerData(data);
        }
    },

    send23908:function(id){
        var protocol = {};
        protocol.id = id;
        this.SendProtocal(23908, protocol)
    },

    handle23908:function(data){
        message(data.msg)
        if(data.code == 1){
            gcore.GlobalEvent.fire(Endless_trailEvent.UPDATA_SENDPARTNER_SUCESS_DATA, data);
        }
    },

    send23909:function(rid,srv_id,id,flag){
        var protocol = {};
        protocol.id = id;
        protocol.rid = rid;
        protocol.srv_id = srv_id;
        protocol.flag = flag;
        this.SendProtocal(23909, protocol);
    },

    handle23909:function(data){
        message(data.msg)
    },
    
    send23910:function(){
        var protocol = {};
        this.SendProtocal(23910, protocol);
    },

    handle23910:function(data){
        cc.log("buff信息",data.end_time -gcore.SmartSocket.getTime())
        if(data){
            var is_open = false;
            if(MainuiController.getInstance().checkIsInEndlessUIFight()){
                this.openEndlessBuffView(true,data);
                is_open = true
            }
            if(!is_open){
                this.cache_buff_data = data;
            }
        }
    },

    send23911:function(buff_id){
        var protocol = {};
        protocol.buff_id = buff_id;
        this.SendProtocal(23911, protocol);
    },

    handle23911:function(data){
        message(data.msg);
        this.cache_buff_data = null
        if(data.code == 1){
            this.openEndlessBuffView(false);
            // 成功选择一个buff之后,也要移除掉提示
            var PromptController = require("prompt_controller")
            var PromptTypeConst = require("prompt_type_const")
            PromptController.getInstance().getModel().removePromptDataByTpye(PromptTypeConst.Endless_trail)
        }
    },

    // --打开界面相关--
    // 打开主界面
    openEndlessMainWindow:function(status){
        if(status == true){
            if(this.checkIsOpen(true) == false){
                return;
            }
            if(!this.endless_main_window){
                this.endless_main_window = Utils.createClass("endless_trail_main_window",this);
            }

            this.model.getFirstKindList()
            this.model.getFiveKindList()
            this.model.getRankKindList()

            if(this.endless_main_window && this.endless_main_window.isOpen() == false){
                this.endless_main_window.open();
            }

        }else{
            if(this.endless_main_window){
                this.endless_main_window.close();
                this.endless_main_window = null;
            }
        }
    },

    // 战斗界面
    openEndlessBattleView:function(status){
        if(status == true){
            if(!this.endless_battle_view){
                this.endless_battle_view = Utils.createClass("endless_trail_battle_window",this);
            }
            if(this.endless_battle_view && this.endless_battle_view.isOpen() == false){
                if(this.endless_battle_view && this.endless_battle_view.isOpen() == false){
                    this.endless_battle_view.open();
                }
                if(this.cache_buff_data){//判断是否存在协议
                    this.openEndlessBuffView(true, this.cache_buff_data)
                    this.cache_buff_data = null
                }
            }
        }else{
            if(this.endless_battle_view){
                this.endless_battle_view.close();
                this.endless_battle_view = null;
            }
        }
    },

    // buff界面
    openEndlessBuffView:function(status,data,is_force){
        if(status == true){
            if(!this.endless_buff_window){
                this.endless_buff_window = Utils.createClass("endless_trail_buff_window",this);
            }
            data = data || this.cache_buff_data // 可能在外面就调用这个时候直接用缓存的buff吧
            if(data == null)return;
            if(this.endless_buff_window && this.endless_buff_window.isOpen() == false){
                this.endless_buff_window.open(data);
            }
            // 移除掉缓存的,因为可能在外面点击去.这个时候不移除掉再进入战斗的时候会又一次打开
            this.cache_buff_data = null;
        }else{
            if(this.endless_buff_window){
                if(is_force){  // 引导中强制关闭界面，这时重新取出buff数据缓存
                    this.cache_buff_data = this.endless_buff_window.getData()
                }
                this.endless_buff_window.close();
                this.endless_buff_window = null;
            }
        }
    },

    // 排行榜界面
    openEndlessRankView:function(status){
        if(status == true){
            if(!this.endless_rank_window){
                this.endless_rank_window = Utils.createClass("endless_rank_window",this);
            }
            if(this.endless_rank_window && this.endless_rank_window.isOpen() == false){
                this.endless_rank_window.open();
            }
        }else{
            if(this.endless_rank_window){
                this.endless_rank_window.close();
                this.endless_rank_window = null;
            }
        }
    },

    // 支援界面
    openEndlessFriendHelpView:function(status){
        if(status == true){
            if(!this.endless_friendhelp_window){
                this.endless_friendhelp_window = Utils.createClass("endless_friend_help_window",this);
            }
            if(this.endless_friendhelp_window && this.endless_friendhelp_window.isOpen() == false){
                this.endless_friendhelp_window.open();
            }

        }else{
            if(this.endless_friendhelp_window){
                this.endless_friendhelp_window.close();
                this.endless_friendhelp_window = null;
            }
        }
    },

    // 奖励详情一览
    openEndlessRewardWindow:function(status){
        if(status == true){
            if(!this.endless_reward_window){
                this.endless_reward_window = Utils.createClass("endless_reward_window",this);
            }
            if(this.endless_reward_window && this.endless_reward_window.isOpen() == false){
                this.endless_reward_window.open();
            }
        }else{
            if(this.endless_reward_window){
                this.endless_reward_window.close();
                this.endless_reward_window = null;
            }
        }
    },

    // 战斗领取
    openEndlessRewardTips:function(status,id){
        if(status == true){
            if(!this.endless_reward_tips){
                this.endless_reward_tips = Utils.createClass("endlesstrail_awards_tips_window",this);
            }
            if(this.endless_reward_tips && this.endless_reward_tips.isOpen() == false){
                this.endless_reward_tips.open(id);
            }
        }else{
            if(this.endless_reward_tips){
                this.endless_reward_tips.close();
                this.endless_reward_tips = null;
            }
        }
    },

    __delete: function () {
        if (this.model != null) {
            this.model.DeleteMe();
            this.model = null;
        }
    }

});

module.exports = Endless_trailController;