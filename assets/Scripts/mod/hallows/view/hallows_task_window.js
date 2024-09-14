// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-02-18 17:52:10
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var MainuiConst = require("mainui_const");
var MainuiController = require("mainui_controller");
var HallowsEvent = require("hallows_event");
var CommonScrollView = require("common_scrollview");
var HallowsTaskItem = require("hallows_task_item_panel");
var PartnerCalculate = require("partner_calculate");

var Hallows_taskWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("hallows", "hallows_task_window");
        this.viewTag = SCENE_TAG.ui;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Full;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips

        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();
        this.rleasePrefab = false;
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        this.attr_bgs = [];
        this.base_attr_list = {}
        this.all_hallows_id = []; // 所有神器id(有序，翻页按钮用)
        this.cur_index = 0 		 //当前选中的神器在all_hallows_id的下标
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        this.background = this.seekChild(this.root_wnd, "background");
        this.background.scale = FIT_SCALE;
        this.bg = this.seekChild(this.root_wnd, "background", cc.Sprite);
        this.loadRes(PathTool.getBigBg("bigbg_68","jpg"), (function(resObject){
            this.bg.spriteFrame = resObject;
        }).bind(this));
        

        this.main_panel = this.seekChild("main_panel");
        
        this.title_bg = this.main_panel.getChildByName("title_bg").getComponent(cc.Sprite);
        this.loadRes(PathTool.getCommonIcomPath("Shadow_1_1"), (function(resObject){
            this.title_bg.spriteFrame = resObject;
        }).bind(this));

        this.skill_bg = this.main_panel.getChildByName("skill_bg");

        this.skill_bg_img = this.skill_bg.getComponent(cc.Sprite);
        this.loadRes(PathTool.getCommonIcomPath("common_1037"), (function(resObject){
            this.skill_bg_img.spriteFrame = resObject;
        }).bind(this));

        this.bottom_bg = this.main_panel.getChildByName("bottom_bg").getComponent(cc.Sprite);
        this.loadRes(PathTool.getCommonIcomPath("common_1003"), (function(resObject){
            this.bottom_bg.spriteFrame = resObject;
        }).bind(this));
        
        this.task_panel = this.seekChild(this.main_panel,"task_panel");
        this.attr_panel = this.seekChild(this.main_panel,"attr_panel");
        this.attr_panel.active = false;

        this.attr_bg_1 = this.attr_panel.getChildByName("attr_bg_1").getComponent(cc.Sprite);
        this.attr_bg_2 = this.attr_panel.getChildByName("attr_bg_2").getComponent(cc.Sprite);
        this.loadRes(PathTool.getUIIconPath("hallows","hallows_1007"), (function(resObject){
            this.attr_bg_1.spriteFrame = resObject;
            this.attr_bg_2.spriteFrame = resObject;
        }).bind(this));

        this.max_bg_l = this.attr_panel.getChildByName("max_bg_l").getComponent(cc.Sprite);
        this.max_bg_r = this.attr_panel.getChildByName("max_bg_r").getComponent(cc.Sprite);
        this.loadRes(PathTool.getUIIconPath("hallows","hallows_1005"), (function(resObject){
            this.max_bg_l.spriteFrame = resObject;
            this.max_bg_r.spriteFrame = resObject;
        }).bind(this));

        this.bottom_bg_2 = this.attr_panel.getChildByName("bottom_bg_2").getComponent(cc.Sprite);
        this.loadRes(PathTool.getCommonIcomPath("common_2007"), (function(resObject){
            this.bottom_bg_2.spriteFrame = resObject;
        }).bind(this));
        this.close_btn_nd       = this.seekChild("close_btn");
        this.close_btn_nd.on(cc.Node.EventType.TOUCH_END, function(event){
          Utils.playButtonSound(ButtonSound.Close);
          this.ctrl.openHallowsMainWindow(false);
        }.bind(this));
        
        
        this.desc_label = this.attr_panel.getChildByName("desc_label").getComponent(cc.Label);
        this.desc_label.string = Utils.TI18N("出战界面选择穿戴激活神器技能和主属性");

        this.go_battle_btn = this.seekChild(this.attr_panel,"go_battle_btn");

        this.hallows_name = this.seekChild(this.main_panel,"hallows_name",cc.Label);

        this.explain_btn = this.seekChild(this.main_panel,"explain_btn");

        this.artifact_btn = this.seekChild(this.main_panel,"artifact_btn");
        
        this.touch_layout = this.seekChild(this.main_panel,"touch_layout");

        this.progress = this.seekChild(this.main_panel,"progress").getComponent(cc.ProgressBar);
        this.progress_value = this.seekChild(this.main_panel,"value").getComponent(cc.Label);

        this.left_btn = this.seekChild(this.main_panel,"left_btn");
        this.right_btn = this.seekChild(this.main_panel,"right_btn");

        this.list_view = this.seekChild(this.main_panel,"list_view");

        for (var i = 1; i < 3; i++) {
            var attr_bg = this.seekChild(this.main_panel,"attr_bg_"+i);
            this.attr_bgs[i] = attr_bg;
        }

        this.hallows_eff_node = this.seekChild("hallows_eff_node");
        this.hallows_eff_sk    = this.seekChild("hallows_eff_node", sp.Skeleton);

        Utils.getNodeCompByPath("main_panel/artifact_btn/label", this.root_wnd, cc.Label).string = Utils.TI18N("失落神器");
        Utils.getNodeCompByPath("main_panel/progress_container/title", this.root_wnd, cc.Label).string = Utils.TI18N("当前进度");
        Utils.getNodeCompByPath("main_panel/attr_panel/go_battle_btn/label", this.root_wnd, cc.Label).string = Utils.TI18N("去探险");
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        this.artifact_btn.on("click",function(){
            Utils.playButtonSound(ButtonSound.Normal);
            this.ctrl.openHallowsPreviewWindow(true);
        },this);
        
        this.go_battle_btn.on("click",function(){
            Utils.playButtonSound(ButtonSound.Normal);
            MainuiController.getInstance().changeMainUIStatus(MainuiConst.new_btn_index.drama_scene);
            this.ctrl.openHallowsMainWindow(false);
        },this);
        
        this.explain_btn.on(cc.Node.EventType.TOUCH_END, function (event) {
            Utils.playButtonSound(ButtonSound.Normal);
            var config = config = Config.hallows_data.data_const.game_rule
            var pos = event.touch.getLocation();
            require("tips_controller").getInstance().showCommonTips(config.desc, pos,null,null,500,false);            
        }, this)

        this.left_btn.on("click",function(){
            Utils.playButtonSound(ButtonSound.Normal);
            this._onClickBtnLeft();
        },this);
        
        this.right_btn.on("click",function(){
            Utils.playButtonSound(ButtonSound.Normal);
            this._onClickBtnRight();
        },this);
        
        this.touch_layout.on(cc.Node.EventType.TOUCH_END, function () {
            Utils.playButtonSound(ButtonSound.Normal);
            if(this.hallows_id){
                var max_vo = this.model.makeHighestHallowVo(this.hallows_id)
                this.ctrl.openHallowsTips(true,max_vo);
            }
        }, this)

        //任务变化
        this.addGlobalEvent(HallowsEvent.UpdateHallowsTaskEvent, function () {
            this.updateHallowsTaskInfo();
        }.bind(this));

        //神器数据更新
        this.addGlobalEvent(HallowsEvent.HallowsUpdateEvent, function (id) {
            if(id == this.hallows_id){
                this.refreshView();
            }
        }.bind(this));

        //激活圣器
        this.addGlobalEvent(HallowsEvent.HallowsActivityEvent,function(){
            var hallows_id = this.model.getCurActivityHallowsId();
            if(hallows_id){
                this.hallows_id = hallows_id;
                this.initUnlockHallowsData(hallows_id);
                this.refreshView();
            }
        }.bind(this));

        //显示为某一神器（从所有神器预览界面打开）
        this.addGlobalEvent(HallowsEvent.UndateHallowsInfoEvent,function(id){
            if(id && this.hallows_id != id){
                this.hallows_id = id;
                this.initUnlockHallowsData(id);
                this.refreshView();
            }
        }.bind(this));
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(hallows_id){
        var hallows_id = hallows_id || this.model.getCurActivityHallowsId();
        if(hallows_id){
            this.hallows_id = hallows_id;
            this.initUnlockHallowsData(hallows_id);
            this.refreshView();
        }
    },

    //设置已解锁和正在进行的神器数据
    initUnlockHallowsData:function(hallows_id){
        this.all_hallows_id = [];
        var activity_id = this.model.getCurActivityHallowsId() // 正在进行中的神器id
        for (var i in Config.hallows_data.data_base) {
            var tempCfg = Config.hallows_data.data_base[i];
            if(this.model.getHallowsById(tempCfg.id) || tempCfg.id == activity_id){
                this.all_hallows_id.push(tempCfg.id);
                if(hallows_id && tempCfg.id == hallows_id){
                    this.cur_index = this.all_hallows_id.length-1;
                }
            }
        }
        this.left_btn.active = this.all_hallows_id.length>1;
        this.right_btn.active = this.all_hallows_id.length>1;
    },

    updateHallowsBaseInfo:function(){
        if(!this.hallows_id)return;
        var hallows_config = Config.hallows_data.data_base[this.hallows_id];
        if(!hallows_config)return;
        if(this.hallows_model_id != hallows_config.effect){
            this.hallows_model_id = hallows_config.effect;
            if(this.hallows_eff_sk){
                this.hallows_eff_sk.setToSetupPose();
                this.hallows_eff_sk.clearTracks();
            }
            
        }
        this.hallows_name.string = hallows_config.name;
        if(this.model.getHallowsById(this.hallows_id)){
            // setChildUnEnabled(false, this.hallows_model)
            this.hallows_eff_node.color = new cc.Color(255,255,255,255);
            var anima_path = PathTool.getSpinePath(this.hallows_model_id, "action");
            this.loadRes(anima_path, function(ske_data) {
                this.hallows_eff_sk.skeletonData = ske_data;
                this.hallows_eff_sk.setAnimation(0, PlayerAction.action_2, true);
            }.bind(this));
        }else{
            // setChildUnEnabled(true, this.hallows_model)
            this.hallows_eff_node.color = new cc.Color(169,169,169,255);
            var anima_path = PathTool.getSpinePath(this.hallows_model_id, "action");
            this.loadRes(anima_path, function(ske_data) {
                this.hallows_eff_sk.skeletonData = ske_data;
                this.hallows_eff_sk.setAnimation(0, PlayerAction.action_1, true);
            }.bind(this));
        }
    },

    updateHallowsTaskInfo:function(){
        if(!this.hallows_id)return;
        //判断是否已获得
        if(this.model.getHallowsById(this.hallows_id)){
            this.attr_panel.active = true;
            this.task_panel.active = false;
            this.progress.progress = 1;
            this.progress_value.string = Utils.TI18N("已完成");
            for(var i in this.base_attr_list){
                this.base_attr_list[i].active = false;
            }

            var hallows_base = gdata("hallows_data","data_info",Utils.getNorKey(this.hallows_id, 1));
            if(hallows_base){
                for(var j in hallows_base.attr){
                    if(j>2)break;//UI只支持显示两个技能
                    var attr_key = hallows_base.attr[j][0];
                    var attr_val = hallows_base.attr[j][1] || 0;
                    var attr_name = Config.attr_data.data_key_to_name[attr_key];
                    if(attr_name){
                        var attr_text = this.base_attr_list[j];
                        if(!attr_text){
                            attr_text = Utils.createRichLabel(24, new cc.Color(100,50,35,255), cc.v2(0, 0.5), cc.v2(20, 20), 30, 380)
                            attr_text.horizontalAlign = cc.macro.TextAlignment.LEFT;
                            var attr_bg = this.attr_bgs[parseInt(j)+1];
                            attr_bg.addChild(attr_text.node);
                            this.base_attr_list[j] = attr_text;
                        }
                        attr_text.active = true;
                        var icon = PathTool.getAttrIconByStr(attr_key)
                        var is_per = PartnerCalculate.isShowPerByStr(attr_key)
                        if(is_per == true){
                            attr_val = (attr_val/10)+"%";
                        }
                        var attr_str = cc.js.formatStr("<img src='%s'/> <color=#643223> %s%s：</c><color=#643223>%s</c>", icon, Utils.TI18N("全队"), attr_name, attr_val);
                        attr_text.string = attr_str;
                        this.loadRes(PathTool.getCommonIcomPath(icon), (function(attr_text,resObject){
                            attr_text.addSpriteFrame(resObject);
                        }).bind(this,attr_text));
                    }
                }
            }
        }else{
            this.attr_panel.active = false;
            this.task_panel.active = true;
    
            var task_list = this.model.getHallowsTaskList(this.hallows_id)
            if (task_list){
                var max_num = task_list.length;
                var cur_num = 0;
                for(var k in task_list){
                    if(task_list[k].finish == 2){
                        cur_num = cur_num + 1;
                    }
                }
                var percent = cur_num / max_num;
                this.progress.progress = percent;
                this.progress_value.string = cur_num+"/"+max_num;
            }
            
            if(this.scroll_view == null){
                var size = this.list_view.getContentSize();
                var setting = {
                    item_class: HallowsTaskItem, // 单元类 
                    start_x: 0, // 第一个单元的X起点
                    space_x: 10, // x方向的间隔
                    start_y: 0, // 第一个单元的Y起点
                    space_y: 4, // y方向的间隔
                    item_width: 331, // 单元的尺寸width
                    item_height: 139, // 单元的尺寸height
                    row: 0, // 行数，作用于水平滚动类型
                    col: 2, // 列数，作用于垂直滚动类型
                    need_dynamic: true,
                };
                this.scroll_view = new CommonScrollView();
                this.scroll_view.createScroll(this.list_view, null, null, null, size, setting);
            }
            
            this.scroll_view.setData(task_list);
        }
    },


    // 神器技能
    updateHallowsSkillInfo:function(){
        if(!this.hallows_id)return;
        var hallows_skill = gdata("hallows_data","data_skill_up",Utils.getNorKey(this.hallows_id, 1)) // 显示1级时的技能
        if(hallows_skill && hallows_skill.skill_bid != 0){
            var config = gdata("skill_data","data_get_skill",hallows_skill.skill_bid) || {};
            if(!this.skill_icon){
                var SkillItem = require("skill_item")
                this.skill_icon   = new SkillItem();//true,true,true,0.9
                this.skill_icon.setParent(this.skill_bg);
                this.skill_icon.setScale(0.9);
                this.skill_icon.setLeveStatus(false);
                this.skill_icon.setPosition(cc.v2(75, 70))                
            }
            this.skill_icon.setData(config.bid);

            if(!this.skill_name){//颜色需修改
                this.skill_name = Utils.createLabel(24, new cc.Color(63,50,52,255), null, 135, 100, "", this.skill_bg, 1, cc.v2(0, 0));
            }
            this.skill_name.string = config.name;

            if(!this.skill_desc){//颜色需修改
                this.skill_desc = Utils.createRichLabel(20, new cc.Color(63,50,52,255),cc.v2(0,1), cc.v2(135,100), 30, 500);
                this.skill_desc.horizontalAlign = cc.macro.TextAlignment.LEFT;
                this.skill_bg.addChild(this.skill_desc.node);
            }
            this.skill_desc.string = config.des;
        }
    },


    // 向左翻页
    _onClickBtnLeft:function(){
        this.cur_index = this.cur_index - 1
        if(this.cur_index < 0){
            this.cur_index = this.all_hallows_id.length-1
        }
        this.hallows_id = this.all_hallows_id[this.cur_index]
        this.refreshView()
    },
    
    
    // -- 向右翻页
    _onClickBtnRight:function(){
        this.cur_index = this.cur_index + 1
        if(this.cur_index >= this.all_hallows_id.length){
            this.cur_index = 0
        }
        this.hallows_id = this.all_hallows_id[this.cur_index]
        this.refreshView()
    },

    // 刷新界面
    refreshView:function(){
        this.updateHallowsBaseInfo();
        this.updateHallowsTaskInfo();
        this.updateHallowsSkillInfo();

    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        if(this.scroll_view){
            this.scroll_view.deleteMe();
            this.scroll_view = null;
        }
        if(this.skill_icon){
            this.skill_icon.deleteMe();
            this.skill_icon = null;
        }

        if(this.hallows_eff_sk){
            this.hallows_eff_sk.setToSetupPose();
            this.hallows_eff_sk.clearTracks();
            
        }
         this.ctrl.openHallowsMainWindow(false)
    },
    
})