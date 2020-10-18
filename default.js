let board = new Array(14);
let user = true; // player one
let players;
let difficulty;
let scores =  [0, 0];
let names = Array(2);
let recursiveDepth;
let missedMovesPercentage;

const recursiveDepths = [0, 2, 3, 5, 7];
const missedMovesPercentages = [1, .3, .15, .05, 0];

/**
 * Shows the help modal.
 */
function showModal() {
    document.getElementById("ModalContainer").style.display = "block";  
}

/**
 * Hides the help modal.
 */
function hideModal() {
    document.getElementById("ModalContainer").style.display = "None";
}

/**
 * Sets all the variables for the game then places the stones on the board with the drawBoard() function.
 */
function initializeBoard() {
	let temp;
	//these three lines set the "scoreboard"
	document.getElementById("player1").className = 'currentPlayer';
	for (let i = 0; i < board.length; i++) {
		board[i] = [];
		if (i != 6 && i != 13) { // Don't initialize the two caches.
			for (let j = 0; j < 3; j++) {
				temp = Math.round(3 * Math.random());
				switch (temp) {
					case 0:
						board[i].push("blue");
						break;
					case 1:
						board[i].push("green");
						break;

					case 2:
						board[i].push("red");
						break;
					case 3:
						board[i].push("yellow");
						break;
					default:
						break;
				}
			}
			placeStones(document.getElementById(i));
		}
	}
	//drawBoard();
	activatePits();
}

/**
 * Sets pits to active or inactive, enabling the indicators of a move.
 */
function activatePits() {
	let elem;
	for (let i = 0; i < 13; i++) {
		if (i != 6) { // Skip cache
			elem = document.getElementById(i);
			if ((board[i].length > 0) && ((user && i >= 0 && i < 6) || (!user && players > 1 && i >= 7 && i < 13))){
				elem.setAttribute("class", "active-pit");
			} else {
				elem.setAttribute("class", "");
			}
		}
	}
}

/**
 * Moves a stone from one pit to another, including all the animation
 * @param {Element} startPit - The beginning pit where the stone is taken from
 * @param {Element} endPit - The ending pit (or cache) where the stone is placed
 */
async function moveStone(startPit, endPit) {
	let stone = startPit.childNodes[startPit.childNodes.length - 1];
	//let boardStone = board[startPit.id].pop();
	let xOffset = 0, yOffset = 0;

	let endXProp = '';
	let endYProp = '';

	if (endPit.id != 6 && endPit.id != 13) { // pits
		endXProp = 'c';
		endYProp = 'c';
	} else { //caches
		xOffset += endPit.childNodes[1].width.baseVal.value / 2;
		yOffset += endPit.childNodes[1].height.baseVal.value / 2;
	}

	endXProp += 'x';
	endYProp += 'y';

	let angle = Math.ceil(Math.random() * 360);
	let sin = Math.sin(angle * Math.PI / 180);
	let cos = Math.cos(angle * Math.PI / 180)
	let distance = 32 - (32 / (endPit.childNodes.length - 1));
	let xDistance = Math.round(distance * cos) + xOffset;
	let yDistance = Math.round(distance * sin) + yOffset;
	let startX = startPit.childNodes[startPit.childNodes.length - 1].x.baseVal.value;
	let startY = startPit.childNodes[startPit.childNodes.length - 1].y.baseVal.value;

	let transform = "translate(" + ((endPit.childNodes[1][endXProp].baseVal.value + xDistance) - startX - 16).toString() + "px, " + ((endPit.childNodes[1][endYProp].baseVal.value + yDistance) - startY - 16).toString() + "px)";

	stone.style.transform =  transform;
	await new Promise(r => setTimeout(r, 400)); 

	distance = 32 - distance;
	angle += 180;
	sin = Math.sin(angle * Math.PI / 180);
	cos = Math.cos(angle * Math.PI / 180)
	let newXDistance = Math.round(distance * cos);
	let newYDistance = Math.round(distance * sin);
	transform = "translate(" + newXDistance.toString() + "px, " + newYDistance.toString() + "px)";

	for (let i = 2; i < endPit.childNodes.length; i++) {
		endPit.childNodes[i].style.transform = transform;
		endPit.childNodes[i].style.transition = "transform .1s ease";
	}

	await new Promise(r => setTimeout(r, 200)); 

	for (let i = 2; i < endPit.childNodes.length; i++) {
		endPit.childNodes[i].style.transition = "transform .0s ease";
		endPit.childNodes[i].style.transform = "translate(0px, 0px)";
		endPit.childNodes[i].setAttribute("x", endPit.childNodes[i].x.baseVal.value + newXDistance);
		endPit.childNodes[i].setAttribute("y", endPit.childNodes[i].y.baseVal.value + newYDistance);
		new Promise(r => {
			setTimeout(r, 300);
		}).then(() => {
			endPit.childNodes[i].style.transition = "transform .3s ease";
		}); 
	}
	
	startPit.removeChild(stone);
	stone.setAttribute("x", endPit.childNodes[1][endXProp].baseVal.value - 16 + xDistance);
	stone.setAttribute("y", endPit.childNodes[1][endYProp].baseVal.value - 16 + yDistance);
	stone.style.transform = "translate(0px, 0px)";
	endPit.append(stone);

	startPit.childNodes[0].innerHTML = startPit.childNodes.length - 2;
	endPit.childNodes[0].innerHTML = endPit.childNodes.length - 2;
}

