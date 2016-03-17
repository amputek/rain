
Math.distance = function(a,b) {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}
Math.randomFloat = function(a,b){
  return (Math.random() * (b-a)) + a;
}
Math.coin = function(a){
    return Math.random() < a;
}


function Canvas( id ){
    this.canvas = id ? document.getElementById(id) : document.createElement('canvas');
    this.context = this.canvas.getContext('2d');
    this.canvas.height = height;
    this.canvas.width = width;
    this.clear = function(){
        this.context.clearRect( 0,0,width,height)
    }
    this.blendFunction = function( operator ){
        this.context.globalCompositeOperation = operator;
    }
    this.getCanvas = function(){
        return this.canvas;
    }
    this.drawImage = function( img, x, y, w, h ){
        if( x == undefined ) x = 0;
        if( y == undefined ) y = 0;
        if( w == undefined ){
            this.context.drawImage( img, x, y );
        } else {
            this.context.drawImage( img, x, y, w, h );
        }

    }

    this.line = function(x1,y1,x2,y2){
      this.context.beginPath();
      this.context.moveTo(x1,y1);
      this.context.lineTo(x2,y2);
      this.context.stroke();
    }

    this.solidCircle = function(x, y, r) {
        if( r > 0){
            this.context.beginPath();
            this.context.arc(x, y, r, 0, 2 * Math.PI, false);
            this.context.fill();
        }
    }
    this.solidRect = function(x,y,w,h){
        this.context.beginPath();
        this.context.fillRect(x,y,w,h);
    }
    this.setLineWidth = function(f){
        this.context.lineWidth = f;
    }
    this.setAlpha = function(a){
        this.context.globalAlpha = a;
    }


}

var c_final
var c_drop;
var c_wipe;
var c_rain;
var c_lightning;

var width;
var height;

var lightning = false;
var drops = [];

var dripimg;
var bg;

var orientation = Math.PI;

var drawLoop;


function Touch(){
    this.active = false;
    this.current = {x: 0, y: 0};
    this.last = {x: 0, y: 0};

    this.Down = function(e){
        this.active = true;
        this.last.x = this.current.x = e.pageX;
        this.last.y = this.current.y = e.pageY;
    }

    this.Up = function() {
        this.active = false;
    }


    // TODO: add lines to a collection to be added in update cycle
    this.Move = function(e){
        if(this.active == true){
            e.preventDefault();

            this.last.x = this.current.x;
            this.last.y = this.current.y;
            this.current.x = e.pageX;
            this.current.y = e.pageY;
            c_wipe.context.lineWidth = Math.randomFloat(40,55);
            c_wipe.line(this.current.x,this.current.y,this.last.x,this.last.y);

            removers = [];
            for (var i = 0; i < drops.length; i++) {
                var d = drops[i];
                if(Math.distance(d,this.current) < 40){
                    if(Math.coin(0.3)) removers.push(d);
                }
            }
            for (var i = 0; i < removers.length; i++) {
                drops.splice( drops.indexOf(removers[i]), 1);
            }
            var c = Math.distance(this.current,this.last) * 0.015;
            if(c > 0.4) c = 0.4;
            if(Math.coin(c)) drops.push(new Drop(e.pageX, e.pageY+20,Math.randomFloat(1,14)));
        }
    }

    var _this = this;

    document.getElementById("wrapper").addEventListener("touchstart", function(e){ _this.Down(e); }, false);
    document.getElementById("wrapper").addEventListener("touchend"  , function(e){ _this.Up(e); }, false);
    document.getElementById("wrapper").addEventListener("touchmove" , function(e){ _this.Move(e); }, true);
    document.getElementById("wrapper").addEventListener("mousemove" , function(e){ _this.Move(e); }, true);
    document.getElementById("wrapper").addEventListener("mousedown" , function(e){ _this.Down(e); }, false);
    document.getElementById("wrapper").addEventListener("mouseup"   , function(e){ _this.Up(e); }, false)




}


