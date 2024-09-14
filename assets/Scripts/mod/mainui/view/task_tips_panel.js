// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     主界面任务
// <br/>Create: 2019-08-15 10:26:53
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var HallowsController = require("hallows_controller");
var TaskController = require("task_controller");
var HallowsEvent = require("hallows_event");
var GuideController = require("guide_controller");
var GuideEvent = require("guide_event");
var TaskEvent = require("task_event");
var TaskController = require("task_controller");

var Task_panelPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("mainui", "task_tips_panel");
        this.mainui = arguments[0]
    },

    // 可以初始化声明一些变量的
    initConfig: function () {
        this.hallow_ctrl = HallowsController.getInstance();
        this.hallow_model = this.hallow_ctrl.getModel();

        this.task_ctrl = TaskController.getInstance();
        this.task_model = this.task_ctrl.getModel();

        this.hallow_id = "";
        this.task_list = [];
        //任务状态，0未完成，1完成未领取，2已领取
        this.task_data = null;  //当前任务数据

        this.red_color = new cc.Color(163, 32, 0, 255);
        this.green_color = new cc.Color(0, 64, 5, 255);

        this.new_player_status = false; //新手引导是否进行
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel: function () {
        this.main = this.seekChild("main");
        this.icon = this.seekChild("icon");
        this.title_lb = this.seekChild("title", cc.Label);// 任务标题
        this.progress_pb = this.seekChild("progress", cc.ProgressBar);//任务进度条
        this.progress_lb = this.seekChild("pro_label", cc.Label);

        this.get_nd = this.seekChild("get_sp");
        // this.work_nd = this.seekChild("work_sp");

        // this.get_lb = this.seekChild("get_label", cc.Label);//可领奖/进行中
        // this.get_lo = this.seekChild("get_label", cc.LabelOutline);

        this.effect_sk = this.seekChild("effect", sp.Skeleton); //手指特效
        this.finish_sk = this.seekChild("finish", sp.Skeleton); //完成特效

        this.backpack_item = ItemsPool.getInstance().getItem("backpack_item");
        this.backpack_item.setParent(this.icon);
        // this.backpack_item.setPosition(-103.5, -16.5);
        this.backpack_item.initConfig(false, 0.65, false, true);
        this.backpack_item.show();

        if (this.open_status) {
            this.getTaskList();
        }
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {
        Utils.onTouchEnd(this.main, function () {
            if(!this.task_data) return
            if (this.task_data.finish == 0) {
                window.TASK_TIPS = true;
                if (this.task_data && this.config) {
                    TaskController.getInstance().gotoTagertFun(this.config.progress[0], this.config.extra);
                    this.changeTaskGuideWindow(true);
                }
            } else if (this.task_data.finish == 1) {
                if (this.task_data && this.config) {
                    // this.hallow_ctrl.requestSubmitHallowsTask(this.task_data.id);
                    this.task_ctrl.send30002(this.task_data.id);
                }
                window.TASK_TIPS = false;
            } else if (this.task_data.finish == 2) {    //预防卡住没刷新
                this.getTaskList();
                window.TASK_TIPS = false;
            }
        }.bind(this), 1)

        // this.addGlobalEvent(HallowsEvent.UpdateHallowsTaskEvent, function () {
        //     this.getTaskList();
        //     if (this.hallow_model.checkIsHaveAllHallows()) {
        //         this.deleteMe();
        //     }
        // }, this)

        this.addGlobalEvent(TaskEvent.UpdateMainQuestTask, function (data) {
            if (data.finish == 2) {
                if(this.mainui){
                    this.mainui.deleteTaskTip()
                }
                // this.deleteMe();
            } else {
                this.getTaskList();
            }
        }, this)

        // this.addGlobalEvent(HallowsEvent.CloseTaskEffectEvent, function (data) {
        //     if (data == this.config.progress[0].cli_label) {
        //         window.TASK_TIPS = false;
        //     }
        // }, this)

        this.addGlobalEvent(GuideEvent.NewPlayerGuideStart, function () {
            this.handleEffect(false);
            this.new_player_status = true;
        }, this)

        this.addGlobalEvent(GuideEvent.NewPlayerGuideClose, function () {
            this.new_player_status = false;
            this.handleEffect(true);
        }, this)
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow: function (params) {

        this.getTaskList();
    },

    //获取神器任务列表
    getTaskList: function () {
        if (this.root_wnd == null) {
            this.open_status = true;
            return
        }

        // if (this.hallow_model.checkIsHaveAllHallows()) {
        //     this.deleteMe();
        // }

        // this.hallow_id = this.hallow_model.getCurActivityHallowsId();   //当前待激活神器id

        // let list = this.hallow_model.getHallowsTaskList(this.hallow_id);  //已排好升序，

        // this.task_list = Utils.deepCopy(list);
        // this.task_list.sort(Utils.tableLowerSorter(["sort"]));
        // if(this.task_list == []) return

        // if (this.task_list[0] && this.task_list[0].finish!= null && (this.task_list[0].finish == 0 || this.task_list[0].finish == 1)) {
        //     this.task_data = this.task_list[0];
        // } else {
        //     let len = this.task_list.length;
        //     for (let i = 1; i < len; i++) {
        //         let cur = this.task_list[i];
        //         let last = this.task_list[i - 1];
        //         if ((cur.finish == 0 || cur.finish == 1) && last.finish == 2) {
        //             this.task_data = cur;
        //             break
        //         }
        //     }
        // }
        this.task_data = this.task_model.getMainTaskData();

        cc.log(this.task_data)

        if (this.task_data == null) {
            return
        }

        if (this.task_data.finish == 2) {
            this.mainui.deleteTaskTip()
            // this.deleteMe();
            return
        }

        // let config = gdata("hallows_data", "data_task", this.task_data.id);
        // cc.log(Config.main_quest_data.data_task)
        let config = gdata("main_quest_data", "data_task", this.task_data.id);
        this.config = config;

        cc.log(this.task_data,config)
        if (config) {
            this.title_lb.string = config.desc;
            let cur = this.task_data.value || 0;
            let target = this.task_data.target_val || 0;
            this.progress_lb.string = cur + "/" + target;
            this.progress_pb.progress = cur / target;

            let item_list = config.items;
            //取出第一个物品
            if (item_list && item_list[0]) {
                let cfg = Utils.getItemConfig(item_list[0][0]);
                if (cfg) {
                    this.backpack_item.setData({ bid: item_list[0][0], num: item_list[0][1] })
                }
            } else {
            }
        } else {
            this.title_lb.string = "";
        }

        let is_show_eff = this.config.is_show_eff;
        this.handleEffect(this.task_data.finish < 1 && is_show_eff);
        this.handleFinishEffect(this.task_data.finish >= 1);
        this.changeStatusSp(this.task_data.finish >= 1);
    },

    //手指特效显示
    handleEffect: function (status) {
        if (status == false) {
            if (this.effect_sk) {
                this.effect_sk.setToSetupPose();
                this.effect_sk.clearTracks();
            }
        } else {
            if (GuideController.getInstance().isInGuide()) return
            if (this.effect_sk && this.new_player_status == false) {
                var eff_res = PathTool.getEffectRes(240);
                var eff_path = PathTool.getSpinePath(eff_res);
                this.loadRes(eff_path, function (res_object) {
                    this.effect_sk.skeletonData = res_object;
                    this.effect_sk.setAnimation(0, PlayerAction.action_1, true)
                }.bind(this))
            }
        }
    },

    //完成特效显示
    handleFinishEffect: function (status) {
        if (status == false) {
            if (this.finish_sk) {
                this.finish_sk.setToSetupPose();
                this.finish_sk.clearTracks();
            }
        } else {
            if (this.finish_sk) {
                // var eff_res = PathTool.p(9999);
                window.TASK_TIPS = false;
                var eff_res = "E99999";
                var eff_path = PathTool.getSpinePath(eff_res);
                this.loadRes(eff_path, function (res_object) {
                    this.finish_sk.skeletonData = res_object;
                    this.finish_sk.setAnimation(0, PlayerAction.action, true)
                }.bind(this))
            }
        }
    },

    //改变领取图状态
    changeStatusSp: function (status) {
        // this.work_nd.active = !status;
        this.get_nd.active = status;
        // if (status) {

        //     this.get_lo.color = this.red_color;
        //     this.get_lb.string = Utils.TI18N("可领奖");
        // } else {

        //     this.get_lo.color = this.green_color;
        //     this.get_lb.string = Utils.TI18N("进行中");
        // }
    },

    //改变界面的显隐
    changeTaskGuideWindow: function (status) {
        // return
        if (this.config.drama_eff[0] == null) {
            window.TASK_TIPS = false;
            return
        }

        if (GuideController.getInstance().getTaskGuideWindow()) {
            GuideController.getInstance().getTaskGuideWindow().setVisibleStatus(status, this.config);
        } else {
            GuideController.getInstance().openTaskGuideWindow(true, this.config);
        }
        this.handleEffect(!status)
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide: function () {

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete: function () {
        this.handleEffect(false);
        this.handleFinishEffect(false);
        if (this.backpack_item) {
            this.backpack_item.deleteMe();
        }
        this.backpack_item = null;
    },
})