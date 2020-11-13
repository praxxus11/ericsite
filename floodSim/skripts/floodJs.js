let cvs;
let ctx;
// --------------------------
// Changed by bgrd.js jquery
let mouseX;
let mouseY;
let clicking;
let pause=100, step=1;
let dim = 50;
let blockWid = 9;
let gridStyle = 'square';
//-------------------------

//-------------------------
// Changed by initialize and filling functions
let changingPix; // Interval object when person changing the board (for dynamic)
let filling = false; //Just a flag when filling
let dynFilling = false;
// -------------------------

// Changed directly in dynamic function
let drawingMode = "barrier"; // (barrier) (startpoint) (endpoint) (erase)
let wantWhat = "dfs"; // (dfs) (bfs) (shortestpaths)
//---------------------------

let psuedoQorS = []; //holds queue or stack when filling
let allPixel = []; //holds all the pixel object
let dists = []; //holds matrix of distances for shortest paths

function fillTime() {
    let startX=0;
    let startY=0;
    let endX = allPixel.length-2;
    let endY = allPixel[0].length-2;
    for (let i=0; i<allPixel.length; i++) {
        for (let j=0; j<allPixel[0].length; j++) {
            let tmpPix = allPixel[i][j];
            if (tmpPix.type==2) {
                startX = i;
                startY = j;
                tmpPix.color = [255, 255, 255];
                tmpPix.draw();
                // ctx.fillRect(tmpPix.x, tmpPix.y, blockWid, blockWid);
            }
            if (tmpPix.type==4) {
                endX = i;
                endY = j;
            }
        }
    }
    if (wantWhat=="dfs" || wantWhat=="bfs")
        floodFill(startX, startY);
    if (wantWhat=="shortestpaths")
        shortestPaths(startX, startY, endX, endY);
    if (wantWhat=='astar') 
        aStar(startX, startY, endX, endY);
}

function dynamic() {
    $('#barriers').click(function() {
        drawingMode="barrier";
    });
    $('#startingPoint').click(function() {
        drawingMode="startpoint";
    });
    $('#endingPoint').click(function() {
        drawingMode="endpoint";
    });
    $('#erasebut').click(function() {
        drawingMode="erase";
    });
    $('#beginDfs').click(function() {
        if (!filling) {
            wantWhat = "dfs";
            filling = true;
        }
    });
    $('#beginBfs').click(function() {
        if (!filling) {
            wantWhat = "bfs";
            filling = true;
        }
    });
    $('#beginShortestPaths').click(function() {
        if (!filling) {
            wantWhat = "shortestpaths";
            filling = true;
        }
    });
    $('#beginAStar').click(function() {
        if (!filling) {
            wantWhat = 'astar';
            filling = true;
        }
    })

    ctx.fillStyle = 'rgb(200, 200, 200)';
    ctx.fillRect(0, 0, 500, 500);
    for (let i=0; i<allPixel.length; i++) {
        for (let j=0; j<allPixel[0].length; j++) {
            allPixel[i][j].update();
        }
    }
    if (filling) {
        clearInterval(changingPix);
        fillTime();
    }
}
function initialize() {
    clearInterval(changingPix);
    if (!filling) {
        cvs = document.getElementById("canv");
        ctx = cvs.getContext("2d");
        ctx.fillStyle = 'rgb(200, 200, 200)';
        ctx.fillRect(0, 0, 500, 500);
        allPixel = [];
        psuedoQorS = [];
        dists = [];
        filling = false;
        dynFilling = false;
        drawingMode = "barrier";
        switch (gridStyle) {
            case "square":
                for (let i=0; i<dim; i++) {
                    let temp = [];
                    for (let j=0; j<dim; j++) {
                        temp.push(new Pixel(i*(500/dim), j*(500/dim)));
                    }   
                    allPixel.push(temp);
                }
                break;
            case "hex":
                for (let y=0; y<(65/50)*dim; y++) {
                    let temp = [];
                    for (let x=0; x<(19/50)*dim; x++) {
                        if (y%2==0) {
                            let cX = x * 3*blockWid;
                            let cY = y * blockWid*Math.sin(Math.PI/3);
                            temp.push(new Pixel(cX, cY));
                        }
                        else {
                            let cX = 1.5*blockWid + x * 3*blockWid;
                            let cY = y * blockWid*Math.sin(Math.PI/3);
                            temp.push(new Pixel(cX, cY));
                        }
                    }
                    allPixel.push(temp);
                }
                break;
        }
        changingPix = setInterval(dynamic, 1);
    }
    else {
        alert("Wait for fill!");
    }
}
