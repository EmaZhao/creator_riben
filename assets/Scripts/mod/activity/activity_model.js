// --------------------------------------------------------------------
// @author: xiaiobin
// @description:
//      这里填写详细说明,主要填写该模块的功能简要
// <br/>Create: 2019-05-06 14:29:17
// --------------------------------------------------------------------
var ActionController = require("action_controller");
var ActivityController = require("activity_controller");
var ActivityEvent = require("activity_event");
var ActionEvent = require("action_event")

var ActivityModel = cc.Class({
    extends: BaseClass,
    ctor: function () {
    },

    properties: {
    },

    initConfig: function () {
      this.activityList = [];//活动banner的展示数据列表

      this.refreshActivityData();
      gcore.GlobalEvent.bind(ActionEvent.UPDATE_HOLIDAY_SIGNLE,function(data){
        if(data.bid == 91029 && data.aim_list.length>0){//特殊处理，该活动为子活动
            this.data_91029 = data
            this.data_91029.camp_id = 30001;
            this.refreshActivityData();
            ActivityController.getInstance().openActivityPCWindow(true);
        }
      }.bind(this))
      gcore.GlobalEvent.bind(ActivityEvent.RefreshActivityData, (function () {
        this.refreshActivityData();
        ActionController.getInstance().cs16603(91029)
        ActivityController.getInstance().openActivityPCWindow(true);
      }.bind(this)));
      ActionController.getInstance().cs16603(91029)
    },


    refreshActivityData:function(){//刷新活动数据
      this.activityList = [];
      var activityTab = ActionController.getInstance().getAllActionList();
      var activityTabClone = [];
      for(let index in activityTab){
        const element = activityTab[index];
        activityTabClone[index] = element;
      }
      if(this.data_91029){
        activityTabClone[this.data_91029.bid] = this.data_91029;
      }
      var activity_data = Config.holiday_role_data.data_sub_activity;
      var activity_data1 = Config.holiday_role_data.data_sub_personal_activity;
      var index = 0;
      for(let i in activityTabClone){
        const element = activityTabClone[i];
        var key = element.bid+"_"+element.camp_id;
        var data = activity_data[key];
        if(!data){
          data = activity_data1[key];
          if(!data){
            continue;
          }
        }
        if(data.show == 1){
          element.show = data.show;
          element.new_sort_val = data.new_sort_val
          this.activityList[index] = element;
          index++;
        }
      } 

      this.activityList.sort(function(a,b){
        return a.new_sort_val - b.new_sort_val;
      })
      gcore.GlobalEvent.fire(ActivityEvent.RefreshMainUIData)
    },


    getActivityList:function(){
      // ActionController.getInstance().cs16603(91029)
      // this.refreshActivityData();
      return this.activityList;
    },

    getTimeDesc:function(bid,camp_id){//时间desc
      if(!bid&&!camp_id){
        return "";
      }
      var desc = "";
      let key = bid+"_"+camp_id;
      const element = this.activityList[key];
      if(element){  
        if(element.getTime){
          desc = element.getTime();
        }
      }
      return desc;
    },
});