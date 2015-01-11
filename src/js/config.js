
// config file for angular

window.cfg={
    hostAndPort:function(){
        return 'http://'+window.location.host;
        }
    ,host: function(){
        return 'http://'+window.location.host.replace(/:[0-9]+$/, '');
        }
    ,apiBaseUrl: function(){
            var h=this.host()||'';
            if (h.match(/(localh|127.0.0|0.0.0)/)) h = 'http://dev.arborplus.com';
			var api=h+'/api/v2.0';
			return api;
            //else return 'http://dev.arborplus.com/api/v2.0';
        }

	// todo - later this all should be dynamically called from api
	,getEntityID: function(){
            var h=this.host()||'';
			if(h.match(/app.aplus/)) return 2;
			if(h.match(/joseph/)) return 3;
			if(h.match(/woodie|woody/)) return 4;
			if(h.match(/hendricks/)) return 7;
			if(h.match(/shreiner/)) return 7;
			if(h.match(/acme/)) return 6;
			return 1;	// default to dev.aplustree
		}
	,getEntity: function(){
			var ent=[];
			ent[1]=ent[2]={name:'A Plus Tree Service', medname:'A Plus Tree', shortname:'aplus'};
			ent[3]={name:'Joseph Tree Service', medname:'Joseph Tree', shortname:'joseph'};
			var eid=this.getEntityID();
			return ent[eid];
		}
    };



