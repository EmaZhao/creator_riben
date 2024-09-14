// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     冒险宝箱奖励
// <br/>Create: 2019-05-11 09:38:21
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var AdventureEvent = require("adventure_event");

var Adventure_box_rewardWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("adventure", "adventure_box_reward_window");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Big;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        this.kill_master = 0;
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        this.background = this.root_wnd.getChildByName("background");
        this.background.scale = FIT_SCALE;
        var main_container = this.root_wnd.getChildByName("main_container");
        var title = main_container.getChildByName("title").getComponent(cc.Label);
        title.string = Utils.TI18N("目标奖励");
        
        this.btn_close = main_container.getChildByName("btn_close");
    
        var good_cons = main_container.getChildByName("good_cons");
        var scroll_view_size = good_cons.getContentSize();
        var AdventureBoxRewardItem = require("adventure_box_reward_item_panel");
        var setting = {
            item_class: AdventureBoxRewardItem,      // 单元类
            start_x: 10,                  // 第一个单元的X起点
            space_x: 0,                    // x方向的间隔
            start_y: 0,                    // 第一个单元的Y起点
            space_y: 0,                   // y方向的间隔
            item_width: 600,               // 单元的尺寸width
            item_height: 168,              // 单元的尺寸height
            row: 0,                        // 行数，作用于水平滚动类型
            col: 1,                         // 列数，作用于垂直滚动类型
            need_dynamic: true,
        }
        var CommonScrollView = require("common_scrollview");
        this.item_scrollview = new CommonScrollView();
        this.item_scrollview .createScroll(good_cons, cc.v2(0,0) , ScrollViewDir.vertical, ScrollViewStartPos.top, scroll_view_size, setting);
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        Utils.onTouchEnd(this.btn_close, function () {
            this.ctrl.openAdventureBoxRewardView(false);
        }.bind(this), 2);

        Utils.onTouchEnd(this.background, function () {
            this.ctrl.openAdventureBoxRewardView(false);
        }.bind(this), 2);

        this.addGlobalEvent(AdventureEvent.UpdateBoxTeskEvent,function(data){
            this.updataTeskRewardList();
        }.bind(this))
    },

    updataTeskRewardList:function(){
        var reward_list = Config.adventure_data.data_round_reward_list;
        var list = [];
        for(var i in reward_list){
            var v = reward_list[i];
            v.status = 0;
            if(this.kill_master >= v.count){
                v.status = 1;
            }
            if(this.model.getAdventureBoxStatus(v.id) == 2){
                v.status = 2;
            }
            list.push(v);
        }
        this.sortItemList(list);
        this.item_scrollview.setData(list,null,this.kill_master);
    },

    sortItemList:function(list){
        var tempsort = {
            [0]: 2,  // 0 未领取放中间
            [1]: 1,  // 1 可领取放前面
            [2]: 3,  // 2 已领取放最后
        }

        var sortFunc = function(obj_a,obj_b){
            if(obj_a.status != obj_b.status){
                if(tempsort[obj_a.status] && tempsort[obj_b.status]){
                    return tempsort[obj_a.status] - tempsort[obj_b.status];
                }else{
                    return -1;   
                }
            }else{
                return obj_a.id - obj_b.id;
            }
        }
        list.sort(sortFunc);
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(kill_master){
        this.kill_master = kill_master
        this.updataTeskRewardList();
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        if(this.item_scrollview){
            this.item_scrollview.deleteMe();
        }
        this.item_scrollview = null;
        this.ctrl.openAdventureBoxRewardView(false);
    },
})