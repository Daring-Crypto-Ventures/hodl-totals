# ![HODL Totals Logo](/docs/HODL-totals-Logo_48x48.png) HODL Totals [![Node.js CI](https://github.com/dogracer/hodl-totals/actions/workflows/node.js.yml/badge.svg)](https://github.com/dogracer/hodl-totals/actions/workflows/node.js.yml) [![Coverage Status](https://coveralls.io/repos/github/dogracer/hodl-totals/badge.svg?branch=main)](https://coveralls.io/github/dogracer/hodl-totals) [![Discord](https://img.shields.io/discord/798419587749642240)](https://discord.gg/TWuA9DzZth) [![MIT license](https://img.shields.io/badge/License-MIT-blue.svg)](https://lbesson.mit-license.org/) [![clasp](https://img.shields.io/badge/built%20with-clasp-4285f4.svg)](https://github.com/google/clasp) [![made-for-VSCode](https://img.shields.io/badge/Made%20for-VSCode-1f425f.svg)](https://code.visualstudio.com/)

Your crypto data is yours to keep; I built this so that you could own your data and manage the data in a convenient way without the need to send your coin data to anyone else.

These Google Apps™ scripts will add menu commands to Google Sheets™ that will help you track cost basis and long-term or short-term treatment for your cryptocurrency trades. 

It uses the first-in, first-out (FIFO) cost method, which is commonly used for tax compliance.

## Setup

Installation options can be found in the #💻setup channel within the [HODL Totals Discord](https://discord.gg/TWuA9DzZth)


## Setup (for Development)

📝 Steps required to run unit tests locally with `npm build`, `npm run test:unit`

> Install nvm (Node Version Manager)
>
> `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash`
>
> Install node.js, built for the most recent [Long-Term Support versions](https://nodejs.org/en/about/releases/)
> 
> `nvm install --lts`
>
> Install the latest npm version,
> 
> `npm install -g npm`
>
> From the directory with the HODL Totals source code, install the HODL Totals dependencies
>
> `npm install`

📝 Additional steps to set up a new Google sheet with HODL totals scripts

> Install [Google clasp](https://github.com/google/clasp), grant clasp access to your google account, create a sheet and push HODL Totals scripts to that sheet
>
> `npm install -g @google/clasp`
> 
> `clasp login` and then grant access in the browser window that opens
>
> `clasp create "<desired sheet name>" --type sheets`  
>
> `clasp open` and then navigate in browser to the overview page
> 
> `npm run build` to build the code into a single js file and html asset dependencies in the ./dist folder
>
> `npm run deploy` to upload the code in the ./dist folder up to the Apps Script editor associated with your new sheet
>
> Navigate back to the sheet, refresh your browser and you will see a new hodl-totals pull right menu; Commands run from this menu will execute your copy of the code

📝 Additional steps to run tests on your local copy of the code

> `npm run test:unit` to run unit tests locally. This only tests parts of HODL Totals that are not coupled to the Google Sheets API.
>
> To enable true End-to-End testing, you will need to set up a webapp test deployment so that tests can run in the browser on a real sheet. Navigate to your sheet, and open up the Apps Script editor from the menubar at *Extensions > Apps Script*.
>
> Once the Apps Script editor loads, find the large blue Deploy dropdown in the upper right. Use this button to make a new Test Deployment.  Set the type of the new Test Deployment be "Web app". From this dialog copy the "Head Deployment ID" value to your clipboard before dismissing the dialog with the Done button. Back on your local command line, use one of the following commands and paste in that Head Deployment ID value as indicated:
>
> `npm run test:e2e -- --deploymentID <paste your Head Deployment ID here>` to execute the E2E tests
>
> `npm test -- -- --deploymentID <paste your Head Deployment ID here>` to execute both local tests and E2E tests in sequence
>
> After running one of these commands, you will get a new browser window/tab opened up that takes a while to load. After a few minutes delay, this page will populate with a pass/fail summary of the E2E test execution.

## Development Environment

- Ubuntu 24.04.1 LTS
- Node.js LTS version (23.6.0)
- Visual Studio Code
- GitHub CLI commands
- Publish changes to your google sheet [using clasp](https://developers.google.com/apps-script/guides/clasp) from the command line

## Changelog
- 02-28-23 (v2.0.0) Meet Google branding/marks guidelines. Force menu items to appear when script not installed and not enabled. Deployed as Version 2.
- 02-14-23 (v1.0.2) Added getting started guide, NFT example and general hardening of the code. Deployed as Version 1.
- 02-07-23 (v1.0.2) Fixed all known major bugs and performance issues.
- 01-24-23 (v1.0.2) Added NFT Tracking sheets. Updated Coin Tracking sheets to be consistent with handling NFTs. Changed calculated Tax Status on all tracking sheets to reflect Taxable or Not Taxable per user configuration in the Category sheets.
- 01-02-23 (v1.0.1) Added HODL Totals portfolio page with support for multiple wallets/addresses/accounts. Includes features to help users reconcile each coin sheet with each wallet/address/account that holds some amount of that coin. Streamlined the menu commands based on user feedback. Now using metadata to version each generated sheet, useful for upgrades down the line. Added a debug pane to investigate the metadata stored on each sheet. And made a round of bug fixes and improvements to error messages throughout. Now exclusively tested and supported on Node.js 16.x LTS.
- 07-16-22 - Added support for Node.js 16.x LTS.
- 08-22-21 - Added a dropdown column to explicitly specify the Fair Market Value calculation strategy.
- 06-03-21 - Ported JS to TypeScript. Tests runs locally, can be debugged using Node.js as well as on Google Servers as Google Apps™ scripts. Code coverage stats published on [coveralls.io](https://coveralls.io/github/dogracer/hodl-totals). Integrated npm script commands for common tasks. Added Continuous Integration, code analysis, and dependabot.
- 04-25-21 - Links out to Policies + Discord. Fixed a wave of Apply Formatting bugs, halfway through my Blocker list for submission to the Google Marketplace.
- 01-23-21 - Addressed a laundry list of cleanup issues, in preparation for initial submission to the Google Marketplace.
- 11-29-20 - Addressed Significant performance issues for > 1000 purchase transactions (long running script may not finish executing before Google times out the job)
- 08-31-20 - Ported logic from alanhett's VBScript Macros to Google Apps™ scripts for FIFO cost basis calc.

### Disclaimer

* This spreadsheet does not constitute legal or tax advice.  Tax laws and regulations change frequently, and their application can vary widely based on the specific facts and circumstances involved. You are responsible for consulting with your own professional tax advisors concerning specific tax circumstances for your business. I disclaim any responsibility for the accuracy or adequacy of any positions taken by you in your tax returns.*

### About

Did this save you a tax prep headache?

Support development with a BTC donation: [bc1qskvk3rnpjvhcy4kcl3d0tcc4z6x90udcz8nnfm](https://www.blockchain.com/btc/address/bc1qskvk3rnpjvhcy4kcl3d0tcc4z6x90udcz8nnfm)
or a VRSC donation to DCV@
