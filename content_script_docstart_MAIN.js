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
        document.documentElement
            .append(
                createElement(
                    'link',
                    {
                        href: 'https://fonts.googleapis.com/css?family=Noto Sans',
                        rel: 'stylesheet'
                    }),
            );
    }
    + "());"
);