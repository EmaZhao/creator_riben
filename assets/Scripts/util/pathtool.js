// --------------------------------------------------------------------
// @author: shiraho@syg.com(必填, 创建模块的人员)
// @description:
//      获取资源路径的接口
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------

window.PathTool = {
    getPrefabPath: function (module_name, file_name) {
        console.log("getPrefabPath", module_name, file_name)
        return "prefab/" + module_name + "/" + file_name + ".prefab";
        // + ".prefab";
    },

    // 获取动态资源
    getIconPath: function (module_name, file_name, type) {
        var suffix = "png"
        if (type) suffix = type
        return "res/" + module_name + "/" + file_name + "." + suffix;
    },

    // 获取动态资源
    getUIIconPath: function (module_name, file_name, type) {
        var suffix = "png"
        if (type) suffix = type
        return "ui_res/" + module_name + "/" + file_name + "." + suffix;
    },

    // 已经废弃
    getResFrame: function (packageName, resName) {
        // cc.error(null, "不再使用加载合图的方式加载资源 faild--->" + resName);
        // return
        resName = resName || packageName;
        return "res/" + packageName + "/" + resName + ".plist";
    },

    // 已经废弃
    getPlistPath: function (module_name, file_name) {
        // cc.error(null, "不再使用加载合图的方式加载资源 faild--->" + file_name);
        // return
        return "res/" + module_name + "/" + file_name + ".plist";
    },

    getHeadRes: function (res_id) {
        return "res/headicon/" + res_id + ".png";
    },
    getHeadcircle: function (res_id) {
        return "res/headcircle/txt_cn_headcircle_" + res_id + ".png";
    },
    getHonorRes: function (res_id) {
        return "res/honor/txt_cn_honor_" + res_id + ".png";
    },
    getWelfareBannerRes: function(res_id){
        return "res/welfare/welfare_banner/" + res_id + ".png"
    },
    getBigBuffRes(res_id){
        return "res/bigbufficon/" + res_id + ".png"
    },
    // COMMON   = "common",
    // SCENE    = "scene",
    // BATTLE   = "battle",
    // DUBBING  = "dubbing",
    // Recruit  = "recruit",
    // Drama    = "drama",
    getSoundRes: function (res_type, res_name) {
        if (!res_type || !res_name) return
        // return "sound/common/" + res_id + ".mp3";
        // var res_path = null;
        return cc.js.formatStr("sound/%s/%s.mp3", res_type, res_name);
    },

    // 获取大图 
    getBigBg: function (res_id, bgType, module_name) {
        if (module_name) {
            module_name += "/";
        } else {
            module_name = "";
        }
        return "ui_res/bigbg/" + module_name + res_id + "." + (bgType || "png");
    },

    getCommonIcomPath: function (icon_name) {
        return "ui_res/common/" + icon_name + ".png";
    },

    // 获取物品图标
    getItemRes: function (res_id) {
        return "res/item/" + res_id + ".png";
    },
    // 获取单战斗场景的资源
    getBattleSingleBg: function (res_id) {
        return "ui_res/bigbg/battle_bg/" + res_id + "/b_bg.jpg";
    },

    // 用于从cdn下载战斗资源的接口
    getBattleSceneRes:function(resName, is_jpg){
        if(is_jpg == true){
            return "ui_res/bigbg/battle_bg/"+resName+".jpg";
        }else{
            return "ui_res/bigbg/battle_bg/"+ resName +".png";
        }
    },

    // 获取buff资源路径
    getBuffRes:function(res_id){
        return "res/bufficon/" + res_id + ".png";
    },

    //获取游戏图标的接口
    getFunctionRes:function(res_id){
        return "res/functionicon/" + res_id + ".png"
    },

    // 获取剧情副本的战斗背景
    getBattleDrameBg: function (res_id) {
        var bg_path = "ui_res/bigbg/battle_bg/" + res_id;
        return { s: bg_path + "/map_bg.png", f: bg_path + "/m_bg.png" };
    },
    getActivityBig: function (res_id) {
        return "res/activity/activity_big/" + res_id + ".png";
    },
    /**
     * 获取spine路径
     */
    getSpinePath: function (res_id, res_name) {
        if (res_name == null) {
            res_name = PlayerAction.action
        }
        // var strList = res_id.split("");
        // if(strList[0]=="H"){
        //   if(res_id == "H30009" && res_name != "show"){//合josn后统一读取一样图集
        //     res_name = PlayerAction.action;
        //   }
        // }
        return "spine/" + res_id + "/" + res_name + ".atlas";
    },

    // 获取战斗中的阵法图标
    getBattleFormIcon:function(res_id){
        return "res/battleformicon/battle_form_icon_" + res_id + ".png";
    },

    // 获取战斗中的阵营图标
    getBattleCampIcon:function(res_id){
        return "res/battlecamp/battlecamp_" + res_id + ".png";
    },

    // 获取战斗中的阵营图标
    getBattleCampIconByType:function(camp_type){
        if (camp_type == null) {
            camp_type = 1;
        }
        var HeroConst = require("hero_const")
        if (camp_type == HeroConst.CampType.eWater) {
            return "res/battlecamp/battlecamp_1001.png";
        } else if (camp_type == HeroConst.CampType.eFire) {
            return "res/battlecamp/battlecamp_1002.png";
        } else if (camp_type == HeroConst.CampType.eWind) {
            return "res/battlecamp/battlecamp_1003.png";
        } else if (camp_type == HeroConst.CampType.eLight) {
            return "res/battlecamp/battlecamp_1004.png";
        } else if (camp_type == HeroConst.CampType.eDark) {
            return "res/battlecamp/battlecamp_1005.png";
        } else {
            return "res/battlecamp/battlecamp_1000.png";
        }
    },

    // 获取品质框背景(圆形的)
    getRoundQualityBg:function(quality){
        var quality = quality || 1;
        if(quality > 5){
            quality = 5;
        }
        quality = 2000 + quality;
        var res_id = "mainui_"+quality;
        return PathTool.getUIIconPath("mainui", res_id);
    },

    //获取配置表中的effect资源id吧
    getEffectRes: function (id) {
        return gdata("effect_data", "data_effect_info", [id]) || "E88888";
    },

    // 根据物品品质色获取指定的图集ia
    getItemQualityBG: function (quality) {
        if (quality == null) {
            quality = 0
        } else if (quality > 5) {
            quality = 5
        }
        if (quality == 0) {
            return "common_1005"
        } else if (quality == 1) {
            return "common_1006"
        } else if (quality == 2) {
            return "common_1007"
        } else if (quality == 3) {
            return "common_1008"
        } else if (quality == 4) {
            return "common_1009"
        } else {
            return "common_1010"
        }
    },

    // 获取阵营资源
    getHeroCampRes: function (camp) {
        if (camp == null) {
            camp = 1
        } else if (camp > 6) {
            camp = 1
        }
        if (camp == 1) {                // 水
            return "common_90067"
        } else if (camp == 2) {         // 火
            return "common_90068"
        } else if (camp == 3) {         // 风
            return "common_90069"
        } else if (camp == 4) {         // 光
            return "common_90070"
        } else if (camp == 5){          // 暗
            return "common_90071"
        } else if(camp == 6){           //光和暗
            return "common_90079"
        }
    },

    // 获取属性图标
    getAttrIconByStr: function (str) {
        if (str == "atk" || str == "atk_per") {
            return "common_90021"
        } else if (str == "hp" || str == "hp_max" || str == "hp_max_per") {
            return "common_90022"
        } else if (str == "def" || str == "def_per") {
            return "common_90023"
        } else if (str == "speed") {
            return "common_90038"
        } else if (str == "crit_rate") {
            return "common_90043"
        } else if (str == "crit_ratio") {
            return "common_90039"
        } else if (str == "hit_magic") {
            return "common_90040"
        } else if (str == "dodge_magic") {
            return "common_90037"
        } else if(str == "tenacity"){
            return "common_90021_1"
        } else if(str == "hit_rate"){
            return "common_90021_2"
        } else if(str == "res"){
            return "common_90021_3"
        } else if(str == "dodge_rate"){
            return "common_90021_4"
        } else if(str == "cure"){
            return "common_90021_5"
        } else if(str == "be_cure"){
            return "common_90021_6"
        } else if(str == "dam"){
            return "common_90021_7"
        }else {
            return "common_90037"
        }
    },

    // 获取阵营图标
    getHeroCampTypeIcon:function(camp_type){
        if (camp_type == null){
            camp_type = 1;
        }
        var HeroConst = require("hero_const")
        if (camp_type == HeroConst.CampType.eWater){
            return "common_90067";
        }else if(camp_type == HeroConst.CampType.eFire){
            return "common_90068";
        }else if(camp_type == HeroConst.CampType.eWind){
            return "common_90069";
        }else if(camp_type == HeroConst.CampType.eLight){
            return "common_90070";
        }else if(camp_type == HeroConst.CampType.eLingtDark){
            return "common_90079";
        }else{
            return "common_90071";
        }
    },

    //这类单位是没有show动作的,所以要特殊处理
    specialBSModel: function (id) {
        return id == 37300 || id == 37301 || id == 37302
    },

    //获取伙伴类型的,坦克法师这些
    getPartnerTypeIcon: function (_type) {
        _type = _type || 1;
        var _index = 45 + _type;
        return this.getCommonIcomPath("common_900" + _index);
    },

    //获取伙伴半身像资源
    getPartnerBustRes:function(bust_id){
        bust_id = bust_id || 10000;
        return this.getIconPath("partner",bust_id);
    },

    getLogoRes:function(){
        // var logo_res = cc.js.formatStr("ui_res/login/%s/txt_cn_logo.png", "app")
        return "ui_res/login/txt_cn_logo.png"
    },

    //获取选中背景,通用
    getSelectBg(){
        return this.getUIIconPath("common", "common_90019")
    },
};

module.exports = PathTool;
