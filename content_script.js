const ClosedStateValue = "close";
const OpenStateValue = "open";
const StateAttributeName = "state";
const baseUrl = "http://ipm.macwin.pt:83/";
const pages = [
  { url: ``, handler: processDefault },
  { url: `task_dashboard.html`, handler: processTaskDashboard },
  { url: `clients.html`, handler: processClientsPage },
  { url: `task_communication.html`, handler: processTasksPage },
  { url: "tasks.html", handler: processTasksPage },
  { url: "week_progress.html", handler: processWeekProgress },
];

pages.forEach(({ url, handler }) => {
  if (window.location.href.includes(`${baseUrl}${url}`) || url.length === 0) {
    try {
      handler();
    } catch (error) {
      console.log(`Error processing ${url}:`, error);
    }
  }
});

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
      "section",
      {
        style: "width: auto; display: flex;",
      },
      [
        createElement(
          "div",
          {
            style:
              "align-self: center; align-self: center; margin-bottom: 5px;",
          },
          [
            createElement(
              "a",
              {
                style: "text-decoration: none; color: var(--text);",
                href: accountRef,
              },
              [name]
            ),
          ]
        ),
        createElement(
          "button",
          {
            class: "logout-btn",
          },
          [
            createElement(
              "a",
              {
                style: "text-decoration: none; color: var(--text);",
                class: "material-icons material-symbols-rounded",
                href: logoutRef,
              },
              ["logout"]
            ),
          ]
        ),
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

/**
 * Percorre as linhas do rodapé de tabelas com o ID `tbl_weekly` e a classe `tbl_time`.
 * Para cada uma das primeiras 6 células (colunas) de cada linha, verifica se o conteúdo
 * textual da célula é um horário no formato HH:MM. Se for um horário válido e inferior
 * a 7 horas (420 minutos), adiciona a classe `highlight-time` à célula.
 */
function aplicarCorNasCelulas() {
  const linhas = document.querySelectorAll("#tbl_weekly.tbl_time > tfoot > tr");

  linhas.forEach((linha) => {
    const celulas = linha.querySelectorAll("td");

    for (let i = 0; i < Math.min(celulas.length, 6); i++) {
      const td = celulas[i];
      const textoOriginal = td.textContent.trim();

      // Verifica se o conteúdo está no formato HH:MM
      const match = textoOriginal.match(/^(\d{1,2}):(\d{2})$/);
      if (!match) continue; // Se não for um horário válido, não faz nada.

      const horas = parseInt(match[1], 10);
      const minutos = parseInt(match[2], 10);
      const total = horas * 60 + minutos; // Converte para minutos totais.

      // Se o total de minutos for menor que 420 (7 horas), adiciona a classe
      if (total < 420) {
        td.classList.add("highlight-time");
      }
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", aplicarCorNasCelulas);
} else {
  aplicarCorNasCelulas();
}

/**
 * Percorre as tabelas com o ID `tbl_weekly` e a classe `tbl_time`.
 * Para cada tabela, itera sobre as linhas do seu corpo (`tbody`).
 * Se uma linha tiver pelo menos 11 células (`td`), aplica um estilo específico à 10ª e 11ª células:
 * - Define a cor de fundo para `#ced4da80`.
 * - Define a opacidade para `0.4`.
 * Adicionalmente, aplica um `border-radius` ao canto superior direito da 11ª célula da primeira linha
 * e ao canto inferior direito da 11ª célula da última linha do corpo da tabela.
 */
function aplicarCorNasColunas() {
  const tabelas = document.querySelectorAll("#tbl_weekly.tbl_time");

  tabelas.forEach((tabela) => {
    const corpo = tabela.querySelector("tbody");
    if (!corpo) return;

    const linhas = corpo.querySelectorAll("tr");
    const totalLinhas = linhas.length;

    linhas.forEach((linha, index) => {
      const celulas = linha.querySelectorAll("td");

      if (celulas.length >= 11) {
        // Aplica a cor nas colunas 10 e 11
        celulas[9].style.backgroundColor = "#ced4da80"; // 10ª coluna
        celulas[10].style.backgroundColor = "#ced4da80"; // 11ª coluna
        celulas[9].style.opacity = "0.4";
        celulas[10].style.opacity = "0.4";

        // Aplica border-radius apenas na 11ª coluna da primeira e última linha
        if (index === 0) {
          celulas[10].style.borderTopRightRadius = "10px";
        }
        if (index === totalLinhas - 1) {
          celulas[10].style.borderBottomRightRadius = "10px";
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

/**
 * Qualquer tipo de alteração na DOM o observer vai chamar a função aplicarCorNasCelulas()
 */
const observer = new MutationObserver(() => aplicarCorNasCelulas());
observer.observe(document.body, { childList: true, subtree: true });

function processTasksPage() {
  document
    .querySelectorAll("#searchMyTasks-form > fieldset > dl > dt")
    .forEach((label) => label.classList.add("pt-10"));
}

function processClientsPage() {
  let actions = document.querySelectorAll("td.actions");
  actions.forEach(async (element) => {
    try {
      let codCliente = element.parentElement.getAttribute("data-code");
      let copySpan = element.querySelector("span#copy-path");
      let folderLink = copySpan?.getAttribute("data-server-folder-link") || "";

      const { options } = await chrome.storage.local.get("options");
      if (options?.fileCheck === "true") {
        folderLink += `\\${codCliente}.txt`;
      }

      let taskClientBtn = element.querySelector("span#create-task-client");
      copySpan?.remove();

      let newSpan = document.createElement("span");
      newSpan.innerText = "content_copy";
      newSpan.id = "open-path";
      newSpan.className =
        "material-icons material-symbols-rounded md-20 md-mcw-red";
      newSpan.title = "Abrir";
      newSpan.folderLink = folderLink;
      newSpan.addEventListener("click", (e) => {
        e.stopPropagation();
        chrome.runtime.sendMessage({
          method: "openLocalFile",
          localFileUrl: folderLink,
        });
      });
      element.insertBefore(newSpan, taskClientBtn);
    } catch (error) {
      console.error("Error processing client actions:", error);
    }
  });
}

function processWeekProgress() {
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
      "Jan",
      "Fev",
      "Mar",
      "Abr",
      "Mai",
      "Jun",
      "Jul",
      "Ago",
      "Set",
      "Out",
      "Nov",
      "Dez",
    ];
    return months[monthNumber];
  }

  const prevWeekDays = getWeekStartEnd(selectedYear, selectedWeek - 1);
  const currentWeekDays = getWeekStartEnd(selectedYear, selectedWeek);
  const nextWeekDays = getWeekStartEnd(selectedYear, selectedWeek + 1);

  prevElement.insertAdjacentHTML(
    "afterend",
    `<div style="display: flex;">
      <div id="progressyearscontainer" style="padding: 1rem;">
        <select id="progressyears">
          <option ${
            selectedYear === 2026 ? "selected" : ""
          } value="2026">2026</option>  
          <option ${
            selectedYear === 2025 ? "selected" : ""
          } value="2025">2025</option>
          <option ${
            selectedYear === 2024 ? "selected" : ""
          } value="2024">2024</option>
          <option ${
            selectedYear === 2023 ? "selected" : ""
          } value="2023">2023</option>
          <option ${
            selectedYear === 2022 ? "selected" : ""
          } value="2022">2022</option>
          <option ${
            selectedYear === 2021 ? "selected" : ""
          } value="2021">2021</option>
        </select>
      </div>

      <div id="progressweekcontainer">
        <div class="weekselect">
          <button id="prevweek" style="margin-left: 10px;">
            <span class="material-icons material-symbols-rounded">chevron_left</span>
          </button>

          <a href="week_progress.html?week=${
            selectedWeek - 1 <= 0 ? 52 : selectedWeek - 1
          }&year=${
      selectedWeek - 1 <= 0 ? selectedYear - 1 : selectedYear
    }" id="bt-prevweek" style="margin: 5px;">
            ${prevWeekDays.startDate.getDate()} ${getMonthName(
      prevWeekDays.startDate.getMonth()
    )} - ${prevWeekDays.endDate.getDate()} ${getMonthName(
      prevWeekDays.endDate.getMonth()
    )}
          </a>
          <div id="currweek" class="current-week" style="margin: 5px;">
            ${currentWeekDays.startDate.getDate()} ${getMonthName(
      currentWeekDays.startDate.getMonth()
    )} - ${currentWeekDays.endDate.getDate()} ${getMonthName(
      currentWeekDays.endDate.getMonth()
    )}
          </div>
          <a href="week_progress.html?week=${
            selectedWeek + 1 > 52 ? 1 : selectedWeek + 1
          }&year=${
      selectedWeek + 1 > 52 ? selectedYear + 1 : selectedYear
    }" id="bt-nextweek" style="margin: 5px;">
            ${nextWeekDays.startDate.getDate()} ${getMonthName(
      nextWeekDays.startDate.getMonth()
    )} - ${nextWeekDays.endDate.getDate()} ${getMonthName(
      nextWeekDays.endDate.getMonth()
    )}
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
    // Calculate new week value
    let newWeekValue = selectedWeek + moveAmount;
    let newYearValue = selectedYear;

    // Handle year boundary crossing
    if (newWeekValue <= 0) {
      newWeekValue = 52 + newWeekValue; // If negative, wrap around from the end of previous year
      newYearValue = selectedYear - 1;
    } else if (newWeekValue > 52) {
      newWeekValue = newWeekValue - 52; // If exceeds 52, wrap around to the start of next year
      newYearValue = selectedYear + 1;
    }

    const url = `week_progress.html?week=${newWeekValue}&year=${newYearValue}`;
    createElement("a", {
      href: url,
    }).click();
  }

  document.querySelector("#prevweek").addEventListener("click", () => {
    moveWeek(-1);
  });
  document.querySelector("#nextweek").addEventListener("click", () => {
    moveWeek(1);
  });

  document.querySelector("#searchBox").addEventListener("input", () => {
    console.log("Input!");
    highlightText();
  });

  document
    .querySelector("#progressyears")
    .addEventListener("change", (event) => {
      const params = getUrlParams();
      const url = `week_progress.html?week=${params.week}&year=${event.target.value}`;
      createElement("a", {
        href: url,
      }).click();
    });

  const docImages = document.querySelectorAll("img.note");
  docImages.forEach((e) => {
    let parent = e.parentElement;
    parent.className = "material-symbols-outlined";
    parent.style.fontSize = "medium";
    parent.style.float = "right";
    parent.style.padding = "2px";
    parent.textContent = "summarize";
  });

  const docSave = document.querySelector(".shortcutAddEditBtn");
  docSave.className = "material-symbols-outlined";
  docSave.style.fontSize = "x-large";
  docSave.style.fontWeight = "100";
  docSave.style.float = "right";
  docSave.style.padding = "2px";
  docSave.textContent = "save";

  const tbT = document.querySelector("#table_add_columns");
  tbT.className = "material-symbols-outlined";
  tbT.style.fontSize = "medium";
  tbT.style.fontWeight = "100";
  tbT.style.float = "right";
  tbT.style.padding = "2px";
  tbT.textContent = "manufacturing";
}

document.addEventListener("DOMContentLoaded", function () {
  let clientDiv = document.getElementById("s2id_client1");
  let projectDiv = document.getElementById("s2id_project1");

  if (clientDiv) {
    clientDiv.style.width = "100px"; // Change width
    clientDiv.classList.add("updated-client"); // Add new class
  }

  if (projectDiv) {
    projectDiv.style.width = "270px"; // Change width
    projectDiv.classList.add("updated-project"); // Add new class
  }
});

function processTaskDashboard() {
  let headers = document.querySelectorAll(
    "#tbl_tasks > tbody > tr[data-title=data-subtitle]"
  );

  headers.forEach((header) => {
    let headerRowContent = header.querySelector("td");
    var text = headerRowContent.innerText;
    headerRowContent.innerText = "";

    let button = createButton(text);
    headerRowContent.appendChild(button);

    changeLinesState(header, button, changeState(header, ClosedStateValue));

    button.addEventListener("click", (e) => {
      changeLinesState(header, e.target.parentElement, changeState(header));
    });
  });

  function changeState(element, state = null) {
    let open = false;
    let stateAttribute = element.getAttribute(StateAttributeName);
    if (stateAttribute === null) stateAttribute = ClosedStateValue;
    open = stateAttribute === OpenStateValue;
    element.setAttribute(
      StateAttributeName,
      state && (state === OpenStateValue || state === ClosedStateValue)
        ? state
        : open
        ? ClosedStateValue
        : OpenStateValue
    );
    return element.getAttribute(StateAttributeName) === OpenStateValue;
  }

  /**
   * Creates a button with a icon and label
   * @param {*} text Label content
   * @returns Button Element
   */
  function createButton(text) {
    let button = document.createElement("button");
    button.className = "expand-button";

    let buttonlabel = document.createElement("span");
    buttonlabel.className = "expand-btn-label";
    buttonlabel.innerText = text
      .replace(/\s/g, "")
      .replace("Ordenar", "")
      .replace(/([A-Z])/g, " $1")
      .trim();

    let btnIcon = document.createElement("span");
    btnIcon.className = "material-icons material-symbols-rounded btnIcon";
    btnIcon.innerText = "arrow_drop_up";

    button.appendChild(btnIcon);
    button.appendChild(buttonlabel);

    return button;
  }

  function changeLinesState(header, btn, state) {
    let btnIcon = btn.querySelector("span.btnIcon");
    btnIcon.innerText = state ? "arrow_drop_up" : "arrow_drop_down";
    let sibling = header.nextElementSibling;
    while (sibling && !sibling.classList.contains("header")) {
      sibling.style.visibility = state ? "visible" : "collapse";
      sibling = sibling.nextElementSibling;
    }
  }

  // Align elements
  {
    const colGroups = document.querySelectorAll("form > fieldset > dl > div");
    if (colGroups) {
      colGroups.forEach((element) => {
        element.classList.add("task-dashboard-label-group");
        const colGroupCheckBoxes = element.querySelectorAll("dt");
        if (colGroupCheckBoxes) {
          colGroupCheckBoxes.forEach((checkElement) => {
            checkElement.classList.add("task-dashboard-label");
          });
        }
      });

      colGroups[0].classList.add("task-dashboard-label-group-small");
      colGroups[0].querySelectorAll("dt").forEach((e) => {
        e.classList.add("label-small");
      });
    }
    const checkBoxes = document.querySelectorAll(
      "form > fieldset > dl > dt:not(.large-width)"
    );
    if (checkBoxes) {
      checkBoxes[0].style.marginTop = "10px";
      checkBoxes.forEach((element) => {
        element.classList.add("task-dashboard-label");
      });
      checkBoxes[0].classList.remove("task-dashboard-label");
      //Check "Somente favoritos:""
      checkBoxes[5].classList.add("w130label");
    }

    const filterGroup = document.querySelectorAll("#main > dl > *");
    if (filterGroup) {
      filterGroup[0].style.marginTop = "5px";
      filterGroup[1].classList.add("pt-0");
    }
  }
}

if (!window.alreadyExecuted) {
  window.addEventListener(
    "click",
    (evt) => {
      try {
        if (!evt.isTrusted) return;
        let target = evt.target;
        while (
          target &&
          target.tagName.toLowerCase() !== "a" &&
          target.tagName.toLowerCase() !== "area"
        ) {
          target = target.parentElement;
        }
        if (target) {
          const url =
            target instanceof SVGAElement ? target.href.baseVal : target.href;
          if (url.startsWith("file://")) {
            evt.preventDefault();
            try {
              chrome.runtime.sendMessage({
                method: "openLocalFile",
                localFileUrl: url,
              });
            } catch (e) {}
          }
        }
      } catch (error) {
        // Ignored
      }
    },
    {
      capture: true,
    }
  );
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.method === "reload") {
    reloadStyles();
    sendResponse({ ok: true });
  }
});

function reload() {
  document.querySelectorAll("link[rel=stylesheet][href]").forEach((link) => {
    link.href =
      link.href.replace(/[?&]cssReloader=\d+/, "") +
      `?cssReloader=${Date.now()}`;
  });
}

window.alreadyExecuted = true;
