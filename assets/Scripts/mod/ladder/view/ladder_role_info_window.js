// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-07-24 16:56:21
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var LadderController = require("ladder_controller");
var PlayerHead = require("playerhead");
var HeroController = require("hero_controller");
var PartnerConst = require("partner_const");
var LadderEvent = require("ladder_event");
var HeroVo = require("hero_vo");

var Ladder_role_infoWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("ladder", "ladder_role_info");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Big;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig: function () {
        this.item_list = {};
        this.ctrl = LadderController.getInstance();
        this.model = this.ctrl.getModel();
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack: function () {
        this.background = this.seekChild("background");
        this.background.scale = FIT_SCALE;

        this.main_panel = this.seekChild("main_panel");
        this.close_btn = this.seekChild(this.main_panel, "close_btn");
        this.challenge_btn = this.seekChild(this.main_panel, "challenge_btn");
        let challenge_btn_lb = this.seekChild(this.challenge_btn, "label", cc.Label);
        challenge_btn_lb.string = Utils.TI18N("挑战");
        this.black_btn = this.seekChild(this.main_panel, "black_btn");
        let black_btn_lb = this.seekChild(this.black_btn, "label", cc.Label);
        black_btn_lb.string = Utils.TI18N("防守阵容");

        this.title_container = this.seekChild(this.main_panel, "title_container");
        let title_label = this.seekChild(this.title_container, "title_label", cc.Label);
        title_label.string = Utils.TI18N("挑战对手");

        this.info_con = this.seekChild(this.main_panel, "info_con");
        this.name_lb = this.seekChild(this.info_con, "name", cc.Label);
        let rank_title = this.seekChild(this.info_con, "rank_title", cc.Label);
        rank_title.string = Utils.TI18N("排名");
        this.rank_lb = this.seekChild(this.info_con, "rank", cc.Label);
        this.rank_lb.string = Utils.TI18N("暂无");
        let guild_title = this.seekChild(this.info_con, "guild_title", cc.Label);
        guild_title.string = Utils.TI18N("公会：");
        this.guild_lb = this.seekChild(this.info_con, "guild", cc.Label);
        this.guild_lb.string = Utils.TI18N("暂无");

        this.head = new PlayerHead();
        this.head.show();
        this.head.setPosition(10, -5);
        this.head.setParent(this.head);

        this.main_container = this.seekChild(this.main_panel, "main_container");
        let fight_title = this.seekChild(this.main_container, "fight_title", cc.Label);
        fight_title.string = Utils.TI18N("战斗阵容");


    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {
        Utils.onTouchEnd(this.background, function () {
            this.ctrl.openLadderRoleInfoWindow(false);
        }.bind(this), 2)
        Utils.onTouchEnd(this.close_btn, function () {
            this.ctrl.openLadderRoleInfoWindow(false);
        }.bind(this), 2)
        Utils.onTouchEnd(this.black_btn, function () {
            HeroController.getInstance().openFormMainWindow(true, PartnerConst.Fun_Form.Ladder);
        }.bind(this), 1)
        Utils.onTouchEnd(this.challenge_btn, function () {
            if (this.data && this.data.rid && this.data.srv_id) {
                this.ctrl.checkJoinLadderBattle(this.data.rid, this.data.srv_id);
            }
        }.bind(this), 1)

        this.addGlobalEvent(LadderEvent.GetLadderEnemyData, function (data) {
            this.setData(data);
        }.bind(this))
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd: function (data) {
        if (data && data.rid != null && data.srv_id != null) {
            this.ctrl.requestLadderEnemyData(data.rid, data.srv_id);
        }
    },

    setData: function (data) {
        this.data = data;
        this.name_lb.string = Utils.transformNameByServ(data.name, data.srv_id);
        this.head.setHeadRes(data.face);
        if (data.gname && data.gname != "") {
            this.guild_lb.string = data.gname;
        }
        //头像框
        let vo = Config.avatar_data.data_avatar[data.avatar_id || 0];
        if (vo) {
            let res_id = vo.res_id || 1;
            let res = PathTool.getUIIconPath("headcircle", "txt_cn_headcircle_" + res_id);
            this.head.setFrameRes(res);
        }
        this.head.setLev(data.lev);

        this.rank_lb.string = cc.js.formatStr(Utils.TI18N("%s名"), data.rank || 0);
        this.head.setSex(data.sex, cc.v2(70, 4));

        this.createPartnerList(data.p_list);
    },

    createPartnerList:function(list){
        let temp = [];
        for(let k in list){
            let v = list[k];
            let vo = new HeroVo();
            let hero_data = Utils.deepCopy(v);
            hero_data.use_skin = hero_data.quality;
            hero_data.partner_id = v.id;
            vo.updateHeroVo(hero_data);
            temp.push(vo);
        }
        let p_list_size = temp.length;
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack: function () {
        if(this.head){
            this.head.deleteMe();
            this.head = null;
        }
        this.ctrl.openLadderRoleInfoWindow(false);
    },
})