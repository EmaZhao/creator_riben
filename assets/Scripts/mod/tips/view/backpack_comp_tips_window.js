// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-04-12 10:00:15
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var BackpackController = require("backpack_controller");

var Backpack_comp_tipsWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("tips", "backpack_comp_tips");
        this.viewTag = SCENE_TAG.msg;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Tips;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        this.background = this.root_wnd.getChildByName("background");
        if(window.IS_PC){
          if(this.background.getComponent(cc.StudioWidget)) this.background.getComponent(cc.StudioWidget).enabled = false;
          this.background.setContentSize(2200,1280);
        }
        this.main_panel = this.root_wnd.getChildByName("main_panel");
        this.text_name = this.main_panel.getChildByName("text_name").getComponent(cc.Label);
        this.get_path = this.main_panel.getChildByName("get_path");
        this.get_path.active = false;
        var text_2 = this.get_path.getChildByName("Text_2").getComponent(cc.Label);
        text_2.string = Utils.TI18N("获取途径");
        
        this.goto_btn = this.get_path.getChildByName("goto");
        this.text_desc = this.main_panel.getChildByName("text_desc").getComponent(cc.Label);
    
        this.com_btn = this.main_panel.getChildByName("com_btn");
        this.com_btn.active = false;

        this.info_btn = this.main_panel.getChildByName("info_btn");
        this.info_btn.active = false;
        
        this.goods_item = ItemsPool.getInstance().getItem("backpack_item");
        this.goods_item.initConfig(true,1,false);
        this.goods_item.setPosition(-this.main_panel.width/2+113,258-this.main_panel.height/2);
        this.goods_item.setParent(this.main_panel);
        this.goods_item.show();

        Utils.getNodeCompByPath("main_panel/com_btn/Text_1", this.root_wnd, cc.Label).string = Utils.TI18N("合成");
        Utils.getNodeCompByPath("main_panel/info_btn/Text_3", this.root_wnd, cc.Label).string = Utils.TI18N("详情");
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        Utils.onTouchEnd(this.background, function () {
            this.ctrl.showBackPackCompTips(false);
        }.bind(this), 2);

        Utils.onTouchEnd(this.goto_btn, function () {
            if(this.item_config){
                var BackpackController = require("backpack_controller");
                BackpackController.getInstance().openTipsSource(true, this.item_config.id);
                this.ctrl.showBackPackCompTips(false);
            }
        }.bind(this), 1);
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(item_bid){
        if(!item_bid)return;
        var config = Utils.getItemConfig(item_bid);
    
        var btn_num = 1;
        if(Config.partner_data.data_get_compound_info[config.id]){
            var random = Config.partner_data.data_get_compound_info[config.id].is_random;
            if(random == 1){
                btn_num = 2;
                this.get_path.active = false;
            }else{
                this.get_path.active = true;
            }
        }else{
            // 符文
            var hallows_data = BackpackController.getInstance().getModel().getHallowsCompData(config.id);;
            if(hallows_data){
                this.get_path.active = true;
            }
        }

        this.item_config = config;
        this.showBtn(btn_num);
        this.setBaseInfo();
    },

    // 显示按钮个数
    showBtn:function(num){
        var pos = 0;
        if(num > 1){
            pos = 0 + 120;
        }
        
        this.com_btn.active = true;
        this.com_btn.x = pos;
        Utils.onTouchEnd(this.com_btn, function () {
            var item_data = BackpackController.getInstance().getModel().getBackPackItemNumByBid(this.item_config.id);
            var num = 1;
            var status = false;
            var product_id;
            if(Config.partner_data.data_get_compound_info[this.item_config.id]){
                product_id = this.item_config.id;
                var comp_num = Config.partner_data.data_get_compound_info[this.item_config.id].num;
                num = Math.floor(item_data/comp_num);
                status = true;
            }else{
                var hallows_data = BackpackController.getInstance().getModel().getHallowsCompData(this.item_config.id);
                product_id = hallows_data.bid;
                num = Math.floor(item_data/hallows_data.num);
            }
            if(num >= 2){
                if(status == true){
                    var TipsController = require("tips_controller")
                    TipsController.getInstance().showCompChooseTips(true,this.item_config.id);
                }else{
                    BackpackController.getInstance().sender10523(product_id, 1);
                }
            }else{
                if(num != 0){
                    if(status == true){
                        BackpackController.getInstance().sender11008(this.item_config.id, 1);
                    }else{
                        BackpackController.getInstance().sender10523(product_id, 1);
                    }
                }else{
                    message(Utils.TI18N("数量不足"));
                }
            }
        }.bind(this), 1);

        if(num == 2){
            this.info_btn.active = true;
            this.info_btn.x = 120-this.main_panel.getContentSize().width/2;
            Utils.onTouchEnd(this.info_btn, function () {
                if(this.item_config.effect && this.item_config.effect[0].val && this.item_config.eqm_jie){
                    this.ctrl.showBackPackCompTips(false);
                    var HeroController = require("hero_controller");
                    HeroController.getInstance().openHeroInfoWindowByBidStar(this.item_config.effect[0].val, this.item_config.eqm_jie);
                }
            }.bind(this), 1);
        }
    },

    setBaseInfo:function(){
        if(this.item_config == null)return;
        this.goods_item.setData(this.item_config.id);
        this.text_name.string = this.item_config.name;
        this.text_desc.string = this.item_config.use_desc;
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        if(this.goods_item){
            this.goods_item.deleteMe();
        }
        this.goods_item = null;
        
        var GuideEvent = require("guide_event");
        gcore.GlobalEvent.fire(GuideEvent.CloseTaskEffect);
        this.ctrl.showBackPackCompTips(false);
    },
})