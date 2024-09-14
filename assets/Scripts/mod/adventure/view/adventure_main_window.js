// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     神界冒险UI版本的主UI
// <br/>Create: 2019-05-14 17:17:26
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var CommonScrollView = require("common_scrollview");
var MainuiController = require("mainui_controller")
var RankController = require("rank_controller")
var RankConstant = require("rank_constant");
var AdventureEvent = require("adventure_event");
var AdventureConst = require("adventure_const");
var CommonAlert = require("commonalert");
var ChatConst = require("chat_const");
var AdventureCellItem = require("adventure_cell_item_panel");
var TimeTool = require("timetool")
var TipsController = require("tips_controller")

var Adventure_mainWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("adventure", "adventure_main_window");
        this.viewTag = SCENE_TAG.ui;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Full;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        this.had_register = false;
        this.box_effect = null;
        this.cur_box_status = null;
        this.skill_list = {};
        this.hero_list = {};
        this.room_skill_list = {};
        this.collect_effect_list ={};
    
        this.fly_cache_item_list = [];
        this.fly_item_list = {};
    },

    setVisible:function(status){
        this._super(status);
        
        if(status){
            if(this.item_scrollview){
                this.item_scrollview.setClickEnabled(false)
            }
            this.updateBoxTeskList(this.box_tesk_data);
        }
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        Utils.getNodeCompByPath("bottom_container/shop/label", this.root_wnd, cc.Label).string = Utils.TI18N("冒险商店");
        Utils.getNodeCompByPath("bottom_container/buff_container/label", this.root_wnd, cc.Label).string = Utils.TI18N("属性加成");
        Utils.getNodeCompByPath("bottom_container/holiday_buff/label", this.root_wnd, cc.Label).string = Utils.TI18N("活动加成");
        Utils.getNodeCompByPath("bottom_container/btn_box/Sprite_4_0/Text_2", this.root_wnd, cc.Label).string = Utils.TI18N("击杀守卫");

        this.cell_container = this.root_wnd.getChildByName("cell_container");
        var scroll_view_size = this.cell_container.getContentSize();
        var setting = {
            item_class: AdventureCellItem,
            start_x: 10,
            space_x: -1,
            start_y: 118,
            space_y: -1,
            item_width: 142,
            item_height: 126,
            row: 5,
            col: 5,
            once_num: 5
        }
        
        this.item_scrollview = new CommonScrollView(); 
        this.item_scrollview.createScroll(this.cell_container, cc.v2(-scroll_view_size.width/2,0) , ScrollViewDir.vertical, ScrollViewStartPos.bottom, scroll_view_size, setting);
        this.item_scrollview.setItemZIndexByType(2);
        this.item_scrollview.setClickEnabled(false)
    
        this.other_container = this.root_wnd.getChildByName("other_container");
        this.Sprite_21 = this.other_container.getChildByName("Sprite_21").getComponent(cc.Sprite);
        this.Sprite_22 = this.other_container.getChildByName("Sprite_22").getComponent(cc.Sprite);
        this.Sprite_23 = this.other_container.getChildByName("Sprite_23").getComponent(cc.Sprite);
        this.Sprite_24 = this.other_container.getChildByName("Sprite_24").getComponent(cc.Sprite);

        this.top_container = this.root_wnd.getChildByName("top_container");
        this.top_back = this.top_container.getChildByName("background");
        this.top_back.scale = FIT_SCALE*2; 
        this.top_back_ground = this.top_container.getChildByName("background").getComponent(cc.Sprite);
    
        this.title_container = this.top_container.getChildByName("title_container");
        this.top_title = this.title_container.getChildByName("label").getComponent(cc.Label);		// 层数标题
        this.title_background = this.title_container.getChildByName("title").getComponent(cc.Sprite);
    
        this.explain_btn = this.top_container.getChildByName("explain_btn");		// 玩法说明按钮
        this.rank_btn = this.top_container.getChildByName("rank_btn");
        var explain_lab = this.explain_btn.getChildByName("label").getComponent(cc.Label);
        explain_lab.string = Utils.TI18N("玩法说明");
        var rank_lab = this.rank_btn.getChildByName("label").getComponent(cc.Label);
        rank_lab.string = Utils.TI18N("排行");
    
        this.bottom_container = this.root_wnd.getChildByName("bottom_container");
        this.bottom_back = this.bottom_container.getChildByName("background");
        this.bottom_back.scale = FIT_SCALE*2;
        this.bottom_back_ground = this.bottom_container.getChildByName("background").getComponent(cc.Sprite);
    
        this.return_btn = this.bottom_container.getChildByName("return_btn");
    
        this.list_conatiner = this.bottom_container.getChildByName("list_conatiner");
    
        var base_config = Config.adventure_data.data_skill_data ;
        for(var i=1;i<=3;i++){
            var buff_node = this.bottom_container.getChildByName("buff_"+i);
            if(buff_node){
                var object = {};
                object.node = buff_node;
                object.index = i;
                object.num = buff_node.getChildByName("num").getComponent(cc.Label);
                object.num.string = 0;
                object.label = buff_node.getChildByName("label").getComponent(cc.Label);
                object.num_value = 0;
                object.use_count = 0;
                this.skill_list[i] = object;
                var config = base_config[i];
                if(config){
                    object.config = config;
                    object.label.string = config.name;
                }
            }
        }

        this.shop = this.bottom_container.getChildByName("shop");
        this.btn_box = this.bottom_container.getChildByName("btn_box");
        this.btn_box_label = this.btn_box.getChildByName("Text_1").getComponent(cc.Label);
        this.btn_box_label.string = "";
        this.btn_box_label.node.zIndex = 10;
        this.buff_container = this.bottom_container.getChildByName("buff_container");
        this.holiday_buff = this.bottom_container.getChildByName("holiday_buff");
        this.holiday_buff.active = false;
    
        var end_time_title = this.bottom_container.getChildByName("end_time_title").getComponent(cc.Label);
        end_time_title.string = Utils.TI18N("冒险重置");
        this.end_time_value = this.bottom_container.getChildByName("end_time_value").getComponent(cc.Label);
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        Utils.onTouchEnd(this.return_btn, function () {
            this.ctrl.openAdventureMainWindow(false);
        }.bind(this), 2);

        Utils.onTouchEnd(this.explain_btn, function () {
            MainuiController.getInstance().openCommonExplainView(true, Config.adventure_data.data_explain, Utils.TI18N("玩法规则"));
        }.bind(this), 1);

        Utils.onTouchEnd(this.rank_btn, function () {
            RankController.getInstance().openRankView(true, RankConstant.RankType.adventure);
        }.bind(this), 1);

        Utils.onTouchEnd(this.buff_container, function () {
            var buff_list = this.model.getBuffData();
            var holiday_buff_list = this.model.getHolidayBuffData();
            if((buff_list == null || Utils.next(buff_list) == null) && (holiday_buff_list == null || Utils.next(holiday_buff_list) == null)){
                message(Utils.TI18N("暂无属性加成"));
            }else{
                let p = this.buff_container.convertToWorldSpace(cc.v2(0,0)); 
                TipsController.getInstance().showAdventureBuffTips(buff_list,p,holiday_buff_list);
            }
        }.bind(this), 1);

        for(var k in this.skill_list){
            if(this.skill_list[k].node){
                Utils.onTouchEnd(this.skill_list[k].node, function (index) {
                    this.handleSkillChoose(index);
                }.bind(this,this.skill_list[k].index), 1);
            }
        }

        Utils.onTouchEnd(this.shop, function () {
            this.ctrl.openAdventrueShopWindow(true);
        }.bind(this), 1);

        this.addGlobalEvent(AdventureEvent.Update_Room_Info,function(){
            this.playEnterEffect(true);
		    this.updateRoomData();
        }.bind(this));

        this.addGlobalEvent(AdventureEvent.Update_Single_Room_Info,function(){
            this.updateRoomData(true);
        }.bind(this));

        this.addGlobalEvent(AdventureEvent.Update_Room_Base_Info,function(){
            this.updateBaseData();
        }.bind(this));

        this.addGlobalEvent(AdventureEvent.Update_Buff_Info,function(){
            this.updateBuffData();
            this.updateHolidayBuffTips();
        }.bind(this));

        this.addGlobalEvent(AdventureEvent.UpdateSkillInfo,function(data){
            this.updateSkillData(data);
        }.bind(this));

        this.addGlobalEvent(AdventureEvent.UpdateAdventureForm,function(){
            this.updateHeroList();
        }.bind(this));

        this.addGlobalEvent(AdventureEvent.UpdateAdventureSelectHero,function(){
            this.changeSelectHero();
        }.bind(this));

        this.addGlobalEvent(AdventureEvent.GetSkillForEffectAction,function(id, skill_id){
            this.playSkillEffectAction(id, skill_id);
        }.bind(this));

        this.addGlobalEvent(AdventureEvent.UpdateBoxTeskEvent,function(data){
            this.updateBoxTeskList(data);
        }.bind(this));

        Utils.onTouchEnd(this.btn_box, function () {
            if(this.box_tesk_data && this.box_tesk_data.kill_mon != null){
                // 有奖励可领时，点击宝箱直接全部领完
                if(this.cur_box_status && this.cur_box_status == 1){
                    this.ctrl.send20635(0);
                }else{
                    this.ctrl.openAdventureBoxRewardView(true,this.box_tesk_data.kill_mon);
                }
            }
        }.bind(this), 1);
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(params){
        this.ctrl.send20602();
        this.ctrl.send20609();
        this.ctrl.send20634();
    
        this.updateBuffData();
        this.updateBaseData();
        this.updateHeroList();
        this.updateHolidayBuffTips();
    
        this.model.updateRedStatus(false);

    },

    // 更新宝箱的任务
    getNextLevelNumber:function(list,length,cur_count){
        if(list[length] == null)return 1;
        var num = 0;
        if(cur_count >= list[length].count){
            num = list[length].id;
        }else{
            for(var i in list){
                var v = list[i];
                var cur_id = v.id;
                cur_id = cur_id + 1;
                if(cur_id >= length){
                    cur_id = length;
                }
                if(cur_count >= v.count && cur_count <= list[cur_id].count){
                    num = v.id;
                    break;
                }
            }
            num = num + 1;
            if(num >= length){
                num = length;
            }
        }
        return num;
    },

    updateBoxTeskList:function(data){
        if(data == null)return;
        var box_list = Config.adventure_data.data_round_reward_list;
        var length = Config.adventure_data.data_round_reward_list_length;
        this.box_tesk_data = data;
    
        var kill_mon = this.box_tesk_data.kill_mon || 0;
        var status_index = 0;
        for(var i in data.list){
            if(data.list[i].status == 1){
                status_index = 1; //可领取的时候
                break;
            }
        }
        // 判断是否全部领取完毕
        var is_all_get = false;
        if(status_index == 0){
            for(var i in data.list){
                if(data.list[i].status == 0){
                    is_all_get = true;
                    break;
                }
            }
            if(is_all_get == false){
                status_index = 2; 
            }
        }
        var index = this.getNextLevelNumber(box_list,length,kill_mon);
        if(status_index == 2){
            var str = Utils.TI18N("已领取");
            this.btn_box_label.string = str;
        }else{
            var str = cc.js.formatStr("%d/%d",kill_mon,box_list[index].count);
            this.btn_box_label.string = str;
        }

        if(this.cur_box_status != status_index && this.getVisible()){
            this.cur_box_status = status_index;
            // 宝箱状态
            var action = PlayerAction.action_1;
            if(status_index == 1){
                action = PlayerAction.action_2;
            }else if(status_index == 2){
                action = PlayerAction.action_3;
            }

            if(this.box_effect){
                this.box_effect.setToSetupPose();
                this.box_effect.clearTracks();
                this.box_effect = null;
            }
            if(this.btn_box && this.box_effect == null){
                var eff_node = new cc.Node();
                eff_node.setAnchorPoint(0,0);
                eff_node.setPosition(0, -20);
                this.btn_box.addChild(eff_node);

                this.box_effect = eff_node.addComponent(sp.Skeleton);
                var anima_path = PathTool.getSpinePath(PathTool.getEffectRes(602), "action");
                this.loadRes(anima_path, function(ske_data) {
                    this.box_effect.skeletonData = ske_data;
                    this.box_effect.setAnimation(0, action, true);
                }.bind(this));
            }
        }
    },

    // ==============================--
    // desc:更新自己伙伴信息
    // @return 
    // ==============================--
    updateHeroList:function(){
        var hero_list = this.model.getFormList();
        var partner_id = this.model.getSelectPartnerID();
        for(var i in hero_list){
            var v = hero_list[i];
            var clickback = function(cell){
                this.selectHeroItem(cell);
            }.bind(this);

            if(this.hero_list[i] == null){
                this.hero_list[i] = ItemsPool.getInstance().getItem("hero_exhibition_item");;
                this.hero_list[i].setExtendData({scale:0.9,can_click:true});
                this.hero_list[i].setRootPosition(cc.v2(-this.bottom_container.width/2 + 90 + i* 135, -this.bottom_container.height+260));
                this.hero_list[i].show();
                this.hero_list[i].setParent(this.bottom_container);
                this.hero_list[i].addCallBack(clickback);
            }
            var hero_item = this.hero_list[i];

            //  默认选中一个
            if(partner_id != 0){
                if(v.partner_id == partner_id){
                    this.selectHeroItem(hero_item);
                }
            }
            this.updateHeroInfo(hero_item, v);
        }
    },

    // ==============================--
    // desc:外部事件更改选中
    // @return 
    // ==============================--
    changeSelectHero:function(){
        var partner_id = this.model.getSelectPartnerID();
        if(partner_id == 0)return;

        var cell = null;
        for(var k in this.hero_list){
            var v = this.hero_list[k];
            var data = v.getData();
            if(data && data.partner_id == partner_id){
                cell = v;
                break;
            }
        }
        if(cell){
            this.selectHeroItem(cell);
        }
    },

    // ==============================--
    // desc:设置当前选中的
    // @cell:
    // @data:
    // @return 
    // ==============================--
    selectHeroItem:function(cell, data){
        if(!cell)return;
        var data = cell.getData();
        if(!data)return;
        if(data.now_hp == 0){
            message(Utils.TI18N("死亡英雄无法选择"));
            return;
        }
        if(this.select_cell == cell)return;
        if(this.select_cell){
            this.select_cell.setSelected(false);
            this.select_cell = null;
        }
        this.select_cell = cell;
        this.select_cell.setSelected(true);
        // 请求储存
        this.ctrl.requestSelectPartner(data.partner_id);
    },

    // ==============================--
    // desc:外部设置额外信息
    // @item:
    // @data:
    // @return 
    // ==============================--
    updateHeroInfo:function(item, data){
        if(item == null)return;
        item.setData(data);
        var hp_per = data.now_hp / data.hp;
        item.showProgressbar(hp_per * 100);
        if(hp_per == 0){
            item.showStrTips(true, Utils.TI18N("已阵亡"));
        }else{
            item.showStrTips(false);
        }
    },

    // ==============================--
    // desc:更新技能信息
    // @data:
    // @return 
    // ==============================--
    updateSkillData:function(data_list){
        if(data_list){
            for(var i in data_list){
                var v = data_list[i];
                var object = this.skill_list[v.bid];
                if(object){
                    object.num_value = v.num;
                    object.use_count = v.use_count;
                    object.num.string = v.num;
                }
            }
        }
    },

    // ==============================--
    // desc:buff效果
    // @return 
    // ==============================--
    updateBuffData:function(){

    },

    //  更新活动buff加成标识
    updateHolidayBuffTips:function(  ){
        var buff_data = this.model.getHolidayBuffData();
        if(!buff_data || Utils.next(buff_data) == null){
            this.holiday_buff.active = false;
        }else{
            this.holiday_buff.active = true;
        }
    },

    // ==============================--
    // desc:基础数据变化的时候,可能层数变化,这个时候就需要重新设置风格之类的了
    // @return 
    // ==============================--
    updateBaseData:function(){
        this.base_data = this.model.getAdventureBaseData();
        if(this.base_data == null)return;

        var base_data = this.base_data;
        this.changeBackgroundResources(base_data.map_id);

        //  设置层的名字
        if(this.name_layer != base_data.id){
            this.name_layer = base_data.id;
            var name_config = Config.adventure_data.data_floor_reward[base_data.id];
            if(name_config){
                this.top_title.string = name_config.name;
            }
        }
        // 设置倒计时
        this.updateEndTime();
    },

    // ==============================--
    // desc:更新重置事件
    // @return 
    // ==============================--
    updateEndTime:function(){
        if(this.base_data == null)return;
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
        this.end_time_value.string = TimeTool.getTimeFormat(end_time);
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

    // ==============================--
    // desc:切换地图
    // @layer:
    // @return 
    // ==============================--
    changeBackgroundResources:function(layer){
        if(layer == null)return;
        if(this.layer == layer)return;
        this.layer = layer;
        var layer_config = Config.adventure_data.data_map[layer];
        if(layer_config){
            var background_path = "adventure/background/"+layer_config.res_id;
            if(this.background_path == background_path)return;
            this.background_path = background_path;
        }

        if(this.background_path == null)return;
        this.loadRes(PathTool.getUIIconPath(this.background_path,"top"), function (sf_obj) {
            this.top_back_ground.spriteFrame = sf_obj;
        }.bind(this));

        this.loadRes(PathTool.getUIIconPath(this.background_path,"bottom"), function (sf_obj) {
            this.bottom_back_ground.spriteFrame = sf_obj;
        }.bind(this));

        this.loadRes(PathTool.getUIIconPath(this.background_path,"title"), function (sf_obj) {
            this.title_background.spriteFrame = sf_obj;
        }.bind(this));

        this.loadRes(PathTool.getUIIconPath(this.background_path,"bg_1"), function (sf_obj) {
            this.Sprite_21.spriteFrame = sf_obj;
            this.Sprite_23.spriteFrame = sf_obj;
        }.bind(this));

        this.loadRes(PathTool.getUIIconPath(this.background_path,"bg_2"), function (sf_obj) {
            this.Sprite_22.spriteFrame = sf_obj;
            this.Sprite_24.spriteFrame = sf_obj;
        }.bind(this));

        
    },

    playEnterEffect:function(status){
        if(!status){
            if(this.enter_effect){
                this.enter_effect.setToSetupPose();
                this.enter_effect.clearTracks();
                this.enter_effect = null;
            }
        }else{
            if(this.enter_effect == null){
                var eff_node = new cc.Node();
                eff_node.setAnchorPoint(0.5,0.5)
                eff_node.setPosition(0,SCREEN_HEIGHT*0.2);//SCREEN_WIDTH*0.5,SCREEN_HEIGHT*0.5
                this.root_wnd.addChild(eff_node,0);

                this.enter_effect = eff_node.addComponent(sp.Skeleton);
            }

            var animationCompleteFunc = function(){
                this.enter_effect.node.active = false;
            }.bind(this);

            var anima_path = PathTool.getSpinePath(PathTool.getEffectRes(157), "action");
            this.loadRes(anima_path, function(ske_data) {
                this.enter_effect.skeletonData = ske_data;
                this.enter_effect.node.active = true;
                this.enter_effect.setAnimation(0, PlayerAction.action_1, false);
            }.bind(this));

            if(this.had_register == false){
                if(this.enter_effect){
                    this.had_register = true;
                    this.enter_effect.setCompleteListener(animationCompleteFunc);
                }
            }
        }
    },

    updateRoomData:function(is_update){
        var room_list = this.model.getRoomList();
        var click_callback = function(item){
            this.clickCellItem(item);
        }.bind(this);

        is_update = is_update || false;

        var temp_list = [];
        for(var i in room_list){
            temp_list.push(room_list[i]);
        }
        
        this.item_scrollview.setData(temp_list, click_callback, is_update);
    },

    // ==============================--
    // desc:点击房间处理
    // @item:
    // @return 
    // ==============================--
    clickCellItem:function(item){
        if(item == null || item.data == null)return;
        if(this.base_data == null || this.base_data.id == null)return;

        var data = item.data;
        var config = data.config;
        if(data.status == AdventureConst.status.can_open){
            if(config && config.evt_type == AdventureEvent.EventType.mysterious){
                this.playSpecialEffect(item, "E23013", function(id){
                    this.ctrl.send20608(id);
                }.bind(this));
            }else{
                this.ctrl.send20608(data.id);
            }
        }else if(data.status == AdventureConst.status.lock){
            message(Utils.TI18N("击败附近守卫后可探索该区域"));
        }else if(config){
            if(data.status == AdventureConst.status.open){
                if(config.evt_type == AdventureEvent.EventType.effect && Utils.next(config.handle_type) != null){//特效类的事件
                    this.ctrl.send20620(data.id, AdventureEvent.AdventureEvenHandleType.handle, {});
                }else if(config.evt_type == AdventureEvent.EventType.buff){
                    this.ctrl.send20620(data.id, AdventureEvent.AdventureEvenHandleType.handle, {});
                }else if(config.evt_type == AdventureEvent.EventType.skill){//技能,这个时候把这个位置记录出来吧
                    this.room_skill_list[data.id] = item;
                    this.ctrl.send20620(data.id, AdventureEvent.AdventureEvenHandleType.handle, {});
                }else{
                    this.ctrl.openWindowByConfig(data);
                }
            }else if(config.evt_type == AdventureEvent.EventType.shop){
                this.ctrl.openWindowByConfig(data);
            }else{
                if(config.evt_type == AdventureEvent.EventType.next && data.status == AdventureConst.status.over && this.base_data){
                    if(item.is_last_floor == true){
                        message(Utils.TI18N("已达冒险最顶层,请等待冒险重置"));
                        return;
                    }
                    this.gotoNextFloor(data.id);
                }
            }
        }

    },

    // ==============================--
    // desc:播放特殊资源
    // @effect_name:
    // @callback:
    // @return 
    // ==============================--
    playSpecialEffect:function(item, effect_name, callback){
        if(item==null || item.data == null)return;
        item.changeBossEffectStatus(callback, PlayerAction.action_1);
    },

    // ==============================--
    // desc:播放采集类的特效
    // @item:
    // @callback:
    // @return 
    // ==============================--
    playCollectEffect:function(item, callback){
        if(item == null)return;
        if(item.data == null || item.data.config == null || item.data.config.handle_type == null)return;
        if(this.collect_effect_list[item.data.id]){//正在播放
            return;
        }
        var data = item.data;
        var handle_type = item.data.config.handle_type;
        if(handle_type == null || handle_type[1] == null || Utils.next(handle_type[1]) == null){
            callback(data);
            return;
        }

        var effect_res = handle_type[1][1]        // 采集特效资源
        var effect_desc = handle_type[1][2]       // 采集描述
        var finish_func = function(){//特效播放完成
            if(item){
                item.setOtherDesc(false);
            }
            if(this.root_wnd){
                var tmp_spine = this.collect_effect_list[data.id];
                if(tmp_spine){
                    tmp_spine.node.runAction(cc.removethis(true));
                    this.collect_effect_list[data.id] = null;
                }
            }
            callback(data);
        }.bind(this);

        var world_pos = item.convertToWorldSpace(cc.v2(0, 0));
        var node_pos = this.root_wnd.convertToNodeSpace(world_pos);
        var eff_node = new cc.Node();
        eff_node.setAnchorPoint(0.5,0.5)
        eff_node.setPosition(node_pos.x+71, node_pos.y+45);
        this.root_wnd.addChild(eff_node);

        var spine = eff_node.addComponent(sp.Skeleton);
        spine.setCompleteListener(finish_func);

        var anima_path = PathTool.getSpinePath(effect_res, "action");
        this.loadRes(anima_path, function(spine,ske_data) {
            spine.skeletonData = ske_data;
            spine.setAnimation(0, PlayerAction.action, false);
        }.bind(this,spine));
        spine.setTimeScale(1.3)
        this.collect_effect_list[data.id] = spine;
        if(effect_desc != ""){
            item.setOtherDesc(true, effect_desc);
        }
    },

    // ==============================--
    // desc:3个技能处理
    // @index:
    // @return 
    // ==============================--
    handleSkillChoose:function(index){
        if(index == null)return;
        var object = this.skill_list[index];
        if(object == null || object.config == null)return;
        if(index == 1){
            this.openChooseHP(object.config, object.num_value, object.use_count);
        }else if(index == 2){
            this.openShotKill(object.config, object.num_value, object.use_count);
        }else if(index == 3){
            this.ctrl.send20607(index, 0) ;
        }
    },

    // ==============================--
    // desc:显示气血
    // @return 
    // ==============================--
    openChooseHP:function(config, num_value, use_count){
        // 这里需要判断一下 如果当前伙伴全部死了.就不要打开了
        if(this.model.allHeroIsDie() == true){
            message(Utils.TI18N("没有可使用英雄"));
            return;
        }
        this.ctrl.openAdventureUseHPWindow(true, {config:config, num:num_value, use_count:use_count})
    },

    // ==============================--
    // desc:显示一击必杀
    // @return 
    // ==============================--
    openShotKill:function(config, num_value, use_count){
        this.ctrl.openAdventureShotKillWindow(true,  {config:config, num:num_value, use_count:use_count});
    },

    // ==============================--
    // desc:去往下一层
    // @config:
    // @return 
    // ==============================--
    gotoNextFloor:function(id){
        if(this.goto_next_alert)return;
        var cancel_callback = function(){
            this.goto_next_alert = null;
        }.bind(this);

        id = id || 0;
        var confirm_callback = function(){
            this.ctrl.send20620(id, AdventureEvent.AdventureEvenHandleType.handle, {}) 
            this.goto_next_alert = null;
        }.bind(this);

        var desc = Utils.TI18N("进入下一层后，将无法返回该层，是否进入？") ;
        var room_list = this.model.getRoomList();
        if(room_list){
            for(var k in room_list){
                if(room_list[k].status == AdventureConst.status.can_open){
                    desc = Utils.TI18N("本层还有未探索区域，此时进入下一层可能会错过事件奖励，是否继续？");
                    break;
                }
            }
        }
        this.goto_next_alert = CommonAlert.show(desc,Utils.TI18N("确定"),confirm_callback,Utils.TI18N("取消"),cancel_callback,null,cancel_callback);
    },

    // ---引导需要
    // function AdventureMainWindow:getAlert()
    //     if this.goto_next_alert then
    //         return this.goto_next_alert
    //     end
    // end

    // ==============================--
    // desc:获得技能播放飘逸效果
    // @id:
    // @skill_id:
    // @return 
    // ==============================--
    playSkillEffectAction:function(id, skill_id) {
        if(id == null || skill_id == null)return;
        var room_cell = this.room_skill_list[id];
        if(room_cell == null)return;
        var evt_img = room_cell.getEvtImg();
        if(evt_img == null)return;

        var object = this.skill_list[skill_id];
        if(object == null || object.node == null)return;

        var size = evt_img.node.getContentSize();
        var world_pos = evt_img.node.convertToWorldSpace(cc.v2(0, 0));
        var var_pos = this.root_wnd.convertToNodeSpace(world_pos);               // 起始位置,需要算上偏移

        var target_world_pos = object.node.convertToWorldSpace(cc.v2(0, 0));
        var target_var_pos = this.root_wnd.convertToNodeSpace(target_world_pos);

        var skill_res_id = "adventurewindow_6";
        if(skill_id == 2){
            skill_res_id = "adventurewindow_7";
        }else if(skill_id == 3){
            skill_res_id = "adventurewindow_8";
        }

        var start_x = var_pos.x + size.width * 0.5;
        var start_y = var_pos.y + size.height * 0.5;

        var target_size = object.node.getContentSize();
        var target_x = target_var_pos.x + target_size.width * 0.5;
        var target_y = target_var_pos.y + target_size.height * 0.5;

        //  创建单位,并且移动到指定点
        var item_res = PathTool.getUIIconPath("adventurewindow",skill_res_id);
        var fly_object = null;

        if(this.fly_cache_item_list.length == 0){
            fly_object = {};
            fly_object.item = Utils.createImage(this.root_wnd, null, start_x,  start_y, cc.v2(0.5, 0.5), false);
            this.loadRes(item_res, function (item,sf_obj) {
                item.spriteFrame = sf_obj;
            }.bind(this,fly_object.item));
            fly_object.res_id = item_res;
        }else{
            fly_object = this.fly_cache_item_list.shift();
        }

        if(fly_object.item && fly_object.res_id){
            fly_object.id = id;
            fly_object.item.node.setScale(1.3);
            fly_object.item.node.active = true;
            fly_object.item.node.setPosition(start_x, start_y);
            if(fly_object.res_id != item_res){
                fly_object.res_id = item_res;
                this.loadRes(item_res, function (item,sf_obj) {
                    item.spriteFrame = sf_obj;
                }.bind(this,fly_object.item));
            }
            this.fly_item_list[id] = fly_object;
            this.flySkillItemToTarget(fly_object, start_x, start_y, target_x, target_y);
        }
    },

    // ==============================--
    // desc:移动技能图标
    // @object:
    // @start_x:
    // @start_y:
    // @target_x:
    // @target_y:
    // @return 
    // ==============================--
    flySkillItemToTarget:function(object, start_x, start_y, target_x, target_y){
        if(object == null || object.item == null)return;
        var bezier = [];
        var begin_pos = cc.v2(start_x, start_y);
        bezier.push(begin_pos);

        var end_pos = cc.v2(target_x, target_y);
        var min_pos = begin_pos.add(end_pos).mul(0.5);
        var off_y = 10;
        var off_x = - 30;
        var controll_pos = cc.v2(min_pos.x + off_x, begin_pos.y - off_y);

        bezier.push(controll_pos);
        bezier.push(end_pos);
        var bezierTo = cc.bezierTo(1, bezier);
        var call_fun = function(object){
            object.item.node.active = false;
            this.fly_item_list[object.id] = null;
            this.fly_cache_item_list.push(object);
        }.bind(this,object);

        var seq = cc.sequence(bezierTo, cc.callFunc(call_fun));
        var scale_to = cc.scaleTo(1, 0.5);
        var spawn = cc.spawn(scale_to, seq);
        object.item.node.runAction(spawn);
    },
        

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        // 还原就的战斗ui类型
        MainuiController.getInstance().resetUIFightType();

        if (this.item_scrollview){
            this.item_scrollview.deleteMe();
            this.item_scrollview = null;
        }

        // 移除掉缓动图标
        if(this.fly_item_list){
            for(var i in this.fly_item_list){
                if(this.fly_item_list[i] && this.fly_item_list[i].item){
                    this.fly_item_list[i].item.node.stopAllActions();
                }
            }
            this.fly_item_list = null;
        }

        if(this.box_effect){
            this.box_effect.setToSetupPose();
            this.box_effect.clearTracks();
            this.box_effect = null;
        }

        this.clearEneTime();
        for(var i in this.hero_list){
            this.hero_list[i].deleteMe();
        }
        this.hero_list = null;

        this.playEnterEffect(false);
        this.ctrl.openAdventureMainWindow(false);

        if(this.is_wide_screen){
            MainuiController.getInstance().setMainChatBoxCurViewType(ChatConst.ViewType.Normal);
        }
    },
})