let cvs;
let ctx;
let mouseX;
let mouseY;
let clicking;
let arr = [];
let colliding = [];
let befVelc = [];
let infoScreen = false; 
let gravOn = false;
let infoClicked = false;
let gravClicked = false;
let obl = false;
let oblClicked = false;
let bGrav = false;
let gGravClicked = false;
let edu = false;
let eduClicked = false;
let numBalls = 88;

function currPos(event) {
    mouseX = event.offsetX;
    mouseY = event.offsetY;
}
function mouseDn(event) {
    clicking = true;
}
function mouseup(event) {
    clicking = false;
}
document.addEventListener('mousemove', currPos);
document.addEventListener('mousedown', mouseDn);
document.addEventListener('mouseup', mouseup);

window.onload = function() {
    cvs = document.getElementById("canv");
    cvs.width = window.innerWidth-2;
    cvs.height = window.innerHeight-2;
    ctx = cvs.getContext("2d");
    start();
}

function calcColl(ax, ay, bx, by, adx, ady, bdx, bdy, ma, mb) {
    if (adx==0) adx+=1e-7;
    if (ady==0) ady+=1e-7;
    if (bdx==0) bdx+=1e-7;
    if (bdy==0) bdy+=1e-7;
    ma=ma*ma;2
    mb=mb*mb;
    let dx = bx-ax;
    let dy = by-ay;
    dy*=-1;
    let theta = Math.atan(dy/dx);
    if (ax>=bx) theta += Math.PI;
    ady*=-1;
    bdy*=-1;
    let atheta = Math.atan(ady/adx);
    let btheta = Math.atan(bdy/bdx);
    if (adx<0) atheta += Math.PI;
    if (bdx<0) btheta += Math.PI;
    let aThetaDiff = atheta-theta;
    let bThetaDiff = btheta-theta;
    let aVelMag = Math.sqrt(Math.pow(adx,2)+Math.pow(ady,2));
    let bVelMag = Math.sqrt(Math.pow(bdx,2)+Math.pow(bdy,2));

    let newaDx = aVelMag * Math.cos(aThetaDiff);
    let newaDy = aVelMag * Math.sin(aThetaDiff);
    let newbDx = bVelMag * Math.cos(bThetaDiff);
    let newbDy = bVelMag * Math.sin(bThetaDiff);

    let vap = (ma*newaDx + 2*mb*newbDx - mb*newaDx)/(ma + mb);
    let vbp = (2*ma*newaDx + mb*newbDx - ma*newbDx)/(ma + mb);

    let newAngA = Math.atan(newaDy/vap) + theta;
    let newAngB = Math.atan(newbDy/vbp) + theta;
    if (vap<0) newAngA += Math.PI;
    if (vbp<0) newAngB += Math.PI;

    let augMagA = Math.sqrt(Math.pow(vap,2)+Math.pow(newaDy,2));
    let augMagB = Math.sqrt(Math.pow(vbp,2)+Math.pow(newbDy,2));

    return [augMagA*Math.cos(newAngA), -augMagA*Math.sin(newAngA), augMagB*Math.cos(newAngB), -augMagB*Math.sin(newAngB)];
}

function arrow(fromx, fromy, tox, toy) {
    let headlen = 7;
    let dx = tox - fromx;
    let dy = toy - fromy;
    let angle = Math.atan2(dy, dx);
    ctx.moveTo(fromx, fromy);
    ctx.lineTo(tox, toy);
    ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(tox, toy);
    ctx.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
}

