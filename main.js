const readline = require('readline');
const fs = require('fs');

var wordListUnparsed = fs.readFileSync('Collins Scrabble Words (2019).txt');
var wordList = wordListUnparsed.toString().split("\r\n");
const board = [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]];
var tempBoard;
var hasPlaced = false;
const twoLetters = 
"AA AB AD AE AG AH AI AL AM AN AR AS AT AW AX AY BA BE BI BO BY DA DE DO ED EF EH EL EM EN ER ES ET EW EX FA FE GI GO HA\n" +
"HE HI HM HO ID IF IN IS IT JO KA KI LA LI LO MA ME MI MM MO MU MY NA NE NO NU OD OE OF OH OI OK OM ON OP OR OS OW OX OY\n" +
"PA PE PI PO QI RE SH SI SO TA TE TI TO UH UM UN UP US UT WE WO XI XU YA YE YO ZA";
const tileList = "AAAAAAAAABBCCDDDDEEEEEEEEEEEEFFGGGHHIIIIIIIIIJKLLLLMMNNNNNNOOOOOOOOPPQRRRRRRSSSSTTTTTTUUUUVVWWXYYZ$%"; //$,% = blank tile
//const tileList = "AAHHAAHHAAHHAAHHAAHHAAHH";
const tileLookup = {A:1,B:3,C:3,D:2,E:1,F:4,G:2,H:4,I:1,J:8,K:5,L:1,M:3,N:1,O:1,P:3,Q:10,R:1,S:1,T:1,U:1,V:4,W:4,X:8,Y:4,Z:10,'$':0,'%':0,' ':' ',
    '\u001b[41;31m \u001b[0m':' ','\u001b[43;33m \u001b[0m':' ','\u001b[46;36m \u001b[0m':' ','\u001b[42;32m \u001b[0m':' ','undefined':' ',
    '\u001b[100;33mA\u001b[0m':0,'\u001b[100;33mB\u001b[0m':0,'\u001b[100;33mC\u001b[0m':0,'\u001b[100;33mD\u001b[0m':0,'\u001b[100;33mE\u001b[0m':0,
    '\u001b[100;33mF\u001b[0m':0,'\u001b[100;33mG\u001b[0m':0,'\u001b[100;33mH\u001b[0m':0,'\u001b[100;33mI\u001b[0m':0,'\u001b[100;33mJ\u001b[0m':0,
    '\u001b[100;33mK\u001b[0m':0,'\u001b[100;33mL\u001b[0m':0,'\u001b[100;33mM\u001b[0m':0,'\u001b[100;33mN\u001b[0m':0,'\u001b[100;33mO\u001b[0m':0,
    '\u001b[100;33mP\u001b[0m':0,'\u001b[100;33mQ\u001b[0m':0,'\u001b[100;33mR\u001b[0m':0,'\u001b[100;33mS\u001b[0m':0,'\u001b[100;33mT\u001b[0m':0,
    '\u001b[100;33mU\u001b[0m':0,'\u001b[100;33mV\u001b[0m':0,'\u001b[100;33mW\u001b[0m':0,'\u001b[100;33mX\u001b[0m':0,'\u001b[100;33mY\u001b[0m':0,
    '\u001b[100;33mZ\u001b[0m':0};
const specialTileLookup = { // for word validity, it was checking this entire string and not just the letter -> index 9
    '\u001b[100;33mA\u001b[0m':'A','\u001b[100;33mB\u001b[0m':'B','\u001b[100;33mC\u001b[0m':'C','\u001b[100;33mD\u001b[0m':'D','\u001b[100;33mE\u001b[0m':'E',
    '\u001b[100;33mF\u001b[0m':'F','\u001b[100;33mG\u001b[0m':'G','\u001b[100;33mH\u001b[0m':'H','\u001b[100;33mI\u001b[0m':'I','\u001b[100;33mJ\u001b[0m':'J',
    '\u001b[100;33mK\u001b[0m':'K','\u001b[100;33mL\u001b[0m':'L','\u001b[100;33mM\u001b[0m':'M','\u001b[100;33mN\u001b[0m':'N','\u001b[100;33mO\u001b[0m':'O',
    '\u001b[100;33mP\u001b[0m':'P','\u001b[100;33mQ\u001b[0m':'Q','\u001b[100;33mR\u001b[0m':'R','\u001b[100;33mS\u001b[0m':'S','\u001b[100;33mT\u001b[0m':'T',
    '\u001b[100;33mU\u001b[0m':'U','\u001b[100;33mV\u001b[0m':'V','\u001b[100;33mW\u001b[0m':'W','\u001b[100;33mX\u001b[0m':'X','\u001b[100;33mY\u001b[0m':'Y',
    '\u001b[100;33mZ\u001b[0m':'Z'}
var player1 = [];
var player2 = [];
var p1Points = 0;
var p2Points = 0;
var placedTiles = [];
var placedTilePositioning = [];
const colors = ["100;37m", "100;37m", "100;90m","100;30m", "100;33m"];
const specialTiles = [
    ["0000","0007","0014","0700","0714","1400","1407","1414"], //triple word
    ["0101","0202","0303","0404","0707","1010","1111","1212","1313","0113","0212","0311","0410","1004","1103","1202","1301"], //double word
    ["0105","0109","0501","0505","0509","0513","0901","0905","0909","0913","1305","1309"], //triple letter
    ["0003","0011","0206","0208","0300","0307","0314","0602","0606","0608","0612",
        "0703","0711","0802","0806","0808","0812","1100","1107","1114","1206","1208","1403","1411"] //double letter
];

// function initBoardFun(board){
//     const temp = "ABCDEFGHIJKLMNOPQRSTUVWXYZ                        ";
//     for(let i = 0; i < 15; i++){
//         for(let j = 0; j < 15; j++){
//             var rand = Math.floor(Math.random() * 50);
//             board[i].push(temp.slice(rand,rand+1));
//         }
//     }
// }

