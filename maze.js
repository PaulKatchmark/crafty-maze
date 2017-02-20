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
        lastTrail,
        seconds = 0,
        chosenTime = 0,
        t,
        points = 5,
        totalPoints = document.getElementById('totalPoints'),
        gameTimer = document.getElementById('gameTimer'),
        timeChosen = document.getElementById('timeChosen'),
        addTime = document.getElementById('addTime'),
        minusTime = document.getElementById('minusTime');

    // displaying 0 for your chosen time the first time the page loads or on refresh
    timeChosen.textContent = "0";
    // when the game begins you will start with 5 points;
    totalPoints.textContent = "You start the game with " + points + " points";
    // timer displays at top of page and this will add seconds to it.
    function add() {
        seconds++;
        gameTimer.textContent = seconds;
        timer();
    }
    // function to make sure timer increase at correct interval
    function timer() {
        t = setTimeout(add, 1000);
    }
    // stops the timer and resets t, so it increases at correct speed next time add() is run
    //also doesn't reset "seconds" so will still display correctly when maze is complete
    function stopTimer() {
        clearTimeout(t);
    }
    // will stop timer and reset and will also reset display of timer on page
    function clearTimer() {
      gameTimer.textContent = "0";
      stopTimer();
      seconds = 0;
    }
    // adds 1 each time you click the plus button
    addTime.onclick = function() {
      chosenTime++;
      timeChosen.textContent = chosenTime;
    }
    // subtracts 1 each time you click the minus button
    minusTime.onclick = function() {
      chosenTime--;
      timeChosen.textContent = chosenTime;
    }

    // will look to see if you chose a time within 10 seconds of the maze completion, if you did you get a point and "cheering" sounds
    // if you didn't get within 10 seconds you will lose a point and the crowd will "boo"
    function calcPoints() {
      var negRange = parseInt(seconds) - 10,
          posRange = parseInt(seconds) + 10;
        if (chosenTime <= posRange && chosenTime >= negRange){
          Crafty.audio.play("win", 1, 0.9);
          points++;
          return points;
        }
      Crafty.audio.play("lose", 1, 0.9);
      points--;
      return points
    }
    // turning support for on
    Crafty.support.audio = true;
    // path to audio file
    Crafty.audio.add({
      start: ["assets/sounds/retro-gaming-loop.wav"],
      win: ["assets/sounds/cheers.wav"],
      lose: ["assets/sounds/boos.wav"]
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
            }
        }
        if (stack.length) {
            stack.push(endCell);
        }
        Crafty.trigger('DFSCompleted', null);
        return stack;
    }
    var clickMe = function() {
      alert('Surprise!');
    }
    click = function () {
        Crafty.trigger("MusicStop")
        clearTimer();
        timer();
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
                    stopTimer();
                    calcPoints();
                    totalPoints.textContent = "You currently have " + points + " points";
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