/**
 * Moves all the stones from one pit to another.
 * @param {Element} startPit - The pit where the stones move from.
 * @param {Element} endPit - The pit where the stones move to.
 */
async function moveStones(startPit, endPit) {
	let stone, xOffset, yOffset, endXProp, endYProp, angle, sin, cos, distance, xDistance, yDistance, startX, startY, transform, newXDistance, newYDistance;
	let xDistances = [];
	let yDistances = [];

	for (let i = 0; i < board[startPit.id].length; i++) {
		// Starting moving stones
		stone = startPit.childNodes[startPit.childNodes.length - i - 1];
		xOffset = 0;
		yOffset = 0;


		endXProp = '';
		endYProp = '';

		if (endPit.id != 6 && endPit.id != 13) { // pits
			endXProp = 'c';
			endYProp = 'c';
		} else { //caches
			xOffset += endPit.childNodes[1].width.baseVal.value / 2;
			yOffset += endPit.childNodes[1].height.baseVal.value / 2;
		}

		endXProp += 'x';
		endYProp += 'y';

		angle = Math.ceil(Math.random() * 360);
		sin = Math.sin(angle * Math.PI / 180);
		cos = Math.cos(angle * Math.PI / 180)
		distance = 32 - (32 / (endPit.childNodes.length - 1));
		xDistance = Math.round(distance * cos) + xOffset;
		yDistance = Math.round(distance * sin) + yOffset;
		startX = startPit.childNodes[startPit.childNodes.length - i - 1].x.baseVal.value;
		startY = startPit.childNodes[startPit.childNodes.length - i - 1].y.baseVal.value;

		xDistances.push(xDistance);
		yDistances.push(yDistance);

		transform = "translate(" + ((endPit.childNodes[1][endXProp].baseVal.value + xDistance) - startX - 16).toString() + "px, " + ((endPit.childNodes[1][endYProp].baseVal.value + yDistance) - startY - 16).toString() + "px)";

		stone.style.transform =  transform;

		distance = 32 - distance;
		angle += 180;
		sin = Math.sin(angle * Math.PI / 180);
		cos = Math.cos(angle * Math.PI / 180)
		newXDistance = Math.round(distance * cos);
		newYDistance = Math.round(distance * sin);
		transform = "translate(" + newXDistance.toString() + "px, " + newYDistance.toString() + "px)";

		for (let i = 2; i < endPit.childNodes.length; i++) {
			endPit.childNodes[i].style.transform = transform;
			endPit.childNodes[i].style.transition = "transform .1s ease";
		}

		for (let i = 2; i < endPit.childNodes.length; i++) {
			endPit.childNodes[i].style.transition = "transform .0s ease";
			endPit.childNodes[i].style.transform = "translate(0px, 0px)";
			endPit.childNodes[i].setAttribute("x", endPit.childNodes[i].x.baseVal.value + newXDistance);
			endPit.childNodes[i].setAttribute("y", endPit.childNodes[i].y.baseVal.value + newYDistance);
			new Promise(r => {
				setTimeout(r, 300);
			}).then(() => {
				endPit.childNodes[i].style.transition = "transform .3s ease";
			}); 
		}

		// End moving stones
	}
	await new Promise(r => setTimeout(r, 400));

	while (board[startPit.id].length > 0) {
		stone = startPit.childNodes[startPit.childNodes.length - 1];	
		startPit.removeChild(stone);
		stone.setAttribute("x", endPit.childNodes[1][endXProp].baseVal.value - 16 + xDistances.shift());
		stone.setAttribute("y", endPit.childNodes[1][endYProp].baseVal.value - 16 + yDistances.shift());
		stone.style.transform = "translate(0px, 0px)";
		endPit.append(stone);
		board[endPit.id].push(board[startPit.id].pop());
	}

	startPit.childNodes[0].innerHTML = startPit.childNodes.length - 2;
	endPit.childNodes[0].innerHTML = endPit.childNodes.length - 2;

	emptyIndex = getNumStones(board[endPit.id]); // The number of stones also indicates the first empty slot.

	playAudio(emptyIndex);
}

