// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-07-24 15:54:31
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var BattleController = require("battle_controller");
var HeroVo = require("hero_vo");
var Dir_Type = {
	Left : 1,  // 左边英雄
	Right : 2  // 右边英雄
}
var BattleBuffInfoItem = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("battle", "battle_buff_info_item");
        this.role_dir = arguments[0] || Dir_Type.Left
        this.ctrl = BattleController.getInstance();
    },

    // 可以初始化声明一些变量的
    initConfig:function(){
        this.buff_list_item = []
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel:function(){
        this.size = this.root_wnd.getContentSize()
        let container = this.root_wnd.getChildByName("container")
        this.container = container
    
        this.touch_layout = container.getChildByName("touch_layout")
        this.arrow_sp = container.getChildByName("Sprite_1")
    
        this.hero_head = ItemsPool.getInstance().getItem("hero_exhibition_item");
        this.hero_head.setExtendData({scale:0.7,can_click:true});
        this.hero_head.addCallBack(this._onClickHeroCallBack.bind(this))
        this.hero_head.setParent(container)
        this.hero_head.show()
        if(this.role_dir == Dir_Type.Left){
            this.hero_head.setPosition(50, this.size.height/2)
            this.touch_layout.setPosition(cc.v2(this.size.width, 0))
            this.arrow_sp.setPosition(cc.v2(282, 15))
            this.arrow_sp.scaleX = 1
        }else{
            this.hero_head.setPosition(this.size.width - 50, this.size.height/2)
            this.touch_layout.setPosition(this.size.width - 120 * 0.7 -18, 0)
            this.arrow_sp.setPosition(cc.v2(18, 15))
            this.arrow_sp.scaleX = -1
        }

    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        this.touch_layout.on("touchend",function(){
            if(this.buff_list_data && Utils.next(this.buff_list_data) != null){
                this.ctrl.openBattleBuffListView(true, this.buff_list_data, this.data.group, this.data.object_bid)
            }
        },this)
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow:function(params){
        if(this.data){
            this.setData(this.data)
        }   
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide:function(){

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete:function(){
        if(this.hero_head){
            this.hero_head.deleteMe()
            this.hero_head = null;
        }
    },
    setData(data){
        this.data = data || {}
        if(!this.root_wnd){
            return
        }
        let info = data.role_data
        // -- 头像
        let hero_vo = new HeroVo()
        if(Config.partner_data.data_partner_base[info.object_bid]){
            hero_vo.bid = info.object_bid
            hero_vo.star = info.star
        }else{
            function config(id){
                return gdata("unit_data","data_unit1",id) || gdata("unit_data","data_unit2",id) ||gdata("unit_data","data_unit3",id)
            }
            let unit_config = config(data.role_data.object_bid)
            if(unit_config){
                hero_vo.bid = Number(unit_config.head_icon)
                if(unit_config.star && unit_config.star > 0){
                    hero_vo.star = unit_config.star
                }else{
                    let base_config = Config.partner_data.data_partner_base[hero_vo.bid]
                    if(base_config){
                        hero_vo.star = base_config.init_star
                    }
                }
                hero_vo.master_head_id = hero_vo.bid
            }
        }
        hero_vo.camp_type = info.camp_type
        hero_vo.lev = info.lev
        hero_vo.use_skin = info.fashion
        this.hero_head.setData(hero_vo)
        if(info.hp > 0){
            this.hero_head.showStrTips(false)
        }else{
            this.hero_head.showStrTips(true,Utils.TI18N("已阵亡"))
        }
        // -- buff 图标
        let temp_list = {}
        let temp_group_list = {}
        for(let i in this.data.buff_list){
            let v = this.data.buff_list[i]
            if(v == null){
                continue
            }
            let buff_config = v.config
            let buff = v.buff
            let res_id = buff_config.icon
            // -- 根据配置表判断一下，如果角色死亡，buff是否为需要清除的
            if(res_id != null && res_id != 0 && (info.hp > 0 || (buff_config.clean_when_dead != null && buff_config.clean_when_dead == "false"))){
                if(temp_list[res_id] == null){
                    temp_list[res_id] = {res_id:res_id, num:0, name:buff_config.name, remain_round:buff.remain_round, desc:buff_config.desc, buff_infos : []}
                }
                if(temp_list[res_id].num == 0 || (buff_config.join_type && buff_config.join_type != 3)){
                    temp_list[res_id].num = temp_list[res_id].num + 1
                    temp_list[res_id].buff_infos.push({buff_id:buff_config.bid, remain_round:buff.remain_round})
                    // _table_insert(temp_list[res_id].buff_infos, {buff_id=v.bid, remain_round=v.remain_round})
                    if(buff_config.group){
                        temp_group_list[buff_config.group] = true
                    }
                }else if(buff_config.join_type && buff_config.join_type == 3 && buff_config.group && !temp_group_list[buff_config.group]){
                    temp_group_list[buff_config.group] = true
                    temp_list[res_id].num = temp_list[res_id].num + 1
                    temp_list[res_id].buff_infos.push({buff_id:buff_config.bid, remain_round:buff.remain_round}) 
                    // _table_insert(temp_list[res_id].buff_infos, {buff_id=v.bid, remain_round=v.remain_round})
                }
            }
        }
        this.buff_list_data = []
        for(let k in temp_list){
            let v = temp_list[k]
            this.buff_list_data.push(v)
        }
        this.buff_list_data.sort(function(a,b){
            return  a.res_id - b.res_id
        })
        this.ctrl.updateBattleBuffListView(this.buff_list_data, info.group, info.object_bid)
        for(let k=0;k<this.buff_list_item.length;++k){
            let buff_object = this.buff_list_item[k]
            if(buff_object.icon){
                buff_object.icon.node.active = false;
            }
        }

        let start_x = 110
        let start_y = 85
        if(this.role_dir == Dir_Type.Right){
            start_x = this.size.width - start_x
        }
        let space_x = 5
        // let space_y = 5
        let buff_icon_size = cc.size(33, 32)
        for(let i=0;i<this.buff_list_data.length;++i){
            let bData = this.buff_list_data[i]
            let num = i + 1
            if(num <= 8){  //-- 最多显示8个
                let buff_object = this.buff_list_item[i]
                if(buff_object == null){
                    buff_object = this.createBuffItem()
                    this.buff_list_item[i] = buff_object
                }
                buff_object.icon.node.active = true;
                buff_object.label.string = bData.num;
                //   -- 位置
                let row = Math.ceil(num/4)
                let index = num%4
                if(index == 0){
                    index = 4
                }

                let pos_x = start_x + (index-1)*(buff_icon_size.width+space_x) + buff_icon_size.width/2
                if(this.role_dir == Dir_Type.Right){
                    pos_x = start_x - (index-1)*(buff_icon_size.width+space_x) - buff_icon_size.width/2
                }
                let pos_y = start_y - (row -1)*(buff_icon_size.height+space_x) - buff_icon_size.height/2
                buff_object.icon.node.setPosition(cc.v2(pos_x, pos_y))

                let buff_icon_id = bData.res_id
                let buff_path = PathTool.getBigBuffRes(buff_icon_id)
                if(buff_object.path != buff_path){
                    buff_object.path = buff_path 
                    this.loadRes(buff_path,function(res){
                        buff_object.icon.spriteFrame = res
                    }.bind(this))
                }
            }
        }
    },
    _onClickHeroCallBack(){
        if(this.data && this.data.role_data && this.data.role_data.owner_id != 0 && this.data.role_data.owner_srv_id != "" && this.data.role_data.object_id){ 
            var RoleController = require("role_controller")
            let role_vo = RoleController.getInstance().getRoleVo()
            var HeroController = require("hero_controller")
            if(role_vo.rid == this.data.role_data.owner_id && role_vo.srv_id == this.data.role_data.owner_srv_id){
                let hero_vo = HeroController.getInstance().getModel().getHeroById(this.data.role_data.object_id)
                if(hero_vo && Utils.next(hero_vo) != null){
                    HeroController.getInstance().openHeroTipsPanel(true, hero_vo)
                }else{
                    message(Utils.TI18N("该英雄来自异域，无法查看"))
                }
            }else{
                var LookController = require("look_controller")
                LookController.getInstance().sender11061(this.data.role_data.owner_id, this.data.role_data.owner_srv_id, this.data.role_data.object_id)
            }
        }else{
            message(Utils.TI18N("该英雄来自异域，无法查看"))
        }
    },
    createBuffItem(){
        let object = {};
        let icon = Utils.createImage(this.container,null,0,0,cc.v2(0.5,0.5))
        let node = new cc.Node()
        node.setAnchorPoint(cc.v2(1,0))
        node.setPosition(15,-15)
        let label = node.addComponent(cc.Label)
        icon.node.addChild(node)
        label.fontSize = 14;
        label.lineHeight  = 18
        label.horizontalAlign = cc.macro.TextAlignment.CENTER;
        label.verticalAlign = cc.macro.TextAlignment.CENTER;
        node.color = new cc.Color(0xff, 0xff, 0xff, 0xff);
        let line = node.addComponent(cc.LabelOutline);
        line.color = new cc.Color(0,0,0);
        line.width = 1;
        object.icon = icon
        object.label = label
        object.path = ""
        return object
    },
})