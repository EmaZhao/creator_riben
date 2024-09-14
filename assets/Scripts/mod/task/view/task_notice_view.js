// --------------------------------------------------------------------
// @author: shiraho@syg.com(必填, 创建模块的人员)
// @description:
//      一些提示行的父节点
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------

var PathTool = require("pathtool");
var TaskController = require("task_controller");
var TaskEvent = require("task_event");
var TaskConst = require("task_const");
var LoaderManager = require("loadermanager");
var ViewClass = require("viewclass");

var TaskNoticeView = cc.Class({
    extends: ViewClass,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("task", "task_notice_item");
        this.viewTag = SCENE_TAG.msg;
        this.finish_list = [];
        this.base_view_event_list = {};
        this.res_list = {}
    },

    // 打开窗体的主入口
    open: function (params) {
        this.open_params = params;
        if (this.root_wnd) {
            this.openRootWnd();
        } else {
            var self = this;
            LoaderManager.getInstance().loadRes(this.prefabPath, (function (res_object) {
                if (!(res_object instanceof cc.Prefab)) {
                    cc.log("你载入的不是预制资源");
                    return;
                }
                if (this.is_close) {
                    return;
                }
                this.root_wnd = res_object;
                this.root_wnd.setPosition(-SCREEN_WIDTH * 0.5, -SCREEN_HEIGHT * 0.5)
                ViewManager.getInstance().addToSceneNode(this.root_wnd, this.viewTag);

                // 还未加载完成的时候设置了不可见,那么直接隐藏掉
                if (self.fastShowThenHide) {
                    self.fastShowThenHide = false
                    self.setVisible(false)
                }

                // 打开回调
                this.openCallBack();
                // 开启注册时间
                this.registerEvent();
                // 数据设置
                self.openRootWnd(self.open_params);

            }).bind(this));
        }
    },

    openCallBack: function () {
        this.container = this.root_wnd.getChildByName("container");
        var size = this.root_wnd.getContentSize();
        this.root_wnd.setPosition(-size.width / 2, SCREEN_HEIGHT * 0.5-size.height);
        this.container.active = false;
        this.task_img = this.container.getChildByName("task_img").getComponent(cc.Sprite);
        this.task_name = this.container.getChildByName("task_name").getComponent(cc.Label);
        this.task_desc = this.container.getChildByName("task_desc").getComponent(cc.Label);

        //移动的位移
        this.target_height = this.container.getContentSize().height;
    },

    openRootWnd: function () {

    },

    registerEvent: function () {
        this.addGlobalEvent(TaskEvent.UpdateTaskList, function (is_new, task_list) {
            this.fillFinishData(task_list, TaskConst.type.quest)
        }.bind(this))

        this.addGlobalEvent(TaskEvent.UpdateFeatList, function (feat_list) {
            this.fillFinishData(feat_list, TaskConst.type.feat)
        }.bind(this))

        this.container.on(cc.Node.EventType.TOUCH_END, function () {
            this.doMoveOut();
            if (this.cur_info)
                TaskController.getInstance().openTaskMainWindow(true, this.cur_info.type);
        }, this)
    },

    //desc:填充待显示的完成数据
    fillFinishData: function (list, type) {
        //引导中不出来
        // if (GuideController.getInstance().isInGuide())
        //     return
        //剧情中也不出来
        // if(storyController.getInstance().getModel().isStoryState())
        // return

        if (list == null || Utils.next(list) == null)
            return
        for (var i in list) {
            var v = list[i];
            this.finish_list.push({ id: v, type: type })
        }
        this.doMoveFinishItem();
    },

    doMoveFinishItem: function () {
        if (this.be_in_show == true)
            return
        if (this.finish_list == null || Utils.next(this.finish_list) == null)
            return
        this.be_in_show = true;
        var cur_data = this.finish_list.splice(0, 1);
        cur_data = cur_data[0];
        if (cur_data) {
            var task_model = TaskController.getInstance().getModel();
            if (cur_data.type == TaskConst.type.quest)
                this.cur_info = task_model.getTaskById(cur_data.id);
            else if (cur_data.type == TaskConst.type.feat)
                this.cur_info = task_model.getFeatById(cur_data.id);
        }
        if (this.cur_info && this.cur_info.config) {
            var res_name = "quest_item_icon";
            if (this.cur_info.type == TaskConst.type.feat) {
                this.task_name.string = Utils.TI18N("成就达成");
                res_name = "quest_item_icon_2";
            } else {
                this.task_name.string = Utils.TI18N("日常完成");
                res_name = "quest_item_icon";
            }

            this.task_desc.string = this.cur_info.getTaskContent();

            var path = PathTool.getBigBg("quest/" + res_name);
            this.loadRes(path, function (res_object) {
                this.task_img.spriteFrame = res_object
            }.bind(this))

            this.doMoveIn();
        }
    },

    doMoveIn: function () {
        this.container.active = true;
        this.container.opacity = 0;
        this.container.y = this.target_height;

        var fadeIn = cc.fadeIn(0.3);
        var moveTo = cc.moveTo(0.3, cc.v2(0, 0));
        var delay = cc.delayTime(3);
        var fadeOut = cc.fadeOut(0.3);
        var moveOut = cc.moveTo(0.3, cc.v2(0, this.target_height));
        var call_fun = cc.callFunc(function () {
            this.doMoveOut();
        }, this)
        this.container.runAction(cc.sequence(cc.spawn(fadeIn, moveTo), delay, cc.spawn(fadeOut, moveOut), call_fun), this);
    },

    doMoveOut: function () {
        this.be_in_show = false;
        this.container.stopAllActions();
        this.container.active = false;
        this.container.opacity = 0;
        this.container.y = this.target_height;

    },


    onDelete: function () {

    }

});

module.exports = TaskNoticeView;