/**
 * Places the stones clustered around the center of a pit.
 * @param {Element} element 
 */
function placeStones(element) {
	const startX = element.childNodes[1].cx.baseVal.value;
	const startY = element.childNodes[1].cy.baseVal.value;
	const pit = board[element.id];
	const numStones = pit.length;

	if (numStones == 0)
		return;
	
	let stones = [];
	for (let i = 0; i < numStones; i++) {
		let stone = document.createElementNS("http://www.w3.org/2000/svg", "image");
		stone.setAttribute("href", pit[i] + "_stone.png");
		stone.setAttribute("height", 32);
		stone.setAttribute("width", 32);
		stones.push(stone);
	}
	stones[0].setAttribute("x", startX - 16);
	stones[0].setAttribute("y", startY - 16);
	for (let i = 1; i < numStones; i++) {
		let angle = Math.ceil(Math.random() * 360);
		let sin = Math.sin(angle * Math.PI / 180);
		let cos = Math.cos(angle * Math.PI / 180)
		let distance = 32 - (32 / (i + 1));
		let xDistance = Math.round(distance * cos);
		let yDistance = Math.round(distance * sin);
		stones[i].setAttribute("x", startX - 16 + xDistance);
		stones[i].setAttribute("y", startY - 16 + yDistance);

		distance = 32 - distance;
		angle += 180;
		sin = Math.sin(angle * Math.PI / 180);
		cos = Math.cos(angle * Math.PI / 180)
		xDistance = Math.round(distance * cos);
		yDistance = Math.round(distance * sin);

		for (let j = i - 1; j >= 0; j--) {
			stones[j].setAttribute("x", stones[j].x.baseVal.value + xDistance);
			stones[j].setAttribute("y", stones[j].y.baseVal.value + yDistance);
		}
	}
	for (let i = 0; i < numStones; i++) {
		element.append(stones[i]);
	}
}

/**
 * Places or removes stones from the board
 */
function drawBoard() {
	for (let i = 0; i < 14; i++) {
		for (let j = 0; j < board[i].length; j++) {
			if (board[i][j] == "red" || board[i][j] == "green" || board[i][j] == "blue" || board[i][j] == "yellow") {
				document.getElementById("" + i + "." + j).style.backgroundImage = "url('" + board[i][j] + "_stone.png')";
			} else {
				document.getElementById("" + i + "." + j).style.backgroundImage = "url()";
			}
			document.getElementById("" + i + "." + j).style.transform = "";
		}
	}
}

/**
 * Handles a human turn.
 * @param {Element} element - The pit or cache clicked by the user.
 */
