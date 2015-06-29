<?php
/**
 IMAGE GETTER FOR MISSING IMAGES
 ===============================
 If you've reached this page, it means the image requested is not found
 This could be because the app has an old image link, and that image has now beend processed
 and has been renamed or is somewhere else.


 IMAGE NAMES / STATUSES
 ----------------------
	- imgStatus == 1  :: filename: siteID/treeID.jpg
	- imgStatus == 2  :: siteID/treeID.imgID_size.jpg   (size = sm, sm2, med, lrg, orig )
	- imgStatus == 3  :: http://<amazon_url>/<bucket>/<tree_token>/<imgID>.<imgID>.<imgSize>.jpg  
   

 SCENARIOS
 ---------
   1. If app things imgStatus = 1, and imgStatus is actually 2 or 3
	2. If we're actually on the DEV server... but we still want to show the live images

 SOLUTIONS:
 ---------
   For Problem #1:
	  - Assume imgStatus=2, and lookup those files, and return them
	  - if files do not exist, assume imgStatus=3 and check amazon URL


	For Problem #2:


*/


// Parse siteID/treeID/imgID/sizeID out of incoming URL
	// types of incoming urls
	// /tree_images/<SITEID>/<treeID>.jpg   - if imgstatus = 2, ie not processed
	// /tree_images/<SITEID>/<treeID>_<size>.jpg   - if imgstatus = 2, ie. IS processed
	$req=$_SERVER['REQUEST_URI'];
	if(!preg_match('#([^/]+)/([^/]+)(\.jpg|\.jpeg)#', $req, $m)) die();
	list($x, $siteID, $treeID) = $m;


// check if treeID is searching for a sizeID
	if(preg_match('/^([0-9]+)_([a-zA-Z0-9]+)/', $treeID, $m)){
		list($x, $treeID, $sizeID) = $m;
	}
	if(!$sizeID) $sizeID='med';
	if(!$imgID) $imgID=1;


// try out a bunch of variations for local image file
	$files[]="$siteID/$treeID.{$imgID}_$sizeID.jpg";
	$files[]="$siteID/{$treeID}_$sizeID.jpg";
	$files[]="$siteID/{$treeID}.$imgID.jpg";



// now, if the files exist, then display one of them
	foreach($files as $file){
		if(file_exists($file)){
			header('Content-type: image/jpeg');
			readfile($file);
			die();
		}
	}






// ================================================================
// ================================================================
//     No file found on server... so look on amazon 
// ================================================================
// ================================================================

	//error_reporting( error_reporting() & ~E_NOTICE );
	require '../../php/src/apptop.php';
	use lib\Core;
	use lib\Config;
	$core=Core::getInstance();

	$token = $core->db->qfetchone("SELECT token FROM tree WHERE treeID=?", 'int', $treeID);
	if(!$token){

		// sample amazon url: 'https://s3-us-west-1.amazonaws.com/live-arborplus-img/35c6/314020.1.lrg.jpg';
		$url=Config::read('aws.imgprefix') . '/' . Config::read('aws.img.bucket') . "/$token/$treeID.$imgID.$sizeID.jpg";

		$img=file_get_contents($url);
		if($img){
			header('Content-type: image/jpeg');
			echo $img;
			die();
		}
	}



// ===============================================================
//    If were on dev server, then look on live server now

if(!preg_match('/dev.arbor/', __FILE__)){
	header('Content-type: image/jpeg');
	echo file_get_contents("http://app.arborplus.com$req");
	die();
}

/* old way ...
$liveDir="/var/www/prod/arborplus.com/public";
$req=$_SERVER['REQUEST_URI'];
if(preg_match('/^(.*)(jpg|jpeg)/', $req, $m)){
	$filename=$m[0];
	header('Content-type: image/jpeg');
	readfile("$liveDir/$filename");
	die();
}
*/

