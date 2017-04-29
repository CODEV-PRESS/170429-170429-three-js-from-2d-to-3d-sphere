/*
* @Author: Alex Tsoi ( https://github.com/alextsoi ) @ K2 Digital [https://k2.digital]
* @Date:   2017-02-18 22:51:00
* @Last Modified by:   AT
* @Last Modified time: 2017-04-29 12:52:13
*/

function loadImage(src, callback){
	var img = new Image();
	img.src = src;
	img.onload = function(){
		imageCanvas.getContext('2d').drawImage(img, 0, 0, squareSize, squareSize);
		callback();
	};
}