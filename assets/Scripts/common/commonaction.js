window.CommonAction = {
	/**
	 * [breatheShineAction3 description]
	 * @author zhanghuxing 2019-01-19
	 * @param  {[type]} obj        [description]
	 * @param  {[type]} scale      [description]
	 * @param  {[type]} scale_time [description]
	 * @return {[type]}            [description]
	 */

	// 统一选中的动态效果
	breatheShineAction:function(obj, in_time, out_time){
		if (!obj) return
		in_time = in_time || 0.7;
		out_time = out_time || 0.4;
		var fadein = cc.fadeIn(in_time);
		var fadeout = cc.fadeOut(out_time);
		obj.runAction(cc.repeatForever(cc.sequence(fadein,fadeout)));

	},

	breatheShineAction3: function(obj, scale, scale_time) {
		if (!obj) return
	    scale = scale ? scale : 1.05;
	    scale_time = scale_time ? scale_time : 0.6;

		var scale_open = cc.scaleTo(scale_time, scale);
		var scale_close = cc.scaleTo(scale_time, 1);
		obj.runAction(cc.repeatForever(cc.sequence(scale_open, scale_close)));
	},

	
 	breatheShineAction4:function(obj, move_time, off_y){
		if(obj == null)return;
		move_time = move_time || 0.5;
		off_y = off_y || 10;
		var move_by_1 = cc.moveBy(move_time, cc.v2(0, -off_y));
		var move_by_2 = cc.moveBy(move_time * 2, cc.v2(0, 2 * off_y));
		var move_by_3 = cc.moveBy(move_time, cc.v2(0, -off_y));
		obj.runAction(cc.repeatForever(cc.sequence(move_by_1,move_by_2, move_by_3)));
	}


}