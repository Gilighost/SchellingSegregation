//Cameron LaFerney

var board
var gridSize
var timerId = -1
var wantedSimilarity
var delay = 300
var roundNum = 0

//returns the current similarity for a givn cell
function currentSimilarity(xCoord, yCoord, cellColorLetter) 
{
    var cellsChecked = 0
    var sameColorCells = 0
    for (var rowNum = xCoord - 1; rowNum <= xCoord + 1; rowNum++) 
    {
        for (var colNum = yCoord - 1; colNum <= yCoord + 1; colNum++) 
        {
            if (rowNum >= 0 && rowNum < gridSize && colNum >= 0 && colNum < gridSize) {
                if (board[rowNum][colNum] != " ") 
                {
                    cellsChecked++
                    if (board[rowNum][colNum] == cellColorLetter) 
                    {
                        sameColorCells++
                    }
                }
            }
        }
    }
    return (cellsChecked == 0) ? 100 : (sameColorCells / cellsChecked) * 100
}

//filters cells to get satisfied (true) or unsatisfied (false)
function filterCells(satisfied)
{
    var filledCells = $(".blue").add(".red")
    var cells = filledCells.filter(function() 
    {
        var cellIndex = parseInt(this.getAttribute("id").substr(3))
        var rowNum = Math.floor(cellIndex / gridSize)
        var colNum = cellIndex % gridSize
        return satisfied ? ((wantedSimilarity <= currentSimilarity(rowNum, colNum, board[rowNum][colNum])) ? true : false) :
         ((wantedSimilarity <= currentSimilarity(rowNum, colNum, board[rowNum][colNum])) ? false : true) 
    })
    if(satisfied)
    {
        var percentSatisfied = Math.trunc(cells.length / filledCells.length * 100)
        $("#satisfied").html(percentSatisfied + " %")
    }
    return cells
}

//checks which cells are unsatisfied and moves them
function moveUnsatisfiedCells()
{
    var unsatisfiedCells = filterCells(false)
    unsatisfiedCells.each(function() 
    {
        var cellIndex = parseInt(this.getAttribute("id").substr(3))
        var rowNum = Math.floor(cellIndex / gridSize)
        var colNum = cellIndex % gridSize
        makeRandomMove(rowNum, colNum)
    })
}

//trades places with one given filled cell and one random empty cell
function makeRandomMove(xCoord, yCoord)
{
    var cellColor = board[xCoord][yCoord]
    var randomBlank = $(".blank")[Math.floor(Math.random() * $(".blank").length)]
    var destCellIndex = parseInt($(randomBlank).attr("id").substr(3))
    board[Math.floor(destCellIndex / gridSize)][destCellIndex % gridSize] = cellColor
    board[xCoord][yCoord] = " "
    
    $(randomBlank).removeClass("blank").addClass(cellColor)

    var currCellId = "#pos" + ((gridSize * xCoord) + yCoord)
    $(currCellId).removeClass(cellColor).addClass("blank")
}

//checks to see if all cells are satisfied
function allCellsSatisfied()
{
    var satisfiedCells =  filterCells(true)
    var filledCells = $(".blue").add(".red")
    return (satisfiedCells.length == filledCells.length) 
}

//This function takes care of the tasks needed to complete one step
function simulationStep() 
{
    $("#roundNum").html(++roundNum)

    moveUnsatisfiedCells()
    
    if (allCellsSatisfied()) 
    {
        $("#stopBtn").click()
    }
}

//resizes grid to size given by size range slider
function resizeGrid() 
{
    gridSize = $("#gridSize").val()
    var rowHtml = ""
    for (var rowNum = 0; rowNum < gridSize; rowNum++) 
    {
        rowHtml += "<tr>"
        for (var colNum = 0; colNum < gridSize; colNum++) 
        {
            rowHtml += "<td class='cell' id='pos" + ((rowNum * gridSize) + colNum) + "''></td>"
        }
        rowHtml += "</tr>"
    }
    $(".board").html(rowHtml)
}

$(document).ready(function() 
{
    wantedSimilarity = $("#similarity").val()
    $("#similarityValue").html(wantedSimilarity)
    $("#similarity").on("input change", function(event) 
    {
        wantedSimilarity = $("#similarity").val()
        $("#similarityValue").html(wantedSimilarity)
    })
 
    var percentRed = $("#percentRed").val()
    var percentBlue = 100 - percentRed
    $("#percentRedValue").html(percentRed + "/" + percentBlue)
    $("#percentRed").on("input change", function(event) 
    {
        percentRed = $("#percentRed").val()
        percentBlue = 100 - percentRed
        $("#percentRedValue").html(percentRed + "/" + percentBlue)
        $("#resetBtn").click()
    })

    $("#emptyValue").html($("#empty").val())
    $("#empty").on("input change", function(event) 
    {
        $("#emptyValue").html($("#empty").val())
        $("#resetBtn").click()
    })

    gridSize = $("#gridSize").val()
    $("#gridSizeValue").html(gridSize + "x" + gridSize)
    $("#gridSize").on("input change", function(event) 
    {
        gridSize = $(this).val()
        $("#gridSizeValue").html(gridSize + "x" + gridSize)
        $("#resetBtn").click()
    })
 
    $("#delayValue").html($("#delay").val())
    $("#delay").on("input change", function() 
    {
        delay = $("#delay").val()
        $("#delayValue").html(delay)
        if (timerId != -1) 
        {
            clearInterval(timerId)
            timerId = setInterval(simulationStep, delay)
        }
        
    })

    $("#startBtn").click(function() 
    {
        if (timerId == -1) 
        {
            timerId = setInterval(simulationStep, delay)
        }
    })

    $("#stopBtn").click(function() 
    {
        if (timerId != -1) 
        {
            clearInterval(timerId)
        }
        timerId = -1
    })

    $("#stepBtn").click(function() 
    {
        $("#stopBtn").click()
        simulationStep()
    })

    $("#resetBtn").click(function() 
    {
        $("#stopBtn").click()
        resizeGrid()
        roundNum = 0
        $("#roundNum").html(roundNum)

        board = new Array(gridSize)
        for (var i = 0; i < gridSize; i++) 
        {
            board[i] = new Array(gridSize)
        }

        var cells = $("td.cell")
        cells.removeClass().addClass("cell")

        var cellIndex = 0
        for (var rowNum = 0; rowNum < gridSize; rowNum++) 
        {
            for (var colNum = 0; colNum < gridSize; colNum++) 
            { 
                if (Math.random() > $("#empty").val() / 100) 
                {
                    if (Math.random() < $("#percentRed").val() / 100) 
                    {
                        $(cells[cellIndex++]).addClass("red")
                        board[rowNum][colNum] = "red"
                    } 
                    else 
                    {
                        $(cells[cellIndex++]).addClass("blue")
                        board[rowNum][colNum] = "blue"
                    }
                }
                 else 
                {
                    board[rowNum][colNum] = " "
                    $(cells[cellIndex++]).addClass("blank")
                }                 
            }
        }
        filterCells(true)
    })

    $("#resetBtn").click()
})