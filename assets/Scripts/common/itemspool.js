
window.ItemsPool = cc.Class({
    extends: cc.Component,

    properties: {
    	_hero_cache: [],
    	_backpack_cache: [],    	
    },
    getItem: function(itemClass) {
    	if (itemClass == "hero_exhibition_item") {
    		if (this._hero_cache.length > 0) {
                return  this._hero_cache.pop();
    		} else {
                var HeroExhibitionItem = require("hero_exhibition_item");
    			return new HeroExhibitionItem();
    		}
    	} else if (itemClass == "backpack_item") {
            if (this._backpack_cache.length > 0) {
                return  this._backpack_cache.pop();
    		} else {
                var BackpackItem = require("backpack_item");
    			return new BackpackItem();
    		}
    	}
    },

    cacheItem: function(item) {
        if(!item.root_wnd){
            item = null;
            return
        }
        var BackpackItem = require("backpack_item");
        var HeroExhibitionItem = require("hero_exhibition_item");
        item.setParent(ViewManager.getInstance().getSceneNode());
        item.init()
        item.hide()
        if(item instanceof BackpackItem){
            this._backpack_cache.push(item)
        }else if(item instanceof HeroExhibitionItem){
            this._hero_cache.push(item)
        }
    }
})


// // ItemsPool.getInstance().getItem("hero_exhibition_item");
ItemsPool.getInstance = function () {
    if (!ItemsPool.instance) {
        ItemsPool.instance = new ItemsPool();
    }
    return ItemsPool.instance;
}
// ItemsPool.getInstance().getItem("backpack_item");
module.exports = ItemsPool;
