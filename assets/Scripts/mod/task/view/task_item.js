// --------------------------------------------------------------------
// @author: shiraho@syg.com(必填, 创建模块的人员)
// @description:
//      用户输入框
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------

var PathTool = require("pathtool");
var TaskConst = require("task_const");
var TaskEvent = require("task_event");
var TaskController = require("task_controller");


var TaskItem = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("task", "task_item");
        this.item_list = [];
    },


    initPanel: function () {
        // this.btn_img_res = "common_1098";
        this.container = this.root_wnd.getChildByName("container");
        this.task_desc = this.container.getChildByName("task_desc").getComponent(cc.Label);

        this.btn_container = this.container.getChildByName("btn_container");

        this.goto_btn = this.btn_container.getChildByName("goto_btn");

        this.goto_btn_label = this.goto_btn.getChildByName("label").getComponent(cc.Label);
        this.goto_btn_label.string = Utils.TI18N("前往");
        this.goto_btn_img = this.goto_btn.getComponent(cc.Sprite);

        this.progress = this.btn_container.getChildByName("progress").getComponent(cc.ProgressBar);
        this.value = this.btn_container.getChildByName("value").getComponent(cc.Label);
        this.value.string = "0/0";
        this.progress.progress = 0;

        this.completed_img = this.container.getChildByName("completed_img");
    },


    registerEvent: function () {
        if (this.goto_btn) {
            this.goto_btn.on(cc.Node.EventType.TOUCH_END, function () {
                if (this.data != null && this.data.config != null) {
                    if (this.data.finish == TaskConst.task_status.un_finish) {
                        if (this.data.progress != null) {
                            for (var i in this.data.progress) {
                                var v = this.data.progress[i];
                                if (v.finish == 0) {
                                    TaskController.getInstance().handleTaskProgress(this.data, i);
                                    break
                                }
                            }
                        }
                    } else if (this.data.finish == TaskConst.task_status.finish) {
                        if (this.data.type == TaskConst.type.quest) {
                            TaskController.getInstance().requestSubmitTask(this.data.id);
                        } else if (this.data.type == TaskConst.type.feat) {
                            TaskController.getInstance().requestSubmitFeat(this.data.id);
                        }
                    }
                }
            }, this);
        }
    },

    addCallBack: function (value) {
        this.callback = value
    },

    // 退出的时候移除一下吧.要不然可能有些人不会手动移除,就会报错
    registerScriptHandler: function (event) {
        if ("enter" == event) {

        } else if ("exit" == event) {
            if (this.data != null) {
                if (this.update_self_event != null) {
                    this.data.unbind(this.update_self_event);
                    this.update_self_event = null;
                }
                this.data = null;
            }
        }
    },

    //必要添加的数据传入方法
    setData: function (data) {
        this.data = data;

        if (this.root_wnd != null)
            this.onShow()
    },

    onShow: function () {
        // if (this.data != null) {
        //     if (this.update_self_event != null) {
        //         this.data.unbind(this.update_self_event);
        //         this.update_self_event = null;
        //     }
        //     this.data = null;
        // }
        // this.data = data;
        if (this.update_self_event == null) {
            this.update_self_event = this.data.bind(TaskEvent.UpdateSingleQuest, function () {
                this.updateSelf();
                TaskController.getInstance().task_main_window.refreshRewardBtn(this.data.type);
            }.bind(this))
        }
        this.fillAwardsItems()

        this.updateSelf()
    },

    // @desc:创建展示物品
    // author:{author}
    // time:2018-05-26 13:56:08
    // return
    fillAwardsItems: function () {
        if (this.data == null || this.data.config == null || this.data.config.commit_rewards == null)
            return
        for (var i in this.item_list) {
            var item = this.item_list[i];
            item.setVisible(false)
        }
        for (var i in this.data.config.commit_rewards) {
            var v = this.data.config.commit_rewards[i];
            var _bid = v[0];
            var _num = v[1];
            var item = this.item_list[i];
            if (item == null) {
                item = ItemsPool.getInstance().getItem("backpack_item");
                item.initConfig(false, 0.7, false, true)
                var _x = (BackPackItem.Width * 0.7 + 20) * i + 58;
                item.setPosition(_x, 54);
                item.show();
                item.setParent(this.container)
                this.item_list[i] = item;
            } else {
                item.setVisible(true);
            }
            item.setData({ bid: _bid, num: _num });
        }
    },

    changeImg:function(res){
        //if(!this.loading){
            //this.loading = true;
            this.loadRes(res, function(sf_obj){
                if(sf_obj.name == this.btn_img_res){//防止加载顺序错乱情况
                    this.goto_btn_img.spriteFrame = sf_obj;
                }
                //this.loading = false;
                // if(sf_obj &&this.btn_img_res && sf_obj.name!= this.btn_img_res){//loading过程中发生修改
                //     this.changeImg(this.btn_img_res);
                // }
            }.bind(this))
        //}
    },

    updateSelf: function () {
        if (this.data == null)
            return
        this.id = this.data.id;
        this.finish_sort = this.data.finish_sort;
        this.completed_img.active = this.data.finish == TaskConst.task_status.completed;
        this.btn_container.active = this.data.finish != TaskConst.task_status.completed;

        var btn_img_res = "";
        if (this.data.finish == TaskConst.task_status.un_finish) { 
            this.goto_btn_label.string = Utils.TI18N("前往");
            btn_img_res = "Btn_2_3";
            this.goto_btn_label.node.color = new cc.Color(0xff, 0xff, 0xff, 0xff);

        } else if (this.data.finish == TaskConst.task_status.finish) {
            this.goto_btn_label.string = Utils.TI18N("提交");
            btn_img_res = "Btn_2_1";
            this.goto_btn_label.node.color = new cc.Color(0xff, 0xff, 0xff);
        }

        if (this.btn_img_res != btn_img_res && btn_img_res!= "") {
            this.btn_img_res = btn_img_res;
            this.changeImg(PathTool.getCommonIcomPath(btn_img_res))
        }

        if (this.data.finish != TaskConst.task_status.completed) {
            if (this.data.progress != null) {
                var progress = this.data.progress[0];
                if (progress != null) {
                    this.value.string = cc.js.formatStr("%s/%s", Utils.getMoneyString(progress.value), Utils.getMoneyString(progress.target_val));
                    this.progress.progress = progress.value / progress.target_val;
                }
            }
        }
        this.task_desc.string = this.data.getTaskContent();
    },

    suspendAllActions: function () {
        if (this.data != null) {
            if (this.update_self_event != null) {
                this.data.unbind(this.update_self_event);
                this.update_self_event = null;
            }
            this.data = null;
        }
    },

    onDelete: function () {
        for (var i in this.item_list) {
            var v = this.item_list[i];
            if (v)
                v.deleteMe();
        }
        this.item_list = null;
        this.suspendAllActions();
    }

});

module.exports = TaskItem;