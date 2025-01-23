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

/**
 * IPM STUFF
 */
if (window.location.href === 'http://ipm.macwin.pt:83/clients.html') {

    var currentUrl = window.location.href;
    if (currentUrl.endsWith('/')) {
        currentUrl = currentUrl.slice(0, -1);
    }
    let actions = document.querySelectorAll('td.actions');
    actions.forEach(element => {
        try {
            var copySpan = element.querySelector('span#copy-path');
            let folderLink = copySpan.getAttribute('data-server-folder-link');
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

/**
 * CHECK PAGE
 */
console.log(window.location.href);
if (window.location.href === 'http://ipm.macwin.pt:83/task_dashboard.html') {
    try {
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
    catch (e) {
        //
    }
}

if (window.location.href === 'http://ipm.macwin.pt:83/task_communication.html') {
    //#searchTasksInfo-form > fieldset > dl
    const labels = document.querySelectorAll('#searchTasksInfo-form > fieldset > dl > dt');
    if (labels) {
        labels.forEach(element => {
            element.style.marginTop = '10px';
        });
    }
}

if (window.location.href === 'http://ipm.macwin.pt:83/tasks.html') {
    const labels = document.querySelectorAll('#searchMyTasks-form > fieldset > dl > dt');
    labels.forEach(x => { x.classList.add('pt-10'); });
}


window.alreadyExecuted = true;

/*
const dpbtns = document.querySelectorAll('#ui-datepicker-div>div>a');
dpbtns.forEach(element => {
    element.classList.add('material-icons', 'material-symbols-rounded');
    element.textContent = 'content_copy'; 
});*/
