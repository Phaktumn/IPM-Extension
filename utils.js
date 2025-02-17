/**
 * Executes a script in the page's JavaScript context.
 *
 * @param {String} text The content of the script to insert.
 * @param {Object} data Data attributes to set on the inserted script tag.
 */
window.injectScript = function (text, data) {
  var parent = document.documentElement,
    script = document.createElement('script');

  script.text = text;
  script.async = false;

  for (var key in data) {
    script.setAttribute('data-' + key.replace(/_/g, '-'), data[key]);
  }

  parent.insertBefore(script, parent.firstChild);
  parent.removeChild(script);
};

function getFrameUrl() {
  let url = document.location.href,
    parentFrame = (document != window.top) && window.parent;
  while (parentFrame && url && !url.startsWith("http")) {
    try {
      url = parentFrame.document.location.href;
    } catch (ex) {
      // ignore 'Blocked a frame with origin "..."
      // from accessing a cross-origin frame.' exceptions
    }
    parentFrame = (parentFrame != window.top) && parentFrame.parent;
  }
  return url;
}
window.FRAME_URL = getFrameUrl();

function createElement(type, attributes, children = []) {
  if (!type) return;
  let element = document.createElement(type);
  if (typeof attributes === 'object') {
      for (let a in attributes) {
          element.setAttribute(a, attributes[a]);
      }
  }
  if (children && Array.isArray(children)) {
      children.forEach(c => {
          element.appendChild(typeof c === 'string' || typeof c === 'number' ? document.createTextNode(c) : c);
      });
  }
  return element;
}