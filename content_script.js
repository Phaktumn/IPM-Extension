const baseUrl = 'http://ipm.macwin.pt:83/';
const pages = [
    { url: `task_dashboard.html`, f: processTaskDashboard },
    { url: `clients.html`, f: processClientsPage },
    { url: `task_communication.html`, f: processTaskPage },
    { url: 'tasks.html', f: processTasksPage }
]

pages.forEach(page => {
    if (window.location.href === `${baseUrl}${page.url}`) {
        try {
            page.f();
        } catch (error) {
            console.log(error);
        }
    }
})

function processTasksPage() {
    const labels = document.querySelectorAll('#searchMyTasks-form > fieldset > dl > dt');
    labels.forEach(x => { x.classList.add('pt-10'); });
}


function processClientsPage() {
    var currentUrl = window.location.href;
    if (currentUrl.endsWith('/')) {
        currentUrl = currentUrl.slice(0, -1);
    }
    let actions = document.querySelectorAll('td.actions');
    actions.forEach(async element => {
        try {
            var codCliente = element.parentElement.getAttribute('data-code');
            var copySpan = element.querySelector('span#copy-path');
            let folderLink = copySpan.getAttribute('data-server-folder-link');

            let result = await chrome.storage.local.get("options");
            if (result.options.fileCheck === "true") {
                folderLink = `${folderLink}\\${codCliente}.txt`
            }
            
            let taskClientBtn = element.querySelector('span#create-task-client');

            element.removeChild(copySpan);

            let newSpan = document.createElement('span');
            newSpan.innerText = 'content_copy';
            newSpan.id = 'open-path';
            newSpan.className = 'material-icons material-symbols-rounded md-20 md-mcw-red';
            newSpan.title = 'Abrir';
            newSpan.folderLink = folderLink;
            newSpan.addEventListener('click', (e) => {
                e.stopPropagation();
                chrome.runtime.sendMessage({
                    method: 'openLocalFile',
                    localFileUrl: folderLink,
                });
            });
            element.insertBefore(newSpan, taskClientBtn);
        } catch (error) {
        }
    });
}

function processTaskDashboard() {
    // Create expandable groups

    // Align elements
    {
        const colGroups = document.querySelectorAll('form > fieldset > dl > div');
        if (colGroups) {
            colGroups.forEach(element => {
                element.classList.add('task-dashboard-label-group');
                const colGroupCheckBoxes = element.querySelectorAll('dt');
                if (colGroupCheckBoxes) {
                    colGroupCheckBoxes.forEach(checkElement => {
                        checkElement.classList.add('task-dashboard-label');
                    });
                }
            });
    
            colGroups[0].classList.add('task-dashboard-label-group-small');
            colGroups[0].querySelectorAll('dt').forEach(e => {
                e.classList.add('label-small');
            });
        }
        const checkBoxes = document.querySelectorAll('form > fieldset > dl > dt:not(.large-width)');
        if (checkBoxes) {
            checkBoxes[0].style.marginTop = '10px';
            checkBoxes.forEach(element => {
                element.classList.add('task-dashboard-label');
            });
            checkBoxes[0].classList.remove('task-dashboard-label');
            //Check "Somente favoritos:""
            checkBoxes[5].classList.add('w130label');
        }
    
        const filterGroup = document.querySelectorAll('#main > dl > *');
        if (filterGroup) {
            filterGroup[0].style.marginTop = '5px';
            filterGroup[1].classList.add('pt-0');
        }
    }
}

function processTaskPage() {
    const labels = document.querySelectorAll('#searchMyTasks-form > fieldset > dl > dt');
    labels.forEach(x => { x.classList.add('pt-10'); });
}

if (!window.alreadyExecuted) {
    window.addEventListener('click', evt => {
        try {
            if (!evt.isTrusted) return;
            let target = evt.target;
            while (target && target.tagName.toLowerCase() !== 'a' && target.tagName.toLowerCase() !== 'area') {
                target = target.parentElement;
            }
            if (target) {
                const url = target instanceof SVGAElement ? target.href.baseVal : target.href;
                if (url.startsWith('file://')) {
                    evt.preventDefault();
                    try {
                        chrome.runtime.sendMessage({
                            method: 'openLocalFile',
                            localFileUrl: url,
                        });
                    } catch (e) { }
                }
            }
        } catch (error) {
            // Ignored
        }
    }, {
        capture: true,
    });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.method == 'reload') {
        reload();
        sendResponse({ ok: true });
    }
});

function reload() {
    var elements = document.querySelectorAll('link[rel=stylesheet][href]');
    for (var i = 0, element; element = elements[i]; i++) {
        var href = element.href;
        var href = href.replace(/[?&]cssReloader=([^&$]*)/, '');
        element.href = href + (href.indexOf('?') >= 0 ? '&' : '?') + 'cssReloader=' + (new Date().valueOf());
    }
}

window.alreadyExecuted = true;
