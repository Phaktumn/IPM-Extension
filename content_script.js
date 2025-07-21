const ClosedStateValue = 'close';
const OpenStateValue = 'open';
const StateAttributeName = 'state';
const baseUrl = 'http://ipm.macwin.pt:83/';
const pages = [
    { url: ``, handler: processDefault },
    { url: `task_dashboard.html`, handler: processTaskDashboard },
    { url: `clients.html`, handler: processClientsPage },
    { url: `task_communication.html`, handler: processTasksPage },
    { url: 'tasks.html', handler: processTasksPage },
    { url: 'week_progress.html', handler: processWeekProgress }
]

pages.forEach(({ url, handler }) => {
    if (window.location.href.includes(`${baseUrl}${url}`) || url.length === 0) {
        try {
            handler();
        } catch (error) {
            console.log(`Error processing ${url}:`, error);
        }
    }
})
/** 
 * Reestruturar o HEADER
 * 
 * "element.appendChild" utizado para mover os Elementos 
 */
function processDefault() {
    const header = document.querySelector("body > header");
    const userInfo = document.querySelector("#header-user-info");
    const menu = document.querySelector("#main-menu");


    header.appendChild(menu);
    header.appendChild(userInfo);

    document.querySelector("#main_nav").remove();

    const logoutRef = "/logout.html";
    const name = userInfo.querySelector("p > a").textContent;
    const accountRef = "/account/account.html";

    userInfo.remove();

    header.append(
        createElement(
            'section',
            {
                style: "width: auto; display: flex;"
            },
            [
                createElement(
                    'div',
                    {
                        style: "align-self: center; align-self: center; margin-bottom: 5px;"
                    },
                    [
                        createElement(
                            'a',
                            {
                                style: "text-decoration: none; color: var(--text);",
                                href: accountRef
                            },
                            [
                                name
                            ]
                        )
                    ]
                ),
                createElement(
                    'button',
                    {
                        class: "logout-btn"
                    },
                    [
                        createElement(
                            'a',
                            {
                                style: "text-decoration: none; color: var(--text);",
                                class: "material-icons material-symbols-rounded",
                                href: logoutRef
                            },
                            [
                                "logout"
                            ]
                        )
                    ]
                )
            ]
        )
    );
}

document.querySelectorAll("#tbl_weekly").forEach((table) => {
    if (!table.closest("form")) {
        table.classList.remove("tbl_tasks");
        table.classList.add("tbl_time");
    } else {
        table.classList.remove("tbl_tasks");
        table.classList.add("form_table");
    }
});


function aplicarCorNasCelulas() {
    const linhas = document.querySelectorAll('#tbl_weekly.tbl_time > tfoot > tr');

    linhas.forEach(linha => {
        const celulas = linha.querySelectorAll('td');


        for (let i = 0; i < Math.min(celulas.length, 6); i++) {
            const td = celulas[i];
            const textoOriginal = td.textContent.trim();

            const match = textoOriginal.match(/^(\d{1,2}):(\d{2})$/);
            if (!match) continue;

            const horas = parseInt(match[1], 10);
            const minutos = parseInt(match[2], 10);
            const total = horas * 60 + minutos; 

            if (total < 420) {
                td.classList.add('highlight-time');
            }
        }
    });
}


if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", aplicarCorNasCelulas);
} else {
    aplicarCorNasCelulas();
}


function aplicarCorNasColunas() {
    const tabelas = document.querySelectorAll('#tbl_weekly.tbl_time');

    tabelas.forEach(tabela => {
        const corpo = tabela.querySelector('tbody');
        if (!corpo) return;

        const linhas = corpo.querySelectorAll('tr');
        const totalLinhas = linhas.length;

        linhas.forEach((linha, index) => {
            const celulas = linha.querySelectorAll('td');

            if (celulas.length >= 11) {
                // Aplica a cor nas colunas 10 e 11
                celulas[9].style.backgroundColor = '#ced4da80'; // 10ª coluna
                celulas[10].style.backgroundColor = '#ced4da80'; // 11ª coluna
                celulas[9].style.opacity = '0.4';
                celulas[10].style.opacity = '0.4';


                // Aplica border-radius apenas na 11ª coluna da primeira e última linha
                if (index === 0) {
                    celulas[10].style.borderTopRightRadius = '10px';
                }
                if (index === totalLinhas - 1) {
                    celulas[10].style.borderBottomRightRadius = '10px';
                }
            }
        });
    });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", aplicarCorNasColunas);
} else {
    aplicarCorNasColunas();
}