function initBoard(board){
    for(let i = 0; i < 15; i++){
        for(let j = 0; j < 15; j++){
            var doubleWord = '\u001b[' + "41;31m" + " " + '\u001b[0m';
            var tripleWord = '\u001b[' + "43;33m" + " " + '\u001b[0m';
            var doubleLetter = '\u001b[' + "46;36m" + " " + '\u001b[0m';
            var tripleLetter = '\u001b[' + "42;32m" + " " + '\u001b[0m';
            var specialTileColor = [tripleWord,doubleWord,tripleLetter,doubleLetter];
            var special = false;
            for(var k = 0; k < specialTiles.length; k++){
                var check = i.toString().padStart(2,"0") + j.toString().padStart(2,"0");
                if(specialTiles[k].includes(check)){
                    board[i].push(specialTileColor[k]);
                    special = true;
                }
            }

            if(!special) board[i].push(" ");
        }
    }
}

function initBag(tileList){
    const bag = [];
    for(var i = 0; i < tileList.length; i++){
        bag.push(tileList[i]);
    }
    return bag;
}

function initPlayers(bag){
    var whosFirst = 0;
    var p1, p2;
    if(whosFirst == 0) {p1 = player1; p2 = player2;}
    else {p1 = player2; p2 = player1;}
    while(p1.length < 7){
        if(bag.length == 0) return;
        var randomTileNum = Math.floor(Math.random() * bag.length);
        var randomTile = bag.splice(randomTileNum,1)[0];
        p1.push(randomTile);
    }
    while(p2.length < 7){
        if(bag.length == 0) return;
        var randomTileNum = Math.floor(Math.random() * bag.length);
        var randomTile = bag.splice(randomTileNum,1)[0];
        p2.push(randomTile);
    }
}

function takeTiles(bag, player){
    while(player.length < 7){
        if(bag.length == 0) return;
        var randomTileNum = Math.floor(Math.random() * bag.length);
        var randomTile = bag.splice(randomTileNum,1)[0];
        player.push(randomTile);
    }
}

function printTileRack(myTurn, playerNum){
    var rack = '\u001b[' + colors[0] + "".padEnd(98) + '\u001b[0m' + "\r\n";
    rack += '\u001b[' + colors[0] + ("Player  " + (playerNum+1)).padStart(53).padEnd(98) + '\u001b[0m' + "\r\n";
    rack += '\u001b[' + colors[0] + "                           +-----+-----+-----+-----+-----+-----+-----+ " + '\u001b[0m' +
        '\u001b[' + colors[3] + "|   Player 1: ".padStart(18) + p1Points.toString().padEnd(4) + "|".padEnd(5) + '\u001b[0m' + "\r\n";
    rack += '\u001b[' + colors[0] + "                           |" + '\u001b[0m';
    for(let i = 0; i < 7; i++){
        var rackFiller = myTurn[i] == undefined ? " " : myTurn[i];
        rack += '\u001b[' + colors[2] + "  " + '\u001b[0m' + '\u001b[' + colors[1] + rackFiller + '\u001b[0m' + '\u001b[' + colors[3] + 
            tileLookup[myTurn[i]].toString().padStart(2) + '\u001b[0m' + '\u001b[' + colors[0] + "|" + '\u001b[0m';
        if(i == 6) rack += '\u001b[' + colors[0] + " " + '\u001b[0m' +
        '\u001b[' + colors[3] + "|   Player 2: ".padStart(18) + p2Points.toString().padEnd(4) + "|".padEnd(5) + '\u001b[0m';
    }
    var bagFiller = (bag.length >= 10) ? "  |" : "   |";
    var bagPadding = (bag.length >= 10) ? "" : " ";
    return rack + "\r\n" + '\u001b[' + colors[0] + "                           +-----+-----+-----+-----+-----+-----+-----+ " + '\u001b[0m' +
        '\u001b[' + colors[3] + "| Tiles Left: ".padStart(18) + bag.length + bagFiller.padEnd(7) + bagPadding + '\u001b[0m';
}

// takes in a 2x2 array of tiles and creates a string
// version of the board with the tiles included 
function printBoard(board){
    var strBoard = '\u001b[' + colors[3] + "      0     1     2     3     4     5     6     7     8     9    1 0   1 1   1 2   1 3   1 4      \r\n" + '\u001b[0m';
    for(let i = 0; i < 15; i++){
        if(i == 0){
            strBoard += '\u001b[' + colors[0] + "   +-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+    " + 
            '\u001b[0m' + "\r\n";
        }
        strBoard += '\u001b[' + colors[3] + i.toString().padEnd(2) + '\u001b[0m' + '\u001b[' + colors[0] + " |" + '\u001b[0m';
        for(let j = 0; j < 15; j++){
            var spaceColor = board[i][j] == "   " ? colors[2] : colors[1];
            var tempLookup = tileLookup[board[i][j]] == undefined ? " 0" : tileLookup[board[i][j]];
            strBoard += '\u001b[' + spaceColor + "  " + '\u001b[0m' + '\u001b[' + colors[1] + board[i][j] + '\u001b[0m' + '\u001b[' + colors[3] +
            tempLookup.toString().padStart(2) + '\u001b[0m' + '\u001b[' + colors[0] + "|" + '\u001b[0m';
             if(j == 14) strBoard += '\u001b[' + colors[3] + " " + i.toString().padEnd(3) + '\u001b[0m';
        }
        strBoard += "\r\n" + '\u001b[' + colors[0] + "   +-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+    " +
         '\u001b[0m' + "\r\n";
    }
    strBoard += '\u001b[' + colors[3] + "      0     1     2     3     4     5     6     7     8     9    1 0   1 1   1 2   1 3   1 4      " + '\u001b[0m'

    return strBoard;
}

function printTurn(elements){
    for(var i = 0; i < elements.length; i++){
        console.log(elements[i]);
    }
}