function Particle(x, y, dy, dx, rad, col, ind) {
    this.x = x;
    this.y = y;
    this.dy = dy;
    this.dx = dx;
    this.rad = rad;
    this.col = col;
    this.ind = ind;
    const MAXDIST = Math.sqrt(Math.pow(cvs.height,2)+Math.pow(cvs.width,2));
    this.update = function() {
        if (this.y+this.rad>=cvs.height && this.dy>=0) this.dy*=-0.7;
        else if (this.y-this.rad<=0 && this.dy<=0) this.dy*=-0.7;
        else if (gravOn && this.y+this.rad<cvs.height) this.dy+=0.13;

        if (this.x+this.rad>=cvs.width && this.dx>=0) this.dx*=-0.7;
        else if (this.x-this.rad<=0 && this.dx<=0) this.dx*=-0.7;

        let mult = Math.pow(Math.sqrt(Math.pow(this.dx,2)+Math.pow(this.dy,2)),2)*Math.pow(this.rad,2)*5e-4;

        if (this.dy>0) this.dy-=0.002*mult;
        else this.dy+=0.002*mult;

        if (this.dx>0) this.dx-=0.004*mult;
        else this.dx+=0.004*mult;
        
        if (clicking && !infoScreen) {
            let grav = getAccels(1, 29000, Math.pow(this.rad,2), mouseX, mouseY, this.x, this.y);
            this.dx += grav[0];
            this.dy += grav[1];
        }

        this.x += this.dx;
        this.y += this.dy;

        this.draw();
    };
    this.draw = function() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.rad, 0, Math.PI*2, false);
        ctx.fillStyle = this.col;
        ctx.fill();
        ctx.closePath();
        
        if (edu) {
            ctx.strokeStyle = 'white';
            ctx.beginPath();
            arrow(this.x, this.y, this.x+this.dx*5, this.y+this.dy*5);
            ctx.stroke();

            let forceX = Math.min(100, Math.abs(this.dx-befVelc[this.ind][0])*300);
            let forceY = Math.min(100, Math.abs(this.dy-befVelc[this.ind][1])*300);
            if (this.dx-befVelc[this.ind][0]<0) forceX*=-1;
            if (this.dy-befVelc[this.ind][1]<0) forceY*=-1;
            ctx.strokeStyle = 'yellow';
            ctx.beginPath();
            arrow(this.x, this.y, this.x+forceX, this.y+forceY);
            ctx.stroke();

            befVelc[this.ind][0]=this.dx;
            befVelc[this.ind][1]=this.dy;

            if (clicking && !infoScreen) {
                let fact = Math.min(0.7,Math.sqrt(Math.pow(this.x-mouseX,2)+Math.pow(this.y-mouseY,2))/MAXDIST);
                ctx.strokeStyle = `rgba(255, 255, 255, ${0.7-fact})`;
                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(mouseX, mouseY);
                ctx.stroke();
            }
        }
    };
}

function rand(low, high) {
    return Math.random()*(high-low)+low;
}

function getAccels(k, m1, m2, x1, y1, x2, y2) {
    // Returns the x and y component for the object 
    // Assume m2 is the mass of the ball, m1, is the cursor

    let dist = Math.sqrt(Math.pow(x1-x2, 2)+Math.pow(y1-y2, 2));
    if (dist<400) dist=400;
    let force = (k*m1*m2)/Math.pow(dist,2);

    let dx = x2-x1;
    let dy = y2-y1;
    dy*=-1;
    let theta = Math.atan(dy/dx);
    if (x1>=x2) theta += Math.PI; // compensate for limited range of atan()

    let forceX = force*Math.cos(theta);
    let forceY = force*Math.sin(theta);
    
    return [-forceX/m2, forceY/m2];
}

function interaction(i, j) {
    if (obl && i!=j) {
        let dist = Math.sqrt(Math.pow(arr[i].x-arr[j].x,2)+Math.pow(arr[i].y-arr[j].y,2));
        if (dist<arr[i].rad+arr[j].rad) {
            let e = 0.9;
            let hi = calcColl(arr[i].x, arr[i].y, arr[j].x, arr[j].y, arr[i].dx, arr[i].dy, arr[j].dx, arr[j].dy, arr[i].rad, arr[j].rad);
            if (!colliding[i][j] || !colliding[j][i]) {
                arr[i].dx = e*hi[0];
                arr[i].dy = e*hi[1];
                arr[j].dx = e*hi[2];
                arr[j].dy = e*hi[3];
                colliding[i][j]=true;
                colliding[j][i]=true;
            }
            else {
                let dx = arr[i].x - arr[j].x;
                let dy = arr[i].y - arr[j].y;
                dy*=-1; 
                let theta = Math.atan(dy/dx);
                if (dx<0) theta += Math.PI;
                let a = (arr[i].rad+arr[j].rad-dist) * Math.cos(theta);
                let b = -(arr[i].rad+arr[j].rad-dist) * Math.sin(theta);
                let c = (arr[i].rad+arr[j].rad-dist) * Math.cos(theta+Math.PI);
                let d = -(arr[i].rad+arr[j].rad-dist) * Math.sin(theta+Math.PI);
                let scale = 0.6;

                withinBounds = (rad, corr, l, r) => !(corr-rad<l || corr+rad>r);
                if (withinBounds(arr[i].rad, arr[i].x+scale*a, 0, cvs.width)) arr[i].x += scale*a;
                if (withinBounds(arr[i].rad, arr[i].y+scale*b, 0, cvs.height)) arr[i].y += scale*b;
                if (withinBounds(arr[j].rad, arr[j].x+scale*c, 0, cvs.width)) arr[j].x += scale*c;
                if (withinBounds(arr[j].rad, arr[j].y+scale*d, 0, cvs.height)) arr[j].y += scale*d;
            }
        }
        else {
            colliding[i][j]=false;
            colliding[j][i]=false;
        }
    }
    if (bGrav) {
        let grav1 = getAccels(1, Math.pow(arr[i].rad,2), Math.pow(arr[j].rad,2), arr[i].x, arr[i].y, arr[j].x, arr[j].y);
        let grav2 = getAccels(1, Math.pow(arr[j].rad,2), Math.pow(arr[i].rad,2), arr[j].x, arr[j].y, arr[i].x, arr[i].y);
        let fact = (obl?0.3:0.5);
        if (!Number.isNaN(grav1[0])) {
            arr[i].dx += fact*grav2[0];
            arr[i].dy += fact*grav2[1];
            arr[j].dx += fact*grav1[0];
            arr[j].dy += fact*grav1[1];
        }
    }
}

