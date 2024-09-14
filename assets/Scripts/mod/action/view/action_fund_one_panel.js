// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-04-17 15:30:32
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var CommonScrollView = require("common_scrollview");
var ActionFuncOneItem = require("action_func_one_Item")
var ActionController = require("action_controller")
var ActionEvent = require("action_event");
var TimeTool = require("timetool")
var ActionConst = require("action_const")
var ActionFundOnePanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.fund_bid = arguments[0];
        this.prefabPath = PathTool.getPrefabPath("action", "action_fund_panel");
        this._model = ActionController.getInstance().getModel();
        this._controller = ActionController.getInstance();
    },

    // 可以初始化声明一些变量的
    initConfig:function(){

    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel:function(){
        var self = this;
        self.main_container = self.root_wnd.getChildByName("main_container");

        self.desc_rt = self.main_container.getChildByName("desc_txt").getComponent(cc.RichText);
        self.btn_award_nd = self.main_container.getChildByName("btn_award")
        self.not_buy_panel = self.main_container.getChildByName("not_buy_panel");
        self.not_buy_panel.active = true
        self.buy_btn = self.not_buy_panel.getChildByName("buy_btn");
        self.sprite_nd = self.buy_btn.getChildByName("sprite");
        self.buy_btn_label = self.buy_btn.getChildByName("label").getComponent(cc.Label);
        let image_bg_sp = self.main_container.getChildByName("image_bg").getComponent(cc.Sprite)
        let num_sp = this.seekChild("num",cc.Sprite);
        let path,path1;
        if(this.fund_bid == ActionConst.FundType.type_one){
            path = PathTool.getBigBg("txt_cn_action_fund_bg_1",null,"action")
            path1 = PathTool.getUIIconPath("actionfund","actionfund_1006")
        }else if(this.fund_bid  == ActionConst.FundType.type_two){
            path = PathTool.getBigBg("txt_cn_action_fund_bg_2",null,"action")
            path1 = PathTool.getUIIconPath("actionfund","actionfund_1008")
        }
        this.loadRes(path1,function(res){
            num_sp.spriteFrame = res
        }.bind(this))
        this.loadRes(path,function(res){
            image_bg_sp.spriteFrame = res
        }.bind(this))
        self.not_buy_panel.getChildByName("layout").active = false;
        this.loadRes(PathTool.getItemRes(3),function(res){
            self.not_buy_panel.getChildByName("layout").getChildByName("item").getComponent(cc.Sprite).spriteFrame = res;
        }.bind(this))
        

        self.buy_panel = self.main_container.getChildByName("buy_panel");
        self.buy_panel.active = false;

        self.tips_text = self.buy_panel.getChildByName("tips_txt");
        self.tips_text.active = false;
        self.total_day_txt = self.buy_panel.getChildByName("total_day_txt");
        self.time_txt = self.buy_panel.getChildByName("txt_time");
        self.get_btn = self.buy_panel.getChildByName("get_btn");

        let goods_list = self.main_container.getChildByName("goods_list");
        let scroll_size = cc.size(goods_list.width,goods_list.height)
        let setting = {
            item_class : ActionFuncOneItem,      //-- 单元类
            start_x : 0,                  //-- 第一个单元的X起点
            space_x : 25,                   // -- x方向的间隔
            start_y : 0,                    //-- 第一个单元的Y起点
            space_y : 10,                   //-- y方向的间隔
            item_width : 115,               //-- 单元的尺寸width
            item_height : 129,              //-- 单元的尺寸height
            row : 0,                        //-- 行数，作用于水平滚动类型
            col : 4,                         //-- 列数，作用于垂直滚动类型
        }
        self.item_scrollview = new CommonScrollView();
        self.item_scrollview.createScroll(goods_list, cc.v2(0,0) , ScrollViewDir.vertical, ScrollViewStartPos.top, scroll_size, setting)
        self.updateView()
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        this.addGlobalEvent(ActionEvent.UPDATA_FUND_DATA_EVENT,function(id){
            if (this.fund_bid == id){
                this.setData();
            }
        }.bind(this))
        this.buy_btn.on("click",this._onClickBuyBtn,this)
        this.get_btn.on("click",this._onClickGetBtn,this);
        this.btn_award_nd.on("click",this._onClickAwardBtn,this);
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow:function(params){

    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide:function(){

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete:function(){
        if(this.award_node){
            this.award_node.deleteMe();
            this.award_node = null;
        }
        if(this.item_scrollview){
            this.item_scrollview.deleteMe();
            this.item_scrollview = null;
        }
    },
    setVisibleStatus(bool){
        bool = bool || false;
        this.setVisible(bool) ;
        if (bool == true){ 
            let srv_data = this._model.getFundSrvDataById(this.fund_bid)
            if (!srv_data || Utils.next(srv_data) == null ){// --没有数据时则请求
                this._controller.sender24701(this.fund_bid);
            }
        }
    },
    // -- 更新整个界面
    updateView(  ){
        var self = this;
        if(!self.fund_bid)  return ;
        let config = Config.month_fund_data.data_fund_data[self.fund_bid];
        if (!config) return;

        self.func_config = config;
        // -- 描述内容
        self.desc_rt.string = StringUtil.parse(config.desc);
        // -- 档次
        self.buy_btn_label.string = config.val;

        self.setData()
    },
    // -- 设置服务器数据相关UI显示
    setData(  ){
        var self = this;
        let srv_data = this._model.getFundSrvDataById(self.fund_bid);
        if (!srv_data || Utils.next(srv_data) == null){
             return;
        }

        self.srv_data = srv_data;

        // -- 30天奖励
        let award_list = Config.month_fund_data.data_fund_award[srv_data.group_id] || {};

        // -- 部分奖励数据预览
        if (self.func_config){
            let award_data = []
            for(let i=0;i<self.func_config.reward.length;++i){
                let day = self.func_config.reward[i]
                let day_award = {}
                day_award.day = day
                day_award.award = award_list[day] || {}
                award_data.push(day_award)
            }
            self.item_scrollview.setData(award_data)
        }

        // -- 购买状态
        if (srv_data.status == 0 || srv_data.status == 3){
            self.not_buy_panel.active = true;
            self.buy_panel.active = false;
            let labelOutline = this.buy_btn.getChildByName("label").getComponent(cc.LabelOutline)
            if (srv_data.status == 0 ){
                Utils.setGreyButton(this.buy_btn.getComponent(cc.Button),false);
                labelOutline.enabled = true;
            }else{
                Utils.setGreyButton(this.buy_btn.getComponent(cc.Button),true);
                labelOutline.enabled = false;
            }
        }else if(srv_data.status == 1 || srv_data.status == 2){
            self.not_buy_panel.active = false;
            self.buy_panel.active = true;

        //     -- 当前累计几天
            self.total_day_txt.getComponent(cc.Label).string = "現在のログイン合計："+ srv_data.current_day+ "日";
        //     -- 领取时间
            let begin_time = srv_data.endtime - (30*24*60*60);
            self.time_txt.getComponent(cc.Label).string =  TimeTool.getYMD5(begin_time) + "~" + TimeTool.getYMD5(srv_data.endtime-1);
        //     -- 奖励图标
            let award = award_list[srv_data.current_day] || []
            if (award){
                let bid = award[0][0]
                let num = award[0][1]
                if (!self.award_node){
                    self.award_node =  ItemsPool.getInstance().getItem("backpack_item");
                    self.award_node.setDefaultTip(true,false);
                    self.award_node.setPosition(108, 104);
                    self.award_node.setParent(this.buy_panel);
                    self.award_node.show();
                }
                self.award_node.setData({bid:bid, num:num});
            }
        
        //  -- 领取按钮状态
            let line = this.get_btn.getChildByName("label").getComponent(cc.LabelOutline);
            if (srv_data.status == 1){
                Utils.setGreyButton(this.get_btn.getComponent(cc.Button),false);
                line.enabled = true;
            }else{
                Utils.setGreyButton(this.get_btn.getComponent(cc.Button),true);
                line.enabled = false;
            }
        }
    },
    _onClickGetBtn(){
        Utils.playButtonSound(1)
        if (this.srv_data && this.srv_data.status == 1){
            this._controller.sender24702(this.srv_data.id);
        }
    },
    _onClickAwardBtn(){
        Utils.playButtonSound(1)
        if (this.srv_data){
            this._controller.openActionFundAwardWindow(true, this.srv_data.group_id, this.fund_bid)
        }
    },
    _onClickBuyBtn(){
        if(this.srv_data && this.srv_data.status == 0 && this.func_config){
            let charge_id = this.func_config.charge_id
            let charge_config = Config.charge_data.data_charge_data[charge_id || 0]
            if(charge_config){
                SDK.pay(charge_config.val, 1, charge_config.id, charge_config.name, charge_config.product_desc,null,null,charge_config.pay_image) 
            }
        }else if(this.srv_data && this.srv_data.status == 3){
            message(Utils.TI18N("请先激活至尊月卡"))
        }
    },
})