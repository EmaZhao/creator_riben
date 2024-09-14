// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-02-18 14:17:00
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var HallowsConst = require("hallows_const");
var BackpackController = require("backpack_controller");
var HallowsEvent = require("hallows_event");
var BackpackEvent = require("backpack_event");
var BackPackConst = require("backpack_const")
var PartnerCalculate = require("partner_calculate");

var hallows_mainWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("hallows", "hallows_main_window");
        this.viewTag = SCENE_TAG.ui;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Full;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.rleasePrefab = false;
        
        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        this.skill_attr_list = {}; // 技能加成
        this.is_in_advance = false;		// 是否在自动进阶中
        this.hallows_list = {};
        this.hallows_sum = 0;
        this.tab_list = {};
        this.attr_bgs = {};
        this.base_attr_list = {};
        this.is_max_hallows_lv = false;  // 神器是否达到最大等级
        this.is_max_skill_lv = false;	// 技能是否达到最大等级
        this.cur_index = HallowsConst.Tab_Index.uplv;
        this.hallows_uplv_cost_bid_1 = 0; // 选中的神器升级所需消耗1
        this.hallows_uplv_cost_num_1 = 0;
        this.hallows_uplv_cost_bid_2 = 0;// 选中的神器升级所需消耗2
        this.hallows_uplv_cost_num_2 = 0;
        this.skill_lvup_cost_bid_1 = 0;   // 选中的神器技能升级所需消耗1
        this.skill_lvup_cost_num_1 = 0;
        this.skill_lvup_cost_bid_2 = 0; 	 // 选中的神器技能升级所需消耗2
        this.skill_lvup_cost_num_2 = 0;
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        this.background = this.seekChild(this.root_wnd, "background");
        this.background.scale = FIT_SCALE;
        this.bg = this.seekChild(this.root_wnd, "background", cc.Sprite);
        this.loadRes(PathTool.getBigBg("bigbg_68","jpg"), (function(resObject){
            this.bg.spriteFrame = resObject;
        }).bind(this));

        var main_panel = this.root_wnd.getChildByName("main_panel");
        var title_bg = main_panel.getChildByName("title_bg");

        this.title_bg_img = title_bg.getComponent(cc.Sprite);
        this.loadRes(PathTool.getCommonIcomPath("Shadow_1_1"), (function(resObject){
            this.title_bg_img.spriteFrame = resObject;
        }).bind(this));

        this.bottom_bg = main_panel.getChildByName("bottom_bg");

        this.bottom_bg_img = this.bottom_bg.getComponent(cc.Sprite);
        this.loadRes(PathTool.getCommonIcomPath("common_1003"), (function(resObject){
            this.bottom_bg_img.spriteFrame = resObject;
        }).bind(this));

        this.close_btn = main_panel.getChildByName("close_btn");
        // 升级
	    this.step_container = main_panel.getChildByName("step_container");
        this.attr_bg_1 = this.step_container.getChildByName("attr_bg_1").getComponent(cc.Sprite);
        this.attr_bg_2 = this.step_container.getChildByName("attr_bg_2").getComponent(cc.Sprite);
        this.loadRes(PathTool.getCommonIcomPath("Currency_2_1"), (function(resObject){
            this.attr_bg_1.spriteFrame = resObject;
            this.attr_bg_2.spriteFrame = resObject;
        }).bind(this));

        this.bottom_bg_2 = this.bottom_bg.getChildByName("bottom_bg_2").getComponent(cc.Sprite);
        this.loadRes(PathTool.getCommonIcomPath("common_1036"), (function(resObject){
            this.bottom_bg_2.spriteFrame = resObject;
        }).bind(this));

        this.skill_bg = main_panel.getChildByName("skill_bg");
        var skill_title = this.skill_bg.getChildByName("skill_title").getComponent(cc.Label);
        skill_title.string = Utils.TI18N("技能加成");

        this.trace_btn = main_panel.getChildByName("trace_btn");						// 圣印按钮
        var trace_lab = this.trace_btn.getChildByName("label").getComponent(cc.Label);
        trace_lab.string = Utils.TI18N("圣印");
        
        this.trace_btn_tips = this.trace_btn.getChildByName("tips");					// 圣印红点
        this.trace_btn_tips.active = false;
        this.reset_btn = main_panel.getChildByName("reset_btn");
        var reset_lab = this.reset_btn.getChildByName("label").getComponent(cc.Label);
        reset_lab.string = Utils.TI18N("重铸");
        this.reset_btn.active = false;

        this.artifact_btn = main_panel.getChildByName("artifact_btn");
        var artifact_btn_label = this.artifact_btn.getChildByName("label").getComponent(cc.Label);
        artifact_btn_label.string = Utils.TI18N("失落神器");
        this.touch_layout = main_panel.getChildByName("touch_layout");

        this.left_btn = main_panel.getChildByName("left_btn");						    // 左移按钮
        this.right_btn = main_panel.getChildByName("right_btn");						// 右移按钮
        this.explain_btn = main_panel.getChildByName("explain_btn");					// 说明按钮
        this.hallows_name = title_bg.getChildByName("hallows_name").getComponent(cc.Label);				    // 圣器名字

        
        var title_attr = this.step_container.getChildByName("title_attr").getComponent(cc.Label);
        title_attr.string = Utils.TI18N("全队基础属性");
        for(var i = 1;i<3;i++){
            var attr_bg = this.step_container.getChildByName("attr_bg_"+i);
		    this.attr_bgs[i] = attr_bg;
        }

        this.uplv_layout = this.step_container.getChildByName("uplv_layout");
        this.step_progress = this.uplv_layout.getChildByName("progress").getComponent(cc.ProgressBar);							// 当前经验条
        this.step_progress_value = this.uplv_layout.getChildByName("progress_value").getComponent(cc.Label);				    // 当前经验值
        this.step_advanced_btn = this.uplv_layout.getChildByName("advanced_btn");					                            // 进阶一次按钮
        this.step_auto_advanced_btn = this.uplv_layout.getChildByName("auto_advanced_btn")		                                // 一键进阶按钮
        var step_advanced = this.step_advanced_btn.getChildByName("label").getComponent(cc.Label);
        step_advanced.string = Utils.TI18N("升级");
        this.step_auto_advanced_btn_label = this.step_auto_advanced_btn.getChildByName("label").getComponent(cc.Label);
        this.step_auto_advanced_btn_label.string = Utils.TI18N("一键升级");
        this.step_advanced_btn_tips = this.step_advanced_btn.getChildByName("tips")	                                             // 进阶红点
        this.step_advanced_btn_tips.active = false;


        // 升级消耗
        var lvup_cost_bg = this.uplv_layout.getChildByName("lvup_cost_bg");
        this.lvup_cost_bg_img = lvup_cost_bg.getComponent(cc.Sprite);
        this.lvup_cost_res_1 = lvup_cost_bg.getChildByName("res_icon").getComponent(cc.Sprite);
        this.lvup_cost_label_1 = lvup_cost_bg.getChildByName("lvup_cost_label").getComponent(cc.Label);
        var auto_lvup_cost_bg = this.uplv_layout.getChildByName("auto_lvup_cost_bg");
        this.auto_lvup_cost_img = auto_lvup_cost_bg.getComponent(cc.Sprite);
        this.lvup_cost_res_2 = auto_lvup_cost_bg.getChildByName("res_icon").getComponent(cc.Sprite);;
        this.lvup_cost_label_2 = auto_lvup_cost_bg.getChildByName("auto_lvup_cost_label").getComponent(cc.Label);

        // 技能
        this.skill_container = main_panel.getChildByName("skill_container");
        this.skill_layout = this.skill_container.getChildByName("skill_layout");
        this.skill_lvup_node = this.skill_layout.getChildByName("skill_lvup_btn");
        this.skill_lvup_btn = this.skill_layout.getChildByName("skill_lvup_btn").getComponent(cc.Button);
        this.skill_lvup_btn_label = this.skill_lvup_node.getChildByName("label").getComponent(cc.Label);
        this.skill_lvup_btn_label.string = Utils.TI18N("升级");
        this.skill_lvup_btn_line = this.skill_lvup_node.getChildByName("label").getComponent(cc.LabelOutline);
        

        // 技能升级消耗
        this.skill_cost_bg_1 = this.skill_layout.getChildByName("skill_cost_bg_1");
        this.skill_cost_bg_1_img = this.skill_cost_bg_1.getComponent(cc.Sprite);
        this.skill_res_icon_1 = this.skill_cost_bg_1.getChildByName("skill_res_icon_1").getComponent(cc.Sprite);
        this.skill_cost_label_1 = this.skill_cost_bg_1.getChildByName("skill_cost_label_1").getComponent(cc.Label);
        this.skill_cost_bg_2 = this.skill_layout.getChildByName("skill_cost_bg_2");
        this.skill_cost_bg_2_img = this.skill_cost_bg_2.getComponent(cc.Sprite);
        this.skill_res_icon_2 = this.skill_cost_bg_2.getChildByName("skill_res_icon_2").getComponent(cc.Sprite);
        this.skill_cost_label_2 = this.skill_cost_bg_2.getChildByName("skill_cost_label_2").getComponent(cc.Label);

        this.loadRes(PathTool.getCommonIcomPath("common_90003"), (function(resObject){
            this.lvup_cost_bg_img.spriteFrame = resObject;
            this.auto_lvup_cost_img.spriteFrame = resObject;
            this.skill_cost_bg_1_img.spriteFrame = resObject;
            this.skill_cost_bg_2_img.spriteFrame = resObject;
        }).bind(this));

        // 无法升级时的提示
        this.skill_lvup_tips = this.skill_layout.getChildByName("skill_lvup_tips").getComponent(cc.Label);
    
        // 满级
        this.maxlv_layout = main_panel.getChildByName("maxlv_layout");
        this.max_lv_tips = this.maxlv_layout.getChildByName("max_lv_tips").getComponent(cc.Label);

        var tab_container = main_panel.getChildByName("tab_container");
        for(var i = 1;i<3;i++){
            var object = {};
            var tab_btn = tab_container.getChildByName("tab_btn_"+i);
            if(tab_btn){
                var title = tab_btn.getChildByName("title").getComponent(cc.Label);
                if(i==1){
                    title.string = Utils.TI18N("升级");
                }else if(i==2){
                    title.string = Utils.TI18N("技能");
                }
                var tips = tab_btn.getChildByName("tips");
                var tab_btn_img = tab_container.getChildByName("tab_btn_"+i).getComponent(cc.Sprite);
                var res = PathTool.getCommonIcomPath("common_1012");
                this.loadRes(res, function (sf_obj) {
                    object.tab_btn_img.spriteFrame = sf_obj;
                }.bind(this));

                object.tab_btn = tab_btn;
                object.label = title;
                object.index = i;
                object.tips = tips;
                object.tab_btn_img = tab_btn_img;
               
                
                this.tab_list[i] = object;
            }
        }

        this.hallows_eff_node = this.seekChild("hallows_eff_node");
        this.hallows_eff_sk    = this.seekChild("hallows_eff_node", sp.Skeleton);

        this.update_eff_node = this.seekChild("update_eff_node");
        this.update_eff_sk    = this.seekChild("update_eff_node", sp.Skeleton);
        
	    this.main_panel = main_panel;
    },

    _onClickCloseBtn:function(){
      this.ctrl.openHallowsMainWindow(false);
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){

      this.close_btn.on(cc.Node.EventType.TOUCH_END, function () {
        Utils.playButtonSound(ButtonSound.Close);
          this._onClickCloseBtn();
        }, this)
        this.step_advanced_btn.on(cc.Node.EventType.TOUCH_END, function () {
            Utils.playButtonSound(ButtonSound.Normal);
            this.changeAutoAdvanceStatus(false);
            if(this.select_hallows){
                this.ctrl.requestHallowsAdvance(this.select_hallows.id, false) ;
            }
        }, this)

        this.step_auto_advanced_btn.on(cc.Node.EventType.TOUCH_END, function () {
            Utils.playButtonSound(ButtonSound.Normal);
            var is_in_advance = !this.is_in_advance;
            if(is_in_advance == true && this.select_hallows){
                this.ctrl.requestHallowsAdvance(this.select_hallows.id, false);
            }
            this.changeAutoAdvanceStatus(is_in_advance);
        }, this)

        this.left_btn.on(cc.Node.EventType.TOUCH_END, function () {
            Utils.playButtonSound(ButtonSound.Normal);
            if(this.hallows_list && Utils.next(this.hallows_list) != null){
                var select_index = parseInt(this.select_index);
                if(select_index <= 0){
                    select_index = this.hallows_sum;
                }else{
                    select_index = select_index - 1;
                }
                this.selectHallowsIndex(select_index)
            }
        }, this)

        this.right_btn.on(cc.Node.EventType.TOUCH_END, function () {
            Utils.playButtonSound(ButtonSound.Normal);
            if(this.hallows_list && Utils.next(this.hallows_list) != null){
                var select_index = parseInt(this.select_index);
                if(select_index+1 >= this.hallows_sum){
                    select_index = 0;
                }else{
                    select_index = select_index + 1;
                }
                this.selectHallowsIndex(select_index)
            }
        }, this)

        this.explain_btn.on(cc.Node.EventType.TOUCH_END, function (event) {
            Utils.playButtonSound(ButtonSound.Normal);
            var config = Config.hallows_data.data_const.game_rule
            var pos = event.touch.getLocation();
            require("tips_controller").getInstance().showCommonTips(config.desc, pos,null,null,500,false);            
        }, this)

        this.trace_btn.on(cc.Node.EventType.TOUCH_END, function () {
            Utils.playButtonSound(ButtonSound.Normal);
            if(this.select_hallows){
                if(this.select_hallows.vo == null){
                    message(TI18N("该圣器暂未激活"))
                }else{
                    var cost_config = Config.hallows_data.data_const.imprint_lowest;
                    if(cost_config){
                        if(this.select_hallows.vo.step < cost_config.val){
                            message(cost_config.desc)
                        }else{
                            this.ctrl.openHallowsTraceWindow(true, this.select_hallows);
                        }
                    }
                }
            }
        }, this)

        this.reset_btn.on(cc.Node.EventType.TOUCH_END, function () {
            Utils.playButtonSound(ButtonSound.Normal);
            this._onClickResetBtn();
        }, this)

        this.skill_lvup_node.on(cc.Node.EventType.TOUCH_END, function () {
            Utils.playButtonSound(ButtonSound.Normal);
            this._onClickSkillLvupBtn();
        }, this)

        this.artifact_btn.on(cc.Node.EventType.TOUCH_END, function () {
            Utils.playButtonSound(ButtonSound.Normal);
            this._onClickBtnArtifact();
        }, this)

        this.touch_layout.on(cc.Node.EventType.TOUCH_END, function () {
            Utils.playButtonSound(ButtonSound.Normal);
            this._onClickTouchLayout();
        }, this)

        for(var i in this.tab_list){
            if(this.tab_list[i].tab_btn){
                this.tab_list[i].tab_btn.on(cc.Node.EventType.TOUCH_END, function (index) {
                    Utils.playButtonSound(ButtonSound.Tab);
                    this.changeSelectedTab(index);
                }.bind(this,this.tab_list[i].index), this)
            }
        }

        this.addGlobalEvent(HallowsEvent.HallowsUpdateEvent, function(id) {
            this.handleUpdateEvent(id);
        }.bind(this))

        this.addGlobalEvent(HallowsEvent.HallowsAdvanceEvent, function(id, result) {
            if(this.select_hallows && this.select_hallows.id != id){
                this.changeAutoAdvanceStatus(false);
            }else{
                if(result == 0 || result == 1){//0标识材料之类的不足 1标识升阶了,这两种情况都停掉
                    this.changeAutoAdvanceStatus(false);
                }
            }
        }.bind(this))

        // 显示为某一神器（从所有神器预览界面打开）
        this.addGlobalEvent(HallowsEvent.UndateHallowsInfoEvent, function(id) {
            if(this.select_hallows && this.select_hallows.id != id){
                var select_index = this.getHallowsIndexById(id);
			    this.selectHallowsIndex(select_index);
            }
        }.bind(this))

        // 神器红点更新
        this.addGlobalEvent(HallowsEvent.HallowsRedStatus, function(red_type, setatus) {
            if(this.select_hallows){
                this.updateTabRedStatus();
            }
        }.bind(this))

        this.addGlobalEvent(BackpackEvent.ADD_GOODS, function(bag_code, item_list) {
            if(bag_code != BackPackConst.Bag_Code.BACKPACK)return;
            this.checkNeedUpdateItemNum(item_list);
        }.bind(this))

        this.addGlobalEvent(BackpackEvent.MODIFY_GOODS_NUM, function(bag_code, item_list) {
            if(bag_code != BackPackConst.Bag_Code.BACKPACK)return;
            this.checkNeedUpdateItemNum(item_list);
        }.bind(this))

        this.addGlobalEvent(BackpackEvent.DELETE_GOODS, function(bag_code, item_list) {
            if(bag_code != BackPackConst.Bag_Code.BACKPACK)return;
            this.checkNeedUpdateItemNum(item_list);
        }.bind(this))
    },

    // 点击重铸
    _onClickResetBtn:function(){
        var str = Utils.TI18N("重铸后神器将回到初始状态，同时返还除金币外所有资源，是否重铸？");
        var CommonAlert = require("commonalert");
        CommonAlert.show(str, Utils.TI18N("确定"), (function(){
            if(this.select_hallows){
                this.ctrl.requestHallowsReset(this.select_hallows.id);
            }

        }).bind(this), Utils.TI18N("取消"));
    },

    // 技能升级
    _onClickSkillLvupBtn:function(){
        if(this.select_hallows == null)return;
        var vo = this.select_hallows.vo;
        if(vo){
            this.ctrl.requestHallowsSkillUpgrade(vo.id);
        }
    },

    // 失落神器
    _onClickBtnArtifact:function(){
        this.ctrl.openHallowsPreviewWindow(true);
    },

    // 点击神器显示tip
    _onClickTouchLayout:function(){
        if(this.select_hallows == null)return;
        var vo = this.select_hallows.vo;
        if(vo){
            var max_vo = this.model.makeHighestHallowVo(vo.id);
		    this.ctrl.openHallowsTips(true, max_vo);
        }
    },

    // 切换分页
    changeSelectedTab:function( index ){
        if(this.tab_object && this.tab_object.index == index)return;
        if(this.tab_object){
            var res = PathTool.getCommonIcomPath("common_1012");
            this.loadRes(res, function (sf_obj) {
                this.tab_object.tab_btn_img.spriteFrame = sf_obj;
            }.bind(this));
            this.tab_object.label.node.color = new cc.Color(255, 255, 255,255);
            this.tab_object = null;
        }
        this.tab_object = this.tab_list[index];
        if(this.tab_object){
            var res = PathTool.getCommonIcomPath("common_1011");
            this.loadRes(res, function (sf_obj) {
                this.tab_object.tab_btn_img.spriteFrame = sf_obj;
            }.bind(this));
            this.tab_object.label.node.color = new cc.Color(255, 255, 255,255);
        }
        this.cur_index = index;
        this.step_container.active = index == HallowsConst.Tab_Index.uplv;
        this.skill_container.active = index == HallowsConst.Tab_Index.skill;
        this.updateMaxLvTips();
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(hallows_id, index){
        // 根据激活数和id重新排序,
        var config_list = Config.hallows_data.data_base;
        this.hallows_list = [];
        this.hallows_sum = Config.hallows_data.data_base_length;
        for(var i in config_list){
            var object = {};
            object.id = config_list[i].id;
            object.name = config_list[i].name;
            object.effect = config_list[i].effect;
            object.item_id = config_list[i].item_id;
            object.open_desc = config_list[i].open_desc;
            var vo = this.model.getHallowsById(config_list[i].id);
            object.vo = vo;
            this.hallows_list.push(object);
        }
        // 显示列表重新排序
        if(Utils.next(this.hallows_list)){
            this.hallows_list.sort(function (a, b) {
                return a.id - b.id;
            })
        }
    
        var select_index = this.getDefaultHallowsIndex(hallows_id);
        this.selectHallowsIndex(select_index);
    
        index = index || HallowsConst.Tab_Index.uplv
        this.changeSelectedTab(index);
    },

    // 取出进入界面时默认选中的神器index
    getDefaultHallowsIndex:function( hallows_id ){
        var temp_hallows_list = Utils.deepCopy(this.hallows_list);
        var select_index = 0;
        if(hallows_id){
            select_index = this.getHallowsIndexById(hallows_id);
        }else{
            //等级最高>进度最高>id越高
            var temp_hallows = [];
            temp_hallows_list.sort(function (a, b) {
                return b.vo.step - a.vo.step;
            })
            var max_step = 0;
            for(var i in temp_hallows_list){
                if(max_step <= temp_hallows_list[i].vo.step){
                    max_step = temp_hallows_list[i].vo.step;
                    temp_hallows.push(temp_hallows_list[i]);
                }
            }
            if(temp_hallows.length == 1){
                select_index = this.getHallowsIndexById(temp_hallows[0].id);
            }else{
                var max_lucky = 0;
                temp_hallows.sort(function (a, b) {
                    return  b.vo.lucky - a.vo.lucky;
                })

                var temp_hallows_2 = [];
                for(var j in temp_hallows){
                    var hallows = temp_hallows[j];

                    if(hallows.vo.lucky >= max_lucky){
                        max_lucky = hallows.vo.lucky
                        temp_hallows_2.push(hallows);
                    }
                }

                if(temp_hallows_2.length == 1){
                    select_index = this.getHallowsIndexById(temp_hallows_2[0].id);
                }else{
                    temp_hallows_2.sort(function (a, b) {
                        return b.id - a.id;
                    })
                    select_index = this.getHallowsIndexById(temp_hallows_2[0].id);
                }
            }
        }
        return select_index;
    },

    // 根据神器id获取对应的index
    getHallowsIndexById:function( id ){
        var index = 1;    
        for(var i in this.hallows_list){
            if(this.hallows_list[i].id && this.hallows_list[i].id == id){
                index = i;
            }
        }
        return index;
    },

    // 选中某一神器
    selectHallowsIndex:function(index, force){
        if(this.select_index == index && !force)return;
        //只要是正常切换,就终止掉自动进阶
        if(!force){
            this.changeAutoAdvanceStatus(false);
        }else{
            this.handleEffect(true);
        }

        this.select_index = index;
        this.select_hallows = this.hallows_list[index];
        if(this.select_hallows == null)return;
        this.reset_btn.active = this.checkIsShowResetBtn();
        // 切换神器时需要清掉的数据
        this.is_max_hallows_lv = false;      // 神器是否达到最大等级
        this.is_max_skill_lv = false;	     // 技能是否达到最大等级
        this.hallows_uplv_cost_bid_1 = 0;    // 选中的神器升级所需消耗1
        this.hallows_uplv_cost_num_1 = 0;
        this.hallows_uplv_cost_bid_2 = 0;    // 选中的神器升级所需消耗2
        this.hallows_uplv_cost_num_2 = 0;
        this.skill_lvup_cost_bid_1 = 0;      // 选中的神器技能升级所需消耗1
        this.skill_lvup_cost_num_1 = 0;
        this.skill_lvup_cost_bid_2 = 0; 	 // 选中的神器技能升级所需消耗2
        this.skill_lvup_cost_num_2 = 0;

        this.updateHallowsBaseInfo();
        this.updateSkillList();
        this.updateHallowStatusInfo();
        this.updateTabRedStatus();

    },
    
    handleEffect:function(status){
        if(!status){
            if(this.update_eff_sk){
                this.update_eff_sk.setToSetupPose();
                this.update_eff_sk.clearTracks();
            }
        }else{
            var anima_path = PathTool.getSpinePath(Config.effect_data.data_effect_info[185], "action");
            this.loadRes(anima_path, function(ske_data) {
                this.update_eff_sk.skeletonData = ske_data;
                this.update_eff_sk.setAnimation(0, PlayerAction.action, false);
            }.bind(this));
        }
    },

    //基础信息显示模型、名称、基础属性、技能等
    updateHallowsBaseInfo:function(){
        if(this.select_hallows == null)return;
        var action = PlayerAction.action_1;
        if(this.select_hallows.vo != null){
            action = PlayerAction.action_2;
        }
        if(this.hallows_model_id != this.select_hallows.effect){
            this.hallows_model_id = this.select_hallows.effect;
            this.handleEffect(false);
            if(this.hallows_eff_sk){
                this.hallows_eff_sk.setToSetupPose();
                this.hallows_eff_sk.clearTracks();
            }

            var anima_path = PathTool.getSpinePath(this.hallows_model_id, "action");
            this.loadRes(anima_path, function(ske_data) {
                this.hallows_eff_sk.skeletonData = ske_data;
                this.hallows_eff_sk.setAnimation(0, action, true);
            }.bind(this));
        }
        if(this.select_hallows.vo){
            this.hallows_eff_node.color = new cc.Color(255,255,255,255);
            // setChildUnEnabled(false, self.hallows_model)
        }else{
            this.hallows_eff_node.color = new cc.Color(169,169,169,255);
            // setChildUnEnabled(true, self.hallows_model)
        }
        
        // 基础属性
        var vo = this.select_hallows.vo;
        if(vo == null)return;
        //名称
        this.hallows_name.string = this.select_hallows.name + "+" + vo.step;
        
        var step_config = gdata("hallows_data","data_info",Utils.getNorKey(vo.id, vo.step));
        var next_step_config = gdata("hallows_data","data_info",Utils.getNorKey(vo.id, vo.step+1)) || {};
        
        // 基础属性
        for(var i in this.base_attr_list){
            this.base_attr_list[i].action = false;
        }
        
        for(var j in step_config.attr){
            if(j > 2)break;//UI只支持显示两个技能
            var attr_key = step_config.attr[j][0];
            var attr_val = step_config.attr[j][1] || 0;
            var next_attr_val = 0;
            //取出下一级属性加成，计算临时变量
            if(next_step_config.attr){
                for(var k in next_step_config.attr){
                    if(next_step_config.attr[k][0] && next_step_config.attr[k][0] == attr_key){
                        next_attr_val = next_step_config.attr[k][1] || 0;
                    }
                }
            }
            var attr_name = Config.attr_data.data_key_to_name[attr_key];
            if(attr_name){
                var attr_text = this.base_attr_list[j];
                if(attr_text == null){
                    attr_text = Utils.createRichLabel(24, new cc.Color(100,50,35,255), cc.v2(0, 0.5), cc.v2(20, 20), 30, 380)
                    attr_text.horizontalAlign = cc.macro.TextAlignment.LEFT;
                    var attr_bg = this.attr_bgs[parseInt(j)+1];
                    attr_bg.addChild(attr_text.node);
                    this.base_attr_list[j] = attr_text
                }
                attr_text.active = true;
                var icon = PathTool.getAttrIconByStr(attr_key);
                var add_value = 0;; // 临时变量
                
                if(next_attr_val > 0){
                    var ratio_config = Config.hallows_data.data_const["temporary_ratio"] || {};
                    var ratio = ratio_config.val || 800;
            	    add_value = Math.round(vo.lucky/step_config.max_lucky*(next_attr_val-attr_val)*(ratio/1000))
                }
                var is_per = PartnerCalculate.isShowPerByStr(attr_key);
                //当前属性值=配置表中的值+圣印加成的值
                var stone_config = Config.hallows_data.data_const["stone_attribute"];
                if(vo.seal > 0 && stone_config){
                    var stone_val = 0;
                    for(var k in stone_config.val){
                        if(stone_config.val[k][0] && stone_config.val[k][0] == attr_key){
                            stone_val = stone_config.val[k][1] || 0;
            			    break
                        }
                    }
                    attr_val = attr_val + stone_val*vo.seal;
                }
                if(is_per){
                    attr_val = (attr_val/10) +"%";
                }
                var attr_str = cc.js.formatStr("<img src='%s'/> <color=#292734> %s：</c><color=#292734>%s</c>",icon, attr_name, attr_val.toString());
                if(add_value > 0){
                    if(is_per){
                        add_value = (add_value/10) + "%";
                    }
                    attr_str = attr_str + cc.js.formatStr("<color=#339a00> +%s</c>", add_value.toString());
                }
                attr_text.string = attr_str;
                
                this.loadRes(PathTool.getCommonIcomPath(icon), (function(attr_text,resObject){
                    attr_text.addSpriteFrame(resObject);
                }).bind(this,attr_text));
            }
        }
        //神器技能
        var hallows_skill = gdata("hallows_data","data_skill_up",Utils.getNorKey(this.select_hallows.id, vo.skill_lev));
        if(hallows_skill && hallows_skill.skill_bid != 0){
            var config = gdata("skill_data","data_get_skill",hallows_skill.skill_bid);
            if(!config || Utils.next(config) == null){
                return;
            }
            if(!this.hallow_skill_icon){
                var SkillItem = require("skill_item")
                this.hallow_skill_icon   = new SkillItem();//true,true,true,0.9
                this.hallow_skill_icon.setParent(this.skill_container);
                this.hallow_skill_icon.setScale(0.9);
                this.hallow_skill_icon.setLeveStatus(false);
                this.hallow_skill_icon.setPosition(cc.v2(75, 245)) 
            }
            this.hallow_skill_icon.setData(config.bid);

            if(!this.hallows_skill_name){
                this.hallows_skill_name = Utils.createLabel(24,new cc.Color(139,71,21,255),null,135,267,"",this.skill_container,1,cc.v2(0,0));
            }
            this.hallows_skill_name.string = config.name + "+" + vo.skill_lev;

            if(!this.hallows_skill_desc){
                this.hallows_skill_desc = Utils.createRichLabel(22,new cc.Color(100,50,35,255),cc.v2(0,1),cc.v2(135, 250),30,550);
                this.hallows_skill_desc.horizontalAlign = cc.macro.TextAlignment.LEFT;
			    this.skill_container.addChild(this.hallows_skill_desc.node);
            }
            this.hallows_skill_desc.string = config.des;
        }
    },

    //创建技能加成
    updateSkillList:function(){
        if(this.select_hallows == null)return;
        var vo = this.select_hallows.vo;
        var skill_attr_config = Config.hallows_data.data_skill_attr[this.select_hallows.id] || {};
        for(var i in this.skill_attr_list){
            this.skill_attr_list[i].active = false;
        }

        for(var j in skill_attr_config){
            var attr_txt = this.skill_attr_list[j];
            if(attr_txt == null){
                attr_txt =Utils.createLabel(20,new cc.Color(120,120,120,255),null,0,0,"",this.skill_bg,1,cc.v2(0, 0.5))
			    this.skill_attr_list[j] = attr_txt;
            }
            attr_txt.active = true;
            attr_txt.node.setPosition(cc.v2(20, 90 - (j-1)*32))
            if(vo.skill_lev >= skill_attr_config[j].lev_limit){
                attr_txt.node.color = new cc.Color(80,255,80,255);
            }else{
                attr_txt.node.color = new cc.Color(120,120,120,255);
            }
            var attr_str = cc.js.formatStr(Utils.TI18N("技能%d级:%s"), skill_attr_config[j].lev_limit, skill_attr_config[j].desc);
            attr_txt.string = attr_str;
        }
    },

    //设置神器升级与技能状态显示
    updateHallowStatusInfo:function(){
        if(this.select_hallows == null)return;
        var vo = this.select_hallows.vo;
        if(vo == null){
            return;
        }else{
            //神器是否达到最大等级
            var max_lev = Config.hallows_data.data_max_lev[vo.id] || 100;
            if(vo.step >= max_lev){
                this.is_max_hallows_lv = true;
                this.uplv_layout.active = false;
            }else{
                this.is_max_hallows_lv = false;
                this.uplv_layout.active = true;
            }
            //技能是否达到最大等级
            var max_skill_lv = Config.hallows_data.data_skill_max_lev[vo.id] || 10;
            var skill_lv = vo.skill_lev;
            if(skill_lv >= max_skill_lv){
                this.is_max_skill_lv = true;
                this.skill_layout.active = false;
            }else{
                this.is_max_skill_lv = false;
                this.skill_layout.active = true;
            }
            //更新神器升级与技能显示
            if(!this.is_max_hallows_lv){
                this.updateStepInfo();
            }
            if(!this.is_max_skill_lv){
                this.updateSkillInfo();
            }
            this.updateMaxLvTips();
        }
    },

    // 刷新满级提示语
    updateMaxLvTips:function(){
        if(this.cur_index == HallowsConst.Tab_Index.uplv && this.is_max_hallows_lv){
            this.max_lv_tips.string = Utils.TI18N("神器已满级");
            this.maxlv_layout.active = true;
        }else if(this.cur_index == HallowsConst.Tab_Index.skill && this.is_max_skill_lv){
            this.max_lv_tips.string = Utils.TI18N("技能已满级");
            this.maxlv_layout.active = true;
        }else{
            this.maxlv_layout.active = false;   
        }
    },

    //设置神器升级相关显示
    updateStepInfo:function(){
        if(this.select_hallows == null)return;
        var vo = this.select_hallows.vo;
        if(vo == null)return;
        
        var step_config = gdata("hallows_data","data_info",Utils.getNorKey(vo.id, vo.step));
        if(step_config){
            //进度条
            this.step_progress_value.string = vo.lucky+"/"+step_config.max_lucky
            this.step_progress.progress = vo.lucky/step_config.max_lucky;

            // 神器升级消耗
		    var expend_1 = step_config.loss[0];
            var expend_2 = step_config.loss[1];
            if(expend_1){
                var bid = expend_1[0];
                var num = expend_1[1];
                this.hallows_uplv_cost_bid_1 = bid;
                this.hallows_uplv_cost_num_1 = num;
                this.setCostDataToNode(this.lvup_cost_res_1, this.lvup_cost_label_1, bid, num);
            }
            if(expend_2){
                var bid = expend_2[0];
                var num = expend_2[1];
                this.hallows_uplv_cost_bid_2 = bid;
                this.hallows_uplv_cost_num_2 = num;
                this.setCostDataToNode(this.lvup_cost_res_2, this.lvup_cost_label_2, bid, num) ;
            }
        }
    },

    // 更新神器技能相关显示
    updateSkillInfo:function(  ){
        if(this.select_hallows == null)return;
        var vo = this.select_hallows.vo;
        if(vo == null)return;
        
        var hallows_skill = gdata("hallows_data","data_skill_up",Utils.getNorKey(this.select_hallows.id, vo.skill_lev));
        if(hallows_skill && hallows_skill.skill_bid != 0){
            //升级消耗
            if(hallows_skill.lev_limit > vo.step){
                this.skill_lvup_tips.string = cc.js.formatStr(Utils.TI18N("神器%d级可继续升级"), hallows_skill.lev_limit);
                this.skill_lvup_tips.node.active = true;
                this.skill_cost_bg_1.active = false;
                this.skill_cost_bg_2.active = false;
                
                this.skill_lvup_btn.enableAutoGrayEffect = true;
                this.skill_lvup_btn.interactable = false;
                // this.skill_lvup_btn_line.width = 0;
                this.skill_lvup_btn_line.enabled = false;
            }else{
                this.skill_lvup_btn.enableAutoGrayEffect = false;
                this.skill_lvup_btn.interactable = true;
                // this.skill_lvup_btn_line.width = 2;
                this.skill_lvup_btn_line.enabled = true;
                this.skill_lvup_tips.node.active = false;
                this.skill_cost_bg_1.active = true;
                this.skill_cost_bg_2.active = true;
                var expend_1 = hallows_skill.lose[0];
                var expend_2 = hallows_skill.lose[1];
                if(expend_1){
                    var bid = expend_1[0];
                    var num = expend_1[1];
                    this.skill_lvup_cost_bid_1 = bid;
                    this.skill_lvup_cost_num_1 = num;
                    this.setCostDataToNode(this.skill_res_icon_1, this.skill_cost_label_1, bid, num);
                }
                if(expend_2){
                    var bid = expend_2[0];
                    var num = expend_2[1];
                    this.skill_lvup_cost_bid_2 = bid
                    this.skill_lvup_cost_num_2 = num
                    this.setCostDataToNode(this.skill_res_icon_2, this.skill_cost_label_2, bid, num);
                }
            }
        }
    },

    // 更新tab按钮红点显示
    updateTabRedStatus:function(  ){
        if(this.select_hallows == null)return;
        var red_hallows_id = this.model.getRedHallowsId();
        if(red_hallows_id && red_hallows_id == this.select_hallows.id){
            for(var i in this.tab_list){
                var tab_object = this.tab_list[i];
                if(tab_object.tips && tab_object.index){
                    var red_status = false;
                    if(tab_object.index == HallowsConst.Tab_Index.uplv){
                        red_status = this.model.checkRedIsShowByRedType(HallowsConst.Red_Index.hallows_lvup);
                    }else if(tab_object.index == HallowsConst.Tab_Index.skill){
                        red_status = this.model.checkRedIsShowByRedType(HallowsConst.Red_Index.skill_lvup);
                    }
                    tab_object.tips.active = red_status;
                }
            }
            if(this.trace_btn_tips){
                var trace_red = this.model.checkRedIsShowByRedType(HallowsConst.Red_Index.stone_use);
			    this.trace_btn_tips.active = trace_red;
            }
        }else{
            for(var j in this.tab_list){
                var tab_object = this.tab_list[j];
                if(tab_object.tips){
                    tab_object.tips.active = false;
                }
            }

            if(this.trace_btn_tips){
                this.trace_btn_tips.active = false;
            }
        }
    },

    // 显示消耗数据
    setCostDataToNode:function( item_icon, item_label, item_bid, item_num ){
        var item_config = Utils.getItemConfig(item_bid);
        if(item_config){
            var res = PathTool.getItemRes(item_config.icon)
            this.loadRes(res, function (item_icon,sf_obj) {
                item_icon.spriteFrame = sf_obj;
            }.bind(this,item_icon));

            var count = BackpackController.getInstance().getModel().getItemNumByBid(item_bid);
            item_label.string = cc.js.formatStr("%s/%s", Utils.getMoneyString(count, false), Utils.getMoneyString(item_num, false));
            if(count < item_num){
                item_label.node.color = new cc.Color(255, 93, 93,255);
            }else{
                item_label.node.color = new cc.Color(255, 246, 228,255);
            }
        }
    },

    //消耗物品的数量更新
    checkNeedUpdateItemNum:function(item_list){
        if(item_list == null || Utils.next(item_list) == null)return;
        for(var i in item_list){
            var vo = item_list[i];
            if(vo.config){
                var bid = vo.config.id;
                if(bid == this.hallows_uplv_cost_bid_1){
                    this.setCostDataToNode(this.lvup_cost_res_1, this.lvup_cost_label_1, bid, this.hallows_uplv_cost_num_1)
                }else if(bid == this.hallows_uplv_cost_bid_2){
                    this.setCostDataToNode(this.lvup_cost_res_2, this.lvup_cost_label_2, bid, this.hallows_uplv_cost_num_2)
                }else if(bid == this.skill_lvup_cost_bid_1){
                    this.setCostDataToNode(this.skill_res_icon_1, this.skill_cost_label_1, bid, this.skill_lvup_cost_num_1)
                }else if(bid == this.skill_lvup_cost_bid_2){
                    this.setCostDataToNode(this.skill_res_icon_2, this.skill_cost_label_2, bid, this.skill_lvup_cost_num_2)
                }
            }
        }
    },

    //圣器更新处理
    handleUpdateEvent:function(id){
        if(id && this.select_hallows && id == this.select_hallows.id){
            this.selectHallowsIndex(this.select_index, true)
        }
    },

    // 是否显示重铸按钮
    checkIsShowResetBtn:function(  ){
        var is_show = false;
        if(this.select_hallows == null){
            return is_show;
        }
        var vo = this.select_hallows.vo;
        if(vo == null){
            return is_show;
        }
        if(vo.step > 1 || vo.seal > 0 || vo.skill_lev > 1){
            is_show = true;
        }
        return is_show;
    },

    //自动进阶显示状态
    changeAutoAdvanceStatus:function(is_in_advance){
        if(is_in_advance == this.is_in_advance)return;
        this.is_in_advance =  is_in_advance;
        if(this.is_in_advance){
            this.step_auto_advanced_btn_label.string = Utils.TI18N("停止");
            if(this.auto_time_ticket == null){
                this.auto_time_ticket = gcore.Timer.set((function () {
                    if(this.is_in_advance){
                        this.ctrl.requestHallowsAdvance(this.select_hallows.id, false);
                    }
                }).bind(this), 500,-1);
            }
        }else{
            this.clearAutoTimeticket();
            this.step_auto_advanced_btn_label.string = Utils.TI18N("一键升级");   
        }
    },

    clearAutoTimeticket:function(){
        if(this.auto_time_ticket){
            gcore.Timer.del(this.auto_time_ticket);
            this.auto_time_ticket = null;
        }
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        this.clearAutoTimeticket();
        this.handleEffect(false);
        if(this.hallow_skill_icon){
            this.hallow_skill_icon.deleteMe();
            this.hallow_skill_icon = null;
        }

        if(this.hallows_eff_sk){
            this.hallows_eff_sk.setToSetupPose();
            this.hallows_eff_sk.clearTracks();
            
        }

        this.ctrl.openHallowsMainWindow(false);
    },
})