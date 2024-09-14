// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-26 16:16:07
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var HeroVo = require("hero_vo");

var Harm_Type = {
    Harm: 1,  // 伤害
    Cure: 2   // 治疗
}

var Dir_Type = {
    Left: 1,  // 左边英雄
    Right: 2  // 右边英雄
}

var Battle_harm_info_itemPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("battle", "battle_harm_info_item");

        this.role_dir = arguments[0] || Dir_Type.Left;
        this.vedio_id = arguments[1] || 0;
    },

    // 可以初始化声明一些变量的
    initConfig: function () {
        this.size = cc.size(300, 99);
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel: function () {
        var container = this.seekChild("container");
        this.progress_bg_nd = this.seekChild(container, "progress_bg");
        this.progress_pb = this.seekChild(this.progress_bg_nd, "progress", cc.ProgressBar);
        this.progress_pb.progress = 0;
        this.progress_value_lb = this.seekChild(this.progress_bg_nd, "progress_value", cc.Label);
        this.progress_value_lb.string = 0;

        this.image_mvp_nd = this.seekChild(container, "image_mvp");
        this.image_mvp_nd.active = false;

        this.hero_head = ItemsPool.getInstance().getItem("hero_exhibition_item");
        this.hero_head.setRootScale(0.7);
        this.hero_head.addCallBack(this._onClickHeroCallBack.bind(this));
        this.hero_head.setParent(container);
        this.hero_head.show();

        if (this.role_dir == Dir_Type.Left) {
            this.hero_head.setPosition(50, this.size.height / 2);
            this.image_mvp_nd.setPosition(cc.v2(270, 72));
            this.progress_bg_nd.setPosition(cc.v2(100, 40))
            this.progress_value_lb.node.setAnchorPoint(cc.v2(0, 0.5))
            this.progress_value_lb.node.x = 0;
            this.progress_pb.node.x = 0;
            this.progress_pb.node.scale = 1;
        } else {
            this.hero_head.setPosition(this.size.width - 50, this.size.height / 2);
            this.image_mvp_nd.setPosition(cc.v2(this.size.width - 254, 72));
            this.progress_bg_nd.setPosition(cc.v2(this.size.width - 184 - 100, 40))
            this.progress_value_lb.node.setAnchorPoint(cc.v2(1, 0.5))
            this.progress_value_lb.node.x = 184;
            this.progress_pb.node.x = 184;
            this.progress_pb.node.scale = -1;
        }

    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {

    },

    _onClickHeroCallBack: function () {
        if (this.data != null && this.data.id != null && this.vedio_id != null && this.vedio_id != 0) {
            require("vedio_controller").getInstance().requestVedioHeroData(this.vedio_id, this.data.id, this.role_dir);
        } else if (this.data && this.data.rid && this.data.rid != 0 && this.data.srvid && this.data.srvid != "" && this.data.id) {
            var role_vo = require("role_controller").getInstance().getRoleVo();
            if (role_vo.rid == this.data.rid && role_vo.srv_id == this.data.srvid) {
                var HeroController = require("hero_controller").getInstance();
                var hero_vo = HeroController.getModel().getHeroById(this.data.id);
                HeroController.openHeroTipsPanel(true, hero_vo);
            } else {
                require("look_controller").getInstance().sender11061(this.data.rid, this.data.srvid, this.data.id)
            }
        } else {
            message(Utils.TI18N("该英雄来自异域，无法查看"))
        }
    },

    setData: function (data, max_harm, max_cure) {
        this.data = data;
        this.max_harm_val = max_harm;
        this.max_cure_val = max_cure;
        if (this.root_wnd)
            this.onShow()
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow: function () {
        if (this.data == null) return
        var data = this.data;
        var vo = new HeroVo();
        if (Config.partner_data.data_partner_base[data.bid]) {
            vo.bid = data.bid;
            vo.star = data.star;
        } else {
            var unit_config = Utils.getUnitConfig(data.bid);
            if (unit_config) {
                vo.bid = Number(unit_config.head_icon);
                if (unit_config.star && unit_config.star > 0) {
                    vo.star = unit_config.star;
                } else {
                    var base_config = Config.partner_data.data_partner_base[vo.bid];
                    if (base_config) {
                        vo.star = base_config.init_star;
                    }
                }
            }
        }
        vo.camp_type = data.camp_type;
        vo.lev = data.lev;
        if(data.ext_data){
            for(let i in data.ext_data){
                let v = data.ext_data[i];
                if(v.key == 5){
                    vo.use_skin = v.val;
                }
            }
        }
        this.hero_head.setData(vo);

        this.updateHarmType();
    },

    updateHarmType: function (harm_type) {
        if (this.data) {
            this.harm_type = harm_type || Harm_Type.Harm;
            this.total_val = 0;
            this.cur_val = 0;
            if (this.harm_type == Harm_Type.Harm) {
                this.image_mvp_nd.active = this.data.dps > 0 && this.data.dps == this.max_harm_val;
                this.total_val = this.max_harm_val;
                this.cur_val = this.data.dps;
            } else {
                this.image_mvp_nd.active = this.data.cure > 0 && this.data.cure == this.max_cure_val;
                this.total_val = this.max_cure_val;
                this.cur_val = this.data.cure;
            }
            this.temp_add = this.cur_val / 50;
            this.temp_harm_val = 0;
            this.progress_pb.progress = 0;
            this.progress_value_lb.string = this.cur_val;
            this.openProgressTimer(true)
        }
    },

    openProgressTimer: function (status) {
        if (status == true) {
            if (this.progress_timer == null) {
                this.progress_timer = gcore.Timer.set(function () {
                    this.temp_harm_val = this.temp_harm_val + this.temp_add;
                    if (this.total_val == 0) {
                        this.progress_pb.progress = 0;
                    } else if (this.temp_harm_val < this.cur_val) {
                        this.progress_pb.progress = this.temp_harm_val / this.total_val;
                    } else {
                        this.progress_pb.progress = this.cur_val / this.total_val;
                        gcore.Timer.del(this.progress_timer);
                        this.progress_timer = null;
                    }
                }.bind(this), 1, -1)
            }
        } else {
            if (this.progress_timer != null) {
                gcore.Timer.del(this.progress_timer);
                this.progress_timer = null;
            }
        }
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide: function () {

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete: function () {
        if (this.hero_head) {
            this.hero_head.deleteMe();
            this.hero_head = null;
        }
        this.openProgressTimer(false);
    },
})