function Drop(x,y,r){
    this.x = x;
    this.y = y;
    this.targetr = r;
    this.r = this.targetr * 0.2;
    this.vy = Math.randomFloat(r,r+7);
    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d');

    var ar = this.r * 60;

    this.canvas.width = ar;
    this.canvas.height = ar;

    this.context.globalAlpha = 0.7;
    this.context.beginPath();

    this.context.arc(ar/2,ar/2,ar/2,0,Math.PI*2,false);
    this.context.clip();
    this.context.scale(-1,-1);
    this.context.translate(-ar,-ar)
    this.context.drawImage(dripimg, -5,-5,ar+10,ar+10);
    this.context.closePath();


    this.update = function(){

    }

    this.draw = function(){

        // ease towards target radius
        this.r += (this.targetr - this.r) * 0.1

        // occasionally randomly speed up
        if( Math.coin(0.08) ){
            this.vy += Math.randomFloat(0,2);
        }

        // friction
        this.vy *= 0.9


        var newx = this.x - Math.sin(orientation) * this.vy;
        var newy = this.y - Math.cos(orientation) * this.vy;


        var r = this.vy / this.r
        r *= 30;
        if( r < 5)
          r = 5
        if(r > 10)
          r = 10;



        var newr = Math.randomFloat(r*0.7,r);
        // dr = r;

        // ease towards new radius
        this.r += (newr - this.r) * 0.05

        newx += Math.randomFloat(-0.5,0.5)
        c_drop.context.drawImage(this.canvas,newx-this.r,newy-this.r, this.r*2, this.r*2)

        c_wipe.context.lineWidth = this.r * 2;
        c_wipe.line(newx,newy,this.x,this.y);

        this.x = newx;
        this.y = newy;
    }
}

function drawRain(){
    c_rain.context.clearRect(0,0,width,height);

    for (var i = 0; i < 300; i++) {
        c_rain.context.lineWidth = Math.randomFloat(1,6);
        var x  = Math.randomFloat(0,width);
        var y  = Math.randomFloat(0,height);
        length = Math.randomFloat(30,100);
        var x2 = x + Math.sin( Math.randomFloat(0,0.1) ) * length;
        var y2 = y + Math.cos( Math.randomFloat(0,0.1) ) * length;
        c_rain.line(x,y,x2,y2);
    };
}

function drawLightning(){
    if( Math.coin(0.002) ) lightning = true;
;
    if(lightning == true){
        if( Math.coin(0.03) ){
            lightning = false;
            c_lightning.context.clearRect(0,0,width,height);
        }
    }


    if(lightning == true){
        if( Math.coin(0.5) ){
            c_lightning.solidRect(0,0,width,height)
        } else {
            c_lightning.context.clearRect(0,0,width,height);
        }
    }

}

function drawDrops(){
    c_drop.clear();

    var removers = [];
    var adders = [];

    for (var i = 0; i < drops.length; i++) {
        var d = drops[i];

        d.draw();

        // combine nearby drops into an even bigger drop
        for(var n = i; n < drops.length; n++){
            var d2 = drops[n];
            if(d != d2){
                if(Math.distance(d,d2) < 10){
                    removers.push(d)
                    removers.push(d2)
                    adders.push( new Drop( (d.x + d2.x) / 2 , (d2.y + d2.y) / 2 , d.r + d2.r + 5))
                }
            }
        }

        // delete drops that are off screen
        if(d.y > height){
            removers.push(d);
        }
    };

    for (var i = 0; i < removers.length; i++) {
        drops.splice( drops.indexOf(removers[i]), 1);
    };

    //add new drops
    for (var i = 0; i < adders.length; i++) {
        drops.push(adders[i]);
    };

}

function fade(){
    c_wipe.blendFunction( "source-over")
    c_wipe.setAlpha( 0.1 );
    c_wipe.drawImage(bg);
    c_wipe.setAlpha( 1.0 );
    c_wipe.blendFunction( "destination-out")
}

function draw() {
    drawLoop = webkitRequestAnimationFrame( draw );

    drawRain();
    drawLightning();
    drawDrops();

    c_final.clear();
    c_final.drawImage(c_lightning.canvas)
    c_final.drawImage(c_rain.canvas)
    c_final.drawImage(c_wipe.canvas)
    c_final.drawImage(c_drop.canvas)
}

window.onload = function() {

    width = window.innerWidth;
    height = window.innerHeight;

    c_final = new Canvas( 'canvas' );
    c_drop = new Canvas();
    c_wipe = new Canvas();
    c_rain = new Canvas();
    c_lightning = new Canvas();

    c_rain.context.lineCap = 'round'
    c_rain.context.strokeStyle = 'rgba(255,255,255,0.05)'

    c_wipe.context.strokeStyle = 'black';
    c_wipe.context.lineCap = 'round'

    c_lightning.context.fillStyle = 'rgba(255,255,255,0.05)'

    dripimg = new Image();
    dripimg.src = 'images/drip.jpg';

    bg = new Image();
    bg.src = 'images/foreground.png';
    bg.onload = function(){
        c_wipe.drawImage(bg,0,0,width,height)
        c_wipe.blendFunction("destination-out");
        setInterval(fade, 400);
        draw();
    }

    Touch();

    // window.ondevicemotion = deviceMotion;

};

function deviceMotion(e){
    orientation = Math.PI + e.accelerationIncludingGravity.x * 0.1;
};

window.onresize = function(){

}
