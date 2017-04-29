/*
* @Author: Alex Tsoi ( https://github.com/alextsoi ) @ K2 Digital [https://k2.digital]
* @Date:   2017-02-18 22:51:00
* @Last Modified by:   Tsoi Yun Fung
* @Last Modified time: 2017-04-29 17:59:46
*/
/**
 * Global Variables
 */
// Windows
var windowWidth = window.innerWidth;
var windowHeight = window.innerHeight;

// Scene
var scene;

// Renderer
var renderer;

// Camera
var camera;
var cameraConfig = {
    VIEW_ANGLE: 45,
    ASPECT: windowWidth / windowHeight,
    NEAR: 0.1,
    FAR: 20000,

    initX: 0,
    initY: 0,
    initZ: 1000
};

// Light
var light;

// Group
var group;
var groupConfig = {
    initX: 0,
    initY: 0,
    initZ: 0
};

// Loader
var loader;

// Clock
var clock;

// Image
var image;
var imageCanvas;
var imageConfig = {
    src: "images/demo.jpg"
};

// Grids
var gridSize = 256;
var gridShape = null;
var gridMeshArr = [];

// Actions
var ACTIONS_FADE_IN_GRIDS = -1;

// Mesh
var mainImageMesh = null;

// Explosion radius
var explosion_radius = 320;
var exploded = false;

// https://stemkoski.github.io/Three.js/Sprites.html
var targetRotation = 0;
var targetRotationOnMouseDown = 0;
var mouseX = 0;
var mouseXOnMouseDown = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;
var group;
var texture;
var clock = new THREE.Clock();

// standard global variables
var controls;

// TODOs: add comments for below variables
var originalPink = [240, 143, 144];
var ratio = 0.1;
var materialArr = [];
var meshArr = [];
var meshPosition = [];
var squareMaterial = null;
var opacityLimit = 0.6;
var done = -1;
var groupScale = 1;
var positionDone = 0;
var counter = 0;
var timeOfAnimation = 0.6;

init();
animate();

// FUNCTIONS 		
function init() {
    ////////////
    // System //
    ////////////

    // Create new scene
    scene = new THREE.Scene();

    // Create camera
    camera = new THREE.PerspectiveCamera(cameraConfig.VIEW_ANGLE, cameraConfig.ASPECT, cameraConfig.NEAR, cameraConfig.FAR);

    // Add camera to the scene
    scene.add(camera);

    // Set the camera position
    camera.position.set(cameraConfig.initX, cameraConfig.initY, cameraConfig.initZ);
    camera.lookAt(scene.position);

    // RENDERER
    // Detect the browser support
    if (Detector.webgl) {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } else {
        // TODO: load the canvas renderer script
        renderer = new THREE.CanvasRenderer();
    }

    // Create the light and add the light
    light = new THREE.AmbientLight(0xffffff); // soft white light
    scene.add(light);

    // Set the renderer size
    renderer.setSize(windowWidth, windowHeight);

    // Set the pixel ratio for retina monitor
    renderer.setPixelRatio(window.devicePixelRatio);

    // Append the 
    document.body.appendChild(renderer.domElement);

    // Create group
    group = new THREE.Group();
    group.position.set(groupConfig.initX, groupConfig.initY, groupConfig.initZ);

    // Add the group to the scene
    scene.add(group);

    ////////////
    // CUSTOM //
    ////////////

    // Create the texture loader
    loader = new THREE.TextureLoader();
    
    // Load the texture
    texture = loader.load(imageConfig.src);
    
    // TODO, make sure no repeat for texture 
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1 / squareSize, 1 / squareSize);

    // Create canvas for extracting colors
    imageCanvas = document.createElement('canvas');
    imageCanvas.width = squareSize;
    imageCanvas.height = squareSize;

    // Loaded the image
    loadImage(imageConfig.src, function() {
        // Draw the image
        addSquareShape(squareShape, texture, null, -squareSize / 2, -squareSize / 2, 0, 0, 0, 0, 1);

        // Create clock
        clock = new THREE.Clock();

        // Determine the grid size
        var numberOfRow = Math.sqrt(gridSize);
        var size = squareSize / numberOfRow;
        window.smallSquare = makeSmallGridShape(size);

        // Loop the grids
        for (var i = 0; i < gridSize; i++) {
            var row = Math.floor(i / numberOfRow);
            var col = i % numberOfRow;
            var x = col * size - squareSize / 2 + size / 2;
            var y = -row * size - size + squareSize / 2 + size / 2;
            // Create grid
            addSmallSquare(i, gridSize, window.smallSquare, null, getPixelAtCanvas((col + 0.5) * size, (row + 0.5) * size), x, y, 0, 0, 0, 0, 1);
        }
        // Fade effect applied
        fadeEffect();
        // Explode to become sphere
        setTimeout(explosion, 1800);
    });

    window.addEventListener('resize', onWindowResize, false);
}

