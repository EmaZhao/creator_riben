// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     杂货店商品 item
// <br/>Create: 2019-03-10 10:18:59
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var MallController = require("mall_controller");
var MallEvent = require("mall_event");
var MallConst = require("mall_const");
var GuideController = require("guide_controller");
var RoleController = require("role_controller")
var BackpackController = require("backpack_controller");
var CommonAlert = require("commonalert");
var VipController = require("vip_controller");
var BackPackConst = require("backpack_const");

var Variety_store_itemPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("mall", "varietystore_item");
        this.ctrl = MallController.getInstance();
        this.model = MallController.getInstance().getModel();
    },

    // 可以初始化声明一些变量的
    initConfig:function(){
        this.size = cc.size(158, 214);
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel:function(){
        var container = this.root_wnd.getChildByName("container");
        this.container = container
        this.image_bg_nd = container.getChildByName("image_bg");
    
        // this.image_bg = container.getChildByName("image_bg");
        this.pos_node = container.getChildByName("pos_node");
        this.image_zhe = container.getChildByName("image_zhe");
        this.image_zhe.active = false;
        this.zhe_label = this.image_zhe.getChildByName("zhe_label").getComponent(cc.Label);
        this.image_buy = container.getChildByName("image_buy");
        this.image_buy.active = false;

        this.price_img = this.container.getChildByName("price_img").getComponent(cc.Sprite);
        if(this.data){
            this.updateInfo();
        }
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        // Utils.onTouchEnd(this.container, function () {
        //     if(this.data && this.data.has_buy && this.data.limit_count && this.data.has_buy >= this.data.limit_count){
        //         message(Utils.TI18N("该商品已售罄"));
        //         return;
        //     }
        //     this._onClickItem();
        // }.bind(this), 1);

        // Utils.onTouchEnd(this.image_bg, function () {
        //     if(this.data && this.data.has_buy && this.data.limit_count && this.data.has_buy >= this.data.limit_count){
        //         message(Utils.TI18N("该商品已售罄"));
        //         return;
        //     }
        //     this._onClickItem();
        // }.bind(this), 1);

        Utils.onTouchEnd(this.image_bg_nd, function () {
            if(this.data && this.data.has_buy && this.data.limit_count && this.data.has_buy >= this.data.limit_count){
                message(Utils.TI18N("该商品已售罄"));
                return;
            }
            this._onClickItem();
        }.bind(this), 1);        

        // 商店数据
        this.addGlobalEvent(MallEvent.Buy_One_Success,function(data,itemData){
            if(this.data && this.data.order && data.order == this.data.order){
                if(itemData && itemData.item_id != this.data.item_id)return;
                
                this.data.has_buy = this.data.has_buy + 1;
                if(this.data.limit_count && this.data.has_buy >= this.data.limit_count){
                    this.showSellOutStatus(true);
                }
            }
        }.bind(this));
    },

    _onClickItem:function(  ){
        if(this.data && this.data.order){
            // 引导中则直接购买，无需弹出确认窗口
            if (GuideController.getInstance().isInGuide()) {
                this.ctrl.sender13407(this.data.order, MallConst.MallType.VarietyShop, 1,this.data)
            } else {
                this.showAlert(this.data);
            }
        }
    },

    showAlert:function(data){
        if(!data)return;
        // 购买实际价格
        var cost = data.price;
        if(data.discount != 0){
            cost = data.discount;
        }
        var role_vo = RoleController.getInstance().getRoleVo();
        if(!role_vo)return;
        var cur_num = BackpackController.getInstance().getModel().getItemNumByBid(data.pay_type);
        if(cur_num >= cost){
            var item_cfg = Utils.getItemConfig(data.item_id);
            var bag_type = BackPackConst.Bag_Code.BACKPACK;
            if(item_cfg.sub_type == 1){//背包中装备类型
                bag_type = BackPackConst.Bag_Code.EQUIPS;
            }
            var num = BackpackController.getInstance().getModel().getItemNumByBid(data.item_id, bag_type);
            var tips_str = cc.js.formatStr(Utils.TI18N("是否购买<color=#289b14 fontsize= 26>%s</color>(拥有:<color=#289b14 fontsize= 26>%d</color>)？"), item_cfg.name, num)
            CommonAlert.show(tips_str, Utils.TI18N("确定"), function(){
                this.ctrl.sender13407(data.order, MallConst.MallType.VarietyShop, 1,this.data);
            }.bind(this), Utils.TI18N("取消"))           
        }else{
            var pay_config = null;
            if(typeof(data.pay_type) == "number"){
                pay_config = Utils.getItemConfig(data.pay_type);
            }else{
                pay_config = Utils.getItemConfig(Config.item_data.data_assets_label2id[data.pay_type]);
            }
            if(pay_config){
                if(pay_config.id == Config.item_data.data_assets_label2id.gold){
                    if(IS_SHOW_CHARGE == false){
                        message(Utils.TI18N("钻石不足"));
                    }else{
                        var fun = function(){
                            VipController.getInstance().openVipMainWindow(true, VIPTABCONST.CHARGE);
                        }.bind(this);
                        var str = cc.js.formatStr(Utils.TI18N('%s不足，是否前往充值？'), pay_config.name);
                        CommonAlert.show(str, Utils.TI18N("确定"), fun, Utils.TI18N("取消"));
                    }
                }else{
                    BackpackController.getInstance().openTipsSource(true, pay_config);
                }
            }
        }
    },

    updateInfo:function(){
        if(!this.root_wnd)return;

        this.image_bg_nd.name = "buy_btn_" + (parseInt(this.tmp_index) + 1);

        // --引导需要
        // if this.data.index then
        //     this.container:setName("buy_btn_" .. this.data.index)
        // end

        // 价格
        if(!this.price_label){
            this.price_label = Utils.createRichLabel(26, new cc.Color(123,41,0, 255), cc.v2(0.5, 0.5), cc.v2(15, -75),30);
            this.price_label.handleTouchEvent = false;
            this.container.addChild(this.price_label.node);
        }
        var res_bid = this.data.pay_type;
        // --[[if this.data.pay_type == 1 then --金币
        // 	res_bid = Config.ItemData.data_assets_label2id.coin
        // elseif this.data.pay_type == 2 then --钻石
        // 	res_bid = Config.ItemData.data_assets_label2id.gold
        // end--]]
        var item_config = Utils.getItemConfig(res_bid);
        if(item_config){
            var res = PathTool.getItemRes(item_config.icon)
            var price = this.data.price;
            if(this.data.discount > 0){//有折扣价格则读取折扣价格
                price = this.data.discount
            }
            var price_str = Utils.getMoneyString(price);
            this.price_label.string = price_str;

            this.loadRes(res, (function(resObject){
                this.price_img.spriteFrame = resObject;
            }).bind(this));
            
        }

        // 物品
        if(!this.item_icon){
            this.item_icon = ItemsPool.getInstance().getItem("backpack_item");
            this.item_icon.initConfig(false,1,null, true);
            this.item_icon.setParent(this.pos_node);
            this.item_icon.show();
        }
        this.item_icon.setData({ bid: this.data.item_id, num: this.data.item_num});

        if(this.data.discount >0){
            this.image_zhe.active = true;
            this.zhe_label.string = cc.js.formatStr(Utils.TI18N("%d折"), this.data.discount_type);
        }else{
            this.image_zhe.active = false;
        }
        this.data.limit_count = 1;
        if(this.data.has_buy && this.data.limit_count && this.data.has_buy >= this.data.limit_count){
            this.showSellOutStatus(true)
        }else{
            this.showSellOutStatus(false)
        }
    },

    setData:function( data ){
        if(!data)return;
        this.data = data;
        this.updateInfo();
    },
    
    showSellOutStatus:function( status ){
        if(this.item_icon){
            this.item_icon.setItemIconUnEnabled(status);
        }

        if(this.image_buy){
            this.image_buy.active = status;
        }

        if(this.container){
            // this.container.setTouchEnabled(!status);
        }
    },
    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow:function(params){

    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide:function(){

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete:function(){
        if(this.item_icon){
            this.item_icon.deleteMe();
            this.item_icon = null;
        }
        // this:removeAllChildren()
        // this:removeFromParent()
    },
})