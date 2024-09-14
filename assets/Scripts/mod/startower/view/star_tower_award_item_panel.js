// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     竖版奖励子项
// <br/>Create: 2019-02-28 14:29:41
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var StartowerController = require("startower_controller");
var CommonScrollView = require("common_scrollview");


var Star_tower_award_itemPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("startower", "star_tower_award_item");
        this.ctrl = StartowerController.getInstance();
        this.model = this.ctrl.getModel();
    },

    // 可以初始化声明一些变量的
    initConfig:function(){
        this.reward_list = {};
        this.reward_data = Config.star_tower_data.data_get_floor_award;
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel:function(){
        this.main_panel = this.root_wnd.getChildByName("main_panel");
   
        this.sprite_get = this.main_panel.getChildByName("sprite_get");
        this.sprite_get.active = false;
        this.btn_goto = this.main_panel.getChildByName("btn_goto");
        var btn_goto_lab = this.btn_goto.getChildByName("Text_4").getComponent(cc.Label);
        btn_goto_lab.string = Utils.TI18N("前往");
        
        this.btn_get = this.main_panel.getChildByName("btn_get");
        this.btn_get.active = false;
        var btn_get_lab = this.btn_get.getChildByName("Text_4").getComponent(cc.Label);
        btn_get_lab.string= Utils.TI18N("领取");
        this.good_cons = this.main_panel.getChildByName("good_cons")
        this.text_floor = this.main_panel.getChildByName("text_floor").getComponent(cc.Label);

        var scroll_view_size = this.good_cons.getContentSize();
        var setting = {
            item_class: "backpack_item",      // 单元类
            start_x: 0,                  // 第一个单元的X起点
            space_x: 0,                    // x方向的间隔
            start_y: 10,                    // 第一个单元的Y起点
            space_y: 0,                   // y方向的间隔
            item_width: BackPackItem.Width*0.85,               // 单元的尺寸width
            item_height: BackPackItem.Height*0.85,              // 单元的尺寸height
            row: 1,                        // 行数，作用于水平滚动类型
            col: 0,                         // 列数，作用于垂直滚动类型
            scale: 0.85,
        }
        this.item_scrollview = new CommonScrollView();
        this.item_scrollview.createScroll(this.good_cons, cc.v2(0,0), ScrollViewDir.horizontal, ScrollViewStartPos.top, scroll_view_size, setting);
        this.item_scrollview.setClickEnabled(false);
    },

    setData:function(data){
        if(!data)return;
        var item_data = this.model.getRewardData(data.id-1);
        this.tower_data = item_data;
        if(this.main_panel){
            this.updateData();
        }
    },

    updateData:function(){
        if(!this.tower_data || !this.main_panel)return;
        
        this.sprite_get.active = this.tower_data.status == 2;
        this.btn_get.active =  this.tower_data.status == 1;
        this.btn_goto.active = this.tower_data.status == 0;
        
        var str = cc.js.formatStr(Utils.TI18N("通过%d层(%d/%d)"),this.reward_data[this.tower_data.id].tower,this.model.getNowTowerId(),this.reward_data[this.tower_data.id].tower)
        this.text_floor.string = str;
        var list = [];
        for(var i in this.reward_data[this.tower_data.id].award){
            var tab = {};
            tab.bid = this.reward_data[this.tower_data.id].award[i][0];
            tab.num = this.reward_data[this.tower_data.id].award[i][1];
            list.push(tab);
        }
        this.item_scrollview.setData(list);
        this.item_scrollview.addEndCallBack(function(){
            var list = this.item_scrollview.getItemList();
            for(var j in list){
                list[j].setDefaultTip();
            }
        }.bind(this));
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        this.btn_goto.on(cc.Node.EventType.TOUCH_END, function () {
            Utils.playButtonSound(ButtonSound.Normal);
            this.ctrl.openAwardWindow(false);
        }, this)

        this.btn_get.on(cc.Node.EventType.TOUCH_END, function () {
            Utils.playButtonSound(ButtonSound.Normal);
            this.ctrl.sender11328(this.tower_data.id);
        }, this)
    },


    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow:function(params){
        this.updateData();
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide:function(){

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete:function(){
        if(this.item_scrollview){
            this.item_scrollview.deleteMe();
            this.item_scrollview = null;
        }
    },
})