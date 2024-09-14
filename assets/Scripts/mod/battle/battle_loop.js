// --------------------------------------------------------------------
// @author: shiraho@syg.com(必填, 创建模块的人员)
// @description:
//      假战斗单位生成器
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------

window.BattleLoop = {
    /**
     * 初始化对象生成器
     * @param {*} data 
     */
    init:function(data){
        this.next_target_type_pos = 1;
        this.next_target_type_kill = 2;
        this.talk_cd = 0;
        this.col_info = [0, 1, 2, 3, 1, 2, 3, 1, 2, 3],
        this.col_pos_info = [[], [1, 4, 7], [2, 5, 8], [3, 6, 9]],

        this.idx = 0;
        this.data = data;
        this.a_objects = {};
        this.target_objects = {};
        // this.icon_res_list = [5,2,7];
        // this.icon_idx = 0;
        this.randWaveTargets();
        this.b_formation_type = data.b_formation_type || 1;
        this.now_num = 0;
        this.max_num = Math.min(data.partner_list.length, 3);
        this.needPlays = {};
        this.last_pos = 0;
        this.last_time = 0;
        this.a_col = {}
        this.target_play = {};
        this.cd_time = 1;
        if (data.partner_list.length < 2){
            this.cd_time = 2;
        }
        const config = Config.dungeon_data.data_drama_dungeon_info[data.dun_bid.toString()];
        this.talk_list = config.talk_ids;
        var play = {};
        play.objects = {};
        play.target_list = {};
        play.comabt_type = data.combat_type;
        for (let index = 0; index < data.partner_list.length; index++) {
            var element = data.partner_list[index];
            element.playing = 0;
            var temp_pos = index + 1;
            this.a_objects[temp_pos] = element;
            play.objects[temp_pos] = { pos: element.pos, object_bid: element.bid, bid: element.bid, star: element.star, object_type: 2, group: 1, hp: element.hp, hp_max: element.hp, skill_list: [], fashion: element.use_skin };
            const col = this.col_info[element.pos];
            this.a_col[col] = this.a_col[col] || {rnum:0, enum:0};
            this.a_col[col].rnum += 1;
            this.a_col[col][element.pos] = temp_pos;
            // this.a_col[col][v.pos] = i;
            for (let i = 0; i < element.skill_list.length; i++) {
                const temp = element.skill_list[i];
                play.objects[temp_pos].skill_list.push(temp.sid);
            }
        }
        play.target_list[0] = this.nextTarget();
        return play;
    },

    // 产出下一波怪
    nextTarget:function(){
        const now = gcore.SmartSocket.getTime();
        if (this.now_num >= this.max_num) return;
        if (this.now_num > 0 && (now - this.last_time < this.cd_time)) return;
        var pos_list = [];
        var pos_list2 = [];
        var pos = 0;
        var col = 0;
        for (let index = 1; index < 10; index++) {
            pos = index + GIRD_POS_OFFSET;
            col = this.col_info[index];
            if (this.target_objects[pos] == null && this.a_col[col] != null && this.last_pos != pos && (this.a_col[col].rnum > this.a_col[col].enum)){
                pos_list.push(pos);
                if (this.col_info[this.last_pos - GIRD_POS_OFFSET] != col){
                    pos_list2.push(pos);
                }
            }
        }
        if (pos_list2.length > 0){
            pos_list = pos_list2;
        }
        if (pos_list.length > 0){
            pos = this.rand_item(pos_list);
            col = this.col_info[pos-GIRD_POS_OFFSET];
            this.a_col[col].enum = this.a_col[col].enum + 1;
            var target = this.rand_item(this.b_objects);
            this.target_objects[pos] = target;
            this.needPlays[pos] = 1;
            this.last_pos = pos;
            this.last_time = now;
            // var icon = this.icon_res_list[this.icon_idx];
            // this.icon_idx = this.icon_idx % (this.icon_res_list.length) + 1
            this.now_num += 1;
            var play = this.init_play(pos);
            this.target_play[pos] = play;
            return { pos: pos, object_bid:target.bid, bid: target.bid, star: target.star, object_type: 3, group: 2, hp: target.hp, hp_max: target.hp, skill_list: [], actor: play.actor, effect_bid: play.effect_bid}
        }
    },

    // 技能播报计算
    init_play:function (pos){
        if (pos == null) return;
        var target = this.target_objects[pos];
        if(target == null || !this.needPlays[pos]) return;
        var a_idx = this.selectActor(pos);
        this.needPlays[pos] = a_idx;
        var actor = this.a_objects[a_idx];
        actor.playing = actor.playing + 1;
        var skill = this.rand_item_by_key(actor.skill_list, 'rand');
        var play = { skill_plays: [], actor: actor.pos, target: pos, skill_bid: skill.sid };
        var skill_idx = 1;
        var effect_idx = 1;
        var rand_object = this.rand_talk();
        var talk_pos = (rand_object && rand_object.talk_pos) ? rand_object.talk_pos : 0;
        var talk_content = (rand_object && rand_object.talk_content) ? rand_object.talk_content : "";
        var skill_play = { order: skill_idx, bid: actor.bid, actor: actor.pos, target: pos, skill_bid: skill.sid, effect_play: [], talk_pos: talk_pos, talk_content: talk_content }        
        var hp = target.hp

        for (let index = 0; index < skill.effect_list.length; index++) {
            const element = skill.effect_list[index];
            play.effect_bid = element.eid;
            var hurt = Utils.randomNum(element.min_hurt, element.max_hurt);
            var is_crit = 0;
            var tmp_crit = Utils.randomNum(0, 1000);
            if (tmp_crit < actor.crit){
                hurt = Math.ceil(hurt * 1.5);
                is_crit = 1;
            }
            var dec_hp = hurt;
            if (index != (skill.effect_list.length - 1)){
                dec_hp = Math.ceil(Math.min(hurt, hp) / (skill.effect_list.length));
            }
            hp = Math.max(hp - dec_hp);
            var effect_play = { order: effect_idx, actor: actor.pos, target: pos, effect_bid: element.eid, hp: hp, hurt: -hurt, is_crit: is_crit }
            skill_play.effect_play.push(effect_play);
            effect_idx += 1;
        }
        play.skill_plays.push(skill_play);
        return play;
    },

    // 
    play:function(pos){
        var play = this.target_play[pos];
        this.target_play[pos] = null;
        return play;
    },

    // 选择进攻者(选在同行中,优先前排英雄)
    selectActor:function(pos){
        var logic_pos = pos - GIRD_POS_OFFSET;
        var col = this.col_info[logic_pos];
        var col_pos = this.col_pos_info[col];
        var a_col_pos = this.a_col[col];
        var a_idx = 0;
        var a_front_idx = 0;
        for (let index = 0; index < col_pos.length; index++) {
            const a_pos = col_pos[index];
            a_idx = a_col_pos[a_pos]
            if (a_idx){
                a_front_idx = a_front_idx || a_idx;
                if (this.a_objects[a_idx].playing == 0) {
                    return a_idx;
                }
            }
        }
        return a_front_idx;
    },

    // 技能播放完成
    playEnd:function(pos){
        var a_idx = this.needPlays[pos];
        if (a_idx){
            var actor = this.a_objects[a_idx];
            actor.playing -= 1;
        }
        this.needPlays[pos] = null;
        this.target_objects[pos] = null;
        this.now_num -= 1;
        var col = this.col_info[pos - GIRD_POS_OFFSET];
        if (this.a_col[col]){
            this.a_col[col].enum -= 1;
        }
    },

    // 随机说话
    rand_talk:function(){
        this.talk_cd = this.talk_cd - 1;
        if (this.talk_cd > 0) return;
        var talk = this.rand_item_by_key2(this.talk_list, 1, 10000)
        if (talk && talk[0]){
            this.talk_cd = 5;
            var target = this.rand_item(this.a_objects);
            var idx = talk[0] || 1;
            const config = Config.dungeon_data.data_drama_talk[idx.toString()];
            return {talk_pos:target.pos, talk_content:config.talk}
        }
    },

    randWaveTargets:function(){
        if (this.idx % 10 == 0){
            this.b_objects = this.rand_item(this.data.wave_list).unit_list;
        }
        this.idx += 1;
    },

    // 随机从里面取出一项
    rand_item:function(tab){
        if (tab instanceof Array) {
            const length = tab.length;
            var index = Utils.randomNum(1, length);
            return tab[index - 1];
        } else {
            var temp_ary = []
            for (var key in tab) {
                temp_ary.push(key)
            }
            const length = temp_ary.length
            var index = Utils.randomNum(1, length);
            var tab_key = temp_ary[index - 1];
            return tab[tab_key];
        }
    },

    // 按指定建随机一项
    rand_item_by_key:function(tab, key){
        var sum = 0;
        for (let index = 0; index < tab.length; index++) {
            const element = tab[index];
            sum = sum + element[key];
        }
        return this.rand_item_by_key2(tab, key, sum);
    },

    rand_item_by_key2:function(tab, key, sum){
        var rank = Utils.randomNum(1, sum);
        for (let index = 0; index < tab.length; index++) {
            const element = tab[index];
            sum = sum - element[key];
            if (rank >= sum){
                return  element;
            }
        }
    },
};
// module.exports = BattleLoop;