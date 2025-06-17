/**
 * This script runs in "ISOLATED" world
 * which is the execution environment unique to the content script.
 *
 * "run_at": "document_start"
 * "matches": ["http://ipm.macwin.pt/*"]
 * "js": ["utils.js", "content_script_docstart.js"]
 */

chrome.storage.local.get("options").then((res) => {
  try {
    console.log(res);
    document.documentElement.style.setProperty(
      "--tab-bottom-color-active",
      res.options.tabs.activebottomcolor
    );
    document.documentElement.style.setProperty(
      "--tab-bottom-color-inactive",
      res.options.tabs.inactivebottomcolor
    );
    document.documentElement.style.setProperty(
      "--datepicker-today-bg-color",
      res.options.datepicker.todaybgcolor
    );
    document.documentElement.style.setProperty(
      "--datepicker-hover-border-color",
      res.options.datepicker.hoverbordercolor
    );
    document.documentElement.style.setProperty(
      "--datepicker-hover-bg-color",
      res.options.datepicker.hoverbgcolor
    );
    document.documentElement.style.setProperty(
      "--datepicker-text-hover-color",
      res.options.datepicker.texthovercolor
    );
    document.documentElement.style.setProperty(
      "--datepicker-text-color",
      res.options.datepicker.textcolor
    );
    document.documentElement.style.setProperty(
      "--datepicker-selected-border-color",
      res.options.datepicker.selectedbordercolor
    );
    document.documentElement.style.setProperty(
      "--datepicker-selected-bg-color",
      res.options.datepicker.selectedbgcolor
    );
  } catch (error) {}
});
