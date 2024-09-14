// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-05-10 14:20:14
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var TimeTool = require("timetool");

var Guildwar_battle_logPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("guildwar", "guildwar_battle_log_item");
    },

    // 可以初始化声明一些变量的
    initConfig: function () {

    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel: function () {
        this.top_image_sp = this.seekChild("top_image", cc.Sprite);
        this.flag_image = this.seekChild("flag_image");
        this.time_label_lb = this.seekChild("time_label", cc.Label);
        this.log_text_rt = this.seekChild("log_text_rt", cc.RichText);
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {

    },

    setData: function (data) {
        this.data = data;
        if (this.root_wnd)
            this.onShow();
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow: function () {
        if (this.data == null) return
        var data = this.data;
        if (data.flag1 == 1) {    //本方
            this.loadRes(PathTool.getUIIconPath("guildwar", "guildwar_1025"), function (sp) {
                this.top_image_sp.spriteFrame = sp;
            }.bind(this))
        } else if (data.flag1 == 0) {
            this.loadRes(PathTool.getUIIconPath("guildwar", "guildwar_1026"), function (sp) {
                this.top_image_sp.spriteFrame = sp;
            }.bind(this))
        }
        this.time_label_lb.string = TimeTool.getYMDHMS(data.time);

        var role_vo = require("role_controller").getInstance().getRoleVo();

        var myGuildSrvName = this.getLogSrvName(role_vo.gsrv_id); // 我方联盟服务器名
        var myRoleSrvName = this.getLogSrvName(data.srv_id1);    // 我方玩家务器名
        var myRoleName = data.name1 || "";			   // 我方玩家名称
        var myGuildName = role_vo.gname || "";				   // 我方联盟名称
        var enemyGuildSrvName = this.getLogSrvName(data.srv_id); // 敌方联盟服务器名
        var enemyRoleSrvName = this.getLogSrvName(data.srv_id2);// 敌方玩家务器名
        var enemyRoleName = data.name2 || "";				   // 敌方玩家名称
        var enemyGuildName = data.gname || "";			   // 敌方联盟名 

        var star_num = 0; // 获得星数
        var battle_score = 0;// 获得战绩
        var enemy_total = 0; // 敌方总积分
        var buff_lev = 0;// buff等级
        var is_win = false; // 是否胜利
        var self_total = 0;//我方星数
        for (var k in data.int_args) {
            var args = data.int_args[k];
            if (args.key == 1) {
                star_num = args.val;
            } else if (args.key == 2) {
                battle_score = args.val;
            } else if (args.key == 3) {
                enemy_total = args.val;
            } else if (args.key == 4) {
                buff_lev = args.val;
            } else if (args.key == 5) {
                is_win = args.val == 1;
            } else if (args.key == 6){
                self_total = args.val;
            }
        }

        var star_path = PathTool.getUIIconPath("guildwar", "guildwar_1007");
        var star_str = "";
        if (star_num > 0) {
            for (var i = 1; i <= star_num; i++) {
                star_str = star_str + cc.js.formatStr("<img src='%s' />", "guildwar_1007");
            }
        }
        var star_str_2 = cc.js.formatStr("<img src='%s' />", "guildwar_1007");
        var log_str = "";
        var resArr = [star_path,star_path];
        if (data.flag1 == 1 && data.flag2 == 2) {     //我方进攻废墟
            if (role_vo.rid == data.rid1 && role_vo.srv_id == data.srv_id1) {     //玩家自己
                if (is_win) {
                    log_str = cc.js.formatStr(Utils.TI18N("<color=#3a78c4>%s</c>挑战<color=#d95014>%s%s</c>废墟成功，将公会Buff等级提升至<color=#a838bc>%s级</c>。"), myRoleName, enemyRoleSrvName, enemyRoleName, buff_lev);
                } else {
                    log_str = cc.js.formatStr(Utils.TI18N("      很遗憾，<color=#3a78c4>%s</c>挑战<color=#d95014>%s%s</c>废墟失败，下次将卷土重来！"), myRoleName, enemyRoleSrvName, enemyRoleName);
                }
            } else {
                log_str = cc.js.formatStr(Utils.TI18N("公会成员<color=#3a78c4>%s</c>挑战<color=#d95014>%s%s</c>废墟成功，将公会Buff等级提升至<color=#a838bc>%s级</c>。"), myRoleName, enemyRoleSrvName, enemyRoleName, buff_lev);
            }
        } else if (data.flag1 == 1 && data.flag2 == 1) {      //我方进攻据点
            if (role_vo.rid == data.rid1 && role_vo.srv_id == data.srv_id1) {     //玩家自己
                if (is_win) {
                    log_str = cc.js.formatStr(Utils.TI18N("<color=#3a78c4>%s</c>挑战<color=#d95014>%s%s</c>据点成功，获得[%s]和<color=#249003>战绩%s点</c>，己方公会<color=#d95014>%s%s</c>当前星数为%s<color=#a838bc>%s</c>。"), myRoleName, enemyRoleSrvName, enemyRoleName, star_str, battle_score, myGuildSrvName, myGuildName, star_str_2, self_total)
                } else {
                    log_str = cc.js.formatStr(Utils.TI18N("很遗憾，<color=#3a78c4>%s</c>挑战<color=#d95014>%s%s</c>据点失败，下次将卷土重来！"), myRoleName, enemyRoleSrvName, enemyRoleName)
                }
            } else {
                log_str = cc.js.formatStr(Utils.TI18N("公会成员<color=#3a78c4>%s</c>挑战<color=#d95014>%s%s</c>据点成功，获得[%s]和<color=#249003>战绩%s点</c>，己方公会<color=#d95014>%s%s</c>当前星数为%s<color=#a838bc>%s</c>。"), myRoleName, enemyRoleSrvName, enemyRoleName, star_str, battle_score, myGuildSrvName, myGuildName, star_str_2, self_total)
            }
        } else if (data.flag1 == 0 && data.flag2 == 2) {      //敌方进攻废墟
            if (role_vo.rid == data.rid1 && role_vo.srv_id == data.srv_id1 && !is_win) {  //敌方挑战我的废墟失败
                log_str = cc.js.formatStr(Utils.TI18N("<color=#3a78c4>%s</c>的废墟抵挡住了敌方公会成员<color=#d95014>%s%s</c>的挑战，固若金汤！"), myRoleName, enemyRoleSrvName, enemyRoleName);
            } else {
                log_str = cc.js.formatStr(Utils.TI18N("敌方公会成员<color=#d95014>%s%s</c>挑战<color=#3a78c4>%s%s</c>废墟成功，将公会Buff等级提升至<color=#a838bc>%s级</c>。"), enemyRoleSrvName, enemyRoleName, myRoleSrvName, myRoleName, buff_lev);
            }
        } else if (data.flag1 == 0 && data.flag2 == 1) {      //敌方进攻据点
            if (role_vo.rid == data.rid1 && role_vo.srv_id == data.srv_id1 && !is_win) {  //敌方挑战我的据点失败
                log_str = cc.js.formatStr(Utils.TI18N("<color=#3a78c4>%s</c>的据点抵挡住了敌方公会成员<color=#d95014>%s%s</c>的挑战，固若金汤！"), myRoleName, enemyRoleSrvName, enemyRoleName);
            } else {
                log_str = cc.js.formatStr(Utils.TI18N("敌方公会成员<color=#d95014>%s%s</c>挑战<color=#3a78c4>%s%s</c>据点成功，获得[%s]和<color=#249003>战绩%s点</c>，敌方公会<color=#d95014>%s%s</c>当前星数为%s<color=#a838bc>%s</c>。"), enemyRoleSrvName, enemyRoleName, myRoleSrvName, myRoleName, star_str, battle_score, enemyGuildSrvName, enemyGuildName, star_str_2, enemy_total)
            }
        }

        this.log_text_rt.string = log_str;
        for(var i in resArr){
            this.loadRes(resArr[i], (function(resObject){
                this.log_text_rt.addSpriteFrame(resObject);
            }).bind(this));
        }
    },

    getLogSrvName: function (srv_id) {
        if (!srv_id) return ""
        var index = srv_id.search("_");
        var srv_index = 1;
        if (index) {
            srv_index = srv_id.substring(index + 1);
        }
        var srvName = "[s" + srv_index + "]";
        return srvName
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide: function () {

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete: function () {

    },
})