var arrHead = new Array(); 
arrHead = ['', 'PID', 'Arrival Time', 'Burst Time']; 

var n, procInfo, quantum, procIds, ArrTime, BurstTime, avgTAT, readyqueue,
    avgWT, avgRT, t, finish, actat, ganttchart, timestamp,
    visited, attributes, newBurstTime, tat, wt, ct, rt;

function initialize() {
    actat = new Array(n); 
    ganttchart = new Array();
    timestamp = new Array();
    newBurstTime = new Array(n);
    visited = new Array(n); 
    t = 0; 
    finish = 0; 
    avgRT = 0; 
    avgTAT = 0; 
    avgWT = 0; 
    tat = new Array(n);
    wt = new Array(n);
    ct = new Array(n);
    rt = new Array(n);

    procInfo = document.getElementById('procTable'); // get process table from HTML
    // initialize arrays to store process information
    procIds = new Array();
    ArrTime = new Array();
    BurstTime = new Array();

    // loop through each row of the table to extract process information
    for (let row = 1; row < procInfo.rows.length - 1; row++) {
        // loop through each cell in a row
        for (let c = 1; c < procInfo.rows[row].cells.length; c++) {
            var element = procInfo.rows.item(row).cells[c];
            // store process ID
            if (c == 1) {
                procIds.push(element.childNodes[0].value);
            }
            // store arrival time
            else if (c == 2) {
                let arrivalTime = element.childNodes[0].value;
                if (!Number.isInteger(Number(arrivalTime)) || Number(arrivalTime) < 0) {
                    alert("Error: Arrival Time must be a non-negative integer");
                    return;
                }
                ArrTime.push(Number(arrivalTime));
            }
            // store burst time
            else {
                let burstTime = element.childNodes[0].value;
                if (!Number.isInteger(Number(burstTime)) || Number(burstTime) <= 0) {
                    alert("Error: Burst Time must be greater than zero");
                    return;
                }
                BurstTime.push(Number(burstTime));
            }
        }
    }
    n = procIds.length; // total number of processes
    if (n === 0) {
        alert("Error: Please add at least one process");
        return;
    }

    // copy burst time to newBurstTime array
    for (let i = 0; i < n; i++) {
        newBurstTime[i] = BurstTime[i];
    }

    // initialize visited array and actual arrival time array
    for (let i = 0; i < n; i++) {
        visited[i] = 0;
        actat[i] = -1;
    }

    // Get selected scheduling algorithm
    var sel = document.getElementById("algo");
    selected = sel.options[sel.selectedIndex].text;

    // call appropriate scheduling function based on selected algorithm
    if (selected == "First Come First Serve") {
        FCFS();
    }
    else if (selected == "Shortest Remaining Time Next") {
        SRTN();
    }
    else if (selected == "Round Robin") {
        RR();
    }
    else if (selected == "Shortest Job First") {
        SJF();
    }
}

// function to handle algorithm selection change
function onsel() {
    var sel = document.getElementById("algo");
    selected = sel.options[sel.selectedIndex].text;
    var x1 = document.getElementById('timeq');
    var x2 = document.getElementById('queues');

    // show or hide quantum and queue elements based on algorithm selection
    if (selected != "Round Robin") {
        x1.style.display = "none";
        x2.style.display = "none";
    }
    else {
        x1.style.display = "block";
        x2.style.display = "block";
    }
}

// function to create process table
function createTable() {
    var procTable = document.createElement('table');
    procTable.setAttribute('id', 'procTable');

    // add table headers
    var tr = procTable.insertRow(-1);
    for (var h = 0; h < arrHead.length; h++) {
        var th = document.createElement('th');
        th.innerHTML = arrHead[h];
        tr.appendChild(th);
    }

    // append table to container div
    var div = document.getElementById('cont');
    div.appendChild(procTable);
}

// function to add a new process row to the table
function addProcess() {
    var process = document.getElementById('procTable');
    var rowCnt = process.rows.length;
    var tr = process.insertRow(rowCnt);
    tr = process.insertRow(rowCnt);

    // add cells for each column in the table
    for (var c = 0; c < arrHead.length; c++) {
        var td = document.createElement('td');
        td = tr.insertCell(c);

        // add remove button for the first column
        if (c == 0) {
            var button = document.createElement('input');
            button.setAttribute('id', 'rembut');
            button.setAttribute('type', 'button');
            button.setAttribute('value', 'X');
            button.setAttribute('onclick', 'removeRow(this)');
            td.appendChild(button);
        }
        // add text input for other columns
        else {
            var ele = document.createElement('input');
            ele.setAttribute('type', 'text');
            ele.setAttribute('value', '');
            td.appendChild(ele);
        }
    }
}

