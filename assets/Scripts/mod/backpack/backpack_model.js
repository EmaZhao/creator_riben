// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      这里填写详细说明,主要填写该模块的功能简要
// <br/>Create: 2018-12-24 16:50:14
// --------------------------------------------------------------------
var BackPackConst = require("backpack_const")
var BackpackModel = cc.Class({
    extends: BaseClass,
    ctor: function () {
    },

    properties: {
    },

    initConfig: function () {
        this.item_list = {}             // 物品列表,背包类型座位key
        this.hallows_comp_list = {}     //神器合成
        this.equip_score_list = {}
    },

    /**
     * 初始化背包和装备背包数据
     * @param {*} data 
     */
    initItemList: function (data) {
        var GoodsVo = require("goods_vo");
        var bag_list = {};
        for (let index = 0; index < data.item_list.length; index++) {
            const element = data.item_list[index];
            var item_vo = new GoodsVo();
            item_vo.initAttrData(element);
            bag_list[element.id] = item_vo;

            // 装备背包备個多个最高评分列表的4件装备
            this.updateEquipScoreList(data.bag_code, item_vo)
        }
        // 储存空间物品
        var bag_code = data.bag_code;
        this.item_list[bag_code] = bag_list;

        // -- 是装备背包
        if (bag_code == BackPackConst.Bag_Code.EQUIPS) {
            // self.cur_equip_volume = #data.item_list 
            // -- MainuiController:getInstance():setBtnRedPoint(MainuiConst.new_btn_index.backpack, (self.cur_equip_volume >= data.volume))
        } else {
            if (!this.is_init_hero_chip_redpoint) {
                this.is_init_hero_chip_redpoint = true
                this.getHeroChipRedPoint()
            }
        }
        this.setHallowsCompData();

        gcore.GlobalEvent.fire(EventId.GET_ALL_DATA, bag_code);
    },
    getHeroChipRedPoint() {
        let hero_list = this.getAllBackPackArray(BackPackConst.item_tab_type.HERO)
        let status = false
        for (let i = 0; i < hero_list.length; ++i) {
            let v = hero_list[i]
            status = this.checkHeroChipRedPoint(v)
            if (status) {
                break
            }
        }
        var MainuiController = require("mainui_controller")
        var MainuiConst = require("mainui_const")
        MainuiController.getInstance().setBtnRedPoint(MainuiConst.new_btn_index.backpack, status)
    },
    // --检查英雄碎片是否能合/成
    checkHeroChipRedPoint(v) {
        if (v.quality != -1 && v.base_id) {
            // --碎片
            let partner_config = Config.partner_data.data_get_compound_info
            if (partner_config[v.base_id]) {
                if (v.quantity >= partner_config[v.base_id].num) {
                    return true
                }
            }
            // --符文
            if (this.hallows_comp_list && this.hallows_comp_list[v.base_id]) {
                if (v.quantity >= this.hallows_comp_list[v.base_id].num) {
                    return true
                }
            }
        }
        return false
    },
    // 增加或者更新一个物品
    updateBagItemsNum: function (data, is_update) {
        var GoodsVo = require("goods_vo");
        var add_list = {}
        var bag_code = null
        for (let index = 0; index < data.item_list.length; index++) {
            const element = data.item_list[index];
            if (this.item_list[element.storage] == null) {
                this.item_list[element.storage] = {}
            }
            var item_vo = this.item_list[element.storage][element.id]
            if (item_vo == null) {
                item_vo = new GoodsVo()
                this.item_list[element.storage][element.id] = item_vo
            }

             //背包英雄符文碎片红点逻辑 (先算是否有红点) -zys
             let status = null;
             let config = Utils.getItemConfig(element.base_id);
             if (config.sub_type == BackPackConst.item_tab_type.HERO) {
                 status = this.checkHeroChipRedPoint(item_vo);
             }

            item_vo.initAttrData(element);

            // 储存一下存储空间
            if (bag_code == null) {
                bag_code = element.storage
            }
            // 备個新增物品
            add_list[element.id] = item_vo;


            // 装备背包备個多个最高评分列表的4件装备
            if (bag_code == BackPackConst.Bag_Code.EQUIPS) {
                if (item_vo && item_vo.config) {
                    var type = item_vo.config.type || 1;
                    if (!this.equip_score_list[type])
                        this.equip_score_list[type] = {};
                    this.equip_score_list[type][item_vo.id] = item_vo;
                }
            }
            this.updateEquipScoreList(bag_code, item_vo)

            //背包英雄符文碎片红点逻辑 (如果没有红点才判断)-zys
            if (!status && config.sub_type == BackPackConst.item_tab_type.HERO) {
                if (this.checkHeroChipRedPoint(item_vo)) {
                    var MainuiController = require("mainui_controller")
                    var MainuiConst = require("mainui_const")
                    MainuiController.getInstance().setBtnRedPoint(MainuiConst.new_btn_index.backpack, true);
                }
            }
        }
        bag_code = bag_code || BackPackConst.Bag_Code.BACKPACK;

        if (is_update) {
            gcore.GlobalEvent.fire(EventId.MODIFY_GOODS_NUM, bag_code, add_list);
        } else {
            gcore.GlobalEvent.fire(EventId.ADD_GOODS, bag_code, add_list);
        }
    },

    // 删除一个物品
    deleteBagItems: function (data) {
        var del_list = {}
        var bag_code = null
        for (let index = 0; index < data.item_list.length; index++) {
            const element = data.item_list[index];
            if (this.item_list[element.storage]) {
                var item_vo = this.item_list[element.storage][element.id]
                if (bag_code == null) {
                    bag_code = element.storage
                }
                // bag_code = item_vo.storage || BackPackConst.Bag_Code.BACKPACK
                if (bag_code == BackPackConst.Bag_Code.EQUIPS) {
                    if (item_vo && item_vo.config) {
                        var type = item_vo.config.type || 1;
                        if (!this.equip_score_list[type])
                            this.equip_score_list[type] = {};
                        this.equip_score_list[type][item_vo.id] = null;
                    }
                } else if (bag_code == BackPackConst.Bag_Code.BACKPACK) {
                    //背包里面的符文(以前神器)
                    if (item_vo && item_vo.config) {
                        var type = item_vo.config.type || 1;
                        if (type == BackPackConst.item_type.ARTIFACTCHIPS) {
                            if (!this.equip_score_list[type])
                                this.equip_score_list[type] = {};
                            this.equip_score_list[type][item_vo.id] = null;
                        }
                    }
                }

                if (item_vo) {
                    del_list[element.id] = item_vo
                    this.item_list[element.storage][element.id] = null
                }
            }
            // 储存一下存储空间
            // if (bag_code == null) {
            //     bag_code = element.storage
            // }
        }
        bag_code = bag_code || BackPackConst.Bag_Code.BACKPACK;
        gcore.GlobalEvent.fire(EventId.DELETE_GOODS, bag_code, del_list);
    },

    // 根据背包标签页类型返回当前的物品列表
    getAllBackPackArray: function (type) {
        type = type || BackPackConst.item_tab_type.EQUIPS
        var bag_code = BackPackConst.Bag_Code.BACKPACK
        if (type == BackPackConst.item_tab_type.EQUIPS) {
            bag_code = BackPackConst.Bag_Code.EQUIPS
        }
        var bag_list = this.item_list[bag_code]
        var temp_list = []
        for (var key in bag_list) {
            var item_vo = bag_list[key]
            if (item_vo && item_vo.config && item_vo.config.sub_type == type) {
                temp_list.push(item_vo)
            }
        }
        if (temp_list.length > 0) {
            temp_list.sort(Utils.tableUpperSorter(["quality", "sort", "base_id"]))
        }
        // 排序
        return temp_list
    },

    // 获取对应背包类型的物品列表 
    getBagItemList: function (bag_code) {
        return this.item_list[bag_code] || {};
    },


    // 根据bid获得道具物品的数量(包括资产道具)
    getItemNumByBid: function (bid) {
        var asset_key = gdata("item_data", "data_assets_id2label", bid);
        if (asset_key) {
            return this.getRoleAssetByAssetKey(asset_key);
        } else {
            return this.getBackPackItemNumByBid(bid);
        }
    },
    getRoleAssetByAssetKey:function(asset_key){
        if (asset_key) {
            var RoleController = require("role_controller");
            var role_vo = RoleController.getInstance().getRoleVo();
            if (role_vo[asset_key]) {
                if(asset_key == "gold" || asset_key == "gold_hard"){
                    return role_vo.getTotalGold();
                }else{
                    return role_vo[asset_key];
                }
            } else {
                return 0;
            }
        }
        return 0;
    },
    // 根据bid获取背包物品的数量 
    getPackItemNumByBid: function (bag_code, bid) {
        if (bag_code == null) {
            bag_code = BackPackConst.Bag_Code.BACKPACK
        }
        let len = 0;
        let bag_list = this.getBagItemList(bag_code);
        for (let k in bag_list) {
            let item = bag_list[k];
            if (item && item.config && item.config.id == bid) {
                len += item.quantity;
            }
        }
        return len;
    },

    // 根据bid获取背包物品数量
    getBackPackItemNumByBid: function (bid) {
        return this.getPackItemNumByBid(BackPackConst.Bag_Code.BACKPACK, bid);
    },

    getItemListForShare: function (bag_type) {
        var bag_code = bag_type || BackPackConst.Bag_Code.BACKPACK;
        var list = this.item_list[bag_code];
        var target_list = [];
        if (list) {
            for (var item_i in list) {
                if (list[item_i] && list[item_i].config && list[item_i].config.can_share === 1) {
                    target_list.push(list[item_i]);
                }
            }
        }
        return target_list
    },

    //根据id获取背包的物品数据
    getBackPackItemById: function (id) {
        return this.getBagItemById(BackPackConst.Bag_Code.BACKPACK, id)
    },

    //根据bag_code，id获得物品数据
    getBagItemById: function (bag_code, id) {
        var temp_list = this.getBagItemList(bag_code);
        if (temp_list != null && temp_list[id] != null) {
            return temp_list[id]
        }
    },

    //根据类型获得背包中该类型物品的列表
    getBackPackItemListByType: function (type) {
        var list = [];
        var bag_list = this.getBagItemList(BackPackConst.Bag_Code.BACKPACK);
        for (var k in bag_list) {
            var item = bag_list[k];
            if (item && item.config && item.config.type == type) {
                list.push(item);
            }
        }
        return list
    },

    //根据bid获取物品的id列表
    getBackPackItemIdListByBid: function (bid) {
        var id_list = [];
        var bag_list = this.getBagItemList(BackPackConst.Bag_Code.BACKPACK);
        for (var k in bag_list) {
            var item = bag_list[k];
            if (item && item.config && item.config.id == bid) {
                id_list.push(item.id);
            }
        }
        return id_list
    },

    //神器合成
    setHallowsCompData: function () {
        if (Utils.next(this.hallows_comp_list) != null) return;
        var data_list = Config.item_product_data.data_product_data;
        for (var i in data_list) {
            var v = data_list[i];
            this.hallows_comp_list[v.need_items[0][0]] = { bid: v.bid, num: v.need_items[0][1] };
        }
    },

    getHallowsCompData: function (id) {
        if (!this.hallows_comp_list && Utils.next(this.hallows_comp_list) == null) {
            return this.hallows_comp_list[id] || {};
        }
    },

    getAllEquipListByType: function (type) {
        return this.equip_score_list[type] || [];
    },

    updateEquipScoreList: function (bag_code, temp_item) {
        if (temp_item && temp_item.config) {
            var type = temp_item.config.type || 1;
            // 装备背包备個一个序号列表
            if (bag_code == BackPackConst.Bag_Code.EQUIPS) {
                if (!this.equip_score_list[type])
                    this.equip_score_list[type] = {};
                this.equip_score_list[type][temp_item.id] = temp_item;
            } else if (bag_code == BackPackConst.Bag_Code.BACKPACK) {
                // 背包里面的符文(以前神器)
                if (type == BackPackConst.item_type.ARTIFACTCHIPS) {
                    if (!this.equip_score_list[type])
                        this.equip_score_list[type] = {};
                    this.equip_score_list[type][temp_item.id] = temp_item;
                }
            }
        }
    },
});

module.exports = BackpackModel;
