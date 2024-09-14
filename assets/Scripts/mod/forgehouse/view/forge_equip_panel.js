// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     装备锻造界面
// <br/>Create: 2019-03-29 17:20:37
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var ForgeHouseController = require("forgehouse_controller")
var CommonScrollView = require("common_scrollview");
var ForgehouseItemPanel = require("forgehouse_item_panel");
var BackPackController = require("backpack_controller");
var BackPackConst = require("backpack_const");
var RoleController = require("role_controller");

var Forge_Equip_Panel = cc.Class({
    extends: BasePanel,
    ctor: function() {
        this.prefabPath = PathTool.getPrefabPath("forgehouse", "forge_equip_panel");
    },

    // 可以初始化声明一些变量的
    initConfig: function() {
        this.tab_list = {}
        this.cur_index = null
        this.composite_number = 0 // 当前选择合成数量
        this.composite_max = 0 // 最大可合成数量
        this.composite_price = 0 // 合成单价

        this.normal_color = new cc.Color(0xd3, 0xb4, 0x9b, 0xff)
        this.normal_outlinecolor = new cc.Color(0x40, 0x22, 0x15, 0xff)
        this.select_color = new cc.Color(0xff, 0xff, 0xff, 0xff)
        this.select_outlinecolor = new cc.Color(0x6d, 0x35, 0x07, 0xff)

        this.role_vo = RoleController.getInstance().getRoleVo();
        this.ctrl = ForgeHouseController.getInstance();
        this.partner_const = Config.partner_eqm_data.data_partner_const;
        this.eqm_comp_list = Config.partner_eqm_data.data_eqm_compose_id;
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel: function() {

        Utils.getNodeCompByPath("main_container/btn_all_composite/Text_1", this.root_wnd, cc.Label).string = Utils.TI18N("一键合成");
        Utils.getNodeCompByPath("main_container/btn_comp/Text_1", this.root_wnd, cc.Label).string = Utils.TI18N("合成记录");
        this.main_container = this.seekChild("main_container")
        this.bg_1 = this.seekChild("bg_1", cc.Sprite);
        this.loadRes(PathTool.getBigBg("bigbg_80"), function(sp) {
            this.bg_1.spriteFrame = sp;
        }.bind(this))

        var title_list = [Utils.TI18N("武器"), Utils.TI18N("衣服"), Utils.TI18N("头盔"), Utils.TI18N("鞋子")]
        var type_list = [BackPackConst.item_type.WEAPON, BackPackConst.item_type.CLOTHES, BackPackConst.item_type.HAT, BackPackConst.item_type.SHOE]
        var tab_container = this.seekChild("tab_container")
        for (let index = 0; index < 4; index++) {
            var object = {}
            var new_index = index + 1
            object.btn = tab_container.getChildByName("tab_btn_" + new_index) //获取主节点
            object.normal = object.btn.getChildByName("normal") //普通状态
            object.select = object.btn.getChildByName("select") //选中状态
            object.red_point = object.btn.getChildByName("redpoint") //红点
            object.title = object.btn.getChildByName("title") //label对象
            object.title_label = object.title.getComponent(cc.Label) //label
            object.title_outline = object.title.getComponent(cc.LabelOutline) //描边
            object.title_label.string = title_list[index]
            object.index = new_index
            object.type = type_list[index]
            this.tab_list[new_index] = object;
        }

        this.btn_composite = this.seekChild("btn_composite") // 熔炼按钮
        this.seekChild(this.btn_composite, "Text_1", cc.Label).string = Utils.TI18N("合成")

        this.all_composite = this.seekChild("btn_all_composite");
        this.all_composite_btn = this.seekChild("btn_all_composite", cc.Button);
        this.all_composite_lo = this.seekChild(this.all_composite, "Text_1", cc.LabelOutline);
        if (this.role_vo.vip_lev < this.partner_const.synthesis_vip_lev.val && this.role_vo.lev < this.partner_const.synthesis_character_lev.val) {
            Utils.setGreyButton(this.all_composite_btn, true);
            this.all_composite_lo.enabled = false;
        }

        this.btn_add = this.seekChild("btn_add") // 加
        this.btn_redu = this.seekChild("btn_redu") // 减

        this.gold_num = this.seekChild("gold_num", cc.Label) // 消耗金币数量
        this.spriteGold = this.seekChild("spriteGold").getComponent(cc.Sprite) // 消耗资产图标
        this.loadRes(PathTool.getItemRes(1), function(sp) {
            this.spriteGold.spriteFrame = sp;
        }.bind(this))

        this.composite_num = this.seekChild("composite_num", cc.Label) // 合成数量
        this.composite_num.string = 9999

        this.bar = this.seekChild("bar", cc.ProgressBar) // 合成进度条
        this.bar_num = this.seekChild("bar_num", cc.Label) // 合成进度数字

        this.btn_comp_nd = this.seekChild("btn_comp"); //合成记录

        this.last_item = ItemsPool.getInstance().getItem("backpack_item")
        this.last_item.setPosition(-156, 912)
        this.last_item.setParent(this.main_container)
        this.last_item.initConfig(true, 1, false, true)
        this.last_item.show()

        this.cur_item = ItemsPool.getInstance().getItem("backpack_item")
        this.cur_item.setPosition(156, 912)
        this.cur_item.setParent(this.main_container)
        this.cur_item.initConfig(true, 1, false, true)
        this.cur_item.show()

        var goods_con = this.seekChild("goods_con")
        var setting = {
            item_class: ForgehouseItemPanel, // 单元类
            start_x: 4, // 第一个单元的X起点
            space_x: 8, // x方向的间隔
            start_y: 0, // 第一个单元的Y起点
            space_y: 10, // y方向的间隔
            item_width: 120, // 单元的尺寸width
            item_height: 120, // 单元的尺寸height
            row: 5, // 行数，作用于水平滚动类型
            col: 5, // 列数，作用于垂直滚动类型
            once_num: 5,
            need_dynamic: true
        }
        this.item_scrollview = new CommonScrollView()
        this.item_scrollview.createScroll(goods_con, cc.v2(0, 0), ScrollViewDir.vertical, ScrollViewStartPos.top, cc.size(goods_con.width, goods_con.height), setting, cc.v2(0, 0))

    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function() {
        for (var key in this.tab_list) {
            const element = this.tab_list[key]
            if (element.btn) {
                element.btn.on(cc.Node.EventType.TOUCH_END, (function(event) {
                    Utils.playButtonSound(ButtonSound.Tab);
                    this.changeTabView(element.index)
                }).bind(this))
            }
        }

        this.btn_add.on(cc.Node.EventType.TOUCH_END, function() {
            Utils.playButtonSound(1)
            if (this.composite_number < this.composite_max) {
                this.setCompositeVal(this.composite_number + 1)
            }
        }.bind(this))
        this.btn_redu.on(cc.Node.EventType.TOUCH_END, function() {
            Utils.playButtonSound(1)
            if (this.composite_number > 1) {
                this.setCompositeVal(this.composite_number - 1)
            }
        }.bind(this))

        this.btn_composite.on(cc.Node.EventType.TOUCH_END, function(event) {
            Utils.playButtonSound(1)
            if (this.cur_tab == null || this.select_data == null) return;
            if (this.composite_number <= 0) {
                message(Utils.TI18N("合成数量材料不足"))
                return
            }
            ForgeHouseController.getInstance().send11080(this.select_data.id, this.composite_number)
        }.bind(this))

        Utils.onTouchEnd(this.all_composite, function() {
            if (this.role_vo.vip_lev < this.partner_const.synthesis_vip_lev.val && this.role_vo.lev < this.partner_const.synthesis_character_lev.val) {
                var str = cc.js.formatStr(Utils.TI18N("人物%s级或VIP达到%s级开启"), this.partner_const.synthesis_character_lev.val, this.partner_const.synthesis_vip_lev.val);
                message(str);
                return
            }
            var base_id = this.eqm_comp_list[this.cur_index][Object.keys(this.eqm_comp_list[this.cur_index]).length].id;
            if (base_id) {
                this.ctrl.getModel().setCompSendID(base_id);
                this.ctrl.send11079(base_id);
            }
        }.bind(this), 1)

        Utils.onTouchEnd(this.btn_comp_nd, function() {
            this.ctrl.openEquipmentCompRecordWindow(true);
        }.bind(this), 1)

        // 合成成功之后
        this.addGlobalEvent(EventId.COMPOSITE_RESULT, function() {
            this.compositeResult()
        }.bind(this))
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow: function(index) {
        var index = index || 1;
        this.changeTabView(index)

        // 优先设置红点状态
        for (var key in this.tab_list) {
            var tab_object = this.tab_list[key]
            if (tab_object) {
                this.checkTabCanComposite(tab_object.index)
            }
        }
    },

    changeTabView: function(index) {
        if (this.cur_index == index) {
            return;
        }
        if (this.cur_tab) {
            this.cur_tab.select.active = false
            this.cur_tab.title.color = this.normal_color
            this.cur_tab.title_outline.color = this.normal_outlinecolor
        }
        this.cur_tab = this.tab_list[index]
        this.cur_index = index
        if (this.cur_tab) {
            this.cur_tab.select.active = true
            this.cur_tab.title.color = this.select_color
            this.cur_tab.title_outline.color = this.select_outlinecolor
        }

        this.setThePanelData()
    },

    // 合成成功,直接刷新界面吧
    compositeResult: function() {
        this.setThePanelData(true) // 后续补充红点处理
    },

    /**
     * 设置标签数据,
     * @param {*} force 如果为true就标识不需要改变选中 
     */
    setThePanelData: function(force) {
        if (this.cur_tab == null) {
            return
        }
        var type = this.cur_tab.index;
        var list = ForgeHouseController.getInstance().getModel().getBackEquipsData(type)

        if (list == null || list.length == 0) {
            return
        }
        // 对数据充足
        var temp_ary = []
        var had_select = false
        for (let index = 0; index < list.length; index++) {
            const element = list[index];
            var is_select = false
            if (force == true) {
                if (this.select_data && this.select_data.id == element.id) {
                    is_select = true
                    had_select = true
                }
            }
            var is_red = this.checkCanComposite(element.expend)
            temp_ary.push({ data: element, is_select: is_select, is_red: is_red })
        }
        // 如果没有默认选中的,则选中第一个
        if (had_select == false) {
            temp_ary[0].is_select = true
        }
        var clickback = function(cell) {
            this.selectItemCell(cell)
        }.bind(this)
        this.item_scrollview.setData(temp_ary, clickback, { is_other: false, scale: 1, effect: false, is_show_tips: true })

        // 这个时候表示当前标签有合成成功,所以才做判断
        if (force == true) {
            this.checkTabCanComposite(this.cur_tab.index)
        }
    },

    // 判断一个装备是否有可合成数据
    checkCanComposite: function(expend) {
        var can_composite = false;
        var coin_stauts = false;
        if (expend && expend.length >= 2 && expend[0].length >= 2) {
            var need_bid = expend[0][0]
            var need_num = expend[0][1]
            var max_num = BackPackController.getInstance().getModel().getPackItemNumByBid(BackPackConst.Bag_Code.EQUIPS, need_bid)
            can_composite = (max_num >= need_num)
            var need_coin = expend[1][1];
            coin_stauts = need_coin <= this.role_vo.coin;
        }
        return can_composite && coin_stauts
    },

    // 判断标签页是否可以显示红点,这个时候需要遍历这个标签页中 只要有可显示的就好了
    checkTabCanComposite: function(index) {
        var tab_object = this.tab_list[index]
        if (tab_object == null) return;
        var type = tab_object.index
        var list = ForgeHouseController.getInstance().getModel().getBackEquipsData(type)
        if (list && list.length > 0) {
            var is_red = false
            for (let index = 0; index < list.length; index++) {
                const element = list[index];
                is_red = is_red || this.checkCanComposite(element.expend);
                if (is_red == true) {
                    break
                }
            }
        }
        tab_object.red_point.active = is_red
    },

    // 选中处理
    selectItemCell: function(cell) {
        if (this.select_item) {
            this.select_item.setSelectStatus(false)
            this.select_item = null
        }
        this.select_item = cell
        this.select_item.setSelectStatus(true)

        // 然后对选中的做一些特殊设置
        this.updateChooseItem()
    },

    updateChooseItem: function() {
        if (this.select_item == null || this.select_item.data == null) return;
        // 选中物品的数据
        this.select_data = this.select_item.data

        // 设置右边目标物品
        this.cur_item.setData(this.select_data.id)

        // 设置左边需求物品
        var expend = this.select_data.expend
        if (expend && expend.length >= 2) {
            // 第一个表示需求物品,第二个表示需求资产
            var need_bid = expend[0][0]
            var need_num = expend[0][1]
            this.last_item.setData(need_bid)

            // 设置显示进度
            var max_num = BackPackController.getInstance().getModel().getPackItemNumByBid(BackPackConst.Bag_Code.EQUIPS, need_bid) // 取出最大数量
            this.bar_num.string = max_num + "/" + need_num
            var per = Math.min(1, Math.max(max_num / need_num))
            this.bar.progress = per;

            // 最大合成数量
            this.composite_max = Math.floor(max_num / need_num)

            // 资产显示
            var need_asset_num = expend[1][1]

            // 保存单价
            this.composite_price = need_asset_num

            // 默认合成最多个数
            this.setCompositeVal(this.composite_max)
        }
    },

    // 设置合成数量
    setCompositeVal: function(val) {
        this.composite_number = val
        if (val == 0) {

        } else {

        }
        // 当前合成数量
        this.composite_num.string = val
            // 合成价格
        this.gold_num.string = val * this.composite_price
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide: function() {

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete: function() {
        if (this.item_scrollview) {
            this.item_scrollview.DeleteMe()
        }
        this.item_scrollview = null

        if (this.last_item) {
            this.last_item.onDelete()
        }
        this.last_item = null

        if (this.cur_item) {
            this.cur_item.onDelete()
        }
        this.cur_item = null
    },
})