// --------------------------------------------------------------------
// @author: shiraho@syg.com(必填, 创建模块的人员)
// @description:
//      通用展示角色对象
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------
// var LoaderManager = require("loadermanager");
var PathTool = require("pathtool")

var BaseRole = cc.Class({
    extends: BaseClass,
    ctor: function () {
        this.loadFinish = false;        // 是否加载完成
    },
    is_load_finish: false,
    action_data: null,                   // 尚未创建完成之前播放动作的携带数据
    anima_path: null,
    effect_path: null,
    statics: {
        type: {
            hero: 1,
            unit: 2,
        }
    },

    setParent: function (parent) {
        this.parent = parent;
        this.node = new cc.Node("");
        this.node.setAnchorPoint(0.5, 0.5);
        this.spine = this.node.addComponent(sp.Skeleton);
        var effect_nd = new cc.Node("effect");
        this.effect_sk = effect_nd.addComponent(sp.Skeleton);
        this.parent.addChild(effect_nd);
        this.parent.addChild(this.node);
        
    },

    // 设置数据,这个是主接口,怪物类型和怪物id
    setData: function (unit_type, bidordata, action_name, loop, scale, setting) {
        // cc.log(unit_type, bidordata, action_name, loop, scale)
        var anima_path = null;
        var effect_path = null;
        scale = scale || 1;
        this.node.scale = scale;
        setting = setting || {};
        let effectScale = setting.scale || 1;
        this.effect_sk.node.scale = effectScale;
        if (unit_type == BaseRole.type.role) {
            var config = Config.looks_data.data_data[bidordata];
            if (config) {
                var key = Utils.getNorKey(config.partner_id, config.star)
                var star_config = gdata("partner_data", "data_partner_star", key)
                action_name = action_name ? action_name : PlayerAction.show;
                anima_path = cc.js.formatStr("spine/%s/%s.atlas", config.ico_id, action_name);
                if (star_config && star_config.show_effect != "") {
                    // action_name = action_name ? action_name : PlayerAction.show; 
                    // anima_path = cc.js.formatStr("spine/%s/%s.atlas", star_config.show_effect, action_name);
                    if (star_config.show_effect) {
                        effect_path = "spine/" + star_config.show_effect + "/action.atlas";
                        let skin_id = config.skin_id;
                        if (skin_id == 0 && setting.skin_id != null) {
                            skin_id = setting.skin_id;
                        }
                        let skin_config = Config.partner_skin_data.data_skin_info[skin_id]
                        if (skin_config && skin_config.res_id != null && skin_config.res_id != "") {
                            anima_path = "spine/" + skin_config.res_id + "/show.atlas";
                        }

                        if (skin_config && skin_config.show_effect != "") {
                            effect_path = "spine/" + skin_config.show_effect + "/action.atlas";
                        }
                    } else {
                        if (this.effect_sk) {
                            this.effect_sk.setToSetupPose();
                            this.effect_sk.clearTracks();
                        }
                    }
                }
            }
        } else if (unit_type == BaseRole.type.partner) {
            // 测试使用
            var star_key = bidordata.bid + "_" + bidordata.star;
            var star_cfg = gdata("partner_data", "data_partner_star", star_key);
            anima_path = "spine/" + star_cfg.res_id + "/show.atlas";

            var test_cfg = gdata("partner_data", "data_partner_base", bidordata.bid);

            //英雄皮肤id
            let skin_id = setting.skin_id;
            let skin_config = Config.partner_skin_data.data_skin_info[skin_id]
            if (skin_config && skin_config.res_id != null && skin_config.res_id != "") {
                anima_path = "spine/" + skin_config.res_id + "/show.atlas";
            }
            // 十星特效
            if (star_cfg.show_effect) {
                effect_path = "spine/" + star_cfg.show_effect + "/action.atlas";
                if (skin_config && skin_config.show_effect != "") {
                    effect_path = "spine/" + skin_config.show_effect + "/action.atlas";
                }
            }
            else {
                if (this.effect_sk) {
                    this.effect_sk.setToSetupPose();
                    this.effect_sk.clearTracks();
                }
            }



        } else if (unit_type == BaseRole.type.unit) {
            var config = Utils.getUnitConfig(bidordata);
            if (PathTool.specialBSModel(Number(bidordata))) {
                action_name = PlayerAction.battle_stand;
            }
            if (config != null) {
                anima_path = cc.js.formatStr("spine/%s/%s.atlas", config.body_id, action_name);
            }
        } else if (unit_type == BaseRole.type.skin) {
            if (typeof (bidordata) == "number") {
                //显示皮肤外观
                let skin_id = bidordata
                let skin_config = Config.partner_skin_data.data_skin_info[skin_id]
                if (skin_config && skin_config.res_id != null && skin_config.res_id != "") {
                    anima_path = "spine/" + skin_config.res_id + "/show.atlas";
                }

                if (skin_config && skin_config.show_effect != "") {
                    effect_path = "spine/" + skin_config.show_effect + "/action.atlas";
                }
            }
        } else {

        }

        if (!anima_path) return;
        if (this.anima_path && this.anima_path != anima_path) {
            this.spine.enabled = false;
            LoaderManager.getInstance().releaseRes(this.anima_path);
        }

        if (this.effect_path && this.effect_path != effect_path) {
            this.effect_sk.enabled = false;
            LoaderManager.getInstance().releaseRes(this.effect_path);
        }

        LoaderManager.getInstance().loadRes(anima_path, (function (res) {
            this.spine.enabled = true;
            this.spine.skeletonData = res;
            this.is_load_finish = true;
            this.setAnimationAct(action_name, loop);
        }).bind(this));

        if (effect_path) {
            LoaderManager.getInstance().loadRes(effect_path, function (effect_sd) {
                this.effect_sk.enabled = true;
                this.effect_sk.skeletonData = effect_sd;
                this.effect_sk.setAnimation(0, "action", true);
            }.bind(this));

        }

        this.effect_path = effect_path;
        this.anima_path = anima_path;
    },

    // 设置动作,如果是加载完成之后,那么直接播放,否则等加载之后播放
    setAnimation: function (action_name, loop) {
        action_name = action_name ? action_name : PlayerAction.show;
        if (loop == null) {
            loop = true;
        }
        if (this.is_load_finish) {
            this.setAnimationAct(action_name, loop);
        } else {
            this.action_data = { action_name: action_name, loop: loop };
        }
    },

    // 播放动作的具体细节
    setAnimationAct: function (action_name, loop) {
        if (this.spine.skeletonData) {
            this.spine.setAnimation(0, action_name, loop);
        }
    },

    setPosition: function (x, y) {
        if (this.node) {
            this.node.setPosition(x, y);
        }
    },
    showShadowUI: function (status) {
        if (status) {
            if (this.shadow == null) {
                let node = new cc.Node()
                this.sript_path = PathTool.getUIIconPath("common", "common_90095")
                LoaderManager.getInstance().loadRes(this.sript_path, (function (res) {
                    if (node && node.isValid) {
                        node.addComponent(cc.Sprite).spriteFrame = res;
                    }
                }).bind(this));
                this.node.addChild(node, -2)
                node.setPosition(0, -210)
                this.shadow = node
            } else {
                this.shadow.active = (true)
            }
        } else {
            if (this.shadow) {
                this.shadow.active = (false)
            }
        }
    },
    // 移除对象,并且移除掉加载资源
    deleteMe: function () {
        if (this.anima_path)
            LoaderManager.getInstance().releaseRes(this.anima_path);
        if (this.effect_path)
            LoaderManager.getInstance().releaseRes(this.effect_path);
        if (this.sript_path)
            LoaderManager.getInstance().releaseRes(this.sript_path);
        this.node.destroy();
    },
});

// 类型
BaseRole.type =
    {
        role: 0,    //角色外观的       
        partner: 1, //伙伴的 在partner_data表里面的
        unit: 2,
        skin: 3,    //显示皮肤外观
    }

module.exports = BaseRole;
