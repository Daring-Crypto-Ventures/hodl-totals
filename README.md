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
> `clasp create "<desired sheet name>"` and then select Sheet as doc type to create
>
> `clasp open` and then navigate in browser to the overview page
> 
> `clasp push` to upload the code you synced locally from this repo up to the Apps Script editor associated with your new sheet
>
> Navigate back to the sheet, refresh your browser and you will see a new hodl-totals pull right menu; Commands run from this menu will execute your copy of the code

📝 Additional steps to enable End-to-End integration tests to run on your copy of the code, using your Google account on your sheet

<!--
> Due to clasp breaking support for symbol export/import across  ES6-like-module boundaries
> https://github.com/grant/ts2gas/issues/26#issuecomment-1003428178
> Must freeze at the version of clasp that last worked v2.3.2
> This leads to a bunch of npm security vulernability alerts at npm install time
>
> If could upgrade to latest, then could use the --deploymentID flag and make E2E tests more seamless and not require a manual keypress to select deployment, by appending
> `--deploymentId AKfycbw0a1U_xiXP-nvYfDG6lHJSyCafrGeJkIPrzMmFMSk`
> to package.json's test:e2e cmd
>
> `clasp open` and then navigate in browser, click Deploy dropdwn, select Test Deployment, copy deployment ID out of the webapp URL
>
> `code package.json` to edit package.json locally, paste deploymentID over the test:e2e cmd's deployment ID
> 
--> 
> `npm run test:e2e` to run the E2E test suite -- or simply `npm test` to run both local and E2E test suites

## Development Environment

- Windows 10 PC with WSL2 (Ubuntu 20.04.1 LTS)
- Node.js LTS version (16.x)
- Visual Studio Code on Windows 10, and its WSL2 integration for editing code stored in WSL
- GitHub CLI commands via the WSL2 Linux terminal
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
