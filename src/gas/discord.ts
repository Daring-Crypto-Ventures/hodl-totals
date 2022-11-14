/**
 * @NotOnlyCurrentDoc Limits the script to only accessing the current sheet.
 *
 * Open a URL to get user to join the HODL Totals Discord server without requiring additional user interaction
 *
 */

/* global SpreadsheetApp */
/* global HtmlService */

export default function openDiscordLink_(): void {
    // Invite link to the HODL Totals Discord that never expires
    if (typeof ScriptApp !== 'undefined') {
        openUrlFromGoogleSheet('https://discord.gg/TWuA9DzZth');
    }
}

/**
 * Open a URL in a new tab.
 */
function openUrlFromGoogleSheet(url): void {
    const html = HtmlService.createHtmlOutput(`${'<html><script>'
      + 'window.close = function(){window.setTimeout(function(){google.script.host.close()},9)};'
      + 'var a = document.createElement("a"); a.href="'}${url}"; a.target="_blank";`
      + 'if(document.createEvent){'
      + '  var event=document.createEvent("MouseEvents");'
      + '  if(navigator.userAgent.toLowerCase().indexOf("firefox")>-1){window.document.body.append(a)}'
      + '  event.initEvent("click",true,true); a.dispatchEvent(event);'
      + '}else{ a.click() }'
      + 'close();'
      + '</script>'
      // Offer URL as clickable link in case above code fails.
      + `<body style="word-break:break-word;font-family:sans-serif;">Failed to open automatically. <a href="${url}" target="_blank" onclick="window.close()">Click here to proceed</a>.</body>`
      + '<script>google.script.host.setHeight(40);google.script.host.setWidth(410)</script>'
      + '</html>')
        .setWidth(90).setHeight(1);
    SpreadsheetApp.getUi().showModalDialog(html, 'Opening ...');
}
