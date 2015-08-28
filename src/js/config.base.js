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
	var isDev = (h.match(/(localh|127.0.0|0.0.0|:9000|dev\.)/));
	if(isDev){
		window.cfg.getEntityID = function(){
            var h=this.host()||'';
			if(h.match(/easytree/)) return 1;
			if(h.match(/app.aplus/)) return 2;
			if(h.match(/joseph/)) return 3;
			if(h.match(/woodie|woody/)) return 4;
			if(h.match(/hendricks/)) return 5;
			if(h.match(/shreiner/)) return 7;
			if(h.match(/acme/)) return 6;
			if(h.match(/medallion/)) return 8;
			if(h.match(/padilla/)) return 9;
			if(h.match(/advancedtr/)) return 10;
			if(h.match(/allamerican/)) return 11;
			if(h.match(/fourseasons/)) return 12;
			if(h.match(/landcare-fairfield/)) return 13;
			if(h.match(/landcare-windsor/)) return 14;
			if(h.match(/landcare-rancho/)) return 15;
			if(h.match(/hoppe/)) return 16;
			if(h.match(/trimac/)) return 17;
			return 1;	// default to dev.aplustree
		}

		window.cfg.getEntity = function(){
			var ent=[];
			ent[1]={name:'Easy Tree Service', medname:'Easy Tree', shortname:'easytree', isTcia:1,
						affiliations:'wcisa.png,ctsp.png,papa.jpg,treeworker.jpg,bcma.jpg'};
			ent[2]={name:'A Plus Tree Service', medname:'A Plus Tree', shortname:'aplus', isTcia:1,
						affiliations:'wcisa.png,ctsp.png,papa.jpg,treeworker.jpg,bcma.jpg'};
			ent[3]={name:'Joseph Tree Service', medname:'Joseph Tree', shortname:'joseph', isTcia:1,
						affiliations:"tcia.png,ctsp.png,isa_arb.jpg,isa_memb.jpg",
						estimate_footer:"<a href='http://www.josephtreeservice.com/includes/pdf/bwcCoverage.pdf' target='_new'>Workers Comp Documentation</a><BR><a href='http://www.josephtreeservice.com/includes/pdf/josephTreeCert.pdf' target='_new'>Insurance Certificate</a>"
					};
			ent[5]={name:'Hendrickson Tree Care', medname:'Hendrickson Tree', shortname:'hendrickson',
				affiliations:'isa_arb.jpg,ctsp.png,kaa.jpg'};
			ent[7]={name:'Shreiner Tree Care', medname:'Shreiner Tree', shortname:'shreiner', isTcia:1,
						affiliations:"tcia.png,ctsp.png,isa_arb.jpg,bcma.jpg"};
			ent[8]={name:"Medallion Landscape Management, Inc.",medname:"Medallion Landscape Mgmt", isTcia:1,
						shortname:"medallion",affiliations:"wcisa.png,ctsp.png,papa.jpg,treeworker.jpg,bcma.jpg"};
			ent[9]={name:"Padilla Group Inc.",medname:"Padilla Group",shortname:"padilla", isTcia:1,
						affiliations:"wcisa.png,ctsp.png,papa.jpg,treeworker.jpg,bcma.jpg"};
			ent[10]={name:'Advanced Tree Care', medname:'Advanced Tree', shortname:'advancedtree',
				affiliations:'isa_arb.jpg'};
			ent[11]={name:'All American Arborist', medname:'All American Arborist', shortname:'allamericanarborist',
				affiliations:''};
			ent[12]={name:'Four Seasons Tree Care', medname:'Four Seasons', shortname:'fourseasons',
				affiliations:'isa_memb.jpg,wcisa.png,ctsp.png'};
			var eid=this.getEntityID();
			var ent = ent[eid];
			if(!ent){
				console.log("ERROR! No entity found for EID "+eid);
				return {name:'Tree Company', medname:'Tree Company', shortname:''}
			}
			return ent;
		}

		//$.getScript('http://dev.arborplus.com/go/config.js')
	}
})();


