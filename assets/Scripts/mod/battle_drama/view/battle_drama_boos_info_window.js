// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     剧情副本boss信息界面
// <br/>Create: 2019-03-26 20:48:02
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var Battle_dramaEvent = require("battle_drama_event");
var BackpackController = require("backpack_controller");
var BaseRole = require("baserole");

var Battle_drama_boos_infoWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("battledrama", "battle_darma_boos_info_windows");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Mini;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        this.swap_status = 0 //0:不可挑战,1可挑战,2,扫荡
        this.item_list = [];
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        this.panel_bg = this.root_wnd.getChildByName("Panel_bg");
        this.background = this.panel_bg.getChildByName("background");
        this.background.scale = FIT_SCALE;

        this.main_container = this.root_wnd.getChildByName("root");
        this.close_btn = this.main_container.getChildByName("close_btn");
        this.ack_button = this.main_container.getChildByName("ack_button");
        // -- this.ack_button.label = this.ack_button:getTitleRenderer()
        // -- this.ack_button.label:enableOutline(Config.ColorData.data_color4[156], 2)
        this.window_title_label = this.main_container.getChildByName("window_title_label").getComponent(cc.Label);
        this.window_title_label.string = Utils.TI18N("关卡信息");
        this.dungeon_name = this.main_container.getChildByName("dungeon_name").getComponent(cc.Label);
        this.boss_name_desc = this.main_container.getChildByName("boss_name_desc");
        this.boss_name_desc.string = Utils.TI18N("BOSS:");
        this.boss_name = this.main_container.getChildByName("boss_name").getComponent(cc.Label);
        this.diffcult_label_desc = this.main_container.getChildByName("diffcult_label_desc").getComponent(cc.Label);
        this.diffcult_label_desc.string = Utils.TI18N("战斗力:");
        this.diffcult_label = this.main_container.getChildByName("diffcult_label").getComponent(cc.Label);
        this.item_container = this.main_container.getChildByName("item_container");
        this.title_label = this.item_container.getChildByName("title_label").getComponent(cc.Label);
        this.title_label.string = Utils.TI18N("可能掉落");
        this.item_scroolview = this.item_container.getChildByName("item_scroolview");
        this.scroolview_content = this.item_scroolview.getChildByName("content");
        this.role_bg = this.main_container.getChildByName("role_bg").getComponent(cc.Sprite);
        this.loadRes(PathTool.getBigBg("bigbg_5"), (function(resObject){
            this.role_bg.spriteFrame = resObject;
        }).bind(this));

        this.swap_label = Utils.createRichLabel(24, new cc.Color(0xca,0x72,0x24, 0xff), cc.v2(0, 0.5), cc.v2(70,370),30,1000);
        this.main_container.addChild(this.swap_label.node);
        this.swap_label.node.active = false;
        
        this.swap_num_label = Utils.createRichLabel(26, new cc.Color(0xca,0x72,0x24, 0xff), cc.v2(0, 0.5), cc.v2(410,685),40,1000);
        this.main_container.addChild(this.swap_num_label.node);
        this.swap_num_label.node.active = false;
        
        this.free_swap_label = Utils.createRichLabel(26, new cc.Color(0xca,0x72,0x24, 0xff), cc.v2(0, 0.5), cc.v2(485,330),40,1000);
        this.free_swap_label.string = Utils.TI18N("本次扫荡免费");
        this.main_container.addChild(this.free_swap_label.node);
        this.free_swap_label.node.active = false;

        this.updateData();
    },

    updateData:function(){
        if(this.dungeon_data){
            this.dungeon_name.string = this.dungeon_data.info_data.name;
            // --this.boss_name:setString(this.dungeon_data.info_data.name)
            
            var config = Utils.getUnitConfig(this.dungeon_data.info_data.unit_id);
            var cur_dungeon_data = this.model.getCurDunInfoByID(this.dungeon_data.info_data.id) || this.dungeon_data.v_data;
            var status = cur_dungeon_data.status;
            if(config){
                this.boss_name.string = config.name;
            }
            this.diffcult_label.string = this.dungeon_data.info_data.power;
            var str = cc.js.formatStr(Utils.TI18N("<color=#764519>扫荡次数: </color><color=#249003>%s</color>/%s"),cur_dungeon_data.auto_num, Config.dungeon_data.data_drama_const["swap_time"].val)
            if(cur_dungeon_data.auto_num >= Config.dungeon_data.data_drama_const["swap_time"].val){
                str = cc.js.formatStr(TI18N("<color=#764519>扫荡次数: </color><<color=#249003>%s/%s</color>"),cur_dungeon_data.auto_num, Config.dungeon_data.data_drama_const["swap_time"].val)
            }
            this.swap_num_label.string = str;
            this.updateItemReward(this.dungeon_data.info_data.show_items);
            this.updateRole(this.dungeon_data.info_data.unit_id);
            var drama_data = this.model.getDramaData();
            var offset_num = Config.dungeon_data.data_drama_const["swap_time"].val - drama_data.auto_num;
            if(drama_data && offset_num <= 0){
                // -- this.ack_button:setTouchEnabled(false)
                // -- this.ack_button.label:disableEffect(cc.LabelEffect.OUTLINE)
                // -- setChildUnEnabled(true, this.ack_button)
            }else{
                this.updateBtnStatus(status);
                this.updateFreeData();
            }
        }
    },

    updateFreeData:function(){
        var free_num = Config.dungeon_data.data_drama_const['free_swap'].val;
    
        var drama_data = this.model.getDramaData();
        this.is_free = drama_data.auto_num - free_num < 0;
        // -- this.free_swap_label:setVisible(this.is_free)
    },

    updateBtnStatus:function(status){
        if(status == 3){//已通关
            this.swap_status = 2;
            // -- this.ack_button:setTouchEnabled(true)
            // --this.swap_num_label:setVisible(true)
            // -- setChildUnEnabled(false, this.ack_button)
            // -- this.ack_button:setTitleText(TI18N("扫荡"))
            // -- this.ack_button.label:enableOutline(Config.ColorData.data_color4[82], 2)
        }else{
            this.swap_status = 0;
            // --this.ack_button:setTouchEnabled(false)
            // --this.swap_num_label:setVisible(false)
            // -- setChildUnEnabled(true, this.ack_button)
            // -- this.ack_button:setTitleText(TI18N("挑战"))
            // -- this.ack_button.label:enableOutline(Config.ColorData.data_color4[84], 2)
            // 如果倒计时还是大于0
            if(status == 2){
                // -- this.ack_button:setTouchEnabled(true)
                // -- setChildUnEnabled(false, this.ack_button)
                this.swap_status = 1;
                // -- this.ack_button.label:enableOutline(Config.ColorData.data_color4[82], 2)
            }
        }
    },

    updateRole:function(body_id){
        if(!this.spine_model && body_id != ""){
            this.spine_model = new BaseRole();
            this.spine_model.setParent(this.role_bg.node);
            // this.spine_model.setPosition(0, this.role_bg.node.getContentSize().height/2 + 30);
            this.spine_model.setPosition(30, -90);
            this.spine_model.setData(BaseRole.type.unit, body_id, PlayerAction.show, true,0.8);
        }
    },

    updateItemReward:function(data){
        if(!data)return; 
        var item = null;
        var item_width = 120 * data.length + data.length * 10
        var max_width = Math.max(this.scroolview_content.getContentSize().width, item_width);
        this.scroolview_content.setContentSize(cc.size(max_width, this.scroolview_content.getContentSize().height));
        for(var i in data){
            if(!this.item_list[i]){
                item = ItemsPool.getInstance().getItem("backpack_item");
                item.setParent(this.scroolview_content);
                item.setAnchorPoint(0.5,0.5)
                item.show();
                this.item_list[i] = item
            }
            item = this.item_list[i];
            if(item){
                item.setPosition(120/2 + i * (120 + 10),this.item_scroolview.getContentSize().height/2);
                var temp_data = {bid: data[i][0],num: data[i][1]}
                item.setData(temp_data)
                // --var config = Config.ItemData.data_get_data(v[1])
                // -- var is_equip = item:checkIsEquip(config.type)
                // -- if is_equip == true then
                // --     this:setEquipJie(true)
                // -- end
                item.setDefaultTip();
            }
        }
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        Utils.onTouchEnd(this.background, function () {
            this.ctrl.openDramBossInfoView(false);
        }.bind(this), 2);

        Utils.onTouchEnd(this.close_btn, function () {
            this.ctrl.openDramBossInfoView(false);
        }.bind(this), 2);
 
        this.addGlobalEvent(Battle_dramaEvent.BattleDrama_Boss_Update_Data, function(data) { 
            if(data){
                var str = cc.js.formatStr("<color=#764519>扫荡次数: </color><color=#289b14>%s</color>/%s",data.auto_num, Config.dungeon_data.data_drama_const["swap_time"].val)
                if(data.auto_num >= Config.dungeon_data.data_drama_const["swap_time"].val){
                    str = cc.js.formatStr(Utils.TI18N("<color=#764519>扫荡次数: </color> <color=#249003>%s</color><color=#249003>/%s</color>"),data.auto_num, Config.dungeon_data.data_drama_const["swap_time"].val)
                }
                this.swap_num_label.string = str;
            }
        }.bind(this));

        this.addGlobalEvent(Battle_dramaEvent.BattleDrama_Top_Update_Data, function(data) { 
            this.updateData();
        }.bind(this));

        this.addGlobalEvent(Battle_dramaEvent.BattleDrama_Quick_Battle_Data, function(data) { 
            this.updateFreeData();
        }.bind(this));
    },

    checkSwapAlert:function(){
        var num = BackpackController.getInstance().getModel().getBackPackItemNumByBid(Config.dungeon_data.data_drama_const['swap_item'].val);
        if(!this.is_free){
            if(num <= 0){
                var drama_data = this.model.getDramaData();
                var swap_num = Math.min(drama_data.auto_num + 1, Config.DungeonData.data_swap_data.length);
                var loss = Config.dungeon_data.data_swap_data[swap_num].loss;
                var str = cc.js.formatStr(Utils.TI18N("扫荡券不足,是否使用<img src=%s visible=true scale=0.5 /><color=#289b14 fontsize= 26>%s</color>扫荡关卡?"),PathTool.getItemRes(loss[0][0]),loss[0][1]);
                var call_back = function(){
                    if(this.dungeon_data && this.dungeon_data.info_data){
                        this.ctrl.send13005(this.dungeon_data.info_data.id,1);
                    }
                }.bind(this);
                var CommonAlert = require("commonalert");
                CommonAlert.show(str, Utils.TI18N('确定'), call_back, Utils.TI18N('取消'))
            }else{
                this.ctrl.openDramSwapView(true, this.dungeon_data.info_data.id);
            }
        }else{
            this.ctrl.send13005(this.dungeon_data.info_data.id, 1);
        }
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(data){
        this.dungeon_data = data;
        this.updateData();
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        if(this.spine_model){
            this.spine_model.deleteMe();
            this.spine_model = null;
        }

        this.ctrl.openDramBossInfoView(false);
    },
})