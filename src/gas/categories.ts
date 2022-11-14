/**
 * @NotOnlyCurrentDoc Limits the script to only accessing the current sheet.
 *
 * Create & manage categories which are used in individual coin sheets
 *
 */
import { version } from '../version';

/* global GoogleAppsScript */
/* global SpreadsheetApp */

/**
 * A function that adds columns and headers to the spreadsheet.
 *
 * @return the newly created sheet, for function chaining purposes.
 */
export default function newCategorySheet(): GoogleAppsScript.Spreadsheet.Sheet | null {
    // Initial set of categories provided out of the box
    const header = ['Categories', 'Type', 'Tax Status', 'Tax Status Justification'];
    const data = [
        ['USD Deposit', 'Cash In', 'Not Taxable'],
        ['USD Withdrawal', 'Cash Out', 'Taxable'],
        ['Active Airdrop', 'Inflow', 'Taxable'],
        ['Passive Airdrop', 'Inflow', 'Not Taxable'],
        ['Bounty Fulfilled', 'Inflow', 'Taxable'],
        ['Fork', 'Inflow', 'Taxable'],
        ['Gift Received', 'Inflow', 'Not Taxable'],
        ['Interest', 'Inflow', 'Taxable'],
        ['Mining', 'Inflow', 'Taxable'],
        ['Reward/Prize', 'Inflow', 'Taxable'],
        ['Promotion', 'Inflow', 'Taxable'],
        ['Sales Revenue', 'Inflow', 'Taxable'],
        ['Staking', 'Inflow', 'Taxable'],
        ['Tip Income', 'Inflow', 'Not Taxable'],
        ['Unknown Inflow', 'Inflow', 'Taxable'],
        ['Transfer', 'Inflow', 'Not Taxable'],
        ['Transfer', 'Outflow', 'Not Taxable'],
        ['Lost/Stolen', 'Outflow', 'Taxable'],
        ['Given Away', 'Outflow', 'Not Taxable'],
        ['Project Ended', 'Outflow', 'Taxable'],
        ['Sold for Goods', 'Outflow', 'Taxable'],
        ['Spent', 'Outflow', 'Taxable'],
        ['Traded', 'Outflow', 'Taxable'],
        ['Tx Fee', 'Outflow', 'Taxable'],
        ['Unknown Outflow', 'Outflow', 'Taxable'],
        ['Bridged', 'Outflow', 'Taxable']
    ];
    const justificationLinks = [
        ['IRS 1040 Instructions: ...A [taxable] transaction does not include the holding of virtual currency in a wallet or account', 'https://www.irs.gov/instructions/i1040gi'],
        ['IRS 1040 Instructions: ...A [taxable] transaction involving virtual currency includes...A sale of virtual currency', 'https://www.irs.gov/instructions/i1040gi'],
        ['IRS Memo 202035011: ...virtual currency in exchange for performing a microtask/service... the virtual currency received is taxable', 'https://www.irs.gov/pub/irs-wd/202035011.pdf'],
        ['GRAY AREA: Nothing was actively done to receive the coins, nor was the airdrop a proportional reward to some other tokens already held', ''],
        ['IRS FAQ Q9. Do I have income if I provide someone with a service and that person pays me with virtual currency?', 'https://www.irs.gov/individuals/international-taxpayers/frequently-asked-questions-on-virtual-currency-transactions#collapseCollapsible1622820578836'],
        ['IRS FAQ Q24. How do I calculate my income from cryptocurrency I received following a hard fork?', 'https://www.irs.gov/individuals/international-taxpayers/frequently-asked-questions-on-virtual-currency-transactions#collapseCollapsible1622820578458'],
        ['IRS FAQ Q31. I received virtual currency as a bona fide gift. Do I have income? (below $15,000/yr)', 'https://www.irs.gov/individuals/international-taxpayers/frequently-asked-questions-on-virtual-currency-transactions#collapseCollapsible1622820578306'],
        ['IRS Pub 550: In general, any interest that you receive or that is credited to your account and can be withdrawn is taxable income.', 'https://www.irs.gov/taxtopics/tc403'],
        ['IRS Notice 2014-21: Q-8. Does a taxpayer who “mines” virtual currency realize gross income upon receipt of the virtual currency resulting from those activities?', 'https://www.irs.gov/irb/2014-16_IRB#NOT-2014-21'],
        ['IRS Pub 525 Other Income... Prizes or awards in goods or services must be included in your income at their FMV', 'https://www.irs.gov/publications/p525#en_US_2020_publink1000229578'],
        ['IRS Pub 550: Gift for opening an account: If you receive noncash gifts or services for making deposits/opening an account...you may have to report it', 'https://www.irs.gov/publications/p550#en_US_2020_publink10009869'],
        ['IRS FAQ Q17. How do I calculate my gain or loss when I exchange my virtual currency for other property?', 'https://www.irs.gov/individuals/international-taxpayers/frequently-asked-questions-on-virtual-currency-transactions#collapseCollapsible1622820578638'],
        ['IRS NOTICE 2014-21: Q-8. Does a taxpayer who “mines” virtual currency realize gross income upon receipt of the virtual currency resulting from those activities?', 'https://www.irs.gov/irb/2014-16_IRB#NOT-2014-21'],
        ['GRAY AREA: If not received for a service rendered, nothing was actively done to receive the coins like passive airdrop ', ''],
        ['IRS Pub 525: Undocumentable Income spans from Bribes to Illegal Activity to Stolen Property: all taxable', 'https://www.irs.gov/publications/p525#en_US_2020_publink1000229492'],
        ['Just like you can move dollar bills from one pocket of your pants to another, a transfer between addresses you control is not taxable.'],
        ['Just like you can move dollar bills from one pocket of your pants to another, a transfer between addresses you control is not taxable.'],
        ['GRAY AREA: If you can no longer control the coin, perhaps can consider it a loss equal to FMV of what was lost/stolen', ''],
        ['IRS FAQ Q34. If I donate virtual currency to a charity, will I have to recognize income, gain, or loss?', 'https://www.irs.gov/individuals/international-taxpayers/frequently-asked-questions-on-virtual-currency-transactions#collapseCollapsible1622820578248'],
        ['GRAY AREA: If you can no longer use the coin because the blockchain no longer advances, probably safe to consider it a loss equal to FMV at last transactable date', ''],
        ['IRS FAQ Q16. Will I recognize a gain or loss if I exchange my virtual currency for other property?', 'https://www.irs.gov/individuals/international-taxpayers/frequently-asked-questions-on-virtual-currency-transactions#collapseCollapsible1622820578673'],
        ['IRS FAQ Q14. Will I recognize a gain or loss if I pay someone with virtual currency for providing me with a service?', 'https://www.irs.gov/individuals/international-taxpayers/frequently-asked-questions-on-virtual-currency-transactions#collapseCollapsible1622820578720'],
        ['IRS 1040 Instructions: ...A [taxable] transaction involving virtual currency includes...An exchange of virtual currency for other property, including for another virtual currency', 'https://www.irs.gov/instructions/i1040gi'],
        ['IRS 1040 Instructions: ...A [taxable] transaction involving virtual currency includes...A disposition of a financial interest in virtual currency', 'https://www.irs.gov/instructions/i1040gi'],
        ['IRS Fact Sheet on Misc Income', 'https://www.irs.gov/pub/irs-news/fs-07-26.pdf'],
        ['Taking a conservative position, you can treat the wrapped or bridged token as two separate assets. With this position, it is a taxable transaction, subject to capital gains taxes, as you are disposing one token for another.']
    ];

    if (typeof ScriptApp !== 'undefined') {
        const sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet('Categories');

        // populate the header cells
        sheet.getRange('1:1').addDeveloperMetadata('version', version);
        sheet.getRange('A1:D1').setValues([header]).setFontWeight('bold');

        // fill in the raw data
        for (let i = 0; i < data.length; i++) {
            sheet.getRange(`A${i + 2}:C${i + 2}`).setValues([data[i]]);
        }

        // add text with URL links to colE data
        for (let j = 0; j < data.length; j++) {
            const range = SpreadsheetApp.getActive().getRange(`D${j + 2}`);
            const richValue = SpreadsheetApp.newRichTextValue()
                .setText(justificationLinks[j][0])
                .setLinkUrl((justificationLinks[j][1] === '') ? null : justificationLinks[j][1])
                .build();
            range.setRichTextValue(richValue);
        }

        // autosize the 5 columns' widths to fit content
        sheet.autoResizeColumns(1, 4);

        // draw border around the rows that will fed into dropdowns in other sheets
        sheet.getRange('A2:C35').setBorder(true, true, true, true, false, false);

        SpreadsheetApp.flush();
        return sheet;
    }
    return null;
}
