window.onload = function () {
    "use strict";
    var width = 800,
        height = 600,
        radius = 16,
        xCount = Math.floor(width / radius),
        yCount = Math.floor(height / radius),
        x,
        y,
        id = 0,
        grid = [],
        cell,
        previousRow = [],
        currentRow = [],
        previousCell = false,
        i,
        g,
        startCell,
        click,
        lastTrail;

    // turning support for on
    Crafty.support.audio = true;
    // path to audio file
    Crafty.audio.add({
      start: ["assets/retro-gaming-loop.wav"],
      end: ["assets/cheers.wav"]
    });

    Crafty.init(width, height);
    Crafty.background('rgb(230,230,230)');

    function dfsSearch(startCell, endCell) {
        Crafty.trigger('DFSStarted', null);
        endCell.drawEndNode();
        startCell.drawStartNode();
        var currentCell = startCell,
            neighborCell,
            stack = [],
            neighbors = [],
            stackPopped = false,
            found = false;

        currentCell.visited = true;
        while (!found) {
            //  console.log("redTrail");
            neighbors = currentCell.getAttachedNeighbors();
            if (neighbors.length) {
                // if there is a current neighbor that has not been visited, we are switching currentCell to one of them
                stack.push(currentCell);
                // get a random neighbor cell
                neighborCell = neighbors[Math.floor(Math.random() * neighbors.length)];
                neighborCell.visited = true;
                Crafty.e("Trail").connectNodes(currentCell, neighborCell);
                // update our current cell to be the newly selected cell
                currentCell = neighborCell;
                stackPopped = false;
            } else {
                stackPopped = true;
                if (stack.length === 0) {
                    // this point can not be found. bail
                    break;
                }
                currentCell = stack.pop();
            }
            if (currentCell.x === endCell.x && currentCell.y === endCell.y) {
                found = true;
                //console.log("Found now equals: ", found);
            }
        }
        if (stack.length) {
            stack.push(endCell);
        }
        Crafty.trigger('DFSCompleted', null);
        //console.log("DFSCompleted has just been triggered");
        return stack;
    }

    click = function () {
        // on click, audio begins to play. (audio file, repeat, 90% volume)
        Crafty.audio.play("start", -1, 0.9);
          // on click, use dfs to search our maze
        var stack = dfsSearch(startCell, this),
            timeout = 0,
            neighbor;
        if (stack.length) {
            startCell = stack.shift();
            while (stack.length) {
            //  console.log('inside creat last trail');
                neighbor = stack.shift();
                timeout = Crafty.e("Trail")
                    .attr({slow: false, trailColor: 'rgb(0,0,255)'})
                    .bind("MusicStop", function () {
                      Crafty.audio.stop();
                    })
                    .connectNodes(startCell, neighbor);
                    startCell = neighbor;
              }
              //sets the music to stop once maze is complete and a little encouragment for finishing the maze
                  Crafty.e("Delay").delay(function() {
                    Crafty.trigger("MusicStop")
                    Crafty.audio.play("end", 1, 0.9);
                  }, timeout, 0);
        }
    };
    // build the grid for our DFS and rendering
    for (y = 0; y < yCount; y++) {
        // row information is used to assign neighbors
        currentRow = [];
        for (x = 0; x < xCount; x++) {
            id = x * y + y;
            cell = Crafty.e("2D, Mouse, Cell")
                .attr({id: id, x: x * radius, y:  y * radius})
                .bind('MouseDown', click);
            currentRow.push(cell);
            grid.push(cell);
            if (previousCell !== false) {
                previousCell.addNeighbor(cell);
                cell.addNeighbor(previousCell);
            }
            // set our initial start cell to the center of the maze
            if (Math.floor(yCount / 2) === y && Math.floor(xCount / 2) === x) {
                startCell = cell;
            }
            previousCell = cell;
        }
        if (previousRow.length !== 0) {
            for (i = 0; i < previousRow.length; i++) {
                previousRow[i].addNeighbor(currentRow[i]);
                currentRow[i].addNeighbor(previousRow[i]);
            }
        }
        previousRow = currentRow;
        // clear previous cell to prevent wrapped neighbors
        previousCell = false;
    }

    // use dfs to create our maze
    function dfsCreate(startCell) {
        var currentCell = startCell,
            neighborCell,
            stack = [],
            neighbors = [],
            visited = 1;
        currentCell.visited = true;
        while (visited < grid.length) {
            neighbors = currentCell.getUnVisitedNeighbors();
            if (neighbors.length) {
                // if there is a current neighbor that has not been visited, we are switching currentCell to one of them
                stack.push(currentCell);
                // get a random neighbor cell
                neighborCell = neighbors[Math.floor(Math.random() * neighbors.length)];
                visited++;
                neighborCell.visited = true;
                // while building, on move, knock down the walls!
                neighborCell.removeWall(currentCell);
                currentCell.removeWall(neighborCell);
                // update our current cell to be the newly selected cell
                currentCell = neighborCell;
            } else {
                currentCell = stack.pop();
            }
        }
    }
    dfsCreate(grid[Math.floor(Math.random() * grid.length)]);
    for (g = 0; g < grid.length; g++) {
        grid[g].drawWalls();
    }
};
