/*-----------------------------------------------------+
 * 任务的真实数据
 * @author zys
 +-----------------------------------------------------*/
var TaskConst = require("task_const");
var TaskEvent = require("task_event");

var TaskVo = cc.Class({
    extends: gcore.BaseEvent,
    ctor: function () {
        this.id = arguments[0];
        this.type = arguments[1] || TaskConst.type.quest;
        if (this.type == TaskConst.type.quest) {
            this.config = gdata("quest_data", "data_get", [this.id]);
        } else if (this.type == TaskConst.type.feat) {
            this.config = gdata("feat_data", "data_get", [this.id]);
        } else if (this.type == TaskConst.type.action) {

        }
        this.finish = TaskConst.task_status.un_finish;
        this.finish_sort = 0;
    },

    _delete: function () {

    },

    //根据任务完成状态获取任务的描述
    getTaskContent: function () {
        return this.config.desc;
        // return splitDataStr(this.config.desc);
    },

    //获取任务的名
    getTaskName: function () {
        if (this.config)
            return this.config.name || ""
        else
            return ""
    },

    //设置这个任务是否处于完成提交状态
    setCompletedStatus: function (status) {
        this.finish = status;
        this.setFinishSort();
        this.dispatchUpdate();
    },

    //更新任务数据
    updateData: function (data) {
        this.finish = data.finish;
        this.progress = data.progress;
        this.setFinishSort();
        this.dispatchUpdate();
    },

    dispatchUpdate: function () {
        this.fire(TaskEvent.UpdateSingleQuest, this.id);
    },

    setFinishSort: function () {
        if (this.finish == TaskConst.task_status.un_finish) {
            this.finish_sort = 1;
        } else if (this.finish == TaskConst.task_status.finish) {
            this.finish_sort = 0;
        } else if (this.finish == TaskConst.task_status.completed) {
            this.finish_sort = 2;
        } else {
            this.finish_sort = 3;
        }
    }
});

module.exports = TaskVo;