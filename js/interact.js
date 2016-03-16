var canvas;
var context;
var tempcanvas;
var tempcontext;
var blackcanvas;
var blackcontext;
var raincanvas;
var raincontext;
var backcanvas;
var backcontext;

var width;
var height;

var wrapper;

var playing = false;
var down = false;
var touch = {x: 0, y: 0};
var lasttouch = {x: 0, y: 0};

var lightning = false;

var drops = [];

var img
var bg

var frame;
var orientation = Math.PI;

var drawLoop;


function Drop(x,y,r){
    this.x = x;
    this.y = y;
    this.targetr = r;
    this.r = this.targetr * 0.2;
    this.vy = random(r+2,r+7);
    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d');

    var ar = this.r * 60;

    this.canvas.width = ar;
    this.canvas.height = ar;

    this.context.globalAlpha = 0.5;
    this.context.beginPath();

    this.context.arc(ar/2,ar/2,ar/2,0,Math.PI*2,false);
    this.context.clip();
    this.context.scale(-1,-1);
    this.context.translate(-ar,-ar)
    this.context.drawImage(img, -5,-5,ar+10,ar+10);
    this.context.closePath();


    this.update = function(){

    }

    this.draw = function(ctx){

        this.r += (this.targetr - this.r) * 0.1

        if(random(0,1) > 0.92){
            this.vy += random(0,2);
        }
        this.vy *= 0.9

        var newx = this.x - sin(orientation) * this.vy;
        var newy = this.y - cos(orientation) * this.vy;


        var r = this.vy / this.r
        r *= 30;
        if( r < 5)
          r = 5
        if(r > 10)
          r = 10;



        var dr = random(r*0.7,r);
        // dr = r;

        this.r += (dr - this.r) * 0.05

        newx += random(-0.5,0.5)
        ctx.drawImage(this.canvas,newx-this.r,newy-this.r, this.r*2, this.r*2)

        blackcontext.strokeStyle = 'black';
        blackcontext.lineWidth = this.r * 2;
        line(blackcontext,newx,newy,this.x,this.y);

        // solidCircle(blackcontext,newx, newy, this.r);

        this.x = newx;
        this.y = newy;
    }
}

function touchDown(e){
    down = true;
    lasttouch.x = touch.x = e.pageX - wrapper.offsetLeft;
    lasttouch.y = touch.y = e.pageY - wrapper.offsetTop;
}

function touchUp () {
    down = false;
}

function touchMove(e){
    if(down == true){
        e.preventDefault();

        lasttouch.x = touch.x;
        lasttouch.y = touch.y;
        touch.x = e.pageX - wrapper.offsetLeft;
        touch.y = e.pageY - wrapper.offsetTop;
        blackcontext.strokeStyle = 'black';
        blackcontext.lineWidth = 60;
        line(blackcontext,touch.x,touch.y,lasttouch.x,lasttouch.y)

        removers = [];
        for (var i = 0; i < drops.length; i++) {
            var d = drops[i];
            if(distance(d.x,d.y,touch.x,touch.y) < 50){
                if(random(0,1) > 0.7) removers.push(d);
            }
        }
        for (var i = 0; i < removers.length; i++) {
            drops.splice( drops.indexOf(removers[i]), 1);
        }
        if(random(0,1) > 0.6) drops.push(new Drop(e.pageX, e.pageY+20,random(1,14)));
    }
}

