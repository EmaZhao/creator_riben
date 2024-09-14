// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-29 11:35:40
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var HeroController = require("hero_controller");
var HeroEvent = require("hero_event");
var BackpackController = require("backpack_controller");
var RoleController = require("role_controller");
var BackPackConst = require("backpack_const");
var GuideEvent = require("guide_event");

var Forge_artifactPanel = cc.Class({
    extends: BasePanel,
    ctor: function() {
        this.prefabPath = PathTool.getPrefabPath("forgehouse", "forge_artifact_panel");
    },

    // 可以初始化声明一些变量的
    initConfig: function() {
        this.artifact_items = {}
        this.com_artifact_id = 0 // 当前合成的符文bid(0为未选择)
        this.chose_item_list = {} // 当前已选择的符文id
        this.is_show_effect = false // 是否正在播放合成特效
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel: function() {

        Utils.getNodeCompByPath("main_container/zhufu_title", this.root_wnd, cc.Label).string = Utils.TI18N("熔炼值");
        Utils.getNodeCompByPath("main_container/tips_txt", this.root_wnd, cc.Label).string = Utils.TI18N("同类低阶符文可合成高阶符文");
        Utils.getNodeCompByPath("main_container/quick_add_btn/label", this.root_wnd, cc.Label).string = Utils.TI18N("一键添加");
        Utils.getNodeCompByPath("main_container/compound_btn/label", this.root_wnd, cc.Label).string = Utils.TI18N("合成");

        this.main_container = this.seekChild("main_container");
        this.skill_btn = this.seekChild("skill_btn");
        this.rate_txt_lb = this.seekChild("rate_txt", cc.Label);
        this.level_txt_lb = this.seekChild("level_txt", cc.Label);
        this.rate_txt_lb.node.active = false;
        this.level_txt_lb.node.active = false;
        this.explain_btn = this.seekChild("explain_btn");
        this.quick_add_btn = this.seekChild("quick_add_btn");
        this.compound_btn = this.seekChild("compound_btn");
        this.image_bg = this.seekChild("image_bg", cc.Sprite);
        this.loadRes(PathTool.getBigBg("bigbg_79"), function(sp) {
            this.image_bg.spriteFrame = sp;
        }.bind(this))

        //消耗材料显示
        this.cost_txt_rt = this.seekChild("cost_txt", cc.RichText);
        //祝福相关
        this.zhufu_txt_lb = this.seekChild("zhufu_txt", cc.Label);
        this.get_zhufu_nd = this.seekChild("get_zhufu");
        this.zhufu_tips_nd = this.seekChild("zhufu_tips");
        this.bg_1 = this.seekChild("bg_1");

        var zhufu_icon_sp = this.seekChild("zhufu_icon", cc.Sprite);
        var gift_cfg = Config.partner_artifact_data.data_artifact_const["change_gift"]
        if (gift_cfg) {
            var bid = gift_cfg.val[0][0];
            if (bid != null) {
                this.loadRes(PathTool.getItemRes(bid), function(bg_sf) {
                    zhufu_icon_sp.spriteFrame = bg_sf;
                }.bind(this));
            }
        }

        this.progress_panel = this.seekChild("progress_panel");
        this.progress_sk = this.seekChild(this.progress_panel, "effect", sp.Skeleton);
        this.progress_pb = this.seekChild("progress_panel", cc.ProgressBar);
        this.handleProgressEffect(true)

        this.pos_node = this.seekChild("pos_node");
        var delayRun = function(i) {
            Utils.delayRun(this.main_container, i * 4 / 60, function() {
                var pos_node = this.seekChild(this.main_container, "pos_node_" + i);
                var item = ItemsPool.getInstance().getItem("backpack_item");
                item.initConfig(false, 1, false, false)
                item.show();
                item.addCallBack(this._onClickItemCallBack.bind(this));
                item.showAddIcon(true);
                item.setIsShowBackground(false);
                item.setParent(pos_node);
                item.parent_node = pos_node;
                this.artifact_items[i] = item;
            }.bind(this))
        }.bind(this)
        for (var i = 1; i <= 5; i++) {
            delayRun(i);
        }

        this.updataZhufuInfo();
        this.root_wnd.task_tips = true;
        gcore.GlobalEvent.fire(GuideEvent.OpenTaskEffect, this.root_wnd);
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function() {
        Utils.onTouchEnd(this.skill_btn, function() {
            HeroController.getInstance().openArtifactSkillWindow(true, 1) //点击技能展示按钮
        }.bind(this), 1)
        Utils.onTouchEnd(this.quick_add_btn, function() {
            this._onClickQuickAddBtn();
        }.bind(this), 1)
        Utils.onTouchEnd(this.compound_btn, function() {
            this._onClickCompoundBtn();
        }.bind(this), 1)
        Utils.onTouchEnd(this.get_zhufu_nd, function() {
            HeroController.getInstance().openArtifactAwardWindow(true) //领取祝福奖励
        }.bind(this), 1)

        this.explain_btn.on(cc.Node.EventType.TOUCH_END, function(event) {
            Utils.playButtonSound(1);
            var pos = event.touch.getLocation();
            require("tips_controller").getInstance().showCommonTips(Config.partner_artifact_data.data_artifact_const.artifact_rule.desc, pos);
        });

        //祝福值更新
        this.addGlobalEvent(HeroEvent.Artifact_Lucky_Event, function() {
                this.updataZhufuInfo();
            }, this)
            //祝福值红点更新
        this.addGlobalEvent(HeroEvent.Artifact_Lucky_Red_Event, function() {
            this.zhufu_tips_nd.active = HeroController.getInstance().getModel().getArtifactLuckyRedStatus();
        }, this)

        //合成操作成功
        this.addGlobalEvent(HeroEvent.Artifact_Compound_Event, function() {
            this.com_artifact_id = 0
            this.chose_item_list = {}
            this.updateChoseArtifactItems();
        }, this)

        //选择符文返回
        this.addGlobalEvent(HeroEvent.Artifact_Chose_Event, function(item_list) {
            this.chose_item_list = item_list
            this.updateChoseArtifactItems();
        }, this)
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow: function(params) {

    },

    _onClickItemCallBack: function() {
        var param = {};
        param.bid = this.com_artifact_id;
        param.max_num = 5;
        param.chose_list = this.chose_item_list || {};
        HeroController.getInstance().openArtifactChoseWindow(true, param);
    },

    //合成成功的特效
    handleComEffect: function(status) {
        if (status == false) {
            if (this.special_sk) {
                this.special_sk.setToSetupPose();
                this.special_sk.clearTracks();
            }
        } else {
            this.is_show_effect = true;
            if (this.pos_node && !this.special_sk) {
                this.special_sk = this.pos_node.getComponent(sp.Skeleton)
                var res = cc.js.formatStr("spine/%s/action.atlas", PathTool.getEffectRes(661))
                this.loadRes(res, function(res_object) {
                    this.special_sk.skeletonData = res_object;
                    this.special_sk.setAnimation(1, PlayerAction.action, false)
                }.bind(this))
                this.special_sk.setCompleteListener(function() {
                    this.requestCompoundArtifact();
                }.bind(this))
            } else if (this.special_sk) {
                this.special_sk.setToSetupPose();
                this.special_sk.setAnimation(1, PlayerAction.action, false)
            }
        }
    },

    //刷新选择的符文
    updateChoseArtifactItems: function() {
        this.com_artifact_id = 0;
        for (var i in this.artifact_items) {
            var id = this.chose_item_list[i - 1];
            const item = this.artifact_items[i];
            if (id != null) {
                var item_data = BackpackController.getInstance().getModel().getBackPackItemById(id);
                if (item_data) {
                    if (this.com_artifact_id == 0) {
                        var artifact_cfg = Config.partner_artifact_data.data_artifact_data[item_data.config.id];
                        this.com_artifact_id = artifact_cfg.com_artifact;
                    }
                    item.setData(item_data);
                    if (!item.chose_effect) {
                        item.chose_effect = item.parent_node.getComponent(sp.Skeleton);
                        var res = cc.js.formatStr("spine/%s/action.atlas", PathTool.getEffectRes(662))
                        this.loadRes(res, function(res_object) {
                            item.chose_effect.skeletonData = res_object;
                            item.chose_effect.setAnimation(1, PlayerAction.action, true)
                        }.bind(this))
                    }
                    item.chose_effect.enabled = true;
                    item.showAddIcon(false);
                } else {
                    item.setData({ undata: true });
                    item.showAddIcon(true);
                    if (item.chose_effect && item.chose_effect.node) {
                        item.chose_effect.enabled = false;
                    }
                }
            } else {
                item.setData({ undata: true });
                item.showAddIcon(true);
                if (item.chose_effect && item.chose_effect.node) {
                    item.chose_effect.enabled = false;
                }
            }
        }

        //目标符文
        if (!this.target_item) {
            this.target_item = ItemsPool.getInstance().getItem("backpack_item");
            this.target_item.initConfig(false, 1, false, true);
            this.target_item.addCallBack(this._onClickTargetCallBack.bind(this));
            this.target_item.show();
            this.target_item.setIsShowBackground(false);
            this.target_item.setParent(this.pos_node);
        }
        if (this.com_artifact_id != 0) {
            this.target_item.setData({ bid: this.com_artifact_id, num: 1 });
            var art_com_cfg = Config.partner_artifact_data.data_artifact_compound[this.com_artifact_id];
            var art_base_cfg = Config.partner_artifact_data.data_artifact_data[this.com_artifact_id];
            var role_vo = RoleController.getInstance().getRoleVo();
            if (art_com_cfg && art_com_cfg[this.chose_item_list.length]) {
                var rate = art_com_cfg[this.chose_item_list.length].rate || 0;
                this.rate_txt_lb.string = Utils.TI18N("成功率") + rate / 10 + "%";
                this.rate_txt_lb.node.color = new cc.Color(0x70, 0xce, 0x32, 0xff);
                this.rate_txt_lb.node.active = true;
                //设置消耗
                this.updateCostInfo(art_com_cfg[this.chose_item_list.length].other_expend);
            } else {
                this.rate_txt_lb.string = Utils.TI18N("需2个同类符文")
                this.rate_txt_lb.node.color = new cc.Color(0xce, 0xa4, 0x78, 0xff);
                this.rate_txt_lb.node.active = true;
                this.cost_txt_rt.node.active = false;
            }
            if (art_base_cfg && art_base_cfg.limit_lv > role_vo.lev) {
                this.level_txt_lb.string = cc.js.formatStr(Utils.TI18N("需达到%d级"), art_base_cfg.limit_lv);
                this.level_txt_lb.node.active = true;
                this.cost_txt_rt.node.active = false;
            } else {
                this.level_txt_lb.node.active = false;
            }
        } else {
            this.target_item.setData({ undata: true });
            this.rate_txt_lb.node.active = false;
            this.level_txt_lb.node.active = false;
            this.cost_txt_rt.node.active = false;
        }
        this.bg_1.width = 0;
        this.bg_1.high = 0;
    },

    updateCostInfo: function(expend) {
        if (expend == null || Utils.next(expend) == null) return
        this.cost_txt_rt.node.active = true;
        var str = "";
        for (var i in expend) {
            var v = expend[i];
            var bid = v[0];
            var num = v[1];
            var item_config = Utils.getItemConfig(bid);
            // if (item_config) {
            //     if (str != "");
            //     str = str + "";
            // }
            str = cc.js.formatStr("%s<img src='%s' scale=0.3 />%s", str, item_config.icon, Utils.getMoneyString(num))
        }
        this.cost_txt_rt.string = str;
        this.loadRes(PathTool.getItemRes(item_config.icon), (function(resObject) {
            this.cost_txt_rt.addSpriteFrame(resObject);
        }).bind(this));
    },

    //祝福值刷新
    updataZhufuInfo: function() {
        var cur_lucky = HeroController.getInstance().getModel().getArtifactLucky();
        var max_lucky = 0;
        var lucky_cfg = Config.partner_artifact_data.data_artifact_const["change_condition"];
        if (lucky_cfg && lucky_cfg.val != null) {
            max_lucky = lucky_cfg.val;
        }
        var percent = cur_lucky / max_lucky;
        this.progress_pb.progress = percent;
        this.zhufu_txt_lb.string = cur_lucky;
        this.zhufu_tips_nd.active = HeroController.getInstance().getModel().getArtifactLuckyRedStatus();

        if (this.progress_sk) {
            var pos_y = percent * 324;
            if (pos_y < 3) {
                pos_y = 3
            }
            this.progress_sk.node.y = pos_y;
        }
    },

    //进度条特效
    handleProgressEffect: function(status) {
        if (status == false) {
            if (this.progress_sk) {
                this.progress_sk.setToSetupPose();
                this.progress_sk.clearTracks();
            }
        } else {
            if (this.progress_sk) {
                var res = cc.js.formatStr("spine/%s/action.atlas", PathTool.getEffectRes(660))
                this.loadRes(res, function(res_object) {
                    this.progress_sk.skeletonData = res_object;
                    this.progress_sk.setAnimation(1, PlayerAction.action, true)
                }.bind(this))
            }
        }
    },

    //点击目标符文
    _onClickTargetCallBack: function() {
        if (this.com_artifact_id != 0) {
            HeroController.getInstance().openArtifactComTipsWindow(true, this.com_artifact_id)
        }
    },

    //一键添加
    _onClickQuickAddBtn: function() {
        var all_item_data = BackpackController.getInstance().getModel().getBackPackItemListByType(BackPackConst.item_type.ARTIFACTCHIPS)
            //按照品质从低到高排序
        all_item_data.sort(Utils.tableLowerSorter(["quality", "id"]));
        for (var i in all_item_data) {
            var v = all_item_data[i];
            var bid = v.config.id;
            var art_base_cfg = Config.partner_artifact_data.data_artifact_data[bid];
            if (art_base_cfg && art_base_cfg.com_artifact != 0) {
                var target_cfg = Config.partner_artifact_data.data_artifact_data[art_base_cfg.com_artifact];
                var have_num = BackpackController.getInstance().getModel().getItemNumByBid(bid);
                //背包中数量满足合成条件
                if (target_cfg && have_num >= target_cfg.limit_num) {
                    var all_use_item = BackpackController.getInstance().getModel().getBackPackItemIdListByBid(bid);
                    all_use_item.sort(function(a, b) {
                        return a - b
                    })
                    this.chose_item_list = [];
                    if (all_use_item.length > 5) {
                        for (var i in all_use_item) {
                            if (i < 5) {
                                this.chose_item_list.push(all_use_item[i]);
                            } else {
                                break
                            }
                        }
                    } else {
                        this.chose_item_list = all_use_item;
                    }
                    break
                }
            }
        }

        if (Utils.next(this.chose_item_list) == null) {
            message(Utils.TI18N("暂无可作为材料的符文"))
        } else {
            this.updateChoseArtifactItems();
        }

        if (window.TASK_TIPS)
            gcore.GlobalEvent.fire(GuideEvent.TaskNextStep, "quick_add_btn"); //任务引导用到
    },

    //合成
    _onClickCompoundBtn: function() {
        if (window.TASK_TIPS)
            gcore.GlobalEvent.fire(GuideEvent.TaskNextStep, "compound_btn"); //任务引导用到

        if (this.is_show_effect == true) return
        if (this.com_artifact_id == 0 || Utils.next(this.chose_item_list) == null) {
            message(Utils.TI18N("请先放入合成材料"))
        } else if (this.chose_item_list.length < 2) {
            message(Utils.TI18N("至少需要放入2个同类符文"))
        } else {
            this.handleComEffect(true)
                // this.requestCompoundArtifact()
        }
    },

    //请求合成协议(特效播放完毕)
    requestCompoundArtifact: function() {
        var expend = [];
        for (var k in this.chose_item_list) {
            var temp = {};
            temp.artifact_id = this.chose_item_list[k];
            expend.push(temp)
        }
        HeroController.getInstance().sender11036(this.com_artifact_id, expend);
        this.is_show_effect = false;
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide: function() {

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete: function() {
        if (this.artifact_items) {
            for (var k in this.artifact_items) {
                if (this.artifact_items[k]) {
                    this.artifact_items[k].deleteMe();
                    this.artifact_items[k] = null;
                }
            }
            this.artifact_items = null;
        }
        this.handleProgressEffect(false)
        this.handleComEffect(false)
        if (this.target_item) {
            this.target_item.deleteMe();
            this.target_item = null;
        }
    },
})