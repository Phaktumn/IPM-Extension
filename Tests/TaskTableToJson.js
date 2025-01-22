// Select the table by its ID
const table = document.getElementById('tbl_tasks');

// Initialize an empty array to hold the objects
const tableData = [];

// Initialize a variable to store the current task state
let currentTaskState = null;
let taskStateValue = null;
let taskStateName = null;

// Select the rows in the <tbody> of the table
const rows = table.querySelectorAll('tbody > tr');

// Define a mapping of column names to their respective link attributes
const linkColumns = {
    title: "a.title-text",
    project: "a.title-text", // you can add more mappings if needed
};

// Iterate over each row
rows.forEach(row => {
    // Check if the row is a Task State row
    if (row.classList.contains('searchable') && row.classList.contains('header')) {
        const taskStateCell = row.querySelector('td.task_state');
        if (taskStateCell) {
            // Extract and clean up the Task State text
            currentTaskState = taskStateCell.textContent
                .replace(/[\r\n\t]+/g, '') // Remove newlines and tabs
                .replace(/\s{2,}/g, ' ') // Replace multiple spaces with a single space
                .trim(); // Remove leading and trailing spaces
            taskStateValue = currentTaskState.slice(0, 2);
            taskStateName = currentTaskState.slice(3, currentTaskState.length);
        }
        return; // Skip further processing for header rows
    }

    // Skip rows that are not searchable with data
    if (!row.classList.contains('searchable') || !row.dataset.id) return;

    // Extract relevant data attributes or cell text
    const taskData = {
        id: row.dataset.id || null,
        creator: row.dataset.creator || null,
        userActual: row.dataset.useractual || null,
        responsible: row.dataset.resp || null,
        priority: row.dataset.priority || null,
        project: row.dataset.project || null,
        title: row.dataset.title || null,
        taskType: row.dataset.tasktype || null,
        dateInserted: row.dataset.date || null,
        dateScheduledStart: row.dataset.sDateStart || null,
        dateScheduledEnd: row.dataset.sDateEnd || null,
        dateStart: row.dataset.dateStart || null,
        dateEnd: row.dataset.dateEnd || null,
        taskState: {
            code: taskStateValue || null,
            description: taskStateName || null
        }
    };

    // Extract "a" elements and associate them with their respective columns
    Object.keys(linkColumns).forEach((key) => {
        const linkElement = row.querySelector(linkColumns[key]);
        if (linkElement && linkElement.href) {
            taskData[key + 'Link'] = linkElement.href; // Associate the href with the respective column
        }
    });

    // Push the extracted data into the array
    tableData.push(taskData);
});

console.log(JSON.stringify(tableData.filter(x => x.id !== null)));
