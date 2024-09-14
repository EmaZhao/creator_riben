// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     购买等级
// <br/>Create: 2019-08-10 16:26:10
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var CommonScrollView = require("common_scrollview");

var Buy_levWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("orderaction", "buy_lev_window");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Mini;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        this.cur_buy_lev = 1;
        this.touch_max_btn = null;
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        var background = this.root_wnd.getChildByName("background");
        background.scale = FIT_SCALE;
        var main_container = this.root_wnd.getChildByName("main_container");
        var title_label = main_container.getChildByName("title_con").getChildByName("title_label").getComponent(cc.Label);
        title_label.string = Utils.TI18N("购买等级");
        
        this.btn_buy = main_container.getChildByName("btn_buy");
        var text_1 = this.btn_buy.getChildByName("Text_1").getComponent(cc.Label);
        text_1.string = Utils.TI18N("购   买");
        
        var info_con = main_container.getChildByName("info_con");
        this.slider = info_con.getChildByName("slider")// 滑块
        this.plus_btn = info_con.getChildByName("plus_btn");
        this.min_btn = info_con.getChildByName("min_btn");
        this.max_btn = info_con.getChildByName("max_btn");
        this.buy_price = info_con.getChildByName("buy_price").getComponent(cc.Label);
        this.buy_price.string = "";
        this.Sprite_1 = info_con.getChildByName("Sprite_1").getComponent(cc.Sprite);
        this.loadRes(PathTool.getItemRes("3"), function (res) {
            this.Sprite_1.spriteFrame = res;
        }.bind(this))

        //获取当前的信息
        this.cur_period = this.model.getCurPeriod();
        this.cur_lev = this.model.getCurLev();

        this.cur_max_lev = 0;
        if(Config.holiday_war_order_data.data_lev_reward_list[this.cur_period]){
            this.cur_max_lev = Object.keys(Config.holiday_war_order_data.data_lev_reward_list[this.cur_period]).length;
        }

        // 购买等级
        this.buy_editbox = main_container.getChildByName("editbox").getComponent(cc.EditBox);
        

        var onEditBegan = function(){
            this.buy_editbox.placeholder = "";
            this.buy_editbox.string = "";
        }.bind(this);

        var onEditEnded = function(){
            var lev = this.buy_editbox.string; 
            if(lev != ""){
                var input = parseInt(lev);
                if(input!=null){
                    if(input <= 0){
                        input = 1;
                    }
                    if(input >= (this.cur_max_lev-this.cur_lev)){
                        input = this.cur_max_lev-this.cur_lev;
                    }
                    this.buy_editbox.string = input.toString();
                    this.cur_buy_lev = input + this.cur_lev;
                    if(this.cur_buy_lev >= this.cur_max_lev){
                        this.cur_buy_lev = this.cur_max_lev;
                    }
                    if(this.cur_buy_lev <= this.cur_lev){
                        this.cur_buy_lev = this.cur_lev+1;
                    }
                    this.buyDescript(this.cur_buy_lev)
                }
            }
        }.bind(this);
        this.buy_editbox.node.on('editing-did-began', onEditBegan, this);
        this.buy_editbox.node.on('editing-did-ended', onEditEnded, this);
        this.buy_editbox.node.on('editing-did-return', onEditEnded, this);
    

        this.reward_desc = Utils.createRichLabel(22, new cc.Color(0x64,0x32,0x23,0xff), cc.v2(0.5, 0.5), cc.v2(0,240),24,400);
        main_container.addChild(this.reward_desc.node);

        this.lev_desc = Utils.createRichLabel(26, new cc.Color(0x64,0x32,0x23,0xff), cc.v2(0, 0.5), cc.v2(-230,-60),28,400);
        this.lev_desc.horizontalAlign = cc.macro.TextAlignment.LEFT;
        main_container.addChild(this.lev_desc.node);

        var goods = main_container.getChildByName("goods");
        var scroll_view_size = goods.getContentSize();
        var setting = {
            item_class: "backpack_item",
            start_x: 32,
            space_x: 20,
            start_y: 0,
            space_y: 0,
            item_width: 120,
            item_height: 120,
            row: 1,
            col: 4,
        }

        this.item_scrollview = new CommonScrollView()
        this.item_scrollview.createScroll(goods, cc.v2(0,0), ScrollViewDir.vertical, ScrollViewStartPos.top, scroll_view_size, setting);

        this.cur_buy_lev = this.cur_lev + 1;
        this.setEditBoxText(this.cur_buy_lev);
        this.buyDescript(this.cur_buy_lev);
        this.ticketInitShow(this.cur_buy_lev);
        this.btn_close = main_container.getChildByName("btn_close");
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        Utils.onTouchEnd(this.btn_close, function () {
            this.ctrl.openBuyLevView(false);
        }.bind(this), 2);

        Utils.onTouchEnd(this.plus_btn, function () {
            this.addBuy();
        }.bind(this), 1);

        Utils.onTouchEnd(this.min_btn, function () {
            this.minusBuy();
        }.bind(this), 1);

        Utils.onTouchEnd(this.max_btn, function () {
            this.maxBuy();
        }.bind(this), 1);

        Utils.onTouchEnd(this.btn_buy, function () {
            var buy_lev = this.cur_buy_lev - this.cur_lev;
            this.ctrl.send25307(buy_lev);
        }.bind(this), 1);
    },

    setEditBoxText:function(num){
        if(this.buy_editbox){
            num = num - this.cur_lev;
            this.buy_editbox.string = num.toString();
        }
    },

    addBuy:function(){
        this.cur_buy_lev = this.cur_buy_lev + 1;
        if(Config.holiday_war_order_data.data_lev_reward_list[this.cur_period]){
            this.touch_max_btn = null;
            if(this.cur_buy_lev > this.cur_max_lev){
                this.cur_buy_lev = this.cur_max_lev;
                message(Utils.TI18N("已经到达最大等级了~~~"));
                return;
            }
        }
        this.setEditBoxText(this.cur_buy_lev);
        this.buyDescript(this.cur_buy_lev);
    },

    minusBuy:function(){
        this.cur_buy_lev = this.cur_buy_lev - 1;
        this.setEditBoxText(this.cur_buy_lev);
        this.touch_max_btn = null;
        if(this.cur_buy_lev <= this.cur_lev){
            this.cur_buy_lev = this.cur_lev;
            message(Utils.TI18N("已经是购买最小等级了~~~"));
            this.setEditBoxText(this.cur_buy_lev+1);
            return;
        }
        if(this.cur_buy_lev <= 0){
            this.cur_buy_lev = 0;
        }
        this.buyDescript(this.cur_buy_lev);
    },

    maxBuy:function(){
        if(this.touch_max_btn)return
        if(!Config.holiday_war_order_data.data_lev_reward_list[this.cur_period])return;

        this.cur_buy_lev = this.cur_max_lev;
        this.setEditBoxText(this.cur_buy_lev);
        this.touch_max_btn = true;
        this.buyDescript(this.cur_max_lev);  
    },

    buyDescript:function(lev){
        var temp_lev = lev;
        if(!Config.holiday_war_order_data.data_lev_reward_list[this.cur_period])return;
        this.clearTicket();
        if(this.buy_lev_ticket == null){
            this.buy_lev_ticket = gcore.Timer.set(function () {
                this.ticketInitShow(temp_lev);
            }.bind(this), 300);
        }

        lev = lev - this.cur_lev;
        var str = cc.js.formatStr(Utils.TI18N("购买 <color=#249003>%d</color> 级，升至 <color=#249003>%d</color> 级"),lev,this.cur_buy_lev);
        this.lev_desc.string = str;
        var totle_price = 1000 * lev;
        this.buy_price.string = totle_price*0.6;

    },

    ticketInitShow:function(lev){
        if(!lev)return;
        var tempArr = this.addTicket(lev);
        
        var list = tempArr[0];
        var num = tempArr[1];
        var str = cc.js.formatStr(Utils.TI18N("升至 <color=#249003>%d</color> 级，可立即解锁 <color=#249003>%d</color> 件奖励"),lev,num);
        if(this.reward_desc){                                                                                                         
            this.reward_desc.string = str;
        }
        if(this.item_scrollview){
            this.item_scrollview.setData(list);
            this.item_scrollview.addEndCallBack(function(){
                var item_list = this.item_scrollview.getItemList();
                for(var i in item_list){
                    item_list[i].setDefaultTip();
                }
            }.bind(this));
        }
    },

    clearTicket:function(){
        if(this.buy_lev_ticket != null){
            gcore.Timer.del(this.buy_lev_ticket);
            this.buy_lev_ticket = null;
        }
    },

    addTicket:function(temp_lev){
        this.clearTicket();
        var list = [];
        var dic_items = {};
        var totle_num = 0;
        for(var i=this.cur_lev+1;i<=temp_lev;i++){
            if(Config.holiday_war_order_data.data_lev_reward_list[this.cur_period][i]){
                if(Config.holiday_war_order_data.data_lev_reward_list[this.cur_period][i].reward){
                    var num = Config.holiday_war_order_data.data_lev_reward_list[this.cur_period][i].item_num || 0;
                    totle_num = totle_num + num;

                    for(var j in Config.holiday_war_order_data.data_lev_reward_list[this.cur_period][i].reward){
                        var v = Config.holiday_war_order_data.data_lev_reward_list[this.cur_period][i].reward[j];
                        if(dic_items[v[0]]){
                            dic_items[v[0]] = dic_items[v[0]] + v[1];
                        }else{
                            dic_items[v[0]] = v[1];
                        }
                    }

                    for(var j in Config.holiday_war_order_data.data_lev_reward_list[this.cur_period][i].rmb_reward){
                        var v = Config.holiday_war_order_data.data_lev_reward_list[this.cur_period][i].rmb_reward[j];
                        if(dic_items[v[0]]){
                            dic_items[v[0]] = dic_items[v[0]] + v[1];
                        }else{
                            dic_items[v[0]] = v[1];
                        }
                    }
                }
            }
        }
        var price_list = Config.holiday_war_order_data.data_price_list;
        for(var id in dic_items){
            var sort = 0;
            if(price_list[id]){
                sort = price_list[id].sort || 0;
            }
            list.push({bid: id, num: dic_items[id], sort: sort});
        }
        list.sort(function(a,b){
            return a.sort - b.sort;
        })
        return [list,totle_num];
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(params){

    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        if(this.item_scrollview){
            this.item_scrollview.deleteMe()
            this.item_scrollview = null;
        }
        this.ctrl.openBuyLevView(false);
    },
})