function areTilesConnected(placedTilePositioning, board){
    if(placedTilePositioning.length < 1) return false;
    if(placedTilePositioning.length == 1) return true;

    var x = placedTilePositioning[0].x;
    var y = placedTilePositioning[0].y;
    var x2 = placedTilePositioning[1].x;
    var y2 = placedTilePositioning[1].y;
    var dir;
    var index;
    if(x == x2) {dir = 0;}
    else if(y == y2) {dir = 1;}
    else return false;

    placedTilePositioning.sort((m1,m2) => { 
        if(dir == 0){
            if(m1.y == m2.y) return 0;
            return m1.y < m2.y ? -1 : 1;
        }
        else{
            if(m1.x == m2.x) return 0;
            return m1.x < m2.x ? -1 : 1;
        }
    });

    x = placedTilePositioning[0].x;
    y = placedTilePositioning[0].y;
    x2 = placedTilePositioning[1].x;
    y2 = placedTilePositioning[1].y;
    index = (dir == 0) ? placedTilePositioning[0].y : placedTilePositioning[0].x;

    for(var i = 1; i < placedTilePositioning.length; i++){
        if(dir == 0){
            if(placedTilePositioning[i].x != x) return false;
            if(placedTilePositioning[i].y - index > 1){
                // console.log("Gap check h")
                for(var j = index+1; j < placedTilePositioning[i].y; j++){
                    if(!(tileList.includes(board[x][j]) || specialTileLookup[board[x][j]] != undefined)) return false;// && specialTileLookup[board[x][j]] == undefined
                }
            } 
            index = placedTilePositioning[i].y;
        }
        else if(dir == 1){
            if(placedTilePositioning[i].y != y) return false;
            if(placedTilePositioning[i].x - index > 1){
                // console.log("Gap check v")
                for(var j = index+1; j < placedTilePositioning[i].x; j++){
                    if(!(tileList.includes(board[j][y]) || specialTileLookup[board[j][y]] != undefined)) return false;// && specialTileLookup[board[j][y]] == undefined
                }
            }
            index = placedTilePositioning[i].x;
        }
        else return false;
    }
    return true;
}

function checkEqual(tilePos, placedTilePositioning){
    for(var i = 0; i < placedTilePositioning.length; i++){
        if(Object.is(tilePos.x,placedTilePositioning[i].x) && Object.is(tilePos.y,placedTilePositioning[i].y)) return false;
    }
    return true;
}

function isBoardConnected(placedTilePositioning, tileList, turnNum, board){
    if(turnNum == 0){
        for(let i = 0; i < placedTilePositioning.length; i++){
            if(placedTilePositioning[i].x == 7 && placedTilePositioning[i].y == 7) return true;
        }
        return false;
    }
    for(let i = 0; i < placedTilePositioning.length; i++){
        // for(let j = 0; j < 4; j ++){
            //if(j == 0) {
                if(placedTilePositioning[i].x != 0){ //up
                // console.log(board[placedTilePositioning[i].x-1][placedTilePositioning[i].y])
                if(tileList.includes(board[placedTilePositioning[i].x-1][placedTilePositioning[i].y]) || 
                    specialTileLookup[board[placedTilePositioning[i].x-1][placedTilePositioning[i].y]] != undefined){
                    if(checkEqual({x:placedTilePositioning[i].x-1,y:placedTilePositioning[i].y}, placedTilePositioning)) return true;
                }}
            // }
            // if(j == 1) {
                if(placedTilePositioning[i].y != 0){ //left
                // console.log(board[placedTilePositioning[i].x][placedTilePositioning[i].y-1])
                if(tileList.includes(board[placedTilePositioning[i].x][placedTilePositioning[i].y-1]) || 
                    specialTileLookup[board[placedTilePositioning[i].x][placedTilePositioning[i].y-1]] != undefined){
                    if(checkEqual({x:placedTilePositioning[i].x,y:placedTilePositioning[i].y-1}, placedTilePositioning)) return true;
                }}
            // }
            // if(j == 2) {
                if(placedTilePositioning[i].x != 14){ //down
                // console.log(board[placedTilePositioning[i].x+1][placedTilePositioning[i].y])
                if(tileList.includes(board[placedTilePositioning[i].x+1][placedTilePositioning[i].y]) || 
                    specialTileLookup[board[placedTilePositioning[i].x+1][placedTilePositioning[i].y]] != undefined){
                    if(checkEqual({x:placedTilePositioning[i].x+1,y:placedTilePositioning[i].y}, placedTilePositioning)) return true;
                }}
            // }
            // if(j == 3) {
                if(placedTilePositioning[i].y != 14){ //right
                // console.log(board[placedTilePositioning[i].x][placedTilePositioning[i].y+1])
                if(tileList.includes(board[placedTilePositioning[i].x][placedTilePositioning[i].y+1]) || 
                    specialTileLookup[board[placedTilePositioning[i].x][placedTilePositioning[i].y+1]] != undefined){
                    if(checkEqual({x:placedTilePositioning[i].x,y:placedTilePositioning[i].y+1}, placedTilePositioning)) return true;
                }}
            // }
        // }
    }
    
    return false;
}

