/* todo */

$(document).ready(function(){
	var container = $('#gammon-main'),
		boardModel,
		boardView,
		turn,
		rolled,
		dice,
		currentlySelected,
		highlighted,
		NUM_SLOTS = 24,
		NUM_SPOTS = 15;

/* random helper stuff */

	function random(start, end){
		return Math.floor(start + Math.random() * (end - start + 1));
	}

	function roleDie(){
		return random(1,6);
	}

	function roleDice(){
		return [roleDie(), roleDie()];
	}

/* board initialize */

	function createBoardView(){
		var boardView = $($('#template-gammon-main').html()),
			forground = boardView.find('.board');

		function createSlot(){
			var slot = $('<div class="slot"></div>');
			for(var i = 0; i < NUM_SPOTS; i++){
				slot.append('<div class="spot"></div>');
			}
			return slot;
		}

		container.html(boardView);
		for(var i = 0; i < NUM_SLOTS; i++){
			forground.append(createSlot());
		}
		return forground;
	}

	function createBoardModel(){
		var board = [];
		for(var i = 0; i < NUM_SLOTS; i++ ){
			board.push([]);
		}
		return board;
	}

	function createPieceView(player){
		var piece = $($('#template-piece').html());
		if(player){
			piece.toggleClass(player, true);
		}
		return piece;
	}

/* event handlers */

	function slotClickHandler(e){
		var index = boardView.find('.slot').index(e.currentTarget),
			moves,
			slot = getPieceModel(index),
			player = getCurrentPlayer();
		if(rolled && player === slot){
			moves = getMoves(index, dice);
			selectPiece(index);
			highlightMoves(moves);
		}
	}

	function rollClickHandler(e){
		if(!rolled){
			rolled = true;
			dice = roleDice();
			container.find('.die1').html(dice[0]);
			container.find('.die2').html(dice[1]);
		}
	}

/* view access */

	function getSpot(slotIndex, spotIndex){
		if(spotIndex === undefined){
			spotIndex = getSlotModel(slotIndex).length - 1;
		}
		return $(getSlot(slotIndex)
			.find('.spot:eq(' + ((NUM_SPOTS - 1) - spotIndex) + ')')
			.get(0));
	}

	function getSlot(slotIndex){
		return $(boardView
			.find('.slot:eq(' + slotIndex + ')')
			.get(0));
	}

	function getPiece(slotIndex){
		return getSpot(slotIndex);
	}

/* view helpers */

	function highlightMoves(moves){
		if(highlighted !== null){
			unhighlightMoves(highlighted);
		}
		for(var i = 0; i < moves.length; i++){
			if(indexExitsBoard(moves[i])){
				getExitSlot(getCurrentPlayer()).toggleClass('highlighted', true);
			} else {
				getSlot(moves[i]).toggleClass('highlighted', true);
			}
		}
		highlighted = moves;
	}

	function unhighlightMoves(moves){
		for(var i =0; i < moves.length; i++){
			if(indexExitsBoard(moves[i])){
				getExitSlot(getCurrentPlayer()).toggleClass('highlighted', false);
			} else {
				getSlot(moves[i]).toggleClass('highlighted', false);
			}
		}
	}

	function getExitSlot(player){
		return container.find('.exit.' + player);
	}

/* model access */

	function getPieceModel(slotIndex){
		var slot = getSlotModel(slotIndex);
		return slot[slot.length - 1];
	}

	function getSlotModel(slotIndex){
		return boardModel[slotIndex];
	}

	function getCurrentPlayer(){
		return 'p' + ((turn % 2) + 1);
	}
/* model helpers */
	function indexExitsBoard(index){
		return index >= NUM_SLOTS || index < 0;
	}

/* game logic */
	function newGame(){
		turn = 0;
		rolled = false;
		currentlySelected = null;
		highlighted = null;
		boardView = createBoardView();
		boardModel = createBoardModel();
		startingPieces();
		addListeners();
	}

	function addListeners(){
		container.find('.roll').click(rollClickHandler);
		container.find('.slot').click(slotClickHandler);
	}

	function endTurn(){
		rolled = false;
		unselectPiece(currentlySelected);
		turn += 1;
		dice = null;
		highlighted = null;
	}

	function getMoves(index, rolls){
		var possibleMoves = [rolls[0] + index, rolls[1] + index, rolls[0] + rolls[1] + index],
			slot,
			i,
			enemyPiece,
			moves = [],
			move;

		function playerCanExit(){
			var player = getCurrentPlayer();
			return true;
		}
		if(rolls[0] == rolls[1]){
			possibleMoves = [rolls[0] + index, rolls[0] * 2 + index, rolls[0] * 3 + index, rolls[0] * 4 + index];
		}
		for(i = 0; i < possibleMoves.length; i++){
			move = possibleMoves[i];
			slot = getSlotModel(move) || [];
			pieceCount = slot.length;
			if(indexExitsBoard(move)){
				if(playerCanExit()){
					moves.push(move);
				}
			} else if(pieceCount === 0 ){
				moves.push(move);
			} else {
				enemyPiece = (slot[0] !== getCurrentPlayer());
				if(pieceCount === 1 && enemyPiece){
					moves.push(move);
				}
			}
		}
		return moves;
	}

	function playerIndex(index, player){
		if(player.indexOf('1') == -1){
			return NUM_SLOTS - 1 - index;
		}
		return index;
	}

	function _placePiece(index, player){
		var slotModel = getSlotModel(index),
			piece;

		slotModel.push(player);
		piece = getSpot(index, slotModel.length - 1)
			.html(createPieceView(player));
		return piece;
	}

	function placePiece(index, player){
		index = playerIndex(index, player);
		return _placePiece(index, player);
	}

	function removePiece(index, player){
		index = playerIndex(index, player);
		return _removePiece(index);
	}

	function _removePiece(index){
		var slotModel = getSlotModel(index);
		slotModel.pop();
		return getPiece(index).html('');
	}

	function selectPiece(slotIndex){
		if(currentlySelected !== null){
			unselectPiece(currentlySelected);
		}
		currentlySelected = slotIndex;
		getPiece(slotIndex).toggleClass('selected', true);
	}

	function unselectPiece(slotIndex){
		getPiece(slotIndex).toggleClass('selected', false);
		currentlySelected = null;
	}

	function movePiece(player, slotIndex1, slotIndex2){
		// removePiece
		// place piece
	}

	function startingPieces(){
		var startingLocations = [[0,2], [11,5], [16,3], [18,5]],
			s,
			i,
			j,
			p;
		for(p = 1; p < 3; p++){
			for(i = 0; i < startingLocations.length; i++){
				s = startingLocations[i]; // s[0] index s[1] num pieces
				for(j = 0; j < s[1]; j++){
					placePiece(s[0], 'p' + p);
				}
			}
		}
	}
	newGame();

});