// --------------------------------------------------------------------
// @author: shiraho@syg.com(必填, 创建模块的人员)
// @description:
//      日常主界面，包含了任务和成就
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------

var PathTool = require("pathtool");
var TaskController = require("task_controller");
var TaskEvent = require("task_event");
var TaskConst = require("task_const");

var TaskMainWindow = cc.Class({
    extends: CommonWindowTab,
    ctor: function () {
        this.ctrl = TaskController.getInstance();
        this.model = this.ctrl.getModel();
        this.win_type = WinType.Full
        this.tab_info_list = [
            { label: Utils.TI18N("日常"), index: TaskConst.type.quest, status: true, notice: Utils.TI18N("日常任务11级开启") },
            { label: Utils.TI18N("成就"), index: TaskConst.type.feat, status: true, notice: Utils.TI18N("日常任务15级开启") }
        ];
        this.title_str = Utils.TI18N("日常");
        this.cur_index = 1;
        this.cur_panel = null;
        this.panel_list = [];
        var ActionController = require("action_controller")
        if(ActionController.getInstance().action_operate){
            ActionController.getInstance().action_operate.setVisible(false)   
        }
        this.rewardList = [];
    },



    registerEvent: function () {

      // if (this.update_self_event == null) {
      //     this.update_self_event = this.data.bind(TaskEvent.UpdateSingleQuest, function () {
      //         this.refreshRewardBtn();
      //     }.bind(this))
      //   }
        this.addGlobalEvent(TaskEvent.UpdateUIRedStatus, function (key, value) {
            this.updateUIRedStatus(key)
            this.refreshRewardBtn(this.index);
        }.bind(this))

        Utils.onTouchEnd(this.reward_btn,()=>{
          var list = this.model.getRewardList();
          if(list < 0){
            return;
          }
          this.requestAllReward(list);
        },1)
    },

    requestAllReward:function(list){
      this.ctrl.RewardListNum = list.length;
      if(this.index== 1){
        for(let infoData of list){
          this.ctrl.requestSubmitTask(infoData.id, true);
        }
      }else if (this.index == 2){
        for(let infoData of list){
          this.ctrl.requestSubmitFeat(infoData.id);
        }
      }
    },

    selectedTabCallBack: function (index) {
        if (index == TaskConst.type.quest)
            this.changeTitleName(Utils.TI18N("日常"));
        else if (index == TaskConst.type.feat)
            this.changeTitleName(Utils.TI18N("成就"));
        this.changePanel(index);
    },

    openRootWnd: function (index) {
        index = index || TaskConst.type.quest;
        this.setSelecteTab(index, true);
        this.updateUIRedStatus(TaskConst.update_type.feat)
        this.updateUIRedStatus(TaskConst.update_type.quest)
        this.reward_btn.active = true;
    },

    updateUIRedStatus: function (type) {
        if (type == TaskConst.update_type.feat) {
            var feat_status = this.model.getRedStatus(TaskConst.update_type.feat);
            this.setTabTips(feat_status, TaskConst.type.feat);
        } else {
            var task_status = this.model.getRedStatus(TaskConst.update_type.quest);
            if (task_status == false)
                task_status = this.model.getRedStatus(TaskConst.update_type.activity);
            this.setTabTips(task_status, TaskConst.type.quest);
        }
    },

    refreshRewardBtn:function(index){
      this.index = index
      this.model.refreshRewardList(index);
      this.rewardList = this.model.getRewardList();
      if(this.rewardList.length>0){
        this.reward_mask_nd.active = false;
      }else{
        this.reward_mask_nd.active = true;
      }
    },



    changePanel: function (index) {
        if (this.cur_panel != null) {
            this.cur_panel.addToParent(false);
            this.cur_panel = null;
        }
        if (this.panel_list[index] == null) {
            if (index == TaskConst.type.quest) {
                var TaskPanel = require("task_panel");
                this.panel_list[index] = new TaskPanel();
            }
            else if (index == TaskConst.type.feat) {
                var FeatPanel = require("feat_panel");
                this.panel_list[index] = new FeatPanel();
            }
            this.panel_list[index].setParent(this.container);
            this.panel_list[index].show();
        }
        this.cur_panel = this.panel_list[index];
        if (this.cur_panel != null)
            this.cur_panel.addToParent(true);
    },

    closeCallBack: function () {
        for (var k in this.panel_list){
            this.panel_list[k].deleteMe();
            this.panel_list[k] = null;
        }
        this.panel_list = null;
        var ActionController = require("action_controller")
        if(ActionController.getInstance().action_operate){
            ActionController.getInstance().action_operate.setVisible(true)   
        }
        this.ctrl.openTaskMainWindow(false);
    }
});

module.exports = TaskMainWindow;