const observer = new MutationObserver(() => aplicarCorNasCelulas());
observer.observe(document.body, { childList: true, subtree: true });



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

function processWeekProgress() {
    const main = document.querySelector('#main');
    const prevElement = document.querySelector("#table-configure-columns");

    document.querySelector("#main > h2").remove();
    document.querySelectorAll("#main > div")[8].remove();

    let cy = getCurrentYear();
    let cw = getISOWeekOfYear(new Date());

    const params = getUrlParams();
    const year = !params.year ? cy : params.year;
    const week = !params.week ? cw : params.week;
    const selectedYear = parseInt(year);
    const selectedWeek = parseInt(week);

    function highlightText() {
        let searchText = document.getElementById("searchBox").value.toLowerCase();
        let table = document.getElementById("tbl_weekly");
        let cells = table.querySelectorAll("td>span>a");
        for (let cell of cells) {
            let text = cell.textContent.toLowerCase();
            if (searchText && text.includes(searchText)) {
                cell.classList.add("highlight");
            } else {
                cell.classList.remove("highlight");
            }
        }
    }

    function getMonthName(monthNumber) {
        const months = [
            "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
            "Jul", "Ago", "Set", "Out", "Nov", "Dez"
        ];
        return months[monthNumber];
    }

    const prevWeekDays = getWeekStartEnd(selectedYear, selectedWeek - 1);
    const currentWeekDays = getWeekStartEnd(selectedYear, selectedWeek);
    const nextWeekDays = getWeekStartEnd(selectedYear, selectedWeek + 1);

    prevElement.insertAdjacentHTML('afterend',
        `<div style="display: flex;">
      <div id="progressyearscontainer" style="padding: 1rem;">
        <select id="progressyears">
          <option ${selectedYear === 2026 ? "selected" : ""} value="2026">2026</option>  
          <option ${selectedYear === 2025 ? "selected" : ""} value="2025">2025</option>
          <option ${selectedYear === 2024 ? "selected" : ""} value="2024">2024</option>
          <option ${selectedYear === 2023 ? "selected" : ""} value="2023">2023</option>
          <option ${selectedYear === 2022 ? "selected" : ""} value="2022">2022</option>
          <option ${selectedYear === 2021 ? "selected" : ""} value="2021">2021</option>
        </select>
      </div>

      <div id="progressweekcontainer">
        <div class="weekselect">
          <button id="prevweek" style="margin-left: 10px;">
            <span class="material-icons material-symbols-rounded">chevron_left</span>
          </button>

          <a href="week_progress.html?week=${selectedWeek - 1 <= 0 ? 52 : selectedWeek - 1}&year=${selectedWeek - 1 <= 0 ? selectedYear - 1 : selectedYear}" id="bt-prevweek" style="margin: 5px;">
            ${prevWeekDays.startDate.getDate()} ${getMonthName(prevWeekDays.startDate.getMonth())} - ${prevWeekDays.endDate.getDate()} ${getMonthName(prevWeekDays.endDate.getMonth())}
          </a>
          <div id="currweek" class="current-week" style="margin: 5px;">
            ${currentWeekDays.startDate.getDate()} ${getMonthName(currentWeekDays.startDate.getMonth())} - ${currentWeekDays.endDate.getDate()} ${getMonthName(currentWeekDays.endDate.getMonth())}
          </div>
          <a href="week_progress.html?week=${selectedWeek + 1 > 52 ? 1 : selectedWeek + 1}&year=${selectedWeek + 1 > 52 ? selectedYear + 1 : selectedYear}" id="bt-nextweek" style="margin: 5px;">
            ${nextWeekDays.startDate.getDate()} ${getMonthName(nextWeekDays.startDate.getMonth())} - ${nextWeekDays.endDate.getDate()} ${getMonthName(nextWeekDays.endDate.getMonth())}
          </a>

          <button id="nextweek" class="" style="margin-right: 10px;">
            <span class="material-icons material-symbols-rounded">chevron_right</span>
          </button>
        </div>
      </div>

      <div id="searchBoxInput" class="" style="display: flex; align-items: anchor-center;">
        <span class="material-icons material-symbols-rounded search-icon">search</span>
        <input style="border: none; width: 100%;" type="text" id="searchBox" placeholder="Enter text to highlight">
      </div>
    </div>`
    );

    function moveWeek(moveAmount) {
        let newWeekValue = selectedWeek + moveAmount;
        let newYearValue = selectedYear;

        if (newWeekValue <= 0) {
            newWeekValue = 52 + newWeekValue;
            newYearValue = selectedYear - 1;
        } else if (newWeekValue > 52) {
            newWeekValue = newWeekValue - 52; 
            newYearValue = selectedYear + 1;
        }

        const url = `week_progress.html?week=${newWeekValue}&year=${newYearValue}`;
        createElement(
            'a',
            {
                href: url
            }
        ).click();
    }

    document.querySelector("#prevweek").addEventListener('click', (e) => {
        moveWeek(-1);
    });
    document.querySelector("#nextweek").addEventListener('click', (e) => {
        moveWeek(1);
    });

    document.querySelector('#searchBox').addEventListener(
        'input',
        () => {
            console.log('Input!');
            highlightText();
        }
    );

    document.querySelector('#progressyears').addEventListener(
        'change',
        (event) => {
            const params = getUrlParams();
            const url = `week_progress.html?week=${params.week}&year=${event.target.value}`;
            createElement(
                'a',
                {
                    href: url
                }
            ).click();
        }
    );



    const docImages = document.querySelectorAll("img.note");
    docImages.forEach((e) => {
        let parent = e.parentElement;
        parent.className = "material-symbols-outlined";
        parent.style.fontSize = "medium";
        parent.style.float = "right";
        parent.style.padding = "2px";
        parent.textContent = 'summarize';
    });

    const docSave = document.querySelector(".shortcutAddEditBtn");
    docSave.className = "material-symbols-outlined";
    docSave.style.fontSize = "x-large";
    docSave.style.fontWeight = '100';
    docSave.style.float = "right";
    docSave.style.padding = "2px";
    docSave.textContent = 'save';


    const tbT = document.querySelector("#table_add_columns");
    tbT.className = "material-symbols-outlined";
    tbT.style.fontSize = "medium";
    tbT.style.fontWeight = '100';
    tbT.style.float = "right";
    tbT.style.padding = "2px";
    tbT.textContent = 'manufacturing';

}

