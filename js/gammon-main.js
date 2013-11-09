$(document).ready(function(){
	var container = $('#gammon-main'),
		boardModel,
		boardView,
		turn,
		rolled,
		NUM_SLOTS = 24;

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
			forground = boardView.find('.forground');

		function createSlot(){
			var slot = $('<div class="slot"></div>');
			for(var i = 0; i < 5; i++){
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

	/* game logic */
	function newGame(){
		turn = 0;
		rolled = false;
		boardView = createBoardView();
		boardModel = createBoardModel();
		startingPieces();
		$(container.find('.roll')).click(roll);
	}

	function roll(){
		var dice = roleDice();
		container.find('.die1').html(dice[0]);
		container.find('.die2').html(dice[1]);
	}

	function endTurn(){

	}

	function getSpot(slotIndex, spotIndex){
		return $(getSlot(slotIndex)
			.find('.spot:eq(' + (4 - spotIndex) + ')')
			.get(0));
	}

	function getSlot(slotIndex){
		return $(boardView
			.find('.slot:eq(' + slotIndex + ')')
			.get(0));
	}

	function getSlotModel(slotIndex){
		return boardModel[slotIndex];
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
		getSpot(index, slotModel.length - 1).html('');
	}

	function movePiece(slotIndex1, slotIndex2){
		// removePiece
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