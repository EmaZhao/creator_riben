// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-05-15 19:15:19
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var SkillItem = require("skill_item")
var BackpackController = require("backpack_controller")
var HeroController = require("hero_controller")
var HeroEvent = require("hero_event")
var CommonAlert = require("commonalert")
var HeroTalentSkillLevelUpWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("hero", "hero_talent_skill_level_up_panel");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Mini;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.is_full_screen = false
        this.ctrl = HeroController.getInstance()
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        // --消耗数据列表
        this.item_list = []
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        var self = this
        self.background = self.root_wnd.getChildByName("background");

        self.main_container = self.root_wnd.getChildByName("main_container")
        self.title = self.main_container.getChildByName("win_title")
        self.title.getComponent(cc.Label).string = Utils.TI18N("技能升级");

        self.skill_up_panel = self.main_container.getChildByName("skill_up_panel")
        let show_item_node = self.skill_up_panel.getChildByName("show_item_node")
        self.skill_up_info = {}
        self.skill_up_info.skill_item =  new SkillItem()
        self.skill_up_info.skill_item.setLeveStatus(false)
        self.skill_up_info.skill_item.setParent(show_item_node);
        self.skill_up_info.skill_item.setScale(0.9);
        self.skill_up_info.skill_name = self.skill_up_panel.getChildByName("skill_name").getComponent(cc.Label)
        self.skill_up_info.skill_desc = self.skill_up_panel.getChildByName("desc").getComponent(cc.Label)

        self.skill_down_panel = self.main_container.getChildByName("skill_down_panel")
        let show_item_node1 = self.skill_down_panel.getChildByName("show_item_node")
        self.skill_down_info = {}
        self.skill_down_info.skill_item =  new SkillItem()
        self.skill_down_info.skill_item.setLeveStatus(false)
        self.skill_down_info.skill_item.setParent(show_item_node1)
        self.skill_down_info.skill_item.setScale(0.9);
        self.skill_down_info.skill_name = self.skill_down_panel.getChildByName("skill_name").getComponent(cc.Label)
        self.skill_down_info.skill_desc = self.skill_down_panel.getChildByName("desc").getComponent(cc.Label)

        self.box_90025_2 = self.main_container.getChildByName("box_90025_2")
        self.page_name_1 = self.main_container.getChildByName("page_name_1")
        self.page_name_1.getComponent(cc.Label).string = Utils.TI18N("技能升级")
        self.page_name_2 = self.main_container.getChildByName("page_name_2")
        self.page_name_2.getComponent(cc.Label).string = Utils.TI18N("升级消耗")
        self.cost_node = self.main_container.getChildByName("cost_node")

        self.left_btn = self.main_container.getChildByName("left_btn")
        self.left_btn.getChildByName("label").getComponent(cc.Label).string = Utils.TI18N("遗忘技能")
        self.right_btn = self.main_container.getChildByName("right_btn")
        self.right_btn.getChildByName("label").getComponent(cc.Label).string = Utils.TI18N("升 级")

        self.arrow = self.main_container.getChildByName("Sprite_1")
        self.skill_max_label = self.main_container.getChildByName("skill_max_label").getComponent(cc.Label)
        self.skill_max_label.string = "";
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        this.addGlobalEvent(HeroEvent.Hero_Level_Up_Talent_Event, function(data){
            if(!data) return;
            if(!this.hero_vo) return;
            if(data.partner_id == this.hero_vo.partner_id){
                let skill_id = this.hero_vo.talent_skill_list[this.pos]
                this.initSkillInfo(skill_id)
            }
        }.bind(this))
        this.right_btn.on('click',this.onClickBtnRight,this)
        this.background.on('touchend',this.onClickBtnClose,this)
        this.left_btn.on('click',this.onClickBtnLeft,this)
    },
    onClickBtnRight(){
        if(!this.hero_vo)return;
        if(!this.pos) return;
        Utils.playButtonSound(1)
        this.ctrl.sender11097(this.hero_vo.partner_id, this.pos)
    },
    onClickBtnLeft(){
        if(!this.hero_vo)return;
        if(!this.pos) return;
        if(!this.skill_id) return;
        Utils.playButtonSound(1)
        let cost_config = Config.partner_skill_data.data_partner_skill_back[this.skill_id]
        if(cost_config){
            if(cost_config.expend.length == 0){
                thi.ctrl.sender11098(this.hero_vo.partner_id, this.pos)
                this.ctrl.openHeroTalentSkillLevelUpPanel(false)
                return
            }
            let str = Utils.TI18N("遗忘该技能需消耗")
            let frame_arrays = [];
            for(let i=0;i<cost_config.expend.length;++i){
                let v = cost_config.expend[i]
                let item_config = Utils.getItemConfig(v[0])
                if(item_config){
                    if(i != 0){
                        str = str+", "
                    }
                    let good_res_path = "3";
                    let text = "<img src='%s' /><color=#289b14>%s</color>";
                    let good_path = PathTool.getIconPath("item", "3");
                    frame_arrays.push(good_path);
                    let str1 = cc.js.formatStr(text,good_res_path, v[1])
                    str = str+str1
                }
            }
            if(cost_config.award1.length > 0){
                str = str + "\n(返還資源"
                for(let i=0;i<cost_config.award1.length;++i){
                    let v = cost_config.award1[i]
                    let item_config = Utils.getItemConfig(v[0])
                    if(item_config){
                        if(i != 0){
                            str = str + ", "
                        }
                        let good_res_path = item_config.icon
                        let text = "<img src='%s' /><color=#289b14>%s</color>";
                        let good_path = PathTool.getIconPath("item", item_config.icon);
                        frame_arrays.push(good_path);
                        let str1 = cc.js.formatStr(text,good_res_path, v[1])
                        str = str + str1
                    }
                }
                str = str+")"
            }

            CommonAlert.show(str, Utils.TI18N("确定"), function(){
                this.ctrl.sender11098(this.hero_vo.partner_id, this.pos)
                this.ctrl.openHeroTalentSkillLevelUpPanel(false)
            }.bind(this), Utils.TI18N("取消"), null,null,null,{resArr: frame_arrays})
        }else{
            this.ctrl.sender11098(self.hero_vo.partner_id, self.pos)
            this.ctrl.openHeroTalentSkillLevelUpPanel(false)
        }
    },
    onClickBtnClose(){
        Utils.playButtonSound(2)
        this.ctrl.openHeroTalentSkillLevelUpPanel(false)
    },
    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(data){
        let hero_vo = data.hero_vo 
        let pos = data.pos 
        let skill_id = data.skill_id 
        if(!hero_vo)  return;
        if(!pos) return;
        if(!skill_id) return;
        this.pos = pos
        this.hero_vo = hero_vo
        this.initSkillInfo(skill_id)
    },
    initSkillInfo(skill_id){
        if(!skill_id)return;
        var self = this
        let config = Config.partner_skill_data.data_partner_skill_level[skill_id]
        self.skill_id = skill_id
        if(config){
            self.showSkillInfo(config.id, self.skill_up_info)
            self.showSkillInfo(config.next_id, self.skill_down_info)
            self.showCostInfo(config)
        }else{
            self.showSkillInfo(skill_id, self.skill_up_info)
            self.box_90025_2.active = false;
            self.page_name_2.active = false;
            self.arrow.active = false;
            self.right_btn.active = false
            self.skill_max_label.string = Utils.TI18N("该技能已满级")
            self.skill_down_panel.active = false;
            self.cost_node.active = false;
            let node = new cc.Node()
            this.main_container.addChild(node)
            node.y = -49.5
            this.loadRes(PathTool.getUIIconPath("bigbg/hero","hero_talent_skill_max"),function(res){
                node.addComponent(cc.Sprite).spriteFrame = res
            }.bind(this))
            self.left_btn.x = 0
            self.skill_max_label.node.y = -40.5;
            self.skill_max_label.node.zIndex = 2;
        }
    },
    showSkillInfo(skill_id, skill_info){
        let config = gdata("skill_data","data_get_skill",skill_id);
        if(!config) return;
        if(skill_info.skill_item){
            skill_info.skill_item.setData(skill_id)
            skill_info.skill_item.setShowTips(true)
        }
        skill_info.skill_name.string = config.name;
        skill_info.skill_desc.string = config.des;
    },
    showCostInfo(config){
        if(!config) return;
        var self = this;
        for(let i=0;i<self.item_list.length;++i){
            let item = self.item_list[i]
            // item:setPositionX(10000) --相当于隐藏
        }
    
        let item_width = 120 + 160
        let start_x = - item_width * config.expend.length/2 + 80
        for(let i=0;i<config.expend.length;++i){
            let cost = config.expend[i]
            let _x = start_x + i  * item_width
            if(self.item_list[i] == null){
                self.item_list[i] = {}
                self.item_list[i].item = ItemsPool.getInstance().getItem("backpack_item")
                self.item_list[i].item.setDefaultTip(true, null, null , 1)
                self.item_list[i].item.setParent(self.cost_node);
                self.item_list[i].item.initConfig(false, 0.8, true, true,false);
                self.item_list[i].item.show();    
                self.item_list[i].name = Utils.createLabel(19,new cc.Color(100,50,35),null,_x + 55,5,"",self.cost_node);
                self.item_list[i].name.lineHeight = 21;
                self.item_list[i].image =  Utils.createImage(self.cost_node,null,_x + 55,0,cc.v2(0,1),null,null,true);
                self.item_list[i].image.node.setContentSize(170 * 0.8,36 * 0.8)
                self.item_list[i].needNum = Utils.createLabel(17,null,null,10,-15,"",self.item_list[i].image.node,null,cc.v2(0,0.5))
                self.item_list[i].needNum.lineHeight = 19
                this.loadRes(PathTool.getUIIconPath("common","common_90003"),function(res){
                    self.item_list[i].image.spriteFrame = res
                }.bind(this))
            }
            self.item_list[i].item.setPosition(_x, 0)
            let item_config = Utils.getItemConfig(cost[0])
            if(item_config){
                self.item_list[i].item.setData(item_config)
                self.item_list[i].name.string = item_config.name
                let have_num = BackpackController.getInstance().getModel().getItemNumByBid(item_config.id)
                let color16
                if(have_num < cost[1]){
                    color16 = Config.color_data.data_color16[127]
                }else{
                    color16 =  "#FFFFFF"
                }
                self.item_list[i].needNum.string =  Utils.getMoneyString(have_num) + "/" + cost[1];
                let color = self.item_list[i].needNum.node.color;
                color.fromHEX(color16);
                self.item_list[i].needNum.node.color = color;
            }
        }
    },
    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        if(this.skill_up_info && this.skill_up_info.skill_item){
            this.skill_up_info.skill_item.deleteMe()
            this.skill_up_info.skill_item = null;
        }
        this.skill_up_info = null

        if(this.skill_down_info && this.skill_down_info.skill_item){
            this.skill_down_info.skill_item.deleteMe()
            this.skill_down_info.skill_item = null
        }
        this.skill_down_info = null;

        for(let i=0;i<this.item_list.length;++i){
            if(this.item_list[i].item){
                this.item_list[i].item.deleteMe()
                this.item_list[i] = null;
            }
        }
        this.item_list = null
        this.ctrl.openHeroTalentSkillLevelUpPanel(false)
    },
})