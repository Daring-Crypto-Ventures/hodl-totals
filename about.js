/**
 * @NotOnlyCurrentDoc Limits the script to only accessing the current sheet.
 *
 * About dialog that shows information about where these tools came from.
 *
 */

function showAboutDialog_() {
  var html = HtmlService.createHtmlOutputFromFile('About')
     .setWidth(540)
     .setHeight(300);
     SpreadsheetApp.getUi().showModalDialog(html, 'About crypto_tools');
}
