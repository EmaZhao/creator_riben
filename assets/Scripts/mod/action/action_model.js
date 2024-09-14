// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      这里填写详细说明,主要填写该模块的功能简要
// <br/>Create: 2019-03-02 16:49:03
// --------------------------------------------------------------------
var MainuiController    = require("mainui_controller");
var MainuiConst = require("mainui_const");
var ActionEvent = require("action_event")
var ActionConst = require("action_const")
var ActionModel = cc.Class({
    extends: BaseClass,
    ctor: function () {
    },

    properties: {
    },

    initConfig: function () {
        // -- 基金红点数据
        this.fund_red_list = {}
    },

    //------------------@ 基金活动相关
    // -- 开启中的基金活动id
    setOpenFundIds(id_list) {
        this.fund_id_list = id_list || []
        this.checkFundRedStatus()
    },
    getOpenFundIds() {
        return this.fund_id_list || []
    },
    // -- 设置基金的数据
    setFundSrvData(data) {
        this.fund_datas = this.fund_datas || {}
        if (data && data.id) {
            this.fund_datas[data.id] = data
            this.updateFundStatus(data.id, data.status)
        }
    },
    // -- 获取基金数据
    getFundSrvDataById(id) {
        this.fund_datas = this.fund_datas || {}
        return this.fund_datas[id] || {}
    },
    updateFundStatus(id, status) {
        this.fund_id_list = this.fund_id_list || []
        for (let k = 0; k < this.fund_id_list.length; ++k) {
            let v = this.fund_id_list[k]
            if (v.id == id) {
                v.status = status
                break
            }
        }
        this.checkFundRedStatus()
    },
    //检查超值基金红点
    checkFundRedStatus() {
        this.fund_id_list = this.fund_id_list || []
        for(let k=0;k<this.fund_id_list.length;++k){
            let v = this.fund_id_list[k]
            if(v.id == ActionConst.FundType.type_one){
                this.updateFundRedStatus(ActionConst.FundRedIndex.fund_get_one, v.status == 1)
                this.updateFundRedStatus(ActionConst.FundRedIndex.fund_buy_one, v.status == 0)
            }else if(v.id == ActionConst.FundType.type_two){
                this.updateFundRedStatus(ActionConst.FundRedIndex.fund_get_two, v.status == 1)
                this.updateFundRedStatus(ActionConst.FundRedIndex.fund_buy_two, v.status == 0)
            }
        }
    },
    // -- 更新基金红点数据
    updateFundRedStatus( bid, status ){
        let _status = this.fund_red_list[bid]
        if(_status == status) return;
        // -- 购买的红点只有登陆时才显示，点击之后消失，之后不再显示
        if((bid == ActionConst.FundRedIndex.fund_buy_one || bid == ActionConst.FundRedIndex.fund_buy_two) && _status == false){
            return
        }

        this.fund_red_list[bid] = status

        let red_status = false
        for(let k in this.fund_red_list){
            let v = this.fund_red_list[k]
            if(v == true){
                red_status = true
                break
            }
        }
        MainuiController.getInstance().setFunctionTipsStatus(MainuiConst.icon.fund, red_status)
        gcore.GlobalEvent.fire(ActionEvent.UPDATA_FUND_RED_STATUS_EVENT)
    },
    updateSevenLoginData: function (data) {
        this.seven_login_data = data;
    },

    getSevenLoginData: function () {
        return this.seven_login_data;
    },

    // --desc:获取当前可领取7天登录的最大天数
    getMaxSevenDay: function () {
        if (this.seven_login_data == null || this.seven_login_data.status_list == null) return;
        var status_list = this.seven_login_data.status_list;
        status_list.sort(function (a, b) {
            return a.day - b.day;
        });

        var day = null;
        for (var i in status_list) {
            if (status_list[i].status == 2) {
                day = status_list[i];
                break;
            }
        }
        if (day == null) {
            day = status_list[status_list.length];
        }
        return day;
    },
    setFirstBtnStatus:function(data){
        this.firstBtnStatus = {}
        for(let i=0;i<data.length;++i){
            let v = data[i]
            this.firstBtnStatus[v.id] = v.status
        }
    },

    getFirstBtnStatus: function (index) {
        if (!this.firstBtnStatus) return
        return this.firstBtnStatus[index] || 0
    },

    // 获取七日目标的周期数
    setSevenGoldPeriod:function(period){
        this.sevenPeriod = period;
    },

    getSevenGoldPeriod:function(){
        return this.sevenPeriod;
    },

    // 七天目标检查红点   --当前天数以下的
    checkRedPoint:function(day){
        if(day < 1 || day > 7)return;
        day = day || 1;
        // 福利
        this.welfareRetPoint = [];
        for(var i=1; i<=day;i++){
            var welfare = this.getSevenGoalWelfareList(i);
            this.welfareRetPoint[i] = false;
            for(var k in welfare){
                if(welfare[k].status == 1){
                    this.welfareRetPoint[i] = true;
                    break;
                }
            }
        }
        // 每日目标
        this.growRetPoint = [];
        for(var i=1; i<=day;i++){
            var grow = this.getServerGrowListData(i-1);
            this.growRetPoint[i] = false;
            for(var k in grow){
                if(grow[k].status == 1){
                    this.growRetPoint[i] = true;
                    break;
                }
            }
        }
        // 超值礼包
        this.giftRetPoint = [];
        for(var i=1; i<=day;i++){
            var grow = this.getServerGiftListData(i-1);
            this.giftRetPoint[i] = false;
            for(var k in grow){
                if(grow[k].status == 1){
                    this.giftRetPoint[i] = true;
                    break;
                }
            }
        }

        this.halfRedPoint = [];
        // 0、还有领取  1、已领取
        for(var i=1; i<=day;i++){
            var half = this.getHalfGiftList(i);
            this.halfRedPoint[i] = false;
            for(var k in half){
                if(k == 0 && half[k].status == 0){
                    this.halfRedPoint[i] = true;
                    break;
                }
            }
        }

        // 宝箱
        this.boxRedPoint = [];
        var box = this.getSevenGoalBoxList();
        for(var i in box){
            this.boxRedPoint[i] = false;
            if(box[i].status == 1){
                this.boxRedPoint[i] = true;
            }
        }

        var redStatus = false;
        var redStatus1 = false;
        var redStatus2 = false;
        var redStatus3 = false;
        var redStatus4 = false;
        var redStatus5 = false;

        for(var i in this.welfareRetPoint){
            if(this.welfareRetPoint[i] == true){
                redStatus1 = true;
                break;
            }
        }

        for(var i in this.growRetPoint){
            if(this.growRetPoint[i] == true){
                redStatus2 = true;
                break;
            }
        }

        for(var i in this.giftRetPoint){
            if(this.giftRetPoint[i] == true){
                redStatus3 = true;
                break;
            }
        }

        for(var i in this.halfRedPoint){
            if(this.halfRedPoint[i] == true){
                redStatus5 = true;
                break;
            }
        }

        for(var i in this.boxRedPoint){
            if(this.boxRedPoint[i] == true){
                redStatus4 = true;
                break;
            }
        }

        redStatus = redStatus1 || redStatus2 || redStatus3 || redStatus4 || redStatus5;
        var icon_id = MainuiConst.icon.seven_goal;
        if(this.getSevenGoldPeriod() == 1){
            icon_id = MainuiConst.icon.seven_goal
        }else if(this.getSevenGoldPeriod() == 2){
            icon_id = MainuiConst.icon.seven_goal1;
        }else if(this.getSevenGoldPeriod() == 3){
            icon_id = MainuiConst.icon.seven_goal2;
        }else{
            icon_id = MainuiConst.icon.seven_goal3
        }
        
        MainuiController.getInstance().setFunctionTipsStatus(icon_id, redStatus);
    },

    // 红点状态
    getRedPointWelfareStatus:function(day){
        if(!this.welfareRetPoint)return;
        var status = false;
        status = this.welfareRetPoint[day];
        return status;
    },

    // 更新
    updataRedPointWelfareStatus:function(day, status){
        if(!this.welfareRetPoint)return;
        this.welfareRetPoint[day] = status;
    },

    getRedPointGrowStatus:function(day){
        if(!this.growRetPoint)return;
        var status = false;
        status = this.growRetPoint[day];
        return status;
    },

    // 更新
    updataRedPointGrowStatus:function(day, status){
        if(!this.growRetPoint)return;
        this.growRetPoint[day] = status;
    },

    getRedPointGiftStatus:function(day){
        if(!this.giftRetPoint)return;
        var status = false;
        status = this.giftRetPoint[day];
        return status;
    },

    // 更新
    updataRedPointGiftStatus:function(day, status){
        if(!this.giftRetPoint)return;
        this.giftRetPoint[day] = status;
    },

    // 福利礼包
    getRedPointHalfStatus:function(day){
        if(!this.halfRedPoint)return;
        var status = false;
        status = this.halfRedPoint[day];
        return status;
    },

    // 更新
    updataRedPointHalfStatus:function(day, status){
        if(!this.halfRedPoint)return;
        this.halfRedPoint[day] = status
    },

    getRedPointBoxStatus:function(index){
        if(!this.boxRedPoint)return;
        var status = false;
        status = this.boxRedPoint[index];
        return status;
    },

    // 更新
    updataRedPointBoxStatus:function(index, status){
        if(!this.boxRedPoint)return;
        this.boxRedPoint[index] = status;
    },

    // 七天目标*********** start *****
    initSevenWalfare:function(index){
        this.setWalfareData(index);
        this.setWalfareGrowUpData(index);
        this.setHalfGiftData(index);
        this.setBoxRewardData(index);
    },

    // 宝箱
    setBoxRewardData:function(index){
        var data = Config.day_goals_data.data_all_target[index]
        this.boxRewardData = [];
        for(var i in data){
            this.boxRewardData.push(data[i][0]);
        }
        this.boxRewardData.sort(function(a,b){
            return a.id - b.id;
        })
    },

    getBoxRewardData:function(){
        return this.boxRewardData || [];
    },

    // 福利
    setWalfareData:function(index){
        var data = Config.day_goals_data.data_welfarecollection[index];
        this.welfareData = Utils.deepCopy(data);
    },
    
    // 成长目标
    setWalfareGrowUpData:function(index){
        var data = Config.day_goals_data.data_growthtarget[index];
        this.welfareGrowData = [];
        this.welfareGiftData = [];
        for(var i in data){
            var tab = [];
            var tab1 = [];
            for(var k in data[i]){
                if(data[i][k].target_type == 1){
                    tab.push(data[i][k]);
                }else if(data[i][k].target_type == 2){
                    tab1.push(data[i][k]);
                }
            }
            this.welfareGrowData.push(tab);
            this.welfareGiftData.push(tab1);
        }
    },

    // 福利礼包
    setHalfGiftData:function(index){
        var data = Config.day_goals_data.data_halfdiscount[index];
        this.walfareHalfData = [];
        for(var i=1;i<=7;i++){
            this.walfareHalfData[i] = [];
        }

        for(var i in data){
            this.walfareHalfData[data[i][0].day].push(data[i][0]);
        }

        for(var i=1;i<=7;i++){
            this.walfareHalfData[i].sort(function(a,b){
                return a.id - b.id;
            });
        }
    },

    getWalfareData:function(day){
        if(!this.welfareData)return;
        return this.welfareData[day] || [];
    },

    getWalfareGrowUpData:function(day){
        if(!this.welfareGrowData)return;
        return this.welfareGrowData[day] || [];
    },

    getWelfareGiftData:function(day){
        if(!this.welfareGiftData)return;
        return this.welfareGiftData[day] || [];
    },

    getWelfareHalfData:function(day){
        if(this.walfareHalfData && this.walfareHalfData[day]){
            return this.walfareHalfData[day] || [];
        }
    },

// *********** 协议相关*********
// 七天目标的福利领取
    setSevenGoalWelfareList:function(data){
        this.welfareList = [];
        for(var i=1;i<=7;i++){
            this.welfareList[i] = [];
        }
        for(var i in data){
            this.welfareList[data[i].day].push(data[i]);
        }
    },

    getSevenGoalWelfareList:function(day){
        if(!this.welfareList)return;
        return this.welfareList[day] || [];
    },

    // 更新数据
    updataGoalWelfareList:function(day, index, status){
        this.welfareList[day][index].status = status;    
    },

    // 七天目标的成长目标
    setSevenGoalGrowList:function(data){
        var grow_list = [];
        for(var i=1;i<=7;i++){
            grow_list[i] = [];
        }
        for(var i in data){
            grow_list[data[i].day].push(data[i]);
        }

        this.serverGrowListData = [];
        this.serverGiftListData = [];
        for(var i in grow_list){
            var tab = [];
            var tab1 = [];
            for(var k in grow_list[i]){
                if(grow_list[i][k].target_type == 1){
                    tab.push(grow_list[i][k]);
                }else if(grow_list[i][k].target_type == 2){
                    tab1.push(grow_list[i][k]);
                }
            }
            this.serverGrowListData.push(tab);
            this.serverGiftListData.push(tab1);
        }
    },

    getServerGrowListData:function(day){
        if(this.serverGrowListData && this.serverGrowListData[day]){
            return this.serverGrowListData[day] || [];
        }
        return [];
    },

    // 更新数据
    updataGrowListData:function(day, index, status){
        this.serverGrowListData[day][index].status = status;
    },

    getServerGiftListData:function(day){
        if(!this.serverGiftListData)return;
        return this.serverGiftListData[day] || [];
    },

    // 更新数据
    updataGiftListData:function(day, index, status){
        this.serverGiftListData[day][index].status = status;
    },

    // 福利礼包礼包购买
    setHalfGiftList:function(data){
        this.halfGiftList = [];
        for(var i=1;i<=7;i++){
            this.halfGiftList[i] = [];
        }
        for(var i=1;i<=7;i++){
            var half_list = this.getWelfareHalfData(i);
            for(var k in half_list){
                for(var b in data){
                    if(half_list[k].id == data[b].day){
                        this.halfGiftList[i].push(data[b]);
                    }
                }
            }
        }
    },

    getHalfGiftList:function(day){
        if(this.halfGiftList && this.halfGiftList[day]){
            return this.halfGiftList[day] || [];
        }
    },
    
    // 更新数据
    updataHalfListData:function(day, index, status){
        this.halfGiftList[day][index].status = status;
    },

    // 活跃宝箱
    setSevenGoalBoxList:function(data){
        this.boxList = data;
    },
    
    getSevenGoalBoxList:function(){
        if(!this.boxList)return;
        this.boxList.sort(Utils.tableLowerSorter(["goal_id"]));
        return this.boxList || [];
    },

    // 更新数据
    updataBoxListData:function(index, status){
        this.boxList[index].status = status;
    },
    sortItemList(list){
        let tempsort = {
            [0] : 2,  //-- 0 未领取放中间
            [1] : 1,  //-- 1 可领取放前面
            [2] : 3,  //-- 2 已领取放最后
        }
        let sortFunc = function (objA,objB){
            if (objA.status != objB.status){
                if (tempsort[objA.status] && tempsort[objB.status]){
                    return tempsort[objA.status] - tempsort[objB.status]
                }else{
                    return -1
                }
            }else{
                return objA.aim - objB.aim
            }
        }
        list.sort(sortFunc)
    },
    //设置倒计时
    setCountDownTime(text,less_time){
        let node = text.node
        if(!node)return
        node.stopAllActions();
        if (less_time > 0){
            this.setTimeFormatString(text,less_time)
            let callfun = cc.callFunc(function () {
                less_time = less_time - 1;
                if (less_time < 0) {
                    node.stopAllActions();
                    text.string = "00:00:00"
                } else {
                    this.setTimeFormatString(text,less_time)
                }
            }.bind(this))
            node.runAction(cc.repeatForever(cc.sequence(cc.delayTime(1), callfun)))
        }else{
            this.setTimeFormatString(text,less_time)
        }
    },
    setTimeFormatString(text,time){
        var TimeTool = require("timetool")
        if(time > 0){
            text.string = TimeTool.getTimeForFunction(time);
        }else{
            text.node.stopAllActions();
            text.string = "00:00:00"
        }
    },
    // *********** end *********************************************
    // 幸运值
    setLucklyRewardData:function(){
        var data = Config.dial_data.data_get_lucky_award;
        var list = this.sortLucklyData(data);
        this.lucky_num1 = list[0];
        this.lucky_num2 = list[1];
    },

    getLucklyRewardData:function(index){
        if(!this.lucky_num1 || !this.lucky_num2)return [];
        if(index == 1){
            return this.lucky_num1 || [];
        }else if(index == 2){
            return this.lucky_num2 || [];
        }
    },

    // 抽奖两个按钮
    setBuyRewardData:function(){
        var data = Config.dial_data.data_get_limit_open;
        var list = this.sortLucklyData(data, true);
        this.buy_num_list1 = list[0];
        this.buy_num_list2 = list[1];
    },

    getBuyRewardData:function(index){
        if(!this.buy_num_list1 || !this.buy_num_list2)return [];
        if(index == 1){
            return this.buy_num_list1 || [];
        }else if(index == 2){
            return this.buy_num_list2 || [];
        }
    },
    
    sortLucklyData:function(data, _type){
        var list1 = [];
        var list2 = [];
        for(var i in data){
            var v = data[i];
            if(v.type == 1){
                list1.push(v);
            }else if(v.type == 2){
                list2.push(v);
            }
        }
        if(_type){
            list1.sort(function(a, b){
                return a.type2-b.type2;
            });

            list2.sort(function(a, b){
                return a.type2-b.type2;
            });
        }else{
            list1.sort(function(a, b){
                return a.id- b.id;
            });

            list2.sort(function(a, b){
                return a.id - b.id;
            });
        }
        return [list1,list2];
    },

    // ------- 探宝服务器返回----------
    // 寻宝数据
    setTreasureInitData:function(data){
        this.treasureInitData = [];
        for(var i in data){
            this.treasureInitData[data[i].type] = data[i];
        }
    },

    getTreasureInitData:function(index){
        if(!this.treasureInitData)return[];
        return this.treasureInitData[index] || [];
    },

    // 更新
    updataTreasureInitData:function(index, data){
        if(!this.treasureInitData)return;
        this.treasureInitData[index].count = data.count;
        this.treasureInitData[index].end_time = data.end_time;
        this.treasureInitData[index].lucky = data.lucky;
        this.treasureInitData[index].lucky_award = data.lucky_award;
        this.treasureInitData[index].rand_lists = data.rand_lists;
    },

    // 更新日记
    updataTreasureLogData:function(index, data){
        if(!this.treasureInitData)return;
        this.treasureInitData[index].log_list = data;
    },

    // *********探宝红点*********
    lucklyRedPoint:function(){
        this.setLucklyRewardData();
        this.tab_redpoint = [false,false];
        for(var val=1;val<=2;val++){
            var data = this.getLucklyRewardData(val);
            var serve_data = this.getTreasureInitData(val);
            var status = false;
            for(var j in data){
                var _bool = true;
                for(var k in serve_data.lucky_award){
                    if(data[j].id == serve_data.lucky_award[k].lucky){
                        _bool = false;
                        break;
                    }
                }
                if(serve_data.lucky < data[j].lucky_val){
                    _bool = false;
                }

                if(_bool == true){
                    status = true;
                    break;
                }
            }
            this.setLucklyTabRedPoint(val,status);
        }
        MainuiController.getInstance().setFunctionTipsStatus(MainuiConst.icon.lucky_treasure, this.tab_redpoint[1] || this.tab_redpoint[2]);
    },

    // 获取幸运探宝页签红点
    setLucklyTabRedPoint:function(index,status){
        this.tab_redpoint[index] = status;
    },
    
    getLucklyTabRedPoint:function(index){
        if(this.tab_redpoint && this.tab_redpoint[index]){
            return this.tab_redpoint[index];    
        }
        return false;
    },

    getFundRedStatusByBid( bid ){
        return this.fund_red_list[bid]
    },


    //杂货铺数据
    setStoneShopData:function(data){
        this.stone_shop_data = {};
        for(var i in data){
            var v = data[i];
            this.stone_shop_data[v.id]= v;
        }
    },

    getStoneShopData:function(id){
        if(this.stone_shop_data && this.stone_shop_data[id] != null){
            return this.stone_shop_data[id]
        }
        return null
    },

    // -----------每日红点仅显示一次-----------
    updateGiftRedPointStatus:function(data){
        var bid = data.bid;
        this.gift_id_list = this.gift_id_list || [];
        this.gift_id_list[bid] = data;
    },

    getGiftRedStatusByBid:function(bid){
        if(!this.gift_id_list)return;
        var list = this.gift_id_list[bid];
        if(list){
            return list.status
        }
    },

    setGiftRedStatus:function(data){
        if(!this.gift_id_list)return;
        var bid = data.bid;
        var status = data.status;
        var list = this.gift_id_list[bid];
        if(list && list.status != status){
            list.status = status;
        }
        gcore.GlobalEvent.fire(ActionEvent.SHOW_ACTIVITY_RED_POINT, bid, status);
    },

    updataFestvalRedStatus(bid,data){
        let red_status = this.getRedPointStatus(data)
        let festval_bid = MainuiConst.icon.festval
        if(bid == ActionConst.ActionRankCommonType.festval_day){
            festval_bid = MainuiConst.icon.festval_spring
        }else if(bid == ActionConst.ActionRankCommonType.lover_day){
            festval_bid = MainuiConst.icon.festval_lover
        }
        MainuiController.getInstance().setFunctionTipsStatus(festval_bid, red_status)
    },
    getRedPointStatus(data){
        if(!data)  return false;
        let red_status = false 
        for(let k=0;k<data.length;++k){
            let v = data[k]
            if(v.status == 1){
                red_status = true 
                break
            }
        }
        return red_status
    },
    updataCombineLoginRedStatus(data){
        if(!data) return;
        let red_status = false 
        for(let k=0;k<data.length;++k){
            let v = data[k]
            if(v.status == 1){
                red_status = true 
                break
            }
        }
        MainuiController.getInstance().setFunctionTipsStatus(MainuiConst.icon.combine_login, red_status)
    },
    updataPreferentialRedStatus( status, id ){
        if(true)  return;  //暂时屏蔽掉 不需要

        // id = id or MainuiConst.icon.preferential
        // if status then
        //     if self.prefer_fisrt_flag == nil then
        //         self.prefer_fisrt_flag = {}
        //     end
        //     if not self.prefer_fisrt_flag[id] then
        //         self.prefer_fisrt_flag[id] = true
        //     else
        //         status = false
        //     end
        // end
        // MainuiController:getInstance():setFunctionTipsStatus(id, status)
    },
    clearFundSrvData(  ){
        this.fund_datas = {}
    }
});