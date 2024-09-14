// --------------------------------------------------------------------
// @author: shiraho@syg.com(必填, 创建模块的人员)
// @description:
//      物品单列,显示对象
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var GoodsVo = require("goods_vo");
var PathTool = require("pathtool");
var BackPackConst = require("backpack_const");

var BackPackItem = cc.Class({
    extends: BasePanel,
    ctor: function () {     // 可传参数,第一个是否是自己物品,只有背包或者伙伴身上才算 第二个缩放值,第三个是否点击收缩,第四是否显示tips 第五是否显示额外名字
        this.prefabPath = PathTool.getPrefabPath("backpack", "goods_item");
        this.scale = 1;                     // 缩放比
        this.is_other = false;              // 是否是其他人的物品,只要不是背包和自己伙伴身上的都是其他
        this.effect = true;                 // 是否响应按钮过滤
        this.is_show_tips = true;           // 是否显示tips
        
        this.item_config = null;            // 物品的配置数据
        this.item_num = 0;                  // 物品数量

        this.load_item_icon = {};            // 加载过的物品图标
        this.before_over_set = false;       // 创建完成之后是否要设置
        this.star_list = []                 // 星星的列表

        this.show_check_box = false			// 是否需要根据数据现在复选框

        if (arguments && arguments.length > 0) {
            this.is_other = arguments[0] || false;
            this.scale = arguments[1] || 1;
            this.effect = arguments[2] || false;
            this.is_show_tips = arguments[3] || false;
            this.is_show_name = arguments[4] || false;
            this.before_over_set = true;
        }
        this.isUnEnabled = false;
        
        this.isShowBiaoQian = false; //是否显示标签
        this.biaoQianStr = "";

        this.name_color = null;
        this.name_size = 18;

        this.isSetEffect = false; //是否手动设置特效

        this.isCache = true;//缓存

        this.isShowOrderWarLock = false;      //是否显示战令锁
        this.is_show_get_select = false;       //是否显示领取状态
    },

    initPanel: function () {
        this.main_container = this.root_wnd.getChildByName("main_container")                                              // 点击区域
        this.block_event =  this.root_wnd.getComponent(cc.BlockInputEvents)
        this.item = this.main_container.getChildByName("icon")
        this.item_icon = this.main_container.getChildByName("icon").getComponent(cc.Sprite)                     // 物品图标

        // this.background = this.main_container.getChildByName("background");
        this.quality_bg = this.main_container.getChildByName("background").getComponent(cc.Sprite)              // 背景品质框

        this.num_bg = this.main_container.getChildByName("num_bg")                                              // 数量容器
        this.num_background = this.num_bg.getChildByName("background")                                          // 数量背景,需要根据数量做长度变换
        this.num_bg_size = this.num_background.getContentSize()
        this.num = this.num_bg.getChildByName("num")                                                            // 数量节点
        this.num_label = this.num.getComponent(cc.Label)                                                        // 数量文本

        this.select = this.main_container.getChildByName("select")                                              // 选中框
        this.star_node = this.main_container.getChildByName("star_node");
        this.star = this.star_node.getChildByName("star")                                                  // 星数icon
        this.chip = this.main_container.getChildByName("chip")                                                  // 碎片标志
        this.red_tips = this.main_container.getChildByName("red_tips")                                          // 红点标志

        this.progress_node = this.main_container.getChildByName("progress")                                     // 扩展进度条
        this.progress = this.progress_node.getComponent(cc.ProgressBar)                                         // 真是进度条
        this.progress_label = this.progress_node.getChildByName("label").getComponent(cc.Label)                 // 进度条上面的值

        this.camp = this.main_container.getChildByName("camp")                                                  // 阵营
        this.camp_sprite = this.camp.getComponent(cc.Sprite)

        this.extend_tag = this.main_container.getChildByName("extend_tag");
        this.extend_desc = this.main_container.getChildByName("extend_desc").getComponent(cc.Label);
        this.play_effect = this.main_container.getChildByName("play_effect").getComponent(sp.Skeleton);
        this.mark = this.main_container.getChildByName("mark")                                                  // 获取选中

        this.extend_label = this.seekChild(this.main_container, "extend_label", cc.Label);                      // 下部的额外文字描述   
        this.pickUpSign = this.seekChild(this.main_container, "pickUpSign");                      // 召唤概率pickup

        if (this.before_over_set) {
            this.initSomeSet()
            this.before_over_set = false
        }
        if (this.showItemEffect_cache) {
            this.showItemEffect.apply(this, this.showItemEffect_cache);
            this.showItemEffect_cache = null;
        }
        if (this.extend_cache) {
            this.setExtendTag.apply(this, this.extend_cache);
            this.extend_cache = null;
        }
        if (this.set_num_bg_cache) {
            var arr = this.set_num_bg_cache;
            this.setNumBgPos(arr.pos, arr.ar, arr.pos1, arr.ar1);
        }
        if (this.bg_status != null) {
            this.setIsShowBackground(this.bg_status);
        }
        if (this.add_btn_bool != null) {
            this.showAddIcon(this.add_btn_bool);
        }
        if(this.head_icon != null){
            this.setItemIcon(this.head_icon);
        }

        this.setItemIconUnEnabled(this.isUnEnabled);
    },

    registerEvent: function () {
        
    },
    init(){
        //因为会复用需要初始化
        this.setPosition(0,0)
        this.setAnchorPoint(0.5,0.5)
        this.scale = 1
        this.item_res_path = null;
        this.callback = null;
        this.actionCallback = null;
        this.data = null;
        this.name_color = null;
        this.name_size = 18;
        if(this.extend_label){
            this.extend_label.node.y = -71
            this.extend_label.string = "";
        }
        this.empty_icon_path = null;
        this.initConfig(false,false,null,false,false);
        if(this.progress_node){
            this.progress_node.active = false;
        }
        this.setRedStatus(false);
        this.setExtendTag(false);
        this.showItemEffect(false);
        this.setDefaultTip(false,false,false,false);
        this.setMaskVisible(false);
        this.setItemIconUnEnabled(false);
        this.showBiaoQian(false);
        this.is_comp_num = null;
        this.holidHeroExpeditTag(false);
        this.showAddIcon(false);
        this.setIsShowBackground(true);
        this.setReceivedIcon(false);
        this.cur_visible = false;
        if(this.set_need_num_cache){
            this.setNeedNum(0,0,null,false)
            this.set_need_num_cache = null;
        }
        this.setDoubleIcon(false)
        this.isSummonNumber = null;

        this.showOrderWarLock(false);
        this.IsGetStatus(false);
        this.showWeekCardTag(false)
        if(this.num_label){
            this.num_label.string = "";
            this.num_label.node.active = true;
        }
        if(this.num_bg){
            this.num_bg.active = false;
            this.num_bg.setPosition(51.8,-41)
            this.num_bg.setAnchorPoint(1,0.5)
        }
        if(this.num_background){
            this.num_background.setPosition(0,0);
            this.num_background.setAnchorPoint(1,0.5)
            this.num_background.setContentSize(cc.size(30,22))
        }
        if (this.num) {
            this.num.setPosition(-2.5, -0.1);
            this.num.setAnchorPoint(1,0.5);   
        }
        if(this.pickUpSign){
            this.pickUpSign.active = false;
        }
        this.setSelected(false);
    },
    /**
     * 初始化一些参数设置
     * @param {*} is_other 自己背包或者其他部分,包含了自己伙伴身上背包 
     * @param {*} scale 缩放值
     * @param {*} effect 是否响应按钮过滤  this.click.transition = cc.Button.Transition.NONE  //SCALE
     * @param {*} is_show_tips 是否显示tips
     * @param {*} is_show_name 是否在下方显示物品名字
     */
    initConfig: function (is_other, scale, effect, is_show_tips, is_show_name) {
        this.is_other = is_other || false;
        this.scale = scale || 1;
        this.effect = effect == null ? true : effect;
        this.is_show_tips = is_show_tips || false;
        this.is_show_name = is_show_name || false;

        if (this.root_wnd) {
            this.initSomeSet()
        } else {
            this.before_over_set = true
        }
    },

    // 初始化一些设定
    initSomeSet: function () {
        if (this.root_wnd == null) return
        // if (this.scale != 1) {
            // this.main_container.scale = this.scale
            this.root_wnd.scale = this.scale;
        // }
        if (this.cache_markselect_status != null) {
            this.setMaskVisible(this.cache_markselect_status)
            this.cache_markselect_status = null
        }
    },

    onShow: function () {
        if (this.root_wnd && !this.click_event) {
            this.root_wnd.on(cc.Node.EventType.TOUCH_END,this.onClickRootWnd,this)
            this.root_wnd.on(cc.Node.EventType.TOUCH_START, this.onClickRootWnd, this);
            this.root_wnd.on(cc.Node.EventType.TOUCH_CANCEL, this.onClickRootWnd, this);
            this.click_event = true
            if(this.block_event){
                this.block_event.enabled = true;
            }
        }
        this.updateData();
    },
    onClickRootWnd(event){
        if (event.type === cc.Node.EventType.TOUCH_START) {
            Utils.playButtonSound(ButtonSound.Normal);
            if(this.effect){
                this.root_wnd.scale = (this.scale || 1) * 0.9;
            } 
        }

        if (event.type === cc.Node.EventType.TOUCH_CANCEL) {
            if(this.effect){
                this.root_wnd.scale = this.scale || 1; 
            } 
        }
        
        if (event.type === cc.Node.EventType.TOUCH_END) {
            if(this.effect){
                this.root_wnd.scale = this.scale || 1;  
            }
            if (this.callback) {
                this.callback.apply(null, [this])
            } else {
                if (this.is_show_tips && this.item_config) {
                    var TipsController = require("tips_controller")
                    if (BackPackConst.checkIsEquip(this.item_config.type)) {                          // 装备
                        TipsController.getInstance().showEquipTips(this.item_config)
                    }else{
                        var config;
                        if(this.data.config){
                            config = this.data.config;
                        }else if(this.data.bid){
                            config = Utils.getItemConfig(this.data.bid);
                        }else if(this.data){
                            config = this.data
                        }
                        if(config){
                            if(BackPackConst.checkoutIsWeekCard(config.type)){
                                TipsController.getInstance().showWeekCardTips(true,this.item_config)
                            }else if(BackPackConst.checkIsHeroSkin(config.type)){
                                var HeroController = require("hero_controller")
                                HeroController.getInstance().openHeroSkinTipsPanel(true, this.item_config)
                            }
                            else{
                                // 虽然显示物品来源,但是如果没有配置也不需要显示
                                if(this.is_show_source == true && config.source && Utils.next(config.source)){
                                    var BackpackController = require("backpack_controller");
                                    BackpackController.getInstance().openTipsSource(true, config);
                                }else if(this.is_tips_source){
                                    TipsController.getInstance().showGoodsTips(config, true, this.is_tips_source)
                                }else{
                                  if(BackPackConst.checkIsHero(config)){
                                    var HeroController = require("hero_controller");
                                    var HeroModel = HeroController.getInstance().getModel();
                                    var key = config.effect[0].val[0]+"_"+config.effect[0].val[1];
                                    var show_hero_vo = HeroModel.getHeroPokedexByBid(key)
                                    if(!show_hero_vo){
                                      TipsController.getInstance().showGoodsTips(config);
                                    }else{
                                      HeroController.getInstance().openHeroTipsPanel(true,show_hero_vo, true, true);
                                    }
                                  }else{
                                    TipsController.getInstance().showGoodsTips(config);
                                  }
                                }
                                if(this.source_callback ){
                                    this.source_callback();
                                }
                            }

                        }
                    } 
                    return;
                }
                if(this.actionCallback){
                    this.actionCallback.apply(null, [this]);
                }
            }   
        }

    },
    onHide: function () {

    },

    /**
     * 扩展参数,只有这个对象用在 CommonScrolleView的时候用到
     * @param {*} data 
     */
    setExtendData: function (data) {
        this.initConfig(data.is_other, data.scale, data.effect, data.is_show_tips)

        // 是否显示碎片进度条
        this.is_show_chip_loading = data.is_show_chip_loading || false

        if(data.showCheckBox!= null){
            this.show_check_box = data.showCheckBox
        }
        if(data.checkBoxClickCallBack!= null){
            this.click_check_callback = data.checkBoxClickCallBack;
        }
        if(data.adjustCheckBoxPos){
            this.check_box_pos = data.adjustCheckBoxPos;
        }
        if(data.is_comp_num != null){
            this.is_comp_num = data.is_comp_num;
        }

        if(data.is_hide_effect){
            this.is_hide_effect = data.is_hide_effect;
        }

        // --背包是否显示阵营
		if(data.is_camptype != null){
			this.is_camptype = data.is_camptype
        }

        if(data.isSummonNumber != null){
            this.isSummonNumber = data.isSummonNumber
        }
        if(data.isPickUp !=null){
            this.isPickUp = data.isPickUp;
        }
    },

    /**
     * 设置左边斜角的一些戳
     * @param {*} status 
     * @param {*} desc 
     * @param {*} extend 
     */
    setExtendTag: function (status, desc, extend) {
        if (!this.extend_tag) {
            this.extend_cache = [status, desc, extend];
        } else if (status) {
            this.extend_tag.active = true;
            this.extend_desc.node.active = true;
            this.extend_desc.string = desc;
        } else {
            this.extend_tag.active = false;
            this.extend_desc.node.active = false;
        }
    },

    setSelfEffect:function(config){
        if(this.isSetEffect)return;
        if(!this.is_hide_effect == true){
            if(config && config.is_effect && config.is_effect == 1){
                var effect_id = 156;
                var action = PlayerAction.action_2;
                if(config.quality >= 4){
                    action = PlayerAction.action_1;
                }
                
                this.showItemEffect(true, effect_id, action, true)
            }else{
                this.showItemEffect(false);
            }
        }else{
            this.showItemEffect(false);
        }
    },

    /**
     * 效果显示
     * @param {*} bool 
     * @param {*} effect_id 
     * @param {*} action 
     * @param {*} is_loop 
     * @param {*} scale 
     */
    showItemEffect: function (bool, effect_id, action, is_loop, scale) {
        if (!this.play_effect) {
            this.isSetEffect = true;
            this.showItemEffect_cache = arguments;
            return;
        }
        var res_id = Config.effect_data.data_effect_info[effect_id];
        if (bool && res_id) {
            this.play_effect.node.active = true;
            action = action || PlayerAction.action_1;
            var path = cc.js.formatStr("spine/%s/action.atlas", res_id);
            this.loadRes(path, (function (res) {
                this.play_effect.skeletonData = res;
                this.play_effect.setAnimation(0, action, is_loop);
            }).bind(this));
        } else {
            this.play_effect.node.active = false;
        }
        if(scale != null){
            this.play_effect.node.scale = scale;
        }
    },

    addCallBack: function (callback) {
        this.callback = callback
    },

    //用于需要根据is_show_tips状态调用callback使用
    addActionCallBack: function (callback) {
        this.actionCallback = callback
    },

    /**
     * 设置显示数据
     * @param {*} data ,当前可以支持 goodsvo ,item_config ,{bid, num}, bid 以及包含 undata的object
     */
    setData: function (data,is_hide_effect) {
        // if(!data)return;
        this.data = data;
        this.is_hide_effect = is_hide_effect || false;
        if (this.root_wnd) {
            this.root_wnd.scale = this.scale;
            this.updateData()
        }
        
    },
    // x下部的额外文字描述
    setExtendLabel: function (str, color,font_size) {
        if(color){
            this.name_color = color;           
        }
        if(font_size && font_size>0){
            this.name_size = font_size;
        }
        if(!this.root_wnd){
            return;
        }
        str = str || "";
        if (str == "") {
            // this.extend_label.active = false;
            this.extend_label.string = str;
        } else {
            // this.extend_label.active = true;
            this.extend_label.string = str;
        }

        if(color){
            var cur_select = this.extend_label.node.color;
            if(typeof(color) == "number"){
                cur_select.fromHEX(Config.color_data.data_color16[color]);
            }else{
                cur_select.fromHEX(color);
            }
            this.extend_label.node.color = cur_select;
        }

        if(font_size && font_size>0){
            this.extend_label.fontSize = this.name_size;
            this.extend_label.lineHeight = this.name_size+2;
        }
    },

    // 区分设置进来到具体是什么数据
    updateData: function () {
        // 设置物品图标
        // this.setRedStatus(false)
        if(this.tmp_index!= null){
            if(this.root_wnd)
            this.root_wnd.name = "backpack_item_" + (this.tmp_index + 1);
        }
        
        if (this.data == null) {
            if (this.empty_icon_path){
                this.setItemIcon();
            }
            this.suspendAllActions();
            return;
        } else {

        }
        this.item_config = null     // 清空配置数据

        var item_num = 0
        if (this.data instanceof GoodsVo || this.data.type_vo == "GoodsVo") {                                  // 直接是物品实例对象
            this.item_config = this.data.config;
            item_num = this.data.quantity;

            if (this.item_config.id == "24802")
                this.main_container.name = "item_" + this.item_config.id;

        } else if (typeof (this.data) == "number") {                            // 物品bid
            this.item_config = Utils.getItemConfig(this.data)
        } else if (this.data instanceof Object) {
            if (this.data.bid != null && this.data.num != null) {            // 基础设置
                this.item_config = Utils.getItemConfig(this.data.bid)
                item_num = this.data.num;
            } else if (this.data.undata == true) {                             // {sort:-1, quality:-1, undata:true} 这个是需要数据,需要清掉

            } else {
                if (this.data.id) {
                    this.item_config = Utils.getItemConfig(this.data.id);
                } else {
                    this.item_config = this.data
                }
            }
        }
        this.setQualityBG()             // 设置背景色
        this.setItemNum(item_num)       // 设置当前拥有数量
        this.setItemIcon()              // 设置物品图标
        this.setItemChip()              // 设置碎片
        this.setItemStar()              // 设置物品星数,只针对碎片,装备和符文
        this.setCompNumber()            // 设置合成进度条,只在背包状态下的物品可见
        this.setItemCamp()              // 设置物品阵营
        this.setSelfEffect(this.item_config)      //设置显示特效

        //远征右上角显示
        if(this.expedit_cahe){
            this.holidHeroExpeditTag(this.expedit_cahe.status,this.expedit_cahe.desc)
        }
        // 是否显示下方的物品名字
        if (this.is_show_name) {
            this.setExtendLabel(this.item_config.name,this.name_color,this.name_size);
        } else {
            this.setExtendLabel();
        }
        if(this.data.showSellStatus!= null){
            this.setCheckBoxStatus(this.data.showSellStatus.status, this.data.showSellStatus.select)
        }
        //设置标签
        if(this.isShowBiaoQian && this.biaoQianStr){
            this.showBiaoQian(this.isShowBiaoQian,this.biaoQianStr);
        }

        if (this.cache_red_status) {
            this.setRedStatus(this.cache_red_status)
            this.cache_red_status = null
        } else {
            this.setRedStatus(false);
        }        

        if(this.receivedStatus != null){
            this.setReceivedIcon(this.receivedStatus)
        }

        if(this.isSummonNumber != null){
            this.setSummonNumber()
        }
        if(this.isPickUp !=null){
            this.setPickUp()
        }

        if(this.isShowOrderWarLock == true){
            this.showOrderWarLock(true);
        }
        this.IsGetStatus(this.is_show_get_select);

        if(this.data && this.data.bid){
			this.setWeekCardData(this.data.bid)
        }
    },
    setWeekCardData(bid){
        let item_config = Utils.getItemConfig(bid)
        if(item_config && item_config.tips_btn){
            let show_type = this.checkIsWeekCard(item_config.tips_btn)
            if(show_type == 50){
                this.showWeekCardTag(true)
            }
        }else{
            this.showWeekCardTag(false)
        }
    },
    // 设置基础信息显示
    setQualityBG: function (temp_quality) {
        var quality = 0;
        if(temp_quality!=null){
            quality = temp_quality;
        }else{
            if (this.item_config) {
                quality = this.item_config.quality;
            }
        }
        
        var bg_path = PathTool.getItemQualityBG(quality)
        if (this.bg_quality == bg_path) return
        this.bg_quality = bg_path
        var common_res_path = PathTool.getCommonIcomPath(this.bg_quality);
        LoaderManager.getInstance().loadRes(common_res_path, function (sf_obj) {
            if(this.root_wnd && this.root_wnd.isValid){
                this.quality_bg.spriteFrame = sf_obj;
            }
        }.bind(this))
    },

    // 设置数量
    setItemNum: function (item_num) {
        if(this.is_comp_num){
            this.num_bg.active = false
        }else{
            this.num_bg.active = false;
            this.item_num = Utils.getMoneyString(item_num);
            if (item_num == null || item_num <1 
              ||(this.item_config && this.item_config.type 
                && ((this.checkIsEquip(this.item_config.type ) && item_num <=1)
                || this.checkIsArtifact(this.item_config.type)))) {
                this.num_bg.active = false;
            } else {
                this.num_bg.active = true
                this.num_label.string = this.item_num;
                var width = this.num.width
                this.num_background.width = width + 10
            }
            if (this.set_need_num_cache) {
                var arr = this.set_need_num_cache;
                this.setNeedNum(arr.need_num, arr.num, arr.color, arr.force);
            }else{
                this.num_label._forceUpdateRenderData(true);
                // Utils.delayRun(this.num_background,1/60,function(){
                    this.updateNumBGSize();
                // }.bind(this))
            }
        }
        
    },

    // 设置物品图标
    setItemIcon: function (head_icon) {
        if(this.item==null) {
            this.head_icon = head_icon;
            return
        }
        if(head_icon){
            this.empty_icon_path = head_icon;
        }

        if (this.item_config == null && !this.empty_icon_path) {
            this.item.active = false
            return
        }

        this.item.active = true
        var item_res_path = null;
        if (!this.item_config) {
            item_res_path = this.empty_icon_path;
        } else {
            item_res_path = PathTool.getItemRes(this.item_config.icon)
        }
        if(head_icon){
            item_res_path = head_icon;
        }

        if (this.item_res_path == item_res_path) return
        this.item_res_path = item_res_path
        this.loadRes(item_res_path, function (item_res_path,res_object) {
            // this.load_item_icon[item_res_path] = res_object
            if(this.item_res_path == item_res_path){
                this.item_icon.spriteFrame = res_object;
            }
        }.bind(this,item_res_path))
    },

    // 设置英雄碎片
    setItemChip: function () {
        if (this.item_config == null || this.item_config.type != BackPackConst.item_type.PARTNER_DEBRIS) {
            this.chip.active = false
        } else {
            this.chip.active = true
        }
    },

    // 设置物品的星级
    setItemStar: function (bool = true) {
        for (let index = 0; index < this.star_list.length; index++) {
            const star = this.star_list[index];
            star.active = false
        }
        if (this.item_config == null) return;
        var eqm_star = 0
        if(bool == true){
            if (this.checkIsEquip(this.item_config.type)) {
                eqm_star = this.item_config.eqm_star
            } else if (this.item_config.type == BackPackConst.item_type.PARTNER_DEBRIS) {      // 英雄碎片的时候额外用这个装备阶数标识星级
                eqm_star = this.item_config.eqm_jie
            } else if (this.item_config.type == BackPackConst.item_type.ARTIFACTCHIPS) {       // 符文比较特殊,必须是物品
                if (this.data instanceof GoodsVo) {
                    eqm_star = this.data.enchant
                }
            }
        }
        
        if (eqm_star > 0) {
            var width = 12
            var x = (1 - eqm_star) * width * 0.5
            for (let index = 0; index < eqm_star; index++) {
                if (this.star_list[index] == null) {
                    this.star_list[index] = cc.instantiate(this.star);
                    this.star_list[index].y = this.star.y
                    this.star_node.addChild(this.star_list[index])
                }
                var star = this.star_list[index]
                star.active = true
                star.x = x + index * width
            }
        }
    },

    // 设置碎片合成进度条
    setCompNumber: function () {
        if (!this.is_show_chip_loading || this.item_config == null || this.data == null || !(this.data instanceof GoodsVo) || this.item_config.type != BackPackConst.item_type.PARTNER_DEBRIS) {
            this.progress_node.active = false
        } else {
            var config = gdata("partner_data", "data_get_compound_info", this.item_config.id);
            if (config == null) {
                this.progress_node.active = false
            } else {
                var cur_num = this.data.quantity;   // 当前数量
                var max_num = config.num;           // 需要数量
                var per = Math.min(1, Math.max(cur_num / max_num))
                this.progress.progress = per
                this.progress_label.string = cur_num + "/" + max_num

                this.progress_node.active = true
                
                if(per < 1) {
                    this.setRedStatus(false)
                }else{
                    this.setRedStatus(true)
                }
            }
        }
    },

    // 阵营图标显示
    setItemCamp: function () {
        if(this.item_config && this.item_config.sub_type == 3 && !this.is_camptype && this.item_config.lev != 0){
            this.camp.active = true
            var camp = this.item_config.lev     // 取等级标识阵营
            var camp_path = PathTool.getHeroCampRes(camp)
            if (this.camp_path == camp_path) return
            this.camp_path = camp_path
            var common_res_path = PathTool.getCommonIcomPath(camp_path);
            LoaderManager.getInstance().loadRes(common_res_path, function (sf_obj) {
                this.camp_sprite.spriteFrame = sf_obj;
            }.bind(this))
        }else{
            this.camp.active = false;
        }
        // if (this.item_config == null || this.item_config.sub_type != BackPackConst.item_tab_type.HERO) {
        //     this.camp.active = false
        // } else {
        //     this.camp.active = true
        //     var camp = this.item_config.lev     // 取等级标识阵营
        //     var camp_path = PathTool.getHeroCampRes(camp)
        //     if (this.camp_path == camp_path) return
        //     this.camp_path = camp_path
        //     var common_res_path = PathTool.getCommonIcomPath(camp_path);
        //     LoaderManager.getInstance().loadRes(common_res_path, function (sf_obj) {
        //         this.camp_sprite.spriteFrame = sf_obj;
        //     }.bind(this))

        // }
    },

    // 监测是不是装备
    checkIsEquip: function (type) {
        return type == BackPackConst.item_type.WEAPON || type == BackPackConst.item_type.SHOE || type == BackPackConst.item_type.CLOTHES || type == BackPackConst.item_type.HAT
    },
//  检测是不是符文
    checkIsArtifact: function(type) {
      return type == BackPackConst.item_type.ARTIFACTCHIPS
    },

    // 选中与否,有一个√的
    setMaskVisible: function (status) {
        if (this.root_wnd) {
            this.mark.active = status
        } else {
            this.cache_markselect_status = status
        }
    },

    // 设置红点状态
    setRedStatus: function (status) {
        if (this.red_tips) {
            this.red_tips.active = !!status;
        } else {
            this.cache_red_status = !!status;
        }
    },

    // 返回配置数据
    getItemConfig: function () {
        return this.item_config
    },

    // 返回物品对象
    getItemData: function () {
        return this.data
    },

    // 除+号和数量以外都置灰
    setItemIconUnEnabled: function (bool) {
        this.isUnEnabled = bool;
        if (this.item_icon) {
            this.item_icon.setState(!bool ? cc.Sprite.State.NORMAL : cc.Sprite.State.GRAY);
        }

        if (this.quality_bg) {
            this.quality_bg.setState(!bool ? cc.Sprite.State.NORMAL : cc.Sprite.State.GRAY);
        }
        if(this.extend_tag && this.extend_tag.active){
            this.extend_tag.getComponent(cc.Sprite).setState(!bool ? cc.Sprite.State.NORMAL : cc.Sprite.State.GRAY);
        }
        if (this.star_list) {
            for (var i in this.star_list) {
                this.star_list[i].getComponent(cc.Sprite).setState(!bool ? cc.Sprite.State.NORMAL : cc.Sprite.State.GRAY);
            }
        }

        if(this.play_effect && this.play_effect.node){
            this.play_effect.node.color = !bool ? new cc.Color(255, 255, 255, 255) : new cc.Color(115, 115, 115, 255);
        }
    },

    // 增加一个标签头
    showBiaoQian:function(bool,str){
        this.isShowBiaoQian = bool;
        this.biaoQianStr = str;
        if (this.root_wnd == null) return
        if(!this.qian_icon && bool){
            var res = PathTool.getCommonIcomPath("common_90015");
            this.qian_icon = Utils.createImage(this.main_container,null,-23,27,cc.v2(0.5,0.5),null,10);
            this.loadRes(res, function (sf_obj) {
                this.qian_icon.spriteFrame = sf_obj;
            }.bind(this))
            this.qian_label = Utils.createLabel(20,new cc.Color(0xff, 0xff, 0xff, 0xff),new cc.Color(0x0a, 0x0f, 0x0f, 0xff),5,-5,"",this.qian_icon.node,2, cc.v2(0.5,0))
            this.qian_label.node.rotation = -45;
        }
        if(this.qian_icon){
            this.qian_icon.node.active = bool;
        }
        if(this.qian_label){
            str = str || "";
            this.qian_label.string = str;
        }
    },

    //理论上只用于 00/11 的格式，希望不要乱用
    setNeedNum: function (need_num, num, color, force) {
        if (this.set_need_num_cache == null) {
            this.set_need_num_cache = {};
            this.set_need_num_cache.need_num = need_num;
            this.set_need_num_cache.num = num;
            this.set_need_num_cache.color = color;
            this.set_need_num_cache.force = force;
        }
        if (this.root_wnd == null) return
        need_num = need_num || 0;
        var status = false;
        if (need_num > 0 || force == true) {
            status = true
        }
        var str = need_num;
        if (num != null) {
            if (need_num > num)
                color = new cc.Color(0xff, 0x47, 0x47, 0xff)
            else
                color = new cc.Color(0xff, 0xff, 0xff, 0xff)
            // num = num;
            num = Utils.getMoneyString(num);
            need_num = Utils.getMoneyString(need_num);
            str = num + "/" + need_num;
        }
        this.num_label.string = str;
        this.num_label.node.color = color;
        this.num_label.node.active = status;
        this.num_bg.active = status;
        this.num_label._forceUpdateRenderData(true);
        // Utils.delayRun(this.num_background,1/60,function(){
            this.updateNumBGSize();
        // }.bind(this))
    },

    updateNumBGSize: function () {
        var size = this.num.getContentSize();
        var width = size.width;
        if (width < 30)
            width = 21;
        this.num_background.setContentSize(cc.size(width + 12, this.num_bg_size.height + 2))
    },

    // 活动时候远征的物品
    holidHeroExpeditTag: function (status, desc) {
        if(status){
            this.expedit_cahe = {}
            this.expedit_cahe.status = status
            this.expedit_cahe.desc = desc
        }
        if (!this.root_wnd) return;
        if (status == false) {
            this.expedit_cahe = null;
            if (this.heroExpeditTag) {
                this.heroExpeditTag.node.active = status;
            }
        } else {
            if (this.heroExpeditTag == null) {
                this.heroExpeditTag = Utils.createImage(this.main_container, null, 30, 29, cc.v2(0.5, 0.5));
                var res = PathTool.getCommonIcomPath("common_90081");
                this.loadRes(res, function (sf_obj) {
                    this.heroExpeditTag.spriteFrame = sf_obj;
                }.bind(this))
                this.heroExpeditTag_desc = Utils.createLabel(16, new cc.Color(0xff, 0xff, 0xff, 0xff), new cc.Color(0xaf, 0x23, 0x3a, 0xff), 10, 12.5, "", this.heroExpeditTag.node, 2, cc.v2(0.5, 0.5));
                this.heroExpeditTag_desc.node.setRotation(45)
            }
            this.heroExpeditTag.node.action = status;
            this.heroExpeditTag_desc.string = desc;
        }
    },

    setNumBgPos: function (pos, ar, pos1, ar1) {
        if (this.set_num_bg_cache == null) {
            this.set_num_bg_cache = {};
            this.set_num_bg_cache.pos = pos;
            this.set_num_bg_cache.ar = ar;
            this.set_num_bg_cache.pos1 = pos1;
            this.set_num_bg_cache.ar1 = ar1;
            // return
        }
        if (this.root_wnd == null) return
        if (pos) {
            this.num_bg.setPosition(pos.x, pos.y);
        }
        if (ar) {
            this.num_bg.setAnchorPoint(ar);
        }
        if (ar1) {
            this.num.setAnchorPoint(ar1);
            this.num_background.setAnchorPoint(ar1);
        }
        if (pos1) {
            this.num_background.setPosition(pos1.x, pos1.y);
            this.num.setPosition(pos1.x, pos1.y);
        }
    },

    suspendAllActions: function () {
        this.setCheckBoxStatus(false,false);
        // this.showAddIcon(false);
        this.setRedStatus(false);
        this.setItemStar(false);
        this.setQualityBG(0);
        this.showWeekCardTag(false)
        if(this.num_bg){
            this.num_bg.active = false;
        }

        if(this.item){
            this.item.active = false;
        }

        if(this.chip){
            this.chip.active = false;
        }

        if(this.camp){
            this.camp.active = false;
        }

        if(this.progress_node){
            this.progress_node.active = false;
        }

        this.showItemEffect(false);
        this.data = null;
    },

    /**
     * 显示tips的开关
     * @param {*} is_show_tips 
     * @param {*} is_show_source 
     * @param {*} source_callback 
     * @param {*} is_tips_source  物品信息界面，显示来源按钮（主要针对未获得的物品，却要显示来源的）
     */
    setDefaultTip: function (is_show_tips, is_show_source, source_callback,is_tips_source) {
        if(is_show_tips!=null){
            this.is_show_tips = is_show_tips;
        }else{
            this.is_show_tips = true;;
        }
        
        this.is_show_source = is_show_source || false;
        this.source_callback = source_callback;
        this.is_tips_source = is_tips_source || false;
    },


    //加号
    //锁
    showAddIcon: function (bool) {
        if (bool == false && !this.add_btn_sp) return
        if (this.main_container == null) {
            this.add_btn_bool = bool;
            return
        }
        if (!this.add_btn_sp) {
            this.add_btn_sp = Utils.createImage(this.main_container, null, 0, 0, cc.v2(0.5, 0.5));
            this.loadRes(PathTool.getCommonIcomPath("common_90026"), function (sp) {
                if(this.add_btn_sp){
                    this.add_btn_sp.spriteFrame = sp;
                }
            }.bind(this))
            var btn = this.add_btn_sp.node.addComponent(cc.Button);
            btn.transition = cc.Button.Transition.SCALE;
            if (this.callback) {
                btn.node.on(cc.Node.EventType.TOUCH_END, function () {
                    this.callback();
                }, this)
            }
        }
        this.add_btn_sp.node.active = bool;
    },

    //隐藏背景框
    setIsShowBackground: function (status) {
        this.bg_status = status;
        if (this.quality_bg)
            this.quality_bg.node.active = status;
    },

    setEmptyIconPath: function (icon_path) {
        this.empty_icon_path = icon_path;
    },

    getData:function(){
        return this.data;
    },

    setCheckBoxStatus: function (status, is_select) {
        if (this.show_check_box == false) return
        if (status == false) {
            if (this.check_box != null) {
                this.check_box.setVisible(false);
            }
        } else {
            if (this.check_box == null) {
                var ToggleItem = require("toggle_item");
                this.check_box = new ToggleItem();
                if (this.check_box_pos) {
                    this.check_box.setPosition(this.check_box_pos)
                } else {
                    this.check_box.setPosition(cc.v2(25,25));
                }
                this.check_box.setParent(this.main_container);
                this.check_box.setVisible(true);
                this.check_box.setData(this.data.showSellStatus)
                this.check_box.addClickCallBack(function (isSelected) {
                    if (this.data != null && this.data.id != null && this.data.showSellStatus) {
                        this.data.setGoodsAttr("showSellStatus", { status: true, select: isSelected });
                        if (this.click_check_callback) {
                            this.click_check_callback(isSelected, this)
                        }
                    }
                }.bind(this))
            } else {
                this.check_box.setVisible(true);
                this.check_box.setData(this.data.showSellStatus)
            }
        }
        if (is_select == null) {
            is_select = false;
        }
        if (this.check_box) {
            this.check_box.setSelected(is_select);
        }
    },
    setReceivedIcon(status){
        this.receivedStatus = status;
        if(this.root_wnd){
            if(status){
                if(this.received_icon == null){
                    this.received_icon = Utils.createImage(this.root_wnd,null,0,0,cc.v2(0.5, 0.5))
                    let path = PathTool.getCommonIcomPath("common_1000")
                    this.loadRes(path,function(res){
                        this.received_icon.spriteFrame = res;
                    }.bind(this))
                }
                this.setItemIconUnEnabled(true)
                this.received_icon.node.active = true;
            }else{
                if(this.received_icon){
                    this.received_icon.node.active = false;
                }
                this.setItemIconUnEnabled(false)
            }
        }
    },
    //显示双倍
    setDoubleIcon(status){
        if(status){
            if(this.double_icon == null){
                this.double_icon = Utils.createImage(this.main_container,null,-28,27.5)
                this.loadRes(PathTool.getUIIconPath("common","txt_cn_common_90008"),function(res){
                    this.double_icon.spriteFrame = res
                }.bind(this))
            }
            this.double_icon.node.active = true
        }else{
            if(this.double_icon){
                this.double_icon.node.active = false;
            }
        }
    },
    setSummonNumber(){
        if(this.root_wnd){
            this.extend_label.string = Number(this.data.probability).toFixed(3) + "%";
            this.extend_label.fontSize = 22;
            this.extend_label.lineHeight = 30; 
            this.extend_label.node.y = -65
        }
    },
    setPickUp(){
        if(this.root_wnd){
            this.pickUpSign.active = this.data.pickup === 1;
        }
    },
    // 战令活动的个锁
    showOrderWarLock:function(bool){
        this.isShowOrderWarLock = bool;
        if(bool == false && !this.order_war_lock)return;
        if(!this.root_wnd){
            return;
        }
        if(!this.order_war_lock){
            this.order_war_lock = Utils.createImage(this.root_wnd, PathTool.getUIIconPath("common", "common_90009"), -53,38, cc.v2(0.5, 0.5), false);
        }
        this.order_war_lock.node.active = bool;
    },

    // 战令活动 物品是否领取状态
    IsGetStatus:function(bool){
        this.is_show_get_select = bool;
        if(bool == false && !this.is_get_select)return;
        if(!this.root_wnd)return;
        if(!this.is_get_select){
            this.is_get_select = new cc.Node();
            this.is_get_select.setContentSize(cc.size(120, 120))
            this.is_get_select.setAnchorPoint(0.5,0.5);
            this.is_get_select.setPosition(0,0);
            this.root_wnd.addChild(this.is_get_select);
            
            var bg = Utils.createImage(this.is_get_select, PathTool.getUIIconPath("common", "common_1074"), 0,0, cc.v2(0.5, 0.5), false,null,true);
            bg.node.setContentSize(cc.size(120, 120));
            Utils.createImage(this.is_get_select, PathTool.getUIIconPath("common", "common_1043"), 0,0, cc.v2(0.5, 0.5), false);
        }
        this.is_get_select.active = bool;
    },
    checkIsWeekCard(data){
        let card_type = 0
        if(data){
            for(let i=0;i<data.length;++i){
                let v = data[i]
                if(v == 50){
                    card_type = v
                    break
                }
            }
        }
        return card_type
    },
    showWeekCardTag(status){
        if(status == true){
            let res = PathTool.getUIIconPath("tips","txt_cn_tips_1")
            if(!this.use_week_card){
                this.use_week_card = Utils.createImage(this.main_container, res,-27, 40, cc.v2(0.5,0.5))
            }
            this.use_week_card.node.active = true
        }else{
            if(this.use_week_card){
                this.use_week_card.node.destroy()
                this.use_week_card = null;
            }
        }
    },

    //设置选中状态
    setSelected:function(status){
        if(this.select){
            this.select.active = status;
        }
    },
    
    onDelete: function () {
        if (this.heroExpeditTag) {
            this.heroExpeditTag.node.destroy();
            this.heroExpeditTag = null;
        }
        if (this.add_btn_sp) {
            this.add_btn_sp.node.destroy();
            this.add_btn_sp = null;
        }
        if (this.heroExpeditTag_desc) {
            this.heroExpeditTag_desc.node.destroy();
            this.heroExpeditTag_desc = null;
        }
        if(this.check_box){
            this.check_box.deleteMe();
            this.check_box = null;
        }

        this.item_num = "";
        this.isSetEffect = false;
        if(this.item_icon){
            this.item_icon.spriteFrame = null;
        }
        this.data = null;
        if (this.root_wnd && this.click_event) {
            this.root_wnd.off(cc.Node.EventType.TOUCH_END,this.onClickRootWnd,this)
            this.root_wnd.off(cc.Node.EventType.TOUCH_START, this.onClickRootWnd, this);
            this.root_wnd.off(cc.Node.EventType.TOUCH_CANCEL, this.onClickRootWnd, this);
            if(this.block_event){
                this.block_event.enabled = false;
            }
                
            this.click_event = false
        }
        ItemsPool.getInstance().cacheItem(this);
    }
})