function animate() {
    requestAnimationFrame(animate);
    render();
}

function adjustOpacity() {
    if (materialArr.length > 0 && 0.0 < 0.1) {
        // squareMaterial.opacity -= 0.01/4;
        var ri = Math.floor(Math.random() * materialArr.length);
        if (materialArr[ri].opacity > opacityLimit) {} else if (materialArr[ri].opacity + 0.04 > opacityLimit) materialArr[ri].opacity = opacityLimit;
        else materialArr[ri].opacity += 0.04;
    }
}

function render() {
    if (exploded) {
        group.rotation.y += 0.001;
    }
    renderer.render(scene, camera);
}

function adjustPosition() {
    counter += clock.getDelta();
    if (counter > timeOfAnimation) return;
    for (var i in meshArr) {
        var meshObj = meshArr[i];
        var progress = counter / timeOfAnimation;
        meshObj.mesh.position.set(meshObj.oldX + progress * meshObj.diffX, meshObj.oldY + progress * meshObj.diffY, meshObj.oldZ + progress * meshObj.diffZ);
        // meshObj.mesh.rotation.set(0,0,progress*meshObj.diffRotate);
        meshObj.mesh.scale.set(meshObj.oldScale - progress * meshObj.diffScale, meshObj.oldScale - progress * meshObj.diffScale, meshObj.oldScale - progress * meshObj.diffScale);
    }
}

function adjustMeshPosition() {
    meshArrTemp = meshArr;
    meshArrFinal = {};
    var width = parseInt(window.innerWidth) * 0.8;
    var total = meshArrTemp.length;
    var perWidth = width / (total / 2);
    var height = window.innerHeight;
    var index = 1;
    var halfX = width / 2;

    while (meshArrTemp.length != 0) {
        var ri = Math.floor(Math.random() * meshArrTemp.length);
        var meshObj = meshArrTemp[ri];
        var rs = meshArrTemp.splice(ri, 1);
        var x;
        if (index > total / 2) {
            x = perWidth * (total - index);
        } else {
            x = perWidth * index;
        }
        x -= halfX;
        var z = 0;
        if (index <= total / 4) z = index * 50;
        else if (index > total / 4 && index <= total / 2) z = (total / 2 - index) * 50;
        else if (index > total * 3 / 4) z = (total - index) * -50;
        else z = (index - total / 2) * -50;
        if (meshObj.rotation == 0) diffRotate = Math.PI;
        else diffRotate = 0;
        var obj = {
            x: x,
            y: height + Math.floor(Math.random() * 80 - 40),
            z: z,
            oldX: meshObj.oldX,
            oldY: meshObj.oldY,
            oldZ: meshObj.oldZ,
            diffX: x - meshObj.oldX,
            diffY: y - meshObj.oldY,
            diffZ: z - meshObj.oldZ,
            mesh: meshObj.mesh,
            oldScale: meshObj.oldScale,
            diffScale: 0.7,
            diffRotate: diffRotate
        };
        meshArrFinal[meshObj.pos] = obj;
        index++;
    }
    meshArr = meshArrFinal;
}



function onWindowResize() {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}



