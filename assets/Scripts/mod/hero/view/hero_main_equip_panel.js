// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-02-26 15:50:35
// --------------------------------------------------------------------
var PathTool       = require("pathtool");
var HeroEvent      = require("hero_event");
var TipsConst      = require("tips_const");
var HeroController = require("hero_controller");
var HeroCalculate  = require("hero_calculate");
var HeroConst      = require("hero_const");
var GoodsVo        = require("goods_vo")
var HeroMainEquipPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.rleasePrefab = false;
        this.prefabPath = PathTool.getPrefabPath("hero", "hero_main_tab_equip_panel");

        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();
    },

    // 可以初始化声明一些变量的
    initConfig: function () {
        this.hero_vo = null;

        this.equip_icon_name_list = {
            1: "hero_info_7",
            2: "hero_info_10",
            3: "hero_info_9",
            4: "hero_info_8",
            5: "hero_info_11",
            6: "hero_info_11",
        }

        // 符文解锁条件信息
        var artifact_one = Config.partner_data.data_partner_const["artifact_one"].val;
        var artifact_two = Config.partner_data.data_partner_const["artifact_two"].val;
        this.artifact_lock_list = { "1": artifact_one, "2": artifact_two };
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel: function () {
        this.key_up_btn_nd = this.seekChild("key_up_btn");
        this.btn_red_nd = this.seekChild("btn_red");
        this.discharge_btn_nd = this.seekChild("discharge_btn");
        this.key_up_btn_nd.active = false;
        this.discharge_btn_nd.active = false;
        this.img_lock = {};
        this.lab_lock = {};
        this.img_box = {};
        this.red_box = {};
        this.img_lock[1] = this.seekChild("img_lock5");
        this.img_lock[2] = this.seekChild("img_lock6");
        this.lab_lock[1] = this.seekChild(this.img_lock[1], "lab_lock5", cc.Label);
        this.lab_lock[2] = this.seekChild(this.img_lock[2], "lab_lock6", cc.Label);
        this.img_box[1] = this.seekChild("artifacts_bg_1", cc.Sprite);
        this.img_box[2] = this.seekChild("artifacts_bg_2", cc.Sprite);
        this.red_box[1] = this.seekChild("red_5");
        this.red_box[2] = this.seekChild("red_6");


        this.equip_items = {};
        for (var equip_i = 1; equip_i <= 6; equip_i++) {
            var equip_item = this.equip_items[equip_i] = ItemsPool.getInstance().getItem("backpack_item");
            equip_item.setParent(this.seekChild("equip" + equip_i));
            equip_item.setExtendData({ effect: false, scale: 0.8 });
            equip_item.addCallBack(this.selectEquipByIndex.bind(this, equip_i));
            var empty_icon_path = PathTool.getUIIconPath("hero", this.equip_icon_name_list[equip_i]);
            equip_item.setEmptyIconPath(empty_icon_path);
            equip_item.show();
        }

        this.key_up_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickKeyUpBtn, this);
        this.discharge_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickDischargeBtn, this);

        Utils.getNodeCompByPath("tab_panel/key_up_btn/label", this.root_wnd, cc.Label).string = Utils.TI18N("一键穿戴");
        Utils.getNodeCompByPath("tab_panel/discharge_btn/label", this.root_wnd, cc.Label).string = Utils.TI18N("一键卸下");
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {
        this.addGlobalEvent(HeroEvent.Equip_Update_Event, function(data){
            if (!this.hero_vo) return;
            if(data.partner_id == this.hero_vo.partner_id){
                this.updateHerovo(data);
            }
        }.bind(this))
        this.addGlobalEvent(HeroEvent.Equip_RedPoint_Event,function(){
            if (!this.hero_vo) return
            this.updateRedPoint()
            this.updateOneKeyBtnStatus()
        },this)
        //神器信息
        this.addGlobalEvent(HeroEvent.Artifact_Update_Event, function (data) {
            if (!this.hero_vo) return
            if(data.partner_id == this.hero_vo.partner_id){
                this.updateHerovo(data);
            }
            this.updateArtifactInfo(this.hero_vo)
        }, this)

        this.addGlobalEvent(HeroEvent.Hero_Data_Update, function (hero_vo) {
            if (!this.hero_vo || !hero_vo) return
            if (hero_vo.partner_id == this.hero_vo.partner_id)
                this.updateArtifactInfo(this.hero_vo)
        }, this)
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow: function (params) {
        this.updateWidgets();
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide: function () {

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete: function () {
        for (var item_i in this.equip_items) {
            this.equip_items[item_i].deleteMe();
            this.equip_items[item_i] = null;
        }
        this.equip_items = null;
    },

    updateHerovo: function (hero_vo) {
        if (hero_vo)
            this.hero_vo = hero_vo;
        if (this.root_wnd)
            this.updateWidgets();
    },

    onClickKeyUpBtn: function () {
        Utils.playButtonSound("c_equipment");
        if (this.hero_vo) {
            this.ctrl.sender11010(this.hero_vo.partner_id, 0);
        }
    },
    onClickDischargeBtn(){
        if(!this.hero_vo)  return;
        this.ctrl.sender11011(this.hero_vo.partner_id, 0)
    },
    updateWidgets: function () {
        this.updateHeroInfo();
        this.updateArtifactInfo(this.hero_vo);
    },

    updateHeroInfo: function () {
        var equip_indexs = { "1": true, "2": true, "3": true, "4": true };

        var equip_list = this.model.getHeroEquipList(this.hero_vo.partner_id);
        for (var goods_i in equip_list) {
            var goods_vo = equip_list[goods_i];
            if (goods_vo && this.equip_items[goods_vo.type]) {
                this.equip_items[goods_vo.type].setData(goods_vo);
                if (equip_indexs[goods_vo.type]) {
                    delete equip_indexs[goods_vo.type];
                }
            }
        }

        for (var equip_i in equip_indexs) {
            var clean_data = { undata: true }
            this.equip_items[equip_i].setData(clean_data);
        }

        this.updateRedPoint();

        this.updateArtifactInfo(this.hero_vo)

        this.updateOneKeyBtnStatus()
    },

    selectEquipByIndex: function (index, equip_item) {
        if (!this.hero_vo) return;
        if (index >= 5) {
            //5 ,6 是神器的位置
            var pos = index - 4;
            var artifact_lock = this.artifact_lock_list[pos];
            if (artifact_lock) {
                if (artifact_lock[0] == "lev") {
                    if (this.hero_vo.lev < artifact_lock[1]) {
                        message(cc.js.formatStr(Utils.TI18N("英雄%s级解锁"), artifact_lock[1]));
                        return
                    }
                } else if (artifact_lock[0] == "star") {
                    if (this.hero_vo.star < artifact_lock[1]) {
                        message(cc.js.formatStr(Utils.TI18N("英雄%s星解锁"), artifact_lock[1]));
                        return
                    }
                }
            }

            var equip_vo = this.hero_vo.artifact_list[pos];
            //默认都是主符文
            if (equip_vo && Utils.next(equip_vo) != null) {
                var PartnerConst = require("partner_const");
                this.ctrl.openArtifactTipsWindow(true, equip_vo, PartnerConst.ArtifactTips.partner, this.hero_vo.partner_id, pos);
            } else {
                this.ctrl.openArtifactListWindow(true, pos, this.hero_vo.partner_id)
            }
        } else {
            var equip_index = index;
            if (this.hero_vo.eqm_list[equip_index]) {
                var TipsController = require("tips_controller")
                TipsController.getInstance().showEquipTips(this.hero_vo.eqm_list[equip_index], TipsConst.eqmTips.partner, this.hero_vo)
            } else {
                HeroController.getInstance().openEquipPanel(true, equip_index, this.hero_vo.partner_id, null);
            }
        }
    },

    //符文信息
    updateArtifactInfo: function (hero_vo) {
        //解锁信息及红点信息
        this.lock_list = {};
        for (var i in this.artifact_lock_list) {
            var v = this.artifact_lock_list[i];
            this.img_lock[i].active = false;
            this.lab_lock[i].string = "";
            var is_lock = true;
            var item = this.equip_items[Number(i) + 4];
            if (v[0] == "lev") {
                this.img_box[i].node.active = false;
                if (hero_vo.lev >= v[1]) {
                    is_lock = false;
                    this.img_box[i].node.active = true;
                } else {
                    let max_lev = Config.partner_data.data_partner_max_lev[this.hero_vo.bid]
                    if(max_lev && max_lev >= v[1]){
                        this.img_lock[i].active = true;
                        this.lab_lock[i].string = v[1] + Utils.TI18N("で開放")
                        item.setVisible(true)
                        this.img_box[i].node.active = true;
                    }else{
                        this.img_lock[i].active = false;
                        item.setVisible(false)
                    }

                }
            } else if (v[0] == "star") {
                var max_star = Config.partner_data.data_partner_max_star[this.hero_vo.bid];
                if (max_star < v[1]) {
                    this.img_lock[i].active = false;
                    this.lab_lock[i].node.active = false;
                    this.img_box[i].node.active = false;
                    if (item) {
                        item.setVisible(false)
                    }
                } else {
                    this.img_box[i].node.active = true;
                    if (this.img_box[i].red_point) {
                        this.img_box[i].red_point.active = false;
                    }
                    if (item) {
                        item.setVisible(true)
                    }
                    if (hero_vo.star >= v[1]) {
                        is_lock = false;
                        this.img_lock[i].active = false;
                        this.lab_lock[i].node.active = false;
                    } else {
                        this.img_lock[i].active = true;
                        this.lab_lock[i].node.active = true;
                        this.lab_lock[i].string = v[1] + Utils.TI18N("★で開放")
                    }
                }
            }
            this.lock_list[i] = is_lock;
        }
        if (hero_vo.artifact_list) {
            for (var i = 1; i <= 2; i++) {
                var item = this.equip_items[i + 4];
                var equip_vo = hero_vo.artifact_list[i]
                if (equip_vo) {
                    item.setData(equip_vo);
                    if (item.empty_icon) {
                        item.empty_icon.node.active = false;
                    }
                    item.equip_vo = equip_vo;
                } else {
                    item.setData({ undata: true });
                    if (item.empty_icon) {
                        item.empty_icon.node.active = true;
                    }
                    item.equip_vo = null;
                }
            }
        }
        this.updateArtifactRedPoint();
    },

    //更新符文的红点
    updateArtifactRedPoint: function () {
        if (this.lock_list) {
            for (var i in this.artifact_lock_list) {
                if (!this.lock_list[i]) {
                    var equip_vo = this.hero_vo.artifact_list[i];
                    var is_redpoint = HeroCalculate.getInstance().checkSingleArtifactRedPoint(equip_vo);
                    this.red_box[i].active = is_redpoint || false;
                } else {
                    this.red_box[i].active = false;
                }
            }
        }
    },

    updateRedPoint: function() {
        // this.
        var is_btn_redpoint = false;
        for (var type_i in HeroConst.EquipPosList) {
            var is_redpoint = this.updateEachEquipRedPoint(HeroConst.EquipPosList[type_i])
            if (!is_btn_redpoint) {
                is_btn_redpoint = is_redpoint;
            }
        }

        if (is_btn_redpoint) {
            this.btn_red_nd.active = true;
        } else {
            this.btn_red_nd.active = false;
        }

        this.is_btn_redpoint = is_btn_redpoint;
    },
    updateOneKeyBtnStatus(){
        if(this.hero_vo && this.hero_vo.eqm_list){
            // -- 装备有红点时，或者没穿戴任何装备时，显示一键穿戴，否则显示一键卸下
            if(this.is_btn_redpoint || Utils.getArrLen(this.hero_vo.eqm_list) <= 0){
                this.key_up_btn_nd.active = true
                this.discharge_btn_nd.active = false;
            }else{
                this.key_up_btn_nd.active = false;
                this.discharge_btn_nd.active = true;
            }
        }else{
            this.key_up_btn_nd.active = false;
            this.discharge_btn_nd.active = false;
        }
    },
    updateEachEquipRedPoint: function(equip_type) {
        var equip_list = this.model.getHeroEquipList(this.hero_vo.partner_id)
        var is_redpoint
        if(equip_list != null){
            var item = this.equip_items[equip_type];
            is_redpoint = HeroCalculate.getInstance().checkSingleHeroEachPosEquipRedPoint(equip_type, equip_list[equip_type])
            item.setRedStatus(is_redpoint);
        }
        return is_redpoint;
    },
})