async function humanTurn(element) {
	//this is called when a player clicks on a board square
	if (board[element.id][0] == null || board[element.id][0] == "") {
		return false;
	}

	if ((user == true && element.id < 6) || (user == false && element.id > 6 && element.id != 13)) {
		await animateMove(element);
		await switchUser();
		activatePits();
		//drawBoard();
	} else {
		return false;
	}
	// Recalculate scores
	scores[0] = 0;
	scores[1] = 0;

	for (let i = 0; i < 34; i++) {
		if(board[6][i] != null && board[6][i] != "")
			scores[0]++;
	}

	for (let i = 0; i < 34; i++) {
		if(board[13][i] != null && board[13][i] != "")
			scores[1]++;
	}

	document.getElementById("player1").innerHTML = "" + names[0] + ": " + scores[0];
	document.getElementById("player2").innerHTML = "" + names[1] + ": " + scores[1];

	// Check for the end of the game.
	if (scores[0] + scores[1] == 36) {
		let newOne;
		if (scores[0] > scores[1])
			newOne = confirm("" + (players == 1 ? "You Win!" : names[0] + " wins!") + "\n  Would you like a new game?");
		if (scores[0] < scores[1])
			newOne = confirm("" + names[1] + " wins!\n  Would you like a new game?");
		if (scores[0] == scores[1])
			newOne = confirm("The game is a tie!\n  Would you like a new game?");
		if (newOne)
			window.location.reload();
	} else {
		// Check whether the turn advances or if the opposite player has no legal moves.
		let empty;
		if (user) {
			empty = isEmpty(board, user);
			if (empty) {
				switchUser();
				alert("It is still " + names[1] + " turn because " + (players == 1 ? "you have":  names[0] + " has") + " no legal moves.");
			}
		}

		if (!user) {
			empty = isEmpty(board, user);
			if (empty) {
				switchUser();
				alert("It is still " + (players == 1 ? "your" : names[0] + "'s") + " turn because " + names[1] + " has no legal moves.");
			}
		}
		
		// Perform computer move.
		if (players == 1 && !user) {
			//drawBoard();
			await computerTurn();

			// Calculate scores
			scores[0] = 0;
			scores[1] = 0;
			for (let i = 0; i < 34; i++) {
				if(board[6][i] != null && board[6][i] != "")
					scores[0]++;
			}
			for (let i = 0; i < 34; i++) {
				if(board[13][i] != null && board[13][i] != "")
					scores[1]++;
			}
			document.getElementById("player1").innerHTML = "" + names[0] + ": " + scores[0];
			document.getElementById("player2").innerHTML = "" + names[1] + ": " + scores[1];

			// Check for the end of the game.
			if (scores[0] + scores[1] == 36) {
				let newOne;
				if(scores[0] > scores[1])
					newOne = confirm("" + (players == 1 ? "You Win!" : names[0] + " wins!") + "\n  Would you like a new game?");
				if(scores[0] < scores[1])
					newOne = confirm("" + names[1] + " wins!\n  Would you like a new game?");
				if(scores[0] == scores[1])
					newOne = confirm("The game is a tie!\n  Would you like a new game?");
				if(newOne)
					window.location.reload();
			} else {
				// Check whether the turn advances or if the opposite player has no legal moves.
				if (user) {
					empty = isEmpty(board, user);
					if(empty){
						switchUser();
						alert("It is still " + names[1] + "'s turn because " + (players == 1 ? "you have" : names[0] + " has") + " no legal moves.");
					}
				}
				if (!user) {
					empty = isEmpty(board, user);
					if (empty) {
						switchUser();
						alert("It is still " + (players == 1 ? "your" : names[0] + "'s") + " turn because " + names[1] + " has no legal moves.");
					}
				}
			}
		}
	}
}

/**
 * Executes the computer turn.
 */