let befMs = 0;
let befMsCt = 0;
let totMs = 10000;
let fps = (10000/totMs).toFixed(0);
function playing() {
    requestAnimationFrame(playing);
    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight)
    ctx.font = '40px Arial';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillText("ⓘ", 5, 40);
    if (mouseX>0 && mouseX<45 && mouseY>0 && mouseY<45 && clicking) {
        infoScreen = true;
        if (infoClicked) {
            infoScreen = false;
        }
    }
    if (clicking) {
        if (mouseX>160 && mouseX<185 && mouseY>75 && mouseY<100 && infoClicked) {
            gravOn = (gravClicked?false:true);
        }
        if (mouseX>190 && mouseX<190+25 && mouseY>115 && mouseY<115+25 && infoClicked) {
            obl = (oblClicked?false:true);
        }
        if (mouseX>170 && mouseX<170+25 && mouseY>155 && mouseY<155+25 && infoClicked) {
            bGrav = (bGravClicked?false:true);
        }
        if (mouseX>170 && mouseX<170+25 && mouseY>195 && mouseY<195+25 && infoClicked) {
            edu = (eduClicked?false:true);
        }
    }
    for (let i=0; i<numBalls; i++) for (let j=0; j<numBalls; j++) interaction(i, j);
    arr.forEach((ball) => ball.update());
    if (!clicking) {
        infoClicked = infoScreen;
        gravClicked = gravOn;
        oblClicked = obl;
        bGravClicked = bGrav;
        eduClicked = edu;
    }

    if (infoScreen) {
        ctx.strokeStyle = 'black';
        ctx.fillStyle = "rgb(100,100,100)";
        ctx.fillRect(30, 30, 300, 200);
        ctx.fillStyle = 'white';
        ctx.font ='20px Arial';
        ctx.fillText("Click around the screen", 50, 60);
        ctx.font ='15px Arial';
        ctx.fillText("Toggle Gravity", 50, 90);
        ctx.beginPath();
        ctx.rect(160, 75, 25, 25);
        ctx.stroke();

        ctx.fillText("Oblique Collisions", 50, 130);
        ctx.beginPath();
        ctx.rect(190, 115, 25, 25);
        ctx.stroke();

        ctx.fillText("Intraball Gravity", 50, 170);
        ctx.beginPath();
        ctx.rect(170, 155, 25, 25);
        ctx.stroke();

        ctx.fillText("Education Mode", 50, 210);
        ctx.beginPath();
        ctx.rect(170, 195, 25, 25);
        ctx.stroke();

        if (gravOn) {
            ctx.fillStyle = 'red';
            ctx.fillRect(161,76,23,23);
        }
        if (obl) {
            ctx.fillStyle = 'red';
            ctx.fillRect(191,116,23,23);
        }
        if (bGrav) {
            ctx.fillStyle = 'red';
            ctx.fillRect(171,156,23,23);
        }
        if (edu) {
            ctx.fillStyle = 'red';
            ctx.fillRect(171,196,23,23);
        }
    }
    ctx.font = "20px Arial";
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillText(`FPS: ${fps}`, cvs.width-80, 30, 100);
    if (befMsCt++%10==0) {
        fps = (10000/totMs).toFixed(0);
        totMs=0;
    }
    totMs += performance.now()-befMs;
    befMs = performance.now();
}
function start() {
    for (let i=0; i<numBalls; i++) {
        let temp = [];
        for (let j=0; j<numBalls; j++) {
            temp.push(false);
        }
        colliding.push(temp);
        befVelc.push([0,0]);
    }
    for (let i=0; i<numBalls; i++) {
        let col = `rgb(${rand(160,255)}, ${rand(160,255)}, ${rand(160,255)})`;
        arr.push(new Particle(rand(30,window.innerWidth-50), rand(30,window.innerHeight-50), rand(-5, 6), rand(-5, 5), rand(2, 14), col, i));
    }
    playing();
}