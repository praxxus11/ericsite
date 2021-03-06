function works(i, j) {
    if (i<0 || i>=allPixel.length || j<0 || j>=allPixel[0].length) return false; 
    if (allPixel[i][j].type==3) return false;
    return true;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function mouseAffectingPix(x, y) {
    let radius = document.getElementById('brush_slider').value;
    if (Math.sqrt(Math.pow(x-mouseX, 2) + Math.pow(y-mouseY, 2)) <= radius) 
        return true;
    return false;
}

function Pixel(pixX, pixY) {
    this.x = parseInt(pixX);
    this.y = parseInt(pixY);
    this.color = [255, 255, 255];
    this.pressed = false;
    // 4: end square for shortest paths, 3: a barrier or visited square, 
    // 2: start square, 1: blank sqaure
    this.type = 1;
    this.update = function(i,j) {
        if (mouseAffectingPix(this.x, this.y)) {
            if (clicking) {
                if (drawingMode=="barrier") {
                    this.color = [255, 100, 100];
                    this.pressed = true;
                    this.type = 3;
                }
                else if (drawingMode=='startpoint') {
                    this.color = [100, 255, 100];
                    this.pressed = true;
                    this.type = 2;
                }
                else if (drawingMode=='endpoint') {
                    this.color = [100, 100, 255];
                    this.pressed = true;
                    this.type = 4;
                }
                else if (drawingMode=='erase') {
                    this.color = [255, 255, 255];
                    this.pressed = false;
                    this.type = 1;
                }
                if (blockWid==2 || blockWid==1) 
                    delete halfCol[[i,j]];
            }
            else if (!this.pressed) {
                if (drawingMode=="barrier")
                    this.color = [255, 225, 225];
                else if (drawingMode=='startpoint')
                    this.color = [225, 255, 225];
                else if (drawingMode=='endpoint')
                    this.color = [225, 225, 255];
                else if (drawingMode=='erase')
                    this.color = [235, 235, 235];
                if (blockWid==2 || blockWid==1)
                    halfCol[[i,j]]=1;
            }
        }
        else if (!this.pressed) {
            this.color = [255, 255, 255];   
            if (blockWid==2 || blockWid==1) 
                delete halfCol[[i,j]];
        }
        this.draw();
    };
    this.draw = function() {
        ctx.fillStyle = `rgb(${this.color[0]}, ${this.color[1]}, ${this.color[2]})`;
        switch(gridStyle) {
            case "square":
                ctx.fillRect(this.x, this.y, blockWid, blockWid);
                break;
            case "hex":
                ctx.beginPath();
                ctx.moveTo(this.x-0.5*blockWid, this.y+blockWid*Math.sin(Math.PI/3));
                ctx.lineTo(this.x+0.5*blockWid, this.y+blockWid*Math.sin(Math.PI/3));
                ctx.lineTo(this.x+blockWid, this.y);
                ctx.lineTo(this.x+0.5*blockWid, this.y-blockWid*Math.sin(Math.PI/3));
                ctx.lineTo(this.x-0.5*blockWid, this.y-blockWid*Math.sin(Math.PI/3));
                ctx.lineTo(this.x-blockWid, this.y);
                ctx.closePath();
                ctx.fill();
                ctx.strokeStyle = 'rgb(200,200,200)';
                ctx.stroke();
                break;
        }
    }
}

function updateAll() {
    for (let i=0; i<allPixel.length; i++) {
        for (let j=0; j<allPixel[0].length; j++) {
            allPixel[i][j].update(i,j);
        }
    }
}
function rand() {
    function works(i, j) {
        if (i<0||i>=allPixel.length||j<0||j>=allPixel[0].length) return false;
        if (allPixel[i][j].type==1) return false;
        return true;
    }
    if (gridStyle=='hex') {
        alert("Maze is not supported for hexagonal grid.");
        return 0;
    }
    if (!filling) {
        for (let i=0; i<allPixel.length; i++) {
            for (let j=0; j<allPixel[0].length; j++) {
                allPixel[i][j].pressed = false;
                allPixel[i][j].type = 10;
                if (!(i%2==0 && j%2==0)) {
                    allPixel[i][j].color = [255, 100, 100];
                    allPixel[i][j].pressed = true;
                    allPixel[i][j].type = 3;
                }
            }
        }
        let i=0, j=0;
        let s = [];
        s.push([i, j]);
        allPixel[i][j].type = 1;
        while (s.length!=0) {
            let temp = s.pop();
            i=temp[0]; j=temp[1];
            let validness = [works(i, j-2), works(i, j+2), works(i-2, j), works(i+2, j)];
            let possib = [[i, j-2], [i, j+2], [i-2, j], [i+2, j]];
            let avail = [];
            for (let i=0; i<4; i++) {
                if (validness[i])
                    avail.push(possib[i]);
            }
            if (avail.length>0) {
                s.push([i, j]);
                let rand = Math.floor(Math.random()*avail.length);
                let toPush = avail[rand];
                let iT = toPush[0];
                let jT = toPush[1];
                if (j-jT==2) {
                    allPixel[i][j-1].pressed = false;
                    allPixel[i][j-1].type = 1;
                    
                    allPixel[i][j-2].type = 1;
                    s.push([i, j-2]);
                }
                if (j-jT==-2) {
                    allPixel[i][j+1].pressed = false;
                    allPixel[i][j+1].type = 1;
                    
                    allPixel[i][j+2].type = 1;
                    s.push([i, j+2]);
                }
                if (i-iT==2) {
                    allPixel[i-1][j].pressed = false;
                    allPixel[i-1][j].type = 1;
                    
                    allPixel[i-2][j].type = 1;
                    s.push([i-2, j]);
                }
                if (i-iT==-2) {
                    allPixel[i+1][j].pressed = false;
                    allPixel[i+1][j].type = 1;
                    
                    allPixel[i+2][j].type = 1;
                    s.push([i+2, j]);
                }
            }
        }
        updateAll();
    }
    else {
        alert("Wait for fill");
    }
}

function static() {
    if (!filling) {
        for (let i=0; i<allPixel.length; i++) {
            for (let j=0; j<allPixel[0].length; j++) {
                if (Math.random()<0.3) {
                    allPixel[i][j].color = [255, 100, 100];
                    allPixel[i][j].pressed = true;
                    allPixel[i][j].type = 3;
                }
                else {
                    allPixel[i][j].color = [255, 255, 255];
                    allPixel[i][j].pressed= false;
                    allPixel[i][j].type = 1;
                }
            }
        }
        for (let i=0; i<3; i++) {
            for (let j=0; j<3; j++) {
                allPixel[i][j].color = [255, 255, 255];
                allPixel[i][j].pressed= false;
                allPixel[i][j].type = 1;
            }
        }
        for (let i=allPixel.length-3; i<allPixel.length; i++) {
            for (let j=allPixel.length-3; j<allPixel.length; j++) {
                allPixel[i][j].color = [255, 255, 255];
                allPixel[i][j].pressed= false;
                allPixel[i][j].type = 1;
            }
        }
        updateAll();
    }
    else {
        alert("Wait for fill");
    }
}