// function to remove a process row from the table
function removeRow(oButton) {
    var process = document.getElementById('procTable');
    process.deleteRow(oButton.parentNode.parentNode.rowIndex);
}

// round robin
function RR() {
    quantum = document.getElementById('quantum').value; // get quantum
    if (quantum < 1) {
        alert("Error: Time Quantum must be greater than or equal to 1");
        return;
    }
    readyqueue = new Array();
    timestamp.push(0);
    var last;
    var mint = 100000;

    // find the process with the minimum arrival time
    for (let i = 0; i < n; i++) {
        if (mint > ArrTime[i]) {
            mint = ArrTime[i];
            last = i;
        }
    }

    var k = 0;
    // if there's a gap before the first process arrives, mark it in the Gantt chart
    if (ArrTime[last] > 0) {
        ganttchart.push(-1);
        timestamp.push(ArrTime[last]);
    }

    // set current time to the arrival time of the first process
    t = ArrTime[last];
    // set actual arrival time for the first process
    actat[last] = t;
    // add the first process to the ready queue
    readyqueue.push(last);
    // mark the first process as visited
    visited[last] = 1;

    // continue scheduling until all processes are completed
    while (true) {
        if (readyqueue.length > k) {
            // add process to Gantt chart
            ganttchart.push(procIds[readyqueue[k]]);

            // set actual arrival time if not already set
            if (actat[readyqueue[k]] == -1) {
                actat[readyqueue[k]] = t;
            }

            // execute process for the minimum of its burst time or quantum
            temp = Math.min(newBurstTime[readyqueue[k]], quantum);
            t += temp;
            timestamp.push(t);
            newBurstTime[readyqueue[k]] -= temp;
            // if process is completed, update completion time
            if (newBurstTime[readyqueue[k]] == 0) {
                finish++;
                ct[readyqueue[k]] = t;
                // if all processes are completed, exit loop
                if (finish == n) {
                    break;
                }
            }
            last = readyqueue[k];
            k++;
        }
        else {
            // if there are no processes in the ready queue, find the next arrival time
            ganttchart.push(-1);
            var time;
            var flag = 0;
            for (time = t; flag == 0; time++) {
                for (var i = 0; i < n; i++) {
                    if (ArrTime[i] <= time && newBurstTime[i] > 0 && visited[i] != 1) {
                        flag = 1;
                        break;
                    }
                }
            }
            t = time - 1;
            timestamp.push(t);
        }

        // add newly arrived processes to the ready queue
        for (let i = 0; i < n; i++) {
            if (ArrTime[i] <= t && newBurstTime[i] > 0 && visited[i] != 1) {
                readyqueue.push(i);
                visited[i] = 1;
            }
        }

        // add last processed if it still has remaining burst time
        if (newBurstTime[last] > 0) {
            readyqueue.push(last);
        }
    }
    // display scheduling results
    show();
}

// function to execute First Come First Serve scheduling algorithm
function FCFS() {
    // continue scheduling until all processes are completed
    while (finish < n) {
        var minat = 10000, idx;
        // find the process with the minimum arrival time
        for (let i = 0; i < n; i++) {
            if (visited[i] != 1 && minat > ArrTime[i]) {
                minat = ArrTime[i];
                idx = i;
            }
        }
        // if there's a gap before the next process arrives, mark it in the Gantt chart
        if (minat > t) {
            timestamp.push(t);
            ganttchart.push(-1);
            t = minat;
        }
        // mark the process as visited and add it to the Gantt chart
        timestamp.push(t);
        visited[idx] = 1;
        ganttchart.push(procIds[idx]);
        actat[idx] = t;
        // update current time and completion time of the process
        t += BurstTime[idx];
        ct[idx] = t;
        finish++;
    }
    // display scheduling results
    timestamp.push(t);
    show();
}

