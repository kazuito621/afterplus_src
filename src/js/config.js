
// config file for angular

window.cfg={
    hostAndPort:function(){
        return 'http://'+window.location.host;
        }
	// @return hostname ie. "http://app.aplustree.com"
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
			if(h.match(/hendricks/)) return 5;
			if(h.match(/shreiner/)) return 7;
			if(h.match(/acme/)) return 6;
			if(h.match(/medallion/)) return 8;
			if(h.match(/padilla/)) return 9;
			return 1;	// default to dev.aplustree
		}
	,getEntity: function(){
			var ent=[];
			ent[1]=ent[2]={name:'A Plus Tree Service', medname:'A Plus Tree', shortname:'aplus',
						afiliations:'wcisa.png,ctsp.png,papa.jpg,treeworker.jpg,bcma.jpg'};
			ent[3]={name:'Joseph Tree Service', medname:'Joseph Tree', shortname:'joseph',
						afiliations:"tcia.png,ctsp.png,isa_arb.jpg,isa_memb.jpg"};
			ent[4]={name:'Big Woodys Tree Service', medname:'Big Woodys Tree', shortname:'bigwoodys',afiliations:''};
			ent[5]={name:'Hendrickson Tree Care', medname:'Hendrickson Tree', shortname:'hendrickson',afiliations:'wcisa.png'};
			ent[7]={name:'Shreiner Tree Care', medname:'Shreiner Tree', shortname:'shreiner',
						afiliations:"tcia.png,ctsp.png,isa_arb.jpg,bcma.jpg"};
			ent[8]={name:"Medallion Landscape Management, Inc.",medname:"Medallion Landscape Mgmt",
						shortname:"medallion",afiliations:"wcisa.png,ctsp.png,papa.jpg,treeworker.jpg,bcma.jpg"};
			ent[9]={name:"Padilla Group Inc.",medname:"Padilla Group",shortname:"padilla",
						afiliations:"wcisa.png,ctsp.png,papa.jpg,treeworker.jpg,bcma.jpg"};

			var eid=this.getEntityID();
			var ent = ent[eid];
			if(!ent){
				console.debug("ERROR! No entity found for EID "+eid);
				return {name:'Tree Company', medname:'Tree Company', shortname:''}
			}
			return ent;
		}
    };



