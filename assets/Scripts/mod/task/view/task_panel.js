// --------------------------------------------------------------------
// @author: shiraho@syg.com(必填, 创建模块的人员)
// @description:
//      日常主界面的任务标签页
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------

var PathTool = require("pathtool");
var TaskController = require("task_controller");
var TaskEvent = require("task_event");
var TaskConst = require("task_const");
var RoleEvent = require("role_event");
var RoleController = require("role_controller");
var CommonScrollView = require("common_scrollview");
var TaskItem = require("task_item");

var TaskPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("task", "task_panel");
        this.box_list = [109, 108, 108, 110];
        this.ctrl = TaskController.getInstance();
        this.model = this.ctrl.getModel();
        this.role_vo = RoleController.getInstance().getRoleVo();
        this.is_new = null;
        this.need_update = null;
    },


    initPanel: function () {
        this.container = this.root_wnd.getChildByName("container");

        var activity_container = this.container.getChildByName("activity_container");
        this.progress = activity_container.getChildByName("progress_container").getChildByName("progress").getComponent(cc.ProgressBar);

        this.value = activity_container.getChildByName("value").getComponent(cc.Label);
        this.value.string = "0/100";

        this.awards_list = [];
        for (var i = 1; i <= Config.activity_data.data_get_length; i++) {
            var awards = activity_container.getChildByName("awards_" + i);
            if (awards != null) {
                awards.effect_container = awards.getChildByName("effect_container");
                awards.effect_container.skeleton = awards.effect_container.getComponent(sp.Skeleton);
                awards.target_value = awards.getChildByName("target_value").getComponent(cc.Label);
                awards.is_show_tips = true;
                awards.status = TaskConst.action_status.normal;
                if (gdata("activity_data", "data_get", [i]) != null) {
                    awards.config = gdata("activity_data", "data_get", [i]);
                    awards.target_value.string = awards.config.activity;
                }
                //按照配置的活跃度储存
                this.awards_list[i] = awards;
            }
        }

        this.quest_container = this.container.getChildByName("quest_container");
        var size = this.quest_container.getContentSize();

        var scroll_view_size = cc.size(size.width, size.height - 20)
        var setting = {
            item_class: TaskItem,      // 单元类
            start_x: 6,                    // 第一个单元的X起点
            space_x: 0,                    // x方向的间隔
            start_y: 0,                    // 第一个单元的Y起点
            space_y: 2,                   // y方向的间隔
            item_width: 610,               // 单元的尺寸width
            item_height: 148,              // 单元的尺寸height
            row: 0,                        // 行数，作用于水平滚动类型
            col: 1,                        // 列数，作用于垂直滚动类型
            need_dynamic: true
        }
        this.item_scrollview = new CommonScrollView()
        this.item_scrollview.createScroll(this.quest_container, cc.v2(0, 0), ScrollViewDir.vertical, ScrollViewStartPos.top, scroll_view_size, setting, cc.v2(0.5, 0.5))
        this.updateTaskList(this.is_new);
        this.updateActivity(this.need_update);
        Utils.getNodeCompByPath("container/activity_container/title", this.root_wnd, cc.Label).string = Utils.TI18N("活跃度:");
    },

    addToParent: function (status) {
        // this.handleDynamicEvent(status);
        // this.setVisible(status);
        if (this.root_wnd == null)
            this.active_value = status
        else
            this.root_wnd.active = status
        if (status == true) {
            this.ctrl.requestActivityInfo();    //设置当前面板的时候做一次协议请求
            this.updateTaskList(true);
            this.updateActivity(false);
        }
    },

    handleDynamicEvent: function (status) {
        if (!status) {
            if (this.role_assets_event != null) {
                if (this.role_vo != null) {
                    this.role_vo.unbind(this.role_assets_event)
                }
                this.role_assets_event = null;
            }
            if (this.update_activity_event != null) {
                gcore.GlobalEvent.unbind(this.update_activity_event);
                this.update_activity_event = null;
            }
            if (this.update_task_list != null) {
                gcore.GlobalEvent.unbind(this.update_task_list);
                this.update_task_list = null;
            }
        } else {

        }
    },

    //必要添加的一个位置方法
    setPosition: function (x, y) {
        this.x = x;
        this.y = y;
        if (this.root_wnd) {
            this.root_wnd.setPosition(this.x, this.y);
        }
    },

    //必要添加的显隐方法
    setVisible: function (bool) {
        if (this.root_wnd) {
            this.root_wnd.active = bool;
        }
    },

    registerEvent: function () {
        for (var k in this.awards_list) {
            const awards = this.awards_list[k];
            awards.on(cc.Node.EventType.TOUCH_END, function (event) {
                var sender = event.currentTarget;
                if (sender.config != null) {
                    if (sender.is_show_tips == true) {
                        var CommonAlert = require("commonalert");
                        CommonAlert.showItemApply(Utils.TI18N("当前活跃度奖励"),sender.config.rewards,null,Utils.TI18N("确定"),null,null,Utils.TI18N("奖励"),null,null,true,null, null,{off_y:50})
                    } else {
                        if (this.role_vo && this.role_vo.activity >= sender.config.activity)
                            this.ctrl.requestGetActivityAwards(sender.config.activity);
                    }
                }
            }.bind(this))
        }

        if (this.role_vo != null) {
            if (this.role_assets_event == null) {
                this.role_assets_event = this.role_vo.bind(EventId.UPDATE_ROLE_ATTRIBUTE, function (key, value) {
                    if (key == "activity")
                        this.updateActivity(true);
                }.bind(this))
            }
        }
        if (this.update_activity_event == null) {
            this.update_activity_event = gcore.GlobalEvent.bind(TaskEvent.UpdateActivityInfo, function (data) {
                this.updateActivityData(data)
            }.bind(this))
        }
        if (this.update_task_list == null) {
            this.update_task_list = gcore.GlobalEvent.bind(TaskEvent.UpdateTaskList, function (is_new) {
                this.updateTaskList(is_new)
            }.bind(this))
        }

        this.ctrl.requestActivityInfo();
    },

    updateActivity: function (need_update) {
        this.need_update = need_update
        if (this.root_wnd == null)
            return
        if (this.role_vo != null) {
            var activity_config = gdata("activity_data", "data_get", [Config.activity_data.data_get_length]);
            var max_activity = 100;
            if (activity_config != null)
                max_activity = activity_config.activity;
            this.value.string = this.role_vo.activity + "/" + max_activity;
            this.progress.progress = this.role_vo.activity / max_activity;
            if (need_update == true)
                this.updateActivityData(this.model.getActivityData());
        }
    },

    // @desc:更新活跃宝箱
    // author:{author}
    // time:2018-05-22 16:02:57
    // --@data: 
    // return
    updateActivityData: function (data) {
        if (this.role_vo == null)
            return
        var data_list = data;

        //判断这个活跃度的宝箱是否已经领取了
        var check_activity = function (activity) {
            if (data_list == null)
                return false
            return data_list[activity];
        }

        for (var i in this.awards_list) {
            var item = this.awards_list[i];
            if (item && item.config && item.effect_container) {
                if (check_activity(item.config.activity) == true) {
                    item.is_show_tips = true;
                    item.status = TaskConst.action_status.finish;
                } else {
                    if (item.config.activity <= this.role_vo.activity) {
                        item.is_show_tips = false;
                        item.status = TaskConst.action_status.activity;
                    } else {
                        item.is_show_tips = true;
                        item.status = TaskConst.action_status.un_activity;
                    }
                }

                var box_action = PlayerAction.action_1;
                if (item.status == TaskConst.action_status.finish)
                    box_action = PlayerAction.action_3;
                else if (item.status == TaskConst.action_status.activity)
                    box_action = PlayerAction.action_2;

                if (item.effect_container.skeleton.skeletonData) {
                    if (item.box_action != box_action) {
                        item.effect_container.skeleton.setAnimation(0, box_action, true);
                        item.box_action = box_action;
                    }
                } else {
                    var res_id = gdata("effect_data", "data_effect_info", this.box_list[i - 1]);
                    var path = cc.js.formatStr("spine/%s/action.atlas", res_id)
                    var _skeleton = item.effect_container.skeleton
                    this.createEffect(_skeleton, path, box_action);
                }
            }
        }
    },

    //生成宝箱
    createEffect(_skeleton, path, box_action) {
        this.loadRes(path, (function (res) {
            _skeleton.skeletonData = res;
            _skeleton.setAnimation(0, box_action, true);
        }).bind(this))
    },

    // @desc:更新任务列表，是否需要重新更新列表
    // author:{author}
    // time:2018-05-22 19:11:28
    // --@is_new:如果为true,则重新排序吧，否则就直接更新位置
    // return
    updateTaskList: function (is_new) {
        this.is_new = is_new;
        if (this.root_wnd == null)
            return
        // if (is_new == true) {
            var list = this.model.getTaskList();
            this.item_scrollview.setData(list);
        // } else {
        //     var sort_func = Utils.tableLowerSorter(["finish_sort", "id"]);
        //     this.item_scrollview.resetPosition(sort_func);
        // }
    },


    onDelete: function () {
        if (this.role_assets_event != null) {
            if (this.role_vo != null) {
                this.role_vo.unbind(this.role_assets_event)
            }
            this.role_assets_event = null;
        }
        if (this.update_activity_event != null) {
            gcore.GlobalEvent.unbind(this.update_activity_event);
            this.update_activity_event = null;
        }
        if (this.update_task_list != null) {
            gcore.GlobalEvent.unbind(this.update_task_list);
            this.update_task_list = null;
        }
        if (this.item_scrollview) {
            this.item_scrollview.deleteMe();
            this.item_scrollview = null;
        }
    }

});

module.exports = TaskPanel;