/**
 * This script runs in "MAIN" world
 * Means the script will share the execution environment with the host page's JavaScript.
 *
 * Usefull to append child elements that load content into Page Sources like, style sheets, fonts, scripts, etc.
 *
 * "run_at": "document_start",
 * "matches": ["http://ipm.macwin.pt/*"],
 */

window.injectScript(
  "(" +
    function () {
      document.documentElement.append(
        createElement("link", {
          href: "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0",
          rel: "stylesheet",
        }),
        createElement("link", {
          href: "https://fonts.googleapis.com/css?family=Noto Sans",
          rel: "stylesheet",
        }),
        /**
         * Mónica Isto é super "hacky" usa a source do jquery
         * nao vale a pena andar a perceber isto
         * é só para copiar o onMouseOver ou outros events de um elemento para outro
         * por causa das funcções que vêm aseguir que fazem replace das imagens por icons
         */
        createElement("script", {}, [
          `function copyEventListeners(
  sourceElement,
  destinationElement,
  copyevents = ["mouseover","focusin","remove"]
) {
  try {
  const events = $._data(sourceElement, "events");
  console.log(typeof events === "undefined" ? "No events found" : "Events found");
  if (typeof events === "undefined") {
    return;
  }
  $.each(events, function (eventName, handlers) {
  console.log("Event name:", eventName);
    if (copyevents.includes(eventName)) {
      $.each(handlers, function (index, handlerObj) {
      console.log("Copying event:", eventName, "from", sourceElement, "to", destinationElement);
        $(destinationElement).on(eventName, handlerObj.handler);
      });
    } else {
      return;
    }
  });
  } catch (error) {
    console.error("Error copying event listeners:", error);}
}`,
        ]),
        createElement("script", {}, [
          `

function replaceImgByIcon(titleText, iconName) {
  const imgs = document.querySelectorAll(\`img[title="\${titleText}"]\`);
  imgs.forEach((img) => {
    const span = document.createElement("span");
    span.className =
      "material-symbols-outlined icon-alinhado-com-header-menu-link";
    span.title = img.title;
    span.setAttribute("aria-label", img.alt || titleText);
    span.textContent = iconName;
    span.style.color = "#3B4758";
    span.style.fontSize = "20px";
    span.style.verticalAlign = "middle";
    span.style.lineHeight = "1";

    copyEventListeners(img, span);

    img.replaceWith(span);
  });
}

function replaceImgByIconByClass(imgClass, iconName) {
  const imgs = document.querySelectorAll(\`img.\${imgClass}\`);
  imgs.forEach((img) => {
    const span = document.createElement("span");
    span.className =
      "material-symbols-outlined icon-alinhado-com-header-menu-link";
    span.title = img.title || iconName;
    span.setAttribute("aria-label", img.alt || iconName);
    span.textContent = iconName;
    span.style.color = "#3B4758";
    span.style.fontSize = "18px";
    span.style.verticalAlign = "middle";
    span.style.lineHeight = "1";

    copyEventListeners(img, span);

    img.replaceWith(span);
  });
}
function replaceImgByIconBySrc(imgSrc, iconName) {
  const imgs = document.querySelectorAll(\`img[src="\${imgSrc}"]\`);
  imgs.forEach((img) => {
    const icon = document.createElement("span");
    icon.className =
      "material-symbols-outlined icon-alinhado-com-header-menu-link";
    icon.title = img.title || iconName;
    icon.setAttribute("aria-label", img.alt || iconName);
    icon.textContent = iconName;

    icon.style.color = "#3B4758";
    icon.style.fontSize = "20px";
    icon.style.verticalAlign = "middle";
    icon.style.lineHeight = "1";

    copyEventListeners(img, icon);

    img.replaceWith(icon);
    //img.parentNode.replaceChild(icon, img);

    const btn = icon.closest('button[type="submit"]');
    if (btn) {
      btn.style.display = "flex";
      btn.style.alignItems = "center";
      btn.style.gap = "6px";
    }
  });
}
`,
        ]),

        /**
         * Set Timeout to ensure the script runs after the page has loaded
         */
        createElement("script", {}, [
          `
          document.addEventListener("DOMContentLoaded", (event) =>
  setTimeout(() => {
    const progressImg = document.querySelector("#progress img");
    if (progressImg) {
      progressImg.classList.add("progress-icon");
      replaceImgByIconByClass("progress-icon", "update");
    }

    replaceImgByIconByClass("title_info", "info");
    replaceImgByIcon("Editar", "edit");
    replaceImgByIcon("Add", "add");
    replaceImgByIcon("Editar atalho", "edit_document");
    replaceImgByIcon("Adicionar atalho", "bookmark_add");
    replaceImgByIcon("Update progress", "update");
    replaceImgByIconBySrc("/images/table_refresh.png", "change_circle");
    replaceImgByIconBySrc("/images/time_go.png", "update");
    replaceImgByIconBySrc("/images/star-on.png", "star");
    replaceImgByIconBySrc("/images/validation.png", "check");
    replaceImgByIconBySrc("/images/tick.png", "done_all");
    replaceImgByIconBySrc("/images/progress.png", "task_alt");
    replaceImgByIconBySrc("/images/pencil_go.png", "file_copy");
    replaceImgByIconBySrc("/images/pencil.png", "edit");
    replaceImgByIconBySrc("/images/email_add.png", "mail");
    replaceImgByIconBySrc("/images/email.png", "mail");
    replaceImgByIconBySrc("/images/note.png", "add_notes");
    replaceImgByIconBySrc("/images/time.png", "schedule");
    replaceImgByIconBySrc("/images/magnifier.png", "search");
    replaceImgByIconBySrc("/images/pencil_add.png", "add_task");
    replaceImgByIconBySrc("/images/time_sm.png", "schedule");
    replaceImgByIconBySrc("/images/attach_sm.png", "attach_file");
    replaceImgByIconBySrc("/images/hier.png", "device_hub");
    replaceImgByIconBySrc("/images/note10x10_gray.png", "add_comment");
    replaceImgByIconBySrc("/images/attach.png", "attach_file");
    replaceImgByIconBySrc("/images/note10x10_gray.png", "add_comment");
    replaceImgByIconBySrc("/images/pencil.png", "edit");
    replaceImgByIconBySrc("/images/bin_closed.png", "delete");
  }, 1)
);`,
        ])
      );
    } +
    "());"
);
