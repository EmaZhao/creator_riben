// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     冒险商店
// <br/>Create: 2019-05-14 15:23:55
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var AdventureEvent = require("adventure_event");
var CommonScrollView = require("common_scrollview");
var BackPackConst = require("backpack_const");
var CommonAlert = require("commonalert");
var AdventureShopItem = require("adventure_shop_item_panel");
var TimeTool = require("timetool")

var Adventure_shopWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("adventure", "adventure_shop_window");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Big;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){

    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        this.background = this.root_wnd.getChildByName("background");
        this.background.scale = FIT_SCALE;
        var container = this.root_wnd.getChildByName("container");
        var win_title = container.getChildByName("win_title").getComponent(cc.Label);
        win_title.string = Utils.TI18N("冒险商店");
        var time_title = container.getChildByName("time_title").getComponent(cc.Label);
        time_title.string = Utils.TI18N("商店重置:");
    
        this.close_btn = container.getChildByName("close_btn");
    
        this.list_panel = container.getChildByName("list_panel");
        this.time_value = container.getChildByName("time_value").getComponent(cc.Label);
    
        this.empty_tips = container.getChildByName("empty_tips");
        var desc = this.empty_tips.getChildByName("desc").getComponent(cc.Label);
        desc.string = Utils.TI18N("暂无商品，快去寻找冒险商人吧");
    
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        Utils.onTouchEnd(this.close_btn, function () {
            this.ctrl.openAdventrueShopWindow(false);
        }.bind(this), 2);

        Utils.onTouchEnd(this.background, function () {
            this.ctrl.openAdventrueShopWindow(false);
        }.bind(this), 2);

        this.addGlobalEvent(AdventureEvent.UpdateShopTotalEvent,function(data_list){
            this.updateShopTotalList(data_list);
        }.bind(this));

        this.addGlobalEvent(AdventureEvent.UpdateShopItemEvent,function(id){
            this.updateSingleShopItem(id);
        }.bind(this));
    },

    updateShopTotalList:function(data_list){
        if(data_list == null || Utils.next(data_list) == null){
            if(this.scroll_view){
                this.scroll_view.setVisible(false);
            }
            this.empty_tips.active = true;
        }else{
            this.empty_tips.active = false;
            var clickback = function(cell){
                this.selectItemHandle(cell);
            }.bind(this);

            if(this.scroll_view == null){
                var size = this.list_panel.getContentSize();
                var setting = {
                    item_class: AdventureShopItem,
                    start_x: 11,
                    space_x: 6 ,
                    start_y: 8,
                    space_y: 4,
                    item_width: 290,
                    item_height: 143,
                    row: 0,
                    col: 2,
                    need_dynamic: true
                }
                
                this.scroll_view = new CommonScrollView();
                this.scroll_view.createScroll(this.list_panel, cc.v2(-size.width/2,-size.height/2),null,null, size, setting);
            }

            //  排序
            data_list.sort(function(a, b){
                return a.is_buy - b.is_buy
            });

            this.scroll_view.setVisible(true);
            this.scroll_view.setData(data_list, clickback);
        }
    },

    // ==============================--
    // desc:点击单位的时候处理
    // @cell:
    // @data:
    // @return 
    // ==============================--
    selectItemHandle:function(cell){
        if(cell == null || cell.item_config == null || cell.buy_config == null)return;
        var data = cell.getData();
        if(data && data.is_buy == 1){
            message(Utils.TI18N("该物品已被购买"));
		    return;
        }
        var item_config = cell.item_config;
        var buy_config = cell.buy_config;

        var color = BackPackConst.quality_color(item_config.quality) || 0;
        var str = cc.js.formatStr("%s <img src='%s'/>%s%s<Color=%s>%s</Color>x%s", Utils.TI18N("是否消耗"),
        buy_config.icon, Utils.getMoneyString(data.pay_val), Utils.TI18N("购买"), color, item_config.name, data.num);
        
        CommonAlert.show(str, Utils.TI18N("确定"), function(data){
            if(data){
                this.ctrl.requestBuyShopItem(data.id);
            }
        }.bind(this,data), Utils.TI18N("取消"),null,null,null,{resArr: [PathTool.getItemRes(buy_config.icon)]});

        this.select_item = cell;
        this.select_data = data;
    },
	
    // ==============================--
    // desc:更新单个物品
    // @id:
    // @return 
    // ==============================--
    updateSingleShopItem:function(id){
        if(this.select_item == null)return;
        if(this.select_data.id == id){
            this.select_data.is_buy = 1;
        }
        // 设置已售状态
        this.select_item.updateOverStatus();
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(params){
        this.ctrl.requestShopTotal();
        this.updateEndTime();
    },

    // ==============================--
    // desc:更新重置事件
    // @return 
    // ==============================--
    updateEndTime:function(){
        this.base_data = this.model.getAdventureBaseData();
        if(this.timeticket == null){
            this.countDownEndTime();
            this.timeticket = gcore.Timer.set(function(){
                this.countDownEndTime();
            }.bind(this),1000,-1);
        }
    },

    // ==============================--
    // desc:计时器
    // @return 
    // ==============================--
    countDownEndTime:function(){
        if(this.base_data == null){
            this.clearEneTime();
		    return;
        }
        var end_time = this.base_data.end_time - gcore.SmartSocket.getTime();
        if(end_time <= 0){
            end_time = 0;
		    this.clearEneTime();
        }
        this.time_value.string = TimeTool.getTimeFormat(end_time);
    },

    // ==============================--
    // desc:清理计时器
    // @return 
    // ==============================--
    clearEneTime:function(){
        if(this.timeticket){
            gcore.Timer.del(this.timeticket);
            this.timeticket = null;
        }
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        this.ctrl.openAdventrueShopWindow(false);
        this.clearEneTime();

        if (this.scroll_view) {
            this.scroll_view.deleteMe();
        }
        this.scroll_view = null;
    },
})