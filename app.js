
var http = require('http');
var fs = require('fs');
var md5=require('./md5.js');
var get_imgs=0;
function get_links_from_url(target_url){

	var links=new Array();
	http.get(target_url, function (res) {
			type='utf8';
	        res.setEncoding(type);
	        var html='';
	        res.on('data',function(data){
	        	html+=data;
	        }).on('end',function(){
	        	//去除javascript
	        	console.log("已经获得原始HTML");
	        	html=html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/ig,"");
	        	//得到所有链接
	        	links=html.match(/<a\b[^>]*>[\s\S]*?<\/a>/ig);
	        	console.log("已经获得原始连接");
	        	//console.log(links);

	        	var ok_links=new Array();
	        	ok_links.push(target_url);
	        	for(var i=0;i<links.length;i++){
	        		var a=links[i];
	        		var href=a.replace(/[\s\S]*?href=[\'\"\s]*?(http:\/\/[a-z\d\._\-\/\%]*)[\'\"\s]*?/igm,'$1,');
	        		href=href.split(',')[0];
	        		//console.log('------------------------------------------');
	        		//console.log(href);
	        		if(href.indexOf('http://')!=-1){
	        			ok_links.push(href);
	        		}
	        	}
				console.log("获得有效连接数量："+ok_links.length);
				var getres=true;
				var links=ok_links.length;
				var do_link=0;
				function get_html(){
					if(getres && links>0){
						
						console.log('正在处理第'+do_link+'条连接');

						var link=ok_links[do_link];
						//
						http.get(link, function (res) {
							var type='utf8';
						    res.setEncoding(type);
						    var html='';
						    res.on('data',function(data){
						        html+=data;
						    });
						    res.on('end',function(){
						    	var images=html.match(/<img([^>]+?)>/ig);
						    	if(images===null){
							        do_link++;
									links--;
									get_html();
						    	}else{
						    		console.log(images.length);
						    		//
						    		images=images.toString().replace(/[\s\S]*?src=[\'\"\s]*?(http:\/\/[a-z\d\._\-\/\%]*)[\'\"\s]*?/igm,'$1,');
									images=images.split(',');
							        //console.log(images);
							        var ok_images=new Array();

									for(var i=0;i<images.length;i++){
										if(images[i].indexOf('http://')!=-1){
											ok_images.push(images[i]);				
										}
									}
									//
									console.log('获得图片数量:'+ok_images.length);
									console.dir(ok_images);

									//
									var images_length=ok_images.length;
									var this_img_index=0;
									function getimg(){
										if(this_img_index<images_length){
											console.log('正在处理获取图片:'+ok_images[this_img_index]);
											//
											require('http').get(ok_images[this_img_index], function (res) {
												var type='binary';
												res.setEncoding(type);
												var img_data='';
												res.on('data',function(data){
												  	img_data+=data;
												});
												res.on('end',function(){
												    var filename=md5(img_data);
												    try{
														fs.writeFile('images'+'/'+filename+'.png',img_data,type, function (err) {
														    console.log('get img ok');
														    this_img_index++;
															getimg();
														});
													}catch(e){
													    console.log('write img err');
													    this_img_index++;
														getimg();
													}

												});
										        res.on('error', function(e) { 
													console.log('Got that pesky error trapped') ;
													this_img_index++;
													getimg();
												});
											});
											//

										}else{
											do_link++;
											links--;
											get_html();
										}
									}
									getimg();
						    		//
						    	}
						    });
						    res.on('error', function(e) { 
					　　		console.log('Got that pesky error trapped:'+link) ;
								do_link++;
								links--;
								get_html();
							});
				        });
						//
						
					}
				}
				get_html();
	        });
	});
}

get_links_from_url('http://www.codetyphon.com');