function isBoardValid(tileList, board, turnNum){
    const invalidWords = [];
    var wordCheck = "";
    if(turnNum == 0 && !tileList.includes(board[6][7]) && !tileList.includes(board[8][7]) && 
        !tileList.includes(board[7][6]) && !tileList.includes(board[7][8]) &&
        specialTileLookup[board[6][7]] == undefined && specialTileLookup[board[8][7]] == undefined &&
        specialTileLookup[board[7][6]] == undefined && specialTileLookup[board[7][8]] == undefined) {
            console.log("One letter words aren't allowed.");
            return [board[7][7]];
    }
    for(var i = 0; i < board.length; i++){
        wordCheck = "";
        for(var j = 0; j < board[i].length; j++){
            if((tileList.includes(board[i][j]) || specialTileLookup[board[i][j]] != undefined)){
                if(specialTileLookup[board[i][j]])
                    wordCheck += specialTileLookup[board[i][j]];
                else wordCheck += board[i][j];
            }
            else{
                if(wordCheck.length > 1){
                    if(!wordList.includes(wordCheck)) invalidWords.push(wordCheck);
                }
                wordCheck = "";
            }
            if(j == 14) if(wordCheck.length > 1) if(!wordList.includes(wordCheck)) invalidWords.push(wordCheck);
        }
    }

    for(var i = 0; i < board.length; i++){
        wordCheck = "";
        for(var j = 0; j < board[i].length; j++){
            if((tileList.includes(board[j][i]) || specialTileLookup[board[j][i]] != undefined)){
                if(specialTileLookup[board[j][i]])
                    wordCheck += specialTileLookup[board[j][i]];
                else wordCheck += board[j][i];
            }
            else{
                if(wordCheck.length > 1){
                    if(!wordList.includes(wordCheck)) invalidWords.push(wordCheck);
                }
                wordCheck = "";
            }
            if(j == 14) if(wordCheck.length > 1) if(!wordList.includes(wordCheck)) invalidWords.push(wordCheck);
        }
    }
    return invalidWords;
}