document.addEventListener("DOMContentLoaded", function () {
    let clientDiv = document.getElementById("s2id_client1");
    let projectDiv = document.getElementById("s2id_project1");

    if (clientDiv) {
        clientDiv.style.width = "100px"; 
        clientDiv.classList.add("updated-client"); 
    }

    if (projectDiv) {
        projectDiv.style.width = "270px"; 
        projectDiv.classList.add("updated-project"); 
    }
});

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

document.querySelectorAll('table#tbl_hierarchy td:nth-child(5)').forEach(td => {
  const texto = td.textContent.trim().toLowerCase();

  if (texto === 'assistência') {
    td.classList.add('assistencia');
  } else if (texto === 'bug') {
    td.classList.add('bug');
  } else if (texto === 'continuidade') {
    td.classList.add('continuidade');
  } else if (texto === 'formação') {
    td.classList.add('formacao');
  } else if (texto === 'implementação') {
    td.classList.add('implementacao');
  } else if (texto === 'tech improv') {
    td.classList.add('tech_improv');
  } else if (texto === 'tech improv om8') {
    td.classList.add('melhoria_tecnica_om8');
  } else if (texto === 'new func') {
    td.classList.add('new_func');
  } else if (texto === 'new func om8') {
    td.classList.add('nova_funcao_om8');
  } else if (texto === 'outras nd') {
    td.classList.add('outras_nao_debitar');
  } else if (texto === 'reuniões') {
    td.classList.add('reunioes');
  } else if (texto === 'tarefa') {
    td.classList.add('tarefa');
  } else if (texto === 'agr') {
    td.classList.add('tarefa_agrupadora');
  }
});


