// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      这里填写详细说明,主要填写该模块的功能简要
// <br/>Create: 2019-01-09 11:26:10
// --------------------------------------------------------------------
var TaskConst = require("task_const");
var RoleController = require("role_controller");
var TaskEvent = require("task_event");
var TaskVo = require("task_vo");

var TaskModel = cc.Class({
    extends: BaseClass,
    ctor: function () {
        this.ctrl = arguments[0];
    },

    properties: {
    },

    initConfig: function () {
        this.task_list = [];                    //当前所有任务数据
        this.feat_list = {};                    //当前成就所有数据
        this.task_status_list = [];             //任务icon的红点状态
        this.update_feat_status_list = [];      //待更新成就状态，延迟更新的
        this.finish_feat_list = [];
    },

    // @desc:需要检测的红点状态，分活跃度，任务或者成就3中
    // author:{author}
    // time:2018-05-22 15:50:49
    // --@type: 
    // return
    checkQuestAndFeatStatus: function (type) {
        var red_status = false;
        if (type == TaskConst.update_type.activity) {
            var role_vo = RoleController.getInstance().getRoleVo();
            if (role_vo != null && this.activity_data != null) {
                for (var i in Config.activity_data.data_get) {
                    var v = Config.activity_data.data_get[i];
                    if (role_vo.activity >= v.activity && !this.activity_data[v.activity]) {
                        red_status = true;
                        break
                    }
                }
            }
        } else if (type == TaskConst.update_type.quest) {
            if (this.task_list != null) {
                for (var k in this.task_list) {
                    var v = this.task_list[k];
                    if (v.finish == TaskConst.task_status.finish) {
                        red_status = true;
                        break
                    }
                }
            }
        } else if (type == TaskConst.update_type.feat) {
            if (this.feat_list != null) {
                for (var k in this.feat_list) {
                    var v = this.feat_list[k];
                    if (v.finish == TaskConst.task_status.finish) {
                        red_status = true;
                        break
                    }
                }
            }
        }

        if (this.red_status_list == null) {
            this.red_status_list = [];
        }

        if (this.red_status_list[type] == null || (this.red_status_list[type] != null && this.red_status_list[type] != red_status)) {
            this.red_status_list[type] = red_status;
            //抛出事件更新红点
            gcore.GlobalEvent.fire(TaskEvent.UpdateUIRedStatus, type, red_status);
        }

        //红点状态
        var num = 0;
        if (red_status == true)
            num = 1;
        var MainuiConst = require("mainui_const");
        require("mainui_controller").getInstance().setFunctionTipsStatus(MainuiConst.icon.daily, {bid:type, num:num})
    },

    // @desc:用于日常面板上的红点接口判断
    // author:{author}
    // time:2018-05-28 14:41:18
    // --@type: 
    // return
    getRedStatus: function (type) {
        if (this.red_status_list == null)
            return false
        return this.red_status_list[type]
    },

    // @desc:更新整个活跃度数据，只有在上线或者断线重连的时候更新
    // author:{author}
    // time:2018-05-22 16:14:11
    // --@data: 
    // return
    updateActivityData: function (data_list) {
        this.activity_data = {};
        for (var k in data_list) {
            var v = data_list[k];
            this.activity_data[v.activity] = true;
        }
        this.checkQuestAndFeatStatus(TaskConst.update_type.activity);
        gcore.GlobalEvent.fire(TaskEvent.UpdateActivityInfo, this.activity_data);
    },

    // @desc:领取某个活跃度宝箱之后的更新，更新单个的
    // author:{author}
    // time:2018-05-22 16:14:40
    // --@activity: 
    // return
    updateSingleActivityData: function (activity) {
        if (this.activity_data == null)
            return
        this.activity_data[activity] = true;
        this.checkQuestAndFeatStatus(TaskConst.update_type.activity);
        gcore.GlobalEvent.fire(TaskEvent.UpdateActivityInfo, this.activity_data);
    },

    getActivityData: function () {
        return this.activity_data
    },

    //desc:增加或者更新任务
    //time:2018-07-19 05:58:51
    //@task_list:
    //@is_update:
    //@return 
    addTaskList: function (task_list, is_update, is_init) {
        var taskVo, config = null;
        var is_new = false;
        var finish_list = [];
        if (is_init == true)
            this.task_list = [];
        for (var i in task_list) {
            var v = task_list[i];
            config = gdata("quest_data", "data_get", [v.id]);
            if (config != null) {
                if (this.task_list[v.id] == null) {
                    this.task_list[v.id] = new TaskVo(v.id, TaskConst.type.quest);
                    is_new = true;
                } else {
                    if (v.finish == 1 && is_update == true)
                        finish_list.push(v.id);
                }
                taskVo = this.task_list[v.id];
                taskVo.updateData(v);
            }
        }
        this.checkQuestAndFeatStatus(TaskConst.update_type.quest);
        gcore.GlobalEvent.fire(TaskEvent.UpdateTaskList, is_new, finish_list);
    },

    // @desc:设置一个任务为提交完成状态
    // author:{author}
    // time:2018-05-22 16:27:46
    // --@id: 
    // return
    setTaskCompleted: function (id) {
        var taskVo = this.task_list[id];
        if (taskVo != null) {
            taskVo.setCompletedStatus(TaskConst.task_status.completed);
            this.checkQuestAndFeatStatus(TaskConst.update_type.quest);
            gcore.GlobalEvent.fire(TaskEvent.UpdateTaskList, false);
        }
    },

    // @desc:获取全部任务列表，这个根据 finish_sort 做了排序的
    // author:{author}
    // time:2018-05-22 19:23:23
    // return
    getTaskList: function () {
        var task_list = [];
        for (var k in this.task_list) {
            task_list.push(this.task_list[k]);
        }
        if (Utils.next(task_list)) {
            task_list.sort(Utils.tableLowerSorter(["finish_sort", "id"]));
        }
        return task_list
    },

    getTaskById: function (id) {
        return this.task_list[id];
    },

    getFeatById: function (id) {
        return this.feat_list[id];
    },

    refreshRewardList(index){
      var list = null;
      var rewardList = [];
      if(index == 1){
        list = this.getTaskList();
      }else if(index == 2){
        list = this.getFeatList();
      }
      for(let index in list){
        let infoData = list[index];
        if(infoData.finish == TaskConst.task_status.finish){
          rewardList.push(infoData);
        }
      }
      this.setRewardList(rewardList);
    },

    setRewardList:function(list){//保存一個一键领取的任务
      this.rewardList = list;
      // this.rewardList 
    },

    getRewardList:function(){
      var list = [];
      if(this.rewardList){
        list = this.rewardList;
      }
      return list;
    },

    //desc:增加或者更新任务
    //time:2018-07-19 05:59:30
    //@feat_list:
    //@is_update:
    //@return 
    addFeatList: function (feat_list, is_update, is_init) {
        var taskVo, config = null;
        var is_new = false;
        var finish_list = [];
        if (is_init == true)
            this.feat_list = {};
        for (var i in feat_list) {
            var v = feat_list[i];
            config = gdata("feat_data", "data_get", [v.id]);
            if (config != null) {
                if (this.feat_list[v.id] == null) {
                    this.feat_list[v.id] = new TaskVo(v.id, TaskConst.type.feat);
                    is_new = true;
                } else {
                    if (v.finish == 1 && is_update == true)
                        finish_list.push(v.id);
                }
                taskVo = this.feat_list[v.id];
                taskVo.updateData(v);
            }
        }
        this.checkQuestAndFeatStatus(TaskConst.update_type.feat);
        this.needUpdateFeat(is_new, finish_list);
    },

    setFeatCompleted: function (id) {
        var taskVo = this.feat_list[id];
        if (taskVo != null) {
            taskVo.setCompletedStatus(TaskConst.task_status.completed);
            this.checkQuestAndFeatStatus(TaskConst.update_type.feat);
            this.needUpdateFeat(false);
        }
    },

    // @desc:是否需要抛出更新成就的事件，因为提交一个成就可能触发新增成就，所以如果都抛事件的话，会触发多次更新，做延迟抛出更新，避免次更新
    // author:{author}
    // time:2018-05-23 11:56:08
    // --@status: 
    // return
    needUpdateFeat: function (status, finish_list) {
        gcore.GlobalEvent.fire(TaskEvent.UpdateFeatList, finish_list);
    },

    getFeatList: function () {
        var feat_list = [];
        for (var k in this.feat_list) {
            var v = this.feat_list[k];
            if (v.finish != TaskConst.task_status.completed)
                feat_list.push(v);
        }
        if (Utils.next(feat_list)) {
            feat_list.sort(Utils.tableLowerSorter(["finish_sort", "id"]));
        }
        return feat_list
    },

    //存贮主线任务数据
    setMainTaskData:function(data){
        this.main_task_data = data;
        gcore.GlobalEvent.fire(TaskEvent.UpdateMainQuestTask,data);
    },

    getMainTaskData:function(){
        return this.main_task_data;
    }
});