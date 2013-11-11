/* todo */
// move piece

$(document).ready(function(){
	var container = $('#gammon-main'),
		boardModel = null,
		boardView = null,
		turn = null,
		rolled = null,
		dice = null,
		currentlySelected = null,
		highlighted = null,
		NUM_SLOTS = 24,
		NUM_SPOTS = 15;

/* random helper stuff */

	function random(start, end){
		return Math.floor(start + Math.random() * (end - start + 1));
	}

	function rollDie(){
		return random(1,6);
	}

	function rollDice(){
		playSound('roll');
		return [rollDie(), rollDie()];
	}

	function playSound(sound){
		$('#sfx_' + sound).get(0).play();
	}

/* view creators */

	function createBoardView(){
		var boardView = $($('#template-gammon-main').html()),
			forground = boardView.find('.board');

		function addSpots(div){
			for(var i = 0; i < NUM_SPOTS; i++){
				div.append($('<div class="spot"></div>').css('z-index', NUM_SPOTS - i));
			}
		}

		function createSlot(){
			var slot = $('<div class="slot"></div>');
			addSpots(slot);
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
			piece.append('<img src="images/' + player + '_tile_' + random(1,4) + '.png" />');
		}
		return piece;
	}

	function createMoveView(val, pos){
		return $('<div class="die die' + pos + '">' + val + '</div>');
	}

/* event handlers */

	function slotClickHandler(e){
		var index,
			moves,
			player = getCurrentPlayer(),
			distance,
			currentTarget = $(e.currentTarget);
		if(currentTarget.hasClass('exit')){
			index = currentTarget.hasClass('p1') ? NUM_SLOTS : -1;
		}else{
			index = boardView.find('.slot').index(currentTarget);
		}
		if(rolled){
			if(highlighted && (highlighted.indexOf(index) !== -1 || indexExitsBoard(index))){
				unhighlightMoves();
				distance = index - currentlySelected;
				if(enemySlot(index) && piecesOnSlot(index) === 1){
					sendToPergatory(index, player);
				}
				movePiece(currentlySelected, index);
				removeDistance(distance, dice);
				updateMoveView();
				unselectPiece();
				if(dice.length === 0){
					endTurn();
				}
			} else if (player === getPieceModel(index)){
				moves = getMoves(index, dice);
				selectPiece(index);
				highlightMoves(moves);
			}
		}
	}

	function pergatoryClickHandler(e){
		var player = getCurrentPlayer(),
			index = player === 'p1' ? -1 : NUM_SLOTS,
			currentTarget = $(e.currentTarget);
		if(currentTarget.hasClass(player)){
			if(rolled){
				moves = getMoves(index, dice);
				selectPiece(index);
				highlightMoves(moves);
			}
		}
	}

	function rollClickHandler(e){
		if(!rolled){
			rolled = true;
			dice = rollDice();

			if(rolledDouble(dice)){
				dice.push(dice[0], dice[1]);
			}

			container.find('.die1').html(dice[0]);
			container.find('.die2').html(dice[1]);
			updateMoveView();
		}
	}

/* view access */

	function getSpot(slotIndex, spotIndex){
		if(slotIndex === -1){
			return $($('.chamber.p1 .piece').get(0));
		} else if (slotIndex === NUM_SLOTS){
			return $($('.chamber.p2 .piece').get(0));
		} else {
			if(spotIndex === undefined){
				spotIndex = getSlotModel(slotIndex).length - 1;
			}
			return $(getSlot(slotIndex)
				.find('.spot:eq(' + ((NUM_SPOTS - 1) - spotIndex) + ')')
				.get(0));
		}
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

	function updateMoveView(){
		container.find('.moves').html('');
		for(var i = 0; i < dice.length; i++){
			container.find('.moves').append(createMoveView(dice[i], i));
		}
	}

	function highlightMoves(moves){
		var slot;
		if(highlighted !== null){
			unhighlightMoves(highlighted);
		}
		// moves = normalizeMoves(moves);
		for(var i = 0; i < moves.length; i++){
			if(indexExitsBoard(moves[i])){
				getExitSlot().toggleClass('highlighted', true);
			} else {
				slot = getSlot(moves[i]);
				if(!slot.hasClass('highlighted')){
					slot.toggleClass('highlighted', true)
						.append('<img class="slot-highlight" src="images/slot_selector.png" />');
				}
			}
		}
		highlighted = moves;
	}

	function unhighlightMoves(moves){
		if(!moves){
			moves = highlighted;
		}
		for(var i =0; i < moves.length; i++){
			if(indexExitsBoard(moves[i])){
				getExitSlot().toggleClass('highlighted', false);
			} else {
				getSlot(moves[i]).toggleClass('highlighted', false)
					.find('.slot-highlight')
					.remove();
			}
			highlighted = null;
		}
	}

	function getExitSlot(player){
		if(player === undefined){
			player = getCurrentPlayer();
		}
		return container.find('.exit.' + player);
	}

	function selectPiece(slotIndex){
		var piece;
		if(currentlySelected !== null && currentlySelected !== slotIndex){
			unselectPiece(currentlySelected);
		}
		currentlySelected = slotIndex;

		piece = getPiece(slotIndex);
		if(!piece.hasClass('selected')){
			piece.toggleClass('selected', true)
			.find('.piece')
			.append('<img class="highlight" src="images/' + getCurrentPlayer() + '_tile_selection.png" />');
		}
	}

	function unselectPiece(slotIndex){
		console.log('unselectPiece' + slotIndex);
		if(slotIndex === undefined){
			slotIndex = currentlySelected;
		}
		if(slotIndex !== null){
			getPiece(slotIndex).toggleClass('selected', false)
				.find('.highlight')
				.remove();
			currentlySelected = null;
		}
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

	function getOtherPlayer(){
		return 'p' + (((turn+1) % 2) + 1);
	}

/* model helpers */

	function enemySlot(index){
		if(!indexExitsBoard(index)){
			var player = getCurrentPlayer(),
				slotModel = getSlotModel(index);
			return (slotModel.length > 0 && slotModel[0] !== player);
		}
		return false;
	}

	function piecesOnSlot(index){
		return getSlotModel(index).length;
	}

	function indexExitsBoard(index){
		console.log(index);
		return index >= NUM_SLOTS || index < 0;
	}

	function removeDistance(distance, rolls){
		var moves = [],
			removes,
			i;

		if(turn % 2)
			distance *= -1;

		if(rolledDouble(rolls)){
			for(i = 0; i < rolls.length; i++){
				moves.push([rolls[0] * (i + 1), [0,(i + 1)]]);
			}
		} else {
			moves = [
				[rolls[0],[0,1]]
			];
			if(rolls.length > 1){
				moves.push(
					[rolls[1],[1,1]],
					[rolls[0]+rolls[1],[0,2]]
				);
			}
		}
		for(i = 0; i < moves.length; i++){
			if(moves[i][0] === distance){
				removes = moves[i][1];
				rolls = rolls.splice(removes[0],removes[1]);
			}
		}
	}

	function rolledDouble(rolls){
		return rolls[0] === rolls[1];
	}


	function normalizeMoves(moves, player){
		var ret = [];
		if(player === undefined){
			player = getCurrentPlayer();
		}
		for(var i = 0; i < moves.length; i++){
			ret.push(normalizeIndex(moves[i], player));
		}
		return ret;
	}

	function normalizeIndex(index, player){
		if(player === undefined){
			player = getCurrentPlayer();
		}
		if(player.indexOf('1') == -1){
			return NUM_SLOTS - 1 - index;
		}
		return index;
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
		rollClickHandler();
	}

	function addListeners(){
		container.find('.roll').click(rollClickHandler);
		container.find('.slot').click(slotClickHandler);
		container.find('.chamber').click(pergatoryClickHandler);
	}

	function endTurn(){
		rolled = false;
		unselectPiece();
		turn += 1;
		dice = null;
		highlighted = null;
		rollClickHandler();
		console.log('end turn');
	}

	function getMoves(index, rolls){
		var possibleMoves = [],
			slot,
			i,
			moves = [],
			move,
			player = getCurrentPlayer();

		function playerCanExit(){
			return true;
		}

		function pn(delta){
			if(turn % 2){
				return delta * -1;
			}
			return delta;
		}
		if(rolledDouble(rolls)){
			for(i = 1; i <= rolls.length; i++){
				possibleMoves.push(pn(rolls[0] * i) + index);
			}
		} else {
			possibleMoves.push(pn(rolls[0]) + index);
			if(rolls.length > 1){
				possibleMoves.push(pn(rolls[1]) + index, pn(rolls[0] + rolls[1]) + index);
			}
		}
		for(i = 0; i < possibleMoves.length; i++){
			move = possibleMoves[i];
			slot = getSlotModel(move) || [];
			pieceCount = slot.length;
			enemy = enemySlot(move);
			if(indexExitsBoard(move)){
				if(playerCanExit()){
					moves.push(move);
				}
			} else if(pieceCount === 0 || !enemy){
				moves.push(move);
			} else {
				if(pieceCount === 1 && enemy){
					moves.push(move);
				}
			}
		}
		return moves;
	}

	function _placePiece(index, player){
		var slotModel,
			piece;

		if(indexExitsBoard(index)){
			getExitSlot().append(createPieceView(player));
		} else {
			slotModel = getSlotModel(index);
			slotModel.push(player);
			piece = getSpot(index, slotModel.length - 1)
				.html(createPieceView(player));
			playSound('place');

		}
		return piece;
	}

	function placePiece(index, player){
		if(!player){
			player = getCurrentPlayer();
		}
		return _placePiece(index, player);
	}

	function removePiece(index, player){
		if(!player){
			player = getCurrentPlayer();
		}
		return _removePiece(index);
	}

	function _removePiece(index){
		var slotModel = getSlotModel(index),
			piece = getPiece(index).html('');
		if(slotModel)
			slotModel.pop();
		return piece;
	}

	function movePiece(slotIndex1, slotIndex2, player){
		if(!player){
			player = getCurrentPlayer();
		}
		removePiece(slotIndex1, player);
		placePiece(slotIndex2, player);
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
					placePiece(normalizeIndex(s[0], 'p' + p), 'p' + p);
				}
			}
		}
	}

	function sendToPergatory(index){
		_removePiece(index);
		console.log('send to pergatory ' + index);
		var enemy = getOtherPlayer();
		$('.pergatory .chamber.' + enemy).append(createPieceView(enemy));
	}
	playSound('music');
	newGame();
});