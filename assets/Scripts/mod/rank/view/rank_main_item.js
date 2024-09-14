// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     竖版排行榜排行界面item
// <br/>Create: 2019-03-12 14:47:58
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var RankConstant = require("rank_constant");
var PlayerHead = require("playerhead");

var Rank_main_itemPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("rank", "rank_main_item");
    },

    // 可以初始化声明一些变量的
    initConfig: function () {

    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel: function () {
        this.main_panel = this.seekChild("main_panel");


        this.bg_sp = this.seekChild("bg", cc.Sprite);
        this.first_icon_sp = this.seekChild("first_icon", cc.Sprite);
        this.name_lb = this.seekChild("name", cc.Label);
        this.rank_rt = this.seekChild("rank", cc.RichText);
        this.union_icon = this.seekChild("union_icon");
        this.union_icon.active = false;
        this.icon_sp = this.seekChild("icon", cc.Sprite);
        this.icon_sp.node.active = false;
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {
        this.root_wnd.on(cc.Node.EventType.TOUCH_END, function () {
            if (!this.data || Utils.next(this.data) == null) {
                message(Utils.TI18N("暂无排名数据"))
                return
            }
            if (this.call_fun) {
                this.call_fun(this,this.data)
            }
        }, this)
    },

    setData: function (data) {
        this.data = data;
        if (this.root_wnd)
            this.onShow()
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow: function () {
        if (this.data == null) return
        this.showActionIcon(false);
        var data = this.data;
        this.rank_type = this.data.type;

        var res_id = PathTool.getBigBg("txt_cn_rank_" + this.rank_type, null, "rank");
        if (this.item_res_id != res_id) {
            this.item_res_id = res_id;
            this.loadRes(res_id, function (sf_obj) {
                this.bg_sp.spriteFrame = sf_obj;
            }.bind(this))
        }
        if (this.data.val1 != 0) {
            this.first_icon_sp.node.active = true;
            var name = this.data.name;
            if (name == "") {
                name = Utils.TI18N("暂无排名")
            } else {
                if (this.is_cluster == true) {
                    name = Utils.transformNameByServ(this.data.name, this.data.srv_id);
                }
            }
            this.name_lb.string = name;
            this.name_lb.node.setPosition(cc.v2(125, 38));
            if (!this.data || Utils.next(this.data) == null) return
            if (this.rank_type != RankConstant.RankType.union) {
                if (!this.player_head) {
                    this.player_head = new PlayerHead();
                    this.player_head.setParent(this.main_panel);
                    this.player_head.show();
                    this.player_head.setScale(0.6);
                    this.player_head.setPosition(88, 38);
                }

                this.player_head.setHeadRes(this.data.face_id);
                var avatar_bid = this.data.avatar_bid;
                this.player_head.setFrameRes(avatar_bid);
                if (this.union_icon) {
                    this.union_icon.active = false;
                }
                this.player_head.setVisible(true)
            } else {

                this.union_icon.active = true;
                if (this.player_head) {
                    this.player_head.setVisible(false)
                }
            }

            this.icon_sp.node.active = false;
            this.rank_rt.node.x = 327;
            var str = "";
            if (this.rank_type == RankConstant.RankType.arena) {
                var res = PathTool.getItemRes(8);
                var val = this.data.val1 || 0;
                this.loadRes(res, function (sf_obj) {
                    this.icon_sp.spriteFrame = sf_obj;
                }.bind(this))
                this.icon_sp.node.active = true;
                this.icon_sp.node.scale = 0.3;
                this.rank_rt.node.x = 360;
                str = String(val);
            } else if (this.rank_type == RankConstant.RankType.drama) {
                var dungeon_id = this.data.val1 | 0;
                var config = gdata("dungeon_data", "data_drama_dungeon_info", [dungeon_id]);
                if (config) {
                    str = config.name;
                }
            } else if (this.rank_type == RankConstant.RankType.power || this.rank_type == RankConstant.RankType.action_partner || this.rank_type == RankConstant.RankType.colors_tone) {
                var res = PathTool.getCommonIcomPath("common_90001");
                this.loadRes(res, function (sf_obj) {
                    this.icon_sp.spriteFrame = sf_obj;
                }.bind(this))
                this.icon_sp.node.active = true;
                this.icon_sp.node.scale = 0.9;
                this.rank_rt.node.x = 360;
                var val = this.data.val1 || 0;
                str = String(val);
                if (this.rank_type == RankConstant.RankType.action_partner) {
                    this.showActionIcon(true);
                }
            } else if (this.rank_type == RankConstant.RankType.tower) {
                var val = this.data.val1 || 0;
                str = cc.js.formatStr("クリア層数：%s", val);
            } else if (this.rank_type == RankConstant.RankType.union) {
                name = this.data.guild_name || "";
                var val = this.data.val1 || 0;
                str = cc.js.formatStr("総戦力%s", val);
            } else if (this.rank_type == RankConstant.RankType.star_power) {
                var val = this.data.val1 || 0;
                str = cc.js.formatStr("評価：%s", val);
            } else if (this.rank_type == RankConstant.RankType.action_star) {
                var val = this.data.val1 || 0;
                str = cc.js.formatStr("評価：%s", val);
                this.showActionIcon(true)
            } else if (this.rank_type == RankConstant.RankType.action_adventure) {
                var val = this.data.val1 || 0;
                str = cc.js.formatStr("神界探索度：%s", val);
                this.showActionIcon(true)
            } else if (this.rank_type == RankConstant.RankType.hallows_power) {
                var val = this.data.val1 || 0;
                str = cc.js.formatStr("聖器戦力：%s", val);
            }
            this.name_lb.string = name;
            this.name_lb.node.setPosition(cc.v2(125, 55));
            this.rank_rt.string = str;

        } else {
            this.name_lb.string = Utils.TI18N("虚位以待");
            this.name_lb.node.setPosition(cc.v2(25, 35));
            this.rank_rt.string = "";
            this.first_icon_sp.node.active = false;

            if (this.union_icon) {
                this.union_icon.active = false;
            }

            if (this.player_head) {
                this.player_head.setVisible(false)
            }
        }
    },

    setExtendData: function (is_cluster) {
        this.is_cluster = is_cluster;
    },

    //活动标签
    showActionIcon: function (bool) {
        if (bool == false && !this.action_icon) return
        if (!this.action_icon) {
            this.action_icon = this.seekChild("action_icon");
            this.action_label = this.seekChild("action_label");
        }
        this.action_icon.active = bool;
        this.action_label.active = bool;
    },

    clickHandler: function () {
        if (this.call_fun) {
            this.call_fun(this.data)
        }
    },

    addCallBack: function (call_fun) {
        this.call_fun = call_fun;
    },

    setSelectStatus: function (bool) {
        // this.select
    },

    setVisibleStatus: function (bool) {
        this.setVisible(bool)
    },

    getRankIndex: function () {
        return this.rank_type || 1;
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide: function () {

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete: function () {
        if(this.player_head){
            this.player_head.deleteMe();
            this.player_head = null;
        }
    },
})