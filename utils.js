/**
 * Executes a script in the page's JavaScript context.
 *
 * @param {String} text The content of the script to insert.
 * @param {Object} data Data attributes to set on the inserted script tag.
 */
window.injectScript = function (text, data) {
  var parent = document.documentElement,
    script = document.createElement("script");

  script.text = text;
  script.async = false;

  for (var key in data) {
    script.setAttribute("data-" + key.replace(/_/g, "-"), data[key]);
  }

  parent.insertBefore(script, parent.firstChild);
  parent.removeChild(script);
};

/** Returns the URL of the current frame, traversing up to the topmost frame.
 * This function handles cross-origin frames by catching exceptions when trying
 * to access the `location` of a parent frame that is not accessible.
 * @returns {string} The URL of the current frame or the topmost accessible frame.
 */
function getFrameUrl() {
  let url = document.location.href,
    parentFrame = document != window.top && window.parent;
  while (parentFrame && url && !url.startsWith("http")) {
    try {
      url = parentFrame.document.location.href;
    } catch (ex) {
      // ignore 'Blocked a frame with origin "..."
      // from accessing a cross-origin frame.' exceptions
    }
    parentFrame = parentFrame != window.top && parentFrame.parent;
  }
  return url;
}
// ** The URL of the current frame, traversing up to the topmost frame.
// This is useful for scripts that need to know the context in which they are running.
// It handles cross-origin frames by catching exceptions when trying to access
// the `location` of a parent frame that is not accessible.
window.FRAME_URL = getFrameUrl();

/** * Creates a DOM element with specified type, attributes, and children.
 * @param {string} type The type of the element to create (e.g., 'div', 'span').
 * @param {Object} attributes An object containing attributes to set on the element.
 * @param {Array} [children=[]] An array of child elements or text nodes to append to the created element.
 * @returns {HTMLElement} The created DOM element.
 */
function createElement(type, attributes, children = []) {
  if (!type) return;
  let element = document.createElement(type);
  if (typeof attributes === "object") {
    for (let a in attributes) {
      element.setAttribute(a, attributes[a]);
    }
  }
  if (children && Array.isArray(children)) {
    children.forEach((c) => {
      element.appendChild(
        typeof c === "string" || typeof c === "number"
          ? document.createTextNode(c)
          : c
      );
    });
  }
  return element;
}

/** * Returns the current year as a four-digit number.
 * @returns {number} The current year.
 */
function getCurrentYear() {
  return new Date().getFullYear();
}

/** * Returns the ISO week number of the year for a given date.
 * The ISO week starts on Monday and the first week of the year
 * is the week with the first Thursday in it.
 * @param {Date} date The date for which to get the ISO week number.
 * @returns {number} The ISO week number (1-53).
 */
function getISOWeekOfYear(date) {
  const tempDate = new Date(date);
  tempDate.setHours(0, 0, 0, 0); // Reset time to prevent timezone issues

  // Get Thursday of this week (ISO weeks start on Monday)
  const dayOfWeek = tempDate.getDay() || 7; // Convert Sunday (0) to 7
  tempDate.setDate(tempDate.getDate() + 4 - dayOfWeek); // Move to Thursday

  // Get first Thursday of the year
  const firstThursday = new Date(tempDate.getFullYear(), 0, 4);
  firstThursday.setDate(
    firstThursday.getDate() + (4 - (firstThursday.getDay() || 7))
  );

  // Calculate week number (difference in full weeks)
  const weekNumber = Math.ceil(((tempDate - firstThursday) / 86400000 + 1) / 7);

  return weekNumber;
}

/** * Returns the start and end dates of a given ISO week in a specific year.
 * @param {number} year The year of the week.
 * @param {number} weekNumber The ISO week number (1-53).
 * @returns {Object} An object containing the start and end dates of the week.
 * The start date is a Date object representing the Monday of the week,
 * and the end date is a Date object representing the Sunday of the week.
 */
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

/**
 * Delays invoking a function until after `wait` milliseconds have elapsed
 * since the last time the debounced function was invoked.
 * @param {Function} func The function to debounce.
 * @param {number} wait The number of milliseconds to delay.
 * @returns {Function} Returns the new debounced function.
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