// function to execute Shortest Job First scheduling algorithm
function SJF() {
    // continue scheduling until all processes are completed
    while (finish < n) {
        var minat = 10000, minbt = 10000, idx;
        // find the process with the minimum arrival time
        for (let i = 0; i < n; i++) {
            if (visited[i] != 1 && minat > ArrTime[i]) {
                minat = ArrTime[i];
            }
        }
        // if there's a gap before the next process arrives, mark it in the Gantt chart
        if (minat > t) {
            timestamp.push(t);
            ganttchart.push(-1);
            t = minat;
        }
        timestamp.push(t);
        // find the process with the minimum burst time among arrived processes
        for (let i = 0; i < n; i++) {
            if (ArrTime[i] <= t && visited[i] != 1 && minbt > BurstTime[i]) {
                minbt = BurstTime[i];
                idx = i;
            }
        }
        // mark the process as visited and add it to the Gantt chart
        visited[idx] = 1;
        ganttchart.push(procIds[idx]);
        actat[idx] = t;
        // update current time and completion time of the process
        t += minbt;
        ct[idx] = t;
        finish++;
    }
    // display scheduling results
    timestamp.push(t);
    show();
}

// function to execute Shortest Remaining Time Next scheduling algorithm
function SRTN() {
    // continue scheduling until all processes are completed
    while (finish < n) {
        var minat = 10000, minbt = 10000, idx;
        // find the process with the minimum arrival time
        for (let i = 0; i < n; i++) {
            if (visited[i] != 1 && minat > ArrTime[i]) {
                minat = ArrTime[i];
            }
        }
        // if there's a gap before the next process arrives, mark it in the Gantt chart
        if (minat > t) {
            timestamp.push(t);
            ganttchart.push(-1);
            t = minat;
        }
        // find the process with the minimum burst time among arrived processes
        for (let i = 0; i < n; i++) {
            if (ArrTime[i] <= t && visited[i] != 1 && minbt > newBurstTime[i]) {
                minbt = newBurstTime[i];
                idx = i;
            }
        }
        // if the next process is different from the previous one in the Gantt chart, add it
        if (ganttchart[ganttchart.length - 1] != procIds[idx]) {
            ganttchart.push(procIds[idx]);
            timestamp.push(t);
        }
        // set actual arrival time if not already set
        if (BurstTime[idx] == newBurstTime[idx]) {
            actat[idx] = t;
        }
        // increment time and update burst time
        t++;
        newBurstTime[idx]--;
        // if burst time becomes 0, mark the process as completed
        if (newBurstTime[idx] == 0) {
            visited[idx] = 1;
            finish++;
            ct[idx] = t;
        }
    }
    // display scheduling results
    timestamp.push(t);
    show();
}