// handle special board spaces: padstart2 i + j -> special tiles contains? handle appropriately
function tallyPoints(tileList, board, placedTilePositioning){
    var wordCheck = "";
    var wordCheckPos = [];
    var blanks = {x: -1, y: -1};
    var blanks2 = {x: -1, y: -1};
    var points = 0;
    var multiplier = 1;
    for(let i = 0; i < board.length; i++){
        wordCheck = "";
        wordCheckPos = [];
        blanks = {x: -1, y: -1};
        blanks2 = {x: -1, y: -1};
        for(let j = 0; j < board[i].length; j++){
            if((tileList.includes(board[i][j]) || specialTileLookup[board[i][j]] != undefined)){
                if(specialTileLookup[board[i][j]]){
                    wordCheck += specialTileLookup[board[i][j]];
                    if(blanks.x == -1) blanks = {x: i, y: j};
                    else blanks2 = {x: i, y: j}
                }
                else wordCheck += board[i][j];
                wordCheckPos.push({x: i, y: j});
            }
            else{
                if(wordCheck.length > 1){
                    if(wordList.includes(wordCheck)){
                        var isNewWord = false;
                        for(let k = 0; k < wordCheckPos.length; k++){
                            for(let m = 0; m < placedTilePositioning.length; m++){
                                if(Object.is(wordCheckPos[k].x,placedTilePositioning[m].x) && Object.is(wordCheckPos[k].y,placedTilePositioning[m].y)){
                                    isNewWord = true;
                                    break;
                                }
                            }
                            if(isNewWord) break;
                        }
                        if(isNewWord){
                            var tempPoints = 0;
                            for(let k = 0; k < wordCheck.length; k++){
                                if((Object.is(blanks.x,wordCheckPos[k].x) && Object.is(blanks.y,wordCheckPos[k].y)) || 
                                    (Object.is(blanks2.x,wordCheckPos[k].x) && Object.is(blanks2.y,wordCheckPos[k].y))) tempPoints += 0;
                                else tempPoints += tileLookup[wordCheck[k]];
                                var specialCheck = "" + wordCheckPos[k].x.toString().padStart(2,'0') + wordCheckPos[k].y.toString().padStart(2,'0');
                                if(specialTiles[0].includes(specialCheck)){
                                    multiplier *= 3;
                                }
                                if(specialTiles[1].includes(specialCheck)){
                                    multiplier *= 2;
                                }
                                if(specialTiles[2].includes(specialCheck)){
                                    if((Object.is(blanks.x,wordCheckPos[k].x) && Object.is(blanks.y,wordCheckPos[k].y)) || 
                                        (Object.is(blanks2.x,wordCheckPos[k].x) && Object.is(blanks2.y,wordCheckPos[k].y))) tempPoints += 0;
                                    else tempPoints += tileLookup[wordCheck[k]] * 2;
                                }
                                if(specialTiles[3].includes(specialCheck)){
                                    if((Object.is(blanks.x,wordCheckPos[k].x) && Object.is(blanks.y,wordCheckPos[k].y)) || 
                                        (Object.is(blanks2.x,wordCheckPos[k].x) && Object.is(blanks2.y,wordCheckPos[k].y))) tempPoints += 0;
                                    else tempPoints += tileLookup[wordCheck[k]];
                                }
                            }
                            points += tempPoints * multiplier;
                            if(placedTilePositioning.length == 7) points += 50;
                            multiplier = 1;
                        }
                    }
                }
                wordCheck = "";
                wordCheckPos = [];
                blanks = {x: -1, y: -1};
                blanks2 = {x: -1, y: -1};
            }
            if(j == 14){
                if(wordCheck.length > 1){
                    if(wordList.includes(wordCheck)){
                        var isNewWord = false;
                        for(let k = 0; k < wordCheckPos.length; k++){
                            for(let m = 0; m < placedTilePositioning.length; m++){
                                if(Object.is(wordCheckPos[k].x,placedTilePositioning[m].x) && Object.is(wordCheckPos[k].y,placedTilePositioning[m].y)){
                                    isNewWord = true;
                                    break;
                                }
                            }
                            if(isNewWord) break;
                        }
                        if(isNewWord){
                            var tempPoints = 0;
                            for(let k = 0; k < wordCheck.length; k++){
                                if((Object.is(blanks.x,wordCheckPos[k].x) && Object.is(blanks.y,wordCheckPos[k].y)) || 
                                    (Object.is(blanks2.x,wordCheckPos[k].x) && Object.is(blanks2.y,wordCheckPos[k].y))) tempPoints += 0;
                                else tempPoints += tileLookup[wordCheck[k]];
                                var specialCheck = "" + wordCheckPos[k].x.toString().padStart(2,'0') + wordCheckPos[k].y.toString().padStart(2,'0');
                                if(specialTiles[0].includes(specialCheck)){
                                    multiplier *= 3;
                                }
                                if(specialTiles[1].includes(specialCheck)){
                                    multiplier *= 2;
                                }
                                if(specialTiles[2].includes(specialCheck)){
                                    if((Object.is(blanks.x,wordCheckPos[k].x) && Object.is(blanks.y,wordCheckPos[k].y)) || 
                                        (Object.is(blanks2.x,wordCheckPos[k].x) && Object.is(blanks2.y,wordCheckPos[k].y))) tempPoints += 0;
                                    else tempPoints += tileLookup[wordCheck[k]] * 2;
                                }
                                if(specialTiles[3].includes(specialCheck)){
                                    if((Object.is(blanks.x,wordCheckPos[k].x) && Object.is(blanks.y,wordCheckPos[k].y)) || 
                                        (Object.is(blanks2.x,wordCheckPos[k].x) && Object.is(blanks2.y,wordCheckPos[k].y))) tempPoints += 0;
                                    else tempPoints += tileLookup[wordCheck[k]];
                                }
                            }
                            points += tempPoints * multiplier;
                            if(placedTilePositioning.length == 7) points += 50;
                            multiplier = 1;
                        }
                    }
                }
            }
        }
    }

    for(let i = 0; i < board.length; i++){
        wordCheck = "";
        wordCheckPos = [];
        blanks = {x: -1, y: -1};
        blanks2 = {x: -1, y: -1};
        for(let j = 0; j < board[i].length; j++){
            if((tileList.includes(board[j][i]) || specialTileLookup[board[j][i]] != undefined)){
                if(specialTileLookup[board[j][i]]){
                    wordCheck += specialTileLookup[board[j][i]];
                    if(blanks.x == -1) blanks = {x: j, y: i};
                    else blanks2 = {x: j, y: i}
                }
                else wordCheck += board[j][i];
                wordCheckPos.push({x: j, y: i});
            }
            else{
                if(wordCheck.length > 1){
                    if(wordList.includes(wordCheck)){
                        var isNewWord = false;
                        for(let k = 0; k < wordCheckPos.length; k++){
                            for(let m = 0; m < placedTilePositioning.length; m++){
                                if(Object.is(wordCheckPos[k].x,placedTilePositioning[m].x) && Object.is(wordCheckPos[k].y,placedTilePositioning[m].y)){
                                    isNewWord = true;
                                    break;
                                }
                            }
                            if(isNewWord) break;
                        }
                        if(isNewWord){
                            var tempPoints = 0;
                            for(let k = 0; k < wordCheck.length; k++){
                                if((Object.is(blanks.x,wordCheckPos[k].x) && Object.is(blanks.y,wordCheckPos[k].y)) || 
                                    (Object.is(blanks2.x,wordCheckPos[k].x) && Object.is(blanks2.y,wordCheckPos[k].y))) tempPoints += 0;
                                else tempPoints += tileLookup[wordCheck[k]];
                                var specialCheck = "" + wordCheckPos[k].x.toString().padStart(2,'0') + wordCheckPos[k].y.toString().padStart(2,'0');
                                if(specialTiles[0].includes(specialCheck)){
                                    multiplier *= 3;
                                }
                                if(specialTiles[1].includes(specialCheck)){
                                    multiplier *= 2;
                                }
                                if(specialTiles[2].includes(specialCheck)){
                                    if((Object.is(blanks.x,wordCheckPos[k].x) && Object.is(blanks.y,wordCheckPos[k].y)) || 
                                        (Object.is(blanks2.x,wordCheckPos[k].x) && Object.is(blanks2.y,wordCheckPos[k].y))) tempPoints += 0;
                                    else tempPoints += tileLookup[wordCheck[k]] * 2;
                                }
                                if(specialTiles[3].includes(specialCheck)){
                                    if((Object.is(blanks.x,wordCheckPos[k].x) && Object.is(blanks.y,wordCheckPos[k].y)) || 
                                        (Object.is(blanks2.x,wordCheckPos[k].x) && Object.is(blanks2.y,wordCheckPos[k].y))) tempPoints += 0;
                                    else tempPoints += tileLookup[wordCheck[k]];
                                }
                            }
                            points += tempPoints * multiplier;
                            if(placedTilePositioning.length == 7) points += 50;
                            multiplier = 1;
                        }
                    }
                }
                wordCheck = "";
                wordCheckPos = [];
                blanks = {x: -1, y: -1};
                blanks2 = {x: -1, y: -1};
            }
            if(j == 14){
                if(wordCheck.length > 1){
                    if(wordList.includes(wordCheck)){
                        var isNewWord = false;
                        for(let k = 0; k < wordCheckPos.length; k++){
                            for(let m = 0; m < placedTilePositioning.length; m++){
                                if(Object.is(wordCheckPos[k].x,placedTilePositioning[m].x) && Object.is(wordCheckPos[k].y,placedTilePositioning[m].y)){
                                    isNewWord = true;
                                    break;
                                }
                            }
                            if(isNewWord) break;
                        }
                        if(isNewWord){
                            var tempPoints = 0;
                            for(let k = 0; k < wordCheck.length; k++){
                                if((Object.is(blanks.x,wordCheckPos[k].x) && Object.is(blanks.y,wordCheckPos[k].y)) || 
                                    (Object.is(blanks2.x,wordCheckPos[k].x) && Object.is(blanks2.y,wordCheckPos[k].y))) tempPoints += 0;
                                else tempPoints += tileLookup[wordCheck[k]];
                                var specialCheck = "" + wordCheckPos[k].x.toString().padStart(2,'0') + wordCheckPos[k].y.toString().padStart(2,'0');
                                if(specialTiles[0].includes(specialCheck)){
                                    multiplier *= 3;
                                }
                                if(specialTiles[1].includes(specialCheck)){
                                    multiplier *= 2;
                                }
                                if(specialTiles[2].includes(specialCheck)){
                                    if((Object.is(blanks.x,wordCheckPos[k].x) && Object.is(blanks.y,wordCheckPos[k].y)) || 
                                        (Object.is(blanks2.x,wordCheckPos[k].x) && Object.is(blanks2.y,wordCheckPos[k].y))) tempPoints += 0;
                                    else tempPoints += tileLookup[wordCheck[k]] * 2;
                                }
                                if(specialTiles[3].includes(specialCheck)){
                                    if((Object.is(blanks.x,wordCheckPos[k].x) && Object.is(blanks.y,wordCheckPos[k].y)) || 
                                        (Object.is(blanks2.x,wordCheckPos[k].x) && Object.is(blanks2.y,wordCheckPos[k].y))) tempPoints += 0;
                                    else tempPoints += tileLookup[wordCheck[k]];
                                }
                            }
                            points += tempPoints * multiplier;
                            if(placedTilePositioning.length == 7) points += 50;
                            multiplier = 1;
                        }
                    }
                }
            }
        }
    }

    for(let i = 0; i < placedTilePositioning.length; i++){
        var specialCheck = "" + placedTilePositioning[i].x.toString().padStart(2,'0') + placedTilePositioning[i].y.toString().padStart(2,'0');
        if(specialTiles[0].includes(specialCheck)){
            specialTiles[0].splice(specialTiles[0].indexOf(specialCheck),1);
        }
        if(specialTiles[1].includes(specialCheck)){
            specialTiles[1].splice(specialTiles[1].indexOf(specialCheck),1);
        }
        if(specialTiles[2].includes(specialCheck)){
            specialTiles[2].splice(specialTiles[2].indexOf(specialCheck),1);
        }
        if(specialTiles[3].includes(specialCheck)){
            specialTiles[3].splice(specialTiles[3].indexOf(specialCheck),1);
        }
    }
    return points;
}