document.querySelectorAll('table#tbl_hierarchy td:nth-child(5)').forEach(td => {
  const texto = td.textContent.trim().toLowerCase();

  if (texto === 'assistência') {
    td.classList.add('assistencia');
  } else if (texto === 'bug') {
    td.classList.add('bug');
  } else if (texto === 'continuidade') {
    td.classList.add('continuidade');
  } else if (texto === 'formação') {
    td.classList.add('formacao');
  } else if (texto === 'implementação') {
    td.classList.add('implementacao');
  } else if (texto === 'tech improv') {
    td.classList.add('tech_improv');
  } else if (texto === 'tech improv om8') {
    td.classList.add('melhoria_tecnica_om8');
  } else if (texto === 'new func') {
    td.classList.add('new_func');
  } else if (texto === 'new func om8') {
    td.classList.add('nova_funcao_om8');
  } else if (texto === 'outras nd') {
    td.classList.add('outras_nao_debitar');
  } else if (texto === 'reuniões') {
    td.classList.add('reunioes');
  } else if (texto === 'tarefa') {
    td.classList.add('tarefa');
  } else if (texto === 'agr') {
    td.classList.add('tarefa_agrupadora');
  }
});

document.querySelectorAll('table.tbl_tasks td.t_type').forEach(td => {
  const texto = td.textContent.trim().toLowerCase();

  if (texto === 'assistência') {
    td.classList.add('assistencia');
  } else if (texto === 'bug') {
    td.classList.add('bug');
  } else if (texto === 'continuidade') {
    td.classList.add('continuidade');
  } else if (texto === 'formação') {
    td.classList.add('formacao');
  } else if (texto === 'implementação') {
    td.classList.add('implementacao');
  } else if (texto === 'tech improv') {
    td.classList.add('tech_improv');
  } else if (texto === 'tech improv om8') {
    td.classList.add('melhoria_tecnica_om8');
  } else if (texto === 'new func') {
    td.classList.add('new_func');
  } else if (texto === 'new func om8') {
    td.classList.add('nova_funcao_om8');
  } else if (texto === 'outras nd') {
    td.classList.add('outras_nao_debitar');
  } else if (texto === 'reuniões') {
    td.classList.add('reunioes');
  } else if (texto === 'tarefa') {
    td.classList.add('tarefa');
  } else if (texto === 'agr') {
    td.classList.add('tarefa_agrupadora');
  }
});



function replaceImgByIcon(titleText, iconName) {
  const imgs = document.querySelectorAll(`img[title="${titleText}"]`);
  imgs.forEach(img => {
    const icon = document.createElement('span');
    icon.className = 'material-symbols-outlined icon-alinhado-com-header-menu-link';
    icon.title = img.title;
    icon.setAttribute('aria-label', img.alt || titleText);
    icon.textContent = iconName;
    icon.style.color = '#3B4758';
    icon.style.fontSize = '24px';
    icon.style.verticalAlign = 'middle';
    icon.style.lineHeight = '1';
    img.parentNode.replaceChild(icon, img);
  });
}


function replaceImgByIconByClass(imgClass, iconName) {
  const imgs = document.querySelectorAll(`img.${imgClass}`);
  imgs.forEach(img => {
    const icon = document.createElement('span');
    icon.className = 'material-symbols-outlined icon-alinhado-com-header-menu-link';
    icon.title = img.title || iconName;
    icon.setAttribute('aria-label', img.alt || iconName);
    icon.textContent = iconName;

    icon.style.color = '#3B4758';
    icon.style.fontSize = '18px';
    icon.style.verticalAlign = 'middle';
    icon.style.lineHeight = '1';

    img.parentNode.replaceChild(icon, img);
  });
}


