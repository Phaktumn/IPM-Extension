const ClosedStateValue = 'close';
const OpenStateValue = 'open';
const StateAttributeName = 'state';
const baseUrl = 'http://ipm.macwin.pt:83/';
const pages = [
    { url: `task_dashboard.html`, handler: processTaskDashboard },
    { url: `clients.html`, handler: processClientsPage },
    { url: `task_communication.html`, handler: processTasksPage },
    { url: 'tasks.html', handler: processTasksPage }
]

pages.forEach(({ url, handler }) => {
    if (window.location.href === `${baseUrl}${url}`) {
        try {
            handler();
        } catch (error) {
            console.error(`Error processing ${url}:`, error);
        }
    }
})

function processTasksPage() {
    document.querySelectorAll('#searchMyTasks-form > fieldset > dl > dt')
        .forEach(label => label.classList.add('pt-10'));
}

function processClientsPage() {
    let actions = document.querySelectorAll('td.actions');
    actions.forEach(async element => {
        try {
            let codCliente = element.parentElement.getAttribute('data-code');
            let copySpan = element.querySelector('span#copy-path');
            let folderLink = copySpan?.getAttribute('data-server-folder-link') || '';

            const { options } = await chrome.storage.local.get("options");
            if (options?.fileCheck === "true") {
                folderLink += `\\${codCliente}.txt`;
            }

            let taskClientBtn = element.querySelector('span#create-task-client');
            copySpan?.remove();

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
            console.error('Error processing client actions:', error);
        }
    });
}

function processTaskDashboard() {
    let headers = document.querySelectorAll("#tbl_tasks > tbody > tr[data-title=data-subtitle]");

    headers.forEach(header => {
        let headerRowContent = header.querySelector('td');
        var text = headerRowContent.innerText;
        headerRowContent.innerText = '';

        let button = createButton(text);
        headerRowContent.appendChild(button);

        changeLinesState(header, button, changeState(header, ClosedStateValue));

        button.addEventListener('click', (e) => {
            changeLinesState(header, e.target.parentElement, changeState(header));
        });

    });

    function changeState(element, state = null) {
        let open = false;
        let stateAttribute = element.getAttribute(StateAttributeName);
        if (stateAttribute === null) 
            stateAttribute = ClosedStateValue;
        open = stateAttribute === OpenStateValue;
        element.setAttribute(StateAttributeName,
            state && (state === OpenStateValue || state === ClosedStateValue) ?
                state :
                open ? ClosedStateValue : OpenStateValue);
        return element.getAttribute(StateAttributeName) === OpenStateValue;
    }

    /**
     * Creates a button with a icon and label
     * @param {*} text Label content
     * @returns Button Element
     */
    function createButton(text) {
        let button = document.createElement('button');
        button.className = 'expand-button';

        let buttonlabel = document.createElement('span');
        buttonlabel.className = 'expand-btn-label';
        buttonlabel.innerText = text
            .replace(/\s/g, '')
            .replace('Ordenar', '')
            .replace(/([A-Z])/g, " $1").trim();

        let btnIcon = document.createElement('span');
        btnIcon.className = 'material-icons material-symbols-rounded btnIcon';
        btnIcon.innerText = 'arrow_drop_up'

        button.appendChild(btnIcon);
        button.appendChild(buttonlabel);

        return button;
    }

    function changeLinesState(header, btn, state) {
        let btnIcon = btn.querySelector('span.btnIcon');
        btnIcon.innerText = state ? 'arrow_drop_up' : 'arrow_drop_down';
        let sibling = header.nextElementSibling;
        while (sibling && !sibling.classList.contains('header')) {
            sibling.style.visibility = state ? 'visible' : 'collapse';
            sibling = sibling.nextElementSibling;
        }
    }

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
    if (message.method === 'reload') {
        reloadStyles();
        sendResponse({ ok: true });
    }
});

function reload() {
    document.querySelectorAll('link[rel=stylesheet][href]').forEach(link => {
        link.href = link.href.replace(/[?&]cssReloader=\d+/, '') + `?cssReloader=${Date.now()}`;
    });
}

window.alreadyExecuted = true;