async function computerTurn() {
	let maxMoveVal;
	let moveVal;
	let maxMove;
	let empty;
	user = !user;
	while (user) {
		//drawBoard();
		maxMoveVal = -37;
		moveVal = -37;
		for (let i = 7; i < 13; i++) {
			if (board[i][0] != null && board[i][0] != "") {
				moveVal = await computerTurnRecurse(copyBoard(board), i, 0, !user);
				if (moveVal > maxMoveVal) {
					maxMoveVal = moveVal;
					maxMove = i;
				}
				//alert("moveVal: " + moveVal);
			}
		}
		//alert("Moving " + maxMove + "   with maxVal: " + maxMoveVal);
		await computerMove(board, maxMove, user, true);
		user = !user;
		empty = isEmpty(board, !user);
		if (empty) {
			if (getNumStones(board[13]) + getNumStones(board[6]) == 36) {
				return;
			} else {
				user = !user;
				//setTimeout("computerTurn();", 12);
				//alert("It is still player 2's turn because player 1 has no legal moves.");
			}
		}
		//drawBoard();
	}
	await switchUser();
	activatePits();
}

/**
 * A recursive helper function used to determine optimal computer moves.
 * @param {Array.<Array.<String>>} tempBoard - A temporary board used to determine future moves.
 * @param {Number} move - Index of the pit used for the move.
 * @param {Number} level - The depth of the recursion.
 * @param {Boolean} temporUser - The temporary user: true is player one, false is player two.
 */
async function computerTurnRecurse(tempBoard, move, level, temporUser) {
	let tempUser = !temporUser;
	let maxMoveVal = 36;
	let moveVal = 36;
	let maxMove;
	let otherMaxMove;
	let empty = isEmpty(tempBoard, !temporUser);
	if (empty)
		tempUser = !tempUser;
	empty = (empty && isEmpty(tempBoard, temporUser));
	if (tempBoard[move][0] != null && tempBoard[move][0] != "") {
		await computerMove(tempBoard, move, tempUser, false);
		temporUser = tempUser;
		if (temporUser) {
			for (let i = 0; i < 6; i++) {
				if (level == recursiveDepth || empty) {
					return (getNumStones(tempBoard[13]) - getNumStones(tempBoard[6]));
				}
				if (tempBoard[i][0] != null && tempBoard[i][0] != "") {
					if (Math.random() > missedMovesPercentage) { // As part of the realism for imperfect AI, it skips the move sometimes. 
						moveVal = await computerTurnRecurse(copyBoard(tempBoard), i, level + 1, temporUser);
					} else {
						moveVal = -36
					}
					if (moveVal <= maxMoveVal) {
						otherMaxMove = maxMove;
						maxMoveVal = moveVal;
						maxMove = i;
					}
				}
			}
		}
		if (!temporUser) {
			maxMoveVal = -36;
			moveVal = -36;
			for (let i = 7; i < 13; i++) {
				if (level == recursiveDepth || empty) {
					return (getNumStones(tempBoard[13]) - getNumStones(tempBoard[6]));
				}
				if (tempBoard[i][0] != null && tempBoard[i][0] != "") {
					if (Math.random() > missedMovesPercentage) { // As part of the realism for imperfect AI, it skips the move sometimes. 
						moveVal = await computerTurnRecurse(copyBoard(tempBoard), i, level + 1, temporUser);
					} else {
						moveVal = -36
					}
					if(moveVal >= maxMoveVal){
						maxMove = i;
						maxMoveVal = moveVal;
					}
				}
			}
		}
	}
	if (otherMaxMove != null) {
		//alert("there is an otherMaxMove");
		choice = Math.round(Math.random());
		if (choice == 1 && board[otherMaxMove][0] != null && board[otherMaxMove][0] != "")
			maxMove = otherMaxMove;
	}
	return maxMoveVal;
}

/**
 * Gets the number of stones in a pit/cache given a board.
 * @param {Array.<String>} pit - An array denoting the color of stones in the pit or cache. 
 */
function getNumStones(pit) {
	return pit.length; // This might be totally unneccessary. 
	// return pit.findIndex(function(stone) { return !stone; });
}

/**
 * Actually switches the user once their turn is done.
 */
