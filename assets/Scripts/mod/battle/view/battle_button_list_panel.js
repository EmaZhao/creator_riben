// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-02-26 17:22:02
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var DramaEvent = require("battle_drama_event");
var TimeTool = require("timetool");
var MainuiEvent = require("mainui_event");
var VoyageEvent = require("voyage_event");
var HallowsEvent = require("hallows_event");
var HallowsController = require("hallows_controller");
var OnlineGiftController = require("onlinegift_controller")
var OnlineGiftEvent = require("onlinegift_event");
var RoleController = require("role_controller");
var GuideEvent = require("guide_event");
var VipEvent = require("vip_event");
var VipController = require("vip_controller");
var GuideController = require("guide_controller");
var HeroEvent  =  require("hero_event");

var BattleButtonListPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("battle", "battle_button_list");
    },

    // 可以初始化声明一些变量的
    initConfig: function () {
        this.rleasePrefab = false;
        this.resources_action = null;
        this.is_onshow = false;
        this.drama_controller = require("battle_drama_controller").getInstance();
        this.drama_model = this.drama_controller.getModel();
        this.skeletonData = null;
        this.drop_item_list = {};                                                   // 掉落物品展示列表
        this.reward_layout_list = {};                                               // 掉落资产展示列表
        this.battle_controller = require("battle_controller").getInstance();
        this.battle_model = this.battle_controller.getModel();
        this.challenge_condition = { status: 0, lev: 0 };                               // 挑战BOSS的按钮状态
        this.role_vo = RoleController.getInstance().getRoleVo();        // 获取角色信息,主要判断监听事件
        this.battle_drama_model = require("battle_drama_controller").getInstance().getModel();

        this.fly_item_pools = new cc.NodePool();// 假战斗对象池列表,根据物品icon区分
        this.auto_id = 0;                                               // 当前假战斗的物品列表
        this.fly_item_list = {};        // 储存当前生成的资产item

        this.cur_hallows_id = 0;
        this.cur_chapter_id = null;
        this.hallow_spine_path = "";
        this.left_btn_list = {};       //左边的图标列表,包含了排行和通关奖励和通关录像、日常

        this.white_color = new cc.Color(255, 255, 255, 255);
        this.gray_color = new cc.Color(125, 125, 125, 255);
        this.red_color = new cc.Color(79, 22, 0, 255);
        this.yellow_color = new cc.Color(255, 238, 181, 255);
        this.guildsign_open = false; //快速作战是否开启;
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel: function () {


        this.bottom_container = this.seekChild("bottom_container");
        this.hero_bag_btn = this.bottom_container.getChildByName("hero_bag_btn");
        this.hero_bag_redPoint = this.hero_bag_btn.getChildByName("red_point");
        // this.left_top = this.seekChild(this.bottom_container, "left_top");
        // this.right_top = this.seekChild(this.bottom_container, "right_top");

        this.scrollview_content = this.seekChild("content") // 物品展示滚动容器

        this.collect_container = this.seekChild(this.bottom_container, "collect_container");                // 采集父节点
        this.resources_model = this.seekChild(this.collect_container, "resources_model");                   // 采集点击
        this.progress = this.seekChild(this.collect_container, "progress", cc.ProgressBar);                 // 进度条
        this.time_label = this.seekChild(this.collect_container, "time_label", cc.Label);                    // 当前时间
        this.skeleton = this.seekChild(this.collect_container, "spine", sp.Skeleton);

        this.challenge_boss_btn = this.seekChild("guildsign_battle_boss_btn");                              // 挑战BOSS
        this.notice_label = this.seekChild(this.challenge_boss_btn, "notice_label", cc.Label);              // 前往下一章的
        this.challenge_item = this.seekChild(this.challenge_boss_btn, "challenge_item");                    // 挑战BOSS
        this.challenge_btn_effect = this.seekChild(this.challenge_boss_btn, "effect", sp.Skeleton);           // 挑战手指特效
        // this.challenge_btn_effect_1 = this.seekChild(this.challenge_item, "effect_1", sp.Skeleton);       // 挑战边框特效

        this.next_battle_time = this.seekChild("next_battle_time");                             // 挑战BOSS冷却时间
        this.next_label = this.seekChild(this.next_battle_time, "label", cc.Label);             // 冷却时间文本

        this.guidesign_battle_quick_btn = this.seekChild("guidesign_battle_quick_btn");     // 快速作战
        this.quick_btn_tips = this.seekChild(this.guidesign_battle_quick_btn, "tips");      // 快速作战红点
        this.guildsign_img_sp = this.seekChild(this.guidesign_battle_quick_btn, "Image_1", cc.Sprite);
        this.guildsign_icon_sp = this.seekChild(this.guidesign_battle_quick_btn, "Sprite_3", cc.Sprite);
        this.guildsign_lb = this.seekChild(this.guidesign_battle_quick_btn, "label", cc.Label);
        this.guildsign_lo = this.seekChild(this.guidesign_battle_quick_btn, "label", cc.LabelOutline);
        if (this.battle_drama_model.getDramaData().max_dun_id < Config.dungeon_data.data_drama_const.fast_combat_first.val) {
            this.guildsign_img_sp.setState(cc.Sprite.State.GRAY);
            this.guildsign_icon_sp.setState(cc.Sprite.State.GRAY);
            this.guildsign_lb.node.color = this.white_color;
            this.guildsign_lo.color = this.gray_color;
        } else {
            this.guildsign_open = true;
        }

        this.hero_btn = this.seekChild("hero_btn");         // 英雄变强

        this.detail_btn = this.seekChild("detail_btn");     // 详情按钮,打开掉落查询

        this.drama_reward_layout = this.seekChild("reward_layout");         // 当前章节资源产出效率
        for (let index = 0; index < 4; index++) {
            var layout = this.seekChild(this.drama_reward_layout, "layout_" + index);
            if (layout) {
                this.reward_layout_list[index] = {
                    layout: layout,
                    icon: this.seekChild(layout, "icon", cc.Sprite),
                    label: this.seekChild(layout, "label", cc.Label),
                    path: null
                }
            }
        }

        // 上部分图标
        this.top_container = this.seekChild("top_container");

        if (!window.isMobile) {
            this.top_container.getComponent(cc.Widget).enabled = false;
        }

        this.hallownode = this.seekChild(this.top_container, "hallownode");                     // 神器节点
        this.hallownode.name = "hallows_stage";
        this.hallowspine = this.seekChild(this.hallownode, "spinenode", sp.Skeleton);           // 神器模型
        this.hallowstips = this.seekChild(this.hallownode, "tips");                             // 神器任务红点
        this.hallowprogress = this.seekChild(this.hallownode, "progress", cc.ProgressBar);      // 神器进度
        this.haolowvalue = this.seekChild(this.hallownode, "nodename", cc.Label);               // 进度值

        this.receivenode = this.seekChild(this.top_container, "receivenode");                    // 在线奖励
        this.receivename = this.seekChild(this.receivenode, "nodename", cc.Label);              // 在线时间显示
        this.receiveitem = Utils.createClass("backpack_item");                                  // 奖励物品显示
        this.receiveitem.setParent(this.receivenode);
        this.receiveitem.setPosition(0, 10);
        this.receiveitem.initConfig(true, 0.55, true, true);
        this.receiveitem.show();

        this.ranknode = this.seekChild(this.top_container, "ranknode");                         // 排行榜节点
        this.left_btn_list[3] = this.ranknode;
        this.passnode = this.seekChild(this.top_container, "passnode");                         // 通关奖励
        this.left_btn_list[2] = this.passnode;
        this.passtips = this.seekChild(this.passnode, "tips");                                  // 通关奖励的红点

        this.videonode = this.seekChild(this.top_container, "videonode");                       // 通关录像
        this.left_btn_list[1] = this.videonode;
        this.tasknode = this.seekChild(this.top_container, "tasknode");                         // 任务
        this.left_btn_list[0] = this.tasknode;
        this.tasktips = this.seekChild(this.tasknode, "tips");                                  // 任务红点

        this.qingbao = this.seekChild(this.top_container, "qingbao");                           // 情报
        this.qingbaoprogress = this.seekChild(this.qingbao, "progress", cc.Sprite);             // 情报经验条
        this.qingbaotips = this.seekChild(this.qingbao, "tips");                                // 情报红点
        this.qingbaovalue = this.seekChild(this.qingbao, "value", cc.Label);                    // 当前请报值

        this.minimap = this.seekChild(this.top_container, "minimap");                           // 小地图
        this.minimap_mark = this.seekChild(this.minimap, "mark");
        this.minimap_img = this.seekChild(this.minimap_mark, "map", cc.Sprite);                 // 小地图的精灵对象纹理
        this.miniicon = this.seekChild(this.minimap_mark, "icon");                              // 坐标点指示图标
        this.mapname = this.seekChild(this.minimap, "mapname", cc.Label);                       // 地图名字

        this.init_rank_x = this.ranknode.x; // 记录一下初始化排行榜的位置,任务在从右往左第四个
        this.init_task_x = this.tasknode.x; // 记录一下初始化任务的位置,任务在从右往左第三个

        // 小游戏需要调整顶部栏
        if (window.PLATFORM_TYPR == "WX_SDK" || window.PLATFORM_TYPR == "SH_SDK" || PLATFORM_TYPR == "QQ_SDK") {
            if (window.WX_FIT) {
                var add_val = this.root_wnd.height * window.WX_FIT;
                var top_wdg = this.top_container.getComponent(cc.Widget);
                top_wdg.top += add_val;
            }
        }
        this.updateTopBtnPos();
        // this.rectHandleEffect(true);

        Utils.getNodeCompByPath("bottom_container/guildsign_battle_boss_btn/challenge_item/label", this.root_wnd, cc.Label).string = Utils.TI18N("挑战BOSS");
        Utils.getNodeCompByPath("bottom_container/guidesign_battle_quick_btn/label", this.root_wnd, cc.Label).string = Utils.TI18N("快速作战");
        Utils.getNodeCompByPath("bottom_container/hero_btn/label", this.root_wnd, cc.Label).string = Utils.TI18N("英雄变强");
        Utils.getNodeCompByPath("top_container/minimap/mapname", this.root_wnd, cc.Label).string = Utils.TI18N("剧情地图名字");
        Utils.getNodeCompByPath("top_container/tasknode/nodename", this.root_wnd, cc.Label).string = Utils.TI18N("日常任务");
        Utils.getNodeCompByPath("top_container/videonode/nodename", this.root_wnd, cc.Label).string = Utils.TI18N("通关录像");
        Utils.getNodeCompByPath("top_container/passnode/nodename", this.root_wnd, cc.Label).string = Utils.TI18N("通关奖励");
        Utils.getNodeCompByPath("top_container/ranknode/nodename", this.root_wnd, cc.Label).string = Utils.TI18N("排行榜");
        this.updateEmbattleRedPoint();
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {
        //布阵
        Utils.onTouchEnd(this.hero_bag_btn,()=>{
          require("hero_controller").getInstance().openFormMainWindow(true,null,"battle");
        },1)
        // 点击小地图
        Utils.onTouchEnd(this.minimap, function () {
            require("battle_drama_controller").getInstance().openBattleDramaMapWindows(true);
        }.bind(this), 1)

        // 点击挑战BOSS
        Utils.onTouchEnd(this.challenge_boss_btn, function () {
            this.touchChallengeBoss();
        }.bind(this), 1)
        // 点击详情
        Utils.onTouchEnd(this.detail_btn, function () {
            require("battle_drama_controller").getInstance().openDramDropWindows(true)
        }.bind(this), 1)
        // 点击详情
        Utils.onTouchEnd(this.resources_model, function () {
            this.touchResourceBox();
        }.bind(this), 1)
        //点击排行榜
        Utils.onTouchEnd(this.ranknode, function () {
            require("rank_controller").getInstance().openMainView(true)
        }.bind(this), 1)
        // 快速作战点击
        Utils.onTouchEnd(this.guidesign_battle_quick_btn, function () {
            if (this.guildsign_open)
                this.drama_controller.openDramBattleQuickView(true);
            if (this.quick_battle_status == true) {
                this.drama_model.setOpenQuickBattleStatus(true);
                this.drama_model.checkRedPoint();
                this.quick_btn_tips.active = false;
            }
        }.bind(this), 1)
        // 任务
        Utils.onTouchEnd(this.tasknode, function () {
            require("task_controller").getInstance().openTaskMainWindow(true);
        }.bind(this), 1)
        Utils.onTouchEnd(this.passnode, function () {
            this.drama_controller.openDramaRewardWindow(true);
        }.bind(this), 1)
        //点击情报
        Utils.onTouchEnd(this.qingbao, function () {
            var lev_config = Config.shipping_data.data_const["guild_lev"];
            if (lev_config && this.role_vo && lev_config.val <= this.role_vo.lev) {
                require("voyage_controller").getInstance().openVoyageMainWindow(true);
            } else {
                message(lev_config.desc)
            }
        }.bind(this), 1)
        Utils.onTouchEnd(this.hero_btn, function () {
            require("stronger_controller").getInstance().openMainWin(true)
        }.bind(this), 1)
        // 点击录像
        Utils.onTouchEnd(this.videonode, function () {
            this.drama_controller.openDramaPassVedioWindow(true);
        }.bind(this), 1)

        Utils.onTouchEnd(this.hallownode, function () {
            var JumpController = require("jump_controller");
            JumpController.getInstance().jumpViewByEvtData([20]);
        }.bind(this), 1)

        // 累积挂机时间更新
        this.addGlobalEvent(DramaEvent.UpdateHookAccumulateTime, function (data) {
            this.updateResourceCollect();
        }.bind(this));
        // 更新副本掉落展示
        this.addGlobalEvent(DramaEvent.BattleDrama_Update_Max_Id, function (id) {
            this.updateDramaDropInfo();
            this.updateChallengeBossStatus();
            if (this.guildsign_open == false) {
                if (id >= Config.dungeon_data.data_drama_const.fast_combat_first.val) {
                    this.guildsign_open = true;
                    this.guildsign_img_sp.setState(cc.Sprite.State.NORMAL);
                    this.guildsign_icon_sp.setState(cc.Sprite.State.NORMAL);
                    this.guildsign_lb.node.color = this.yellow_color;
                    this.guildsign_lo.color = this.red_color;
                }
            }
        }.bind(this));
        // 冷却时间发生变化的时候
        this.addGlobalEvent(DramaEvent.BattleDrama_Update_Cool_Time, function () {
            this.updateChallengeBossStatus();
        }.bind(this));
        // 挑战成功后开始制作副本
        this.addGlobalEvent(DramaEvent.BattleDrama_Update_Dun_Id, function () {
            this.updateMiniMapInfo();
        }.bind(this));
        // 快速作战的buff处理
        this.addGlobalEvent(DramaEvent.BattleDrama_Drama_Buff_View, function () {
            this.updateBattleBuff();
        }.bind(this));
        // 远航红点
        this.addGlobalEvent(VoyageEvent.UpdateVoyageRedEvent, function () {
            this.checkVoyageRedStatus();
        }.bind(this))
        // 通关奖励红点
        this.addGlobalEvent(DramaEvent.BattleDrama_Drama_Reward_Data, function (data) {
            this.updatePassRewardRedPoint();
        }.bind(this))
        //  神器任务更新
        this.addGlobalEvent(HallowsEvent.UpdateHallowsTaskEvent, function () {
            this.updateHallowSpine();
        }.bind(this));
        //  激活神器
        this.addGlobalEvent(HallowsEvent.HallowsActivityEvent, function () {
            this.updateHallowSpine();
        }.bind(this));
        //  神器红点
        this.addGlobalEvent(HallowsEvent.HallowsRedStatus, function () {
            this.updateHallowsRedStatus();
        }.bind(this));

        this.addGlobalEvent(DramaEvent.BattleDrama_Top_Update_Data, function (data) {
            if (this.cur_chapter_id != data.chapter_id) {
                this.drama_model.initDungeonList(data.mode, data.chapter_id)//战斗副本界面没对应刷新函数，暂时在这里初始化
            }
            this.updateMiniMapInfo();
            this.checkQuickRed();
        }.bind(this));

        this.addGlobalEvent(DramaEvent.BattleDrama_Top_Update_Data, function () {
            this.updateMiniMapInfo();
            this.checkQuickRed();
        }.bind(this));

        this.addGlobalEvent(DramaEvent.BattleDrama_Quick_Battle_Data, function (data) {
            if (data == null) return
            if (!this.quick_btn_tips) return
            if (data.fast_combat_first != 0 || !this.quick_battle_status) {
                this.quick_btn_tips.active = false;
            } else {
                this.quick_btn_tips.active = true;
            }
            this.checkQuickRed();
        }.bind(this));

        // 排行榜和任务图标显示规则
        this.addGlobalEvent(MainuiEvent.UPDATE_FUNCTION_STATUS, function (id, status) {
            if (!status) return;       // 移除图标,不处理
            if (id == 3) {            // 日常任务
                this.updateTaskInfo();
            } else if (id == 5) {      // 排行榜
                this.updateRankInfo();
            }
        }.bind(this))
        // 角色信息变化,主要是等级和请报值
        if (this.role_update_event == null && this.role_vo) {
            this.role_update_event = this.role_vo.bind(EventId.UPDATE_ROLE_ATTRIBUTE, function (key, value) {
                if (key == "energy") {
                    this.updateQingBaoInfo();
                } else if (key == "lev") {
                    this.updateRoleLevInfo();
                }
            }.bind(this))
        }
        // 在线奖励
        if (this.update_online_get_event == null) {
            this.update_online_get_event = gcore.GlobalEvent.bind(OnlineGiftEvent.Get_Data, function (data) {
                this.removeOnlineSprite(data)
                this.receiveChangeData()
            }.bind(this))
        }

        // 赠送vip处理
        this.addGlobalEvent(VipEvent.GIVE_VIP_UPDATE, function () {
            this.updateGiveVip();
        }.bind(this));


        this.addGlobalEvent(GuideEvent.CloseTaskEffect, function () {
            //引导的关闭来触发是否需要计时特效
            // this.lastTimeGoToHandleEffect();
            this.updateBtnLayerStatus(this.challenge_condition.status != 1)
        }, this)

        this.addGlobalEvent(GuideEvent.CloseButtonListPanelEffect, function () {
            this.deleteLastTimeHandle();
        }, this)
        this.addGlobalEvent(GuideEvent.NewPlayerGuideClose, function () {
            this.updateBtnLayerStatus(this.challenge_condition.status != 1)
        }, this)
        this.addGlobalEvent(HeroEvent.Filter_Hero_Update,()=>{
          this.updateEmbattleRedPoint();
        })  
    },

    updateEmbattleRedPoint(){
      this.hero_bag_redPoint.active = require("hero_controller").getInstance().getModel().getEmbattleRedPoint();
    },
    isCreateOnlineGift() {
        let status = false
        let data = OnlineGiftController.getInstance().getModel().getOnlineGiftData()
        if (data) {
            for (let i = 0; i < data.length; ++i) {
                let v = data[i]
                if (v.time == Config.misc_data.data_get_time_items[Config.misc_data.data_get_time_items_length].time) {
                    status = true
                    break
                }
            }
        }
        return status
    },
    // --避免网络时间延迟导致在线奖励领取完毕还在剧情副本中
    removeOnlineSprite(data) {
        if (data && data.list) {
            let status = false
            if (Utils.next(data.list) != null) {
                // --删除图标
                if (data.list.length >= Config.misc_data.data_get_time_items_length) {
                    status = false
                } else {
                    status = true
                }
            } else {
                status = true
            }
            if (status == false) {
                this.clearOnlineInfo()
            } else {
                // --创建图标
                this.onlineCreate()
            }
        }
    },
    clearOnlineInfo() {
        this.receivenode.active = false;
        if (this.update_online_get_event) {
            gcore.GlobalEvent.unbind(this.update_online_get_event)
            this.update_online_get_event = null
        }
        if (this.time_tichet) {
            gcore.Timer.del(this.time_tichet);
            this.time_tichet = null;
        }
    },
    onlineCreate() {
        this.receivenode.active = true;
        this.receiveitem.addCallBack(function () {
            OnlineGiftController.getInstance().openOnlineGiftView(true)
        })
    },
    updateOnlineGiftInfo() {
        OnlineGiftController.getInstance().send10926()
    },
    receiveChangeData() {
        let data = OnlineGiftController.getInstance().getModel().getOnlineGiftData()
        let num = 0
        let _get_time_items = Config.misc_data.data_get_time_items
        let _get_time_length = Config.misc_data.data_get_time_items_length
        if (data) {
            for (let i in _get_time_items) {
                let v = _get_time_items[i]
                if (data[0]) {
                    if (data[0].time >= v.time) {
                        num = i
                    }
                }
            }
        }
        num = Number(num) + 1
        if (num >= _get_time_length) {
            num = _get_time_length
        }

        let online_time = OnlineGiftController.getInstance().getModel().getOnlineTime()
        if (this.receiveitem) {
            this.receiveitem.setData({ bid: _get_time_items[num].items[0][0], num: _get_time_items[num].items[0][1] })
            this.receiveitem.showItemEffect(true, 165, PlayerAction.action, true, 1.2)

            if (online_time >= _get_time_items[num].time) {
                if (this.receivenode.active) {//this.online_gift_node
                    if (this.time_tichet) {
                        gcore.Timer.del(this.time_tichet);
                        this.time_tichet = null;
                    }
                    this.receivename.string = Utils.TI18N("可领取")
                }
            } else {
                this.receiveitem.showItemEffect(false, 165, PlayerAction.action, true)
                let time = _get_time_items[num].time - online_time
                if (this.time_tichet) {
                    gcore.Timer.del(this.time_tichet);
                    this.time_tichet = null;
                }
                this.setLessTime(time)
            }
        }
    },
    setLessTime(less_time) {
        if (less_time > 0) {
            this.setTimeFormatString(less_time)
            if (this.time_tichet == null) {
                this.time_tichet = gcore.Timer.set(function () {
                    less_time = less_time - 1
                    if (less_time < 0) {
                        gcore.Timer.del(this.time_tichet);
                        this.time_tichet = null;
                    } else {
                        this.setTimeFormatString(less_time)
                    }
                }.bind(this), 1000, -1)
            }
        } else {
            this.setTimeFormatString(less_time)
        }
    },
    setTimeFormatString(time) {
        if (time > 0) {
            this.receivename.string = TimeTool.getTimeFormat(time)
        } else {
            this.receivename.string = "";
        }
    },
    // 改变战斗状态
    changeBattleStatus: function (real_combat) {
        this.is_real_combat = real_combat;                          // 是否真假战斗
        // this.left_top.active = this.is_real_combat;
        // this.right_top.active = this.is_real_combat;
        this.collect_container.active = !this.is_real_combat;       // 资源收集 只有假战斗才需要显示
        this.hero_bag_btn.active = !this.is_real_combat;
        if (real_combat == true) {
            this.clearBuffCoolTimer();
            if (this.battle_buff_icon) {
                this.battle_buff_icon.active = false;
            }
            this.clearVipTimer();
            if (this.vip_icon) {
                this.vip_icon.active = false;
            }
            this.hallownode.active = false;              // 真战斗不显示神器
            this.updateBtnLayerStatus(false);
        } else {
            this.updateBattleBuff();
            this.updateHallowSpine();
            this.updateGiveVip();
            this.updateChallengeBossStatus();
            this.updateBtnLayerStatus(this.challenge_condition.status != 1)
        }
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow: function (params) {
        this.is_real_combat = params;   // 是否真假战斗
        // this.left_top.active = this.is_real_combat;
        // this.right_top.active = this.is_real_combat;
        this.collect_container.active = !this.is_real_combat;          // 资源收集 只有假战斗才需要显示
        this.hero_bag_btn.active = !this.is_real_combat;
        this.is_onshow = true;
        this.updateResourceCollect();
        this.updateDramaDropInfo();
        this.updateMiniMapInfo();
        this.updateChallengeBossStatus();
        this.updateOnlineGiftInfo()
        // 远航红点
        this.checkVoyageRedStatus();
        this.updatePassRewardRedPoint();

        // 设置图标显示
        this.updateTaskInfo();
        this.updateRankInfo();
        this.updateQingBaoInfo();

        if (this.is_real_combat == false) {
            // 战斗buff,只有假战斗才做
            this.updateBattleBuff();
            // 神器模型
            this.updateHallowSpine();
            //赠送vip
            this.updateGiveVip();
        }

        //快速作战红点
        this.checkQuickRed();

        //开启倒计时特效
        this.lastTimeGoToHandleEffect();
        this.updateEmbattleRedPoint();
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide: function () {
        this.is_onshow = false;
        for (var key in this.fly_item_list) {
            var object = this.fly_item_list[key];
            if (object && object.node) {
                object.node.stopAllActions();
                this.fly_item_pools.put(object.node);
            }
        }
        this.fly_item_list = {};

        this.clearCoolTimer();
        this.clearBuffCoolTimer();
        this.clearVipTimer();

        this.deleteLastTimeHandle();
        window.TASK_TIPS = false;
    },

    // 更新金币收集情况
    updateResourceCollect: function () {
        if (this.is_onshow == false) return;
        var cost_config = Config.dungeon_data.data_drama_const.hangup_revenue;
        var min_config = Config.dungeon_data.data_drama_const.hangup_revenue_small;
        var max_config = Config.dungeon_data.data_drama_const.hangup_revenue_big;
        if (!cost_config || !min_config || !max_config) return;

        var hook_info = this.drama_model.getHookAccumulateInfo();
        if (!hook_info) return;
        var hook_time = hook_info.hook_time || 1;    //挂机时间
        var action = PlayerAction.action;

        if (hook_time >= max_config.val) {
            action = PlayerAction.action_5
        } else if (hook_time >= min_config.val) {
            action = PlayerAction.action_3
        } else if (hook_time >= cost_config.val) {
            action = PlayerAction.action_1
        } else {
            action = PlayerAction.action
        }
        if (this.resources_action != action) {
            this.resources_action = action
            this.changeCollectAction();
        }
        // 挂机时间进度条
        var time_max_config = Config.dungeon_data.data_drama_const.profit_time_max;
        if (time_max_config) {
            this.progress.progress = hook_time / time_max_config.val;
        }
        // 挂机时间显示
        this.time_label.string = TimeTool.getTimeFormatIII(hook_time)
    },

    // 切换
    changeCollectAction: function () {
        if (this.skeletonData == null) {         // 这个时候需要先加载
            var resources_path = PathTool.getSpinePath("E31324");
            this.loadRes(resources_path, function (res_object) {
                this.skeleton.skeletonData = res_object;
                this.skeletonData = res_object;
                this.changeCollectAction();
            }.bind(this))
        } else {
            if (this.resources_action) {
                this.skeleton.setAnimation(0, this.resources_action, true);
            }
        }
    },

    // 收集金币
    touchResourceBox: function () {
        if (!this.skeletonData) return;
        if (this.resources_action == null || this.resources_action == PlayerAction.action) {
            message(Utils.TI18N("需要累积一定收益才可以领取噢!"));
            return;
        }
        if (this.is_in_collect == true) return; // 收集动画过程中 不做处理
        this.is_in_collect = true;
        var requestGetAwardFunc = function () {
            var play_action = PlayerAction.action_2;    // 目标动作
            if (this.resources_action == PlayerAction.action_3) {
                play_action = PlayerAction.action_4;
            } else if (this.resources_action == PlayerAction.action_5) {
                play_action = PlayerAction.action_6;
            }
            this.skeleton.setToSetupPose()
            this.skeleton.setAnimation(0, play_action, false)

            Utils.delayRun(this.collect_container, 1.5, function () {
                this.is_in_collect = false;
                this.drama_controller.requestGetHookTimeAwards();
            }.bind(this));
        }.bind(this);

        var hook_info = this.drama_model.getHookAccumulateInfo();
        var cur_energy = this.role_vo.energy;
        var max_energy = this.role_vo.energy_max;
        var qingbao_val = 0;//可领取的请报值
        if (hook_info && hook_info.list) {
            for (let index = 0; index < hook_info.list.length; index++) {
                const element = hook_info.list[index];
                if (element.bid == Config.item_data.data_assets_label2id.energy) {
                    qingbao_val = element.num;
                    break;
                }
            }
        }
        if (cur_energy + qingbao_val > max_energy) {
            var call_back = function () {
                requestGetAwardFunc();
            }.bind(this);
            var cancel_callback = function () {
                this.is_in_collect = false;
            }.bind(this);
            var CommonAlert = require("commonalert");
            var str = cc.js.formatStr(Utils.TI18N("当前已有%d/%d远航情报，领取后超出上限部分将损失，是否确认领取？"), cur_energy, max_energy)
            CommonAlert.show(str, Utils.TI18N("确定"), call_back, Utils.TI18N("取消"), cancel_callback, null, cancel_callback);
        } else {
            requestGetAwardFunc();
        }
    },

    // 更新副本掉落物品展示信息
    updateDramaDropInfo: function () {
        if (!this.is_onshow) return;
        var drama_data = this.drama_model.getDramaData();
        if (!drama_data) return;
        if (this.cur_drama_max_id == drama_data.max_dun_id) return;
        this.cur_drama_max_id = drama_data.max_dun_id;
        if (this.cur_drama_max_id == 0) {
            this.cur_drama_max_id = 10010;
        }
        var drama_config = Config.dungeon_data.data_drama_dungeon_info[this.cur_drama_max_id];
        if (!drama_config) return;
        var item_datas = drama_config.hook_show_items;
        var scale = 0.75;
        var space_x = 10;
        var start_x = 5 + 60 * scale;
        var total_width = item_datas.length * 120 * scale + (item_datas.length - 1) * space_x;
        var max_width = Math.max(this.scrollview_content.width, total_width);
        this.scrollview_content.width = max_width;

        // 创建物品显示对象
        for (let index = 0; index < item_datas.length; index++) {
            const element = item_datas[index];
            var item = this.createDramaDropItem(index, scale, space_x, start_x);
            if (item) {
                item.setData({ bid: element[0], num: element[1] });
            }
        }
        this.updatePerHookInfo(drama_config);
    },

    // 小地图图片和名字宣誓,以及小地图位置,小地图是要判断当前 dun_id
    updateMiniMapInfo: function () {
        var drama_data = this.drama_model.getDramaData();
        if (!drama_data) return;
        if (this.cur_drama_dun_id == drama_data.dun_id) return;
        this.cur_drama_dun_id = drama_data.dun_id;

        var drama_config = Config.dungeon_data.data_drama_dungeon_info[drama_data.dun_id];
        if (!drama_config) return;
        this.mapname.string = drama_config.name;    // 名字

        this.cur_chapter_id = drama_data.chapter_id;
        // 取出地图id
        var world_config = Config.dungeon_data.data_drama_world_info[drama_data.mode];
        if (world_config && world_config[drama_data.chapter_id]) {
            var map_id = world_config[drama_data.chapter_id].map_id;
            if (this.minimap_id != map_id) {
                this.minimap_id = map_id;
                var map_res = PathTool.getBattleSceneRes(cc.js.formatStr("%s/blayer/small_map", map_id), true);
                this.loadRes(map_res, function (mapimg, res_object) {
                    mapimg.spriteFrame = res_object;
                    this.updateMiniIconPosition();
                }.bind(this, this.minimap_img))
            } else {
                this.updateMiniIconPosition();
            }
        }
    },

    updateMiniIconPosition: function () {
        if (!this.minimap_img) return;
        var drama_data = this.drama_model.getDramaData();
        if (!drama_data) return;
        var info_config = Config.dungeon_data.data_drama_dungeon_info[drama_data.dun_id];
        if (!info_config || !info_config.pos) return;
        var img_width = this.minimap_img.node.width;         // 遮罩小地图的宽
        var img_height = this.minimap_img.node.height;       // 遮罩小地图的高
        var node_width = this.minimap_mark.width;            // 遮罩节点
        var node_height = this.minimap_mark.height;
        var pos_x = info_config.pos[0] * img_width / 1024;
        var pos_y = info_config.pos[1] * img_height / 1024;
        this.miniicon.x = pos_x;
        this.miniicon.y = pos_y;
        pos_x = - pos_x + node_width * 0.5;
        pos_y = - pos_y + node_height * 0.5;
        if (pos_x > 0) {
            pos_x = 0
        } else if (pos_x < (node_width - img_width)) {
            pos_x = node_width - img_width
        }
        if (pos_y > 0) {
            pos_y = 0
        } else if (pos_y < (node_height - img_height)) {
            pos_y = node_height - img_height
        }
        this.minimap_img.node.x = pos_x;
        this.minimap_img.node.y = pos_y;
    },

    // 掉落资产信息展示
    updatePerHookInfo: function (config) {
        if (!config) return;
        var item_datas = config.per_hook_items;
        for (var key in this.reward_layout_list) {
            var object = this.reward_layout_list[key];
            if (object && object.layout) {
                object.layout.active = false;
            }
        }
        for (let index = 0; index < item_datas.length; index++) {
            const element = item_datas[index];
            var object = this.reward_layout_list[index];
            if (object && object.layout && element) {
                var bid = element[0];
                var num = element[1];
                var item_config = Utils.getItemConfig(bid);
                if (item_config) {
                    object.layout.active = true;
                    var target_icon = PathTool.getItemRes(item_config.icon);
                    if (object.path != target_icon) {
                        object.path = target_icon;
                        this.loadRes(target_icon, function (icon, res_object) {
                            icon.spriteFrame = res_object;
                        }.bind(this, object.icon))
                    }
                    object.label.string = num + "/m";
                }
            }
        }
    },

    // 挑战boss状态,可能冷却中,也可能进入下一章节
    updateChallengeBossStatus: function () {
        if (!this.is_onshow) return;
        var drama_data = this.drama_model.getDramaData();
        if (!drama_data) return;
        var cur_key = Utils.getNorKey(drama_data.cool_time, drama_data.status);
        if (this.drama_cur_status == cur_key) return;
        this.drama_cur_status = cur_key;

        var cur_drama_max_id = drama_data.max_dun_id || 10010;
        var drama_config = Config.dungeon_data.data_drama_dungeon_info[cur_drama_max_id];
        if (!drama_config) return;

        this.challenge_cool_time = 0;   // 可挑战时间
        this.challenge_condition.status = 0;
        this.challenge_condition.lev = 0;
        this.clearCoolTimer();

        if (!drama_config || drama_config.next_id == 0) {
            this.challenge_boss_btn.active = false;
            this.next_battle_time.active = false
            return;
        }
        if (drama_data.status == 2 && drama_data.cool_time == 0) {                 // 可挑战
            this.challenge_boss_btn.active = true;
            this.next_battle_time.active = false;
            this.challenge_condition.status = 2;                            // 记录状态
            // 这里需要判断当前等级和需求等级
            var config = Config.dungeon_data.data_drama_dungeon_info[drama_data.dun_id];        // 取出当前副本配置数据
            if (config) {
                if (config.lev_limit <= this.role_vo.lev) {
                    this.notice_label.string = "";
                    this.challenge_item.active = true;
                } else {  // 等级不足
                    this.notice_label.string = cc.js.formatStr(Utils.TI18N("%s级可挑战"), config.lev_limit)
                    this.challenge_item.active = false;

                    this.challenge_condition.lev = config.lev_limit;        // 保存需要挑战的等级
                }
            }
        } else if (drama_data.status == 1 && drama_data.cool_time != 0) {      // 冷却中
            this.challenge_condition.status = 1;                            // 记录状态
            this.challenge_boss_btn.active = false;
            this.next_battle_time.active = true;
            this.challenge_cool_time = drama_data.cool_time;
            this.next_label.string = TimeTool.getMinSecTime(this.challenge_cool_time - gcore.SmartSocket.getTime());
            this.startCoolTimer();
        } else if (drama_data.status == 3) {                                   // 已通过,前往下一章
            this.challenge_condition.status = 3;                            // 记录状态
            this.challenge_boss_btn.active = true;
            this.next_battle_time.active = false;                           // 冷却倒计时
            this.challenge_item.active = false;                             // 隐藏掉挑战BOSS
            this.notice_label.string = Utils.TI18N("前往下一章");             // 显示前往下一章
        }

        this.updateBtnLayerStatus(this.challenge_condition.status != 1)
    },

    // 等级提升的时候,如果当前挑战BOSS处于等级限制状态下,才需要判断
    updateRoleLevInfo: function () {
        if (this.challenge_condition && this.challenge_condition.lev == 0) return;
        if (!this.role_vo) return;
        if (this.role_vo.lev >= this.challenge_condition.lev) {
            this.challenge_condition.lev = 0;
            this.challenge_item.active = true;
            this.notice_label.string = "";
        }
    },

    // 开启定时器
    startCoolTimer: function () {
        if (this.time_ticker == null) {
            this.time_ticker = gcore.Timer.set(function () {
                this.countDownCoolTimer();
            }.bind(this), 1000, -1);
        }
    },

    // 清除面板所属唯一定时器
    clearCoolTimer: function () {
        if (this.time_ticker) {
            gcore.Timer.del(this.time_ticker);
            this.time_ticker = null;
        }
    },

    // 开始倒计时
    countDownCoolTimer: function () {
        var less_time = this.challenge_cool_time - gcore.SmartSocket.getTime();
        if (less_time < 0) {
            less_time = 0;
            this.clearCoolTimer();
        }
        this.next_label.string = TimeTool.getMinSecTime(less_time);
    },

    // 创建单个物品
    createDramaDropItem: function (index, scale, space_x, start_x) {
        var item = this.drop_item_list[index];
        if (item == null) {
            var _x = start_x + index * (120 * scale + space_x)
            item = ItemsPool.getInstance().getItem("backpack_item");
            item.setParent(this.scrollview_content);
            item.initConfig(null, scale, false, true);
            item.setPosition(_x, 0);
            item.show();
            this.drop_item_list[index] = item;
        }
        return item;
    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete: function () {
        if (this.drop_item_list) {
            for (var key in this.drop_item_list) {
                var item = this.drop_item_list[key];
                if (item) {
                    item.deleteMe();
                }
            }
            this.drop_item_list = null;
        }
        this.clearCoolTimer();
        this.clearBuffCoolTimer();
        this.clearVipTimer();
        // this.handleEffect(false);

        if (this.role_vo && this.role_update_event) {
            this.role_vo.unbind(this.role_update_event);
            this.role_update_event = null;
            this.role_vo = null;
        }

        if (this.task_vo && this.update_task_event) {
            this.task_vo.unbind(this.update_task_event)
            this.update_task_event = null;
            this.task_vo = null;
        }

        if (this.receiveitem) {
            this.receiveitem.deleteMe()
            this.receiveitem = null;
        }
        if (this.update_online_get_event) {
            gcore.GlobalEvent.unbind(this.update_online_get_event)
            this.update_online_get_event = null
        }
        if (this.time_tichet) {
            gcore.Timer.del(this.time_tichet);
            this.time_tichet = null;
        }
        this.left_btn_list = {};

    },

    // 点击挑战BOSS
    touchChallengeBoss: function () {
        this.deleteLastTimeHandle();


        // if(window.TASK_TIPS)
        // gcore.GlobalEvent.fire(GuideEvent.TaskNextStep,"guildsign_battle_boss_btn");//任务引导用到

        if (this.battle_model.isInRealBattle() == true) {
            message(Utils.TI18N("当前正在战斗中"));
            return
        }
        if (this.challenge_condition.status == 3) {           //前往下一章
            this.drama_controller.send13002();
        } else if (this.challenge_condition.status == 2) {     // 可挑战
            if (this.challenge_condition.lev != 0) {          // 等级限制
                message(Utils.TI18N("等级不足"));
            } else {
                var HeroController = require("hero_controller");
                let arr = Config.dungeon_data.data_drama_const["boss_no_windows"].val;
                // let arr = [10010, 10170]
                var drama_data = this.drama_model.getDramaData();
                if (drama_data.dun_id >= arr[0] && drama_data.dun_id <= arr[1]) {
                    var BattleDramaController = require("battle_drama_controller");
                    BattleDramaController.getInstance().send13003(0);
                } else {
                    HeroController.getInstance().openFormGoFightPanel(true);
                }
            }
        }

    },

    // 更新排行榜和日常任务图标位置
    updateRankTaskPos: function () {

        if (this.task_vo) {
            this.tasknode.active = true;
        }
        if (this.rank_vo) {
            this.ranknode.active = true;
        }
        this.updateTopBtnPos();
    },

    //更新顶部排行按钮等位置
    updateTopBtnPos: function () {
        if (this.left_btn_list == null || Utils.next(this.left_btn_list) == null) return;
        var btn_list = [];

        for (var i in this.left_btn_list) {
            var v = this.left_btn_list[i];
            if (v.active == true) {
                btn_list.push({ index: i, node: v })
            }
        }

        btn_list.sort(function (a, b) {
            return a.index - b.index;
        });

        for (var j in btn_list) {
            var v = btn_list[j];
            if (v.node) {
                v.node.x = -250 - j * 94;
                v.node.y = -45;
            }
        }
    },

    // 更新任务图标信息
    updateTaskInfo: function () {
        if (this.task_vo) return;       // 如果已经创建过了,就不判断了
        if (this.mainui_controller == null) {
            this.mainui_controller = require("mainui_controller").getInstance();
        }
        var task_vo = this.mainui_controller.getFucntionIconVoById(3);
        if (!task_vo) return;
        this.task_vo = task_vo;
        this.updateRankTaskPos();
        this.updateTaskRedTips();

        if (this.update_task_event == null) {
            this.update_task_event = this.task_vo.bind("FunctionIconVo.UPDATE_SELF_EVENT", function (key) {
                if (key == "tips_status") {
                    this.updateTaskRedTips();
                }
            }.bind(this))
        }
    },

    // 更新任务红点
    updateTaskRedTips: function () {
        if (this.task_vo == null) return;
        var tips_status = this.task_vo.getTipsStatus();
        this.tasktips.active = tips_status;
    },

    // 更新排行榜信息
    updateRankInfo: function () {
        if (this.rank_vo) return;       // 如果已经创建过了,就不判断了
        if (this.mainui_controller == null) {
            this.mainui_controller = require("mainui_controller").getInstance();
        }
        var rank_vo = this.mainui_controller.getFucntionIconVoById(5);
        if (!rank_vo) return;
        this.rank_vo = rank_vo;
        this.updateRankTaskPos();
    },

    // 更新神器
    updateHallowSpine: function () {
        var hallows_model = HallowsController.getInstance().getModel();
        var is_open = HallowsController.getInstance().checkIsOpen();
        if (this.is_real_combat == false && is_open && !hallows_model.checkIsHaveAllHallows()) {
            this.hallownode.active = true;
            var hallows_id = hallows_model.getCurActivityHallowsId();
            if (this.cur_hallows_id != hallows_id) {
                this.cur_hallows_id = hallows_id;
                if (this.hallowspine) {
                    this.hallowspine.setToSetupPose();
                    this.hallowspine.clearTracks();
                }
                var hallows_config = Config.hallows_data.data_base[hallows_id];
                if (hallows_config) {
                    var spine_path = PathTool.getSpinePath(hallows_config.effect);
                    if (this.hallow_spine_path != spine_path) {
                        this.hallow_spine_path = spine_path;
                        this.loadRes(spine_path, function (sp, res_object) {
                            sp.skeletonData = res_object;
                            sp.setAnimation(0, PlayerAction.action_2, true);
                        }.bind(this, this.hallowspine));
                    }
                }
            }
            var hallows_task_list = hallows_model.getHallowsTaskList(this.cur_hallows_id);
            if (hallows_task_list) {
                var max_num = hallows_task_list.length;
                var cur_num = 0;
                for (var i in hallows_task_list) {
                    if (hallows_task_list[i].finish == 2) {
                        cur_num = cur_num + 1;
                    }
                }
                var percent = cur_num / max_num;
                this.hallowprogress.progress = percent;
                this.haolowvalue.string = cur_num + "/" + max_num;
            }
            this.updateHallowsRedStatus();
        } else {
            this.hallownode.active = false;
        }
    },

    //神器红点
    updateHallowsRedStatus: function () {
        var HallowsConst = require("hallows_const");
        var red_status = HallowsController.getInstance().getModel().checkRedIsShowByRedType(HallowsConst.Red_Index.task_award);
        this.hallowstips.active = red_status;
    },

    // 更新情报图标
    updateQingBaoInfo: function () {
        if (!this.role_vo) return;
        var cur_energy = this.role_vo.energy;
        var max_energy = this.role_vo.energy_max;
        this.qingbaovalue.string = cur_energy;
        var per = Math.min(1, Math.max(cur_energy / max_energy))
        this.qingbaoprogress.fillRange = per;
    },

    // 远航更新
    checkVoyageRedStatus: function () {
        var red_status = require("voyage_controller").getInstance().getModel().checkVoyageRedStatus();
        this.qingbaotips.active = red_status;
    },

    //更新通关奖励红点
    updatePassRewardRedPoint: function () {
        var status = this.battle_drama_model.getDramaRewardRedPointInfo();
        this.passtips.active = status;
    },

    // 快速作战的buff
    updateBattleBuff: function () {
        var buff_data = this.drama_model.getBuffData();
        if (buff_data == null || buff_data.buff_list.length == 0) {
            if (this.battle_buff_icon) {
                this.battle_buff_icon.active = false;
            }
            this.clearBuffCoolTimer();
            this.updateBuffAndVipPos();
            return;
        }
        // 只需要取出第一个
        var buff_vo = buff_data.buff_list[0];
        var buff_config = Config.buff_data.data_get_buff_data[buff_vo.bid];
        if (buff_config == null) return;

        if (this.battle_buff_icon == null) {
            this.battle_buff_icon = this.seekChild("battle_buff_icon");
            this.battle_icon = this.seekChild(this.battle_buff_icon, "icon", cc.Sprite);        // buff图标
            this.battle_num_label = this.seekChild(this.battle_buff_icon, "num_label", cc.Label);
            this.battle_desc_label = this.seekChild(this.battle_buff_icon, "desc_label", cc.Label);

            // 因为buff是唯一的,所以图片只要在这里加载就好了
            var buff_icon_path = PathTool.getBuffRes(buff_config.icon);
            this.loadRes(buff_icon_path, function (icon, res_object) {
                icon.spriteFrame = res_object;
            }.bind(this, this.battle_icon))
        }
        this.battle_buff_icon.active = true;
        this.battle_desc_label.string = buff_config.des;
        this.battle_buff_time = buff_vo.end_time - gcore.SmartSocket.getTime();
        this.countDownBuffCoolTimer();
        this.startBuffCoolTimer();
        this.updateBuffAndVipPos();
    },

    // 快速作战的buff时间
    clearBuffCoolTimer: function () {
        if (this.icon_time_ticker) {
            gcore.Timer.del(this.icon_time_ticker);
            this.icon_time_ticker = null;
        }
    },

    // buff倒计时开始
    startBuffCoolTimer: function () {
        if (this.icon_time_ticker == null) {
            this.icon_time_ticker = gcore.Timer.set(function () {
                this.countDownBuffCoolTimer();
            }.bind(this), 1000, -1)
        }
    },

    // 战斗buff倒计时
    countDownBuffCoolTimer: function () {
        if (this.battle_buff_time == null || this.battle_buff_time == 0) {
            this.clearBuffCoolTimer();
            if (this.battle_buff_icon) {
                this.battle_buff_icon.active = false;
            }
            return;
        }
        this.battle_buff_time -= 1;
        this.battle_num_label.string = TimeTool.getTimeMs(this.battle_buff_time);
    },

    // 赠送vip入口
    updateGiveVip: function () {
        var vipGiveInfo = VipController.getInstance().getModel().getGiveVipInfo();
        if (vipGiveInfo == null || vipGiveInfo.state == 1) {
            if (this.vip_icon) {
                this.vip_icon.active = false;
                // this.handleEffect(false);
            }
            this.clearBuffCoolTimer();
            this.updateBuffAndVipPos();
            return;
        }
        if (this.vip_icon == null) {
            this.vip_icon = this.seekChild("vip_icon");
            //this.vip_icon_img = this.seekChild(this.vip_icon, "icon", cc.Sprite);        // vip图标
            this.vip_skete = this.seekChild(this.vip_icon, "skete", sp.Skeleton);
            this.vip_time_bg = this.seekChild(this.vip_icon, "Panel_1");
            this.vip_time_label = this.seekChild(this.vip_icon, "num_label", cc.Label);
            this.vip_desc_label = this.seekChild(this.vip_icon, "desc_label", cc.Label);
            this.vip_tips = this.seekChild(this.vip_icon, "tips");

            
            // this.loadRes(PathTool.getFunctionRes("icon_302"), function (res_object) {
            //   this.vip_icon_img.spriteFrame = res_object;
            // }.bind(this))
            var icon_effect = PathTool.getSpinePath("E31328");
            this.loadRes(icon_effect, function (res_object) {
                this.vip_skete.skeletonData = res_object;
                this.vip_skete.setAnimation(0, PlayerAction.action, true)
            }.bind(this))
            Utils.onTouchEnd(this.vip_icon, function () {
                VipController.getInstance().openVipAwardWindow(true);
            }.bind(this), 1)

            // this.handleEffect(true);
        }
        this.vip_icon.active = true;
        this.vip_desc_label.string = Utils.TI18N("vip免费送");

        this.vip_icon_time = vipGiveInfo.time - gcore.SmartSocket.getTime();
        this.countDownVipTimer();
        this.startVipTimer();
        this.updateBuffAndVipPos();
    },

    // 赠送vip倒计时
    countDownVipTimer: function () {
        if (this.vip_icon_time == null || this.vip_icon_time <= 0) {
            this.clearVipTimer();
            var vipGiveInfo = VipController.getInstance().getModel().getGiveVipInfo();
            if (vipGiveInfo == null || vipGiveInfo.state == 1) {
                if (this.vip_icon) {
                    this.vip_icon.active = false;
                    // this.handleEffect(false);
                }
            }
            this.vip_time_bg.active = false;
            this.vip_time_label.string = "";
            VipController.getInstance().getModel().setGiveVipStatus();
            this.vip_tips.active = VipController.getInstance().getModel().getGiveVipStatus();
            return;
        }
        this.vip_icon_time -= 1;
        this.vip_time_label.string = TimeTool.getTimeMs(this.vip_icon_time, true);
        this.vip_time_bg.active = true;;
    },

    // vip倒计时开始
    startVipTimer: function () {
        if (this.vip_time_ticker == null) {
            this.vip_time_ticker = gcore.Timer.set(function () {
                this.countDownVipTimer();
            }.bind(this), 1000, -1)
        }
    },

    // 赠送vip的buff时间
    clearVipTimer: function () {
        if (this.vip_time_ticker) {
            gcore.Timer.del(this.vip_time_ticker);
            this.vip_time_ticker = null;
        }
    },

    // handleEffect: function (status) {
    //     if (status == false) {
    //         if (this.vip_icon_img) {
    //             this.vip_icon_img.setToSetupPose();
    //             this.vip_icon_img.clearTracks();
    //         }
    //     } else {
    //         if (this.vip_icon_img) {
    //             let effectPath = PathTool.getSpinePath("E31328", "action")
    //             this.loadRes(effectPath, function (res_object) {
    //                 this.vip_icon_img.skeletonData = res_object;
    //                 this.vip_icon_img.setAnimation(0, PlayerAction.action, true)
    //             }.bind(this))
    //         }
    //     }
    // },

    //更新buff和vip按钮位置
    updateBuffAndVipPos: function () {
        if (this.battle_buff_icon && this.battle_buff_icon.active == true) {
            if (this.vip_icon && this.vip_icon.active == true) {
                this.vip_icon.y = -441;
            }
        } else {
            if (this.vip_icon && this.vip_icon.active == true) {
                this.vip_icon.y = -348;
            }
        }
    },

    // 刷新假战斗掉落图片
    playResourceCollect: function (x, y, pos) {
        if (this.is_real_combat == true) return;
        var init_pos = this.bottom_container.convertToNodeSpaceAR(cc.v2(x, y));
        var target_pos = cc.v2(this.collect_container.x + this.collect_container.width * 0.5, this.collect_container.y + this.collect_container.height * 0.5);

        var sum = Utils.randomNum(10, 11);
        for (let index = 0; index < sum; index++) {
            var _x = (1 - Utils.randomNum(0, 2)) * Utils.randomNum(0, 40) + init_pos.x;         // 初始坐标
            var _y = (1 - Utils.randomNum(0, 2)) * Utils.randomNum(0, 40) + init_pos.y;
            var id = Utils.randomNum(0, 3);
            var node = null;
            if (this.fly_item_pools.size() > 0) {
                node = this.fly_item_pools.get();
            } else {
                node = new cc.Node();
                node.setAnchorPoint(0.5, 0.5);
                node.addComponent(cc.Sprite);
            }
            node.setPosition(_x, _y);
            node.scale = 1;
            this.bottom_container.addChild(node);
            // 设置资源
            var _item_res = PathTool.getUIIconPath("battledrama", "battledrama_resource_" + (id + 1)); // 资源
            this.loadRes(_item_res, function (icon, res_object) {
                icon.spriteFrame = res_object;
            }.bind(this, node.getComponent(cc.Sprite)))

            this.auto_id += 1;         // 创建了一个
            this.fly_item_list[this.auto_id] = { node: node, id: id };      // 这个是为了关闭界面的时候回收动作
            this.flyEnergyToWealth(node, id, target_pos, _x, _y, index, this.auto_id);
        }
    },

    /**
     * 资产物品飞行动作
     * @param {*} node 当前资产节点
     * @param {*} id 对象池下表
     * @param {*} target_pos 目标位置
     * @param {*} x 起始点
     * @param {*} y
     * @param {*} index 这一批里面的第几个物品
     * @param {*} auto_id
     */
    flyEnergyToWealth: function (node, id, target_pos, x, y, index, auto_id) {
        var bezier = [];
        var begin_pos = cc.v2(x, y);
        bezier.push(begin_pos);
        var end_pos = cc.v2(target_pos.x, target_pos.y);
        var min_pos = begin_pos.add(end_pos).mul(0.5);
        var off_x = - 30;
        var off_y = 10;
        if (index % 2 == 0) {
            off_y = Utils.randomNum(100, 150);
            off_x = 30;
        }
        var controller_pos = cc.v2(min_pos.x + off_x, min_pos.y + off_y);
        bezier.push(controller_pos);
        bezier.push(end_pos);
        var delatTimer = cc.delayTime(index * 0.02);
        var bezierTo = cc.bezierTo(1, bezier);
        var call_fun = cc.callFunc(function () {
            this.fly_item_pools.put(node);
            delete this.fly_item_list[auto_id];
        }.bind(this));

        var seq = cc.sequence(bezierTo, call_fun);
        var scale_to = cc.scaleTo(1, 0.2);
        node.runAction(cc.sequence(delatTimer, cc.spawn(scale_to, seq)));
    },
    // --在线奖励创建的底图
    createReceiveIcon(content) {
        let container = new cc.Node()
        container.setContentSize(76, 76)
        container.addComponent(cc.Button)
        let bg = new cc.Node().addComponent(cc.Sprite);
        this.container.addChild(bg.node)
        bg.type = cc.Sprite.Type.SLICED;
        bg.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        this.loadRes(PathTool.getUIIconPath("battledrama", "battledrama_1014"), function (res) {
            bg.spriteFrame = res
        })
        content = content || ""
        let label = Utils.createLabel(18, new cc.Color(0x00, 0xff, 0x00, 0xff), new cc.Color(0, 0, 0, 0xff), 36, -53, content, container, 2, cc.v2(0.5, 0.5))

        container.bg = bg
        container.label = label
        return container
    },

    //更新快速作战红点状态
    checkQuickRed: function () {
        let drama_data = this.drama_model.getDramaData();
        if (drama_data == null) return
        if (this.quick_btn_tips) {
            let limit_dun = Config.dungeon_data.data_drama_const["fast_combat_first"].val;
            let is_open = false;
            if (drama_data.max_dun_id >= limit_dun) {
                is_open = true;
            }
            if (this.quick_battle_status != is_open) {
                this.quick_battle_status = is_open;
                if (is_open) {

                }
            }

            if (this.drama_model.getOpenQuickBattleStatus() == false) {   //有免费次数
                let data = this.drama_model.getQuickData();
                let num = require("backpack_controller").getInstance().getModel().getBackPackItemNumByBid(Config.dungeon_data.data_drama_const["quick_swap_item"].val)
                if (is_open == true) {
                    if (data && data.fast_combat_num == 0 || num > 0) {
                        this.quick_btn_tips.active = true;
                    }
                }
            } else {
                this.quick_btn_tips.active = false;
            }
        }
    },

    //倒计时xS触发手指点击特效(策划配置时间)
    lastTimeGoToHandleEffect: function () {
        // if (this.is_onshow == false) return
        // let guide_status = GuideController.getInstance().isInGuide();
        // if (guide_status == true || window.TASK_TIPS) return

        let time = 3000;

        if (this.last_time_handle == null) {
            this.last_time_handle = gcore.Timer.set(function () {
                // if (this.effect_status == true) {
                // if (this.last_time_handle) {
                //     gcore.Timer.del(this.last_time_handle);
                //     this.last_time_handle = null;
                //     cc.log("暂停循环")
                // }
                // return
                // }
                if (this.is_onshow == false) return

                let battle_status = this.battle_model.getFightStatus();
                let guide_status = GuideController.getInstance().isInGuide();
                cc.log("重复检测中", battle_status, guide_status, TASK_TIPS)
                if (battle_status || this.is_onshow == false || window.TASK_TIPS || guide_status == true) {
                    this.deleteLastTimeHandle();
                    return
                }

                // if (guide_status == true || window.TASK_TIPS) return

                if (this.challenge_condition && this.challenge_condition.status != 2) return;
                if (this.effect_status) return
                if (!this.role_vo) return;
                if (this.role_vo.lev >= this.challenge_condition.lev || this.challenge_condition.lev == 0) {
                    cc.log("显示特效", this.effect_status)
                    this.figureHandleEffect(true);
                }
            }.bind(this), time, -1)
        }
    },

    deleteLastTimeHandle: function () {
        if (this.last_time_handle) {
            gcore.Timer.del(this.last_time_handle);
            this.last_time_handle = null;
            this.figureHandleEffect(false);
            cc.log("清楚特效", this.effect_status)
        }
    },

    //手指特效显示
    figureHandleEffect: function (status) {
        if (status == false) {
            if (this.challenge_btn_effect) {
                this.challenge_btn_effect.setToSetupPose();
                this.challenge_btn_effect.clearTracks();
            }
            this.effect_status = false;
        } else {
            if (this.challenge_btn_effect) {
                this.effect_status = true;
                var eff_res = PathTool.getEffectRes(240);
                var eff_path = PathTool.getSpinePath(eff_res);
                this.loadRes(eff_path, function (res_object) {
                    this.challenge_btn_effect.skeletonData = res_object;
                    this.challenge_btn_effect.setAnimation(0, PlayerAction.action_1, true)
                }.bind(this))
            }
        }
    },

    //边框特效显示
    rectHandleEffect: function (status) {
        if (status == false) {
            if (this.challenge_btn_effect_1) {
                this.challenge_btn_effect_1.setToSetupPose();
                this.challenge_btn_effect_1.clearTracks();
            }
            this.effect_status = false;
        } else {
            if (this.challenge_btn_effect_1) {
                var eff_res = PathTool.getEffectRes(107);
                var eff_path = PathTool.getSpinePath(eff_res);
                this.loadRes(eff_path, function (res_object) {
                    this.challenge_btn_effect_1.skeletonData = res_object;
                    this.challenge_btn_effect_1.setAnimation(0, PlayerAction.action, true)
                }.bind(this))
            }
        }
    },

    //更新boss按钮内容
    updateBtnLayerStatus: function (status) {
        this.lastTimeGoToHandleEffect();
        // let battle_status = this.battle_model.getFightStatus();
        // this.challenge_btn_effect_1.node.active = status && !battle_status;
    }
})