///////////////////////////////////////////////////////////////////////////////
var turnNum = 0;
initBoard(board);
var bag = initBag(tileList);
initPlayers(bag);

var whosFirst = 0; //Math.floor(Math.random()*2);
var playerTurn = whosFirst == 0 ? player1 : player2;

var elements = [printBoard(board), printTileRack(playerTurn, whosFirst)];
runLoop(whosFirst, playerTurn, elements, board);
//////////////////////////////////////////////////////////////////////////////

function runLoop(whosFirst, playerTurn, elements, board){
    printTurn(elements);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question("Enter Input, Player " + (whosFirst+1) + ": ", (answer) => {
        if(answer.toLocaleLowerCase() == "q"){
            rl.close();
            questionExit(whosFirst, elements, playerTurn, board);
            return;
        }
        else if(answer.toLocaleLowerCase() == "two"){
            console.log(twoLetters);
            rl.close();
            return runLoop(whosFirst, playerTurn, elements, board);
        }
        else if(answer.toLocaleLowerCase() == "help"){
            var printer = "q:".padEnd(20) + "Quit the game (You'll be asked to confirm before exiting)\n";
            printer += "two:".padEnd(20) + "List all the two letter words in the game\n";
            printer += "check WORD:".padEnd(20) + "Check if something is a word or not - shorthand is c WORD\n";
            printer += "pass:".padEnd(20) + "Pass your turn\n";
            printer += "draw ABCD:".padEnd(20) + "Draw new tiles from the bag, specify which to remove from your tile rack\n";
            printer += "play:".padEnd(20) + "Play the word you've spelt on the board\n";
            printer += "shuffle:".padEnd(20) + "Shuffle the letters on your tile rack\n";
            printer += "recall:".padEnd(20) + "Recall any of your tiles back to your tile rack\n";
            printer += "word ABCD x y d:".padEnd(20) + "Play a word from your tile rack where x is vertical for some reason,\n" + 
                "                    y is horizontal, and d is direction (h or v) - shorthand is w ABCD x y d\n";
            printer += "place A x y V:".padEnd(20) + "Play a single tile at position x,y where A is the tile from your rack,\n" +
                "                    and V is the value of the tile if a blank is played - shorthand is p A x y V\n";
            console.log(printer);
            rl.close();
            return runLoop(whosFirst, playerTurn, elements, board);
        }
        else if(answer.toLocaleLowerCase().startsWith("check") || answer.toLocaleLowerCase().startsWith("c ")){
            var toCheck = answer.split(" ");
            if(typeof toCheck[1] == typeof 'hi'){
                if(wordList.includes(toCheck[1].toLocaleUpperCase())) console.log(toCheck[1].toLocaleUpperCase() + " is a word.");
                else console.log(toCheck[1].toLocaleUpperCase() + " isn't a word.");
            }
            rl.close();
            return runLoop(whosFirst, playerTurn, elements, board);
        }
        else if(answer.toLocaleLowerCase() == "pass"){
            rl.close();
            if(placedTiles.length > 0){
                placedTilePositioning = [];
                while(placedTiles.length > 0){
                    var removed = placedTiles.splice(placedTiles.length-1,1)[0];
                    playerTurn.push(removed);
                }
                hasPlaced = false;
                board = JSON.parse(JSON.stringify(tempBoard));
            }
            elements[0] = printBoard(board);
            whosFirst = whosFirst == 1 ? 0 : 1;
            playerTurn = whosFirst == 1 ? player2 : player1;
            elements[1] = printTileRack(playerTurn, whosFirst); 
            return runLoop(whosFirst, playerTurn, elements, board);
        }
        else if(answer.toLocaleLowerCase().startsWith("draw")){
            var toDraw = answer.toLocaleUpperCase().split(" ");
            var temp = "";
            if(typeof toDraw[1] == typeof "hi" && bag.length >= toDraw[1].length){
                if(placedTiles.length > 0){
                    placedTilePositioning = [];
                    while(placedTiles.length > 0){
                        var removed = placedTiles.splice(placedTiles.length-1,1)[0];
                        playerTurn.push(removed);
                    }
                    hasPlaced = false;
                    board = JSON.parse(JSON.stringify(tempBoard));
                }
                for(var i = 0; i < toDraw[1].length; i++){
                    if(playerTurn.includes(toDraw[1][i])){
                        temp += playerTurn.splice(playerTurn.indexOf(toDraw[1][i]), 1)[0];
                    }
                }
                for(var i = 0; i < toDraw[1].length; i++){
                    var randomTileNum = Math.floor(Math.random() * bag.length);
                    var randomTile = bag.splice(randomTileNum,1)[0];
                    playerTurn.push(randomTile);
                }
                for(var i = 0; i < temp.length; i++){
                    bag.push(temp[i]);
                }
                rl.close();
                elements[0] = printBoard(board);
                whosFirst = whosFirst == 1 ? 0 : 1;
                playerTurn = whosFirst == 1 ? player2 : player1;
                elements[1] = printTileRack(playerTurn, whosFirst); 
                return runLoop(whosFirst, playerTurn, elements, board);
            }
            else{
                console.log("Not enough tiles left in bag or invalid draw format. Format must be 'draw AAAA'.");
                rl.close();
                return runLoop(whosFirst, playerTurn, elements, board);
            }
        }
        else if(answer.toLocaleLowerCase() == "play"){
            if(playerTurn.length < 7){
                if(areTilesConnected(placedTilePositioning, board) && isBoardConnected(placedTilePositioning, tileList, turnNum, board)){
                    var validBoardCheck = isBoardValid(tileList, board, turnNum);
                    if(validBoardCheck.length == 0){
                        var pts = Number(tallyPoints(tileList, board, placedTilePositioning));
                        rl.close();
                        placedTilePositioning = [];
                        placedTiles = [];
                        turnNum++;
                        hasPlaced = false;
                        takeTiles(bag, playerTurn);
                        elements[0] = printBoard(board);
                        whosFirst = whosFirst == 1 ? 0 : 1;
                        playerTurn = whosFirst == 1 ? player2 : player1;
                        p2Points += whosFirst == 1 ? 0 : pts;
                        p1Points += whosFirst == 1 ? pts : 0;
                        elements[1] = printTileRack(playerTurn, whosFirst);
                        if(bag.length == 0 && (player1.length == 0 || player2.length == 0)){ // exit out on game over
                            if(player1.length > 0){
                                for(var k = 0; k < player1.length; k++){
                                    p1Points -= tileLookup[player1[k]];
                                    p2Points += tileLookup[player1[k]];
                                }
                            }
                            else{
                                for(var k = 0; k < player2.length; k++){
                                    p2Points -= tileLookup[player2[k]];
                                    p1Points += tileLookup[player2[k]];
                                }
                            }
                            elements[0] = printBoard(board);
                            elements[1] = printTileRack(playerTurn, whosFirst);
                            printTurn(elements);
                            if(p1Points > p2Points) console.log("Game over! Player 1 wins!!!");
                            else if(p1Points < p2Points) console.log("Game over! Player 2 wins!!!");
                            else console.log("Game over! It's a tie!!!");
                            return;
                        }
                        return runLoop(whosFirst, playerTurn, elements, board);
                    }
                    else{
                        if(validBoardCheck.length == 1) console.log("Invalid word: " + validBoardCheck[0]);
                        else {
                            var validBoardCheckResult = "";
                            for(var vbc = 0; vbc < validBoardCheck.length; vbc++){
                                validBoardCheckResult += validBoardCheck[vbc] + " ";
                            }
                            console.log("Invalid words: " + validBoardCheckResult);
                        }
                        rl.close();
                        return runLoop(whosFirst, playerTurn, elements, board);
                    }
                }
                else{
                    console.log("Invalid tile positioning.");
                    rl.close();
                    return runLoop(whosFirst, playerTurn, elements, board);
                }
            }
            else{
                console.log("You need to place at least one tile on the board to play.");
                rl.close();
                return runLoop(whosFirst, playerTurn, elements, board);
            }
        }
        else if(answer.toLocaleLowerCase() == "shuffle"){
            var temp = [];
            while(playerTurn.length > 0){
                var index = Math.floor(Math.random() * playerTurn.length);
                temp.push(playerTurn.splice(index,1)[0]);
            }
            for(var i = 0; i < temp.length; i++){
                playerTurn.push(temp[i]);
            }
            rl.close();
            elements[0] = printBoard(board);
            elements[1] = printTileRack(playerTurn, whosFirst);
            return runLoop(whosFirst, playerTurn, elements, board);
        }
        else if(answer.toLocaleLowerCase() == "recall"){
            if(placedTiles.length > 0){
                rl.close();
                placedTilePositioning = [];
                while(placedTiles.length > 0){
                    var removed = placedTiles.splice(placedTiles.length-1,1)[0];
                    playerTurn.push(removed);
                }
                hasPlaced = false;
                board = JSON.parse(JSON.stringify(tempBoard));
                elements[0] = printBoard(board);
                elements[1] = printTileRack(playerTurn, whosFirst);
                return runLoop(whosFirst, playerTurn, elements, board);
            }
            else{
                console.log("There are no tiles on the board to recall.");
                rl.close();
                return runLoop(whosFirst, playerTurn, elements, board);
            }
        }
        else if(answer.toLocaleLowerCase().startsWith("word") || answer.toLocaleLowerCase().startsWith("w ")){
            var wordToPlace = answer.split(" ");
            var plusX = 0;
            var plusY = 0;
            var canPlaceWord = true;
            if(typeof wordToPlace[1] == typeof "hi" && !isNaN(wordToPlace[2]) && wordToPlace[2] < 15 && !isNaN(wordToPlace[3]) && wordToPlace[3] < 15 && 
                wordToPlace[2] > -1 && wordToPlace[3] > -1 && typeof wordToPlace[4] == typeof "hi" && (wordToPlace[4].toLocaleUpperCase() == "V" || 
                wordToPlace[4].toLocaleUpperCase() == "H")){
                    var wordToCheck = wordToPlace[1].toLocaleUpperCase();
                    var currX = Number(wordToPlace[2]);
                    var currY = Number(wordToPlace[3]);
                    if(wordToPlace[4].toLocaleUpperCase() == "H") plusY = 1;
                    else plusX = 1;
                    for(var k = 0; k < wordToCheck.length; k++){
                        if(!(playerTurn.includes(wordToCheck[k]) && currX < 15 && currY < 15 && board[currX][currY].includes(" "))){
                            canPlaceWord = false;
                            break;
                        }   
                        currX += plusX;
                        currY += plusY;
                    }
                    if(canPlaceWord){
                        currX = Number(wordToPlace[2]);
                        currY = Number(wordToPlace[3]);
                        if(!hasPlaced){
                            tempBoard = JSON.parse(JSON.stringify(board));
                            hasPlaced = true;
                        }
                        for(var k = 0; k < wordToCheck.length; k++){
                            board[currX][currY] = wordToCheck[k];
                            var removed = playerTurn.splice(playerTurn.indexOf(wordToCheck[k]),1)[0];
                            placedTiles.push(removed);
                            placedTilePositioning.push({'x': currX, 'y': currY});
                            currX += plusX;
                            currY += plusY;
                        }
                        rl.close();
                        elements[0] = printBoard(board);
                        elements[1] = printTileRack(playerTurn, whosFirst);
                        return runLoop(whosFirst, playerTurn, elements, board);
                    }
                    else{
                        console.log("Invalid placement. Check to make sure you have the tiles, the spaces are open, and you're not trying to place tiles off the edge of the board.");
                        rl.close();
                        return runLoop(whosFirst, playerTurn, elements, board);
                    }
            }
            else {
                console.log("Invalid input. Format for word placement must be 'w ABC 0 0 H/V'.");
                rl.close();
                return runLoop(whosFirst, playerTurn, elements, board);
            }
        }
        else if(answer.toLocaleLowerCase().startsWith("place") || answer.toLocaleLowerCase().startsWith("p ")){ //stands for 'place'
            if(!hasPlaced){
                tempBoard = JSON.parse(JSON.stringify(board));
                hasPlaced = true;
            }
            var placement = answer.toLocaleLowerCase().split(" ");
            if(typeof placement[1] == typeof "hi" && !isNaN(placement[2]) && placement[2] < 15 && placement[2] > -1 && !isNaN(placement[3]) && placement[3] < 15 && placement[3] > -1){
                if(playerTurn.includes(placement[1].toLocaleUpperCase())){
                    var x = Number(placement[2]);
                    var y = Number(placement[3]);
                    if(board[x][y].includes(" ")){
                        // blank tile if statement somewhere around here - set them in lookup for validity checks?
                        if((placement[1] == '$' || placement[1] == '%')){
                            if(typeof placement[4] == typeof 'hi' && tileList.includes(placement[4].toLocaleUpperCase())){
                                board[x][y] = '\u001b[100;33m' + placement[4].toLocaleUpperCase() + '\u001b[0m';
                                var removed = playerTurn.splice(playerTurn.indexOf(placement[1].toLocaleUpperCase()),1)[0];
                                placedTiles.push(removed);
                                placedTilePositioning.push({'x': x, 'y': y});
                                rl.close();
                                elements[0] = printBoard(board);
                                elements[1] = printTileRack(playerTurn, whosFirst);
                                return runLoop(whosFirst, playerTurn, elements, board);
                            }
                            else{
                                console.log("Set a value to your blank tile in the format 'p $ 0 0 A'");
                                rl.close();
                                return runLoop(whosFirst, playerTurn, elements, board);
                            }
                        }
                        else{
                            board[x][y] = placement[1].toLocaleUpperCase();
                            var removed = playerTurn.splice(playerTurn.indexOf(placement[1].toLocaleUpperCase()),1)[0];
                            placedTiles.push(removed);
                            placedTilePositioning.push({'x': x, 'y': y});
                            rl.close();
                            elements[0] = printBoard(board);
                            elements[1] = printTileRack(playerTurn, whosFirst);
                            return runLoop(whosFirst, playerTurn, elements, board);
                        }
                    }
                    else{
                        console.log("There is already a tile there.");
                        rl.close();
                        return runLoop(whosFirst, playerTurn, elements, board);
                    }
                }
                else{
                    console.log("You don't have that tile.");
                    rl.close();
                    return runLoop(whosFirst, playerTurn, elements, board);
                }
            }
            else{
                console.log("Invalid placement command. Format must be 'place A 0 0' or 'p A 0 0'.");
                rl.close();
                return runLoop(whosFirst, playerTurn, elements, board);
            }
        }
        else{
            rl.close();
            return runLoop(whosFirst, playerTurn, elements, board);
        }
    });
}

function questionExit(whosFirst, elements, playerTurn, board){
    const rl2 = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl2.question("Are you sure? This will end the game: ", (input) => {
        if(input.toLocaleLowerCase() == "y" || input.toLocaleLowerCase() == "yes"){
            rl2.close();
            printTurn(elements);
            return;
        }
        else if(input.toLocaleLowerCase() == "n" || input.toLocaleLowerCase() == "no"){
            rl2.close();
            runLoop(whosFirst, playerTurn, elements, board);
            return;
        }
        else{
            rl2.close();
            return questionExit(whosFirst, elements);
        }
    });
}