async function switchUser() {
	user = !user;
	if (user) {
		document.getElementById("player1").className = "currentPlayer";
		document.getElementById("player2").className = "";
		document.getElementById("PlayerIndicator").style.left = "30px";
		document.getElementById("PlayerIndicator").style.bottom = "85px";
	} else {
		document.getElementById("player2").className = "currentPlayer";
		document.getElementById("player1").className = "";
		document.getElementById("PlayerIndicator").style.left = "30px";
		document.getElementById("PlayerIndicator").style.bottom = "235px";
	}
	await new Promise(r => setTimeout(r, 100)); 
}

/**
 * Sets the number of players, and names for the game, then advances to the difficulty selection or the game.
 * @param {number} howMany - The number of players (1 or 2).
 */
function setPlayers(howMany) {
	players = howMany;
	document.getElementById("startgame").innerHTML = "";
	document.getElementById("startgame").style.visiblity = "hidden";
	names[0] = prompt("What is your name (player 1)?");
	if (!names[0])
		names[0] = "Player 1";
	if (howMany == 1) {
		document.getElementById("difficulty").style.visibility = "visible";
		names[1] = "Computer";
	} else {
		document.getElementById("game").style.visibility = "visible";
		document.getElementById("difficulty").innerHTML = "";
		names[1] = prompt("What is your name (player 2)?");
		if (!names[1])
			names[1] = "Player 2";
	}
	document.getElementById("player1").innerHTML = "" + names[0] + ": " + scores[0];
	document.getElementById("player2").innerHTML = "" + names[1] + ": " + scores[1];
}

/**
 * Plays audio when a stone is placed on the board
 * @param {number} numStones - The number of stones. Used to determine which sound is played.
 */
function playAudio(numStones) {
	let audioName, audioElement;

	switch (numStones) {
		case 0:
			audioName = "one_stone.mp3";
			break;
			
		case 1:
			audioName = "two_stones.mp3";
			break;

		default:
			audioName = "three_plus_stones.mp3";
			break;
	}

	audioElement = new Audio(audioName); 
	audioElement.play();
}

/**
 * Sets the difficulty of the AI opponent, then advances to the game. 
 * @param {number} howHard - The difficulty of the AI opponenent.
 */
function setDifficulty(howHard) {
	difficulty = howHard;
	recursiveDepth = recursiveDepths[difficulty];
	missedMovesPercentage = missedMovesPercentages[difficulty];
	document.getElementById("difficulty").style.visiblity = "hidden";
	document.getElementById("difficulty").innerHTML = "";
	document.getElementById("game").style.visibility = "visible";
}

/**
 * Gets the transform animation to apply to the stone as it moves. 
 * @param {Number} oldPit - The index of the pit to start the animation.  
 * @param {Number} newPit - The index of the pit to end the animation.
 * @param {Number} oldIndex - The slot of the stone to start the animation.
 * @param {Number} newIndex - The slot of the stone to end the animation.
 */
