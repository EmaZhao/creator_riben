var PathTool = require("pathtool");
var ActionController = require("action_controller")
var ActionConst = require("action_const");
var StrongerController = require("stronger_controller")
var CommonScrollView = require("common_scrollview");
var VipController = require("vip_controller")
var HeroController = require("hero_controller")
var HeroConst      = require("hero_const");

var ActionCommonItem = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("welfare", "luxury_item");
        this.ctrl = ActionController.getInstance()
    },

    // 可以初始化声明一些变量的
    initConfig:function(){

    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel:function(){
        var self = this;
        let main_container = self.root_wnd.getChildByName("main_container")
        self.btn_goto = main_container.getChildByName("btn_goto")
        self.btn_goto_label = self.btn_goto.getChildByName("Text_7_0")
        self.btn_goto_label.getComponent(cc.Label).string = Utils.TI18N("前往")
        self.btn_goto.active = false;
        self.btn_get = main_container.getChildByName("btn_get")
        self.btn_get_label = self.btn_get.getChildByName("Text_7")
        self.btn_get_ui = main_container.getChildByName("btn_get").getComponent(cc.Button)
        self.btn_get.active = false;
        self.has_get = main_container.getChildByName("has_get")
        self.has_get.active = false;
        self.text_tesk = main_container.getChildByName("text_tesk")
        self.text_tesk.getComponent(cc.Label).string = "";

        self.goods_con = main_container.getChildByName("good_cons")
        let scroll_view_size = self.goods_con.getContentSize()
        let setting = {
            item_class : "backpack_item",      //-- 单元类
            start_x : 3,                  //-- 第一个单元的X起点
            space_x : 5,                    //-- x方向的间隔
            start_y : 4,                    //-- 第一个单元的Y起点
            space_y : 4,                   //-- y方向的间隔
            item_width : 120*0.80,               //-- 单元的尺寸width
            item_height : 120*0.80,              //-- 单元的尺寸height
            row : 1,                       // -- 行数，作用于水平滚动类型
            col : 0,                         //-- 列数，作用于垂直滚动类型
            scale : 0.80                     //-- 缩放
        }
        self.item_scrollview = new CommonScrollView();
        self.item_scrollview .createScroll(self.goods_con, cc.v2(0,0) , ScrollViewDir.horizontal, ScrollViewStartPos.top, scroll_view_size, setting)
        // self.item_scrollview:setSwallowTouches(false)
        self.title_desc = main_container.getChildByName("title_desc")
        if(this.data){
            this.setData(this.data)
        }
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function() {
        var self = this;
        this.btn_goto.on('click',this.gotoSpecificView,this)
        this.btn_get.on('click',function(){
            Utils.playButtonSound(1)
            if(this.holiday_item_bid && this.data){
                this.ctrl.cs16604(this.holiday_item_bid,this.data.aim)
            }
        },this)
    },
    gotoSpecificView(){
        Utils.playButtonSound(1)
        var self = this;
        // --直接跳转到充值界面的
        if(self.holiday_item_bid && (self.holiday_item_bid == ActionConst.ActionRankCommonType.acc_luxury || self.holiday_item_bid == ActionConst.ActionRankCommonType.totle_charge ||
            self.holiday_item_bid == ActionConst.ActionRankCommonType.limit_charge)){
            VipController.getInstance().openVipMainWindow(true, VIPTABCONST.CHARGE)
        }else if(self.holiday_item_bid && self.holiday_item_bid == ActionConst.ActionRankCommonType.luckly_egg){// --砸蛋的跳转是特殊的
            let id = ActionRankCommonType.smashegg
            let tab_vo = this.ctrl.getActionSubTabVo(id)
            if (tab_vo){
                if(this.ctrl.action_operate){
                    this.ctrl.action_operate.handleSelectedTab(this.ctrl.action_operate.tab_list[id])
                }
            }
        }else if(self.holiday_item_bid && self.holiday_item_bid == ActionConst.ActionRankCommonType.hero_awake){ // --觉醒豪礼特殊处理
                let hero_vo = HeroController.getInstance().getModel().getTopLevHeroInfoByBid(self.cur_bid)
                let all_role_list = HeroController.getInstance().getModel().getAllHeroArray()
                // --无指定英雄则前往限时召唤获取
                if (!hero_vo ||  !all_role_list || all_role_list.size == 0){
                    StrongerController.getInstance().clickCallBack(411)
                }else{
                    HeroController.getInstance().openHeroMainInfoWindow(true, hero_vo, all_role_list.items, {show_model_type : HeroConst.BagTab.eBagHero})
                }
        }else{
            let num
            if (self.holiday_item_bid == ActionConst.ActionRankCommonType.speed_fight || self.holiday_item_bid == ActionConst.ActionRankCommonType.speed_fight1){
                num = 132
            }else if(self.holiday_item_bid == ActionConst.ActionRankCommonType.voyage || self.holiday_item_bid == ActionConst.ActionRankCommonType.voyage1){
                num = 126
            }else if(self.holiday_item_bid == ActionConst.ActionRankCommonType.hero_expedit || self.holiday_item_bid == ActionConst.ActionRankCommonType.hero_expedit1){
                num = 151
            }else if(self.holiday_item_bid == ActionConst.ActionRankCommonType.epoint_gold || self.holiday_item_bid == ActionConst.ActionRankCommonType.epoint_gold1){
                num = 123
            }else if(self.holiday_item_bid == ActionConst.ActionRankCommonType.adventure){
                num = 407
            }else if(self.holiday_item_bid == ActionConst.ActionRankCommonType.updata_star){
                num = 404;
            }
            if(num){
                StrongerController.getInstance().clickCallBack(num)
            }
        }

    },
    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow:function(params){
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide:function(){

    },
    setExtendData(tab){
        this.holiday_item_bid = tab.bid
        this.is_activity_end = tab.time_end
        this.finish = tab.finish
    },
    setData(data){
        if(!data) return;
        this.data = data;
        var self = this
        if(this.root_wnd){
            self.getButtonTeskProgress(data)
            self.title_desc.getComponent(cc.RichText).string = StringUtil.parse(data.aim_str) 
            if(self.holiday_item_bid != ActionConst.ActionRankCommonType.longin_gift){
                self.btn_goto.active = (data.status == 0)
            }else{
                if(data.status == 0){
                    self.btn_get.active = (true)
                    self.btn_get_ui.interactable = false
                    self.btn_get_ui.enableAutoGrayEffect = true
                    self.btn_get_label.color = new cc.Color(255,255,255);
                }else{
                    self.btn_get_ui.interactable = true
                    self.btn_get_ui.enableAutoGrayEffect = false
                    self.btn_get_label.color = new cc.Color(113,40,4);
                }
            }
            // self.btn_get.active = (data.status == 1)
            // self.btn_goto.active = (data.status == 0)
            // self.has_get.active = (data.status == 2)
            if (self.is_activity_end == true && data.status == 0){
                self.btn_goto_label.getComponent(cc.Label).string = Utils.TI18N("已结束");
                self.btn_goto_label.color = new cc.Color(255,255,255);
                Utils.setGreyButton(this.btn_goto.getComponent(cc.Button),true)
            }

            // -- 物品列表
            let item_list = data.item_list
            let list = []
            for(let k=0;k<item_list.length;++k){
                let v = item_list[k]
                if (v && v.bid){
                    list.push(v)
                }
            }
            self.item_scrollview.setData(list)
            self.item_scrollview.addEndCallBack(function(){
                self.item_scrollview.scroll_view_compend.enabled = false
                let itemList = self.item_scrollview.getItemList()
                for(let k=0;k<itemList.length;++k){
                    let v = itemList[k]
                    v.setDefaultTip(true,false)
                }
            }.bind(this))
        }
    },
    getButtonTeskProgress(data){
        var self = this;
        let str = ""
        if (self.holiday_item_bid != ActionConst.ActionRankCommonType.longin_gift){
            let totle_count,current_count;
            let totle_list = Utils.keyfind('aim_args_key', 4, data.aim_args) || null;
            if (totle_list){
                totle_count = totle_list.aim_args_val || 0;
            }
            let current_list = Utils.keyfind('aim_args_key', 5, data.aim_args) || null;
            if (current_list){
                current_count = current_list.aim_args_val || 0;
            }
            if (totle_count>=0 && current_count>=0){
                str = "("+current_count + "/"+ totle_count +")";
            }

            // --升星有礼、融合祝福、觉醒豪礼
            let count
            let count_list = Utils.keyfind('aim_args_key', 6, data.aim_args) || null
            if (count_list){
                count = count_list.aim_args_val || 0
            }
            if (count>=0 && totle_count>=0){
                str = "("+count + "/"+ totle_count +")";
                if (count >= totle_count && data.status == 0){
                    data.status = 2;
                }
            }
            // --觉醒豪礼所用
            let bid_list = Utils.keyfind('aim_args_key', 18, data.aim_args) || null;
            if (bid_list){
                self.cur_bid = bid_list.aim_args_val || 0
            }
            // --充值类型的
            if (self.holiday_item_bid == ActionConst.ActionRankCommonType.acc_luxury){
                if (data.status == 0){
                    str = "(0/1)"
                }else{
                    str = "(1/1)"
                }
            }else if(self.holiday_item_bid == ActionConst.ActionRankCommonType.totle_charge || self.holiday_item_bid == ActionConst.ActionRankCommonType.totle_consume ||
                self.holiday_item_bid == ActionConst.ActionRankCommonType.limit_charge){// --累充和累消的
                str = "("+self.finish + "/"+ data.aim +")";
            }
        }else{
            str = "("+ self.finish + "/"+ data.aim +")";
        }
        self.text_tesk.getComponent(cc.Label).string = str;
        self.btn_get.active = (data.status == 1);
        self.has_get.active = (data.status == 2);
    },
    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete:function(){
        if(this.item_scrollview){
            this.item_scrollview.deleteMe();
            this.item_scrollview = null;
        }
    },
})