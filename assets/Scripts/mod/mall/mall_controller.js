// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      商城的逻辑控制层
// <br/>Create: 2018-12-18 17:12:27
// --------------------------------------------------------------------
var SceneConst = require("scene_const");
var MallEvent = require("mall_event");
var MallConst = require("mall_const");
var MainSceneController = require("mainscene_controller");
var Battle_dramaEvent = require("battle_drama_event")

var MallController = cc.Class({
    extends: BaseController,
    ctor: function () {
    },

    // 初始化配置数据
    initConfig: function () {
        var MallModel = require("mall_model");

        this.model = new MallModel();

        this.model.initConfig();

        this.is_first_login = true;
        this.temp_data = null;
    },

    // 返回当前的model
    getModel: function () {
        return this.model;
    },

    setFirstLogin: function (status) {
        this.is_first_login = status;
    },

    setExchangeBuyData: function (data) {
        this.temp_data = data
    },

    // 注册监听事件
    registerEvents: function () {
        if (this.init_role_event == null){
            this.init_role_event = gcore.GlobalEvent.bind(Battle_dramaEvent.BattleDrama_Top_Update_Data,(function(){
                gcore.GlobalEvent.unbind(this.init_role_event);
                this.init_role_event = null;
                var RoleController = require("role_controller");
                this.role_vo = RoleController.getInstance().getRoleVo();
                if(this.role_vo != null){
                    var BattleDramaController = require("battle_drama_controller");
                    var data =  BattleDramaController.getInstance().getModel().getDramaData();
                    var max_dun_id = Config.city_data.data_base[1].activate[0][1];
                    if (data.max_dun_id != null && data.max_dun_id >= max_dun_id){
                        var config = Config.exchange_data.data_shop_list[1];
                        if (config.login_red != null && Utils.next(config.login_red) != null){
                            this.sender13401(1);
                        }
                    }
                }
            }).bind(this))
        }
    },

    // 注册协议接受事件
    registerProtocals: function () {
        this.RegisterProtocal(13401, this.handle13401);             //商城进入数据请求
        this.RegisterProtocal(13402, this.handle13402);             //普通商店购买
        this.RegisterProtocal(13403, this.handle13403);             //神秘商店请求
        this.RegisterProtocal(13404, this.handle13404);             //服务端推送神秘商店可以刷新
        this.RegisterProtocal(13405, this.handle13405);             //神秘商城刷新列表

        this.RegisterProtocal(13407, this.handle13407);             //神秘商店购买
        this.RegisterProtocal(13419, this.handle13419);
        this.RegisterProtocal(13420, this.handle13420);             //商店刷新状态

        //活动商城 协议
        this.RegisterProtocal(16660, this.handle16660);             //商店刷新状态
        this.RegisterProtocal(16661, this.handle16661);             //购买道具协议
    },

    // 打开商城主界面
    //bid 需求的物品bid
    openMallPanel: function (bool, name, bid) {
        if (bool == true) {
            require("hero_controller").getInstance().openHeroTalentSkillLearnPanel(false);  //特殊 处理
            var build_vo = MainSceneController.getInstance().getBuildVo(SceneConst.CenterSceneBuild.shop);
            if (build_vo != null && build_vo.is_lock == true) {
                message(build_vo.desc);
                return
            }
            if (this.mall_panel == null) {
                var MallWindow = require("mall_window");
                this.mall_panel = new MallWindow();
            }
            name = name || MallConst.MallType.GodShop;
            this.need_bid = bid;
            this.mall_panel.open(name);
        } else {
            if (this.mall_panel) {
                this.mall_panel.close();
                this.mall_panel = null;
            }
        }
    },

    //引导需要
    getMallRoot: function () {
        if (this.mall_panel)
            return this.mall_panel.root_wnd
    },
    getMallView:function(){
        if (this.mall_panel){
            return this.mall_panel
        }
    },
    getNeedBid: function () {
        return this.need_bid
    },

    //设置需求的物品bid (给不在商城建筑里的商城类型设置
    setNeedBid: function (bid) {
        this.need_bid = bid
    },


    //打开商店主界面
    openMallMainWindow : function(bool){
      if(bool){
          if(!this.shopMainView){
              var MallMainWindow = require("mall_main_window");
              this.MallMainWindow = new MallMainWindow();
          }
          this.MallMainWindow.open();
      }else{
          if(this.MallMainWindow){
              this.MallMainWindow.close();
              this.MallMainWindow = null;
          }
      }
   },

    //打开商城批量购买界面
    openMallBuyWindow: function (bool, data) {
        if (bool == true) {
            if (data != null) {
                if (data.shop_type == MallConst.MallType.Recovery || data.shop_type == MallConst.MallType.ActionShop) {
                    if (this.mall_buy_win == null) {
                        var MallBuyWindow = require("mall_buy_window");
                        this.mall_buy_win = new MallBuyWindow();
                    }
                    this.mall_buy_win.open();
                    this.mall_buy_win.setData(data);
                } else {
                    var price_val = 0;
                    if (data.discount != null && data.discount > 0) {
                        price_val = data.discount;
                    } else {
                        price_val = data.price;
                    }
                    var is_can_buy_num = this.model.checkMoenyByType(data.pay_type, price_val);
                    if (is_can_buy_num <= 0) {
                        var pay_config = null;
                        if (typeof (data.pay_type) == "number") {
                            pay_config = Utils.getItemConfig(data.pay_type);
                        } else {
                            pay_config = Utils.getItemConfig(gdata("item_data", "data_assets_label2id", [data.pay_type]));
                        }
                        if (pay_config != null) {
                            if (pay_config.id == gdata("item_data", "data_assets_label2id", "gold") || pay_config.id == gdata("item_data", "data_assets_label2id", "red_gold_or_gold")) {
                                if(IS_SHOW_CHARGE == false){
                                    message(Utils.TI18N("钻石不足"));
                                }else{
                                    var fun = function(){
                                        require("vip_controller").getInstance().openVipMainWindow(true, VIPTABCONST.CHARGE)
                                    }
                                    var str = cc.js.formatStr(Utils.TI18N("%s不足，是否前往充值"),pay_config.name);
                                    var CommonAlert = require("commonalert")
                                    CommonAlert.show(str, Utils.TI18N('确定'), fun, Utils.TI18N('取消'), null, 2, null, null, null, true)
                                }
                            } else {
                                require("backpack_controller").getInstance().openTipsSource(true, pay_config.id)
                            }
                        }
                    } else {
                        if (this.mall_buy_win == null) {
                            var MallBuyWindow = require("mall_buy_window");
                            this.mall_buy_win = new MallBuyWindow();
                        }
                        this.mall_buy_win.open();
                        this.mall_buy_win.setData(data);
                    }
                }
            }
        }else{
            if (this.mall_buy_win != null) {
                this.mall_buy_win.close();
                this.mall_buy_win = null;
            }
        }
    },

    //热卖商城的礼包查看界面
    openMallGiftPanel: function (bool, data) {
        if (bool == true) {
            if (this.mall_gift_panel == null) {
                this.mall_gift_panel = new MallGiftPanel();
            }
            this.mall_gift_panel.open(data);
        } else {
            if (this.mall_gift_panel) {
                this.mall_gift_panel.close();
                this.mall_gift_panel = null;
            }
        }
    },



    //----------------协议处理--------------
    //
    sender13401: function (type) {
        var protocal = {};
        protocal.type = type;
        this.SendProtocal(13401, protocal);
    },

    handle13401: function (data) {
        var status = false;
        var index = 0;

        if (data.code == 1 && data.type == 1) {  //钻石商城
            var config = gdata("exchange_data", "data_shop_list", [1])
            if (config != null && config.login_red != null && Utils.next(config.login_red) != null) {
                var len = config.login_red.length;
                for (var k in config.login_red) {
                    var v = config.login_red[k];
                    var id = v[1];
                    var num = v[2];
                    if (data.item_list != null && Utils.next(data.item_list) != null) {
                        for (var a in data.item_list) {
                            var j = data.item_list[a];
                            if (id == j.item_id && j.ext[0].val < num) {
                                status = true;
                                break
                            } else if (id == j.item_id && j.ext[0].val >= nul) {
                                index = index + 1;
                            }
                        }
                    } else {  //都没有买
                        status = true;
                    }
                }
                if (index == len)
                    status = false;
                else
                    status = true;
            }
        }

        MainSceneController.getInstance().setBuildRedStatus(SceneConst.CenterSceneBuild.shop, status && this.is_first_login)
        require("mall_controller").getInstance().getModel().setMallMainRedPointData(require("mall_const").MallFunc.Mall,status && this.is_first_login);
        gcore.GlobalEvent.fire(MallEvent.Open_View_Event, data);
    },

    sender13402: function (eid, num) {
        var protocal = {};
        protocal.eid = eid;
        protocal.num = num;
        this.SendProtocal(13402, protocal);
    },


    //
    handle13402: function (data) {
        message(data.msg);
        if (data.code == 1) {
            gcore.GlobalEvent.fire(MallEvent.Buy_Success_Event, data);
        }
    },

    //神秘商店请求
    sender13403: function (type) {
        var protocal = {};
        protocal.type = type;
        this.SendProtocal(13403, protocal);
    },

    //
    handle13403: function (data) {
        message(data.msg);
        gcore.GlobalEvent.fire(MallEvent.Get_Buy_list, data);
        var data = MainSceneController.getInstance().getBuildVo(10);
        this.model.setMallMainRedPointData((MallConst.MallFunc.VarietyStore,data.free_count >= 5)&&data.is_lock);
    },

    //服务端推送神秘商店可以刷新
    handle13404: function (data) {
        gcore.GlobalEvent.fire(MallEvent.Frash_tips_event);
    },

    //刷新列表
    sender13405: function (type) {
        var protocal = {};
        protocal.type = type;
        this.SendProtocal(13405, protocal);
    },

    // 
    handle13405: function (data) {
        message(data.msg)
        if (data.code == 1) {
            gcore.GlobalEvent.fire(MallEvent.Get_Buy_list, data);
            var data = MainSceneController.getInstance().getBuildVo(10);
            this.model.setMallMainRedPointData((MallConst.MallFunc.VarietyStore,data.free_count >= 5)&&data.is_lock);
        }
    },

    //神秘商店购买
    sender13407: function (order, type, buy_type,data) {
        var protocal = {};
        protocal.order = order;
        protocal.type = type;
        protocal.buy_type = buy_type;
        this.SendProtocal(13407, protocal);
        this.order = data;
    },


    handle13407: function (data) {
        message(data.msg)
        if (data.code == 1) {
            gcore.GlobalEvent.fire(MallEvent.Buy_One_Success, data,this.order);
        }else{
            if(this.order){
                require("backpack_controller").getInstance().openTipsSource(true, this.order.item_id)

            }
        }
    },

    send13419: function (num) {
        var protocal = {};
        protocal.num = num
        this.SendProtocal(13419, protocal);
    },

    handle13419: function (data) {
        message(data.msg)
        if (data.code == 1) {
            if (this.temp_data != null) {
                this.sender13407(this.temp_data.order, this.temp_data.shop_type, 1);
                this.temp_data = null;
            }
        }
    },

    
    handle13420:function( data ){
        gcore.GlobalEvent.fire(MallEvent.Free_Refresh_Data, data);
    },

    // ----------------------------杂货店相关----------------------------
    //  打开杂货店界面
    openVarietyStoreWindows:function( status ){
        if(status == true){
            if(this.variety_store_view == null){
                this.variety_store_view = Utils.createClass("variety_store_window",this);
            }
            if(this.variety_store_view && this.variety_store_view.isOpen() == false){
                this.variety_store_view.open();
            }
            
        }else{
            if(this.variety_store_view){
                this.variety_store_view.close();
                this.variety_store_view = null;
            }
        }
    },

    // --打开活动商城
    // --@ bid 活动对应的bid 不传默认打开 第一个
    openMallActionWindow(bool, bid){
        if (bool == true){
            if (!this.mall_action_window){
                let MallActionWindow = require("mall_action_window")
                this.mall_action_window =  new MallActionWindow()
            }
            this.mall_action_window.open(bid)
        }else{
            if (this.mall_action_window){ 
                this.mall_action_window.close()
                this.mall_action_window = null
            }
        }
    },
    // ----------------------------------活动商城协议------------------------------------------
    send16660(){
        let protocal = {}
        this.SendProtocal(16660,protocal)
    },
    handle16660(data){
        message(data.msg)
        gcore.GlobalEvent.fire(MallEvent.Update_Action_event,data)
    },
    handle16661(data){
        message(data.msg)
        if (data.code == 1){
            gcore.GlobalEvent.fire(MallEvent.Buy_Action_Shop_Success_event,data)
        }
    },
    // --{uint32, aim, "商品id"},
    // --{uint32, num, "购买数量"}
    send16661(bid, aim, num){
        let protocal = {}
        protocal.bid = bid
        protocal.aim = aim
        protocal.num = num
        this.SendProtocal(16661,protocal)
    },

    __delete: function () {
        if (this.model != null) {
            this.model.DeleteMe();
            this.model = null;
        }
    },

    getVarietyStoreRoot: function(finish_cb) {
        if (finish_cb) {
            if (this.variety_store_view) {
                this.variety_store_view.getRootWnd(finish_cb);
            } else {
                finish_cb(null);
            }
        } else {
            if (this.variety_store_view)
                return this.variety_store_view.root_wnd;
        }
    },
});

module.exports = MallController;