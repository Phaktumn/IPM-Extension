/**
 * CSS Changes apply here
 */

chrome.storage.local.get("options").then(res => {
    try {
        document.documentElement.style.setProperty('--header-color', res.options.headercolor);
        document.documentElement.style.setProperty('--footer-color', res.options.footercolor);
        document.documentElement.style.setProperty('--table-border-color', res.options.tablebordercolor);
        document.documentElement.style.setProperty('--tab-bottom-color-active', res.options.tabs.activebottomcolor);
        document.documentElement.style.setProperty('--tab-bottom-color-inactive', res.options.tabs.inactivebottomcolor);
    
        document.documentElement.style.setProperty('--datepicker-today-bg-color', res.options.datepicker.todaybgcolor);
        document.documentElement.style.setProperty('--datepicker-hover-border-color', res.options.datepicker.hoverbordercolor);
        document.documentElement.style.setProperty('--datepicker-hover-bg-color', res.options.datepicker.hoverbgcolor);
        document.documentElement.style.setProperty('--datepicker-text-hover-color', res.options.datepicker.texthovercolor);
        document.documentElement.style.setProperty('--datepicker-text-color', res.options.datepicker.textcolor);
        document.documentElement.style.setProperty('--datepicker-selected-border-color', res.options.datepicker.selectedbordercolor);
        document.documentElement.style.setProperty('--datepicker-selected-bg-color', res.options.datepicker.selectedbgcolor);
    } catch (error) {

    }
});