function getTransform(oldPit, newPit, oldIndex, newIndex) {
	// Middle caches are different
	// We need to handle the opposite direction for the top of the board

	function getYOffset(index) {
		if (Math.ceil(index / 2) % 2 == 0) { // Up/negative
			return Math.floor(index / 2) * 7.5;
		} else if (Math.ceil(index / 2) % 2 == 1) { // Down/Positive
			return 0 - (Math.floor(index / 2) + 1) * 7.5
		}
	}

	function getCacheYOffset(index) {
		let yOffset = 0;
		if ((Math.floor(index / 3) % 2) == 0) { // Up/Negative
			yOffset += (Math.floor(index / 3) * 7.5);
		} else { // Down/Postivie
			yOffset -= (Math.floor(index / 3) + 1) * 7.5;
		}

		if (index % 3 != 0) {
			yOffset -= 7.5;
		}

		return yOffset;
	}

	let xOffset, yOffset = 0;

	if ((oldPit >= 0 && oldPit <= 5) && (newPit >= 7 && newPit <= 12)) { // Have to deal with a turn
		xOffset = 61 * (5 - oldPit);
		xOffset -= 61 * (newPit - 7)
		xOffset -= ((newIndex % 2) - (oldIndex % 2)) * 15;
		yOffset -= 146;
	} else if ((oldPit >= 7 && oldPit <= 12) && (newPit >= 0 && newPit <= 5)) { // Turn starting from 2nd player
		xOffset =  0 - (61 * (12 - oldPit));
		xOffset += 61 * newPit; 
		xOffset -= ((newIndex % 2) - (oldIndex % 2)) * 15;
		yOffset += 146;
	} else if ((oldPit >= 0 && oldPit <= 5) && (newPit >= 0 && newPit <= 5)) { // All on the bottom side
		xOffset = 61 * (newPit - oldPit);
		xOffset -= ((newIndex % 2) - (oldIndex % 2)) * 15;
	} else if ((oldPit >= 7 && oldPit <= 12) && (newPit >= 7 && newPit <= 12)) { // All on the top side
		xOffset = 0 - (61 * (newPit - oldPit));
		xOffset -= ((newIndex % 2) - (oldIndex % 2)) * 15;
	} else if (newPit == 6) { // right cache
		if (oldPit >= 0 && oldPit <= 5) { //Starting at the bottom
			xOffset = 61 * (5 - oldPit);
		} else { //Starting at the top
			xOffset = 61 * (oldPit - 7)
		}
		xOffset += 38.5 + 30.5 + (((newIndex + 1) % 3) * 15);
		xOffset += (oldIndex % 2) * 15;
	} else {// newPit == 13, left cache
		if (oldPit >= 0 && oldPit <= 5) { //Starting at the bottom
			xOffset = 0 - 61 * oldPit;
		} else { //Starting at the top
			xOffset = 0 - (61 * (12 - oldPit));
		}
		xOffset -= (38.5 + 30.5 + (30 - (((newIndex + 1) % 3) * 15)));
		xOffset -= ((oldIndex + 1) % 2) * 15;
	}

	if (newPit == 6 || newPit == 13) { // Caches
		yOffset += (getYOffset(oldIndex) - getCacheYOffset(newIndex));
		if (oldPit >= 0 && oldPit <= 5) {
			yOffset -= 73;
		} else if (oldPit >= 7 && oldPit <= 12) {
			yOffset += 73;
		}
	} else {
		yOffset += (getYOffset(oldIndex) - getYOffset(newIndex));
	}

	return "translate(" + xOffset + "px, " + yOffset + "px)";
}

/**
 * Animates moving the stones from a pit.
 * @param {Element} element - The pit of the move to animate.
 */
async function animateMove(element) {
	// Move stones to temporary array.
	//let toMove = board[element.id];
	//board[element.id] = [];

	let spot = element.id;
	let emptyIndex;

	for (; board[element.id].length > 0;) {
		spot++;
		if (spot == (user ? 13 : 6))
			spot++;
		if (spot > 13)
			spot = 0;
		await moveStone(element, document.getElementById(spot));
		emptyIndex = getNumStones(board[spot]); // The number of stones also indicates the first empty slot.
		board[spot].push(board[element.id].pop());

		playAudio(emptyIndex);
	}

	// Player ended in their cache. They have another turn. 
	if (spot == 6 && user || spot == 13 && !user)
		switchUser();

	if (user == true && spot < 6 && (board[spot][1] == null || board[spot][1] == "")) {
		await moveStone(document.getElementById(spot), document.getElementById(6));
		emptyIndex = getNumStones(board[6]); // The number of stones also indicates the first empty slot.
		board[6].push(board[spot].pop());
		
		playAudio(emptyIndex);

		await moveStones(document.getElementById(12 - spot), document.getElementById(6));
	}
	if (user == false && spot < 13 && spot > 6 && (board[spot][1] == null || board[spot][1] == "")) {
		await moveStone(document.getElementById(spot), document.getElementById(13));
		emptyIndex = getNumStones(board[13]); // The number of stones also indicates the first empty slot.
		board[13].push(board[spot].pop());
		
		playAudio(emptyIndex);

		await moveStones(document.getElementById(12 - spot), document.getElementById(13));
	}

	activatePits();
}

/**
 * 
 * @param {Array.<Array.<String>>} thisBoard - The board used for the computer move.
 * @param {Number} moveSquare - The pit of the move.
 * @param {Boolean} tempUser - The active player, true for player one.
 * @param {Boolean} realUser - Whether the user is a real one or a simulated one.
 */
