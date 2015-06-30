//data object
function Task(text, date, isDone) {
    if (!(this instanceof Task)) {
        return new Task(text, date, isDone);
    }

    this.task = text;
    this.expires_at = date;
    this.isDone = isDone;
}

//constructor of main object
function TodoView() {
    if (!(this instanceof TodoView)) {
        return new TodoView();
    }

    this.init();
}

//initialize all required DOM elements and add eventListeners to them
TodoView.prototype.init = function() {
    var self = this,
        downloadTasks,
        downloadCompletedEvent = new Event("downloadCompleted"),
        localTasks;

    this.newTaskTextInput = document.querySelector(".new-task");
    this.newTaskDateInput = document.querySelector(".date");
    this.addTaskButton = document.querySelector(".add-button");
    this.taskListTable = document.querySelector(".task-list");
    this.dateCell = document.querySelector(".date-cell");

    //add button. Handler for adding new User's task
    this.addTaskButton.addEventListener("click", function(e) {
        var taskText = self.newTaskTextInput.value,
            taskDate = self.newTaskDateInput.value.split("/"),
            dateNumber = new Date(taskDate[2], taskDate[0] - 1, parseInt(taskDate[1]) + 1).getTime();

        if (taskText && taskDate) {
            self.newTaskTextInput.value = "";
            self.newTaskDateInput.value = "";

            self.tasks.push(new Task(taskText, dateNumber, false));
            self.addTask(taskText, dateNumber, false);
        }
    });

    //custom event for downloading task from server
    this.taskListTable.addEventListener("downloadCompleted", function(e) {
        var i;

        for (i = 0; i < self.tasks.length; i++) {
            self.addTask(self.tasks[i].task, self.tasks[i].expires_at, self.tasks[i].done);
        }
    });

    //event handler for table sorting by date
    this.dateCell.addEventListener("click", function(e) {
        var taskListRoot = self.taskListTable.children[1],
            taskListBody = taskListRoot.children,
            i;

        self.tasks.sort(function(a, b) {
            return a.expires_at - b.expires_at;
        });
        while (taskListRoot.firstChild) {
            taskListRoot.firstChild.firstChild.firstChild.removeEventListener("change");
            taskListRoot.removeChild(taskListRoot.firstChild);
        }
        self.tasks.forEach(function(cur) {
            self.addTask(cur.task, cur.expires_at, cur.done);
        });
    });

    //trying to get tasks from localStorage. If it's empty download from server
    localTasks = localStorage.getItem("todo");
    if (localTasks === null || localTasks === []) {
        var xhr = createCORSRequest("GET", "http://rygorh.dev.monterosa.co.uk/todo/items.php");

        if (xhr === null) {
            self.tasks = []
            return;
        }

        xhr.onload = function() {
            self.tasks = JSON.parse(xhr.responseText);
            self.tasks = self.tasks.map(function(cur) {
                cur.expires_at += "000";
                return cur;
            });
            self.taskListTable.dispatchEvent(downloadCompletedEvent);
        };
        xhr.send();
    } else {
        self.tasks = JSON.parse(localTasks);
        self.taskListTable.dispatchEvent(downloadCompletedEvent);
    }

    //store tasks in localStorage when refresh or close page
    window.addEventListener("beforeunload", function(e) {
        localStorage.setItem("todo", JSON.stringify(self.tasks));
    });
}

//create new DOM elements for new table row and add event handler for checkbox
TodoView.prototype.addTask = function(taskText, taskDate, isDone) {
    var self = this,
        row = document.createElement("tr"),
        doneCell = document.createElement("td"),
        doneCheckbox = document.createElement("input"),
        textCell = document.createElement("td"),
        dateCell = document.createElement("td"),
        taskListTable = document.querySelector(".task-list tbody"),
        formatDateToString,
        formatDateNumber,
        handleCheckBox;

    formatDateNumber = function(number) {
        return number < 10 ? "0" + number : number;
    };

    formatDateToString = function(dateNumber) {
        var expirationDate = new Date(parseInt(dateNumber)),
            month = formatDateNumber(expirationDate.getUTCMonth() + 1),
            day = formatDateNumber(expirationDate.getUTCDate()),
            year = formatDateNumber(expirationDate.getUTCFullYear()),
            hours = formatDateNumber(expirationDate.getHours()),
            minutes = formatDateNumber(expirationDate.getMinutes()),
            seconds = formatDateNumber(expirationDate.getSeconds()),
            checkBoxCheckedEvent;

        return month + "/" + day + "/" + year + " " + hours + ":" + minutes + ":" + seconds;
    };

    //event handler for checkbox
    handleCheckBox = function(e) {
        var curRow = doneCheckbox.parentNode.parentNode,
            index = [].slice.call(taskListTable.childNodes).indexOf(curRow);

        if (doneCheckbox.checked) {
            curRow.className = "done";
            self.tasks[self.tasks.length - 1 - index].done = true;
        } else {
            curRow.className = "";
            self.tasks[self.tasks.length - 1 - index].done = false;
        }
    };

    doneCheckbox.type = "checkbox";
    doneCell.appendChild(doneCheckbox);
    row.appendChild(doneCell);
    doneCheckbox.addEventListener("change", handleCheckBox);
    if (isDone) {
        doneCheckbox.parentNode.parentNode.className = "done";
        doneCheckbox.checked = true;
    }

    textCell.innerHTML = taskText;

    dateCell.innerHTML = formatDateToString(taskDate);

    row.appendChild(doneCell);
    row.appendChild(textCell);
    row.appendChild(dateCell);
    taskListTable.insertBefore(row, taskListTable.firstChild);
};

$(function() {
    var todo = new TodoView();
    $(".datepicker").datepicker();
});
