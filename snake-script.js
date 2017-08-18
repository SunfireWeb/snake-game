$(document).ready(function(){
	// define variables
	var canvas = $('#canvas')[0];
	var ctx = canvas.getContext("2d");
	var w = canvas.width;
	var h = canvas.height;
	var cw = 15; //cell width
	var d; //direction 
	var food;
	var score;
	var speed = 200;
	var endgame = true;
	var gamePaused = true;

	//array of cells to make snake
	var snake_array;

	// various possibilities for spacebar actions
	function pauseGame() {
		if (!gamePaused){
			$("#endgamemsg").hide();
			$("#atStart").hide();
			$("#paused").show();
			$("#overlay").fadeIn(150);
			game_loop = clearInterval(game_loop);
			gamePaused = true;
		} else if ((gamePaused) && (!endgame)) {
			$("#overlay").fadeOut(150);
			game_loop = setInterval(paint, speed);
			gamePaused = false;
		} else if ((gamePaused) && (endgame)) {
			$('#overlay').fadeOut(300);
			init();
		}
	}

	// display upon initial page load
	$('#score').html('Current score: <br />');
	$('#highscore').html('High Score: '+localStorage.highscore);
	$("#overlay").show();


	//initialize
	function init(){
		endgame = false;
		gamePaused = false;
		d = "right";
		create_snake();
		create_food();
		score = 0;

		//move snake animation
		if(typeof game_loop != "undefined") clearInterval(game_loop);
		game_loop = setInterval(paint, speed);
	}

	// create snake
	function create_snake(){
		var length = 5;
		snake_array = [];
		for(var i = length-1; i>=0; i--){
			snake_array.push({x: i, y:0});
		}
	}

	// create food
	function create_food(){
		food = {
			x:Math.round(Math.random()*(w-cw)/cw),
			y:Math.round(Math.random()*(h-cw)/cw)
		};
	}

	// draw snake & animate
	function paint(){
		//canvas
		ctx.fillStyle = "black";
		ctx.fillRect(0,0,w,h);
		ctx.strokeStyle = "white";
		ctx.strokeRect(0,0,w,h);

		// position of snake
		var nx = snake_array[0].x;
		var ny = snake_array[0].y;

		// direction
		if(d == 'right') nx++;
		else if(d == 'left') nx--;
		else if(d == 'up') ny--;
		else if(d == 'down') ny++;

		// collision code; end of game
		if(nx == -1 || nx == w/cw || ny == -1 || ny == h/cw || check_collision(nx, ny, snake_array)){
			// insert final score into overlay
			$('#final_score').html(score);
			$("#endgamemsg").show();
			$("#paused").hide();
			$("#atStart").show();
			// show overlay
			$('#overlay').fadeIn(300);
			
			// reset variables
			endgame = true;
			gamePaused = true;
			return;
		}

		// snake 'eats' food
		if(nx == food.x && ny == food.y){
			var tail = {x: nx, y: ny};
			score++;
			increase_speed(score);
			create_food();
		} else {// move head to tail
			var tail = snake_array.pop();
			tail.x = nx;
			tail.y = ny;
		}

		snake_array.unshift(tail);

		//create rest of snake
		for (i=0; i<snake_array.length; i++){
			var c = snake_array[i];
			paint_cell(c.x, c.y);
		}

		paint_food(food.x, food.y);

		//score
		checkscore(score);

		//display current score
		$('#score').html('Current score: '+score+'<br />');
	}

	function paint_cell(x,y){
		ctx.fillStyle = "green";
		ctx.fillRect(x*cw,y*cw,cw,cw);
		ctx.strokeStyle = "white";
		ctx.strokeRect(x*cw,y*cw,cw,cw);
	}

	function paint_food(x,y){
		ctx.fillStyle = "yellow";
		ctx.fillRect(x*cw,y*cw,cw,cw);
		ctx.strokeStyle = "white";
		ctx.strokeRect(x*cw,y*cw,cw,cw);
	}

	function increase_speed(s){
		if ((score > 0) && (score % 10 == 0)) { // every 10 points, speed increases
			speed -= 15; // as the # gets lower, the speed increases
		}
	}

	function check_collision(x, y, array){
		for (i=0; i<array.length; i++){
			if(array[i].x == x && array[i].y == y)
				return true;
		}
		return false;
	}

	//score logic
	function checkscore(score){
		if(localStorage.getItem('highscore') === null){
			// if there is no high score set
			localStorage.setItem('highscore',score);
		} else {
			// if there is a high score set
			if(score > localStorage.getItem('highscore')) {
				localStorage.setItem('highscore',score);
			}
		}

		//display high score
		$('#highscore').html('High Score: '+localStorage.highscore);
	}

	//keyboard controller
	$(document).keydown(function(e){
		var key = e.which; // identifies pressed key
		if(!endgame){ // prevent continued play after overlay displays
			if(key == "37" && d != "right") d = "left";
			else if (key == "38" && d != "down") d = "up";
			else if (key == "39" && d != "left") d = "right";
			else if (key == "40" && d != "up") d = "down";
		};
		// spacebar for pause
		if(key == "32") pauseGame();
	});
});

//reset high score button
function resetScore(){
	localStorage.highscore = 0;
	highscorediv = document.getElementById('highscore');
	highscorediv.innerHTML = 'High Score: 0';
}