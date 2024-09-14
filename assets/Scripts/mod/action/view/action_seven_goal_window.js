// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     七天目标
// <br/>Create: 2019-04-18 15:15:48
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var TimeTool = require("timetool");
var ActionEvent = require("action_event");

var Action_seven_goalWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("action", "action_seven_goal_window");
        this.viewTag = SCENE_TAG.ui;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Full;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        this.cur_index = null;
        this.cur_select = null;
        this.cur_grop_select = null;
        this.welfareList = null;
        this.growthTarget = null;
        this.priceList = null;
        this.item_scrollview_walfare = null;
        this.currentDay = 1 //当前天数
        this.initCurrentDay = 1 //初始化天数，保证天数回滚是不会改变
        
        // 关于周期性的图片动态加载
        this.load_touch_day = [];
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        this.background = this.root_wnd.getChildByName("background");
        this.bigBg = this.background.getChildByName("Image_bg")
        this.bigBg.scale = FIT_SCALE;
        this.bg_sprite = this.bigBg.getComponent(cc.Sprite);
    
        this.main_container = this.background.getChildByName("main_container");
        this.layer_tab = this.background.getChildByName("layer_tab");
    
        // 宝箱
        this.boxSprite = [];
        this.award_list = [108,108,108,110];
        var box_ave_x = 559 / 4;
        this.box_list = [];

        var all_target = this.model.getBoxRewardData();
        for(var i = 1;i<=4;i++){
            this.boxSprite[i] = this.background.getChildByName("box_"+i);
            
            this.boxSprite[i].effect = this.boxSprite[i].getChildByName("eff_nd").getComponent(sp.Skeleton);
            this.boxSprite[i].redpoint = this.boxSprite[i].getChildByName("redpoint");
            this.boxSprite[i].redpoint.zIndex = 11;
            this.boxSprite[i].redpoint.active = false;

            this.box_list[i] = this.background.getChildByName("box_"+i);
            this.box_list[i].x = -360+110+box_ave_x * i;

            var textNum = this.box_list[i].getChildByName("textNum").getComponent(cc.Label);
            textNum.node.zIndex = 11;
            textNum.string = all_target[i-1].goal;
        }

        this.goods_walfare = this.main_container.getChildByName("goods_walfare");
        this.close_btn = this.main_container.getChildByName("close_btn");
    
        this.btn_list = [];
        var btn_label_list = [Utils.TI18N("福利领取"),"","",Utils.TI18N("福利礼包")];
        for(var i = 1;i<=4;i++){
            var btn = this.layer_tab.getChildByName("btnSelect_"+i);
            btn.red_point = btn.getChildByName("redpoint");
            btn.red_point.active = false;
            btn.normal = btn.getChildByName("normal");
            btn.select = btn.getChildByName("select");
            btn.select.active = false;
            btn.title = btn.getChildByName("title").getComponent(cc.Label);
            btn.title.string = btn_label_list[i-1];
            btn.title.node.color = new cc.Color(0xff,0xff,0xff, 0xff);
            btn.index = i;
            this.btn_list[i] = btn;
        }

        var layerReward = this.background.getChildByName("layerReward");
        this.rewardItem = [];
        for(var i = 1;i<=7;i++){
            this.rewardItem[i] = layerReward.getChildByName("reward_"+i);
            var red_point = this.rewardItem[i].getChildByName("redpoint");
            this.rewardItem[i].red_point = red_point
            this.rewardItem[i].red_point.active = false;

            var textDay = this.rewardItem[i].getChildByName("day");
            textDay.string = Utils.TI18N("第")+i+Utils.TI18N("天");

            var rewardImage = this.rewardItem[i].getChildByName("rewardImage").getComponent(cc.Sprite);
            this.rewardItem[i].rewardImage = rewardImage;

            var show_day_icon = this.rewardItem[i].getChildByName("rewardItem").getComponent(cc.Sprite);
            this.rewardItem[i].show_day_icon = show_day_icon;
            this.rewardItem[i].show_day_icon.node.setScale(0.8);
        }

        this.finish_round = this.background.getChildByName("finish_round").getComponent(cc.Sprite);
        this.day_title = this.background.getChildByName("day_title").getComponent(cc.Sprite);
        var text_19 = this.main_container.getChildByName("Text_19").getComponent(cc.Label);
        text_19.string = Utils.TI18N("剩余时间:");
        var text_1 = this.background.getChildByName("Text_1").getComponent(cc.Label);
        text_1.string = Utils.TI18N("完成个数");
    
        this.sevenGoalTime = this.main_container.getChildByName("sevenGoalTime").getComponent(cc.Label);
        this.bar = this.background.getChildByName("bar").getComponent(cc.ProgressBar);
        this.successNum = this.background.getChildByName("successNum").getComponent(cc.Label);

        var bgSize = this.goods_walfare.getContentSize();
        var scroll_view_size_walfara = cc.size(bgSize.width, bgSize.height);
        var ActionSevenGoalItem = require("action_seven_goal_item_panel");
        var setting = {
            item_class: ActionSevenGoalItem,      // 单元类
            start_x: 0,                  // 第一个单元的X起点
            space_x: 0,                    // x方向的间隔
            start_y: 0,                    // 第一个单元的Y起点
            space_y: 5,                   // y方向的间隔
            item_width: 641,               // 单元的尺寸width
            item_height: 156,              // 单元的尺寸height
            row: 0,                        // 行数，作用于水平滚动类型
            col: 1,                         // 列数，作用于垂直滚动类型
        }
        var CommonScrollView = require("common_scrollview");
        this.item_scrollview_walfare = new CommonScrollView(); 
        this.item_scrollview_walfare.createScroll(this.goods_walfare, cc.v2(0,0) , ScrollViewDir.vertical, ScrollViewStartPos.top, scroll_view_size_walfara, setting);

    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        this.addGlobalEvent(ActionEvent.UPDATE_SEVENT_GOAL,function(data){
            if(!data || data.cur_day > 7 || data.cur_day < 1){
                this.ctrl.openSevenGoalView(false);
                return;
            }

            data.period = data.period || 1;
            var config = Config.day_goals_data.data_constant.day_item;
            if(data.period == 2){
                config = Config.day_goals_data.data_constant.day_item;
            }else if(data.period == 3){
                config = Config.day_goals_data.data_constant.day_item;
            }else{
                config = Config.day_goals_data.data_constant.day_item;
            }

            for(var i = 1;i<=7;i++){
                var item_config = Utils.getItemConfig(config.val[i-1]);
                if(item_config){
                    var res = PathTool.getItemRes(item_config.icon);
                    this.loadRes(res, function(item,res_sf) {
                        item.spriteFrame = res_sf;
                    }.bind(this,this.rewardItem[i].show_day_icon));
                }
            }

            var str_res = cc.js.formatStr("seven_goals/%d",data.period);
            var res1 = PathTool.getUIIconPath(str_res,"action_seven_goal_bg1","jpg");
            this.loadRes(res1, function(res_sf) {
                this.bg_sprite.spriteFrame = res_sf;
            }.bind(this));

            var res2 = PathTool.getUIIconPath(str_res,"seven_goals_1_3",);
            this.loadRes(res2, function(res_sf) {
                this.finish_round.spriteFrame = res_sf;
            }.bind(this));

            var res3 = PathTool.getUIIconPath(str_res,"seven_goals_1_4");
            this.loadRes(res3, function(res_sf) {
                this.day_title.spriteFrame = res_sf;
            }.bind(this));
            this.day_title.node.scaleX = 8;

            this.goalEndTime = data.end_time;
            this.currentDay = data.cur_day || 1;
            this.initCurrentDay = data.cur_day || 1;
            this.noArriveDayGray(this.currentDay);

            this.success_num = data.num || 1;
            this.successNum.string = this.success_num;
            this.bar.progress = this.setSemgentPercent(this.success_num);

            this.sevenGoalTime.node.stopAllActions();
            if(this.goalEndTime > 0){
                this.sevenGoalTime.node.runAction(cc.repeatForever(cc.sequence(cc.delayTime(1),
                cc.callFunc(function(){
                    this.goalEndTime = this.goalEndTime - 1;
                    if(this.goalEndTime <= 0){
                        this.sevenGoalTime.node.stopAllActions();
                        this.sevenGoalTime.string = "00:00:00";
                    }else{
                        this.sevenGoalTime.string = TimeTool.getTimeFormatDayIIIIIIII(this.goalEndTime);
                    }
                }.bind(this)))))
                this.sevenGoalRemainTime();
            }else{
                this.sevenGoalTime.node.stopAllActions();
                this.sevenGoalTime.string = "00:00:00";
            }

            var box_list = this.model.getSevenGoalBoxList();
            this.updateTaskList(box_list);

            if(this.cur_index == null){
                this.selectByBtn(1);
            }else{
                this.selectByBtn(this.cur_index);
            }
            var initDayRed = this.initRedPointDay(this.currentDay);
            for(var i in initDayRed){
                this.rewardItem[i].red_point.active = initDayRed[i];
            }
            this.redPointTabDayList(this.currentDay);
        }.bind(this));

        this.addGlobalEvent(ActionEvent.UPDATE_SEVENT_GET,function(data){
            this.success_num = data.num || 1;
            this.successNum.string = data.num;
            this.bar.progress = this.setSemgentPercent(data.num);
            var sort_list = [];
            var config_data = [];
            var serve_data = [];
            var sort_updata_data = [];
            
            if(data.type == 1 || data.type == 2 || data.type == 3){
                if(data.type == 1){
                    config_data = this.model.getWalfareData(data.day_type);
                    serve_data = this.model.getSevenGoalWelfareList(data.day_type);
                }else if(data.type == 2){
                    config_data = this.model.getWalfareGrowUpData(data.day_type-1);
                    serve_data = this.model.getServerGrowListData(data.day_type-1);
                }else if(data.type == 3){
                    config_data = this.model.getWelfareGiftData(data.day_type-1);
                    serve_data = this.model.getServerGiftListData(data.day_type-1);
                }
                var index = 1;
                for(var i in serve_data){
                    if(serve_data[i].goal_id == data.id){
                        index = i;
                        break;
                    }
                }
                if(data.type == 1){
                    this.model.updataGoalWelfareList(data.day_type, index, data.status);
                    sort_updata_data = this.model.getSevenGoalWelfareList(this.currentDay);
                }else if(data.type == 2){
                    this.model.updataGrowListData(data.day_type-1, index, data.status);
                    sort_updata_data = this.model.getServerGrowListData(data.day_type-1);
                }else if(data.type == 3){
                    this.model.updataGiftListData(data.day_type-1, index, data.status);
                    sort_updata_data = this.model.getServerGiftListData(data.day_type-1);
                }
                sort_updata_data = this.reverseTable(Utils.deepCopy(sort_updata_data));
                sort_updata_data = this.sortFunc(sort_updata_data);
                for(var i in sort_updata_data){
                    for(var k in config_data){
                        if(sort_updata_data[i].goal_id == config_data[k].goal_id){
                            sort_list.push(config_data[k]);
                        }
                    }
                }
                config_data = sort_list;
                var status = false;
                for(var i in sort_updata_data){
                    if(sort_updata_data[i].status == 1){
                        status = true;
                        break;
                    }
                }

                for(var i in config_data){
                    config_data[i]._index = parseInt(i);
                }

                if(data.type == 1){
                    this.model.updataRedPointWelfareStatus(data.day_type, status);
                }else if(data.type == 2){
                    this.model.updataRedPointGrowStatus(data.day_type, status);
                }else if(data.type == 3){
                    this.model.updataRedPointGiftStatus(data.day_type, status);
                }
                var tab = {};
                tab.list = Utils.deepCopy(sort_updata_data);
                tab.type = this.cur_index;
                tab.day = data.day_type;
                this.item_scrollview_walfare.setData(config_data, null, tab);
            }else if(data.type == 4){
                var half_data = this.model.getWelfareHalfData(data.day_type);
                var half_list = this.model.getHalfGiftList(data.day_type);
    
                var index = 1;
                for(var i in half_list){
                    if(half_list[i].day == data.id){
                        index = i;
                        break;
                    }
                }
                this.model.updataHalfListData(data.day_type, index, data.status);
                var half_updata_list = this.model.getHalfGiftList(data.day_type);
                half_updata_list.sort(function(a,b){
                    return a.status - b.status;
                });

                for(var i in half_updata_list){
                    for(var k in half_data){
                        if(half_updata_list[i].day == half_data[k].id){
                            sort_list.push(half_data[k]);
                        }
                    }
                }
                half_data = sort_list;

                for(var i in half_data){
                    half_data[i]._index = parseInt(i);
                }

                var status = false;
                for(var i in half_updata_list){
                    if(half_updata_list[i].day <= 7 && half_updata_list[i].status == 0){
                        status = true;
                        break;
                    }
                }
                this.model.updataRedPointHalfStatus(data.day_type, status);

                var tab = {};
                tab.list = Utils.deepCopy(half_updata_list);
                tab.type = this.cur_index;
                tab.day = data.day_type;
                this.item_scrollview_walfare.setData(half_data, null, tab);
            }else if(data.type == 5){//宝箱
                var all_target = this.model.getBoxRewardData();
                var count_num = 1;
                for(var i in all_target){
                    if(all_target[i].id == data.id){
                        count_num = i;
                        break;
                    }
                }

                this.model.updataBoxListData(count_num, data.status);
                var box_list = this.model.getSevenGoalBoxList();
                this.updateTaskList(box_list);
                this.model.updataRedPointBoxStatus(count_num, box_list[count_num].status);
            }
            var all_target = this.model.getBoxRewardData();
            if(this.success_num == all_target[0].goal || this.success_num == all_target[1].goal || this.success_num == all_target[2].goal || this.success_num == all_target[3].goal){
                var box_list = this.model.getSevenGoalBoxList();
                for(var i =1;i<=4;i++){
                    if(this.success_num == all_target[i-1].goal){
                        if(box_list[i-1].status == 0){
                            box_list[i-1].status = 1;
                        }
                    }
                }
                this.updateTaskList(box_list);
            }
            this.redPointTabDayList(data.day_type, true);
        }.bind(this));

        for(var i in this.btn_list){
            Utils.onTouchEnd(this.btn_list[i], function (k) {
                this.selectByBtn(k);
            }.bind(this,i), 1);
        }

        for(var i in this.rewardItem){
            Utils.onTouchEnd(this.rewardItem[i], function (k) {
                if(k > this.initCurrentDay){
                    message(Utils.TI18N("未达到开放天数"));
                    return;
                }
                this.noArriveDayGray(k);
            }.bind(this,i), 1);
        }

        for(var i in this.box_list){
            Utils.onTouchEnd(this.box_list[i], function (k) {
                var all_target = this.model.getBoxRewardData();
                var callback = function(){
                    this.ctrl.cs13602(5, this.currentDay,all_target[parseInt(k)-1].id,0);
                }.bind(this);
                var CommonAlert = require("commonalert");
                CommonAlert.showItemApply(Utils.TI18N("当前活跃度奖励"), all_target[parseInt(k)-1].award, callback,Utils.TI18N("确定"),
                null,null,Utils.TI18N("奖励"),null,null,true,null, null,{off_y:50});
            }.bind(this,i), 1);
        }

        Utils.onTouchEnd(this.close_btn, function () {
            this.ctrl.openSevenGoalView(false);
        }.bind(this), 2);
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(params){
        this.ctrl.cs13601();
    },

    sevenGoalRemainTime:function(){
        this.goalEndTime = this.goalEndTime - 1;
        if(this.goalEndTime <= 0){
            this.sevenGoalTime.node.stopAllActions();
            this.sevenGoalTime.string = "00:00:00";
        }
        this.sevenGoalTime.string = TimeTool.getTimeFormatDayIIIIIIII(this.goalEndTime);
    },

    // 未开启的天数灰化      传入当前的天数
    noArriveDayGray:function(day){
        day = day || 1;
        if(this.cur_index){
            this.currentDay = day;
            this.selectByBtn( this.cur_index );
        }
        var str_res = cc.js.formatStr("seven_goals/%d",this.model.getSevenGoldPeriod());
        for(var i = 1;i<=7;i++){
            if(i <= this.initCurrentDay){
                if(i == day){
                    var res = PathTool.getUIIconPath(str_res,"seven_goals_1_2");
                    this.loadRes(res, function(item,res_sf) {
                        item.spriteFrame = res_sf;
                    }.bind(this,this.rewardItem[day].rewardImage));
                }else{
                    var res = PathTool.getUIIconPath(str_res,"seven_goals_1_1");
                    this.loadRes(res, function(item,res_sf) {
                        item.spriteFrame = res_sf;
                    }.bind(this,this.rewardItem[i].rewardImage));
                }
                if(this.rewardItem[i] && this.rewardItem[i].show_day_icon){
                    this.rewardItem[i].show_day_icon.setState(cc.Sprite.State.NORMAL); 
                }
            }else{
                if(this.rewardItem[i] && this.rewardItem[i].show_day_icon){
                    this.rewardItem[i].show_day_icon.setState(cc.Sprite.State.GRAY);
                }
                
                var res = PathTool.getUIIconPath(str_res,"seven_goals_1_1");
                this.loadRes(res, function(item,res_sf) {
                    item.spriteFrame = res_sf;
                }.bind(this,this.rewardItem[i].rewardImage));
            }
        }
    },

    // 逆向排序
    reverseTable:function(tab){
        tab.reverse();
        return tab;
    },

    sortFunc:function(data){
        var tempsort = {
            [0]: 2,  // 0 未领取放中间
            [1]: 1,  // 1 可领取放前面
            [2]: 3,  // 2 已领取放最后
        }

        var sortFunc = function(objA, objB){
            if(objA.status != objB.status){
                if(tempsort[objA.status] && tempsort[objB.status]){
                    return tempsort[objA.status] - tempsort[objB.status];
                }else{
                    return -1;
                }
            }else{
                return objA.goal_id - objB.goal_id;
            }
        };
        data.sort(sortFunc);
        return data;
    },

    // 获取名字
    getTabName:function(day){
        var grow = this.model.getWalfareGrowUpData(day-1);
        var gift = this.model.getWelfareGiftData(day-1);

        var name1 = grow[0].type_name;
        var name2 = gift[0].type_name;
        return [name1,name2];
    },

    // 主切换按钮
    selectByBtn:function( index ){
        index = index || 1;
        if(this.cur_select!=null){
            this.cur_select.select.active = false;
            this.cur_select.title.node.color = new cc.Color(0xff,0xff,0xff, 0xff);
        }
        this.cur_index = index;
        this.cur_select = this.btn_list[this.cur_index];
        if(this.cur_select != null){
            this.cur_select.select.active = true;
            this.cur_select.title.node.color = new cc.Color(0xff,0xff,0xff, 0xff);
        }
        this.redPointTabDayList(this.currentDay);

        var walfare_data = [];
        var serve_list = [];
        var sort_list = [];
        if(this.cur_index == 1){
            walfare_data = this.model.getWalfareData(this.currentDay);
            serve_list = this.model.getSevenGoalWelfareList(this.currentDay);
        }else if(this.cur_index == 2){
            walfare_data = this.model.getWalfareGrowUpData(this.currentDay-1);
            serve_list = this.model.getServerGrowListData(this.currentDay-1);
        }else if(this.cur_index == 3){
            walfare_data = this.model.getWelfareGiftData(this.currentDay-1);
            serve_list = this.model.getServerGiftListData(this.currentDay-1);
        }else if(this.cur_index == 4){
            walfare_data = this.model.getWelfareHalfData(this.currentDay);
            serve_list = this.model.getHalfGiftList(this.currentDay);
        }

        var name_list = this.getTabName(this.currentDay);
        this.btn_list[2].title.string = name_list[0];
        this.btn_list[3].title.string = name_list[1];

        if(this.cur_index == 4){
            serve_list.sort(function(a,b){
                return a.status - b.status;
            });
            for(var i in serve_list){
                for(var j in walfare_data){
                    if(serve_list[i].day == walfare_data[j].id){
                        sort_list.push(walfare_data[j]);
                    }
                }
            }
        }else{
            serve_list = this.reverseTable(Utils.deepCopy(serve_list));
            serve_list = this.sortFunc(serve_list);
            for(var i in serve_list){
                for(var k in walfare_data){
                    if(serve_list[i].goal_id == walfare_data[k].goal_id){
                        sort_list.push(walfare_data[k]);
                    }
                }
            }
        }
        walfare_data = sort_list;

        for(var i in walfare_data){
            walfare_data[i]._index = parseInt(i);
        }
        
        var tab = {};
        tab.list = Utils.deepCopy(serve_list);
        tab.type = this.cur_index;
        tab.day = this.currentDay;
        this.item_scrollview_walfare.setData(walfare_data, null, tab);
    },

    // 初始化天数的红点
    initRedPointDay:function(day){
        if(day < 1 || day > 7)return;
        var status = [];
        for(var i = 1;i<=day;i++){
            status[i] = false;
            var welfare_status = this.model.getRedPointWelfareStatus(i);
            var grow_status = this.model.getRedPointGrowStatus(i);
            var gift_status = this.model.getRedPointGiftStatus(i);
            var half_status = this.model.getRedPointHalfStatus(i);
            
            var total_status = false;
            total_status = welfare_status || grow_status || gift_status || half_status;
            status[i] = total_status;
        }
        return status;
    },

    // 实时更新 天数 红点
    redPointTabDayList:function(day, _type){
        if(this.currentDay < 1 || this.currentDay > 7){
            return;
        }
        var welfare_status = this.model.getRedPointWelfareStatus(day);
        if(this.btn_list[1] && this.btn_list[1].red_point){
            this.btn_list[1].red_point.active = welfare_status;
        }

        var grow_status = this.model.getRedPointGrowStatus(day);
        if(this.btn_list[2] && this.btn_list[2].red_point){
            this.btn_list[2].red_point.active = grow_status;
        }

        var gift_status = this.model.getRedPointGiftStatus(day);
        if(this.btn_list[3] && this.btn_list[3].red_point){
            this.btn_list[3].red_point.active = gift_status;
        }

        var half_status = this.model.getRedPointHalfStatus(day);
        if(this.btn_list[4] && this.btn_list[4].red_point){
            this.btn_list[4].red_point.active = half_status;
        }

        if(_type){
            var total_status = false;
            total_status = welfare_status || grow_status || gift_status || half_status;
            this.rewardItem[day].red_point.active = total_status;

            // 场景天数红点
            var initDayRed = this.initRedPointDay(this.currentDay);
            var red_point = false;
            for(var i in initDayRed){
                if(initDayRed[i] == true){
                    red_point = true;
                    break;
                }
            }

            // 宝箱
            var boxRed = false;
            for(var i = 1;i<=3;i++){
                var status = this.model.getRedPointBoxStatus(i);
                if(status == true){
                    boxRed = true;
                    break;
                }
            }
            var MainuiConst = require("mainui_const");
            var icon_id = MainuiConst.icon.seven_goal;
            if(this.model.getSevenGoldPeriod() == 1){
                icon_id = MainuiConst.icon.seven_goal;
            }else if(this.model.getSevenGoldPeriod() == 2){
                icon_id = MainuiConst.icon.seven_goal1;
            }else if(this.model.getSevenGoldPeriod() == 3){
                icon_id = MainuiConst.icon.seven_goal2;
            }else{
                icon_id = MainuiConst.icon.seven_goal3;
            }
            var MainuiController = require("mainui_controller")
            MainuiController.getInstance().setFunctionTipsStatus(icon_id, red_point || boxRed);
        }
    },

    updateTaskList:function(data){
        for(var i=1;i<=4;i++){
            var action = PlayerAction.action_1;
            this.boxSprite[i].redpoint.active = false;

            if(data[i-1]){
                if(data[i-1].status == 0){
                    action = PlayerAction.action_1;
                }else if(data[i-1].status == 1){
                    action = PlayerAction.action_2;
                    this.boxSprite[i].redpoint.active = true;
                }else if(data[i-1].status == 2){
                    action = PlayerAction.action_3;
                }
            }
            var effect = this.boxSprite[i].effect;
            if(effect){
                effect.setToSetupPose();
                effect.clearTracks();
            }

            if(effect){
                var res_id = PathTool.getEffectRes(this.award_list[i-1]);
                var anima_path = PathTool.getSpinePath(res_id, "action");
                this.loadRes(anima_path, function(effect,action,ske_data) {
                    effect.skeletonData = ske_data;
                    effect.setAnimation(0, action, true);
                }.bind(this,effect,action));
            }
        }
    },

    setSemgentPercent:function(num){
        var segmeent = 25;
        var percent = 0;
        var all_target = this.model.getBoxRewardData();
        if(all_target[0] == null || all_target[1] == null || all_target[2] == null || all_target[3] == null)return 0;
        if(num <= all_target[0].goal){
            return num / all_target[0].goal * segmeent/100;
        }else if(num > all_target[0].goal && num <= all_target[1].goal){
            percent = 1;
        }else if(num > all_target[1].goal && num <= all_target[2].goal){
            percent = 2;
        }else if(num > all_target[2].goal && num <= all_target[3].goal){
            percent = 3;
        }else{
            return 1;
        }

        var adv = all_target[percent].goal - all_target[percent-1].goal;
        var count = num - all_target[percent-1].goal;
        var percent_num = segmeent*(percent) + ( count / adv ) * segmeent;
        return percent_num/100;
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        this.cur_select = null;
        this.boxList = [];

        if(this.item_scrollview_walfare){
            this.item_scrollview_walfare.deleteMe();
        }
        this.item_scrollview_walfare = null;

        this.sevenGoalTime.node.stopAllActions();
        this.ctrl.openSevenGoalView(false);
    },
})