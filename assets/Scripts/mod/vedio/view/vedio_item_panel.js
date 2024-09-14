// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-05-16 20:40:57
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var TimeTool = require("timetool")
var BattleConst = require("battle_const")
var VedioController = require("vedio_controller")
var VedioConst = require("vedio_const")
var ChatConst = require("chat_const")
var BattleController = require("battle_controller")
var VedioEvent = require("vedio_event")
var RoleController = require("role_controller")
var VedioMainItem = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("vedio", "vedio_item");
        this.ctrl = VedioController.getInstance()
        this._model = this.ctrl.getModel()
    },

    // 可以初始化声明一些变量的
    initConfig:function(){

    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel:function(){
        var self = this

        self.container = self.root_wnd.getChildByName("container")

        let image_panel = self.container.getChildByName("image_panel")
        self.image_atk_left = image_panel.getChildByName("image_atk_left")
        self.image_atk_right = image_panel.getChildByName("image_atk_right")
        self.image_rank_left = image_panel.getChildByName("image_rank_left")
        self.image_rank_right = image_panel.getChildByName("image_rank_right")

        self.result_win = image_panel.getChildByName("result_win")
        self.result_loss = image_panel.getChildByName("result_loss")

        self.name_left = self.container.getChildByName("name_left").getComponent(cc.Label)
        self.name_right = self.container.getChildByName("name_right").getComponent(cc.Label)
        self.challenge_left = self.container.getChildByName("challenge_left").getComponent(cc.Label)
        self.challenge_right = self.container.getChildByName("challenge_right").getComponent(cc.Label)
        self.atk_label_left = self.container.getChildByName("atk_label_left").getComponent(cc.Label)
        self.atk_label_right = self.container.getChildByName("atk_label_right").getComponent(cc.Label)
        self.rank_label_left = self.container.getChildByName("rank_label_left").getComponent(cc.Label)
        self.rank_label_right = self.container.getChildByName("rank_label_right").getComponent(cc.Label)
        self.rank_title_left = self.container.getChildByName("rank_title_left").getComponent(cc.Label)
        self.rank_title_right = self.container.getChildByName("rank_title_right").getComponent(cc.Label)
        self.rank_title_left.string = Utils.TI18N("排行")
        self.rank_title_right.string = Utils.TI18N("排行")
        
        self.round_txt = self.container.getChildByName("round_txt").getComponent(cc.Label)
        self.type_txt = self.container.getChildByName("type_txt").getComponent(cc.Label)
        self.time_txt = self.container.getChildByName("time_txt").getComponent(cc.Label)
        self.level_left = self.container.getChildByName("level_left").getComponent(cc.Label)
        self.level_right = self.container.getChildByName("level_right").getComponent(cc.Label)

        self.play_btn = image_panel.getChildByName("play_btn")
        self.share_btn = image_panel.getChildByName("share_btn").getComponent(cc.Button)
        self.info_btn = image_panel.getChildByName("info_btn")

        self.collect_btn = image_panel.getChildByName("collect_btn").getComponent(cc.Button)
        self.collect_btn_sp = image_panel.getChildByName("collect_btn").getComponent(cc.Sprite)

        self.like_btn = image_panel.getChildByName("like_btn").getComponent(cc.Button)
        self.like_btn_sp = image_panel.getChildByName("like_btn").getComponent(cc.Sprite)
        this.like_red_point = image_panel.getChildByName("like_btn").getChildByName("red_point")

        self.play_num = self.container.getChildByName("play_num").getComponent(cc.Label)
        self.play_num.string = "0"
        self.share_num = self.container.getChildByName("share_num").getComponent(cc.Label)
        self.share_num.string = "0"
        self.like_num = self.container.getChildByName("like_num").getComponent(cc.Label)
        self.like_num.string = "0"

        // --左右两边的item对象列表
        self.left_item_list = {}
        self.right_item_list = {}
        self.panel_role_left = self.container.getChildByName("panel_role_left")
        self.panel_role_right = self.container.getChildByName("panel_role_right")
            
        let panel_size = self.panel_role_left.getContentSize()
        let width = 60 
        let height = 60
        let space_x = 8
        let space_y = 10
        // --9位置
        self.postion_list = {}
        for(let i=1;i<4;++i){
            for(let j=1;j<4;++j){
                let index = (i-1)*3 + j
                let p = cc.v2((width + space_x) * (j-1) + width * 0.5 , (height + space_y) * (3-i) + height * 0.5)
                self.postion_list[index] = p
                let leftNode = new cc.Node()
                let rightNode = new cc.Node()
                self.panel_role_left.addChild(leftNode)
                self.panel_role_right.addChild(rightNode)
                leftNode.setPosition(p)
                rightNode.setPosition(p)
                this.loadRes(PathTool.getUIIconPath("vedio","vedio_1007"),function(res){
                    leftNode.addComponent(cc.Sprite).spriteFrame = res
                    rightNode.addComponent(cc.Sprite).spriteFrame = res
                },this)
            }
        }
        if(this.data){
            this.setData(this.data)
        }
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        if(!this.update_self_event){
            this.update_self_event = this.addGlobalEvent(VedioEvent.UpdateVedioDataEvent, function(data){
                if(this.data && data && this.data.id == data.id){
                    this.setData(data)
                }
            }.bind(this))
        }
        this.play_btn.on("click",function(){
            if(this.data){
                // -- 天梯或者是从聊天中点开的录像详情，则发送a_srv_id
                if(this.vedioType == VedioConst.Tab_Index.Ladder || this.is_share == true){
                    BattleController.getInstance().csRecordBattle(this.data.id, this.data.a_srv_id)
                }else{
                    let role_vo = RoleController.getInstance().getRoleVo()
                    BattleController.getInstance().csRecordBattle(this.data.id, role_vo.srv_id)
                }
                this.play_num.string = 1 + this.data.play
                let new_data = this._model.updateVedioData(this.vedioType, this.data.id, "play", this.data.play+1)
                if(this.is_myself || this.is_collect){
                    gcore.GlobalEvent.fire(VedioEvent.UpdateVedioDataEvent, new_data)
                }
                if(this._playCallBack){
                    this._playCallBack()
                }
                var ChatController = require("chat_controller");
                if(ChatController.getInstance().isChatOpen() == true && !window.IS_PC){
                    ChatController.getInstance().closeChatPanel();
                }
            }
        }.bind(this))
        //分享
        this.share_btn.node.on('click',function(event){
            Utils.playButtonSound(1)
            if(this.data.channel && this.data.channel == ChatConst.Channel.Cross){
                message(TI18N("抱歉，跨服分享的录像无法收藏、点赞和分享"))
                return
            }
            if(this._shareCallBack){
                let world_pos = event.node.convertToWorldSpaceAR(cc.v2(0, 0))
                this._shareCallBack(world_pos, this.data.id, this.data.share+1, this.data.a_srv_id, this.data.combat_type)
            }
        },this)
        // -- 数据
        this.info_btn.on("click",function(){
            Utils.playButtonSound(1)
            this._onClickInfoBtn()
        },this)
        //收藏
        this.collect_btn.node.on("click",function(){
            Utils.playButtonSound(1)
            if(this.data.channel && this.data.channel == ChatConst.Channel.Cross){
                message(TI18N("抱歉，跨服分享的录像无法收藏、点赞和分享"))
                return
            }
            if(this.data.is_collect == true){
                this.data.is_collect = 0
                this.loadRes(PathTool.getUIIconPath("vedio", "txt_cn_vedio_collect"),function(res){
                    this.collect_btn_sp.spriteFrame = res
                }.bind(this))
                this.ctrl.requestCollectVedio(this.data.id, 0, this.data.a_srv_id, this.data.combat_type)
                let new_data = this._model.updateVedioData(this.vedioType, this.data.id, "is_collect", 0)
                if(this.is_myself || this.is_collect){
                    gcore.GlobalEvent.fire(VedioEvent.UpdateVedioDataEvent, new_data)
                }
            }else{
                this.ctrl.requestCollectVedio(this.data.id, 1, this.data.a_srv_id, this.data.combat_type, this.vedioType)
            }
        },this)
        this.like_btn.node.on("click",function(){
            Utils.playButtonSound(1)
            if(this.data.channel && this.data.channel == ChatConst.Channel.Cross){
                message(Utils.TI18N("抱歉，跨服分享的录像无法收藏、点赞和分享"))
                return
            }
            // -- 今日是否还可以点赞
            if(this._model.checkTodayLikeIsFull()){
                message(Utils.TI18N("今日点赞次数已用完"))
                return
            }
            this.data.flag = 1
            let srv_id = ""
            if(this.data.a_srv_id == "" || this.data.b_srv_id == ""){
                let RoleController = require("role_controller")
                let role_vo = RoleController.getInstance().getRoleVo()
                srv_id = role_vo.srv_id
            }else{
                srv_id = this.data.a_srv_id
            }
            this.ctrl.requestLikeVedio(this.data.id, srv_id, this.data.combat_type)
            this.like_btn.interactable = false;
            this.like_red_point.active = false;
            this.loadRes(PathTool.getUIIconPath("vedio", "txt_cn_vedio_like_2"),function(res){
                this.like_btn_sp.spriteFrame = res
            }.bind(this))
            // Utils.addRedPointToNodeByStatus(this.like_btn.node, false)
            this.like_num.string = this.data.like+1
            this._model.updateVedioData(this.vedioType, this.data.id, "flag", 1)
            let new_data = this._model.updateVedioData(this.vedioType, this.data.id, "like", this.data.like+1)
            if(this.is_myself || this.is_collect){
                gcore.GlobalEvent.fire(VedioEvent.UpdateVedioDataEvent, new_data)
            }
        },this)

        this.addGlobalEvent(VedioEvent.CLICK_Like_Vedio_EVENT, function(data){
            if(this._model.checkTodayLikeIsFull()){
                this.like_red_point.active = false;
            }
        }.bind(this))
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow:function(params){
        if(params){
            this.container.getChildByName("image_panel").getChildByName("image_bg").active = false
        }
    },
    setData(data){
        if(!data)return
        this.data = data
        if(this.root_wnd == null)return
        var self = this
        // -- 类型
        self.type_txt.string = data.name;
    
        // -- 回合
        let total_round = 0
        let battle_type = data.combat_type
        let fight_list_config = Config.combat_type_data.data_fight_list
        if(fight_list_config && fight_list_config[battle_type]){
            total_round = fight_list_config[battle_type].max_action_count || 0
        }
        self.round_txt.string = cc.js.formatStr(Utils.TI18N("%d/%d回合"), data.round || 0, total_round)
    
        // -- 时间
        self.time_txt.string = TimeTool.dateFtt("yyyy-MM-dd hh:mm",data.time)
    
        // -- 播放、分享、点赞数量
        self.play_num.string = data.play
        self.share_num.string = data.share
        self.like_num.string = data.like
    
        // -- 收藏按钮
        let path 
        if(data.is_collect == true){
            path = PathTool.getUIIconPath("vedio", "txt_cn_vedio_un_collect")
        }else{
            path = PathTool.getUIIconPath("vedio", "txt_cn_vedio_collect")
        }
        this.loadRes(path,function(res){
            self.collect_btn_sp.spriteFrame = res
        }.bind(this))
        this.like_red_point.active = !this._model.checkTodayLikeIsFull()
        // -- 是否被点赞
        let path1 
        if(self.is_myself){
            self.like_btn.interactable = false;
            this.like_red_point.active = false;
            path1 = PathTool.getUIIconPath("vedio", "txt_cn_vedio_like")
        }else if(data.flag == true){
            self.like_btn.interactable = false;
            this.like_red_point.active = false;
            path1 = PathTool.getUIIconPath("vedio", "txt_cn_vedio_like_2")
        }else{
            self.like_btn.interactable = true;
            path1 = PathTool.getUIIconPath("vedio", "txt_cn_vedio_like")
        }
        this.loadRes(path1,function(res){
            this.like_btn_sp.spriteFrame = res
        }.bind(this))
        // -- 跨服频道中点开的录像详情，不允许点赞和收藏
        // if(self.data.channel && self.data.channel == ChatConst.Channel.Cross){
        //     self.collect_btn.interactable = true;
        //     self.like_btn.interactable = true;
        //     self.share_btn.interactable = true;
        // }else{
        //     self.collect_btn.interactable = false;
        //     self.like_btn.interactable = false;
        //     self.share_btn.interactable = false;
        // }
    
        // -- 类型
        if(self.is_hot){
            self.vedioType = VedioConst.Tab_Index.Hot
        }else if(data.combat_type == BattleConst.Fight_Type.Arena){
            self.vedioType = VedioConst.Tab_Index.Arena
        }else if(data.combat_type == BattleConst.Fight_Type.Champion){
            self.vedioType = VedioConst.Tab_Index.Champion
        }else if(data.combat_type == BattleConst.Fight_Type.PK){
            self.vedioType = VedioConst.Tab_Index.Solo
        }else if(data.combat_type == BattleConst.Fight_Type.GuildWar){
            self.vedioType = VedioConst.Tab_Index.Guildwar
        }else if(data.combat_type == BattleConst.Fight_Type.LadderWar){
            self.vedioType = VedioConst.Tab_Index.Ladder
        }else if(data.combat_type == BattleConst.Fight_Type.EliteMatchWar || data.combat_type == BattleConst.Fight_Type.EliteKingMatchWar){
            self.vedioType = VedioConst.Tab_Index.Elite
        }
    
        // -- 胜负
        self.result_win.active = true
        self.result_loss.active = true;
        if(data.ret == 1){
            self.result_win.setPosition(cc.v2(27, 353))
            self.result_loss.setPosition(cc.v2(593, 353))
        }else if(data.ret == 2){
            self.result_win.setPosition(cc.v2(593, 353))
            self.result_loss.setPosition(cc.v2(27, 353))
        }else{
            self.result_win.active = false
            self.result_loss.active = false
        }
    
        // -- 点赞红点
        self.updateLikeBtnRedStatus()
    
        // ----------------@ 左侧
        self.name_left.string = Utils.transformNameByServ(data.a_name, data.a_srv_id)
        self.name_left._forceUpdateRenderData(true)
        if(data.combat_type == BattleConst.Fight_Type.Champion){
            self.challenge_left.node.active = false;
        }else{
            self.challenge_left.node.active = true;
            self.challenge_left.string = Utils.TI18N("挑战方");
            self.challenge_left.node.color = VedioConst.Color.Atk
        }
    
        // -- 战力
        self.atk_label_left.string = data.a_power
        // -- 等级
        self.level_left.string = data.a_lev + Utils.TI18N("级")
    
        // -- 调整位置
        let left_name_size = self.name_left.node.getContentSize()
        self.level_left.node.x = self.name_left.node.x+left_name_size.width+10
    
        if(data.combat_type == BattleConst.Fight_Type.Arena){
            if(data.a_rank > 0){
                self.rank_label_left.string = data.a_rank;
            }else{
                self.rank_label_left.string = Utils.TI18N("暂无")
            }
            self.image_rank_left.active =  true;
            self.rank_title_left.node.active = true;
            self.rank_label_left.node.active = true;
        }else{
            self.image_rank_left.active = false;
            self.rank_title_left.node.active = false;
            self.rank_label_left.node.active = false;
        }
        // -- 英雄
        for(let i=1;i<10;++i){
            let index = VedioConst.Left_Role_Battle_Index[i]
            let role_data = self.getRoleInfoByIndex(index, data.a_plist)
            let hero_item = self.left_item_list[i]
            if(role_data){
                if(hero_item == null){
                    hero_item = self.createHeroExhibitionItemByIndex(i, self.panel_role_left)
                    self.left_item_list[i] = hero_item
                }else{
                    hero_item.setVisible(true)
                }
                hero_item.setData(role_data)
                hero_item.addCallBack(function(){
                    this._onClickRoleHead(role_data, 1)
                }.bind(this))
            }else{
                if(hero_item){
                    hero_item.setVisible(false)
                }
            }
        }
    
        // --------------------@ 右侧
        self.name_right.string = Utils.transformNameByServ(data.b_name, data.b_srv_id)
        self.name_right._forceUpdateRenderData(true)
        if(data.combat_type == BattleConst.Fight_Type.Champion){
            self.challenge_right.node.active = false;
        }else{
            self.challenge_right.node.active = true;
            self.challenge_right.string = Utils.TI18N("防守方")
            self.challenge_right.node.color = VedioConst.Color.Def
        }
        // -- 战力
        self.atk_label_right.string = data.b_power;
        // -- 等级
        self.level_right.string = data.b_lev + Utils.TI18N("级")
    
        // -- 调整位置
        let right_name_size = self.name_right.node.getContentSize()
        self.level_right.node.x = self.name_right.node.x -right_name_size.width-10
    
        if(data.combat_type == BattleConst.Fight_Type.Arena){
            if(data.b_rank > 0){
                self.rank_label_right.string = data.b_rank
            }else{
                self.rank_label_right.string = Utils.TI18N("暂无")
            }
            self.image_rank_right.active = true;
            self.rank_label_right.node.active = true
            self.rank_title_right.node.active = true;
        }else{
            self.image_rank_right.active = false
            self.rank_label_right.node.active = false
            self.rank_title_right.node.active = false
        }
        // -- 英雄
        for(let i=1;i<10;++i){
            let index = VedioConst.Right_Role_Battle_Index[i]
            let role_data = self.getRoleInfoByIndex(index, data.b_plist)
            let hero_item = self.right_item_list[i]
            if(role_data){
                if(hero_item == null){
                    hero_item = self.createHeroExhibitionItemByIndex(i, self.panel_role_right)
                    self.right_item_list[i] = hero_item
                }else{
                    hero_item.setVisible(true)
                }
                hero_item.setData(role_data)
                hero_item.addCallBack(function(){
                    this._onClickRoleHead(role_data, 2)
                }.bind(this))
            }else{
                if(hero_item){
                    hero_item.setVisible(false)
                }
            }
    
        }

    },
    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide:function(){

    },
    setExtendData( extend ){
        var self = this
        if(extend){
            self.is_myself = extend.is_myself || false
            self.is_collect = extend.is_collect || false
            self.is_hot = extend.is_hot || false
        }
    },
    addCallBack( shareCallBack ){
        this._shareCallBack = shareCallBack
    },
    // -- 更新点赞按钮红点
    updateLikeBtnRedStatus(  ){
        // let red_status = false
        // var self = this
        // if(self.vedioType == VedioConst.Tab_Index.Hot && !this._model.checkTodayLikeIsFull() && !self.is_myself && self.data && self.data.flag != true){
        //     red_status = true
        // }
        // Utils.addRedPointToNodeByStatus(self.like_btn.node, red_status, 5, 5)
    },
    // -- 根据位置获取英雄数据
    getRoleInfoByIndex( index, role_list ){
        for(let k=0;k<role_list.length;++k){
            let v = role_list[k]
            if(v.pos == index){
                return v
            }
        }
        return null
    },
    // --创建一个新的item根据位置索引
    createHeroExhibitionItemByIndex(index, parent){
        let hero_item = ItemsPool.getInstance().getItem("hero_exhibition_item");
        hero_item.setRootScale(0.5);
        let pos = this.postion_list[index] || cc.v2(0,0)
        hero_item.setPosition(pos.x,pos.y)
        hero_item.setParent(parent)
        hero_item.setVisible(true)
        hero_item.show();
        return hero_item
    },
    _onClickRoleHead(data, dir_type){
        if(!data || !this.data) return;
        this.ctrl.requestVedioHeroData(this.data.id, data.id, dir_type, this.data.a_srv_id, this.data.combat_type)
    },
    // -- 查看伤害统计
    _onClickInfoBtn(  ){
        var self = this
        if(self.data){
            let harmInfo = {}
            harmInfo.atk_name = self.data.a_name
            harmInfo.def_name = self.data.b_name
            harmInfo.hurt_statistics = []
            harmInfo.vedio_id = self.data.id            //-- 录像id
            harmInfo.srv_id = self.data.a_srv_id
            harmInfo.combat_type = self.data.combat_type
            for(let i=1;i<=2;++i){
                let temp_data = {}
                temp_data.type = i
                temp_data.partner_hurts = []
                if(i == 1){
                    temp_data.partner_hurts = Utils.deepCopy(self.data.a_plist) || []
                }else{
                    temp_data.partner_hurts = Utils.deepCopy(self.data.b_plist) || []
                }
                harmInfo.hurt_statistics.push(temp_data)
            }
            BattleController.getInstance().openBattleHarmInfoView(true, harmInfo)
        }
    },
    addPlayCallBack( _playCallBack ){
        this._playCallBack = _playCallBack
    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete:function(){
        if(this.left_item_list){
            for(let i in this.left_item_list){
                if(this.left_item_list[i]){
                    this.left_item_list[i].deleteMe()
                    this.left_item_list[i] = null;
                }
            }
            this.left_item_list = null
        }
        if(this.right_item_list){
            for(let i in this.right_item_list){
                if(this.right_item_list[i]){
                    this.right_item_list[i].deleteMe()
                    this.right_item_list[i] = null;
                }
            }
            this.right_item_list = null;
        }
    },
})