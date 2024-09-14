// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-04-02 09:39:00
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var Controller = require("hero_controller")
var RoleController = require("role_controller")
var BackPackConst = require("backpack_const")
var GoodsVo = require("goods_vo");
var HeroConst = require("hero_const")
var HeroTipsWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("hero", "hero_tips_panel1");
        this.controller = Controller.getInstance()
        this.model = Controller.getInstance().getModel()
        this.role_vo = RoleController.getInstance().getRoleVo() 
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Tips;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
    },

    // 可以初始化声明一些变量的
    initConfig:function(){
        var self = this
        this.itemScale = 0.8
        self.break_icon_list = {}
        self.break_icon_bg_list = {}
        self.attr_list = {[1]:"atk",[2]:"hp",[3]:"def",[4]:"speed"}
        // --技能 
        self.skill_item_list = {}

        self.equip_type_list = HeroConst.EquipPosList
        self.equip_icon_name_list = {
            [BackPackConst.item_type.WEAPON] : "hero_info_7",  //--武器icon
            [BackPackConst.item_type.SHOE] : "hero_info_10",  //--鞋子icon
            [BackPackConst.item_type.CLOTHES] : "hero_info_9",  //--衣服icon 
            [BackPackConst.item_type.HAT] : "hero_info_8",  //--裤子icon
            [5] : "hero_info_11", //--武器icon--神器
            [6] : "hero_info_11", //--武器icon
        }
        self.holy_equip_type_list = HeroConst.HolyequipmentPosList
        self.holy_equip_icon_name_list = {
            [BackPackConst.item_type.GOD_EARRING] : "hero_info_25",  //--耳环
            [BackPackConst.item_type.GOD_RING] : "hero_info_27",  //--戒指
            [BackPackConst.item_type.GOD_NECKLACE] : "hero_info_26",  //--项链
            [BackPackConst.item_type.GOD_BANGLE] : "hero_info_28",  //--手镯
        }
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    openCallBack:function(){
        var self = this
        self.background = self.root_wnd.getChildByName("background")

        self.main_panel = self.root_wnd.getChildByName("main_panel")

        self.top_panel = self.main_panel.getChildByName("top_panel")  

        self.hero_node = self.top_panel.getChildByName("hero_node")
        self.hero_item = ItemsPool.getInstance().getItem("hero_exhibition_item"); 
        self.hero_item.setScale(0.8)
        self.hero_item.setParent(self.hero_node)
        // self.hero_item.show();

        self.hero_name_lb = self.top_panel.getChildByName("hero_name").getComponent(cc.Label)

        self.advanced_node = self.top_panel.getChildByName("advanced_node")
        
        // --战力    
        self.fight_lb = self.top_panel.getChildByName("power_click").getComponent("CusRichText")

        // --按钮
        self.comment_btn = self.top_panel.getChildByName("comment_btn")
        self.look_btn = self.top_panel.getChildByName("look_btn")

        // --属性信息
        let attr_panel = self.top_panel.getChildByName("attr_panel")
        self.attr_icon_list = {}
        self.attr_icon_list[1] = attr_panel.getChildByName("attr_icon1")
        self.attr_icon_list[2] = attr_panel.getChildByName("attr_icon2")
        self.attr_icon_list[3] = attr_panel.getChildByName("attr_icon3")
        self.attr_icon_list[4] = attr_panel.getChildByName("attr_icon4")

        self.attr_label_list = {}
        self.attr_label_list[1] = attr_panel.getChildByName("attr_label1")
        self.attr_label_list[2] = attr_panel.getChildByName("attr_label2")
        self.attr_label_list[3] = attr_panel.getChildByName("attr_label3")
        self.attr_label_list[4] = attr_panel.getChildByName("attr_label4")

        self.skill_Layout = self.top_panel.getChildByName("scroll_Layout")

        self.equip_panel = self.main_panel.getChildByName("equip_panel")

        self.equip_node_list = {}
        for(let i=1;i<=6;++i){
            self.equip_node_list[i] = self.equip_panel.getChildByName("equip_node"+i)
        }
        self.holy_equip_node_list = {}
        for(let i=1;i<=4;++i){
            self.holy_equip_node_list[i] = self.equip_panel.getChildByName("holy_equip_node_"+i) 
        }
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        this.background.on("touchend",this.onClickCloseBtn,this)
        this.comment_btn.on("touchend",this.onClickCommentBtn,this)
        this.look_btn.on("touchend",this.onClickLookBtn,this)
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(data) {
        cc.log(data);

        var self = this
        if(!data.hero_vo)return
        if(data.is_hide_comment){
          this.comment_btn.active = false;
        }
        self.hero_vo = data.hero_vo
        let hero_vo = data.hero_vo
        let config = Config.partner_data.data_partner_base[hero_vo.bid]
        self.hero_vo.name = self.hero_vo.name || config.name
        if(!config) return 
        // --头像
        self.hero_item.setData(hero_vo)
        self.hero_item.show();

        // --名字
        self.hero_name_lb.string = config.name 

        // --战斗力
        let power = hero_vo.power || 0
        self.fight_lb.setNum(power) 
        // --进阶
        self.updateAdvanceInfo(hero_vo)

        // --属性icon
        for (let i in self.attr_list){
            let attr_str = self.attr_list[i]
            if (self.attr_icon_list[i]) {
                let res_id = PathTool.getAttrIconByStr(attr_str)
                let res = PathTool.getUIIconPath("common",res_id)
                this.loadRes(res,function(SpriteFrame){
                    self.attr_icon_list[i].getComponent(cc.Sprite).spriteFrame = SpriteFrame
                })
                // loadSpriteTexture(self.attr_icon_list[i], res, LOADTEXT_TYPE_PLIST)   
            }
            if (self.attr_label_list[i]) {
                let value = hero_vo[attr_str] || 0
                self.attr_label_list[i].getComponent(cc.Label).string = value
            }
        }
        let key = Utils.getNorKey(config.type, config.break_id, hero_vo.break_lev)
        let break_config = Config.partner_data.data_partner_brach[key]


        self.initSkill(hero_vo, break_config)


        // --隐藏装备
        if (data.is_hide_equip) {
            self.equip_panel.active = false 
        }else{
            //基础装备
            self.updateEquip(hero_vo)

            //天赋
            // let skill_tips = self.equip_panel.getChildByName("skill_tips")
            // let skill_node = self.equip_panel.getChildByName("skill_node")
            // self.updateTalent(hero_vo, skill_tips, skill_node)

            // //神装
            // self.updateHolyEquip(hero_vo)
        }
    },
    onClickLookBtn(){
        Utils.playButtonSound(3)
        if (!this.hero_vo)  return 
        this.controller.openHeroTipsAttrPanel(true, this.hero_vo)
    },
    initSkill(hero_vo, break_config){
        var self = this
        let key = Utils.getNorKey(hero_vo.bid, hero_vo.star)
        let star_config = gdata("partner_data","data_partner_star",key)
        if (!star_config) return 
        let skill_list = []
        for (let i=0;i<star_config.skills.length;++i){
            // -- 不是普通攻击 1表示普通攻击
            let v = star_config.skills[i]
            if (v[0] != 1){
                skill_list.push(v);
            }
        }
        for(let i=0;i<skill_list.length;++i){
            let skill = skill_list[i]
            let config = Config.skill_data.data_get_skill[skill[1]]
            if (config){
                let node = new cc.Node()
                node.setContentSize(88,88)
                this.skill_Layout.addChild(node)
                // --是否锁住
                let is_lock = false
                if ( skill[0] > break_config.skill_num){
                    is_lock = true
                }
                if (!self.skill_item_list[i]){
                    let SkillItem = require("skill_item")
                    self.skill_item_list[i] = new SkillItem();
                    self.skill_item_list[i].showUnEnabled(is_lock)
                    self.skill_item_list[i].setParent(node);
                    self.skill_item_list[i].setScale(this.itemScale);
                    self.skill_item_list[i].setShowTips(true)
                }
                self.skill_item_list[i].setData(skill[1])
            }else{ 
                cc.log("技能表id:  没发现", skill.skill_bid)
            }
        }
    },
    // --更新进阶显示
    updateAdvanceInfo(hero_vo){
        var self = this
        let max_count = this.model.getHeroMaxBreakCountByInitStar(hero_vo.star)
        let star_width = 27 + 8
        let break_count = hero_vo.break_lev
        let x = 0
        for (let i in self.break_icon_list){
            let v = self.break_icon_list[i]
            v.active = false
        }
        for(let i= 1;i<=max_count;++i){
            if (i <= break_count){
                if (!self.break_icon_list[i]) {
                    let res = PathTool.getUIIconPath("tips","tips_12")
                    let node = new cc.Node()
                    this.loadRes(res,function(SpriteFrame){
                        node.addComponent(cc.Sprite).spriteFrame = SpriteFrame 
                    }.bind(this))
                    this.advanced_node.addChild(node)
                    self.break_icon_list[i] = node
                }else{
                    self.break_icon_list[i].active = true
                }
                
                if (self.break_icon_bg_list[i]){
                    self.break_icon_bg_list[i].active = false 
                }
            }else{
                if (self.break_icon_list[i]){
                    self.break_icon_list[i].active = false
                }
                if (! self.break_icon_bg_list[i]){
                    let res = PathTool.getUIIconPath("tips","tips_13")
                    let node = new cc.Node()
                    this.loadRes(res,function(SpriteFrame){
                        node.addComponent(cc.Sprite).spriteFrame = SpriteFrame 
                    }.bind(this))
                    this.advanced_node.addChild(node)
                    self.break_icon_bg_list[i] = node
                }else{
                    self.break_icon_bg_list[i].active = true
                }
            }
        }
    },
    onClickCloseBtn(){
        Utils.playButtonSound(2)
        this.controller.openHeroTipsPanel(false)
    },
    //评论
    onClickCommentBtn(){
        Utils.playButtonSound(1)
        var self = this
        if (!this.hero_vo) return 
        var PokedexController = require("pokedex_controller")
        PokedexController.getInstance().openCommentWindow(true, this.hero_vo,function(){
            self.onClickCloseBtn()
        })
    },
    updateEquip(hero_vo){
        var self = this;
        self.equip_item_list = {}
        // --装备
        let equip_vo_list = {}
        if(hero_vo.eqms != null){
            // --说明是网络返回的
            for(let i=0;i<hero_vo.eqms.length;++i){
                let v = hero_vo.eqms[i]
                equip_vo_list[v.type] = new GoodsVo()
                equip_vo_list[v.type].setBaseId(v.base_id)
            }
        }else if(hero_vo.eqm_list != null){
            // --说明是本地的 hero_vo
            for(let i in hero_vo.eqm_list){
                let v = hero_vo.eqm_list[i]
                equip_vo_list[i] = v
            }
        }

        // --神器
        if(hero_vo.artifacts != null){
            // --说明是网络返回的
            for(let i=0;i<hero_vo.artifacts.length;++i){
                let artifact_data = hero_vo.artifacts[i]
                // --因为有可能是神装 artifact_data.artifact_pos == 123 ~ 126 而神器的位置是1, 2
                if(artifact_data.artifact_pos < 100 ){
                    let pos = artifact_data.artifact_pos + 4
                    equip_vo_list[pos] = new GoodsVo()//GoodsVo.New(artifact_data.base_id)
                    if(equip_vo_list[pos]["initAttrData"]){
                        equip_vo_list[pos].initAttrData(artifact_data)
                    }
                }
            }
        }else if(hero_vo.artifact_list != null){
            // --说明是本地的 hero_vo
            for(let k in hero_vo.artifact_list){
                let v = hero_vo.artifact_list[k]
                equip_vo_list[Number(k)+4] = v
            }
        }

        for(let i in self.equip_item_list){
            let item = self.equip_item_list[i]
            item.setData()
            // if item.empty_icon then 
            //     item.empty_icon:setVisible(true)
            // end
            item.equip_vo = null
        }

        for(let i in self.equip_node_list){
            i = Number(i)
            let equip_node = self.equip_node_list[i]
            let equip_type = self.equip_type_list[i] || i
            let equip_vo = equip_vo_list[equip_type]
            if(self.equip_item_list[equip_type] == null){
                let item = ItemsPool.getInstance().getItem("backpack_item")
                item.setDefaultTip()
                item.setParent(equip_node);
                item.setPosition(0,0)
                item.initConfig(false, this.itemScale, false, true);
                item.show();
                self.equip_item_list[equip_type] = item    
            }

            if(equip_vo){
                self.equip_item_list[equip_type].setData(equip_vo)
            }else{
                let node = new cc.Node()
                equip_node.addChild(node,1)
                node.scale = this.itemScale;
                let path = PathTool.getUIIconPath("hero",self.equip_icon_name_list[equip_type])
                this.loadRes(path,function(res){
                    node.addComponent(cc.Sprite).spriteFrame = res
                }.bind(this))
            }
        }

    },
    updateTalent(hero_vo, skill_tips, skill_node){
        //天赋暂时没有
        if(!skill_tips) return;
        if(!skill_node) return;
        var self = this;
        if(self.talent_skill_item_list) return;
        // let skill_list = {}
        // if(hero_vo.talent_skill_list){
        //     // --本地的
        //     for k,v in pairs(hero_vo.talent_skill_list) do
        //         let data = {}
        //         data.pos = k
        //         data.skill_id = v
        //         table_insert(skill_list, data)
        //     end
        // }else if(hero_vo.dower_skill){
        //     // --网络的
        //     skill_list = hero_vo.dower_skill
        // }
        // table_sort(skill_list, function(a, b) return a.pos < b.pos end)
        // if #skill_list > 0 then
        //     skill_tips:setVisible(false)
        //     let item_width = 104
        //     -- let x = -(item_width * #skill_list * 0.5) + item_width * 0.5
        //     let x = (#skill_list - 1) * item_width
        //     self.talent_skill_item_list = {}
        //     for i,v in ipairs(skill_list) do
        //         let config = Config.SkillData.data_get_skill(v.skill_id)
        //         if config then
        //             self.talent_skill_item_list[i] = SkillItem.new(true,true,true,this.itemScale,nil,false)
        //             self.talent_skill_item_list[i]:setPosition((x + (i - 1)*item_width), 0)
        //             self.talent_skill_item_list[i]:setData(config)
        //             skill_node:addChild(self.talent_skill_item_list[i])
        //         end
        //     end
        // else
        //     skill_tips:setString(TI18N("暂无天赋"))
        // end
    },
    updateHolyEquip(hero_vo){
        //神装暂时没有
    },
    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function() {
        if(this.hero_item){
            this.hero_item.deleteMe()
            this.hero_item = null;
        }
        if(this.skill_item_list){
            for(let i in this.skill_item_list){
                this.skill_item_list[i].deleteMe()
            }
            this.skill_item_list = null
        }
        if(this.equip_item_list){
            for(let i in this.equip_item_list){
                this.equip_item_list[i].deleteMe()
            }
            this.equip_item_list = null
        }
        this.controller.openHeroTipsPanel(false)
    },

})