// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-04-12 16:33:32
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var ActionEvent = require("action_event");
var ActionController = require("action_controller")
var ActionConst = require("action_const")
var ActionGrowFundItem = require("action_grow_fund_Item")
var CommonScrollView = require("common_scrollview");
var WelfareController = require("welfare_controller")
var Action_grow_fundPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("action", "action_grow_fund_panel");
    },

    // 可以初始化声明一些变量的
    initConfig:function(){
        this.item_list = {};
        this.holiday_bid = 991008;
	    this.type = 4;
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel:function(){
        var self = this
        self.main_container = self.root_wnd.getChildByName("main_container");

        self.challenge_btn = self.main_container.getChildByName("challenge_btn");
        self.challenge_btn_lb = self.challenge_btn.getChildByName("label").getComponent(cc.Label) ;
        self.sprite_nd = self.challenge_btn.getChildByName("sprite");

        self.goods_con = self.main_container.getChildByName("goods_con");
    
        self.empty_tips = self.main_container.getChildByName("empty_tips");
        self.empty_tips.getChildByName("label").string = Utils.TI18N("您已获得全部成长基金");
    
        self.title_con = self.main_container.getChildByName("title_con");
        self.title_img = self.title_con.getChildByName("title_img").getComponent(cc.Sprite);
        this.loadRes(PathTool.getUIIconPath("bigbg/action","txt_cn_action_grow_fund_title"),function(res){
            self.title_img.spriteFrame = res
        }.bind(this))
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        var self = this
        if (!self.update_action_even_event){
            self.update_action_even_event = this.addGlobalEvent(ActionEvent.UPDATE_HOLIDAY_SIGNLE,function(data){
                if (data.bid == self.holiday_bid) {
                    self.createList(data);
                    self.checkTabIconStatus(data);
                }
            })
        }
        if (self.scroll_view == null){
        	ActionController.getInstance().cs16603(self.holiday_bid);
        }
        this.challenge_btn.on("click",function(){
            Utils.playButtonSound(1)
            let config = Config.charge_data.data_charge_data[101];
			if (config) {
                SDK.pay(config.val, 1, config.id, config.name,config.product_desc,null,null,config.pay_image) 
            }
        },this)
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow:function(params){

    },
    createList:function(data){
        var self = this
        if (data == null || data.aim_list == null){ return};
        let can_buy = (data.finish == false && (Utils.next(data.aim_list) != null));
        if (self.challenge_btn_status != can_buy){
            self.challenge_btn_status = can_buy;
            if (can_buy == false){
                self.sprite_nd.active = false;
                self.challenge_btn_lb.string = Utils.TI18N("已充值");
                self.challenge_btn.getComponent(cc.Button).interactable = false;
                self.challenge_btn.getComponent(cc.Button).enableAutoGrayEffect = true;
                self.challenge_btn_lb.node.getComponent(cc.LabelOutline).enabled = false;
            }else{
                self.challenge_btn.getComponent(cc.Button).interactable = true;
                self.challenge_btn.getComponent(cc.Button).enableAutoGrayEffect = false;
                //enableOutline(Config.ColorData.data_color4[157])
                let config = Config.charge_data.data_charge_data[101];
                let val = 88;
                if (config){
                    val = config.val;
                }
                self.sprite_nd.active = true;
                let label_str = val+Utils.TI18N("购买");
                self.challenge_btn_lb.string = label_str;
            }
        }
        let item_list = [];
        for (let i=0;i<data.aim_list.length;++i){
            let v = data.aim_list[i];
            v.sort_index = 0;
            if (v.status == ActionConst.ActionStatus.un_finish){
                v.sort_index = 1;
            }else if(v.status == ActionConst.ActionStatus.finish){
                v.sort_index = 0;
            }else if(v.status == ActionConst.ActionStatus.completed){
                v.sort_index = 2;
            }
            item_list.push(v)
        }
        if (Utils.next(item_list) == null){
            self.empty_tips.active = true; // :setVisible(true)
            if (self.scroll_view){
                self.scroll_view.active = false; // :setVisible(false)
           }
        }else{
            item_list.sort( Utils.tableLowerSorter(["sort_index"],["aim"]))
            if (self.scroll_view == null){
                let size = cc.size(self.goods_con.width,self.goods_con.height)
                let setting = {
                    item_class : ActionGrowFundItem,
                    start_x : 8,                  //-- 第一个单元的X起点
                    space_x : 4,                   // -- x方向的间隔
                    start_y : 4,                    //-- 第一个单元的Y起点
                    space_y : 2,                   //-- y方向的间隔
                    item_width : 678,               //-- 单元的尺寸width
                    item_height : 90,              //-- 单元的尺寸height
                    row : 0,                        //-- 行数，作用于水平滚动类型
                    col : 1,                         //-- 列数，作用于垂直滚动类型
                    need_dynamic : true
                }
                self.scroll_view = new CommonScrollView(); 
                self.scroll_view.createScroll(self.goods_con, cc.v2(0,0) , ScrollViewDir.vertical, ScrollViewStartPos.top, size, setting)
           }
            let callback =function (data){   
                if (data && data.aim){
                    ActionController.getInstance().cs16604(self.holiday_bid, data.aim, 0)
               }
           }
            self.scroll_view.setData(item_list, callback) 

            self.empty_tips.active = false
        }
    },
    checkTabIconStatus(data){
        if(data == null || data.aim_list == null) return;
        let red_status = false
        for(let i=0;i<data.aim_list.length;++i){
            let v = data.aim_list[i]
            if(v.status == ActionConst.ActionStatus.finish){
                red_status = true
                break
            }
        }
        if(data.finish == 0 || red_status == false ){
            ActionController.getInstance().setHolidayStatus(this.holiday_bid, false)
            if(this.holiday_bid == ActionConst.ActionSpecialID.growfund){
                WelfareController.getInstance().setWelfareStatus(ActionConst.ActionSpecialID.growfund, false)
            }
        }
    },
    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide:function(){

    },
    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete:function(){

    },
})