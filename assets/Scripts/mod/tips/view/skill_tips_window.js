// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-04-02 18:15:31
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var TipsConst = require("tips_const");
var Skill_tipsWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("tips", "skill_tips");
        this.viewTag = SCENE_TAG.msg;           //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        // this.win_type = WinType.Full;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        this.tips_controller = require("tips_controller").getInstance();
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        var self = this
        self.background = self.root_wnd.getChildByName("background")
        if(window.IS_PC){
          if(this.background.getComponent(cc.StudioWidget)) this.background.getComponent(cc.StudioWidget).enabled = false;
          this.background.setContentSize(2200,1280);
        }
        self.main_panel = self.root_wnd.getChildByName("main_panel")

        self.container = self.main_panel.getChildByName("container")            //-- 背景,需要动态设置尺寸
        self.container_init_size = self.container.getContentSize()

        self.base_panel = self.container.getChildByName("base_panel")
        self.base_panel_height = self.base_panel.getContentSize().height

        self.skill_icon_sp = self.base_panel.getChildByName("skill_icon").getComponent(cc.Sprite)
        self.skill_name_lb = self.base_panel.getChildByName("name").getComponent(cc.Label)
        self.skill_type_lb = self.base_panel.getChildByName("skill_type").getComponent(cc.Label)

        self.line = self.container.getChildByName("line")
        self.line_2 = self.container.getChildByName("line2")
        self.skill_desc_lb = self.container.getChildByName("desc").getComponent(cc.Label)

        self.extend_desc_rt = self.container.getChildByName("extend_desc").getComponent(cc.RichText)

        self.buff_desc_rt = self.container.getChildByName("buff_desc").getComponent(cc.RichText)

        self.next_skill_rt = self.container.getChildByName("next_skill_txt").getComponent(cc.RichText)
        
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        this.background.on("touchend", (function (event) {
            Utils.playButtonSound(2)
            this.tips_controller.closeTIpsByType(TipsConst.type.SKILL);
        }).bind(this));
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(data){
        this.updateVo(data.skill_vo, data.is_lock, data.not_show_next, data.hide_flag)
    },  
    // --[[
    //     @功能:设置技能信息
    //     @参数:Config.Skill   ,  Config.RoleCareerSkill
    //     @返回值:
    // ]]
    updateVo( skill_vo, is_lock, not_show_next, hide_flag ){
        var self = this
        self.skill_vo = skill_vo
        let level = skill_vo.level || 1
        // -- 技能名字
        if (!hide_flag){
            self.skill_name_lb.string = skill_vo.name+"  Lv."+level
        }else{
            self.skill_name_lb.string = skill_vo.name
        }
        
        
        this.loadRes(PathTool.getIconPath("skillicon",skill_vo.icon),function(res){
            this.skill_icon_sp.spriteFrame = res
        }.bind(this))
        self.skill_type_lb.node.active = true
        if(skill_vo.type == "active_skill"){
            self.skill_type_lb.string = Utils.TI18N("类型：主动技能");
        }else{ 
            self.skill_type_lb.string = Utils.TI18N("类型：被动技能")
        }
        
        // -- 统计最大高度
        let total_height = 4 + self.base_panel_height
        //说明
        let skill_des_height = 0
        if (self.skill_vo.des != "" ){
            self.skill_desc_lb.string = self.skill_vo.des
            self.skill_desc_lb._forceUpdateRenderData(true)
            skill_des_height = self.skill_desc_lb.node.getContentSize().height 
            total_height  = total_height + skill_des_height + 2
        }
        //冷却时间
        let extend_desc_height = 0
        if(!hide_flag){
            let extend_str = ""
            if (self.skill_vo.cd == 0) {
                extend_str = "<color=#3f3234>クールダウンなし</color>";
            }else{
                extend_str = "<color=#329119>"+self.skill_vo.cd+"</c><color=#3f3234>ターンのクールタイム</c>";
            }
            if (self.skill_vo.fire_cd != 0) {
               
                extend_str +=  Utils.TI18N("<color=#3f3234>，第</c><color=#329119>")+self.skill_vo.fire_cd+"</c><color=#3f3234>ターンで使用</color>";
            }
            self.extend_desc_rt.string = extend_str
            extend_desc_height = self.extend_desc_rt.node.getContentSize().height
        }        
        total_height  = total_height + extend_desc_height + 18
        
        let buff_desc_str = ""
        let buff_desc_height= 0
        if (self.skill_vo.buff_des && self.skill_vo.buff_des[0] && Utils.next(self.skill_vo.buff_des[0])){
            self.line.active = true
            let buff_config = Config.skill_data.data_get_buff 
            for(let i=0;i<self.skill_vo.buff_des[0].length;++i){ //i, v in ipairs(self.skill_vo.buff_des[1]) do
                let v = self.skill_vo.buff_des[0][i]
                let config = buff_config[v]
                if(i != 0){
                    buff_desc_str += "<br/>"
                }
                if (config){
                    buff_desc_str += "<color=#a55f14>【" +  config.name + "】</c><br/><color=#3f3234>"+config.desc+"</color> "
                }
            }
        }
        if (buff_desc_str != ""){
            self.buff_desc_rt.string = buff_desc_str
            buff_desc_height = self.buff_desc_rt.node.getContentSize().height
            total_height  = total_height + self.buff_desc_rt.node.getContentSize().height + 10
        }
        
        // -- 下级描述
        if (self.skill_vo.open_desc != "" && !not_show_next && !hide_flag){
            self.line_2.active = true;
            let next_skill_des = ""
            if (is_lock){ //-- 未开启
                next_skill_des = StringUtil.parse(self.skill_vo.open_desc)
            }else if(self.skill_vo.next_id == 0 ){ // -- 已满级
                next_skill_des = Utils.TI18N("技能已满级");
            }else{
                next_skill_des = StringUtil.parse(self.skill_vo.skill_desc) 
            }
            self.next_skill_rt.string = next_skill_des
            total_height  = total_height + self.next_skill_rt.node.getContentSize().height + 25
        }
        
        total_height = total_height + 20
            
        self.container.setContentSize(cc.size(self.container_init_size.width, total_height))
        self.base_panel.y = -4
        self.skill_desc_lb.node.y = self.base_panel.y - self.base_panel.height -2  //-4-self.base_panel_height-2
        self.extend_desc_rt.node.y = self.skill_desc_lb.node.y - self.skill_desc_lb.node.height - 18//-4 -self.base_panel_height - 2 -skill_des_height - 18
        if(self.line.active){
            self.line.y =  -30 - self.base_panel_height-skill_des_height-extend_desc_height
        }
        if (buff_desc_str != ""){ 
            self.buff_desc_rt.node.y = -38-self.base_panel_height-skill_des_height-extend_desc_height
        }
        if (self.line_2.active){
            self.line_2.y = -44-self.base_panel_height-skill_des_height-extend_desc_height-buff_desc_height// :setPositionY(total_height-44-self.base_panel_height-skill_des_height-extend_desc_height-buff_desc_height)
        }
        if (self.next_skill_rt.string != ""){
            self.next_skill_rt.node.y = -52-self.base_panel_height-skill_des_height-extend_desc_height-buff_desc_height // :setPositionY(total_height)
        }
    },
    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        this.tips_controller.closeTIpsByType(TipsConst.type.SKILL);
    },
})