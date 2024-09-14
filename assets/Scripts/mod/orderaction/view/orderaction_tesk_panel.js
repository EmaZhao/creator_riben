// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     战令三期 任务
// <br/>Create: 2019-08-10 16:23:26
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var ActionController = require("action_controller");
var CommonScrollViewSingle = require("common_scrollview_single");
var OrderActionTeskItem = require("orderaction_tesk_item_panel");
var OrderactionConst = require("orderaction_const");
var OrderActionEvent = require("orderaction_event");
var OrderactionController = require("orderaction_controller");

var Orderaction_teskPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("orderaction", "tesk_panel1");
        this.ctrl =  OrderactionController.getInstance();
        this.model = this.ctrl.getModel();
        
        this.cur_period = arguments[0] || 1;
    },

    // 可以初始化声明一些变量的
    initConfig:function(){
        this.title_name_list = [Utils.TI18N("每日任务"),Utils.TI18N("每周挑战"),Utils.TI18N("终极试炼")];
        this.cur_task_index = null;
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel:function(){
        var main_container = this.root_wnd.getChildByName("main_container");

        this.time_title = main_container.getChildByName("time_title").getComponent(cc.Label);
        this.time_desc = main_container.getChildByName("time_desc").getComponent(cc.Label);

        this.tab_view_list = {};
        var tab_view = main_container.getChildByName("tab_view");
        for(var i=1;i<=3;i++){
            var tab = {};
            tab.btn_view = tab_view.getChildByName("tab_task_"+i);
            tab.normal = tab.btn_view.getChildByName("normal");
            tab.select = tab.btn_view.getChildByName("select");
            tab.select.active = false;
            tab.title_name = tab.btn_view.getChildByName("title_name").getComponent(cc.Label);
            tab.title_name.string = this.title_name_list[i-1];
            tab.redpoint = tab.btn_view.getChildByName("redpoint");
            tab.redpoint.active = false;
            this.tab_view_list[i] = tab;
        }

        var task_item = main_container.getChildByName("task_item");
        var scroll_view_size = task_item.getContentSize();
        var setting = {
            start_x: 0,                  // 第一个单元的X起点
            space_x: 0,                    // x方向的间隔
            start_y: 0,                    // 第一个单元的Y起点
            space_y: 0,                   // y方向的间隔
            item_width: 635,               // 单元的尺寸width
            item_height: 116,              // 单元的尺寸height
            row: 0,                        // 行数，作用于水平滚动类型
            col: 1,                         // 列数，作用于垂直滚动类型
            need_dynamic: true,
        }

        this.task_goods_item = new CommonScrollViewSingle();
        this.task_goods_item.createScroll(task_item, cc.v2(0,0), ScrollViewDir.vertical, ScrollViewStartPos.top, scroll_view_size, setting);

        this.task_goods_item.registerScriptHandlerSingle(this.createTaskCell.bind(this), ScrollViewFuncType.CreateNewCell)//--创建cell
        this.task_goods_item.registerScriptHandlerSingle(this.numberOfTaskCells.bind(this), ScrollViewFuncType.NumberOfCells)//-获取数量
        this.task_goods_item.registerScriptHandlerSingle(this.updateTaskCellByIndex.bind(this), ScrollViewFuncType.UpdateCellByIndex)//更新cell

        this.setTabRedPoint();
        this.tabChargeTaskView(1);
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        this.addGlobalEvent(OrderActionEvent.OrderAction_TaskGet_Event,function(){
            this.setTaskGetStatus();
            this.setTabRedPoint();
        }.bind(this));

        for(var i in this.tab_view_list){
            Utils.onTouchEnd(this.tab_view_list[i].btn_view, function (i) {
                this.tabChargeTaskView(i);
            }.bind(this,i), 1);
        }
    },


    createTaskCell:function(){
        var cell = new OrderActionTeskItem();
        cell.show();
        return cell;
    },

    numberOfTaskCells:function(){
        if(!this.task_list)return 0;
        return this.task_list.length;
    },

    updateTaskCellByIndex:function(cell, index){
        if(!this.task_list)return;
        var cell_data = this.task_list[index];
        if(!cell_data)return;
        cell.setData(cell_data);
    },

    tabChargeTaskView:function(index){
        index = index || 1;
        if(this.cur_task_index == index)return;
        if(this.cur_tab_view != null){
            this.cur_tab_view.select.active = false;
        }
        this.cur_task_index = index;
        this.cur_tab_view = this.tab_view_list[index];
        if(this.cur_tab_view!=null){
            this.cur_tab_view.select.active = true;
        }
        this.setTaskGetStatus();
    },

    setTaskGetStatus:function(){
        var cur_day = this.model.getCurDay();
        var data_list = this.setTaskData(this.cur_period,cur_day,this.cur_task_index);
        var time = 0;
        if(data_list){
            this.task_list = [];
            for(var i in data_list){
                var v = data_list[i];
                var task_list = this.model.getInitTaskData(v.goal_id);
                v.tab_index = this.cur_task_index;
                if(task_list){
                    v.status = task_list.finish;
                    v.value = task_list.value;
                    v.target_val = task_list.target_val;
                    if(time == 0){
                        time = task_list.end_time - gcore.SmartSocket.getTime();
                    }
                }
                this.task_list.push(v);
            }
            this.model.sortTeskItemList(this.task_list);
            this.task_goods_item.reloadData();
        }
        this.time_title.string = Utils.TI18N("刷新时间:");
        ActionController.getInstance().getModel().setCountDownTime(this.time_desc,time);
    },


    setTaskData:function(period,day,index){
        index = index || 1;
        var sort_list = null;
        var tesk_list = this.model.getTaskInduct(index);
        if(tesk_list){
            sort_list = tesk_list;
        }else{
            this.model.setTaskInduct(period,day,index);
            var data = this.model.getTaskInduct(index);
            if(data){
                sort_list = data;
            }
        }
        return sort_list;
    },

    //红点
    setTabRedPoint:function(){
        var cur_day = this.model.getCurDay();
        for(var i=1;i<=3;i++){
            var data_list = this.setTaskData(this.cur_period,cur_day,i);
            if(data_list){
                var status = false;
                for(var j in data_list){
                    var task_list = this.model.getInitTaskData(data_list[j].goal_id);
                    if(task_list){
                        if(task_list.finish == 1){
                            status = true;
                            break;
                        }
                    }
                }
                this.tab_view_list[i].redpoint.active = status;
            }
        }
    },

    setVisibleStatus:function(bool){
        bool = bool || false;
        this.setVisible(bool);
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow:function(params){

    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide:function(){

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete:function(){
        if(this.time_desc){
            this.time_desc.node.stopAllActions();
        }

        if (this.task_goods_item) {
            this.task_goods_item.deleteMe();
            this.task_goods_item = null;
        }
        // this:removeAllChildren()
        // this:removeFromParent()
    },
})