async function computerMove(thisBoard, moveSquare, tempUser, realUser) {
	const initialMoveSquare = moveSquare;
	
	// Move stones to temporary array.
	let toMove = thisBoard[moveSquare];
	thisBoard[moveSquare] = [];
	
	if ((user && realUser) || (!realUser && tempUser)) {
		// Move the stones.
		let emptyIndex;
		while (toMove.length > 0) {
			moveSquare++;
			if (moveSquare == (tempUser ? 6 : 13)) // This is backwards because I'm dumb?
				moveSquare++;
			if(moveSquare > 13)
				moveSquare = 0;
			
			emptyIndex = getNumStones(thisBoard[moveSquare]); // The number of stones also indicates the first empty slot.
			if (realUser) {
				await moveStone(document.getElementById(initialMoveSquare), document.getElementById(moveSquare));
				playAudio(emptyIndex);
			}
			thisBoard[moveSquare].push(toMove.pop());
		}
		// Computer ended in their cache. They have another turn. 
		if (moveSquare == 13) {
			if (realUser)
				user = !user;
			else
				tempUser = !tempUser;

		// Computer ended in an empty pit on their side of the board, so they get all of the stones from the opposite pit.
		} else if (moveSquare < 13 && moveSquare > 6 && (thisBoard[moveSquare][1] == null || thisBoard[moveSquare][1] == "")) {
			// TODO: Make it so these happen all at once. 
			emptyIndex = getNumStones(thisBoard[13]); // The number of stones also indicates the first empty slot.
			if (realUser) {
				await moveStone(document.getElementById(moveSquare), document.getElementById(13));
				playAudio(emptyIndex);
			}
			thisBoard[13].push(thisBoard[moveSquare].pop());

			if (realUser) {
				await moveStones(document.getElementById(12 - moveSquare), document.getElementById(13));
			} else {
				while (thisBoard[12 - moveSquare].length > 0) {
					thisBoard[13].push(thisBoard[12 - moveSquare].pop());
				}
			}
		}
		return;
	}
	// This is when we're simulating a player turn during recursion. 
	while (toMove.length > 0) {
		moveSquare++;
		if (moveSquare == (tempUser ? 13 : 6))
			moveSquare++;
		if(moveSquare > 13)
			moveSquare = 0;
		thisBoard[moveSquare].push(toMove.pop());
	}
	// The final stone ends in the cache, so the player gets another turn. 
	if (moveSquare == 6) {
		if (realUser)
			user = !user;
		else
			tempUser = !tempUser;
	}

	// Player ended in an empty pit on their side of the board, so they get all of the stones from the opposite pit.
	if (moveSquare < 6 && (thisBoard[moveSquare][1] == null || thisBoard[moveSquare][1] == "")) {
		
		// Move stones to temporary array.
		toMove = thisBoard[6 + moveSquare];
		thisBoard[6 + moveSquare] = [];
			
		// Move the last moved stone to the cache.
		thisBoard[6].push(thisBoard[moveSquare].pop());

		// Do the actual moving.
		while (toMove.length > 0) {
			thisBoard[6].push(toMove.pop());
		}
	}
}

/**
 * Clones the board to use in other calculations.
 * @param {Array.<Array.<String>>} theBoard 
 */
function copyBoard(theBoard) {
	let returnBoard = Array(theBoard.length);
	for (let i = 0; i < theBoard.length; i++){
		returnBoard[i] = theBoard[i].slice();
	}
	return returnBoard;
}

/**
 * Checks if a player's side of the board is empty.
 * @param {Array.<Array.<String>>} theBoard 
 * @param {Boolean} theUser - The active player, true for player one.
 */
function isEmpty(theBoard, theUser) {
	let i = 0;
	let max = 6;
	if (!theUser) {
		i = 7;
		max = 13;
	}
	for (i; i < max; i++) {
		if (theBoard[i][0] != null && theBoard[i][0] != "")
			return false;
	}
	return true;
}