function replaceImgByIconBySrc(imgSrc, iconName) {
  const imgs = document.querySelectorAll(`img[src="${imgSrc}"]`);
  imgs.forEach(img => {
    const icon = document.createElement('span');
    icon.className = 'material-symbols-outlined icon-alinhado-com-header-menu-link';
    icon.title = img.title || iconName;
    icon.setAttribute('aria-label', img.alt || iconName);
    icon.textContent = iconName;

    icon.style.color = '#3B4758';
    icon.style.fontSize = '20px';
    icon.style.verticalAlign = 'middle';
    icon.style.lineHeight = '1';

    img.parentNode.replaceChild(icon, img);


    const btn = icon.closest('button[type="submit"]');
    if (btn) {
      btn.style.display = 'flex';
      btn.style.alignItems = 'center';
      btn.style.gap = '6px';
    }
  });
}

const progressImg = document.querySelector('#progress img');
if (progressImg) {
  progressImg.classList.add('progress-icon');
  replaceImgByIconByClass('progress-icon', 'update');
}

  replaceImgByIconByClass('title_info', 'info');
  replaceImgByIcon('Editar', 'edit');
  replaceImgByIcon('Add', 'add');
  replaceImgByIcon('Editar atalho', 'edit_document');
  replaceImgByIcon('Adicionar atalho', 'bookmark_add');
  replaceImgByIcon('Update progress', 'update');
  replaceImgByIconBySrc('/images/table_refresh.png', 'change_circle');
  replaceImgByIconBySrc('/images/time_go.png', 'update');
  replaceImgByIconBySrc('/images/star-on.png', 'star');
  replaceImgByIconBySrc('/images/validation.png', 'check');
  replaceImgByIconBySrc('/images/tick.png', 'done_all');
  replaceImgByIconBySrc('/images/progress.png', 'task_alt');
  replaceImgByIconBySrc('/images/pencil_go.png', 'file_copy');
  replaceImgByIconBySrc('/images/pencil.png', 'edit');
  replaceImgByIconBySrc('/images/email_add.png', 'mail');
  replaceImgByIconBySrc('/images/email.png', 'mail');
  replaceImgByIconBySrc('/images/note.png', 'add_notes');
  replaceImgByIconBySrc('/images/time.png', 'schedule');
  replaceImgByIconBySrc('/images/magnifier.png', 'search');
  replaceImgByIconBySrc('/images/pencil_add.png', 'add_task');
  replaceImgByIconBySrc('/images/time_sm.png', 'schedule');
  replaceImgByIconBySrc('/images/attach_sm.png', 'attach_file');
  replaceImgByIconBySrc('/images/hier.png', 'device_hub');
  replaceImgByIconBySrc('/images/note10x10_gray.png','add_comment');
  replaceImgByIconBySrc('/images/attach.png', 'attach_file');
  replaceImgByIconBySrc('/images/note10x10_gray.png','add_comment');
  replaceImgByIconBySrc('/images/pencil.png','edit');
  replaceImgByIconBySrc('/images/bin_closed.png','delete');



const btn1 = document.getElementById('progress');
const btn2 = document.getElementById('cleanFilters');

if (btn1 && btn2) {
  const container = document.createElement('div');
  container.id = 'button-container';
  container.style.display = 'flex';
  container.style.gap = '10px';
  container.style.alignItems = 'center';

  btn1.parentNode.insertBefore(container, btn1);

  container.appendChild(btn1);
  container.appendChild(btn2);
}


document.querySelectorAll('#progress, #cleanFilters').forEach(btn => {
  btn.classList.add('button-icon');
  btn.removeAttribute('style'); 
});



const userSection = document.querySelector('body > header > section:nth-child(3)');

if (userSection) {
  const avatar = document.createElement('div');
  avatar.classList.add('user-avatar');
  avatar.textContent = 'ML'; 

  const userLink = userSection.querySelector('a[href="/account/account.html"]');

  if (userLink) {
    const parent = userLink.parentNode;
    parent.insertBefore(avatar, userLink);
  } else {
    userSection.appendChild(avatar);
  }
}

const dts = document.querySelectorAll('dl dt');
const filterInput = document.querySelector('input#filter');

if (filterInput) {

  dts.forEach(dt => {
    const label = dt.querySelector('label');
    if (label && label.getAttribute('for') === 'filter') {
      dt.style.marginBottom = '5px';
    }
  });
}



const celulasTipo = document.querySelectorAll("table.tbl_tasks td.t_type");

