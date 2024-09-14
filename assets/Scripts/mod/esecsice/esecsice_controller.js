// --------------------------------------------------------------------
// @author: whjing2012@syg.com(必填, 创建模块的人员)
// @description:
//      这里填写详细说明,主要填写该模块的功能简要
// <br/>Create: 2019-01-07 15:18:54
// --------------------------------------------------------------------
var EsecsiceConst = require("esecsice_const");

var EsecsiceController = cc.Class({
    extends: BaseController,
    ctor: function () {
    },

    // 初始化配置数据
    initConfig: function () {
        var EsecsiceModel = require("esecsice_model");

        this.model = new EsecsiceModel();
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
    },

    // openesecsiceMainView : function(bool){
    //     if(bool){
    //         if(!this.esecsiceMainView){
    //             var EsecsiceWindow = require("esecsice_window");
    //             this.esecsiceMainView = new EsecsiceWindow();
    //         }
    //         this.esecsiceMainView.open();
    //     }else{
    //         if(this.esecsiceMainView){
    //             this.esecsiceMainView.close();
    //             this.esecsiceMainView = null;
    //         }
    //     }
    // },
    openEsecsiceMainView : function(bool){
        if(bool){
            if(!this.esecsiceMainView){
                var EsecsiceMainWindow = require("esecsice_main_window");
                this.esecsiceMainView = new EsecsiceMainWindow();
            }
            this.esecsiceMainView.open();
        }else{
            if(this.esecsiceMainView){
                this.esecsiceMainView.close();
                this.esecsiceMainView = null;
            }
        }
    },
    switchEcecsiceActivityView(type){
        Log.info("====>>>", type);
        if(type == EsecsiceConst.execsice_index.endless){
            require("mainui_controller").getInstance().requestOpenBattleRelevanceWindow(require("battle_const").Fight_Type.Endless);
        }else if(type == EsecsiceConst.execsice_index.stonedungeon){
            require("mainui_controller").getInstance().requestOpenBattleRelevanceWindow(require("battle_const").Fight_Type.DungeonStone);
        }else if(type == EsecsiceConst.execsice_index.heroexpedit){
            require("mainui_controller").getInstance().requestOpenBattleRelevanceWindow(require("battle_const").Fight_Type.ExpeditFight);
        }else if(type == EsecsiceConst.execsice_index.honourfane){//荣耀神殿玩法
            require("mainui_controller").getInstance().requestOpenBattleRelevanceWindow(require("battle_const").Fight_Type.PrimusWar);
        }
    },

    getEsecsiceRoot: function(finish_cb) {
        if (!finish_cb) {
            if (this.esecsiceMainView)
                return this.esecsiceMainView.root_wnd;
        } else {
            if (this.esecsiceMainView) {
                this.esecsiceMainView.getRootWnd(finish_cb);
            } else {
                finish_cb(null);
            }
        }
    },
});

module.exports = EsecsiceController;
