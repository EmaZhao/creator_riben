// --------------------------------------------------------------------
// @author: shiraho@syg.com(必填, 创建模块的人员)
// @description:
//      装备tisp
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var TipsConst = require("tips_const");
var GoodsVo = require("goods_vo");
var BackPackConst = require("backpack_const");
var StringUtil = require("string_util");
var HeroController = require("hero_controller");
var PartnerConst = require("partner_const");
var PartnerCalculate = require("partner_calculate");

var EquipTips = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("tips", "equip_tips");
        this.viewTag = SCENE_TAG.msg;
        this.win_type = WinType.Tips;
    },

    initConfig: function () {
        this.tips_controller = require("tips_controller").getInstance()
        this.btn_list = {}
    },

    openCallBack:function(){
        this.background = this.seekChild("background")
        if(window.IS_PC){
          if(this.background.getComponent(cc.StudioWidget)) this.background.getComponent(cc.StudioWidget).enabled = false;
          this.background.setContentSize(2200,1280);
        }
        this.container = this.seekChild("container")
        this.container_init_height = this.container.height 
        this.close_btn = this.seekChild("close_btn")

        this.base_panel = this.seekChild(this.container, "base_panel")
        this.base_panel_sprite = this.base_panel.getComponent(cc.Sprite)
        this.goods_item = ItemsPool.getInstance().getItem("backpack_item")
        this.goods_item.setParent(this.base_panel)
        this.goods_item.initConfig(false, 1, false, false)
        this.goods_item.setPosition(-134, -68)
        this.goods_item.show()

        this.score_title = this.seekChild(this.base_panel, "score_title", cc.Label)
        this.score_title.string = Utils.TI18N("评分:")

        this.power_label = this.seekChild(this.base_panel, "power_num").getComponent("CusRichText");
        this.name = this.seekChild(this.base_panel, "name")
        this.equip_type = this.seekChild(this.base_panel, "equip_type", cc.Label)

        this.baseattr_panel = this.seekChild("baseattr_panel")
        this.seekChild(this.baseattr_panel, "label", cc.Label).string = Utils.TI18N("基础属性")
        this.baseattr_panel_height = this.baseattr_panel.height

        this.suitattr_panel = this.seekChild("suitattr_panel")
        this.suitattr_panel_height = this.suitattr_panel.height
        this.suitattr_name = this.seekChild(this.suitattr_panel, "label", cc.Label)

        this.desc_panel = this.seekChild(this.container, "desc_panel")
        this.desc_panel_height = this.desc_panel.height
        this.scroll_view = this.seekChild(this.desc_panel, "content")
        this.desc_label = this.seekChild(this.scroll_view, "desc_label")

        this.tab_panel = this.seekChild(this.container, "tab_panel")
        this.tab_panel_height = this.tab_panel.height
        this.left_btn = this.seekChild(this.tab_panel, "tab_btn_1")
        this.left_btn_label = this.seekChild(this.left_btn, "Label", cc.Label)
        this.right_btn = this.seekChild(this.tab_panel, "tab_btn_3")
        this.right_btn_label = this.seekChild(this.right_btn, "Label", cc.Label)

        this.item = this.seekChild("item")  // 属性拷贝对象
    },

    registerEvent:function(){
        this.background.on(cc.Node.EventType.TOUCH_END, (function (event) {
            this.tips_controller.closeTIpsByType(TipsConst.type.EQUIP)
        }).bind(this))

        this.close_btn.on(cc.Node.EventType.TOUCH_END, (function (event) {
            Utils.playButtonSound("c_close");
            this.tips_controller.closeTIpsByType(TipsConst.type.EQUIP)
        }).bind(this))
        
        this.right_btn.on(cc.Node.EventType.TOUCH_END, function(event){          // 背包中是穿戴, 英雄上面是替换
            if(!this.data)return;
            var partner_id = this.partner_id || 0
            var item_id = this.data.id || 0
            this.tips_controller.closeTIpsByType(TipsConst.type.EQUIP);
            if (this.cloth_type == PartnerConst.EqmTips.backpack) {            // 1是穿戴
                if(partner_id ==0){
                    // var MainuiController    = require("mainui_controller");
                    // var MainuiConst = require("mainui_const");
                    var hero_controller = require("hero_controller").getInstance();
                    hero_controller.openHeroBagWindow(true);
                    // MainuiController.getInstance().changeMainUIStatus(MainuiConst.new_btn_index.partner,{index:1});
                }else{
                    var HeroController = require("hero_controller").getInstance();
                    HeroController.sender11010(partner_id,item_id)
                }
            } else if (this.cloth_type == PartnerConst.EqmTips.partner) {     // 2是更换
                var HeroController = require("hero_controller");
                HeroController.getInstance().openEquipPanel(true, this.data.type, this.partner_id, this.data);
            }
        }.bind(this))

        this.left_btn.on(cc.Node.EventType.TOUCH_END, function (event) {       // 背包中是出售, 英雄上面是卸下
            this.tips_controller.closeTIpsByType(TipsConst.type.EQUIP);
            if (this.cloth_type == PartnerConst.EqmTips.backpack) {           // 1是出售
                var BackpackController = require("backpack_controller");
                var BackPackConst = require("backpack_const");
                BackpackController.getInstance().openItemSellPanel(true, this.data, BackPackConst.Bag_Code.EQUIPS);
            } else if (this.cloth_type ==  PartnerConst.EqmTips.partner) {         // 2是卸下
                HeroController.getInstance().sender11011(this.partner_id, this.data.id);
            }
        }.bind(this))
    },

    openRootWnd:function(object){
        object = object || {}
        var data = object.data                                  // 物品数据
        var type = this.cloth_type = object.type || TipsConst.eqmTips.normal      // tips来源

        this.item_config = null
        if (typeof (data) == "number") {
            this.item_config = Utils.getItemConfig(data)
        } else if (data instanceof GoodsVo || data.type_vo == "GoodsVo") {
            this.item_config = data.config
        } else {
            this.item_config = data
        }
        if (this.item_config == null) {
            this.tips_controller.closeTIpsByType(TipsConst.type.EQUIP)
            return
        }
        this.data = data
        this.partner = object.partner;
        if(this.partner){
            this.partner_id = this.partner.partner_id || 0;
        }
        
        this.goods_item.setData(this.item_config)
        this.resetLayout(type)
    },

    // 重构界面
    resetLayout:function(type){
        // 是否显示套装属性
        var need_show_suitattr = false
        if (this.item_config.eqm_set != 0){
            this.suit_config = gdata("partner_eqm_data", "data_eqm_suit", this.item_config.eqm_set)
            if (this.suit_config){
                need_show_suitattr = true
            }
        }
        // 是否显示按钮
        var is_show_btn = (type == TipsConst.eqmTips.backpack || type == TipsConst.eqmTips.partner)  //只有背包和伙伴身上才需要显示按钮
        var target_height = this.container_init_height
        var extend_height = 0
        if (need_show_suitattr){
            var y = this.setSuitAttrInfo()
            if (y == -1){
                need_show_suitattr = false
                this.suitattr_panel.active = false
                target_height -= this.suitattr_panel_height
            }else{
                target_height += (y - this.suitattr_panel_height)
                extend_height = y
            }
        }else{
            this.suitattr_panel.active = false
            target_height -= this.suitattr_panel_height
        }
        if (!is_show_btn){
            this.tab_panel.active = false
            target_height -= this.tab_panel_height
        }

        if(this.container_init_height != target_height){
            this.container.height = target_height
            if(need_show_suitattr){
                this.desc_panel.y = this.suitattr_panel.y - extend_height
            }else{
                this.desc_panel.y = this.baseattr_panel.y - this.baseattr_panel_height
            }
            this.tab_panel.y = this.desc_panel.y - this.desc_panel_height
        }

        if (is_show_btn){
            this.updateBtnList(type)
        }

        this.setBaseInfo()
        this.setBaseAttrInfo()
    },

    // 设置套装
    setSuitAttrInfo: function(){
        if(this.item_config == null){
            return -1
        }
        if(this.suit_config == null){
            return -1
        }
        // 按照套装排个序
        this.suit_config.sort(function(a, b){
            return a.num - b.num
        })
        var max_count = this.suit_config[this.suit_config.length-1].num
        var name = null
        var suit_list = []
        for (let index = 0; index < this.suit_config.length; index++) {
            const element = this.suit_config[index];
            if (name == null){
                name = element.name
            }
            if (element.attr.length > 0){       //只取第一个属性
                var attr = element.attr[element.attr.length - 1]
                suit_list.push({count:element.num, attr_key:attr[0], attr_val:attr[1]})
            }
        }
        var act_count = this.getEquipActiveCount()
        this.suitattr_name.string = name + "(" + act_count + "/" + max_count + ")"
        
        var suit = suit_list[suit_list.length-1];
        if(suit && act_count >= suit.count && this.suitattr_name && this.suitattr_name.node){
            this.suitattr_name.node.color = new cc.Color(0x41,0x33,0x33,255);
        }

        // 设置属性
        for (let index = 0; index < suit_list.length; index++) {
            const element = suit_list[index];
            var item = cc.instantiate(this.item)
            item.active = true
            item.x = -167
            item.y = -50 - index * 40;
            this.suitattr_panel.addChild(item)

            var attr_icon = PathTool.getAttrIconByStr(element.attr_key)
            var common_res_path = PathTool.getCommonIcomPath(attr_icon);
            this.loadRes(common_res_path, function(item,sf_obj){
                item.getChildByName("icon").getComponent(cc.Sprite).spriteFrame  = sf_obj;
            }.bind(this,item)) 
            
            var attr_val = BackPackConst.getAttrValue(element.attr_key, element.attr_val)
            var attr_name = gdata("attr_data", "data_key_to_name", element.attr_key)
            var attr_color = "#413333"
            var val_color = "#787878"
            if (act_count >= element.count){          // 如果激活了的话,颜色统一
                attr_color = "#359901"
                val_color = "#359901"
            }
            item.getChildByName("attr").getComponent(cc.RichText).string = cc.js.formatStr("<color=%s>%s:</color> <color=%s>%s</color>", attr_color, attr_name, val_color, attr_val)

            var info = item.getChildByName("info")
            info.active = true
            var color = info.color
            color.fromHEX(val_color)
            info.color = color
            info.getComponent(cc.Label).string = cc.js.formatStr("(%s%s)", element.count, Utils.TI18N("件激活"))
        }
        return 50 + suit_list.length * 40
    },

    // 套装激活数量
    getEquipActiveCount: function(){
        if(this.partner_id == null || this.partner_id == 0){
            return 0;
        }

        var count = 0;
        var equip_list = [];
        if(this.item_config.sub_type == BackPackConst.item_tab_type.HOLYEQUIPMENT){//神装
            
        }else if(this.item_config.sub_type == BackPackConst.item_tab_type.EQUIPS){//普通装备
            if(this.partner.eqms != null){
                // 说明是网络返回的
                for(var i in this.partner.eqms){
                    var item_vo = new GoodsVo();
			        item_vo.setBaseId(this.partner.eqms[i].base_id);
                    equip_list[this.partner.eqms[i].type] = item_vo;
                }
            }else if(this.partner.eqm_list != null){
                //说明是本地的 hero_vo
                for(var k in this.partner.eqm_list){
                    equip_list[k] = this.partner.eqm_list[k];
                }
            }
        }

        for(var k in equip_list){
            var goodvo = equip_list[k];
            if(goodvo.config){
                if(this.item_config.eqm_set == goodvo.config.eqm_set){
                    count = count + 1;
                }
            }
        }
        return count;
    },

    // 按钮显示
    updateBtnList:function(type){
        type = type || TipsConst.eqmTips.normal
        if(type == TipsConst.eqmTips.backpack){
            this.right_btn_label.string = Utils.TI18N("穿戴")
            this.left_btn_label.string = Utils.TI18N("出售")
        }else if(type == TipsConst.eqmTips.partner){
            this.right_btn_label.string = Utils.TI18N("更换")
            this.left_btn_label.string = Utils.TI18N("卸下")
        }
    },

    setBaseInfo:function(){
        if(this.item_config == null) return;
        var hex = BackPackConst.quality_color(this.item_config.quality)
        var color = this.name.color
        color.fromHEX(hex)
        this.name.color = color
        this.name.getComponent(cc.Label).string = this.item_config.name
        this.equip_type.string = Utils.TI18N("类型:") + this.item_config.type_desc

        this.desc_label.getComponent(cc.RichText).string = "<color=#413333>" + StringUtil.parse(this.item_config.desc) + "</c>"
        this.scroll_view.height = this.desc_label.height

        var score = this.data.score || 0;
        if(score <= 0){
            score = this.getBaseScore() || 0;
        }
        var all_score = this.data.all_score || 0
        all_score = Math.max(all_score,score);
        this.power_label.setNum(all_score);
        // var plist = PathTool.getPlistPath("tips", "tips")
        // this.loadRes(plist, function(res_object){
        //     this.base_panel_sprite.spriteFrame = res_object.getSpriteFrame("tips_" + this.item_config.quality);
        // }.bind(this))
        // this.loadRes(PathTool.getUIIconPath("tips", "tips_" + this.item_config.quality), function(sf_obj){
        //     this.base_panel_sprite.spriteFrame  = sf_obj;
        // }.bind(this))
    },

    //设置基础属性 
    setBaseAttrInfo:function(){
        if(this.item_config == null || this.item_config.ext.length == 0 || this.item_config.ext[0][1] == null) return;
        // 基础属性只要取第一个
        var base_attr = this.item_config.ext[0][1][0]
        if (base_attr == null) return;

        var attr_key = base_attr[0]
        var attr_val = BackPackConst.getAttrValue(attr_key, base_attr[1])

        var base_item = cc.instantiate(this.item)
        base_item.active = true
        base_item.x = -167
        base_item.y = -50
        this.baseattr_panel.addChild(base_item)

        var attr_icon = PathTool.getAttrIconByStr(attr_key)

        var common_res_path = PathTool.getCommonIcomPath(attr_icon);
        this.loadRes(common_res_path, function(sf_obj){
            base_item.getChildByName("icon").getComponent(cc.Sprite).spriteFrame  = sf_obj;
        }.bind(this))

        var attr_name = gdata("attr_data", "data_key_to_name", attr_key)
        base_item.getChildByName("attr").getComponent(cc.RichText).string = cc.js.formatStr("<color=#413333>%s:</c> <color=#413333>%s</color>", attr_name, attr_val)
    },

    // 计算基础评分
    getBaseScore:function(){
        if(!this.item_config || !this.item_config.ext || !this.item_config.ext[0]){
            return 0;
        }
        var base_attr = this.item_config.ext[0][1] || {};
        var num = PartnerCalculate.calculatePower(base_attr);
        return num
    },

    closeCallBack: function () {
        if(this.goods_item){
            this.goods_item.deleteMe()
        }
        this.tips_controller.closeTIpsByType(TipsConst.type.EQUIP)
    },
})