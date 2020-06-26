var board = new Array(14);
var user = new Array(true);
var players;
var difficulty;
var scores =  Array(2);
scores[0] = 0;
scores[1] = 0;
var names = Array(2);

function showModal() {
    document.getElementById("ModalContainer").style.display = "block";  
}

function hideModal() {
    document.getElementById("ModalContainer").style.display = "None";
}

function initializeboard() {
//sets all the variables for the game then places the stones on the board with the drawBoard() function
	var temp;
	//these three lines set the "scoreboard"
	document.getElementById("player1").className = 'currentPlayer';
	for (var i = 0; i < 6; i++) {
		board[i] = new Array(15);
		for (var j = 0; j < 3; j++) {
			temp = Math.round(3 * Math.random());
			switch (temp) {
				case 0:
					board[i][j] = "blue";
					break;
				case 1:
					board[i][j] = "green";
					break;

				case 2:
					board[i][j] = "red";
					break;
				case 3:
					board[i][j] = "yellow";
					break;
				default:
					break;
			}
		}
	}
	board[6] = new Array(34);//right cache
	for (var i = 7; i < 13; i++) {
		board[i] = new Array(15);
		for (var j = 0; j < 3; j++) {
			temp = Math.round(3 * Math.random());
			switch(temp){
				case 0:
					board[i][j] = "blue";
					break;
				case 1:
					board[i][j] = "green";
					break;

				case 2:
					board[i][j] = "red";
					break;
				case 3:
					board[i][j] = "yellow";
					break;
				default:
					break;
			}
		}
	}
	board[13] = new Array(34);//left cache
	drawBoard();
}

function drawBoard() {
	// places or removes stones from the board
	for (var i = 0; i < 14; i++) {
		for (var j = 0; j < board[i].length; j++) {
			if (board[i][j] == "red" || board[i][j] == "green" || board[i][j] == "blue" || board[i][j] == "yellow") {
				document.getElementById("" + i + "." + j).style.backgroundImage = "url('" + board[i][j] + "_stone.png')";
			} else {
				document.getElementById("" + i + "." + j).style.backgroundImage = "url()";
			}
			document.getElementById("" + i + "." + j).style.transform = "";
		}
	}
}

function humanTurn(element){
	//this is called when a player clicks on a board square
	if (board[element.id][0] == null || board[element.id][0] == "") {
		return false;
	}
	moveStones(element);
}

function computerTurn() {
	var tempUser = Array(user.slice(0));
	var maxMoveVal;
	var moveVal;
	var move;
	var maxMove;
	var empty;
	var choice;
	user[0] = !user[0];
	while (user[0]) {
		drawBoard();
		maxMoveVal = -37;
		moveVal = -37;
		for (var i = 7; i < 13; i++) {
			if (board[i][0] != null && board[i][0] != "") {
				moveVal = computerTurnRecurse(copyBoard(board), i, 0, !user[0]);
				if(moveVal > maxMoveVal){
					maxMoveVal = moveVal;
					maxMove = i;
				}
				//alert("moveVal: " + moveVal);
			}
		}
		//alert("Moving " + maxMove + "   with maxVal: " + maxMoveVal);
		computerMove(board, maxMove, user, true);
		user[0] = !user[0];
		empty = isEmpty(board, !user[0]);
		if (empty) {
			if (getNumStones(board, 13) + getNumStones(board, 6) == 36) {
				return;
			} else {
				user[0] = !user[0];
				//setTimeout("computerTurn();", 12);
				//alert("It is still player 2's turn because player 1 has no legal moves.");
			}
		}
		drawBoard();
	}
	switchUser();
}

