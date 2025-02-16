const options = {
    fileCheck: 'false',
    headercolor: '#ffffff',
    footercolor: '#ffffff',
    tablebordercolor: '#ffffff',
    tabs: {
        activebottomcolor: '#ffffff',
        inactivebottomcolor: '#ffffff',
    },
    datepicker: {
        todaybgcolor: '#feda58',
        hoverbordercolor: '#000000',
        hoverbgcolor: '#ffffff',
        texthovercolor: '#545454',
        textcolor: '#000000',
        selectedbordercolor: '#737373',
        selectedbgcolor: '#f7f7f7'
    }
};

chrome.storage.local.get("options").then(r => {
    try {
        if (r.options === undefined) {
            chrome.storage.local.set({ options }).then(() => { console.log("Value was null and was set"); });
        }

        const elements = setListeners();
        Object.assign(options, r.options);

        document.querySelector("a#reload").onclick = function () {
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                chrome.tabs.reload(tabs[0].id);
            });
        };


        if (options.fileCheck === 'true') {
            elements.clientFileCheck.setAttribute('checked', '');
        }
        elements.header.setAttribute('value', options.headercolor);
        elements.footer.setAttribute('value', options.footercolor);
        elements.border.setAttribute('value', options.tablebordercolor);
        elements.tabs.active.setAttribute('value', options.tabs.activebottomcolor);
        elements.tabs.inactive.setAttribute('value', options.tabs.inactivebottomcolor);
        elements.datepicker.hoverbgcolor.setAttribute('value', options.datepicker.hoverbgcolor);
        elements.datepicker.hoverbordercolor.setAttribute('value', options.datepicker.hoverbordercolor);
        elements.datepicker.textcolor.setAttribute('value', options.datepicker.textcolor);
        elements.datepicker.texthovercolor.setAttribute('value', options.datepicker.texthovercolor);
        elements.datepicker.todaybgcolor.setAttribute('value', options.datepicker.todaybgcolor);
        elements.datepicker.selectedbordercolor.setAttribute('value', options.datepicker.selectedbordercolor);
        elements.datepicker.selectedbgcolor.setAttribute('value', options.datepicker.selectedbgcolor);
    } catch (error) {
        console.log(error);
    }
});

function getElements() {
    return {
        clientFileCheck: document.getElementById('openClientConfigsFile'),
        header: document.getElementById('headerclr'),
        footer: document.getElementById('footerclr'),
        border: document.getElementById('tborderclr'),
        tabs: {
            active: document.getElementById('tabBtmClr'),
            inactive: document.getElementById('tabInactiveBtmClr')
        },
        datepicker: {
            todaybgcolor: document.getElementById('dpbgtoday'),
            hoverbordercolor: document.getElementById('dpborderhover'),
            hoverbgcolor: document.getElementById('dpbgthover'),
            texthovercolor: document.getElementById('dptexthover'),
            textcolor: document.getElementById('dptextdefault'),
            selectedbordercolor: document.getElementById('dpselectedborder'),
            selectedbgcolor: document.getElementById('dpselectedbg')
        }
    }
}

function setListeners() {
    const elements = getElements();
    elements.header.addEventListener("change", (event) => {
        options.headercolor = event.target.value;
        saveSettings();
    });

    elements.footer.addEventListener("change", (event) => {
        options.footercolor = event.target.value;
        saveSettings();
    });

    elements.border.addEventListener("change", (event) => {
        options.tablebordercolor = event.target.value;
        saveSettings();
    });

    elements.tabs.active.addEventListener("change", (event) => {
        options.tabs.activebottomcolor = event.target.value;
        saveSettings();
    });

    elements.tabs.inactive.addEventListener("change", (event) => {
        options.tabs.inactivebottomcolor = event.target.value;
        saveSettings();
    });

    elements.datepicker.todaybgcolor.addEventListener("change", (event) => {
        options.datepicker.todaybgcolor = event.target.value;
        saveSettings();
    });

    elements.datepicker.hoverbgcolor.addEventListener("change", (event) => {
        options.datepicker.hoverbgcolor = event.target.value;
        saveSettings();
    });

    elements.datepicker.hoverbordercolor.addEventListener("change", (event) => {
        options.datepicker.hoverbordercolor = event.target.value;
        saveSettings();
    });

    elements.datepicker.textcolor.addEventListener("change", (event) => {
        options.datepicker.textcolor = event.target.value;
        saveSettings();
    });

    elements.datepicker.texthovercolor.addEventListener("change", (event) => {
        options.datepicker.texthovercolor = event.target.value;
        saveSettings();
    });

    elements.datepicker.selectedbordercolor.addEventListener("change", (event) => {
        options.datepicker.selectedbordercolor = event.target.value;
        saveSettings();
    });

    elements.datepicker.selectedbgcolor.addEventListener("change", (event) => {
        options.datepicker.selectedbgcolor = event.target.value;
        saveSettings();
    });

    elements.clientFileCheck.addEventListener('click', (event) => {
        options.fileCheck = options.fileCheck === 'false' ? 'true' : 'false';
        saveSettings();
    })

    return elements;
}


function saveSettings() {
    chrome.storage.local.set({ options }).then(() => { console.log("Value is set"); });
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.scripting.executeScript(
            {
                injectImmediately: true,
                files: [
                    "content_script_docstart.js"
                ],
                target: {
                    tabId: tabs[0].id
                }
            });
    });
}