window.onload = function() {

    canvas = document.getElementById('canvas');
    context = canvas.getContext('2d');

    tempcanvas = document.createElement('canvas');
    tempcontext = tempcanvas.getContext('2d');

    blackcanvas = document.createElement('canvas');
    blackcontext = blackcanvas.getContext('2d');

    raincanvas = document.createElement('canvas');
    raincontext = raincanvas.getContext('2d');

    backcanvas = document.getElementById('back-canvas');
    backcontext = backcanvas.getContext('2d');

    // var dwellImg = new Image();
    // dwellImg.src = "images/dwell2.png"


    width = window.innerWidth
    height = window.innerHeight;


    wrapper = document.getElementById("wrapper");


    document.getElementById("wrapper").style.width = width + "px";
    document.getElementById("wrapper").style.height = height + "px";
    document.getElementById("wrapper").style.marginLeft = (-width/2) + "px";
    document.getElementById("wrapper").style.marginTop  = (-height/2) + "px";

    backcanvas.height = raincanvas.height = blackcanvas.height = tempcanvas.height = canvas.height = height;
    backcanvas.width = raincanvas.width = blackcanvas.width = tempcanvas.width = canvas.width = width;



    blackcontext.lineCap = 'round'



    img = new Image();
    img.src = 'images/drip.jpg';

    bg = new Image();
    bg.src = 'images/foreground.png';

    frame = document.getElementById('frame');
    document.getElementById("wrapper").addEventListener("touchstart", touchDown, false);
    document.getElementById("wrapper").addEventListener("touchend", touchUp, false);
    document.getElementById("wrapper").addEventListener("touchmove", touchMove, true);
    document.getElementById("wrapper").addEventListener("mousemove", touchMove, true);
    document.getElementById("wrapper").addEventListener("mousedown", touchDown, false);
    document.getElementById("wrapper").addEventListener("mouseup", touchUp, false)



    bg.onload = function(){
        blackcontext.drawImage(bg,0,0,width,height)
        blendFunction(blackcontext, "destination-out")
        setTimeout(function(){
            background.style.display = "block";
        },500);
        // blackcontext.drawImage(dwellImg,170,200)
        drawLoop = setInterval(draw, 1000/30);
    }




    var rot = 0;
    window.ondevicemotion = function(e){
        orientation = Math.PI + e.accelerationIncludingGravity.x * 0.1;

      // rot += (( (-orientation * 70) - 140 )- rot) * 0.5;

      // background.style.webkitTransform = "translate3d(0,0,0) rotateZ(" + rot + "deg)";
      // canvas.style.webkitTransform = "rotateZ(" + (-rot) + "deg)";

    };

    // drops.push(new Drop(175,280,random(1,6)));
    // drops.push(new Drop(190,250,random(1,6)));
    // drops.push(new Drop(250,250,random(1,6)));
    // drops.push(new Drop(350,320,random(1,6)));
    // drops.push(new Drop(450,325,random(1,6)));


    function draw() {

        if(random(0,1) > 0.98) lightning = true;

        if(lightning == true){
            if(random(0,1) > 0.95){
                lightning = false;
            }
        }

        tempcontext.clearRect(0,0,width,height)
        blendFunction(blackcontext, "source-over")
        blendFunction(blackcontext, "destination-out")

        raincontext.clearRect(0,0,width,height);
        raincontext.lineCap = 'round'
        raincontext.strokeStyle = 'rgba(255,255,255,0.05)'

        for (var i = 0; i < 300; i++) {
            raincontext.lineWidth = random(1,6)
            var x = random(0,width);
            var y = random(0,height);
            length = random(30,100);
            var x2 = x + sin(random(0,0.1)) * length;
            var y2 = y + cos(random(0,0.1)) * length;
            line(raincontext,x,y,x2,y2)
        };



        // tempcontext.fillRect(0,0,width,height)
        removers = [];
        adders = [];
        for (var i = 0; i < drops.length; i++) {
            var d = drops[i];
            d.draw(tempcontext);

            for(var n = i; n < drops.length; n++){
                var d2 = drops[n];
                if(d != d2){
                    if(distance(d.x,d.y,d2.x,d2.y) < 10){
                        removers.push(d)
                        removers.push(d2)
                        adders.push( new Drop( (d.x + d2.x) / 2 , (d2.y + d2.y) / 2 , d.r + d2.r + 5))
                    }
                }
            }

            if(d.y > height){
                removers.push(d);
            }
        };


        for (var i = 0; i < removers.length; i++) {
            drops.splice( drops.indexOf(removers[i]), 1);
        };

        if(random(0,1) > 0.94){
            // drops.push(new Drop(random(-10,width+10),random(-10,height+10),random(1,14)));
        }

        for (var i = 0; i < adders.length; i++) {
            drops.push(adders[i]);
        };

        backcontext.clearRect(0,0,width,height);
        context.clearRect(0,0,width,height)
        if(lightning == true){
            if(random(0,1) > 0.6){
                backcontext.fillStyle = 'rgba(255,255,255,0.15)'
                backcontext.fillRect(0,0,width,height)
            }
        }

        // backcontext.drawImage(foreground,0,0);
        context.drawImage(raincanvas,0,0)
        context.drawImage(blackcanvas,0,0);
        context.drawImage(tempcanvas,0,0)
    }
};

window.onresize = function(){

}
