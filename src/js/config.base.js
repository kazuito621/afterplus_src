/**
 * Base config object
 */

(function(){
	if(!window.cfg){
		window.cfg={
		 devServer:'http://aws.arborplus.com'
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
		  ,getSubDomain:function(){
       		var h=this.host()||'';
				var subdom = h.match(/\/\/([^.]+)\./);
				if(subdom) return subdom[1];
				return '';
		  }
		}
	}

	var h=window.location.host;
	// if dev server, load basic config, then attempt load from dev server
	var isDev = (h.match(/(localh|127.0.0|0.0.0|:9000|dev\.)/));
	if(isDev){
		var devEnt=[];
		devEnt[1]={name:'Easy Tree Service', medname:'Easy Tree', shortname:'easytree', isTcia:1,
						affiliations:'wcisa.png,ctsp.png,papa.jpg,treeworker.jpg,bcma.jpg'};
		devEnt[2]={name:'A Plus Tree Service', medname:'A Plus Tree', shortname:'aplus', isTcia:1,
						affiliations:'wcisa.png,ctsp.png,papa.jpg,treeworker.jpg,bcma.jpg'};
		devEnt[3]={name:'Joseph Tree Service', medname:'Joseph Tree', shortname:'joseph', isTcia:1,
						affiliations:"tcia.png,ctsp.png,isa_arb.jpg,isa_memb.jpg",
						estimate_footer:"<a href='http://www.josephtreeservice.com/includes/pdf/bwcCoverage.pdf' target='_new'>Workers Comp Documentation</a><BR><a href='http://www.josephtreeservice.com/includes/pdf/josephTreeCert.pdf' target='_new'>Insurance Certificate</a>"
					};
		devEnt[5]={name:'Hendrickson Tree Care', medname:'Hendrickson Tree', shortname:'hendrickson',
				affiliations:'isa_arb.jpg,ctsp.png,kaa.jpg'};
		devEnt[7]={name:'Shreiner Tree Care', medname:'Shreiner Tree', shortname:'shreiner', isTcia:1,
						affiliations:"tcia.png,ctsp.png,isa_arb.jpg,bcma.jpg"};
		devEnt[8]={name:"Medallion Landscape Management, Inc.",medname:"Medallion Landscape Mgmt", isTcia:1,
						shortname:"medallion",affiliations:"wcisa.png,ctsp.png,papa.jpg,treeworker.jpg,bcma.jpg"};
		devEnt[9]={name:"Padilla Group Inc.",medname:"Padilla Group",shortname:"padilla", isTcia:1,
						affiliations:"wcisa.png,ctsp.png,papa.jpg,treeworker.jpg,bcma.jpg"};
		devEnt[10]={name:'Advanced Tree Care', medname:'Advanced Tree', shortname:'advancedtree',
				affiliations:'isa_arb.jpg'};
		devEnt[11]={name:'All American Arborist', medname:'All American Arborist', shortname:'allamericanarborist',
				affiliations:''};
		devEnt[12]={name:'Four Seasons Tree Care', medname:'Four Seasons', shortname:'fourseasonstc',
				affiliations:'isa_memb.jpg,wcisa.png,ctsp.png', domain_regex:'^(fourseasons|fourseasonstc)$'};

		window.cfg.getEntity = function(){
			var eid=this.getEntityID();
			var ent = devEnt[eid];
			if(!ent){
				console.log("ERROR! No entity found for EID "+eid);
				return {name:'Tree Company', medname:'Tree Company', shortname:''}
			}
			return ent;
		}

		window.cfg.getEntityID = function(){
			var subdom = this.getSubDomain();
			for(var i=0;i<devEnt.length;i++){
				if(!devEnt[i]) continue;
				if(subdom && devEnt[i].shortname == subdom) return i;
				if( devEnt[i].domain_regex 
					&& subdom.match( new RegExp( devEnt[i].domain_regex ) )) return i;
			}
			return 1;	// default to dev.aplustree
		}

		// if dev js... load the config
		var hnp=cfg.hostAndPort();
		if( hnp.match(/9000/) ){
			$.getScript('http://dev.arborplus.com/go/config.js')
		}
	}
})();