// function to display scheduling results
function show() {
    // clear existing data in HTML elements
    document.getElementById('readyqueue').innerHTML = "";
    document.getElementById('ganttchart').innerHTML = "";
    document.getElementById('timestamp').innerHTML = "";
    document.getElementById('ProcessTable').innerHTML = "";

    // calculate turnaround time, waiting time, and response time for each process
    for (let i = 0; i < n; i++) {
        tat[i] = ct[i] - ArrTime[i];
        avgTAT += tat[i];
        wt[i] = tat[i] - BurstTime[i];
        avgWT += wt[i];
        rt[i] = actat[i] - ArrTime[i];
        avgRT += rt[i];
    }

    // calculate average turnaround time, waiting time, and response time
    avgTAT /= n;
    avgWT /= n;
    avgRT /= n;

    // get selected scheduling algorithm
    var sel = document.getElementById("algo");
    selected = sel.options[sel.selectedIndex].text;

    // if Round Robin algorithm is selected, display the ready queue
    if (selected == "Round Robin") {
        var table1 = document.getElementById("readyqueue");
        var col = readyqueue.length;

        var tr = document.createElement('tr');
        for (let colidx = 0; colidx < col; colidx++) {
            var td = document.createElement('td');
            var text = document.createTextNode(procIds[readyqueue[colidx]]);
            td.appendChild(text);
            tr.appendChild(td);
        }
        table1.appendChild(tr);
    }

    // display Gantt chart
    var table2 = document.getElementById("ganttchart");
    var col = ganttchart.length;

    var tr = document.createElement('tr');
    for (let colidx = 0; colidx < col; colidx++) {
        var td = document.createElement('td');
        if (ganttchart[colidx] == -1) {
            var text = document.createTextNode("-");
        }
        else {
            var text = document.createTextNode(ganttchart[colidx]);
        }
        td.appendChild(text);
        tr.appendChild(td);
    }
    table2.appendChild(tr);

    // display timestamp
    var table3 = document.getElementById("timestamp");
    var col = timestamp.length;

    var tr = document.createElement('tr');
    for (let colidx = 0; colidx < col; colidx++) {
        var td = document.createElement('td');
        var text = document.createTextNode(timestamp[colidx]);
        td.appendChild(text);
        tr.appendChild(td);
    }
    table3.appendChild(tr);

    // display process table with details
    var attributes = new Array(7);
    attributes[0] = "PID";
    attributes[1] = "Arrival Time";
    attributes[2] = "Burst Time";
    attributes[3] = "Finish Time";
    attributes[4] = "Turn Around Time";
    attributes[5] = "Waiting Time";
    attributes[6] = "Response Time";

    var table4 = document.getElementById("ProcessTable");
    var col = 7;
    var row = n + 2;

    for (let i = 0; i < row; i++) {
        var tr = document.createElement('tr');
        if (i == 0) {
            for (let colidx = 0; colidx < col; colidx++) {
                var td = document.createElement('td');
                var text = document.createTextNode(attributes[colidx]);
                td.appendChild(text);
                tr.appendChild(td);
            }
            table4.appendChild(tr);
        }
        else if (i <= n) {
            for (let colidx = 0; colidx < col; colidx++) {
                if (colidx == 0) {
                    var td = document.createElement('td');
                    var text = document.createTextNode(procIds[i - 1]);
                    td.appendChild(text);
                    tr.appendChild(td);
                }
                else if (colidx == 1) {
                    var td = document.createElement('td');
                    var text = document.createTextNode(ArrTime[i - 1]);
                    td.appendChild(text);
                    tr.appendChild(td);
                }
                else if (colidx == 2) {
                    var td = document.createElement('td');
                    var text = document.createTextNode(BurstTime[i - 1]);
                    td.appendChild(text);
                    tr.appendChild(td);
                }
                else if (colidx == 3) {
                    var td = document.createElement('td');
                    var text = document.createTextNode(ct[i - 1]);
                    td.appendChild(text);
                    tr.appendChild(td);
                }
                else if (colidx == 4) {
                    var td = document.createElement('td');
                    var text = document.createTextNode(tat[i - 1]);
                    td.appendChild(text);
                    tr.appendChild(td);
                }
                else if (colidx == 5) {
                    var td = document.createElement('td');
                    var text = document.createTextNode(wt[i - 1]);
                    td.appendChild(text);
                    tr.appendChild(td);
                }
                else {
                    var td = document.createElement('td');
                    var text = document.createTextNode(rt[i - 1]);
                    td.appendChild(text);
                    tr.appendChild(td);
                }
            }
            table4.appendChild(tr);
        }
        else {
            for (let colidx = 0; colidx < col; colidx++) {
                if (colidx == 0) {
                    var td = document.createElement('td');
                    var text = document.createTextNode("");
                    td.appendChild(text);
                    tr.appendChild(td);
                }
                else if (colidx == 1) {
                    var td = document.createElement('td');
                    var text = document.createTextNode("");
                    td.appendChild(text);
                    tr.appendChild(td);
                }
                else if (colidx == 2) {
                    var td = document.createElement('td');
                    var text = document.createTextNode("");
                    td.appendChild(text);
                    tr.appendChild(td);
                }
                else if (colidx == 3) {
                    var td = document.createElement('td');
                    var text = document.createTextNode("Average");
                    td.appendChild(text);
                    tr.appendChild(td);
                }
                else if (colidx == 4) {
                    var td = document.createElement('td');
                    var text = document.createTextNode(avgTAT.toFixed(2));
                    td.appendChild(text);
                    tr.appendChild(td);
                }
                else if (colidx == 5) {
                    var td = document.createElement('td');
                    var text = document.createTextNode(avgWT.toFixed(2));
                    td.appendChild(text);
                    tr.appendChild(td);
                }
                else {
                    var td = document.createElement('td');
                    var text = document.createTextNode(avgRT.toFixed(2));
                    td.appendChild(text);
                    tr.appendChild(td);
                }
            }
            table4.appendChild(tr);
        }
    }
}
// event listener to initialize scheduling on button click
document.getElementById("bt").addEventListener("click", initialize);
// event listener to add a new process row on button click
document.getElementById("addprocess").addEventListener("click", addProcess);