function computerTurnRecurse(tempBoard, move, level, temporUser) {
	var tempUser = Array(!temporUser);
	var maxMoveVal = 36;
	var moveVal = 36;
	var maxMove;
	var otherMaxMove;
	var empty = isEmpty(tempBoard, !temporUser);
	if (empty)
		tempUser[0] = !tempUser[0];
	empty = (empty && isEmpty(tempBoard, temporUser));
	if (tempBoard[move][0] != null && tempBoard[move][0] != "") {
		computerMove(tempBoard, move, tempUser, false);
		temporUser = tempUser[0];
		if (temporUser) {
			for (var i = 0; i < 6; i++) {
				if (level==difficulty || empty) {
					return (getNumStones(tempBoard, 13) - getNumStones(tempBoard, 6));
				}
				if (tempBoard[i][0] != null && tempBoard[i][0] != "") {
					moveVal = computerTurnRecurse(copyBoard(tempBoard), i, level + 1, temporUser);
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
			for (var i = 7; i < 13; i++) {
				if (level==difficulty || empty) {
					return (getNumStones(tempBoard, 13) - getNumStones(tempBoard, 6));
				}
				if (tempBoard[i][0] != null && tempBoard[i][0] != "") {
					moveVal = computerTurnRecurse(copyBoard(tempBoard), i, level + 1, temporUser);
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

function getNumStones(theBoard, elemNum) {
	for(var i = 0; theBoard[elemNum][i] != null && theBoard[elemNum][i] != ""; i++);
	return i;
}

function switchUser() {
	user[0] = !user[0];
	if (user[0]) {
		document.getElementById("player1").className = "currentPlayer";
		document.getElementById("player2").className = "";
		document.getElementById("playerone").style.visibility="visible";
		document.getElementById("playertwo").style.visibility="hidden";
	}
	if (!user[0]) {
		document.getElementById("player2").className = "currentPlayer";
		document.getElementById("player1").className = "";
		document.getElementById("playertwo").style.visibility="visible";
		document.getElementById("playerone").style.visibility="hidden";
	}

}

function setPlayers(howMany) {
	players = howMany;
	document.getElementById("startgame").innerHTML = "";
	document.getElementById("startgame").style.visiblity = "hidden";
	names[0] = prompt("What is your name (player 1)?");
	if (names[0] == null)
		names[0] = "Player 1";
	if (howMany == 1) {
		document.getElementById("difficulty").style.visibility = "visible";
		names[1] = "Computer";
	} else {
		document.getElementById("game").style.visibility = "visible";
		document.getElementById("difficulty").innerHTML = "";
		names[1] = prompt("What is your name (player 2)?");
		if (names[1] == null)
			names[1] = "Player 2";
	}
	document.getElementById("player1").innerHTML = "" + names[0] + ": " + scores[0];
	document.getElementById("player2").innerHTML = "" + names[1] + ": " + scores[1];
}

function setDifficulty(howHard) {
	difficulty = howHard;
	document.getElementById("difficulty").style.visiblity = "hidden";
	document.getElementById("difficulty").innerHTML = "";
	document.getElementById("game").style.visibility = "visible";
}

async function moveStones(element) {
	
	function getTransform(oldPit, newPit, oldIndex, newIndex) {

		function getYOffset(index) {
			if (Math.ceil(index / 2) % 2 == 0) { // Up/negative
				return Math.floor(index / 2) * 7.5;
			} else if (Math.ceil(index / 2) % 2 == 1) { // Down/Positive
				return 0 - (Math.floor(index / 2) + 1) * 7.5
			}
		}

		let xOffset, yOffset = 0;
		xOffset = 61 * (newPit - oldPit);
		xOffset -= ((newIndex % 2) - (oldIndex % 2)) * 15;
		
		yOffset = getYOffset(oldIndex) - getYOffset(newIndex);

		return "translate(" + xOffset + "px, " + yOffset + "px)"
	}
	
	if((user[0] == true && element.id < 6) || (user[0] == false && element.id > 6 && element.id != 13)) {
		var toMove = new Array(15);
		for (var i = 0; i < 15; i++) {
			toMove[i] = board[element.id][i];
			board[element.id][i] = "";
		}
		var i;
		var spot = element.id;

		for (let j = 0; toMove[j] != "" && toMove[j] != null; j++) {
			spot++;
			if (spot > 13)
				spot = 0;
			for (i = 0; i < board[spot].length; i++) {
				if (board[spot][i] == "" || board[spot][i] == null) {
					board[spot][i] = toMove[j];
					document.getElementById(element.id + "." + j).style.transform = getTransform(element.id, spot, j, i);
					i = board[spot].length;
				}
			}

			await new Promise(r => setTimeout(r, 300));
			//drawBoard();
		}
		if (spot == 6 && user[0] || spot == 13 && !user[0])
			switchUser();
		if (user[0] == true && spot < 6 && (board[spot][1] == null || board[spot][1] == "")) {
			for (var i = 0; i < 15; i++) {
				toMove[i] = board[12 - spot][i];
				board[12 - spot][i] = "";
			}
			var j = 0;
			for (i = 0; i < board[6].length; i++) {
				if (board[6][i] == "" || board[6][i] == null) {
					if (board[spot][0] != null && board[spot][0] != "") {
						board[6][i] = board[spot][0];
						board[spot][0] = "";
						i++;
					}
					board[6][i] = toMove[j];
					j++;
					if(toMove[j] == null || toMove[j] == "")
						i = board[6].length;
				}
			}
		}
		if (user[0] == false && spot < 13 && spot > 6 && (board[spot][1] == null || board[spot][1] == "")) {
			for (var i = 0; i < 15; i++) {
				toMove[i] = board[12 - spot][i];
				board[12 - spot][i] = "";
			}
			var j = 0;
			for (i = 0; i < board[13].length; i++) {
				if (board[13][i] == "" || board[13][i] == null) {
					if (board[spot][0] != null && board[spot][0] != "") {
						board[13][i] = board[spot][0];
						board[spot][0] = "";
						i++;
					}
					board[13][i] = toMove[j];
					j++;
					if (toMove[j] == null || toMove[j] == "")
						i = board[13].length;
				}
			}
		}
		switchUser();
		drawBoard();
	} else {
		return false;
	}
	scores[0] = 0;
	scores[1] = 0;
	for (var i = 0; i < 34; i++) {
		if(board[6][i] != null && board[6][i] != "")
			scores[0]++;
	}
	for (var i = 0; i < 34; i++) {
		if(board[13][i] != null && board[13][i] != "")
			scores[1]++;
	}
	document.getElementById("player1").innerHTML = "" + names[0] + ": " + scores[0];
	document.getElementById("player2").innerHTML = "" + names[1] + ": " + scores[1];
	if (scores[0] + scores[1] == 36) {
		var newOne;
		if (scores[0] > scores[1])
			newOne = confirm("" + names[0] + " wins!\n  Would you like a new game?");
		if (scores[0] < scores[1])
			newOne = confirm("" + names[1] + " wins!\n  Would you like a new game?");
		if (scores[0] == scores[1])
			newOne = confirm("The game is a tie!\n  Would you like a new game?");
		if (newOne)
			window.location.reload();
	} else {
		var empty;
		if (user[0]) {
			empty = isEmpty(board, user[0]);
			if (empty) {
				switchUser();
				alert("It is still " + names[1] + " turn because " + names[0] + " has no legal moves.");
			}
		}

		if (!user[0]) {
			empty = isEmpty(board, user[0]);
			if (empty) {
				switchUser();
				alert("It is still " + names[0] + "'s turn because " + names[1] + " has no legal moves.");
			}
		}
		
		if (players == 1 && !user[0]) {
			drawBoard();
			computerTurn();
			scores[0] = 0;
			scores[1] = 0;
			for (var i = 0; i < 34; i++) {
				if(board[6][i] != null && board[6][i] != "")
					scores[0]++;
			}
			for (var i = 0; i < 34; i++) {
				if(board[13][i] != null && board[13][i] != "")
					scores[1]++;
			}
			document.getElementById("player1").innerHTML = "" + names[0] + ": " + scores[0];
			document.getElementById("player2").innerHTML = "" + names[1] + ": " + scores[1];
			if (scores[0] + scores[1] == 36) {
				var newOne;
				if(scores[0] > scores[1])
					newOne = confirm("" + names[0] + " wins!\n  Would you like a new game?");
				if(scores[0] < scores[1])
					newOne = confirm("" + names[1] + " wins!\n  Would you like a new game?");
				if(scores[0] == scores[1])
					newOne = confirm("The game is a tie!\n  Would you like a new game?");
				if(newOne)
					window.location.reload();
			} else {
				if (user[0]) {
					empty = isEmpty(board, user[0]);
					if(empty){
						switchUser();
						alert("It is still " + names[1] + "'s turn because " + names[0] + " 1 has no legal moves.");
					}
				}
				if (!user[0]) {
					empty = isEmpty(board, user[0]);
					if (empty) {
						switchUser();
						alert("It is still " + names[0] + "'s turn because " + names[1] + " has no legal moves.");
					}
				}
			}
		}
	}
}

function computerMove(thisBoard, moveSquare, tempUser, realUser) {
	var toMove = new Array(15);
	for(var i = 0; i < 15; i++){
		toMove[i] = thisBoard[moveSquare][i];
		thisBoard[moveSquare][i] = "";
	}
	var j = 0;
	var i;
	if((user[0] && realUser) || (!realUser && tempUser[0])){
		while(toMove[j] != "" && toMove[j] != null){
			moveSquare++;
			if(moveSquare > 13)
				moveSquare = 0;
			for(i = 0; i < thisBoard[moveSquare].length; i++){
				if(thisBoard[moveSquare][i] == "" || thisBoard[moveSquare][i] == null){
					thisBoard[moveSquare][i] = toMove[j];
					i = board[moveSquare].length;
				}
			}
			j++;
		}
		if(moveSquare == 13){
			if(realUser)
				user[0] = !user[0];
			else
				tempUser[0] = !tempUser[0];
		}
		if(moveSquare < 13 && moveSquare > 6 && (thisBoard[moveSquare][1] == null || thisBoard[moveSquare][1] == "")){
			for(var i = 0; i < 15; i++){
				toMove[i] = thisBoard[12 - moveSquare][i];
				thisBoard[12 - moveSquare][i] = "";
			}
			var j = 0;
			for(i = 0; i < thisBoard[13].length; i++){
				if(thisBoard[13][i] == "" || thisBoard[13][i] == null){
					if(thisBoard[moveSquare][0] != null && thisBoard[moveSquare][0] != ""){
						thisBoard[13][i] = thisBoard[moveSquare][0];
						thisBoard[moveSquare][0] = "";
						i++;
					}
					thisBoard[13][i] = toMove[j];
					j++;
					if(toMove[j] == null || toMove[j] == "")
						i = thisBoard[13].length;
				}
			}
		}
		return;
	}
	while(toMove[j] != "" && toMove[j] != null){
		moveSquare++;
		if(moveSquare > 13)
			moveSquare = 0;
		for(i = 0; i < thisBoard[moveSquare].length; i++){
			if(thisBoard[moveSquare][i] == "" || thisBoard[moveSquare][i] == null){
				thisBoard[moveSquare][i] = toMove[j];
				i = board[moveSquare].length;
			}
		}
		j++;
	}
	if(moveSquare == 6){
		if(realUser)
			user[0] = !user[0];
		else
			tempUser[0] = !tempUser[0];
		}
		if(moveSquare < 6 && (thisBoard[moveSquare][1] == null || thisBoard[moveSquare][1] == "")){
		for(var i = 0; i < 15; i++){
			toMove[i] = thisBoard[12 - moveSquare][i];
			thisBoard[12 - moveSquare][i] = "";
		}
		var j = 0;
		for(i = 0; i < thisBoard[6].length; i++){
			if(thisBoard[6][i] == "" || thisBoard[6][i] == null){
				if(thisBoard[moveSquare][0] != null && thisBoard[moveSquare][0] != ""){
					thisBoard[6][i] = thisBoard[moveSquare][0];
					thisBoard[moveSquare][0] = "";
					i++;
				}
				thisBoard[6][i] = toMove[j];
				j++;
				if(toMove[j] == null || toMove[j] == "")
					i = thisBoard[6].length;
			}
		}
	}
}

function copyBoard(theBoard) {
	var returnBoard = Array(theBoard.length);
	for (var i = 0; i < theBoard.length; i++){
		returnBoard[i] = theBoard[i].slice();
	}
	return returnBoard;
}

function isEmpty(theBoard, theUser) {
	var i = 0;
	var max = 6;
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