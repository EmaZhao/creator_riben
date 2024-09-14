// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      这里填写详细说明,主要填写该模块的功能简要
// <br/>Create: 2019-03-21 10:11:26
// --------------------------------------------------------------------
var SeerpalaceEvent = require("seerpalace_event")
var SeerpalaceController = cc.Class({
    extends: BaseController,
    ctor: function () {
    },

    // 初始化配置数据
    initConfig: function () {
        var SeerpalaceModel = require("seerpalace_model");
        this.model = new SeerpalaceModel();
        this.model.initConfig();
    },

    // 返回当前的model
    getModel: function () {
        return this.model;
    },

    // 注册监听事件
    registerEvents: function () {
        var self = this
        if (self.init_role_event == null){
            self.init_role_event = gcore.GlobalEvent.bind(EventId.EVT_ROLE_CREATE_SUCCESS, function(){
                gcore.GlobalEvent.unbind(self.init_role_event)
                self.init_role_event = null
                //-- 上线时请求
                // self.requestSeerpalaceChangeInfo()
            })
        }
    },

    // 注册协议接受事件
    registerProtocals: function () {
        this.RegisterProtocal(23213,this.handle23213.bind(this)); //--先知殿召唤返回
        this.RegisterProtocal(23214,this.handle23214.bind(this)); //--先知殿置换当前状态数据
        this.RegisterProtocal(23215,this.handle23215.bind(this)); //--先知殿置换结果
    },
    //打开先知界面
    openSeerpalaceMainWindow(bool,data){
        if(bool){
            let is_open = this.checkSeerpalaceIsOpen()
            if(!is_open){
                return
            }
            let SeerpalaceWindow = require("seerpalace_main_window");
            if (!this.seerpalace_window) {
                this.seerpalace_window = new SeerpalaceWindow()
            }
            this.seerpalace_window.open();
        }else{
            if(this.seerpalace_window){
                this.seerpalace_window.close();
            }
            this.seerpalace_window = null;
        }
    },
    //先知商店
    openShop(bool,data){
        if(bool){
            let shopWindow = require("seerpalace_shop_window");
            if(!this.shopWindow){
                this.shopWindow = new shopWindow()
            }
            this.shopWindow.open()
        }else{
            if(this.shopWindow){
                this.shopWindow.close();
            }
            this.shopWindow = null;   
        }
        
    },
    handle23213(data){
        if(data){
            this.model.setLastSummonGroupId(data.group_id);
            let items = [];
            for(var i in data.rewards){
                items[i] = {};
                items[i].bid = data.rewards[i].base_id;
                items[i].num = data.rewards[i].num;
            }
            var MainUiConst = require("mainui_const");
            require("mainui_controller").getInstance().openGetItemView(true, items, 0, {is_backpack: true}, MainUiConst.item_open_type.seerpalace);
        }
    },
    handle23214(data){
        this.model.setChangePartnerId(data.partner_id)
        //seerpalace_change_panel动态加载的，发射事件快，监听事件没注册 所以用不了 暂时拿model直接存
        gcore.GlobalEvent.fire(SeerpalaceEvent.Change_Role_Info_Event, data)
        // this.model.setChangeInfo(data)
    },
    handle23215(data){
        message(data.msg)
        if (data.code == 1 && this.model.getChangeFlag()) {
            gcore.GlobalEvent.fire(SeerpalaceEvent.Change_Role_Success)
            this.model.setChangeFlag(false)
        }
    },
    //-- 召唤预览
    openSeerpalacePreviewWindow( status, index ){
        var self = this
        if (status == true) {
            if (!self.seerpalace_preview){
                let SeerpalacePreviewWindow = require("seerpalace_preview_window")
                self.seerpalace_preview = new SeerpalacePreviewWindow()
            }
            if (self.seerpalace_preview.isOpen() == false ){
                self.seerpalace_preview.open(index)
            }
        }else{
            if (self.seerpalace_preview) {
                self.seerpalace_preview.close()
                self.seerpalace_preview = null
            }   
        }
    },
    requestSeerpalaceSummon( group_id ){
        let protocal = {}
        protocal.group_id = group_id
        this.SendProtocal(23213, protocal)
    },
    requestSeerpalaceChangeInfo(){
        let protocal = {}
        this.SendProtocal(23214, protocal)
    },
    // -- 请求置换英雄
    requestSeerpalaceChangeRole(partner_id, action){
        let protocal = {}
        protocal.partner_id = partner_id
        protocal.action = action
        if (action && action == 1){
            this.model.setChangeFlag(true)
        }
        this.SendProtocal(23215, protocal)
    },

    getSeerpalaceMainRoot: function() {
        if (this.seerpalace_window)
            return this.seerpalace_window.root_wnd;
    },
    
    // -- 获取先知殿是否开启
    checkSeerpalaceIsOpen( not_tips ){
        let is_open = false
        let RoleController = require("role_controller")
        let role_vo = RoleController.getInstance().getRoleVo()
        let limit_config = Config.recruit_high_data.data_seerpalace_const["common_limit"]
        if(limit_config && role_vo.lev >= limit_config.val){
            is_open = true
        }else{
            is_open = false
            if(!not_tips){
                message(cc.js.formatStr(Utils.TI18N("%d级开启先知圣殿"), limit_config.val))
            }
        }
        return is_open
    },
});

module.exports = SeerpalaceController;