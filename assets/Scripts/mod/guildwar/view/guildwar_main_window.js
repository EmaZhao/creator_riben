// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     联盟战主界面
// <br/>Create: 2019-05-06 17:57:44
// --------------------------------------------------------------------
var GuildConst = require("guild_const");
var GuildwarConst = require("guildwar_const");
var GuildwarEvent = require("guildwar_event");
var PathTool = require("pathtool");
var TimeTool = require("timetool");
var GuildwarPositionItem = require("guildwar_position_item");

var Guildwar_mainWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("guildwar", "guildwar_main_window");
        this.viewTag = SCENE_TAG.ui;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Full;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig: function () {
        this.ctrl = require("guildwar_controller").getInstance();
        this.model = this.ctrl.getModel();
        this.cur_position_type = GuildwarConst.positions.others; // 当前阵地类型
        this.position_vo_data = {}; // 据点数据
        this.position_stack = [];  // 创建的据点
        this.position_pool = [];    // 缓存池中的据点
        this.position_pos = {};    // 正在显示中的据点
        this.map_bgs = [];       // 地图资源
        this.top3_item_list = {};
        this.color_1 = new cc.Color(0x89, 0xed, 0xff, 0xff);
        this.free_size = cc.size(720, 1280);
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack: function () {
        this.background = this.seekChild("background");
        this.background.scale = FIT_SCALE;
        this.main_container = this.seekChild("main_container");
        this.map_layer = this.seekChild(this.main_container, "map_layer");
        this.show_panel = this.seekChild(this.main_container, "show_panel");
        this.state_panel = this.seekChild(this.main_container, "state_panel");
        this.state_panel.getChildByName("background").scale = FIT_SCALE;
        this.top_panel = this.seekChild(this.main_container, "top_panel");

        this.myguild_container = this.seekChild(this.show_panel, "myguild_container");
        this.enemyguild_container = this.seekChild(this.show_panel, "enemyguild_container");

        this.rank_container = this.seekChild(this.show_panel, "rank_container");
        this.title_container = this.seekChild(this.show_panel, "title_container");
        this.buff_container = this.seekChild(this.show_panel, "buff_container");

        this.battle_list_btn = this.seekChild(this.show_panel, "battle_list_btn");

        this.attk_check_btn = this.seekChild(this.show_panel, "attk_check_btn");

        this.ally_atk_btn = this.seekChild(this.show_panel, "ally_atk_btn");

        this.look_award_btn = this.seekChild(this.show_panel, "look_award_btn");

        this.change_scene_btn = this.seekChild(this.show_panel, "change_scene_btn");
        this.change_scene_btn_lb = this.seekChild(this.change_scene_btn, "label", cc.Label);
        this.change_scene_btn_lb.string = Utils.TI18N("敌方阵地");

        this.award_box_btn = this.seekChild(this.show_panel, "award_box_btn");

        this.clash_list_btn = this.seekChild(this.state_panel, "clash_list_btn");

        this.look_box_btn = this.seekChild(this.state_panel, "look_box_btn");

        this.rank_btn = this.seekChild(this.rank_container, "rank_btn");
        this.close_btn = this.seekChild(this.top_panel, "close_btn");
        this.explain_btn = this.seekChild(this.top_panel, "explain_btn");

        this.time_label_lb = this.seekChild(this.title_container, "time_label", cc.Label);
        this.challenge_label_lb = this.seekChild(this.title_container, "challenge_label", cc.Label);
        this.state_tips_label_lb = this.seekChild(this.state_panel, "state_tips_label", cc.Label);
        this.buff_lv_label_lb = this.seekChild(this.buff_container, "buff_lv_label", cc.Label);
        this.buff_icon_sp = this.seekChild(this.buff_container, "buff_icon", cc.Sprite);
        this.loadRes(PathTool.getIconPath("bufficon", "2"), function (sp) {
            this.buff_icon_sp.spriteFrame = sp;
        }.bind(this))

        this.my_guild_name_lb = this.seekChild(this.myguild_container, "guild_name_label_1", cc.Label);
        this.my_guild_star_lb = this.seekChild(this.myguild_container, "star_label_1", cc.Label);
        this.my_guild_win_nd = this.seekChild(this.myguild_container, "image_win_1");
        this.my_guild_dogfall_nd = this.seekChild(this.myguild_container, "image_dogfall_1");

        this.enemy_guild_name_lb = this.seekChild(this.enemyguild_container, "guild_name_label_2", cc.Label);
        this.enemy_guild_star_lb = this.seekChild(this.enemyguild_container, "star_label_2", cc.Label);
        this.enemy_guild_win_nd = this.seekChild(this.enemyguild_container, "image_win_2");
        this.enemy_guild_dogfall_nd = this.seekChild(this.enemyguild_container, "image_dogfall_2");

        this.map_layer_posX = -360;
        this.map_layer_posY = -640 - 30;
        this.map_size = cc.size(720, 1280 * 6);
        this.map_layer.setContentSize(this.map_size);
        this.map_layer.setPosition(cc.v2(this.map_layer_posX, this.free_size.height - this.map_size.height + this.map_layer_posY));
        this.addMapImage();
        // this.dynamicAddMapImage();

        Utils.getNodeCompByPath("main_container/top_panel/title_label", this.root_wnd, cc.Label).string = Utils.TI18N("公会战");
        //Utils.getNodeCompByPath("main_container/top_panel/close_btn/Label", this.root_wnd, cc.Label).string = Utils.TI18N("退出");
        Utils.getNodeCompByPath("main_container/show_panel/ally_atk_btn/label", this.root_wnd, cc.Label).string = Utils.TI18N("进攻日志");
        Utils.getNodeCompByPath("main_container/show_panel/rank_container/rank_desc_label", this.root_wnd, cc.Label).string = Utils.TI18N("战绩排行榜");
        Utils.getNodeCompByPath("main_container/show_panel/buff_container/tips_label_1", this.root_wnd, cc.Label).string = Utils.TI18N("挑战据点废墟可激活或提升全公会增益");
        Utils.getNodeCompByPath("main_container/show_panel/battle_list_btn/label", this.root_wnd, cc.Label).string = Utils.TI18N("对阵列表");
        Utils.getNodeCompByPath("main_container/show_panel/attk_check_btn/label", this.root_wnd, cc.Label).string = Utils.TI18N("进攻一览");
        Utils.getNodeCompByPath("main_container/show_panel/look_award_btn/label", this.root_wnd, cc.Label).string = Utils.TI18N("战绩奖励");
        Utils.getNodeCompByPath("main_container/show_panel/award_box_btn/label", this.root_wnd, cc.Label).string = Utils.TI18N("胜利宝箱");
        Utils.getNodeCompByPath("main_container/state_panel/look_box_btn/label", this.root_wnd, cc.Label).string = Utils.TI18N("战果宝箱");
        Utils.getNodeCompByPath("main_container/state_panel/clash_list_btn/Label", this.root_wnd, cc.Label).string = Utils.TI18N("对阵列表");
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {
        //联盟战状态变化
        this.addGlobalEvent(GuildwarEvent.UpdateGuildWarStatusEvent, function (status, flag) {
            //状态从开战前到开战后，这时请求数据
            if (this.guildwar_status <= 3 && status > 3 && flag == 1) {
                this.ctrl.requestGuildWarData();
            }
            if (status <= 3) {        //状态变更为开战前的界面时，关闭只有开战时才能打开的界面
                this.ctrl.openAttkLookWindow(false);
                this.ctrl.openAttkPositionWindow(false);
                this.ctrl.openGuildWarAwardWindow(false);
                this.ctrl.openBattleLogWindow(false);
                this.ctrl.openDefendLookWindow(false);
                this.ctrl.openGuildWarRankView(false);
            }
            this.refreshGuildWarStatus();
        }, this)

        //详细数据
        this.addGlobalEvent(GuildwarEvent.GuildWarEnemyPositionDataInitEvent, function () {
            this.refreshChallengeCount();
            this.refreshStarAndBuffInfo();
            this.refreshTopThreeRank();
            this.refreshGuildWarPosition();
        }, this)

        //挑战次数更新
        this.addGlobalEvent(GuildwarEvent.UpdateGuildwarChallengeCountEvent, function () {
            this.refreshChallengeCount();
        }, this)

        //基础数据更新
        this.addGlobalEvent(GuildwarEvent.UpdateGuildWarBaseInfoEvent, function () {
            this.refreshTopThreeRank();
            this.refreshStarAndBuffInfo();
        }, this)

        //收到我方据点数据
        this.addGlobalEvent(GuildwarEvent.GetGuildWarMyPositionDataEvent, function () {
            this.refreshGuildWarPosition();
        }, this)

        //红点更新
        this.addGlobalEvent(GuildwarEvent.UpdateGuildWarRedStatusEvent, function (redtype, status) {
            this.updateMainRedStatus(redtype, status);
        }, this)

        Utils.onTouchEnd(this.close_btn, function () {
            this.ctrl.openMainWindow(false);
        }.bind(this), 2)

        Utils.onTouchEnd(this.explain_btn, function () {
            require("mainui_controller").getInstance().openCommonExplainView(true, Config.guild_war_data.data_explain);
        }.bind(this), 1)

        //进攻一览
        Utils.onTouchEnd(this.attk_check_btn, function () {
            this.ctrl.openAttkLookWindow(true);
        }.bind(this), 1)

        //对阵列表
        Utils.onTouchEnd(this.battle_list_btn, function () {
            this.ctrl.openBattleListWindow(true);
        }.bind(this), 1)

        //对阵列表（匹配成功展示界面）
        Utils.onTouchEnd(this.clash_list_btn, function () {
            this.ctrl.openBattleListWindow(true);
            this.model.updateGuildWarRedStatus(GuildConst.red_index.guildwar_match, false);
        }.bind(this), 1)

        //进攻日志
        Utils.onTouchEnd(this.ally_atk_btn, function () {
            this.ctrl.openBattleLogWindow(true);
            this.model.updateGuildWarRedStatus(GuildConst.red_index.guildwar_log, false);
        }.bind(this), 1)

        //战绩奖励
        Utils.onTouchEnd(this.look_award_btn, function () {
            this.ctrl.openGuildWarAwardWindow(true);
        }.bind(this), 1)

        //详细排名
        Utils.onTouchEnd(this.rank_btn, function () {
            this.ctrl.openGuildWarRankView(true);
        }.bind(this), 1)

        //切换阵地
        Utils.onTouchEnd(this.change_scene_btn, function () {
            this.changeGuildwarPositionType();
        }.bind(this), 1)

        //宝箱按钮
        Utils.onTouchEnd(this.award_box_btn, function () {
            this.ctrl.openAwardBoxWindow(true);
        }.bind(this), 1)

        //宝箱按钮
        Utils.onTouchEnd(this.look_box_btn, function () {
            this.ctrl.openAwardBoxWindow(true);
        }.bind(this), 1)

        this.map_layer.on(cc.Node.EventType.TOUCH_START, function (event) {
            this.last_point = null;
            this.is_move_map_layer = true;
            return true
        }, this);

        this.map_layer.on(cc.Node.EventType.TOUCH_MOVE, function (event) {
            var touches = event.getTouches();
            this.last_point = touches[0].getDelta();
            this.moveMapLayer(this.last_point.x, this.last_point.y);
            this.dynamicShowGuildWarPosition();
            this.dynamicAddMapImage();
            // for()
        }, this);

        this.map_layer.on(cc.Node.EventType.TOUCH_END, function (event) {
            this.is_move_map_layer = false;
        }, this);
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd: function () {
        var flag = this.model.getGuildWarEnemyFlag();
        var status = this.model.getGuildWarStatus();

        this.refreshGuildWarStatus();
        this.updateMainRedStatus();

        //打开界面时判断，如果有匹配到对手且状态为开战中或结算，但无缓存数据，则请求数据
        if (flag == 1 && status > GuildwarConst.status.showing && !this.model.checkIsHaveEnemyCacheData()) {
            this.ctrl.requestGuildWarData();
        } else {
            this.refreshGuildWarPosition();
            this.refreshStarAndBuffInfo();
            this.refreshTopThreeRank();
            this.refreshChallengeCount();
        }
    },

    //状态刷新
    refreshGuildWarStatus: function () {
        var status = this.model.getGuildWarStatus();
        var isShowTips = false;
        var tips_str = "";
        this.clash_list_btn.active = false;
        var flag = this.model.getGuildWarEnemyFlag();
        if (status == GuildwarConst.status.close) {
            isShowTips = true;
            tips_str = Utils.TI18N("公会战暂未开始，请在每周一、周三、周六12:00-20:00准时参加哦！（ﾟ∀ﾟ）つ")
            //所有据点都放入缓存池中
            for (var i = this.position_stack.length; i > 0; i--) {
                var item = this.position_stack.pop();
                var pos = item.getPositionPos();
                item.setVisible(false);
                item.suspendAllActions();
                this.position_pool.push(item);
                this.position_pos[pos] = null;
            }
        } else if (status == GuildwarConst.status.matching) {
            isShowTips = true;
            tips_str = Utils.TI18N("正在匹配，请耐心等待");
        } else if (status == GuildwarConst.status.showing) {
            if (flag == 1) {
                tips_str = Utils.TI18N("公会战暂未开始，请在每周一、周三、周六12:00-20:00准时参加哦！（ﾟ∀ﾟ）つ");
            } else {
                tips_str = Utils.TI18N("很遗憾，您的公会在此次公会战中匹配轮空或活跃人数未达标，请期待下次！(つд∩)")
            }
            this.clash_list_btn.active = true;
            isShowTips = true;
        } else if (status == GuildwarConst.status.processing) {
            if (flag == 1) {
                isShowTips = false;
            } else {
                tips_str = Utils.TI18N("很遗憾，您的公会在此次公会战中匹配轮空或活跃人数未达标，请期待下次！(つд∩)");
                isShowTips = true;
                this.clash_list_btn.active = true;
            }
        } else if (status == GuildwarConst.status.settlement) {
            if (flag == 1) {
                isShowTips = false;
            } else {
                tips_str = Utils.TI18N("很遗憾，您的公会在此次公会战中匹配轮空或活跃人数未达标，请期待下次！(つд∩)");
                isShowTips = true;
                this.clash_list_btn.active = true;
            }
        }

        this.guildwar_status = status;
        if (isShowTips) {
            this.state_tips_label_lb.string = tips_str;
        }
        this.show_panel.active = !isShowTips;
        this.state_panel.active = isShowTips;
        this.refreshSurplusTime();
        this.refreshChallengeCount();
    },

    //加载阵地地图资源(只创建3张，动态调整位置重复使用)
    addMapImage: function () {
        for (var i = 1; i < 4; i++) {
            var pos_y = (6 - i) * 1280;
            var map_bg = Utils.createImage(this.map_layer, null, 0, pos_y, cc.v2(0, 0));
            // console.error(map_bg.node.y);
            map_bg.node.active = true;
            this.loadImage(map_bg, PathTool.getUIIconPath("bigbg/guildwar", "guildwar_1"))
            this.map_bgs.push(map_bg);
        }
        
    },

    loadImage: function (image, res) {
        this.loadRes(res, function (sp) {
            image.spriteFrame = sp;
        }.bind(this))
    },

    getTopOrBottomMapBgPosY: function (flag) {
        var value = null;
        for (var k in this.map_bgs) {
            var mapbg = this.map_bgs[k];
            var pos_y = mapbg.node.y;
            value = value || pos_y;
            if (flag == 1 && pos_y > value) {
                value = pos_y;
            } else if (flag == 2 && pos_y < value) {
                value = pos_y;
            }
        }
        return value
    },

    //动态调整地图位置
    dynamicAddMapImage: function () {
        var map_pos_y = this.map_layer.y;
        map_pos_y = Math.abs(map_pos_y);
        var offset_y = 640;
        for (var k in this.map_bgs) {
            var mapbg = this.map_bgs[k];
            var bg_pos_y = mapbg.node.y;
            if ((bg_pos_y + offset_y) < (map_pos_y - 1280)) {
                mapbg.node.y = this.getTopOrBottomMapBgPosY(1) + 1280;
            } else if ((bg_pos_y - offset_y) > (map_pos_y + 1280)) {
                mapbg.node.y = this.getTopOrBottomMapBgPosY(2) - 1280;
            }
        }
    },

    moveMapLayer: function (x, y) {
        x = this.map_layer.x + x;
        y = this.map_layer.y + y;
        var return_pos = this.checkMapLayerPoint(x, y);
        this.map_layer.setPosition(return_pos.x, return_pos.y);
    },

    checkMapLayerPoint: function (_x, _y) {
        var return_pos = cc.v2(_x, _y);
        if (_x > this.map_layer_posX) {
            return_pos.x = this.map_layer_posX;
        } else if (_x < (this.free_size.width - this.map_size.width + this.map_layer_posX)) {
            return_pos.x = this.free_size.width - this.map_size.width + this.map_layer_posX;
        }
        if (_y < (this.free_size.height - this.map_size.height + this.map_layer_posY)) {
            return_pos.y = this.free_size.height - this.map_size.height + this.map_layer_posY;
        } else if (return_pos.y >= this.map_layer_posY) {
            return_pos.y = this.map_layer_posY;
        }
        return return_pos
    },

    //剩余时间显示
    refreshSurplusTime: function () {
        this.surplusTime = this.model.getGuildWarSurplusTime();
        if (this.surplusTime < 0) {
            this.surplusTime = 0;
        }
        this.time_label_lb.string = TimeTool.getTimeFormatDayIIIIIIII(this.surplusTime);
        this.openGuildWarSurplusTimer(true);
    },

    //活动剩余时间倒计时
    openGuildWarSurplusTimer: function (status) {
        if (status == true) {
            if (this.guildwar_timer == null) {
                this.guildwar_timer = gcore.Timer.set(function () {
                    this.surplusTime = this.surplusTime - 1;
                    if (this.surplusTime >= 0) {
                        this.time_label_lb.string = TimeTool.getTimeFormatDayIIIIIIII(this.surplusTime);
                    } else {
                        this.surplusTime = 0;
                        gcore.Timer.del(this.guildwar_timer);
                        this.guildwar_timer = null;
                    }
                }.bind(this), 1000, -1)
            }
        } else {
            if (this.guildwar_timer != null) {
                gcore.Timer.del(this.guildwar_timer);
                this.guildwar_timer = null;
            }
        }
    },

    //剩余次数刷新
    refreshChallengeCount: function () {
        if (this.guildwar_status == GuildwarConst.status.settlement) {
            this.challenge_label_lb.string = Utils.TI18N("后关闭");
        } else {
            var count = this.model.getGuildWarChallengeCount();
            var max_count = Config.guild_war_data.data_const.challange_time_limit.val;
            this.challenge_label_lb.string = cc.js.formatStr(Utils.TI18N("挑战次数:%s/%s"), (max_count - count), max_count);
        }
    },

    //刷新双方星数、结果和buff信息
    refreshStarAndBuffInfo: function () {
        var myGuildData = this.model.getMyGuildWarBaseInfo();
        cc.log(myGuildData)
        this.my_guild_name_lb.string = myGuildData.gname || "";
        this.my_guild_star_lb.string = myGuildData.hp || 0;

        var buff_lev = myGuildData.buff_lev || 0;
        var max_level = Config.guild_war_data.data_buff_length;
        this.buff_lv_label_lb.string = cc.js.formatStr(Utils.TI18N("%s/%s级"), buff_lev, max_level);

        var enemyGuildData = this.model.getEnemyGuildWarBaseInfo();
        this.enemy_guild_name_lb.string = enemyGuildData.gname || "";
        this.enemy_guild_star_lb.string = enemyGuildData.hp || 0;

        var result = this.model.getGuildWarResult();
        this.my_guild_win_nd.active = result == GuildwarConst.result.win;
        this.my_guild_dogfall_nd.active = result == GuildwarConst.result.dogfall;
        this.enemy_guild_win_nd.active = result == GuildwarConst.result.lose;
        this.enemy_guild_dogfall_nd.active = result == GuildwarConst.result.dogfall;
    },

    //刷新前三排名数据
    refreshTopThreeRank: function () {
        var rank_list = this.model.getGuildWarTopThreeRank();
        if (rank_list == null || Utils.next(rank_list) == null) return
        for (var i in rank_list) {
            var v = rank_list[i];
            if (!this.top3_item_list[v.rank]) {
                var item = this.createSingleRankItem(v.rank);
                item.container.setParent(this.rank_container);
                this.top3_item_list[v.rank] = item;
            }
            var item = this.top3_item_list[v.rank];
            if (item) {
                item.container.setPosition(-10, -60 - (v.rank - 1) * item.container.getContentSize().height);
                item.label.string = v.name;
            }
        }
    },

    createSingleRankItem: function (i) {
        var obj = {}
        var container = new cc.Node();
        obj.container = container;
        container.setAnchorPoint(cc.v2(0, 1));
        container.setContentSize(cc.size(180, 40));
        var sp = Utils.createImage(container, null, 0, 0, cc.v2(0, 1));
        this.loadImage(sp, PathTool.getUIIconPath("common", "common_300" + i))
        sp.node.scale = 0.5;
        sp.node.x = 10;
        sp.node.y = 20;
        obj.sp = sp;
        var label = Utils.createLabel(20, this.color_1, null, 60, 20, "", container);
        label.node.setAnchorPoint(0, 1);
        obj.label = label;
        return obj
    },

    //据点
    refreshGuildWarPosition: function () {
        this.position_vo_data = {};
        if (this.guildwar_status == GuildwarConst.status.processing || this.guildwar_status == GuildwarConst.status.settlement) {
            if (this.cur_position_type == GuildwarConst.positions.myself) {
                this.position_vo_data = this.model.getMyGuildWarPositionList();
            } else if (this.cur_position_type == GuildwarConst.positions.others) {
                this.position_vo_data = this.model.getEnemyGuildWarPositionList();
            }
        }
        this.dynamicShowGuildWarPosition();
    },

    //动态加载据点显示
    dynamicShowGuildWarPosition: function () {
        this.checkPositionMoveToPool();
        for (var k in this.position_vo_data) {
            var position_vo = this.position_vo_data[k];
            var pos_data = Config.guild_war_data.data_position[position_vo.pos];
            if (pos_data && !this.position_pos[position_vo.pos] && this.checkPositionIsInDisplayRect(pos_data.pos_x, pos_data.pos_y)) {
                var position_item = this.position_pool.shift();
                if (position_item == null) {
                    position_item = new GuildwarPositionItem();
                    position_item.show();
                    position_item.setParent(this.map_layer);
                }
                position_item.setVisible(true);
                position_item.setData(position_vo, this.cur_position_type);
                position_item.setPosition(pos_data.pos_x, pos_data.pos_y);
                this.position_stack.push(position_item);
                this.position_pos[position_vo.pos] = true;
            }
        }
    },

    //检测已创建的据点是否需要放入缓存池
    checkPositionMoveToPool: function () {
        for (var i = 0; i < this.position_stack.length; i++) {
            var item = this.position_stack[i];
            var pos = item.getPosition();
            if (!this.checkPositionIsInDisplayRect(pos.x, pos.y)) {
                var pos_ = item.getPositionPos();
                item.setVisible(false);
                item.suspendAllActions();
                this.position_pool.push(item);
                this.position_stack.splice(i, 1);
                this.position_pos[pos_] = null;
            }
        }
    },

    //根据据点位置计算是否在显示区域之内
    checkPositionIsInDisplayRect: function (pos_x, pos_y) {
        var isIn = true;
        var item_width = 190;
        var item_height = 226;
        var map_pos = this.map_layer.getPosition();
        var map_pos_x = Math.abs(map_pos.x);
        var map_pos_y = Math.abs(map_pos.y);
        if ((pos_x + item_width / 2) < map_pos_x - 360 || (pos_x - item_width / 2) > (map_pos_x + this.free_size.width-360) || (pos_y + item_height) < map_pos_y - 640 || pos_y > (map_pos_y - 640 + 1280)) {
            isIn = false;
        }
        return isIn
    },

    //切换阵地
    changeGuildwarPositionType: function () {
        this.map_layer.setPosition(cc.v2(this.map_layer_posX, (this.free_size.height - this.map_size.height + this.map_layer_posY)));
        for (var i = 1; i < 4; i++) {
            var pos_y = (6 - i) * 1280;
            var map_bg = this.map_bgs[i-1];
            // console.error(map_bg);
            if (map_bg) {
                map_bg.node.setPosition(cc.v2(0, pos_y));
            }
        }
        //所有据点都放入缓存池中
        for (var i = this.position_stack.length; i > 0; i--) {
            var item = this.position_stack.pop();
            var pos = item.getPositionPos();
            item.setVisible(false);
            item.suspendAllActions();
            this.position_pool.push(item);
            this.position_pos[pos] = null;
        }

        if (this.cur_position_type == GuildwarConst.positions.myself) {
            this.cur_position_type = GuildwarConst.positions.others;
            this.refreshGuildWarPosition();
            this.change_scene_btn_lb.string = Utils.TI18N("敌方阵地");
        } else {
            this.cur_position_type = GuildwarConst.positions.myself;
            this.change_scene_btn_lb.string = Utils.TI18N("我方阵地");
            var myPositionData = this.model.getMyGuildWarPositionList();
            if (Utils.next(myPositionData) == null) {
                this.ctrl.requestMyGuildPositionData();
            } else {
                this.refreshGuildWarPosition();
            }
        }
    },

    updateMainRedStatus: function (redtype, status) {
        if (redtype == GuildConst.red_index.guildwar_match) {
            Utils.addRedPointToNodeByStatus(this.clash_list_btn, status);
        } else if (redtype == GuildConst.red_index.guildwar_log) {
            Utils.addRedPointToNodeByStatus(this.ally_atk_btn, status);
        } else if (redtype == GuildConst.red_index.guildwar_box) {
            Utils.addRedPointToNodeByStatus(this.award_box_btn, status);
            Utils.addRedPointToNodeByStatus(this.look_box_btn, status);
        } else {
            var match_btn_status = this.model.checkRedIsShowByRedType(GuildConst.red_index.guildwar_match);
            Utils.addRedPointToNodeByStatus(this.clash_list_btn, match_btn_status);

            var atk_btn_status = this.model.checkRedIsShowByRedType(GuildConst.red_index.guildwar_log);
            Utils.addRedPointToNodeByStatus(this.ally_atk_btn, atk_btn_status);

            var box_btn_status = this.model.checkRedIsShowByRedType(GuildConst.red_index.guildwar_box);
            Utils.addRedPointToNodeByStatus(this.award_box_btn, box_btn_status);
            Utils.addRedPointToNodeByStatus(this.look_box_btn, box_btn_status);
        }
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack: function () {
        for (var k in this.position_stack) {
            if (this.position_stack[k]) {
                this.position_stack[k].deleteMe();
                this.position_stack[k] = null;
            }
        }
        this.position_stack = null;

        for (var k in this.position_pool) {
            if (this.position_pool[k]) {
                this.position_pool[k].deleteMe();
                this.position_pool[k] = null;
            }
        }
        this.position_pool = null;

        this.openGuildWarSurplusTimer(false);
        this.ctrl.openMainWindow(false);
    },
})