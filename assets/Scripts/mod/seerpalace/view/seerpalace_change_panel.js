// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的 (英雄转换）
// <br/>Create: 2019-03-22 14:37:35
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var SeerpalaceController = require("seerpalace_controller")
var HeroConst = require("hero_const")
var SeerpalaceConst = require("seerpalace_const")
var CommonScrollView = require("common_scrollview");
var SeerpalaceEvent = require("seerpalace_event")
var HeroController = require("hero_controller")
var BaseRole = require("baserole")
var Seerpalace_change_Panel = cc.Class({
    extends: BasePanel,
    ctor: function() {
        var self = this
        this.prefabPath = PathTool.getPrefabPath("seerpalace", "seerpalace_change_panel");
        this.ctrl = SeerpalaceController.getInstance();
        this.model = SeerpalaceController.getInstance().getModel()
        self.camp_list = {}
        self.cur_role_vo = {}
        self.cur_role_item = null
        self.cur_camp_type = HeroConst.CampType.eNone
        self.left_stars_1 = {}
        self.left_stars_2 = {}
        self.right_stars_1 = {}
        self.right_stars_2 = {}
        self.is_first_open = true // 首次打开界面标识
        self.change_partner_id = 0 // 有置换结果但未保存的英雄，0为没有
        self.change_new_partner_bid = 0 // 有置换结果但未保存的新英雄，0为没有
        self.lock_partner_ids = {} // 锁住不能置换的英雄
        self.cancel_partner_id = 0 // 缓存取消保存的英雄id，取消之后要依然选中它
    },

    // 可以初始化声明一些变量的
    initConfig: function() {

    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel: function() {

        Utils.getNodeCompByPath("main_container/cancel_btn/label", this.root_wnd, cc.Label).string = Utils.TI18N("取消");
        Utils.getNodeCompByPath("main_container/save_btn/label", this.root_wnd, cc.Label).string = Utils.TI18N("保存");
        var self = this
        let main_container = self.root_wnd.getChildByName("main_container")
        self.change_btn = main_container.getChildByName("change_btn")
        self.change_btn.active = false

        self.cancel_btn = main_container.getChildByName("cancel_btn")

        self.cancel_btn.active = false

        self.save_btn = main_container.getChildByName("save_btn")
        self.save_btn.active = false

        self.left_panel = main_container.getChildByName("left_panel")
        self.left_panel.active = false
        self.left_lv_label = this.seekChild("left_lv_label", cc.Label)

        self.right_panel = main_container.getChildByName("right_panel")
        self.right_panel.active = false
        self.right_lv_label = this.seekChild("right_lv_label", cc.Label)

        self.change_lb = this.seekChild("change_label", cc.Label)
        self.left_effect_node = main_container.getChildByName("left_effect_node")
        self.right_effect_node = main_container.getChildByName("right_effect_node")
        self.role_layout = main_container.getChildByName("role_layout")
        self.toggle_nd = this.seekChild("toogle")
        this.left_name_label = this.seekChild("left_name_label", cc.Label)
        this.right_name_label = this.seekChild("right_name_label", cc.Label)
        this.left_item_sp = this.seekChild("left_item", cc.Sprite)
        this.right_item_sp = this.seekChild("right_item", cc.Sprite)
        this.right_name_label_sp = this.seekChild("right_name_label", cc.Sprite)
        let bgSize = self.role_layout.getContentSize()
        self.btn_summon_sp = this.seekChild("item", cc.Sprite)
        let scale = 0.9
        let scroll_view_size = cc.size(bgSize.width - 80, 108)
        let setting = {
            item_class: "hero_exhibition_item", //-- 单元类
            start_x: 0, //-- 第一个单元的X起点
            space_x: 15, //-- x方向的间隔
            start_y: 0, //-- 第一个单元的Y起点
            space_y: 0, //-- y方向的间隔
            item_width: 119 * scale, //-- 单元的尺寸width
            item_height: 119 * scale, //-- 单元的尺寸height
            row: 1, //-- 行数，作用于水平滚动类型
            col: 0, //-- 列数，作用于垂直滚动类型
            scale: scale,
        }
        this.role_scrollview = new CommonScrollView();
        this.role_scrollview.createScroll(self.role_layout, cc.v2(40, 128), ScrollViewDir.horizontal, ScrollViewStartPos.top, scroll_view_size, setting, cc.v2(0, 0))
            // this.role_scrollview.setSwallowTouches(false)
        let path = PathTool.getIconPath("item", SeerpalaceConst.Good_XianZhi)
        this.loadRes(path, function(SpriteFrame) {
                this.btn_summon_sp.spriteFrame = SpriteFrame
            }.bind(this))
            // if(this.model.change_info){
            //     self.setData(this.model.change_info)
            // }

    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function() {
        var self = this
        this.change_btn.on("touchend", this._onClickChangeBtn, this)
        this.cancel_btn.on("touchend", this._onClickCancelBtn, this)
        this.save_btn.on("touchend", this._onClickSaveBtn, this)
        this.addGlobalEvent(SeerpalaceEvent.Change_Role_Info_Event, function(data) {
            self.setData(data)
        }.bind(this))
        this.addGlobalEvent(SeerpalaceEvent.Change_Role_Success, function() {
            self.handleRightChangeEffect(true)
        }.bind(this))
        for (let i = 1; i <= 4; ++i) {
            let camp_btn = self.toggle_nd.getChildByName("camp_btn_" + i)
            if (camp_btn) {
                self.camp_list[i] = camp_btn
                camp_btn.on("touchend", function() {
                    this._onClickCampBtn(i)
                    Utils.playButtonSound(3)
                }, this)
            }
        }
        this.ctrl.requestSeerpalaceChangeInfo()
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow: function(params) {

    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide: function() {

    },
    addToParent(status) {
        status = status || false
        if (status) {
            this.show()
        } else {
            this.hide()
        }
        // if (this.is_first_open) {
        //     // -- 初次打开界面时请求置换相关数据
        //     this.ctrl.requestSeerpalaceChangeInfo(  )
        //     this.is_first_open = false
        // }
    },
    // -- 置换
    _onClickChangeBtn() {
        Utils.playButtonSound(1)
        var self = this
        if (self.cur_role_vo && self.cur_role_vo.id) {
            this.ctrl.requestSeerpalaceChangeRole(self.cur_role_vo.id, 1)
        } else {
            message(Utils.TI18N("请先选择一位英雄"))
        }
    },
    // -- 取消
    _onClickCancelBtn() {
        Utils.playButtonSound(1)
        var self = this
        if (self.change_partner_id && self.change_partner_id != 0) {
            self.cancel_partner_id = self.change_partner_id
            this.ctrl.requestSeerpalaceChangeRole(self.change_partner_id, 0)
        }
    },
    // -- 保存
    _onClickSaveBtn() {
        Utils.playButtonSound(1)
        var self = this
        if (self.change_partner_id && self.change_partner_id != 0) {
            this.ctrl.requestSeerpalaceChangeRole(self.change_partner_id, 2)
        }
    },
    setData(data) {
        var self = this
        self.data = data || {}
        self.change_partner_id = data.partner_id || 0
        self.change_new_partner_bid = data.new_partner_bid || 0
        self.lock_partner_ids = data.partner_ids || {}

        self.role_layout.active = (self.change_partner_id == 0)
        self.cancel_btn.active = (self.change_partner_id != 0)
        self.save_btn.active = (self.change_partner_id != 0)
        if (self.change_partner_id == 0) {
            if (!self.cur_index) {
                self.toggle_nd.getChildByName("camp_btn_1").getComponent(cc.Toggle).isChecked = true
                self._onClickCampBtn(1)
            } else {
                self.refreshRoleList()
            }
        } else {
            self.cur_index = null
            self.cur_role_vo = {}
            self.cur_camp_type = HeroConst.CampType.eNone
            if (self.cur_role_item) {
                self.cur_role_item.setSelected(false)
                self.cur_role_item = null
            }
        }
        self.refreshRoleSpine()
    },
    // -- 刷新英雄头像列表
    refreshRoleList() {
        var self = this
        self.cur_role_data = []
        let all_role_list = HeroController.getInstance().getModel().getAllHeroArray()
        let camp_type = HeroConst.CampType.eNone
        if (self.cur_index == SeerpalaceConst.Change_Index_Camp.All) {
            camp_type = HeroConst.CampType.eNone
        } else if (self.cur_index == SeerpalaceConst.Change_Index_Camp.Water) {
            camp_type = HeroConst.CampType.eWater
        } else if (self.cur_index == SeerpalaceConst.Change_Index_Camp.Fire) {
            camp_type = HeroConst.CampType.eFire
        } else if (self.cur_index == SeerpalaceConst.Change_Index_Camp.Wind) {
            camp_type = HeroConst.CampType.eWind
        }
        self.cur_camp_type = camp_type

        for (let k in all_role_list || {}) { // k,role_vo in pairs(all_role_list.items or {}) do
            let role_vo = all_role_list[k]
            if (role_vo.star == 4 || role_vo.star == 5) {
                let is_lock = self.checkIsLockedRole(role_vo.id)
                if (camp_type == HeroConst.CampType.eNone) {
                    if (role_vo.camp_type == HeroConst.CampType.eWater ||
                        role_vo.camp_type == HeroConst.CampType.eFire ||
                        role_vo.camp_type == HeroConst.CampType.eWind) {
                        let role_data = Utils.deepCopy(role_vo)
                        role_data.is_locked = is_lock
                        self.cur_role_data.push(role_data)
                            // table_insert(self.cur_role_data, role_data)
                    }
                } else if (role_vo.camp_type == camp_type) {
                    let role_data = Utils.deepCopy(role_vo)
                    role_data.is_locked = is_lock
                    self.cur_role_data.push(role_data)
                        // table_insert(self.cur_role_data, role_data)
                }

            }
        }
        this.cur_role_data.sort(function(objA, objB) {
            let is_lock_a = self.checkIsLockedRole(objA.id)
            let is_lock_b = self.checkIsLockedRole(objB.id)
            if (is_lock_a && !is_lock_b) {
                return 1
            } else if (!is_lock_a && is_lock_b) {
                return -1
            } else if (objA.star == objB.star) {
                if (objA.camp_type == objB.camp_type) {
                    return objB.lev - objA.lev
                } else {
                    return objB.camp_type - objA.camp_type
                }
            } else {
                return objB.star - objA.star
            }
        })

        if (self.cur_role_item) {
            self.cur_role_item.setSelected(false)
        }
        let extendData = { scale: 0.85, can_click: true, from_type: HeroConst.ExhibitionItemType.eHeroChange }
        self.role_scrollview.setData(self.cur_role_data, function(cell) {
            this._onClickPartner(cell)
        }.bind(this), extendData)
        self.role_scrollview.addEndCallBack(function() {
            if (self.cur_role_vo && Utils.next(self.cur_role_vo) && self.cur_camp_type != null) {
                // -- 记录了上一次选中英雄的数据，切换到全部或该英雄阵营时，该英雄继续为选中状态
                if (self.cur_role_vo.camp_type == self.cur_camp_type || self.cur_camp_type == HeroConst.CampType.eNone) {
                    let list = self.role_scrollview.getItemList()
                    for (let k = 0; k < list.length; ++k) {
                        let v = list[k]
                        let data = v.getData()
                        if (data.id == self.cur_role_vo.id) {
                            self._onClickPartner(v)
                            break
                        }
                    }
                }
            } else if (self.cancel_partner_id && self.cancel_partner_id != 0) { //--选中取消置换的英雄
                let list = self.role_scrollview.getItemList()
                for (let k = 0; k < list.length; ++k) {
                    let v = list[k]
                    let data = v.getData()
                    if (data.id == self.cancel_partner_id) {
                        self._onClickPartner(v)
                        self.role_scrollview.jumpToMove(cc.v2(-(k - 3) * (0.85 * 119 + 15), 0), 0.01)
                        break
                    }
                }
                self.cancel_partner_id = 0
            }
        }.bind(this))
    },
    _onClickPartner(item) {
        var self = this
        let vo = item.getData()
        if (vo.checkHeroLockTips(true)) {
            return
        }
        if (self.cur_role_item) {
            self.cur_role_item.setSelected(false)
        }
        item.setSelected(true)
        self.cur_role_item = item
        self.cur_role_vo = vo

        let role_star = vo.star
        let label_str = ""
        let cost_config = Config.recruit_high_data.data_seerpalace_const["hero_change" + role_star]
        if (cost_config && cost_config.val) {
            let bid = cost_config.val[0][0]
            let num = cost_config.val[0][1]
            let item_config = Utils.getItemConfig(bid)
            if (item_config) {
                label_str = num + " " +Utils.TI18N("置换")
            }
        }
        self.change_lb.string = label_str
        self.refreshRoleSpine()
    },
    // -- 刷新英雄模型显示
    refreshRoleSpine() {
        var self = this
            // if (self.left_role){
            //     self.left_role.deleteMe()
            //     self.left_role = null
            // }

        // if (self.right_role) {
        //     self.right_role.deleteMe()
        //     self.right_role = null
        // }

        // -- 选中了某一个英雄或者有未保存的重置英雄
        if (self.cur_role_vo && Utils.next(self.cur_role_vo) || self.change_partner_id != 0) {
            let left_role_vo = {} //-- 左侧英雄的数据
            if (self.change_partner_id == 0) {
                left_role_vo = self.cur_role_vo
                self.change_btn.active = true
                self.handleRightRandomEffect(true)
            } else {
                left_role_vo = HeroController.getInstance().getModel().getHeroById(self.change_partner_id)
                self.change_btn.active = false
                self.handleRightRandomEffect(false)
            }
            if (left_role_vo && (Utils.next(left_role_vo) || Utils.next(left_role_vo) == 0)) {
                if (self.left_role == null) {
                    self.left_role = new BaseRole()
                    self.left_role.setParent(self.left_panel)
                    self.left_role.node.setPosition(cc.v2(100, 40))
                }
                self.left_role.setData(BaseRole.type.partner, left_role_vo, PlayerAction.show, true, 0.72);

                let type_res = PathTool.getHeroCampRes(left_role_vo.camp_type)
                let path = PathTool.getUIIconPath("common", type_res)
                self.right_item_sp.spriteFrame = null;
                this.loadRes(path, function(SpriteFrame) {
                    self.left_item_sp.spriteFrame = SpriteFrame
                    self.right_item_sp.spriteFrame = SpriteFrame
                }.bind(this))
                self.left_name_label.string = left_role_vo.name
                self.left_lv_label.string = left_role_vo.lev
                self.right_lv_label.string = left_role_vo.lev
                let right_name = "????"
                if (self.change_new_partner_bid != 0) {
                    let base_config = Config.partner_data.data_partner_base[self.change_new_partner_bid]
                    let right_role_data = { bid: self.change_new_partner_bid, star: left_role_vo.star }
                    if (self.right_role == null) {
                        self.right_role = new BaseRole()
                        self.right_role.setParent(self.right_panel)
                        self.right_role.node.setPosition(cc.v2(100, 40))
                    }
                    self.right_role.node.active = true;
                    self.right_role.setData(BaseRole.type.partner, right_role_data, PlayerAction.show, true, 0.72)
                    if (base_config && base_config.name) {
                        right_name = base_config.name
                    }
                } else {
                    right_name = "????"
                    if (self.right_role) {
                        self.right_role.node.active = false;
                    }
                }
                self.right_name_label.string = right_name

                for (let i in self.left_stars_1) {
                    let star = self.left_stars_1[i].node
                    star.active = false
                }
                for (let i in self.left_stars_2) {
                    let star = self.left_stars_2[i].node
                    star.active = false
                }
                for (let i in self.right_stars_1) {
                    let star = self.right_stars_1[i].node
                    star.active = false
                }
                for (let i in self.right_stars_2) {
                    let star = self.right_stars_2[i].node
                    star.active = false
                }
                if (self.left_star10) {
                    self.left_star10.node.active = false
                }
                if (self.right_star10) {
                    self.right_star10.node.active = false
                }

                let role_star = left_role_vo.star
                let _cStar = function(star_count, res, star_list, parent_node) {
                    let star_pos = SeerpalaceConst.Change_Pos_X[star_count] || {}
                    for (let i = 0; i < star_count; ++i) {
                        if (!star_list[i]) {
                            let star = Utils.createImage(parent_node, res, 0, 338, cc.v2(0.5, 0.5), true)
                            self.loadRes(res, function(SpriteFrame) {
                                star.spriteFrame = SpriteFrame
                            }.bind(this))
                            star_list[i] = star
                        }
                        star_list[i].node.active = true
                        let pos_x = star_pos[i]
                        if (pos_x) {
                            star_list[i].node.x = pos_x
                        }
                    }
                }

                if (role_star > 0 && role_star <= 5) {
                    let res = PathTool.getUIIconPath("common", "common_90074")
                    _cStar(role_star, res, self.left_stars_1, self.left_panel)
                    _cStar(role_star, res, self.right_stars_1, self.right_panel)
                } else if (role_star >= 6 && role_star <= 9) {
                    let res = PathTool.getUIIconPath("common", "common_90075")
                    let count = role_star - 5
                    _cStar(count, res, self.left_stars_2, self.left_panel)
                    _cStar(count, res, self.right_stars_2, self.right_panel)
                } else if (role_star >= 10) {
                    let res = PathTool.getUIIconPath("common", "common_90073")
                    if (!self.left_star10) {
                        self.left_star10 = Utils.createImage(self.left_panel, res, 100, 338, cc.v2(0.5, 0.5), true, 0, false)
                        self.left_star10.setScale(1.2)
                    } else {
                        self.left_star10.node.active = true
                    }

                    if (!self.right_star10) {
                        self.right_star10 = Utils.createImage(self.right_panel, res, 100, 338, cc.v2(0.5, 0.5), true, 0, false)
                        self.right_star10.setScale(1.2)
                    } else {
                        self.right_star10.node.active = true
                    }
                }
            }

            self.left_panel.active = true
            self.right_panel.active = true
            self.handleLeftEmptyEffect(false)
        } else {
            self.left_panel.active = false
            self.right_panel.active = false
            self.change_btn.active = false
            self.handleLeftEmptyEffect(true)
            self.handleRightRandomEffect(false)
        }
    },
    _onClickCampBtn(index) {
        var self = this
        if (self.cur_index == index) return

        if (self.cur_index) {
            let old_camp_data = self.camp_list[self.cur_index]
            if (old_camp_data && old_camp_data.select_image) {
                old_camp_data.select_image.active = false
            }
        }

        let cur_camp_data = self.camp_list[index]
        if (cur_camp_data && cur_camp_data.select_image) {
            cur_camp_data.select_image.active = true
        }

        self.cur_index = index
        self.refreshRoleList()
    },
    // -- 判断是否为锁住的英雄
    checkIsLockedRole(id) {
        var self = this
        let is_locked = false
        for (let i in self.lock_partner_ids) { // k,v in pairs(self.lock_partner_ids) do
            let v = self.lock_partner_ids[i]
            if (v.id && v.id == id) {
                is_locked = true
                break
            }
        }
        return is_locked
    },
    // -- 左边为空时播放的特效
    handleLeftEmptyEffect(status) {
        var self = this
        if (status == false) {
            if (self.left_empty_effect) {
                self.left_empty_effect.skeletonData = null
                this.left_empty_effect.setToSetupPose();
                this.left_empty_effect.clearTracks();
                self.left_empty_effect = null
            }
        } else {
            if (this.left_effect_node && !this.left_empty_effect) {
                let path = PathTool.getSpinePath("E24001", "action");
                this.loadRes(path, function(skeleton_data) {
                    this.left_empty_effect = self.left_effect_node.getChildByName("action").getComponent(sp.Skeleton)
                    this.left_empty_effect.skeletonData = skeleton_data;
                    this.left_empty_effect.setAnimation(0, "action", true);
                }.bind(this));
            }
        }
    },
    // -- 右边为随机时的特效
    handleRightRandomEffect(status) {
        var self = this
        if (status == false) {
            if (self.right_random_effect) {
                this.right_random_effect.setToSetupPose();
                this.right_random_effect.clearTracks();
                this.right_random_effect.skeletonData = null;
                self.right_random_effect = null
            }
        } else {
            if (self.right_effect_node && !self.right_random_effect) {
                let path = PathTool.getSpinePath("E24002", "action");
                this.loadRes(path, function(skeleton_data) {
                    this.right_random_effect = self.right_effect_node.getChildByName("action").getComponent(sp.Skeleton)
                    this.right_random_effect.skeletonData = skeleton_data;
                    this.right_random_effect.setAnimation(0, "action", true);
                }.bind(this));
            }
        }
    },
    //-- 右边置换成功的特效
    handleRightChangeEffect(status) {
        Utils.playButtonSound("c_sacrifice");
        var self = this
        if (status == false) {
            if (self.right_change_effect) {
                self.right_change_effect.skeletonData = null;
                this.right_change_effect.setToSetupPose();
                this.right_change_effect.clearTracks();
                self.right_change_effect = null
            }
        } else {
            if (self.right_effect_node && !self.right_change_effect) {
                let path = PathTool.getSpinePath("E24003", "action");
                this.loadRes(path, function(skeleton_data) {
                    self.right_change_effect = self.right_effect_node.getChildByName("action1").getComponent(sp.Skeleton)
                    self.right_change_effect.skeletonData = skeleton_data
                    self.right_change_effect.setAnimation(0, "action", false)
                }.bind(this))
            } else if (self.right_change_effect) {
                self.right_change_effect.setAnimation(0, "action", false)
            }
        }

    },
    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete: function() {
        var self = this
        if (self.role_change_info_event) {
            gcore.GlobalEvent.unbind(self.role_change_info_event)
            self.role_change_info_event = null
        }
        if (self.change_success_event) {
            gcore.GlobalEvent.unbind(self.change_success_event)
            self.change_success_event = null
        }
        if (self.left_role) {
            self.left_role.deleteMe()
            self.left_role = null
        }

        if (self.right_role) {
            self.right_role.deleteMe()
            self.right_role = null
        }

        this.handleRightRandomEffect(false)
        this.handleLeftEmptyEffect(false)
        this.handleRightChangeEffect(false)
    },
})
module.exports = Seerpalace_change_Panel;