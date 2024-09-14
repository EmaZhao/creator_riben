// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     幸运探宝
// <br/>Create: 2019-04-23 15:45:43
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var BackpackController = require("backpack_controller");
var RoleController = require("role_controller")
var MainuiController = require("mainui_controller");
var ActionEvent = require("action_event");
var ROUND_COUNT = 8;
var slow_start = 3;//开始减少灯的个数
var reward_pos = [[0,204],[148,133],[221,-19],[143,-165],[0,-239],[-142,-170],[-225,-19],[-144,136]];
// 数字的转换  从0开始
var change_pos = [0,1,2,3,4,5,6,7,0]//越界处理



var Action_treasureWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("action", "action_treasure_window");
        this.viewTag = SCENE_TAG.ui;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Full;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();
        var MallController = require("mall_controller")
        if(MallController.getInstance().getMallView()){
            MallController.getInstance().getMallView().setVisible(false)
        }
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        this.touchEnable = false; //防止乱点，必须等到本地抽奖完成之后才能进行下一次
        this.touchRefresh = false;
        this.tab_list = [];
        this.cur_index = null;
    
        this.desc_item_name = [];
        this.desc_item_Lv = [];
    
        // 拥有的劵数
        this.hasTreasure_num = [];
        // 点击的探宝类型  -- 1  2
        this.touchTreasure_type = 1;
        // 查看更多里面的个数
        this.checkMoreCount = 1;
        //标签页红点
        //  this.tabRedPoint = {false,false}
        // 点击刷新控制特效
        this.touchEffect = [true,true];
        // 探宝记录
        this.getRewardList = [];
        // 幸运值达到领取奖励数字
        this.arriveLuckly_label = [];
    
        this.item_list = [];
        this.luckly_item = [];
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        this.bigbg = this.root_wnd.getChildByName("bg");
        this.bigbg.scale = FIT_SCALE*2;

        this.bg = this.root_wnd.getChildByName("bg").getComponent(cc.Sprite);
        let path = PathTool.getUIIconPath("bigbg/action","action_treasure","jpg");
        this.loadRes(path,function(res){
            this.bg.spriteFrame = res
        }.bind(this));

        this.background = this.root_wnd.getChildByName("background");

        var main_container = this.root_wnd.getChildByName("main_container");
        this.main_container = main_container;
        

        this.text_scroll = main_container.getChildByName("text_scroll");
        this.content = this.text_scroll.getChildByName("content");
        this.probablity = main_container.getChildByName("probablity");
        this.probablity.active = false;

        this.item_panel = main_container.getChildByName("item_panel");
        this.round_certer_node = this.item_panel.getChildByName("round");
        this.round_certer_node.scale = 1;
        this.round_certer = this.round_certer_node.getComponent(cc.Sprite);
        this.btnLockOther = this.item_panel.getChildByName("btnLockOther");
        var text_6 = main_container.getChildByName("Text_6").getComponent(cc.Label);
        text_6.string = Utils.TI18N("次回の無料更新：");
        this.refresh_time = main_container.getChildByName("refresh_time").getComponent(cc.Label);
        this.refresh_time.string = "00:00:00";
        
        this.run_light = Utils.createImage(this.item_panel,null,0, 0,cc.v2(0.5, 0.5),null,10);
        this.run_light.active =false;
        var res = PathTool.getUIIconPath("welfare","welfare_37");
        this.loadRes(res, function (sf_obj) {
            this.run_light.spriteFrame = sf_obj;
        }.bind(this))

        this.status_count = 0;
    
        this.model.setLucklyRewardData();
        this.model.setBuyRewardData();

        var text_2 = main_container.getChildByName("Text_2").getComponent(cc.Label);
        text_2.string = Utils.TI18N("探宝记录");
        
        var treasure_bg = this.main_container.getChildByName("treasure_bg");
        this.treasure_total = Utils.createRichLabel(22, new cc.Color(0xff,0xff,0xf8,0xff), cc.v2(0, 0.5), cc.v2(-treasure_bg.width/2,0),45,150);
        this.treasure_total.horizontalAlign = cc.macro.TextAlignment.LEFT;
        treasure_bg.addChild(this.treasure_total.node);

        this.luckyBar = main_container.getChildByName("luckyBar");

        var tab_container = main_container.getChildByName("tab_container");
        var text_title = [Utils.TI18N("幸运探宝"),Utils.TI18N("高级探宝")];
        for(var i=1;i<=2;i++){
            var tab_btn = tab_container.getChildByName(cc.js.formatStr("tab_btn_%s",i));
            tab_btn.label = tab_btn.getChildByName("title").getComponent(cc.Label);
            tab_btn.label.string = text_title[i-1];
            tab_btn.normal = tab_btn.getChildByName("normal");
            tab_btn.select = tab_btn.getChildByName("select");
            tab_btn.select.active =false;
            tab_btn.redpoint = tab_btn.getChildByName("redpoint");
            tab_btn.redpoint.active = false;
            tab_btn.label.node.color = new cc.Color(0xff,0xc3,0x8d, 0xff);
            tab_btn.index = i;
            this.tab_list[i] = tab_btn;
        }

        for(var i=1;i<=2;i++){
            var buy_reward_data = this.model.getBuyRewardData(i);
            var lottery_id = buy_reward_data[0].expend_item[0][0];
            this.hasTreasure_num[i] = BackpackController.getInstance().getModel().getBackPackItemNumByBid(lottery_id);
        }

        this.btnTreasure = [];
        for(var i=1;i<=3;i++){
            var tab = {};
            tab.btn = main_container.getChildByName("btn_treasure_"+i);
            tab.price = Utils.createRichLabel(24, new cc.Color(0xff,0xff,0xff,0xff), cc.v2(0.5, 0.5), cc.v2(0,0),31);
            tab.btn.addChild(tab.price.node);
            this.btnTreasure[i] = tab;
        }

        this.text_lucky_num = main_container.getChildByName("text_lucky_num").getComponent(cc.Label);
        this.text_lucky_num.string = "";
        this.btnRule = main_container.getChildByName("btnRule"); 
        this.btn_shop = main_container.getChildByName("btn_shop");
        var text_1 = this.btn_shop.getChildByName("Text_1").getComponent(cc.Label);
        text_1.string = Utils.TI18N("探宝商店");
        this.btn_return = main_container.getChildByName("btn_return");
        //var text_3 = this.btn_return.getChildByName("Text_3").getComponent(cc.Label);
        //text_3.string = Utils.TI18N("返回");

        Utils.getNodeCompByPath("main_container/item_panel/btnLockOther/Text_4", this.root_wnd, cc.Label).string = Utils.TI18N("查看更多");
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        this.addGlobalEvent(ActionEvent.UPDATE_LUCKYROUND_GET,function(data){
            if(!data){
                this.ctrl.openLuckyTreasureWin(false);
                return;
            }
            this.changeTabView(this.cur_index || this.jump_index);
        }.bind(this));

        this.addGlobalEvent(ActionEvent.TREASURE_SUCCESS_DATA,function(data){
            if(!data)return;
            if(data.code == 0){
                this.touchEnable = false;
                message(data.msg);
                return;
            }
            this.showRewardList = data;
            this.pos = 0;
            this.runProcess= 0;
            this.process = this.status_count; //开始的位置
            this.speed = 1;
            this.addSpeed = 0;
            this.targetPos = data.awards3[0].pos - 1; //停灯的位置(从0开始)
            this.step = 0;
            this.round = 5; //圈数
            if(this.targetPos <= 3){
                this.round = 4;
            }

            this.runLightUniformSpeedHide();
            if(this.lottery_ticket == null){
                this.lottery_ticket = gcore.Timer.set((function () {
                    this.runHandler();
                }).bind(this), 30,-1);
            }
        }.bind(this));

        this.addGlobalEvent(ActionEvent.UPDATA_TREASURE_LOG_DATA,function(data){
            if(!data){
                return;
            }
            this.model.updataTreasureLogData(data.type, data.log_list);
            var initData = this.model.getTreasureInitData(data.type);
            this.showTreasureLog(initData);
        }.bind(this));

        // 弹窗
        this.addGlobalEvent(ActionEvent.UPDATA_TREASURE_POPUPS_SEND,function(data){
            this.showRewardList = data;
            this.runLightReward();
        }.bind(this));

        this.addGlobalEvent(ActionEvent.UPDATE_LUCKLY_DATA,function(data){
            if(!data)return;
            var buy_reward_data = this.model.getBuyRewardData(data.type);
            var lottery_id = buy_reward_data[0].expend_item[0][0];
            this.hasTreasure_num[data.type] = BackpackController.getInstance().getModel().getBackPackItemNumByBid(lottery_id);
            if(this.hasTreasure_num[data.type] <= 0){
                this.hasTreasure_num[data.type] = 0;
            }
            var item_config = Utils.getItemConfig(lottery_id);
            if(item_config){
                var res = PathTool.getItemRes(item_config.icon);
                var str = cc.js.formatStr(Utils.TI18N("<img src='%s'/>  %d"),item_config.icon,this.hasTreasure_num[data.type]);
                this.treasure_total.string =str;
                this.loadRes(res, (function (resObject) {
                    this.treasure_total.addSpriteFrame(resObject);
                }).bind(this));
            }
            this.model.updataTreasureInitData(data.type, data);

            var luckly_list = this.model.getLucklyRewardData(data.type);
            var initData = this.model.getTreasureInitData(data.type);
            this.commonShowData(initData, luckly_list);
        }.bind(this));

        this.addGlobalEvent(EventId.ADD_GOODS,function(bag_code,temp_list){
            this.changeTreasureNumber(temp_list);
        }.bind(this));

        this.addGlobalEvent(EventId.DELETE_GOODS,function(bag_code,temp_list){
            this.changeTreasureNumber(temp_list);
        }.bind(this));

        this.addGlobalEvent(EventId.MODIFY_GOODS_NUM,function(bag_code,temp_list){
            this.changeTreasureNumber(temp_list);
        }.bind(this));

        for(var i in this.tab_list){
            Utils.onTouchEnd(this.tab_list[i], function (tab_btn) {
                if(this.touchEnable == true)return;
                this.probablity.active = false;
                var role_ve = RoleController.getInstance().getRoleVo();
                var data = this.model.getBuyRewardData(tab_btn.index);
                if(data && data[0].limit_open){
                    if(role_ve.lev >= data[0].limit_open[0][1]){
                        this.changeTabvarData(tab_btn.index);
                        this.changeTabView(tab_btn.index);
                    }else{
                        var str = cc.js.formatStr(Utils.TI18N("人物等级%d级开启"),data[0].limit_open[0][1]);
                        message(str);
                    }
                }
            }.bind(this,this.tab_list[i]), 1);
        }

        Utils.onTouchEnd(this.btn_return, function () {
            this.ctrl.openLuckyTreasureWin(false);
        }.bind(this), 2);

        this.btnRule.on(cc.Node.EventType.TOUCH_END, function (event) {
            Utils.playButtonSound(1);
            var config = Config.dial_data.data_const.game_rule1;
            if(this.cur_index == 2){
                config = Config.dial_data.data_const.game_rule2
            }
            var pos = event.touch.getLocation();
            require("tips_controller").getInstance().showCommonTips(config.desc, pos,null,null,500);
        },this);


        Utils.onTouchEnd(this.btnLockOther, function () {
            this.probablity.active = true;
            this.rewardProbility(this.cur_index);
        }.bind(this), 1);

        Utils.onTouchEnd(this.probablity, function () {
            this.probablity.active = false;
        }.bind(this), 1);

        Utils.onTouchEnd(this.background, function () {
            this.probablity.active = false;
        }.bind(this), 1);

        Utils.onTouchEnd(this.btn_shop, function () {
            var MallController = require("mall_controller")
            if(MallController.getInstance().getMallView()){
                this.setVisible(false)
            }
            var StrongerController = require("stronger_controller")
            StrongerController.getInstance().clickCallBack(406);
        }.bind(this), 1);

        for(var i in this.btnTreasure){
            Utils.onTouchEnd(this.btnTreasure[i].btn, function (i) {
                if(this.touchEnable == true){
                    message(Utils.TI18N("探宝进行中"));
                    return;
                }
                this.cur_index = this.cur_index || 1;

                if(i == 3){
                    var role_vo = RoleController.getInstance().getRoleVo();
                    if(role_vo.getTotalGold() < Config.dial_data.data_const.refreash.val[0][1] && this.touchEffect[this.cur_index] == false){
                        message(Utils.TI18N("钻石不足"));
                        return;
                    }
                    if(this.touchRefresh == true){
                        message(Utils.TI18N("刷新中..."));
                        return;
                    }
                    this.touchRefresh = true;
                    this.runLightUniformSpeedHide();
                    this.startRefreshAction();
                }else{
                    var data = this.model.getBuyRewardData(this.cur_index);
                    this.touchEnable = true
                    var _bool = MainuiController.getInstance().checkIsOpenByActivate(data[i-1].limit_open);
                    if(_bool == true){
                        this.touchTreasure_type = i;
                    }else{
                        this.touchEnable = false;
                    }
                    this.ctrl.send16638(this.cur_index, i);
                }
            }.bind(this,i), 1);
        }
    },

    // 倍率
    rewardProbility:function(index){
        index = index || 1;
        var config_data = [];
        var lev_index = 1;
        var role_ve = RoleController.getInstance().getRoleVo();
        config_data = Config.dial_data.data_magnificat_list[index];
        if(config_data == null){
            this.probablity.active = false;
            return;
        }

        for(var i in config_data){
            if(role_ve.lev >= config_data[i].min && role_ve.lev <= config_data[i].max){
                lev_index = i;
                break;
            }
        }

        var config = config_data[parseInt(lev_index)];

        for(var i=1;i<=this.checkMoreCount;i++){
            if(this.desc_item_name[i]){
                this.desc_item_name[i].node.active = false;
            }
            if(this.desc_item_Lv[i]){
                this.desc_item_Lv[i].node.active =false;
            }
        }

        this.checkMoreCount = config.award.length;
        var num = Math.floor(this.checkMoreCount/2);
        this.probablity.setContentSize(cc.size(this.probablity.getContentSize().width, 45*num));
        var pos_y = - 35;
        this.probablity.stopAllActions();
        for(var i=1;i<=this.checkMoreCount;i++){
            Utils.delayRun(this.probablity, i*2/cc.game.getFrameRate(),function(i,num){
                if(i <= num){
                    var item_config = Utils.getItemConfig(config.award[i-1][0]);
                    if(!this.desc_item_name[i]){
                        this.desc_item_name[i] = Utils.createLabel(26,new cc.Color(0x4c,0xd8,0x49,0xff),null,0,0,"",this.probablity,null, cc.v2(0,0.5));
                    }
                    if(this.desc_item_name[i]){
                        this.desc_item_name[i].node.active = true;
                        this.desc_item_name[i].node.setContentSize(cc.size(150,30));
                        this.desc_item_name[i].string = item_config.name;
                        this.desc_item_name[i].node.setPosition(-352,pos_y-36*(i-1));
                    }
                    
                    if(!this.desc_item_Lv[i]){
                        this.desc_item_Lv[i] = Utils.createLabel(26,new cc.Color(0xff,0xa7,0x2a,0xff),null,0,0,"",this.probablity,null, cc.v2(0,0.5));
                    }

                    if(this.desc_item_Lv[i]){
                        this.desc_item_Lv[i].node.active = true;
                        this.desc_item_Lv[i].string = config.award[i-1][1]+"%";
                        this.desc_item_Lv[i].node.setPosition(-90,pos_y-36*(i-1));
                    }
                }else{
                    var item_config = Utils.getItemConfig(config.award[i-1][0]);
                    if(!this.desc_item_name[i]){
                        this.desc_item_name[i] = Utils.createLabel(26,new cc.Color(0x4c,0xd8,0x49,0xff),null,0,0,"",this.probablity,null, cc.v2(0,0.5));
                    }
                    if(this.desc_item_name[i]){
                        this.desc_item_name[i].node.active = true;
                        this.desc_item_name[i].node.setContentSize(cc.size(150,30));
                        this.desc_item_name[i].string = item_config.name;
                        this.desc_item_name[i].node.setPosition(-5,pos_y-36*(i-(num+1)));
                    }
                    if(!this.desc_item_Lv[i]){
                        this.desc_item_Lv[i] = Utils.createLabel(26,new cc.Color(0xff,0xa7,0x2a,0xff),null,0,0,"",this.probablity,null, cc.v2(0,0.5));
                    }
                    if(this.desc_item_Lv[i]){
                        this.desc_item_Lv[i].node.active = true;
                        this.desc_item_Lv[i].string = config.award[i-1][1]+"%";
                        this.desc_item_Lv[i].node.setPosition(262,pos_y-36*(i-(num+1)));
                    }
                }
            }.bind(this,i,num));
        }
        
    },
    
    itemRewardPos:function(list){
        if(!list || Utils.next(list) == null)return;
        // 以12点钟方向为起点，顺时针
        for(var i=1;i<=list.length;i++){
            Utils.delayRun(this.item_panel, i*2/cc.game.getFrameRate(), function(i){
                if(!this.item_list[i]){
                    var item = ItemsPool.getInstance().getItem("backpack_item");
                    item.initConfig(true, 0.8, false, true);
                    item.setParent(this.item_panel)
                    item.show();
                    this.item_list[i] = item;
                }
                if(this.item_list[i]){
                    this.item_list[i].setPosition(reward_pos[i-1][0], reward_pos[i-1][1]);
                    this.item_list[i].setData({bid:Config.dial_data.data_get_rand_list[list[i-1].id][0].item_id, num:Config.dial_data.data_get_rand_list[list[i-1].id][0].item_num});
    
                    if(list[i-1]){
                        if(list[i-1].status == 1){
                            this.item_list[i].setItemIconUnEnabled(true);
                        }else if(list[i-1].status == 0){
                            this.item_list[i].setItemIconUnEnabled(false);
                        }
                    }
                    if(this.item_list[i].root_wnd){
                        this.item_list[i].root_wnd.active = true;
                    }
                }
            }.bind(this,i))
        }
        this.runLightUniformSpeed();
    },

    // 不需要服务端返回就可以显示的东西，避免UI出来时候有空挡
    changeTabvarData:function(index){
        if(this.cur_index == index)return;
        index = index || 1;

        let path = PathTool.getUIIconPath("bigbg/action","action_treasure_round_"+index);
        this.loadRes(path,function(res){
            this.round_certer.spriteFrame = res
        }.bind(this));

        var buy_reward_data = this.model.getBuyRewardData(index);

        var lottery_id = buy_reward_data[0].expend_item[0][0];
        var item_config = Utils.getItemConfig(lottery_id);
        
        var str = cc.js.formatStr(Utils.TI18N("<img src='%s'/>  %d"),item_config.icon,this.hasTreasure_num[index]);
        this.treasure_total.string = str;

        var res = PathTool.getItemRes(item_config.icon);
        this.loadRes(res, (function (resObject) {
            this.treasure_total.addSpriteFrame(resObject);
        }).bind(this));

        for(var i=1;i<=3;i++){
            if(i==3){
                var str = cc.js.formatStr(Utils.TI18N("<outline=2,color=#651D00>免费刷新</outline>"))
                this.btnTreasure[i].price.string = str;
                this.btnTreasure[i].price.node.setPosition(0,0);
            }else{
                var str = cc.js.formatStr(Utils.TI18N("<outline=2,color=#651D00>探宝%d次</outline>\n<img src='%s'/><color=#fffb94 fontsize=20><outline=2,color=#651D00> %d</outline></color>"), Config.dial_data.data_const.treasure_num.val[index-1][i-1], item_config.icon, buy_reward_data[i-1].expend_item[0][1])
                this.btnTreasure[i].price.string = str;
                this.loadRes(res, (function (item,resObject) {
                    item.addSpriteFrame(resObject);
                }).bind(this,this.btnTreasure[i].price));
            }
        }
        // Utils.delayRun(this.luckyBar, 10/30, function(index){
        //     this.initRoundItem(index);
        // }.bind(this,index))
        
        this.initRoundItem(index);
    },

    initRoundItem:function(index){
        var barBG = this.main_container.getChildByName("Image_2_0");
        var luckly_num_data = this.model.getLucklyRewardData(index);
        var bar_interval = barBG.getContentSize().width / 5;
        for(var i=1;i<=5;i++){
            if(!this.luckly_item[i]){
                var RoundItem = require("round_item_panel");
                this.luckly_item[i] = new RoundItem(true,0.55,0.7);
                this.luckly_item[i].setParent(this.luckyBar)
                this.luckly_item[i].show();
                this.luckly_item[i].setPosition(bar_interval*i,0);
            }

            if(!this.arriveLuckly_label[i] && this.luckly_item[i]){
                this.arriveLuckly_label[i] = Utils.createLabel(28,new cc.Color(0xff,0xff,0xff,0xff),null,bar_interval*i,-40,"",this.luckyBar,null, cc.v2(0.5,0.5));
                this.arriveLuckly_label[i].node.scale = 0.55;
            }

            if(this.arriveLuckly_label[i]){
                this.arriveLuckly_label[i].string = luckly_num_data[i-1].lucky_val;
            }

            if(this.luckly_item[i]){
                this.luckly_item[i].setBaseData({bid:luckly_num_data[i-1].award[0][0], num:luckly_num_data[i-1].award[0][1]});
                this.luckly_item[i].setVisibleRedPoint(false);
                this.luckly_item[i].setVisibleRoundBG(false);
                var func = function(i){
                    this.ctrl.send16640(index, luckly_num_data[i-1].id);
                }.bind(this,i);
                this.luckly_item[i].addCallBack(func);
            }
        }
    },
    
    // 分段计算进度条
    sectionCalculation:function(num,luckly_list){
        num = num || 10;
        var segmeent = 20;
        var percent = 0;

        if(luckly_list[0] && luckly_list[1] && luckly_list[2] && luckly_list[3] && luckly_list[4]){
            if(num <= luckly_list[0].lucky_val){
                return num / luckly_list[0].lucky_val * segmeent/100;
            }else if(num > luckly_list[0].lucky_val && num <= luckly_list[1].lucky_val){
                percent = 1;
            }else if(num > luckly_list[1].lucky_val && num <= luckly_list[2].lucky_val){
                percent = 2;
            }else if(num > luckly_list[2].lucky_val && num <= luckly_list[3].lucky_val){
                percent = 3;
            }else if(num > luckly_list[3].lucky_val && num <= luckly_list[4].lucky_val){
                percent = 4;
            }else {
                return 1;
            }

            var adv = luckly_list[percent].lucky_val - luckly_list[percent-1].lucky_val;
            var count = num - luckly_list[percent-1].lucky_val;
            var percent_num = segmeent*percent + ( count / adv ) * segmeent;
            return percent_num/100;
        }else{
            return 0;
        }
    },

    // data:寻宝数据(服务端返回的)
    commonShowData:function(data, luckly_list){
        if(!Utils.next(data) || !Utils.next(luckly_list))return;
        var lucky_num = 0;
        if(luckly_list[4]){
            lucky_num = luckly_list[4].lucky_val;
        }
        this.text_lucky_num.string = data.lucky+"/"+lucky_num;
        var mul = this.sectionCalculation(data.lucky, luckly_list);
        this.luckyBar.getComponent(cc.ProgressBar).progress = mul;

        var refresh = data.end_time - gcore.SmartSocket.getTime();
        if(refresh > 0){
            this.model.setCountDownTime(this.refresh_time,refresh);
            var item_config = Utils.getItemConfig(Config.dial_data.data_const.refreash.val[0][0]);
            var res = PathTool.getItemRes(item_config.icon);
            var str = cc.js.formatStr(Utils.TI18N("<img src='%s'/><outline=2,color=#651D00> %d刷新</outline>"),item_config.icon,Config.dial_data.data_const.refreash.val[0][1])
            this.btnTreasure[3].price.string = str;
            this.touchEffect[data.type] = false;
            this.loadRes(res, (function (resObject) {
                this.btnTreasure[3].price.addSpriteFrame(resObject);
            }).bind(this));
        }else{
            var str = cc.js.formatStr(Utils.TI18N("<outline=2,color=#651D00>免费刷新</outline>"));
            this.btnTreasure[3].price.string = str;
            this.refresh_time.node.stopAllActions();
            this.refresh_time.string = "00:00:00";
            this.touchEffect[data.type] = true;
        }
        var status = false;
        for(var i in luckly_list){
            var _bool = true;
            for(var k in data.lucky_award){
                if(luckly_list[i].id == data.lucky_award[k].lucky){
                    _bool = false;
                    break;
                }
            }
            if(data.lucky < luckly_list[i].lucky_val){
                _bool = false;
            }

            if(this.luckly_item[parseInt(i)+1]){
                this.luckly_item[parseInt(i)+1].setItemUnEnabled(false);
                this.luckly_item[parseInt(i)+1].setDefaultTip(!_bool);
                status = status || _bool;
                this.luckly_item[parseInt(i)+1].setVisibleRedPoint(_bool);

                if(_bool == false && data.lucky >= luckly_list[i].lucky_val){
                    this.luckly_item[parseInt(i)+1].setItemUnEnabled(true);
                }
            }

        }
        this.model.setLucklyTabRedPoint(data.type,status);
        this.showRedpoint();
    },
    
    showRedpoint:function(){
        var totle_status = false;
        for(var i=1;i<=2;i++){
            var status = this.model.getLucklyTabRedPoint(i);
            this.tab_list[i].redpoint.active = status;
            totle_status = totle_status || status;
        }
        var MainuiConst = require("mainui_const");
        MainuiController.getInstance().setFunctionTipsStatus(MainuiConst.icon.lucky_treasure,totle_status)
    },

    showTreasureLog:function(data){
        if(!data || Utils.next(data) ==null)return;
        var str = "";
        var num = data.log_list.length;
        if(num >= 10){
            num = 10;
        }

        for(var i in this.getRewardList){
            if(this.getRewardList[i]){
                this.getRewardList[i].node.active = false;
            }
        }
        this.content.setContentSize(cc.size(this.text_scroll.getContentSize().width, 26*num));
        for(var i=0;i<num;i++){
            if(data.log_list[i]){
                this.getRewardList[i] = Utils.createRichLabel(22, new cc.Color(0xff,0xff,0xf8,0xff), cc.v2(0.5, 1), cc.v2(this.content.getContentSize().width/2,0),null,600);
                this.content.addChild(this.getRewardList[i].node);
            }
            if(this.getRewardList[i]){
                this.getRewardList[i].node.active = true;
                this.getRewardList[i].node.y = - 26*i;
                var item_config = Utils.getItemConfig(data.log_list[i].bid);
                str = cc.js.formatStr(Utils.TI18N(" <color=#4cd849>%s</color> 獲得 <color=#ffa72a>%s</color>"),data.log_list[i].role_name, item_config.name);
                this.getRewardList[i].string = str;
            }
        }
    },

    changeTabView:function(index){
        index = index || 1;
        if(this.cur_index == index)return;
        if(this.cur_tab!=null){
            this.cur_tab.label.node.color = new cc.Color(0xff,0xc3,0x8d, 0xff);
            this.cur_tab.normal.active = true;
            this.cur_tab.select.active = false;
        }
        this.cur_index = index;
        this.cur_tab = this.tab_list[this.cur_index];

        if(this.cur_tab!=null){
            this.cur_tab.label.node.color = new cc.Color(0xfe,0xff,0xcd, 0xff);
            this.cur_tab.normal.active = false;
            this.cur_tab.select.active = true;
        }

        this.touchEnable = false;
        var luckly_list = this.model.getLucklyRewardData(index);
        var initData = this.model.getTreasureInitData(index);
        this.commonShowData(initData, luckly_list);

        this.itemRewardPos(initData.rand_lists);
        Utils.delayRun(this.content, 20/cc.game.getFrameRate(), function(initData){
            this.showTreasureLog(initData);
        }.bind(this,initData))
        
    },

    // 更改探宝劵
    changeTreasureNumber:function(list){
        for(var i in list){
            if(list[i].base_id == 37001){
                this.hasTreasure_num[1] = BackpackController.getInstance().getModel().getBackPackItemNumByBid(37001);
                if(this.cur_index == 1){
                    var item_config = Utils.getItemConfig(37001);
                    var res = PathTool.getItemRes(item_config.icon);
                    var str = cc.js.formatStr(Utils.TI18N("<img src='%s'/>  %d"),item_config.icon,this.hasTreasure_num[1]);
                    this.treasure_total.string = str;
                    this.loadRes(res, (function (resObject) {
                        this.treasure_total.addSpriteFrame(resObject);
                    }).bind(this));
                }
            }else if(list[i].base_id == 37002){
                this.hasTreasure_num[2] = BackpackController.getInstance().getModel().getBackPackItemNumByBid(37002);
                if(this.cur_index == 2){
                    var item_config = Utils.getItemConfig(37002);
                    var res = PathTool.getItemRes(item_config.icon);
                    var str = cc.js.formatStr(Utils.TI18N("<img src='%s'/>  %d"),item_config.icon,this.hasTreasure_num[2]);
                    this.treasure_total.string = str;
                    this.loadRes(res, (function (resObject) {
                        this.treasure_total.addSpriteFrame(resObject);
                    }).bind(this));
                }
            }
        }
    },

    runHandler:function(){
        if(this.step == 0){
            this.process = this.process + 0.33;
            if(this.process >= 3){
                this.step = 1;
                this.speed = 0.6;
            }
        }else if(this.step == 1){
            this.process = this.process+this.speed;
            if(this.process > ROUND_COUNT*this.round && this.targetPos > -1){
                if(this.targetPos > 3){
                    if((this.process % ROUND_COUNT) > slow_start){
                        this.speed = 0.04;
                        this.step = 2;
                    }
                }else{
                    if(this.targetPos <= slow_start){
                        if((this.process % (ROUND_COUNT*this.round)) >= (this.targetPos-slow_start+ROUND_COUNT)){
                            this.speed = 0.04;
                            this.step = 2;
                        }
                    }
                }
            }
        }else if(this.step == 2){
            this.process = this.process+this.speed;
            if((this.process % ROUND_COUNT >= this.targetPos) && Math.floor(this.process / ROUND_COUNT) >= 5){
                if(this.lottery_ticket!=null){
                    gcore.Timer.del(this.lottery_ticket);
                    this.lottery_ticket = null;
                    this.stopRunHandler();
                }
            }
        }
        var p = Math.floor(this.process);
        this.setPos(p);
    },

    setPos:function(pos){
        if(pos <= 0){
            pos  = pos + ROUND_COUNT;
        }else if(pos >= ROUND_COUNT){
            pos = pos % ROUND_COUNT;
        }
        this.run_light.node.active = true;
        this.run_light.node.setPosition(reward_pos[change_pos[pos]][0],reward_pos[change_pos[pos]][1]);
    },

    // 跑灯结束
    stopRunHandler:function(){
        this.touchEnable = false;
        if(this.run_light_show_reward == null){
            this.run_light_show_reward = gcore.Timer.set((function () {
                if(this.run_light){
                    this.runLightReward();
                    this.showRewardList = null;
                    this.runLightUniformSpeed();
                }
            }).bind(this), 1000,-1);
        }
    },

    // 抽奖奖励
    runLightReward:function(){
        if(this.showRewardList){
            var award = [];
            for(var i in this.showRewardList.awards1){
                if(this.showRewardList.awards1[i]){
                    award.push(this.showRewardList.awards1[i]);
                }
            }

            for(var i in this.showRewardList.awards2){
                if(this.showRewardList.awards2[i]){
                    award.push(this.showRewardList.awards2[i]);
                }
            }
            // 类型， 次数类型
            this.ctrl.openTreasureGetItemWindow(true, award, this.cur_index, this.touchTreasure_type);
        }
        var initData = this.model.getTreasureInitData(this.cur_index);
        if(initData){
            this.itemRewardPos(initData.rand_lists);
        }
    },

    runLightUniformSpeedHide:function(){
        this.run_light.node.active = false;
        if(this.open_view_ticket != null){
            gcore.Timer.del(this.open_view_ticket);
            this.open_view_ticket = null;
        }
        if(this.run_light_show_reward !=null){
            gcore.Timer.del(this.run_light_show_reward);
            this.run_light_show_reward = null;
        }
    },

    // 没有跑灯的时候匀速跑
    runLightUniformSpeed:function(){
        if(this.open_view_ticket == null){
            this.open_view_ticket = gcore.Timer.set((function () {
                if(this.run_light){
                    this.run_light.node.active = true;
                    this.status_count = this.status_count % ROUND_COUNT;
                    this.run_light.node.setPosition(reward_pos[change_pos[this.status_count]][0],reward_pos[change_pos[this.status_count]][1])
                    this.status_count = this.status_count + 1;
                }
            }).bind(this), 500,-1);
        }
    },

    getActionFunc:function(node){
        if(!node)return;
        var fadeout = cc.fadeOut(0.07);
        node.runAction(fadeout);
    },

    startRefreshAction:function(){
        for(var i=1;i<=8;i++){
            if(this.item_list[i] && this.item_list[i].root_wnd){
                this.item_list[i].root_wnd.active = false;
            }
        }
        var actionNode = new cc.Node();
        this.item_panel.addChild(actionNode);
        var func = function (){
            this.ctrl.send16642(this.cur_index);
            this.handleEffect();
        }.bind(this);
        actionNode.runAction(cc.sequence(cc.callFunc(func),cc.removeSelf(true)));
    },

    // 特效
    handleEffect:function(){
        var func =  function (){
            this.touchRefresh = false;
            var initData = this.model.getTreasureInitData(this.cur_index);
            this.itemRewardPos(initData.rand_lists);
        }.bind(this);
        
        Utils.playEffectOnce(PathTool.getEffectRes(614),0,0,this.item_panel,func, PlayerAction.action_1, 1);
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(index){
        this.jump_index = index || 1;
        this.changeTabvarData(this.jump_index);
        this.ctrl.requestLucky();
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        this.refresh_time.node.stopAllActions();
        if(this.lottery_ticket!=null){
            gcore.Timer.del(this.lottery_ticket);
            this.lottery_ticket = null;
        }

        if(this.item_list && Utils.next(this.item_list || {}) != null){
            for(var i in this.item_list){
                if(this.item_list[i] && this.item_list[i].deleteMe){
                    this.item_list[i].deleteMe();
                }
            }
        }

        if(this.luckly_item && Utils.next(this.luckly_item || {}) !=null){
            for(var i in this.luckly_item){
                if(this.luckly_item[i] && this.luckly_item[i].deleteMe){
                    this.luckly_item[i].deleteMe();
                }
            }
        }

        this.runLightReward();
        this.probablity.stopAllActions();
        this.runLightUniformSpeedHide();
        var MallController = require("mall_controller")
        if(MallController.getInstance().getMallView()){
            MallController.getInstance().getMallView().setVisible(true)
        }
        this.ctrl.openLuckyTreasureWin(false);

    },
})