// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-04-28 14:44:44
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var BattleController = require("battle_controller")
var RoleController = require("role_controller")
var ChatConst = require("chat_const")
var BattleConst = require("battle_const")
var BattlePkResultView = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("battle", "battle_pk_result_view");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Tips;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = BattleController.getInstance()
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        var self = this
        // Utils.playMusic(AUDIO_TYPE.BATTLE,"b_win")
        
        self.background = self.root_wnd.getChildByName("background")
        self.background.scale = FIT_SCALE;
        self.source_container = self.root_wnd.getChildByName("container")
        self.title_container = self.source_container.getChildByName("title_container")
        self.title_width = self.title_container.getContentSize().width
        self.title_height = self.title_container.getContentSize().height
        self.world_btn = self.source_container.getChildByName("world_btn")
        self.guild_btn = self.source_container.getChildByName("guild_btn")
        self.record_btn = self.source_container.getChildByName("record_btn")
        self.play_effect = self.title_container.getChildByName("action").getComponent(sp.Skeleton)
        self.harm_btn = self.source_container.getChildByName("harm_btn")
        self.harm_btn.active = false;
    },
    _onClickHarmBtn(  ){
        Utils.playButtonSound(1)
        if(this.data && Utils.next(this.data) != null){
            this.ctrl.openBattleHarmInfoView(true, this.data)
        }
    },
    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        var self = this
        self.background.on("touchend",function(){
            Utils.playButtonSound(2)
            this.ctrl.openFinishView(false,self.fight_type)
        },this)
        self.world_btn.on("click",function(){
            Utils.playButtonSound(1)
            if(self.data){
                if(self._is_cross){
                    this.ctrl.on20034(self.data.replay_id, ChatConst.Channel.Cross, self.data.def_name,BattleConst.ShareType.SharePk)
                }else{
                    this.ctrl.on20034(self.data.replay_id, ChatConst.Channel.World, self.data.def_name,BattleConst.ShareType.SharePk)
                }
            }
            this.ctrl.openFinishView(false,self.fight_type)
        },this)
        self.guild_btn.on('click',function(){
            Utils.playButtonSound(1)
            let role_vo = RoleController.getInstance().getRoleVo()
            if(role_vo && role_vo.gid != 0 && role_vo.gsrv_id != ""){
                this.ctrl.on20034(self.data.replay_id, ChatConst.Channel.Gang, self.data.def_name,BattleConst.ShareType.SharePk)
            }else{
                message(Utils.TI18N("暂无公会"))
            }
        },this)
        self.record_btn.on('click',function(){
            Utils.playButtonSound(1)
            this.ctrl.openFinishView(false, self.fight_type)
            if(self.data){
                this.ctrl.csRecordBattle(self.data.replay_id)
            }
        },this)
        this.harm_btn.on('click',this._onClickHarmBtn,this)
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(data){
        this.setData(data)
        this.fight_type = data.combat_type       
    },
    setData(data){
        var self = this;
        if(data){
            self.data = data || {}
            self.handleEffect(true)
            self.harm_btn.active = true;

            self._is_cross = false
            if(data.is_province && data.is_province == 1){
                self._is_cross = true
                self.world_btn.getChildByName("Label").getComponent(cc.Label).string = "邻服分享";
            }
        }
    },
    handleEffect(){
        if(this.play_effect){
            let path,animName
            if(this.data.result == 1){
                Utils.playButtonSound("c_win");
                path = PathTool.getEffectRes(103);
                this.play_effect.node.setPosition(0,this.title_height/2)
                animName = "action2"
            }else{
                Utils.playButtonSound("c_fail");
                path = PathTool.getEffectRes(104)
                this.play_effect.node.setPosition(0,this.title_height/2 + 40)
                animName = "action"
            }
            this.loadRes(PathTool.getSpinePath(path , "action"), function(skeleton_data){
                this.play_effect.skeletonData = skeleton_data;
                this.play_effect.setAnimation(0, animName , false);           
            }.bind(this));
        }
        
        
    },
    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        this.play_effect.skeletonData = null;
        if(this.ctrl.getModel().getBattleScene() && this.ctrl.getIsSameBattleType(this.fight_type)){
            let data = { combat_type : this.fight_type, result : this.result }
            this.ctrl.getModel().result(data,this.is_leave_self)
        }
        this.ctrl.openFinishView(false,this.fight_type)
    },
})