if (celulasTipo.length > 0) {
  const primeira = celulasTipo[0];
  primeira.style.borderTopLeftRadius = "3px";
  primeira.style.borderTopRightRadius = "3px";

  const ultima = celulasTipo[celulasTipo.length - 1];
  ultima.style.borderBottomLeftRadius = "3px";
  ultima.style.borderBottomRightRadius = "3px";
}


document.querySelectorAll('#save').forEach(btn => {
  if (btn.classList.contains('buttons_new_progress_update')) {
    btn.id = 'save-progress-update';
  } else {
    btn.id = 'save-unique';
  }
});


const saveBtn = document.querySelector('#save-progress-update');
const cancelBtn = document.querySelector('#clear');

if (saveBtn && cancelBtn) {
  const wrapper = document.createElement('div');
  wrapper.style.display = 'flex';
  wrapper.style.justifyContent = 'flex-end'; 
  wrapper.style.gap = '10px'; 
  wrapper.style.marginBottom = '10px'; 


  cancelBtn.parentNode.insertBefore(wrapper, cancelBtn);
  wrapper.appendChild(saveBtn);
  wrapper.appendChild(cancelBtn);
}


const dtElements = document.querySelectorAll('dt');

dtElements.forEach((dt, index) => {
  if (dt.textContent.trim() === 'Detalhes') {
    if (index + 1 < dtElements.length) {
      dtElements[index + 1].id = 'lbl_anexos';
    }
  }
});


const lblDetails = document.getElementById('lbl_details');
const lblAnexos = document.getElementById('lbl_anexos');

if (lblDetails && lblAnexos) {
  const style = window.getComputedStyle(lblDetails);

  lblAnexos.style.display = style.display;
  lblAnexos.style.width = style.width;
  lblAnexos.style.padding = style.padding;
  lblAnexos.style.background = style.background;
  lblAnexos.style.verticalAlign = style.verticalAlign;
  lblAnexos.style.margin = '0';
  lblAnexos.style.clear = 'left'; 
}


for (let i = 1; i <= 15; i++) {
  const el = document.getElementById(`select2-results-${i}`);
  if (el) {
    el.classList.add('custom-select2-results');
  }
}


document.querySelectorAll('#conversations-body > tr > td:nth-child(1) > span').forEach(span => {
  span.setAttribute('aria-describedby', 'ui-tooltip-9');
});
console.log('aria-describedby adicionado em todos spans da primeira coluna');

document.addEventListener("DOMContentLoaded", () => {
const ids = [
  "#s2id_updateTaskList0\\.task\\.parentId",
  "#updateTaskList0\\.task\\.typeId",
  "#stateId_0",
  "#s2id_updateTaskList0\\.task\\.currentUserId",
  "#s2id_updateTaskList0\\.task\\.managerId",
  "#forDate0",
  "#hours0",
  "#hours_other0",
  "#timeCodeId0"
];

ids.forEach(id => {
  const el = document.querySelector(id);
  if(el) {
    el.classList.add("input_new_update_progress", "select_task");
  }
  });
});

window.onload = () => {
  const projectExtract = document.querySelector("#project-extract");
  if (!projectExtract) return;

  const table = projectExtract.querySelector("table");
  if (!table) return;

  const paiDaTabela = table.parentElement;

  const inputFiltro = document.createElement("input");
  inputFiltro.placeholder = "Filtrar e destacar...";
  inputFiltro.style.marginBottom = "10px";
  inputFiltro.style.display = "block";
  inputFiltro.style.width = "200px";
  inputFiltro.style.padding = "5px";

  paiDaTabela.insertBefore(inputFiltro, table);

  inputFiltro.addEventListener("input", () => {
    const filtro = inputFiltro.value.toLowerCase();
    let firstMatchFound = null; 

    table.querySelectorAll("td").forEach(td => {
      td.style.backgroundColor = ""; 
    });

    if (!filtro) return;

    table.querySelectorAll("td").forEach(td => {
      if (td.textContent.toLowerCase().includes(filtro)) {
        td.style.backgroundColor = "#fff8e1";
        if (!firstMatchFound) { 
          firstMatchFound = td; 
        }
      }
    });

    if (firstMatchFound) {
      firstMatchFound.scrollIntoView({
        behavior: "smooth", 
        block: "center" 
      });
    }
  });
};


