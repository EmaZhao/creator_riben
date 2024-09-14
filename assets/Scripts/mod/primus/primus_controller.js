// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      这里填写详细说明,主要填写该模块的功能简要
// <br/>Create: 2019-03-16 10:23:00
// --------------------------------------------------------------------
var PrimusController = cc.Class({
    extends: BaseController,
    ctor: function () {
    },

    // 初始化配置数据
    initConfig: function () {
        var PrimusModel = require("primus_model");

        this.model = new PrimusModel();
        this.model.initConfig();
    },

    // 返回当前的model
    getModel: function () {
        return this.model;
    },

    // 注册监听事件
    registerEvents: function () {
    },

    // 注册协议接受事件
    registerProtocals: function () {
        // this.RegisterProtocal(1110, this.on1110);
        this.RegisterProtocal(20700, this.handle20700)     //请求玩家挑战次数
        this.RegisterProtocal(20701, this.handle20701)     //请求挑战位置信息
        this.RegisterProtocal(20702, this.handle20702)     //请求发起挑战
        this.RegisterProtocal(20703, this.handle20703)     //请求挑战记录
        this.RegisterProtocal(20705, this.handle20705)     //请求挑战结束
    },

    // 请求玩家挑战次数
    requestPrimusChallengeCount:function(){
        var protocal ={}
        this.SendProtocal(20700,protocal);
    },
    
    handle20700:function(data){
        this.model.recordChallengeCount(data);
        var PrimusEvent = require("primus_event");
        gcore.GlobalEvent.fire(PrimusEvent.Updata_Primus_RedPoint);
    },

    // 请求挑战位置信息
    sender20701:function(){
        var protocal ={}
        this.SendProtocal(20701,protocal)
    },

    handle20701:function(data){
        if(data && this.primus_main_window){
            this.primus_main_window.setData(data);
        }
    },

    // 请求发起挑战
    sender20702:function(pos, num){
        var protocal ={};
        protocal.pos = pos;
        protocal.num = num;
        this.SendProtocal(20702, protocal);
    },

    handle20702:function(data){
        message(data.msg);
        if(data.code == true){
            this.openPrimusChallengePanel(false);
        }
    },

    // 请求挑战记录
    sender20703:function(pos){
        var protocal ={};
        protocal.pos = pos;
        this.SendProtocal(20703, protocal);
    },

    handle20703:function(data){
        // -- message(data.msg)
        this.openPrimusChallengeRecordPanel(true, data);
    },

    // 战斗结果
    handle20705:function(data){
        // -- message(data.msg)
        this.openPrimusChallengeResultWindow(true, data);
    },

    //  打开荣耀神殿主角界面
    openPrimusMainWindow:function(status){
        if(status == false){
            if(this.primus_main_window != null){
                this.primus_main_window.close();
                this.primus_main_window = null;
            }
        }else{
            var controller = require("role_controller").getInstance()
            controller.openRoleInfoView(false);
            controller.openRoleDecorateView(false);
            var EsecsiceConst = require("esecsice_const");
            var open_data = Config.dailyplay_data.data_exerciseactivity[EsecsiceConst.execsice_index.honourfane];
            if(open_data == null){
                message(Utils.TI18N("星河神殿数据异常"));
                return;
            }
            var MainuiController = require("mainui_controller");
            var bool = MainuiController.getInstance().checkIsOpenByActivate(open_data.activate);
            if(bool == false){
                message(open_data.lock_desc);
                return;
            }
            this.model.is_show_redpoint = false;
            if(this.primus_main_window == null){
                this.primus_main_window = Utils.createClass("primus_main_window",this);
            }
            if(this.primus_main_window && this.primus_main_window.isOpen() == false){
                this.primus_main_window.open();
            }
            

        }
    },

    //  打开荣耀神殿挑战界面
    openPrimusChallengePanel:function(status, data, is_have_title){
        if(status == false){
            if(this.primus_challenge_panel!=null){
                this.primus_challenge_panel.close();
                this.primus_challenge_panel = null;
            }
        }else{
            if(this.primus_challenge_panel == null){
                this.primus_challenge_panel = Utils.createClass("primus_challenge_window",this);
                if(this.primus_challenge_panel && this.primus_challenge_panel.isOpen() == false){
                    this.primus_challenge_panel.open([data, is_have_title]);
                }
                
            }
            
        }
    },

    //  打开荣耀神殿挑战界面
    openPrimusChallengeRecordPanel:function(status, data){
        if(status == false){
            if(this.primus_challenge_record_panel!=null){
                this.primus_challenge_record_panel.close();
                this.primus_challenge_record_panel = null;
            }
        }else{
            if(this.primus_challenge_record_panel == null){
                this.primus_challenge_record_panel = Utils.createClass("primus_challenge_record_window",this);
            }
            if(this.primus_challenge_record_panel && this.primus_challenge_record_panel.isOpen() == false){
                this.primus_challenge_record_panel.open(data);
            }
            
        }
    },

    //  打开荣耀神殿挑战结果
    openPrimusChallengeResultWindow:function(status, data){
        if(status == false){
            if(this.primus_challenge_result_window!=null){
                this.primus_challenge_result_window.close();
                this.primus_challenge_result_window = null;
            }
        }else{
            if(this.primus_challenge_result_window == null){
                this.primus_challenge_result_window = Utils.createClass("primus_challenge_result_window",this);
            }
            if(this.primus_challenge_result_window && this.primus_challenge_result_window.isOpen() == false){
                this.primus_challenge_result_window.open(data);
            }
            
        }
    },

    //  判断是否开启星河神殿
    checkIsCanOpenPrimusWindow:function(  ){
        var RoleController = require("role_controller");
        var role_vo = RoleController.getInstance().getRoleVo();
        var lev = role_vo && role_vo.lev || 0;
        var limit_lev = Config.primus_data.data_const.open_lev.val;
        if(lev < limit_lev){
            message(cc.js.formatStr(Utils.TI18N("等级达到%s级开启\"星河神殿\"玩法"), limit_lev));
            return false;
        }
        return true;
    },

    __delete:function(){
        if(this.model!=null){
            this.model.DeleteMe();
            this.model = null;
        }
    },

});

module.exports = PrimusController;