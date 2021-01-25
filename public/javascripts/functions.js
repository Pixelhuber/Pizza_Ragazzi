function createFriendlist(){

}

function createHighscoreTable(tableData) {
    /*Variablen für die einzelnen Tabellenbestandteile   */
    var table = document.createElement('table');
    var tableBody = document.createElement('tbody');
    var tableHead = document.createElement('thead');

    /*erstellt die Titel/Beschriftung*/
    var rowHead = document.createElement('tr');
    var cellHeadRank = document.createElement('th');
    cellHeadRank.appendChild(document.createTextNode("Rank"));
    rowHead.appendChild(cellHeadRank);
    var cellHeadName = document.createElement('th');
    cellHeadName.appendChild(document.createTextNode("Name"));
    rowHead.appendChild(cellHeadName);
    var cellHeadScore = document.createElement('th');
    cellHeadScore.appendChild(document.createTextNode("Score"));
    rowHead.appendChild(cellHeadScore);
    tableHead.appendChild(rowHead);

    /*Sortiert die Tabelle nach Punktewerten*/
    tableData.sort(sortFunction);
    function sortFunction(a, b) {
        if (a[1] === b[1]) {
            return 0;
        }
        else {
            return (a[1]> b[1]) ? -1 : 1;
        }
    }

    /*Iteriert über das 2D Array*/
    tableData.forEach(function(rowData,index) {
        var row = document.createElement('tr');

        var cellRank = document.createElement('th');
        cellRank.appendChild(document.createTextNode(index+1));
        row.appendChild(cellRank);

        rowData.forEach(function(cellData) {
            var cell = document.createElement('td');
            cell.appendChild(document.createTextNode(cellData));
            row.appendChild(cell);
        });

        tableBody.appendChild(row);
    });
    table.appendChild(tableHead);
    table.appendChild(tableBody);
    document.body.appendChild(table);
}

function randomScore() {
    return Math.floor(Math.random() * 1001);
}