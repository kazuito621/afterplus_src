/**
 * Base config object
 */

(function(){
	if(!window.cfg){
		window.cfg={
		 devServer:'http://dev.arborplus.com'
		 ,hostAndPort:function(){
			  return 'http://'+window.location.host;
			  }
		// @return hostname ie. "http://app.aplustree.com"
		 ,host: function(){
			  return 'http://'+window.location.host.replace(/:[0-9]+$/, '');
			  }
		 ,apiBaseUrl: function(){
					var h=this.host()||'';
					if (h.match(/(localh|127.0.0|0.0.0)/)) h = this.devServer;
				var api=h+'/api/v2.0';
				return api;
					//else return 'http://dev.arborplus.com/api/v2.0';
			  }
		  ,getEntityID: function(){ return this.entityID; } // dev.aplustree
		  ,getEntity: function(){ return this.entity; }
		  ,entityID: null
		  ,entity:{}
		}
	}

	var h=window.location.host;
	// if dev server, load basic config, then attempt load from dev server
	if(h.match(/(localh|127.0.0|0.0.0|dev\.)/)){
		window.cfg.entityID=1;
		window.cfg.entity={
				name:'Easy Tree Service', medname:'Easy Tree', shortname:'easytree', isTcia:1,
				afiliations:'wcisa.png,ctsp.png,papa.jpg,treeworker.jpg,bcma.jpg'
		}
		$.getScript('http://dev.arborplus.com/go/config.js')
	}
})();

