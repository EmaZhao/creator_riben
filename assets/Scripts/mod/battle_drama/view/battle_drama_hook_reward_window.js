// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     挂机收益
// <br/>Create: 2019-02-28 21:06:37
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var TimeTool = require("timetool"); 
var BattleDramaHookRewardListPanel = require("battle_drama_hook_reward_list_panel");
var BattleDramaHookRewardWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("battledrama", "battle_drama_hook_reward_windows");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        // this.win_type = WinType.Full;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        this.controller = require("battle_drama_controller").getInstance();
        this.role_vo = require("role_controller").getInstance().getRoleVo();
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        this.background = this.seekChild("background")
        this.background.scale = FIT_SCALE;

        this.guidesign_rewards_quick_btn = this.seekChild("guidesign_rewards_quick_btn");
        this.vip_notice_label = this.seekChild(this.guidesign_rewards_quick_btn, "label", cc.Label);
        this.vip_notice_label.string = Utils.TI18N("获得来自vip、称号的收益加成");

        this.progress_container = this.seekChild("progress_container")
        this.progress = this.seekChild(this.progress_container, "progress", cc.ProgressBar);             // 进度条
        this.progress_bar = this.seekChild(this.progress_container, "progress_bar");                     // 高亮部分
        this.progress_width = this.progress_container.width;
        
        this.skeleton = this.seekChild("title_container", sp.Skeleton);       // 特效
        this.level = this.seekChild("level", cc.Label);                       // 等级显示
        this.progress_val = this.seekChild("progress_val", cc.Label);         // 进度值
        this.time_value = this.seekChild("time_value", cc.Label);             // 挂机时间
        this.time_title = this.seekChild("time_title", cc.Label);             // 挂机title

        this.list_view = this.seekChild("list_view");                         // 物品展示列表

        var main_container = this.seekChild("main_container")
        this.player_head = Utils.createClass("playerhead");
        this.player_head.setParent(main_container);
        this.player_head.setHeadRes(this.role_vo.face_id);
        this.player_head.setPosition(-178, 142);
        this.player_head.show();
        Utils.getNodeCompByPath("main_container/get_title", this.root_wnd, cc.Label).string = "アイテム獲得";
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        Utils.onTouchEnd(this.background, function () {
            this.controller.openDramHookRewardView(false);
        }.bind(this), 2)

        Utils.onTouchEnd(this.guidesign_rewards_quick_btn, function(){
            this.controller.openDramHookRewardView(false);
        }.bind(this), 2)
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(params){
      let {data,callBack} = params
        Utils.playButtonSound("c_get");

        if(callBack){
          this.callBack = callBack;
        }
        if (data){
            this.result_type = data.type;           // 1.挂机收益 2.快速作战
            if (this.result_type == 1){
                this.time_title.string = Utils.TI18N("挂机收益:")
            }else if(this.result_type == 2){
                this.time_title.string = Utils.TI18N("快速作战:")
            }
            this.handleEffect();
            this.setBaseInfo(data);
            this.createItemList(data.items);

            // vip加成数据
            if(data.vip_buff == 0){
                this.vip_notice_label.string = Utils.TI18N("vip可获额外收益加成");
            }else{
                if(data.honor_buff){
                    this.vip_notice_label.string = Utils.TI18N("获得来自vip、称号的收益加成");
                }else{
                    this.vip_notice_label.string = Utils.TI18N("获得来自vip的收益加成");
                }
            }
        }
    },

    handleEffect:function(){
        var resources_path = PathTool.getSpinePath("E51024");
        var action = PlayerAction.action_1;
        if (this.result_type == 2){
            action = PlayerAction.action_2;
        }
        this.loadRes(resources_path, function (action, res_object) {
            this.skeleton.skeletonData = res_object;
            this.skeleton.setAnimation(0, action, false)
        }.bind(this, action))
    },

    setBaseInfo:function(data){
        if(!data) return;
        this.level.string = "LV." + data.new_lev;
        this.time_value.string = TimeTool.getTimeFormat(data.time);

        var old_lev = data.old_lev;
        var old_exp = data.old_exp;
        var old_config = Config.role_data.data_role_attr[old_lev];
        var new_lev = data.new_lev;
        var new_exp = data.new_exp;
        var new_config = Config.role_data.data_role_attr[new_lev];
        if(!old_config || !new_config) return;

        this.progress_val.string = new_exp + "/" + new_config.exp_max;
        this.old_exp_progress = old_exp / old_config.exp_max;
        this.progress.progress = this.old_exp_progress;
        this.progress_bar.x = this.old_exp_progress * this.progress_width + 5;

        this.old_role_lev = old_lev;
        this.old_role_exp = old_exp;
        this.new_role_lev = new_lev;
        this.new_role_exp = new_exp;
        this.old_config = old_config;
        this.new_config = new_config;

        this.baseCurMaxExp = this.old_config.exp_max;
        this.basePercent = this.old_exp_progress;
        this.maxPercent = this.new_role_exp / this.baseCurMaxExp;
        if (this.old_role_lev != this.new_role_lev){
            this.maxPercent = 1;
        }
        // 定时
        this.startUpdate((this.new_role_exp / this.baseCurMaxExp) * 1000 /10, this.showProgressEffect.bind(this), 10);
    },

    // 每一帧定时
    showProgressEffect:function(index){
        this.basePercent = this.basePercent + 0.01;
        if (this.basePercent > this.maxPercent){
            if(this.old_role_lev == this.new_role_lev){
                this.baseCurMaxExp = this.new_config.exp_max;
                this.basePercent = this.new_role_exp / this.baseCurMaxExp;
                this.progress.progress = this.basePercent;
                this.progress_bar.x = this.basePercent * this.progress_width + 5;
                this.progress_val.string = this.new_role_exp + "/" + this.baseCurMaxExp;
                this.stopUpdate();
            }else{
                this.old_role_lev += 1;
                this.basePercent = 0;
                this.maxPercent = 1;
                this.baseCurMaxExp = Config.role_data.data_role_attr[this.old_role_lev].exp_max;
                if(this.old_role_lev == this.new_role_lev){
                    this.maxPercent = this.new_role_exp / this.new_config.exp_max;
                }
            }
        }else{
            this.progress.progress = this.basePercent;
            this.progress_bar.x = this.basePercent * this.progress_width + 5;
            this.progress_val.string = this.new_role_exp + "/" + this.baseCurMaxExp;
        }
    },

    // 创建物品列表
    createItemList:function(item_list){
        if (this.item_scrollview == null){
            var scroll_view_size = cc.size(this.list_view.width, this.list_view.height);
            var setting = {
                item_class: BattleDramaHookRewardListPanel,      // 单元类
                start_x: 94,                    // 第一个单元的X起点
                space_x: 20,                    // x方向的间隔
                start_y: 0,                    // 第一个单元的Y起点
                space_y: 0,                   // y方向的间隔
                item_width: 120,               // 单元的尺寸width
                item_height: 180,              // 单元的尺寸height
                row: 4,                        // 行数，作用于水平滚动类型
                col: 4,                        // 列数，作用于垂直滚动类型
                need_dynamic: true
            }
            this.item_scrollview = Utils.createClass("common_scrollview");
            this.item_scrollview.createScroll(this.list_view, null, null, null, scroll_view_size, setting,cc.v2(0.5, 0.5));
        }
        this.item_scrollview.setData(item_list, null, {is_show_name:true});
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        this.stopUpdate();
        if (this.item_scrollview){
            this.item_scrollview.DeleteMe();
        }
        this.item_scrollview = null;
        if (this.player_head){
            this.player_head.deleteMe();
        }
        this.player_head = null;
        if(this.result_type && this.result_type == 1){
            var BattleEvent = require("battle_event")
            gcore.GlobalEvent.fire(BattleEvent.CLOSE_RESULT_VIEW);
        }
        this.controller.openDramHookRewardView(false);
        if(this.callBack){
          this.callBack();
        }
    },
})
