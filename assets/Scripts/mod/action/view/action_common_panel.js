// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     排行通用界面
// <br/>Create: 2019-04-22 19:09:12
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var ActionConst = require("action_const");
var ActionCommonItem = require("action_common_Item")
var CommonScrollView = require("common_scrollview");
var ActionController = require("action_controller")
var ActionEvent = require("action_event");
var TimeTool = require("timetool")
var RankConstant = require("rank_constant")
var RankController = require("rank_controller")
var ActionCommonPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("action", "action_hero_expedit_panel");
        this.ctrl =  ActionController.getInstance()
        this.holiday_bid = arguments[0]
    },

    // 可以初始化声明一些变量的
    initConfig:function(){
        let a = new cc.Color(108,210,40);
        let b = new cc.Color(255,0,0);
        let c = new cc.color(0xff,0x00,0x00);
        this.colorText = [a,b,c]
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel:function(){
        var self = this;
        self.main_container = self.root_wnd.getChildByName("main_container");
        this.title_con = self.main_container.getChildByName("title_con");
        self.time_label = this.title_con.getChildByName("label_time_key")
        self.time_text = this.title_con.getChildByName("label_time").getComponent(cc.Label);
        self.time_text.node.color = new cc.Color(0x80,0xf7,0x31,0xff)
        self.rank_btn = this.title_con.getChildByName("rank_btn");
        self.rank_btn.getChildByName("label").getComponent(cc.Label).string = Utils.TI18N("详细排行");
        self.reward_btn = this.title_con.getChildByName("reward_btn");
        self.reward_btn.getChildByName("label").getComponent(cc.Label).string = Utils.TI18N("奖励预览");
        self.btn_rule = this.title_con.getChildByName("btn_rule")
        self.btn_rule.active = false;
        
        this.loadBannerImage();

        self.goods_con = self.main_container.getChildByName("charge_con")
        let bgSize = self.goods_con.getContentSize()
        let scroll_view_size = cc.size(bgSize.width, bgSize.height)
        let setting = {
            item_class : ActionCommonItem,     // -- 单元类
            start_x : 0,                  //-- 第一个单元的X起点
            space_x : 0,                  //-- x方向的间隔
            start_y : 0,                  //-- 第一个单元的Y起点
            space_y : 0,                  //-- y方向的间隔
            item_width : 688,             //-- 单元的尺寸width
            item_height : 150,            //-- 单元的尺寸height
            row : 0,                      //-- 行数，作用于水平滚动类型
            col : 1,                      //-- 列数，作用于垂直滚动类型
            need_dynamic : true
        }

        Utils.getNodeCompByPath("main_container/title_con/label_time_key", this.root_wnd, cc.Label).string = Utils.TI18N("剩余时间:");

        self.item_scrollview = new CommonScrollView()
        self.item_scrollview.createScroll(self.goods_con, cc.v2(0,0) , ScrollViewDir.vertical, ScrollViewStartPos.top, scroll_view_size, setting)
    },

    // 加载banner图片
    loadBannerImage:function(){
        if(this.holiday_bid == ActionConst.ActionRankCommonType.hero_expedit || this.holiday_bid == ActionConst.ActionRankCommonType.adventure){
            this.btn_rule.active = true;
        }else if(this.holiday_bid == ActionConst.ActionRankCommonType.longin_gift || this.holiday_bid == ActionConst.ActionRankCommonType.luckly_egg){
            this.reward_btn.active = false;
            this.rank_btn.active = false;
        }else if(this.holiday_bid == ActionConst.ActionRankCommonType.acc_luxury || this.holiday_bid == ActionConst.ActionRankCommonType.totle_charge ||
            this.holiday_bid == ActionConst.ActionRankCommonType.totle_consume || this.holiday_bid == ActionConst.ActionRankCommonType.fusion_blessing || 
            this.holiday_bid == ActionConst.ActionRankCommonType.updata_star || this.holiday_bid == ActionConst.ActionRankCommonType.hero_awake ||
            this.holiday_bid == ActionConst.ActionRankCommonType.limit_charge){//倒计时在右边的时候（本来在左边的）
                if(this.holiday_bid == ActionConst.ActionRankCommonType.acc_luxury){
                    this.btn_rule.active = true;
                }
                this.btn_rule.x = 318;
                this.time_label.setPosition(cc.v2(90, -122));
                // self.time_text:setAnchorPoint(cc.p(0, 0.5))
                this.time_text.node.setPosition(cc.v2(200, -122));
                this.reward_btn.active = false;
                this.rank_btn.active = false;
        }
        // 横幅图片
        var title_img = this.title_con.getChildByName("title_img").getComponent(cc.Sprite);
        var str_banner = "txt_cn_welfare_banner11";
        var tab_vo = this.ctrl.getActionSubTabVo(this.holiday_bid);

        if(tab_vo && tab_vo.reward_title != "" && tab_vo.reward_title){
            str_banner = tab_vo.reward_title;
        }

        let path = PathTool.getWelfareBannerRes(str_banner);
        this.loadRes(path,function(res){
            title_img.spriteFrame = res;
        }.bind(this))
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        this.addGlobalEvent(ActionEvent.UPDATE_HOLIDAY_SIGNLE,function(data){
            if (!data) return
            if (data.bid == this.holiday_bid){
                this.setPanelData(data)
            }  
        }.bind(this))
        this.rank_btn.on('click',function(){
            Utils.playButtonSound(1)
            this.jumpRankView()
        },this)

        this.reward_btn.on('click',function(){
            Utils.playButtonSound(1)
            RankController.getInstance().openRankRewardPanel(true, this.holiday_bid)
        },this)
        this.btn_rule.on('click',function(){
            Utils.playButtonSound(1)
            let config = Config.holiday_client_data.data_constant.expedit_rules
            if(this.holiday_bid == ActionConst.ActionRankCommonType.adventure){
                config = Config.holiday_client_data.data_constant.adventure_rules
            }else if(this.holiday_bid == ActionConst.ActionRankCommonType.acc_luxury){
                config = Config.holiday_client_data.data_constant.luxury_rules
            }
            let p = this.btn_rule.convertToWorldSpace(cc.v2(0,0))
            require("tips_controller").getInstance().showCommonTips(config.desc,p,null,null,500)
            // TipsManager.getInstance().showCommonTips(config.desc, sender.getTouchBeganPosition(),nil,nil,500)
        },this)
        this.ctrl.cs16603(this.holiday_bid)
    },
    setPanelData(data){
        var self = this
        // -- 活动剩余时间
        let is_time_end = false
        let time = data.remain_sec || 0
        if (self.holiday_bid == ActionConst.ActionRankCommonType.epoint_gold || self.holiday_bid == ActionConst.ActionRankCommonType.speed_fight ||
            self.holiday_bid == ActionConst.ActionRankCommonType.voyage || self.holiday_bid == ActionConst.ActionRankCommonType.hero_expedit || 
            self.holiday_bid == ActionConst.ActionRankCommonType.adventure){
            time = time - 24*60*60 //--提前一天显示已结束，然后一天过后，活动就会消失
            if (time <= 0){
                time = 0
                is_time_end = true
            }
        }
        if (this.item_scrollview){
            this.ctrl.getModel().sortItemList(data.aim_list)
            let tab = {}
            tab.bid = this.holiday_bid
            tab.time_end = is_time_end //--排行活动用到，用来判断时间是否结束
            tab.finish = data.finish //--登录\累计充值
            this.item_scrollview.setData(data.aim_list,null,tab)
        }
        //积天豪礼特殊处理
        if(this.holiday_bid == ActionConst.ActionRankCommonType.acc_luxury){
            this.time_text.node.active = false;
            this.time_label.active = false;
        }else{
            this.time_text.node.active = true;
            this.time_label.active = true;
            this.ctrl.getModel().setCountDownTime(this.time_text,time)
        }
        // this.setLessTime(time)
    },
    jumpRankView(){
        let jump_rank = RankConstant.RankType.hero_expedit
        if(this.holiday_bid == ActionConst.ActionRankCommonType.speed_fight){
            jump_rank = RankConstant.RankType.speed_fight
        }else if(this.holiday_bid == ActionConst.ActionRankCommonType.voyage){
            jump_rank = RankConstant.RankType.voyage
        }else if(this.holiday_bid == ActionConst.ActionRankCommonType.epoint_gold){
            jump_rank = RankConstant.RankType.pointglod
        }else if(this.holiday_bid == ActionConst.ActionRankCommonType.adventure){
            jump_rank = RankConstant.RankType.adventure_muster
        }
        RankController.getInstance().openRankView(true, jump_rank)
    },
    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow:function(params){

    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide:function(){

    },
    setLessTime(less_time){
        if(!this.time_text){
            return
        }
        less_time =  less_time || 0;
        if (less_time > 0){
            this.setTimeFormatString(less_time)
            if(this.time_tichet == null){
                this.time_tichet = gcore.Timer.set(function(){
                    less_time-- 
                    if(less_time < 0){
                        gcore.Timer.del(this.time_tichet);
                        this.time_tichet = null;
                        this.time_text.string = Utils.TI18N("已结束");
                        this.time_text.node.color = this.colorText[2]
                        if (this.holiday_item_data && this.item_scrollview){
                            this.ctrl.getModel().sortItemList(this.holiday_item_data.aim_list)
                            let tab = {}
                            tab.bid = this.holiday_bid
                            tab.time_end = true
                            this.item_scrollview.setData(this.holiday_item_data.aim_list,null,tab)
                        }
                    }else{
                        this.setTimeFormatString(less_time)
                    }
                }.bind(this),1000,-1)
            }
        }else{
            this.setTimeFormatString(less_time)
        }
    },
    setTimeFormatString(time){
        var self = this;
        if (time > 0){
            self.time_text.string = TimeTool.getTimeFormatDayIIIIIIII(time);
            self.time_text.node.color = this.colorText[0]//new cc.Color(108,210,40);
        }else{
            self.time_text.string = Utils.TI18N("已结束");
            self.time_text.node.color = this.colorText[1]//new cc.Color(255,0,0)
        }
    },
    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete:function(){
        if (this.item_scrollview){
            this.item_scrollview.deleteMe();
            this.item_scrollview = null;
        }
        if(this.time_tichet){
            gcore.Timer.del(this.time_tichet);
            this.time_tichet = null;
        }
        if(this.time_text.node){
            this.time_text.node.stopAllActions()
        }
    },
})