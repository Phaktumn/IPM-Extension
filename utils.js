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

function getCurrentYear() {
  return new Date().getFullYear();
}

function getISOWeekOfYear(date) {
  const tempDate = new Date(date);
  tempDate.setHours(0, 0, 0, 0); // Reset time to prevent timezone issues

  // Get Thursday of this week (ISO weeks start on Monday)
  const dayOfWeek = tempDate.getDay() || 7; // Convert Sunday (0) to 7
  tempDate.setDate(tempDate.getDate() + 4 - dayOfWeek); // Move to Thursday

  // Get first Thursday of the year
  const firstThursday = new Date(tempDate.getFullYear(), 0, 4);
  firstThursday.setDate(firstThursday.getDate() + (4 - (firstThursday.getDay() || 7)));

  // Calculate week number (difference in full weeks)
  const weekNumber = Math.ceil(((tempDate - firstThursday) / 86400000 + 1) / 7);

  return weekNumber;
}

function getWeekStartEnd(year, weekNumber) {
  // Get the first day of the year
  let firstDayOfYear = new Date(year, 0, 1);
  
  // Find the first Thursday of the year (ISO 8601 week starts on Monday)
  let dayOffset = (firstDayOfYear.getDay() + 7) % 7; // Convert Sunday (0) to 6
  let firstThursday = new Date(year, 0, 1 + (4 - dayOffset));

  // Calculate the start of the given week
  let startDate = new Date(firstThursday);
  startDate.setDate(firstThursday.getDate() + (weekNumber - 1) * 7 - 3);

  // Calculate the end of the week (Sunday)
  let endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);

  return { startDate, endDate };
}

function getUrlParams() {
  return new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
  });
}
