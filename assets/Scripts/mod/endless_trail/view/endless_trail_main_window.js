// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-04 21:13:06
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var PlayerHead = require("playerhead");
var CommonScrollView = require("common_scrollview");
var MainuiController = require("mainui_controller");
var HeroController = require("hero_controller");
var PartnerConst = require("partner_const");
var CommonAlert = require("commonalert");
var Endless_trailEvent = require("endless_trail_event");


var Endless_trail_mainWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("endlesstrail", "endlesstrail_window");
        this.viewTag = SCENE_TAG.ui;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Full;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        // 今日已挑战或者今日没挑战的状态
        this.ack_status = 0

        this.rank_list = {}
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        this.background = this.seekChild(this.root_wnd, "bigbackground");
        this.background.scale = FIT_SCALE;
        this.bigbackground = this.seekChild(this.root_wnd, "bigbackground", cc.Sprite);
        this.loadRes(PathTool.getBigBg("bigbg_2","jpg"), (function(resObject){
            this.bigbackground.spriteFrame = resObject;
        }).bind(this));

        this.title_label = this.root_wnd.getChildByName("title_label").getComponent(cc.Label);
        this.title_label.string = Utils.TI18N("无尽试炼");

        this.main_panel = this.root_wnd.getChildByName("main_panel");
        
        this.bg_node = this.main_panel.getChildByName("bg");
        this.bg_node.scale = 2;
        this.bg = this.bg_node.getComponent(cc.Sprite);
        this.loadRes(PathTool.getBigBg("bigbg_51"), (function(resObject){
            this.bg.spriteFrame = resObject;
        }).bind(this));
        
    
        this.friend_btn = this.main_panel.getChildByName("friend_btn");
        this.firend_red_point = this.friend_btn.getChildByName("red_point");
        this.firend_red_point.active = false;
        var label = this.friend_btn.getChildByName("label").getComponent(cc.Label);
        label.string = Utils.TI18N("好友助阵");
        
        this.ack_btn = this.main_panel.getChildByName("ack_btn");
        this.ack_btn_label = this.ack_btn.getChildByName("label").getComponent(cc.Label);
        this.ack_btn_label.string = Utils.TI18N("开始挑战");
        this.ack_btn_red_point = this.ack_btn.getChildByName("red_point");

        this.tips_button = this.main_panel.getChildByName("tips_button");
        this.rank_container = this.main_panel.getChildByName("rank_container");
        var rank_desc_label  = this.rank_container.getChildByName("rank_desc_label").getComponent(cc.Label);
        rank_desc_label.string = Utils.TI18N("闯关排行榜");
        this.rank_info_btn = this.rank_container.getChildByName("rank_info_btn");

        this.first_container = this.main_panel.getChildByName("first_container");
        this.get_btn = this.first_container.getChildByName("get_btn");
        var label = this.get_btn.getChildByName("label").getComponent(cc.Label);
        label.string = Utils.TI18N("受取")

        this.first_label = Utils.createRichLabel(20, new cc.Color(0xff,0xff,0xff, 0xff), cc.v2(0, 1), cc.v2(0, this.first_container.height),30,1000);
        this.first_label.horizontalAlign = cc.macro.TextAlignment.LEFT;
        this.first_container.addChild(this.first_label.node);
        
        this.limit_label = Utils.createRichLabel(20, new cc.Color(0xff,0xff,0xff, 0xff), cc.v2(0, 0.5), cc.v2(this.first_container.width, this.first_container.height/2),30,1000);
        this.limit_label.node.active = false;
        this.limit_label.horizontalAlign = cc.macro.TextAlignment.RIGHT;
        this.first_container.addChild(this.limit_label.node);

        this.sum_reward_container = this.main_panel.getChildByName("sum_reward_container");
        this.info_btn = this.sum_reward_container.getChildByName("info_btn");
        var reward_desc_label  = this.sum_reward_container.getChildByName("reward_desc_label").getComponent(cc.Label);
        reward_desc_label.string = Utils.TI18N("玩法\n奖励");

        this.rank_reward_container = this.main_panel.getChildByName("rank_reward_container");
        var rank_reward_lab = this.rank_reward_container.getChildByName("label").getComponent(cc.Label);
        rank_reward_lab.string = Utils.TI18N("排名奖励");
        
        var rank_my_title_lab = this.rank_reward_container.getChildByName("my_title").getComponent(cc.Label);
        rank_my_title_lab.string = Utils.TI18N("我的排名:");
        
        this.my_rank_value = this.rank_reward_container.getChildByName("my_rank").getComponent(cc.Label);;
        this.rank_notice = this.rank_reward_container.getChildByName("rank_notice").getComponent(cc.Label);
        this.rank_notice.string = Utils.TI18N("暂无排行奖励");

        this.my_round_container = this.main_panel.getChildByName("my_round_container");
        var round_desc_label  = this.my_round_container.getChildByName("round_desc_label").getComponent(cc.Label);
        round_desc_label.string = Utils.TI18N("个人记录");

        this.close_btn = this.main_panel.getChildByName("close_btn");

        this.floor_round = this.my_round_container.getChildByName("floor_round").getComponent("CusRichText");

        this.friend_container = this.main_panel.getChildByName("friend_container");
        var friend_lab = this.friend_container.getChildByName("label_1").getComponent(cc.Label);
        friend_lab.string = Utils.TI18N("已选择:");
        this.friend_power = this.friend_container.getChildByName("power").getComponent(cc.Label);
        this.friend_head = new PlayerHead();
        this.friend_head.setScale(0.5);
        this.friend_head.setPosition(-30, 0);
        this.friend_head.setParent(this.friend_container);
        this.friend_head.show();

        //一些文本
        this.friend_label = Utils.createRichLabel(20, new cc.Color(0x68,0x45,0x2a, 0xff), cc.v2(0.5, 0.5), cc.v2(134,27),22,280);
        this.main_panel.addChild(this.friend_label.node);

        this.from_label = Utils.createRichLabel(20, new cc.Color(0x68,0x45,0x2a, 0xff), cc.v2(0.5, 0.5), cc.v2(494,140),22,280);
        this.main_panel.addChild(this.from_label.node);

        this.has_label = Utils.createRichLabel(20, new cc.Color(0x68,0x45,0x2a, 0xff), cc.v2(0.5, 0.5), cc.v2(494,27),22,280);
        this.main_panel.addChild(this.has_label.node);

        this.can_reward_label = this.main_panel.getChildByName("can_reward_label").getComponent(cc.Label);
        this.can_reward_label.node.active = false;
        this.can_reward_label.string = Utils.TI18N("（已获所有日常结算奖励）");

        //Utils.getNodeCompByPath("main_panel/close_btn/label", this.root_wnd, cc.Label).string = Utils.TI18N("返回");
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        Utils.onTouchEnd(this.close_btn, function () {
            this.ctrl.openEndlessMainWindow(false);
        }.bind(this), 2);

        Utils.onTouchEnd(this.get_btn, function () {
            if(this.first_data){
                this.ctrl.send23904(this.first_data.id)  ;
            }
        }.bind(this), 1);

        Utils.onTouchEnd(this.info_btn, function () {
            this.ctrl.openEndlessRewardWindow(true)
            // --ctrl:openEndlessBuffView(true)
        }.bind(this), 1);
       
        Utils.onTouchEnd(this.rank_info_btn, function () {
            this.ctrl.openEndlessRankView(true,Endless_trailEvent.type.rank)
        }.bind(this), 1);
        
        Utils.onTouchEnd(this.tips_button, function () {
            if(Config.endless_data.data_explain){
                MainuiController.getInstance().openCommonExplainView(true,  Config.endless_data.data_explain, Utils.TI18N("玩法规则"));
            }
        }.bind(this), 1);

        Utils.onTouchEnd(this.ack_btn, function () {
            var has_hire_list = this.model.getHasHirePartnerData() || {};
            var list = has_hire_list.list || {};
            if(this.ack_status == 2){
                CommonAlert.show(Utils.TI18N("本日已不可获得通关累计奖励，但依然可以继续挑战<color=#289b14>首通奖励</color>和<color=#289b14>排行榜排名</color>，是否确认继续挑战？"), Utils.TI18N("确定"), function(){
                    HeroController.getInstance().openFormGoFightPanel(true, PartnerConst.Fun_Form.EndLess, {has_hire_list: list})
                }, Utils.TI18N("取消"), null)//CommonAlert.type.rich
            }else{
                HeroController.getInstance().openFormGoFightPanel(true, PartnerConst.Fun_Form.EndLess, {has_hire_list: list})
            }
        }.bind(this), 1);

        Utils.onTouchEnd(this.friend_btn, function () {
            if(Config.endless_data.data_explain){
                this.ctrl.openEndlessFriendHelpView(true);
            }
        }.bind(this), 1);

        this.addGlobalEvent(Endless_trailEvent.UPDATA_BASE_DATA,function(data){
            if(data){
                this.updateBaseInfo(data);
            }
        }.bind(this));

        this.addGlobalEvent(Endless_trailEvent.UPDATA_FIRST_DATA,function(data){
            if(data){
                this.updateFirstItem(data);
            }
        }.bind(this));

        this.addGlobalEvent(Endless_trailEvent.UPDATA_REDPOINT_SENDPARTNER_DATA,function(bool){
            if(this.firend_red_point){
                this.firend_red_point.active = bool;
            }
        }.bind(this));

        this.addGlobalEvent(Endless_trailEvent.UPDATA_REDPOINT_FIRST_DATA,function(status){
            if(this.get_btn){
                Utils.addRedPointToNodeByStatus( this.get_btn, status, 5, 5)
            }
        }.bind(this));

        this.addGlobalEvent(Endless_trailEvent.UPDATA_REDPOINT_REWARD_DATA,function(status){
            if(this.ack_btn_red_point){
                if(status == null){
                    status = false;
                }
                this.ack_btn_red_point.active = status;
            }
        }.bind(this));
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(params){
        this.ctrl.send23900();
        this.ctrl.send23903();
    },

    updateBaseInfo:function(data){
        this.base_data = data;
        if(this.base_data){
            this.floor_round.setNum(data.max_round);
            this.from_label.string = cc.js.formatStr(Utils.TI18N("从%s关开始"),data.current_round);
            this.has_label.string = cc.js.formatStr(Utils.TI18N("今天已通关%s关"),data.day_pass_round);
            if(data.day_pass_round == 0){
                this.ack_btn_label.string = Utils.TI18N("开始挑战");
            }else{
                this.ack_btn_label.string = Utils.TI18N("重新开始");
            }

            if(data.day_pass_round  != 0 && data.is_reward == 1){
                this.ack_status = 2;
            }else{
                this.ack_status = 1;
            }

            if(data.is_employ == false && Utils.next(data.list || {}) == null){//没雇佣伙伴
                this.friend_label.string = Utils.TI18N("选择一位好友的英雄帮助");
                this.friend_container.active = false;
            }else{
                if(data.list && data.list[0]){
                    var partner_data = data.list[0];
                    this.friend_label.string = "";
                    this.friend_container.active = true;
                    this.friend_head.setHeadRes(partner_data.bid)
                    this.friend_power.string = partner_data.power;
                }
            }

            // // 达到上限
            // if(data.is_reward == 1){
            //     this.can_reward_label.node.active = true;
            //     // this.has_label.node.y = 42;
            // }else{
            //     this.can_reward_label.node.active = false;
            //     // this.has_label.node.y = 27;
            // }

            this.updateRankData();
            this.updateSumItem();
            //  自己当前排名奖励
            this.updateRankItem();
        }

    },

    updateFirstItem:function(data){
        if(data && Config.endless_data.data_first_data && this.base_data){
            this.first_data = data;
            var first_data = Config.endless_data.data_first_data[this.first_data.id];
            if(this.first_data.id == 0){
                var str = Utils.TI18N("【已领完所有首通奖励！ヾ(*・ω・)ノ゜】");
                this.limit_label.string = str;
                this.limit_label.node.active = true;
                if(this.item_scrollview){
                    this.item_scrollview.active = false;
                }
                this.get_btn.active = false;
            }else{
                if(first_data){
                    if(!this.item_scrollview){
                        var setting = {
                            item_class: "backpack_item",      // 单元类
                            start_x: 0,                  // 第一个单元的X起点
                            space_x: 2,                    // x方向的间隔
                            start_y: -17,                    // 第一个单元的Y起点
                            space_y: 0,                   // y方向的间隔
                            item_width: 119,               // 单元的尺寸width
                            item_height: 119,              // 单元的尺寸height
                            row: 1,                        // 行数，作用于水平滚动类型
                            col: 0,                         // 列数，作用于垂直滚动类型
                        }
                        
                        this.item_scrollview = new CommonScrollView();
                        this.item_scrollview.createScroll(this.first_container, cc.v2(0,0), ScrollViewDir.horizontal, ScrollViewStartPos.bottom, cc.size(300,85), setting);
                    }
                    var str = cc.js.formatStr("<color=#ffffff fontsize=22><outline color=#c45a14 width=1>初クリア報酬(第%sステージ)</outline></color>",first_data.limit_id)
                    this.first_label.string = str;

                    if(this.first_data.status == 1){
                        this.get_btn.active = true;
                        this.limit_label.node.active = false;
                    }else{
                        str = cc.js.formatStr(Utils.TI18N("<color=#249003>%s</color>关后可领"), first_data.limit_id - this.base_data.max_round)
                        this.limit_label.string = str;
                        this.limit_label.node.active = true;
                        this.get_btn.active = false;
                    }
                    var temp_list = [];
                    for(var i in first_data.items){
                        temp_list.push({bid:first_data.items[i][0],num: first_data.items[i][1]});
                    }
                    this.item_scrollview.setData(temp_list,null,{is_show_tips: true,scale: 0.7});
                    this.item_scrollview.setRootVisible(true)
                }
            }
        }
    },

    // 更新玩法奖励
    updateSumItem:function(){
        if(Config.endless_data.data_const){
            var item_list =Config.endless_data.data_const["reward_show"].val || {};
            if(!this.sum_item_scrollview){
                var setting = {
                    item_class: "backpack_item",      // 单元类
                    start_x: 0,                  // 第一个单元的X起点
                    space_x: -24,                    // x方向的间隔
                    start_y: -17,                    // 第一个单元的Y起点
                    space_y: 0,                   // y方向的间隔
                    item_width: 119,               // 单元的尺寸width
                    item_height: 119,              // 单元的尺寸height
                    row: 1,                        // 行数，作用于水平滚动类型
                    col: 0,                         // 列数，作用于垂直滚动类型
                }
                this.sum_item_scrollview = new CommonScrollView();
                this.sum_item_scrollview.createScroll(this.sum_reward_container, cc.v2(70,26), ScrollViewDir.horizontal, ScrollViewStartPos.bottom, cc.size(400,85), setting);
            }
            var temp_list = [];
            for(var i in item_list){
                var vo = Utils.deepCopy(Utils.getItemConfig(item_list[i]));
                temp_list.push(vo);
            }
            this.sum_item_scrollview.setData(temp_list,null,{is_show_tips: true,scale:0.7});
        }
    },

    //  排名奖励
    updateRankItem:function(){
        if(this.base_data == null)return;
        if(this.base_data.my_idx == null)return;
        var config = null;
        for(var i in Config.endless_data.data_rank_reward_data){
            var v = Config.endless_data.data_rank_reward_data[i];
            if(this.base_data.my_idx >= v.min && this.base_data.my_idx <= v.max){
                config = v;
                break;
            }
        }
        if(config == null){//未上榜
            this.rank_notice.node.active = true;
            if(this.rank_item_scrollview){
                this.rank_item_scrollview.setRootVisible(false);
            }
            this.my_rank_value.string = Utils.TI18N("暂未上榜");
        }else{
            this.rank_notice.node.active = false;
            this.my_rank_value.string = this.base_data.my_idx;
            var temp_list = [];
            for(var j in config.items){
                temp_list.push({bid:config.items[j][0],num:config.items[j][1]});
            }
            if(!this.rank_item_scrollview){
                var setting = {
                    item_class: "backpack_item",
                    start_x: -16,
                    space_x: -40,
                    start_y: -22,
                    space_y: 0,
                    item_width: 119,
                    item_height: 119,
                    row: 1,
                    col: 0,
                }
                this.rank_item_scrollview = new CommonScrollView();
                this.rank_item_scrollview.createScroll(this.rank_reward_container, cc.v2(10,50), ScrollViewDir.horizontal, ScrollViewStartPos.bottom, cc.size(270,70), setting);
            }
            this.rank_item_scrollview.setData(temp_list,null,{is_show_tips: true,scale: 0.55});
            this.rank_item_scrollview.setRootVisible(true);
        }
    },

    // 更新排行榜
    updateRankData:function(){
        var rank_list = this.model.getRaknRoleTopThreeList();
        if(rank_list && Utils.next(rank_list || {}) != null){
            for(var i in rank_list){
                if(!this.rank_list[i]){
                    var item = this.createSingleRankItem(i, rank_list[i])
                    this.rank_container.addChild(item)
                    this.rank_list[i] = item;
                }
                var item = this.rank_list[i];
                if(item){
                    item.setPosition(10, 136 - (parseInt(i)) * item.getContentSize().height);
                    item.label.string = rank_list[i].name;
                    item.value.string = (rank_list[i].val || 0);//+Utils.TI18N("关");
                }
            }
        }
    },

    // 排行榜单项
    createSingleRankItem:function(i, data){
        var container = new cc.Node();
        container.setAnchorPoint(0,1);
        container.setContentSize(180,50);
        
        var sp = Utils.createImage(container,null,30,40/2,cc.v2(0.5, 0));
        var res = PathTool.getCommonIcomPath("common_300"+ (parseInt(i)+1));
        this.loadRes(res, function (sf_obj) {
            sp.spriteFrame = sf_obj;
        }.bind(this))
        sp.node.scale = 0.7;
        
        var label = Utils.createLabel(20,new cc.Color(0xff,0xff,0xff,0xff),null,70,20,"",container,0,cc.v2(0,0));
        
        var value = Utils.createLabel(20,new cc.Color(0xff,0x9b,0x1e,0xff),null,208,20,"",container,0,cc.v2(0,0));
        
        container.label = label
        container.value = value
        return container
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        if(this.item_scrollview){
            this.item_scrollview.deleteMe();
            this.item_scrollview = null;
        }

        if(this.sum_item_scrollview){
            this.sum_item_scrollview.deleteMe();
            this.sum_item_scrollview = null
        }
        
        if(this.rank_item_scrollview){
            this.rank_item_scrollview.deleteMe();
            this.rank_item_scrollview = null;
        }

        if(this.friend_head){
            this.friend_head.deleteMe();
        }
        this.friend_head = null;

        this.ctrl.openEndlessMainWindow(false);
    },
})