// Reviewed
function getPixelAtCanvas(x, y) {
    // get the pixel data and callback
    var pixelData = imageCanvas.getContext('2d').getImageData(x, y, 1, 1).data;
    // return 0x000000;
    if (pixelData) {
        var red = parseInt(pixelData[0], 10);
        red = red + originalPink[0] * 0.1;
        if (red > 255) red = 255;

        var green = parseInt(pixelData[1], 10);

        var blue = parseInt(pixelData[2], 10);

        var hexString = ("0" + red.toString(16)).slice(-2) + ("0" + green.toString(16)).slice(-2) + ("0" + blue.toString(16)).slice(-2);
        return parseInt(hexString, 16)
    } else {
        return 0xF08F90;
    }
}

function fadeEffect() {
    var longestPeriod = 0;
    var longestDelay = 0;
    for (var i = 0; i < gridMeshArr.length; i++) {
        var mObj = gridMeshArr[i];
        if (mObj.period + mObj.delay > longestPeriod) longestPeriod = mObj.period + mObj.delay;
        if (mObj.delay > longestDelay) longestDelay = mObj.delay;
        TweenLite.to(mObj.mesh.material, mObj.period, { opacity: 0.6, delay: mObj.delay });
    }
    TweenLite.to(mainImageMesh.material, longestPeriod, { opacity: 0, delay: longestDelay });
}

function explosion() {
    group.remove(mainImageMesh);

    var r = explosion_radius;
    var numberOfRow = Math.sqrt(gridSize);
    var middleRow = numberOfRow;
    // 360 degree
    var deg_360 = Math.PI * 2;
    // degree that Each grid owns
    var deg_each = deg_360 / numberOfRow;

    var verticalHeight = explosion_radius * 2;
    var verticalHeight_each = verticalHeight / (numberOfRow - 1);

    // Row
    for (var v = 0; v < numberOfRow; v++) {
        // Col
        for (var h = 0; h < numberOfRow; h++) {
            // Get the mesh
            var mObj = gridMeshArr[v * numberOfRow + h];
            // When col is even, defined as front face
            var isFront = (h % 2 == 0) ? true : false;
            // Get the position
            var currentPosition = isFront ? (h / 2) : ((h - 1) / 2);
            // Position variables
            var newX, newY, newZ, newRx, newRy, newRz;
            // get the face new y axis location
            newY = explosion_radius - v * verticalHeight_each;
            // Get the abs dist from y-axis origin
            var distYToCenter = Math.abs(newY);
            // cross-section radius
            var finalR = Math.sqrt(Math.pow(r, 2) - Math.pow(distYToCenter, 2));

            // Default rotation values
            newRx = 0;
            newRy = 0;
            newRz = 0;

            // Calculate the position of grid in sphere shape
            if (isFront) {
                newZ = roundNum(finalR * Math.sin(deg_each * currentPosition));
                newRx = Math.asin(-newY / r);
                if (finalR == 0) {
                    newX = roundNum(0);
                } else {
                    newX = roundNum(-finalR * Math.cos(deg_each * currentPosition));
                }
                if (finalR == 0) newRy = 0;
                else if (Math.abs(newX / finalR) > 1) {
                    newRy = Math.asin(newX / Math.abs(newX));
                } else {
                    newRy = Math.asin(newX / finalR);
                }
            } else {
                newZ = roundNum(-finalR * Math.sin(deg_each * (currentPosition + 1)));
                newRx = Math.asin(newY / r);
                if (finalR == 0) {
                    newX = roundNum(0);
                } else {
                    newX = roundNum(-finalR * Math.cos(deg_each * (currentPosition + 1)));
                }
                if (finalR == 0) newRy = 0;
                else if (Math.abs(-newX / finalR) > 1) {
                    newRy = Math.asin(-newX / Math.abs(newX));
                } else {
                    newRy = Math.asin((-newX / finalR));
                }
            }

            TweenLite.to(mObj.mesh.position, 0.5, { x: newX, y: newY, z: newZ, ease: Power2.easeOut });
            mObj.mesh.rotation.order = 'YXZ';
            TweenLite.to(mObj.mesh.rotation, 0.5, { x: newRx, y: newRy, z: newRz, ease: Power2.easeOut });
        }
    }
    setTimeout(function() {
        exploded = true;
    }, 1000);
}

function roundNum(num) {
    return Math.round(num * 100) / 100;
}
