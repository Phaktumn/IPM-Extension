"use strict";

var currentUrl = window.location.href;
if (currentUrl.endsWith('/'));
  currentUrl = currentUrl.slice(0, -1);
const urlPaths = currentUrl.split('/');
const cliente = urlPaths[urlPaths.length-1];


/**
 * FOLDER STUFF
 */
if (!currentUrl.includes('ipm.macwin.pt')) 
{
  let body = document.querySelector('body');
  if (window.location.href.endsWith('.htm')){
    body.style.backgroundColor = 'white';
  }
  else {
    body.style.backgroundColor = '#2b2a33';
  }

  // Get header element and trim the text content
  const header = document.getElementById("header");
  if (header !== null && header !== undefined)
  {
    header.textContent = header.textContent.trim();
    // Set the header text content to ~ if it is empty
    if (header.textContent === "") {
      header.textContent = "~";
    }

    // Set the width of the header to 100% in order to fill the space
    header.style.width = "100%";

    // Set the length of the header to 65 characters
    if (header.textContent.length > 65) {
      header.textContent = header.textContent.slice(0, 65) + "...";
    }
  }

  const bodyPre = document.querySelector('body:has(pre)');
  if (bodyPre !== null) {

    const pre = bodyPre.querySelector('pre');

    var tag = document.createElement("div");
    tag.id  = 'parentDirLinkBox';
    tag.style += 'display: block; position: sticky; top: 100px; transform: translate(-150px, 0px); height: 0px; display: flex; flex-direction: column; width: 100px;'

    var tagChild = document.createElement('button');
    tagChild.id = 'back';
    tagChild.class ='icon up';
    tagChild.onclick = function() {
      urlPaths.pop();
      var reqUrl = urlPaths.join('/');
      window.location = reqUrl;
    }
    
    var childSpan = document.createElement('span');
    childSpan.id = 'parendDirText';
    childSpan.textContent = 'Back';
    
    tagChild.appendChild(childSpan);

    tag.appendChild(tagChild);

    bodyPre.insertBefore(tag, pre);
  }

  var h1 = document.querySelector('h1#header');
  if (h1 !== null) {
    h1.textContent = '';
    var ul = document.createElement('ul');
    ul.classList.add('breadcrumb');
    h1.appendChild(ul);
    var pathUpTo = '//';
    urlPaths.forEach(path => 
    {
      if (path === 'file:' || path === '/' || path === ' ' || path === '')
        return;
      pathUpTo += path + '/';
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.textContent = path;
      if (path === 'terra') {
        a.href = ''; 
      }
      else {
        a.href = pathUpTo;
      }
      li.appendChild(a);
      ul.appendChild(li);
    });
  }

  // Shorten the text content of links that are too long
  const links = document.querySelectorAll("a");
  const trs = document.querySelectorAll('tr');

  trs.forEach(tr => {
    const contentA = tr.querySelector('td>a');
    if(contentA !== null && contentA.textContent===cliente+'.txt')
    {
      tr.style.border = '1px solid yellow';
    } 
  });

  links.forEach((link) => {
    if (link.textContent.length > 60) {
      link.textContent = link.textContent.slice(0, 60) + "...";
    }
  });
}