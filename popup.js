const options = {
  fileCheck: "false",
  tabs: {
    activebottomcolor: "#ffffff",
    inactivebottomcolor: "#ffffff",
  },
  datepicker: {
    todaybgcolor: "#feda58",
    hoverbordercolor: "#000000",
    hoverbgcolor: "#ffffff",
    texthovercolor: "#545454",
    textcolor: "#000000",
    selectedbordercolor: "#737373",
    selectedbgcolor: "#f7f7f7",
  },
  profile: {
    avatarBg: "#fff187",
    avatarColor: "#751866",
    avatarBorder: "#000000",
  },
};

chrome.storage.local.get("options").then((r) => {
  try {
    console.log("Options loaded", r.options);
    if (r.options === undefined) {
      chrome.storage.local.set({ options }).then(() => {
        console.log("Value was null and was set");
      });
    }

    const elements = setListeners();
    Object.assign(options, r.options);

    document.querySelector("a#reload").onclick = function () {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.reload(tabs[0].id);
      });
    };

    if (options.fileCheck === "true") {
      elements.clientFileCheck.setAttribute("checked", "");
    }
    elements.tabs.active.setAttribute("value", options.tabs.activebottomcolor);
    elements.tabs.inactive.setAttribute(
      "value",
      options.tabs.inactivebottomcolor
    );
    elements.datepicker.hoverbgcolor.setAttribute(
      "value",
      options.datepicker.hoverbgcolor
    );
    elements.datepicker.hoverbordercolor.setAttribute(
      "value",
      options.datepicker.hoverbordercolor
    );
    elements.datepicker.textcolor.setAttribute(
      "value",
      options.datepicker.textcolor
    );
    elements.datepicker.texthovercolor.setAttribute(
      "value",
      options.datepicker.texthovercolor
    );
    elements.datepicker.todaybgcolor.setAttribute(
      "value",
      options.datepicker.todaybgcolor
    );
    elements.datepicker.selectedbordercolor.setAttribute(
      "value",
      options.datepicker.selectedbordercolor
        ? options.datepicker.selectedbordercolor
        : "#737373"
    );
    elements.datepicker.selectedbgcolor.setAttribute(
      "value",
      options.datepicker.selectedbgcolor
        ? options.datepicker.selectedbgcolor
        : "#f7f7f7"
    );

    elements.profile.avatarBg.setAttribute("value", options.profile.avatarBg);
    elements.profile.avatarColor.setAttribute(
      "value",
      options.profile.avatarColor ? options.profile.avatarColor : "#751866"
    );
    elements.profile.avatarBorder.setAttribute(
      "value",
      options.profile.avatarBorder ? options.profile.avatarBorder : "#000000"
    );
  } catch (error) {
    console.log(error);
  }
});

function getElements() {
  return {
    clientFileCheck: document.getElementById("openClientConfigsFile"),

    tabs: {
      active: document.getElementById("tabBtmClr"),
      inactive: document.getElementById("tabInactiveBtmClr"),
    },
    datepicker: {
      todaybgcolor: document.getElementById("dpbgtoday"),
      hoverbordercolor: document.getElementById("dpborderhover"),
      hoverbgcolor: document.getElementById("dpbgthover"),
      texthovercolor: document.getElementById("dptexthover"),
      textcolor: document.getElementById("dptextdefault"),
      selectedbordercolor: document.getElementById("dpselectedborder"),
      selectedbgcolor: document.getElementById("dpselectedbg"),
    },
    profile: {
      avatarBg: document.getElementById("avatarBg"),
      avatarColor: document.getElementById("avatarColor"),
      avatarBorder: document.getElementById("avatarBorder"),
    },
  };
}

function setListeners() {
  const elements = getElements();

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

  elements.profile.avatarBg.addEventListener("change", (event) => {
    options.profile.avatarBg = event.target.value;
    saveSettings();
  });

  elements.profile.avatarColor.addEventListener("change", (event) => {
    options.profile.avatarColor = event.target.value;
    saveSettings();
  });

  elements.profile.avatarBorder.addEventListener("change", (event) => {
    options.profile.avatarBorder = event.target.value;
    saveSettings();
  });

  elements.datepicker.selectedbgcolor.addEventListener("change", (event) => {
    options.datepicker.selectedbgcolor = event.target.value;
    saveSettings();
  });

  elements.datepicker.selectedbordercolor.addEventListener(
    "change",
    (event) => {
      options.datepicker.selectedbordercolor = event.target.value;
      saveSettings();
    }
  );

  elements.clientFileCheck.addEventListener("click", (event) => {
    options.fileCheck = options.fileCheck === "false" ? "true" : "false";
    saveSettings();
  });

  return elements;
}

function saveSettings() {
  chrome.storage.local.set({ options }).then(() => {
    console.log("Value is set");
  });
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.scripting.executeScript({
      injectImmediately: true,
      files: ["content_script_docstart.js"],
      target: {
        tabId: tabs[0].id,
      },
    });
  });
}
