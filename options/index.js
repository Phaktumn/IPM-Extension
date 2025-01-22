document.title = chrome.i18n.getMessage('extension_name');

chrome.extension.isAllowedFileSchemeAccess().then(isAllowed => {
	document.body.setAttribute('data-file-scheme-access-allowed', isAllowed);
});

{
	const lang = chrome.i18n.getMessage('@@ui_locale') === 'ja' ? 'ja' : 'en';
	document.querySelectorAll(`[lang="${lang}"]`).forEach(e => {
		e.style.display = 'inline';
	});
}

document.querySelectorAll('a[data-id="extension-page-link"').forEach(a => {
	const url = `chrome://extensions/?id=${chrome.runtime.id}`;
	a.innerText = url;
	a.href = url;
	a.addEventListener('click', event => {
		event.preventDefault();
		chrome.tabs.update({
			url,
		});
	});
});

{
	const options = {
		headercolor: '#ffffff'
	};
	const colorPicker = document.getElementById('headerclr');
	chrome.storage.local.get("options").then(r => {
		try {
			if (r.options === undefined) {
				chrome.storage.local.set({ options }).then(() => { console.log("Value was null and was set"); });
			}
			colorPicker.addEventListener("change", (event) => {
				options.headercolor = event.target.value;
				chrome.storage.local.set({ options }).then(() => { console.log("Value is set"); });
			});
			Object.assign(options, r.options);
			colorPicker.setAttribute('value', options.headercolor);
		} catch (error) {
			console.log(error);
		}
	});
}

{
	const testButton = document.getElementById('test');
	testButton.addEventListener('click', () => {
		testButton.setAttribute('disabled', '');
		chrome.tabs.create({
			url: 'file:///C:/',
		}, created => {
			const isAllowed = !!created;
			document.body.setAttribute('data-file-scheme-access-allowed', isAllowed);
			document.getElementById('test-result').innerText = isAllowed ? 'OK' : 'NG';
		});
	});
}