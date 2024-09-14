// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     神界神秘商店事件
// <br/>Create: 2019-05-13 20:41:20
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var BackPackConst = require("backpack_const");
var CommonAlert = require("commonalert");
var AdventureEvent = require("adventure_event");

var Adventure_evt_shopWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("adventure", "adventure_evt_shop_view");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Big;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();

    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        this.data = null;
        this.config = null;
        this.is_auto_open = false;
        this.shop_item_list = {};
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        this.background = this.root_wnd.getChildByName("background");
        this.background.scale = FIT_SCALE;
        var container = this.root_wnd.getChildByName("container");
        var title_label = container.getChildByName("title_label").getComponent(cc.Label);
        title_label.string = "ミステリー商店";
        this.item_container = container.getChildByName("item_container");
        this.desc = container.getChildByName("desc").getComponent(cc.Label);
        this.desc.node.setContentSize(cc.size(330, 112));
        this.close_btn = container.getChildByName("close_btn");
        this.bigbg_55_1 = container.getChildByName("bigbg_55_1").getComponent(cc.Sprite);
        this.loadRes(PathTool.getBigBg("bigbg_55"), function (sf_obj) {
            this.bigbg_55_1.spriteFrame = sf_obj;
        }.bind(this));
        this.total_width = this.item_container.getContentSize().width;
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        Utils.onTouchEnd(this.background, function () {
            this.ctrl.openEvtViewByType(false);
            this.ctrl.openAdventureEvtShopView(false);
        }.bind(this), 2);

        Utils.onTouchEnd(this.close_btn, function () {
            this.ctrl.openEvtViewByType(false);
            this.ctrl.openAdventureEvtShopView(false);
        }.bind(this), 2);

        this.addGlobalEvent(AdventureEvent.Update_Evt_Shop_Info,function(data){
            this.updateShopItem(data.list);
        }.bind(this));

        this.addGlobalEvent(AdventureEvent.UpdateShopItemEvent,function(id){
            this.updateSingleShopItem(id);
        }.bind(this));
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(data){
        this.data = data;
        this.config = data.config;

        if(data && data.is_auto){
            this.is_auto_open = true;
            this.updateShopItem(data);
            var const_config = Config.adventure_data.data_adventure_const.businessman_description;
            if(const_config){
                this.desc.string = const_config.desc;
            }
        }else{
            if(this.config){
                this.desc.string = this.config.desc;
            }
            if(this.data){
                this.ctrl.send20620(this.data.id, AdventureEvent.AdventureEvenHandleType.requst, {});
            }
        }
    },

    updateShopItem:function(list){
        var count = list.length;
        var space = 100;
        var cell_width = 100;
        var tmp_width = count * cell_width + (count - 1) * space; // 总的个数需要的长度
        var start_x = ( this.total_width - tmp_width ) * 0.5;

        for(var i in list){
            if(i == "is_auto"){
                continue;
            }
            var v = list[i];
            var object = this.shop_item_list[v.id];
            if(object == null){
                object = this.createShopItem(i, start_x, cell_width, space, v.id);
                this.shop_item_list[v.id] = object;
    
                //  设置基础数据
                object.item.setData({bid:v.bid, num:v.num});
                // 购买价格
                if(object.buy_config == null){
                    var buy_config = Utils.getItemConfig(v.pay_type);
                    if(buy_config){
                        object.label.string = cc.js.formatStr("<img src='%s'/><outline=2, color=#000000> %s</outline>", buy_config.icon, v.pay_val);
                        this.loadRes(PathTool.getItemRes(buy_config.icon), (function(attr_text,resObject){
                            attr_text.addSpriteFrame(resObject);
                        }).bind(this,object.label));
                        object.buy_config = buy_config;
                    }
                }
                // 物品图标
                if(object.item_config == null){
                    var item_config = Utils.getItemConfig(v.bid);
                    if(item_config){
                        object.item_name.string = item_config.name;
                        object.item_config = item_config;
                    }
                }
                // 折扣价格
                if(v.discount == 0 || v.discount == 10){
                    object.discount.node.active = false;
                }else{
                    object.discount.node.active = true;
                    object.discount_label.string = v.discount+Utils.TI18N("折");
                }
            }

            if(v.is_buy == 1){
                object.sell_over.node.active = true;
            }else{
                object.sell_over.node.active = false;
            }
            object.data = v;
        }
    },

    // ==============================--
    // desc:购买物品返回
    // @id:
    // @return 
    // ==============================--
    updateSingleShopItem:function(id){
        if(this.shop_item_list == null)return;
        var object = this.shop_item_list[id];
        if(object == null)return;
        object.data.is_buy = 1      // 变为已购买
        object.sell_over.node.active = true;
    },

    clickBuyIndex:function(event){
        var id = event.target.touch_id;
        if(id == null)return;
        var object = this.shop_item_list[id];
        if(object == null || object.data == null)return;
        if(object.data.is_buy == 1){
            message(Utils.TI18N("该物品已被购买"));
            return;
        }
        if(object.item_config == null || object.buy_config == null)return;
        var color = BackPackConst.quality_color(object.item_config.quality) || 0;
        var str = cc.js.formatStr("%s <img src='%s'/>%s%s<Color=%s>%s</Color>x%s", Utils.TI18N("是否消耗"),object.buy_config.icon, object.data.pay_val, Utils.TI18N("购买"), color, object.item_config.name, object.data.num);
        CommonAlert.show(str, Utils.TI18N("确定"), function(){
            if(this.is_auto_open == true){
                this.ctrl.requestBuyShopItem(object.data.id);
            }else{
                if(this.data){
                    var ext_list = [{type: 1, val: object.data.id}];
                    this.ctrl.send20620(this.data.id, AdventureEvent.AdventureEvenHandleType.handle, ext_list);
                }
            }
        }.bind(this), Utils.TI18N("取消"),null,null,null,{resArr: [PathTool.getItemRes(object.buy_config.icon)]});
    },

    createShopItem:function(index, start_x, cell_width, space, id){
        var object = {};
        var node = new cc.Node();
        node.setAnchorPoint(0.5, 0.5);
        node.setContentSize(cc.size(cell_width, 100));
        var _x = -this.item_container.width/2+start_x + cell_width * 0.5 + index * (cell_width + space);
        var _y = -this.item_container.height +118;
        node.setPosition(_x, _y);
        this.item_container.addChild(node);

        
        var item = ItemsPool.getInstance().getItem("backpack_item");
        item.initConfig(false,1, false, true);
        item.setParent(node);
        item.show();
        item.setPosition(0, 52);

        var item_name = Utils.createLabel(18,new cc.Color(0x3f,0x32,0x34,0xff),null,0, -25,"我是物品名字",node,null, cc.v2(0.5,0.5));

        var button = Utils.createImage(node,null,0, -70,cc.v2(0.5,0.5),true,0,true);
        button.node.setContentSize(cc.size(180,66));
        this.loadRes(PathTool.getCommonIcomPath("Btn_2_1"), function (sf_obj) {
            button.spriteFrame = sf_obj;
        }.bind(this))
        var tmep_button = button.node.addComponent(cc.Button);
        tmep_button.transition = cc.Button.Transition.SCALE;
        tmep_button.duration = 0.1;
        tmep_button.zoomScale = 0.9;

        button.node.touch_id = id;

        button.node.on(cc.Node.EventType.TOUCH_END, this.clickBuyIndex,this);

        var button_label = Utils.createRichLabel(24, new cc.Color(0xff,0xff,0xff, 0xff), cc.v2(0.5, 0.5), cc.v2(0,2.5),28);
        button_label.string = Utils.TI18N("我是按钮名字");
        button_label.handleTouchEvent = false;
        button.node.addChild(button_label.node);

        var sell_over = Utils.createImage(node,null,0, 46,cc.v2(0.5,0.5),null,4);
        this.loadRes(PathTool.getUIIconPath("mall", "txt_cn_mall_sell_finish"), function (sf_obj) {
            sell_over.spriteFrame = sf_obj;
        }.bind(this))
        sell_over.node.active = false;

        var discount = Utils.createImage(node,null,-44, 80,cc.v2(0.5,0.5),null,3);
        this.loadRes(PathTool.getUIIconPath("mall", "mall_06"), function (sf_obj) {
            discount.spriteFrame = sf_obj;
        }.bind(this))
        discount.node.active = false;

        var discount_label = Utils.createLabel(24,new cc.Color(0xff,0xff,0xff,0xff),new cc.Color(0xae,0x2a,0x00,0xff),0, 10,"",discount.node,null, cc.v2(0.5,0.5));
        
        object.node = node;
        object.item = item;
        object.item_name = item_name;
        object.button = button;
        object.label = button_label;
        object.sell_over = sell_over;
        object.discount = discount;
        object.discount_label = discount_label;

        return object;
    },


    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        for(var i in this.shop_item_list){
            if(this.shop_item_list[i].item){
                this.shop_item_list[i].item.deleteMe();
            }
        }
        this.shop_item_list = null;
        this.ctrl.openEvtViewByType(false)
        this.ctrl.openAdventureEvtShopView(false)
    },
})