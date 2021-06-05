/**
 * @NotOnlyCurrentDoc Limits the script to only accessing the current sheet.
 *
 * Create & manage categories which are used in individual coin sheets
 *
 */

/**
 * A function that adds columns and headers to the spreadsheet.
 *
 * @return the newly created sheet, for function chaining purposes.
 */
export default function newCategorySheet(): GoogleAppsScript.Spreadsheet.Sheet | null {
    // Initial set of categories provided out of the box
    const header = ['Categories', 'Type', 'Tax Status', 'Inflow Categories', 'Outflow Categories', 'Tax Status Justification'];
    const data = [
        ['USD Deposit', 'Cash In', 'Not Taxable', '=IF(EXACT(B2,"Inflow"), A2, "")', '=IF(AND(EXACT(B2,"Outflow"),NOT(EXACT(A2,"Traded")),NOT(EXACT(A2,"Tx Fee"))), A2, "")'],
        ['USD Withdrawal', 'Cash Out', 'Taxable', '=IF(EXACT(B3,"Inflow"), A3, "")', '=IF(AND(EXACT(B3,"Outflow"),NOT(EXACT(A3,"Traded")),NOT(EXACT(A3,"Tx Fee"))), A3, "")'],
        ['Active Airdrop', 'Inflow', 'Taxable', '=IF(EXACT(B4,"Inflow"), A4, "")', '=IF(AND(EXACT(B4,"Outflow"),NOT(EXACT(A4,"Traded")),NOT(EXACT(A4,"Tx Fee"))), A4, "")'],
        ['Passive Airdrop', 'Inflow', 'Not Taxable', '=IF(EXACT(B5,"Inflow"), A5, "")', '=IF(AND(EXACT(B5,"Outflow"),NOT(EXACT(A5,"Traded")),NOT(EXACT(A5,"Tx Fee"))), A5, "")'],
        ['Bounty Fulfilled', 'Inflow', 'Taxable', '=IF(EXACT(B6,"Inflow"), A6, "")', '=IF(AND(EXACT(B6,"Outflow"),NOT(EXACT(A6,"Traded")),NOT(EXACT(A6,"Tx Fee"))), A6, "")'],
        ['Fork', 'Inflow', 'Taxable', '=IF(EXACT(B7,"Inflow"), A7, "")', '=IF(AND(EXACT(B7,"Outflow"),NOT(EXACT(A7,"Traded")),NOT(EXACT(A7,"Tx Fee"))), A7, "")'],
        ['Gift Received', 'Inflow', 'Not Taxable', '=IF(EXACT(B8,"Inflow"), A8, "")', '=IF(AND(EXACT(B8,"Outflow"),NOT(EXACT(A8,"Traded")),NOT(EXACT(A8,"Tx Fee"))), A8, "")'],
        ['Interest', 'Inflow', 'Taxable', '=IF(EXACT(B9,"Inflow"), A9, "")', '=IF(AND(EXACT(B9,"Outflow"),NOT(EXACT(A9,"Traded")),NOT(EXACT(A9,"Tx Fee"))), A9, "")'],
        ['Mining', 'Inflow', 'Taxable', '=IF(EXACT(B10,"Inflow"), A10, "")', '=IF(AND(EXACT(B10,"Outflow"),NOT(EXACT(A10,"Traded")),NOT(EXACT(A10,"Tx Fee"))), A10, "")'],
        ['Reward/Prize', 'Inflow', 'Taxable', '=IF(EXACT(B11,"Inflow"), A11, "")', '=IF(AND(EXACT(B11,"Outflow"),NOT(EXACT(A11,"Traded")),NOT(EXACT(A11,"Tx Fee"))), A11, "")'],
        ['Promotion', 'Inflow', 'Taxable', '=IF(EXACT(B12,"Inflow"), A12, "")', '=IF(AND(EXACT(B12,"Outflow"),NOT(EXACT(A12,"Traded")),NOT(EXACT(A12,"Tx Fee"))), A12, "")'],
        ['Sales Revenue', 'Inflow', 'Taxable', '=IF(EXACT(B13,"Inflow"), A13, "")', '=IF(AND(EXACT(B13,"Outflow"),NOT(EXACT(A13,"Traded")),NOT(EXACT(A13,"Tx Fee"))), A13, "")'],
        ['Staking', 'Inflow', 'Taxable', '=IF(EXACT(B14,"Inflow"), A14, "")', '=IF(AND(EXACT(B14,"Outflow"),NOT(EXACT(A14,"Traded")),NOT(EXACT(A14,"Tx Fee"))), A14, "")'],
        ['Tip Income', 'Inflow', 'Not Taxable', '=IF(EXACT(B15,"Inflow"), A15, "")', '=IF(AND(EXACT(B15,"Outflow"),NOT(EXACT(A15,"Traded")),NOT(EXACT(A15,"Tx Fee"))), A15, "")'],
        ['Unknown Inflow', 'Inflow', 'Taxable', '=IF(EXACT(B16,"Inflow"), A16, "")', '=IF(AND(EXACT(B16,"Outflow"),NOT(EXACT(A16,"Traded")),NOT(EXACT(A16,"Tx Fee"))), A16, "")'],
        ['Lost/Stolen', 'Outflow', 'Taxable', '=IF(EXACT(B17,"Inflow"), A17, "")', '=IF(AND(EXACT(B17,"Outflow"),NOT(EXACT(A17,"Traded")),NOT(EXACT(A17,"Tx Fee"))), A17, "")'],
        ['Given Away', 'Outflow', 'Not Taxable', '=IF(EXACT(B18,"Inflow"), A18, "")', '=IF(AND(EXACT(B18,"Outflow"),NOT(EXACT(A18,"Traded")),NOT(EXACT(A18,"Tx Fee"))), A18, "")'],
        ['Project Ended', 'Outflow', 'Taxable', '=IF(EXACT(B19,"Inflow"), A19, "")', '=IF(AND(EXACT(B19,"Outflow"),NOT(EXACT(A19,"Traded")),NOT(EXACT(A19,"Tx Fee"))), A19, "")'],
        ['Sold for Goods', 'Outflow', 'Taxable', '=IF(EXACT(B20,"Inflow"), A20, "")', '=IF(AND(EXACT(B20,"Outflow"),NOT(EXACT(A20,"Traded")),NOT(EXACT(A20,"Tx Fee"))), A20, "")'],
        ['Spent', 'Outflow', 'Taxable', '=IF(EXACT(B21,"Inflow"), A21, "")', '=IF(AND(EXACT(B21,"Outflow"),NOT(EXACT(A21,"Traded")),NOT(EXACT(A21,"Tx Fee"))), A21, "")'],
        ['Traded', 'Outflow', 'Taxable', '=IF(EXACT(B22,"Inflow"), A22, "")', '=IF(AND(EXACT(B22,"Outflow"),NOT(EXACT(A22,"Traded")),NOT(EXACT(A22,"Tx Fee"))), A22, "")'],
        ['Tx Fee', 'Outflow', 'Taxable', '=IF(EXACT(B23,"Inflow"), A23, "")', '=IF(AND(EXACT(B23,"Outflow"),NOT(EXACT(A23,"Traded")),NOT(EXACT(A23,"Tx Fee"))), A23, "")'],
        ['Unknown Outflow', 'Outflow', 'Taxable', '=IF(EXACT(B24,"Inflow"), A24, "")', '=IF(AND(EXACT(B24,"Outflow"),NOT(EXACT(A24,"Traded")),NOT(EXACT(A24,"Tx Fee"))), A24, "")']
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
        ['GRAY AREA: If you can no longer control the coin, perhaps can consider it a loss equal to FMV of what was lost/stolen', ''],
        ['IRS FAQ Q34. If I donate virtual currency to a charity, will I have to recognize income, gain, or loss?', 'https://www.irs.gov/individuals/international-taxpayers/frequently-asked-questions-on-virtual-currency-transactions#collapseCollapsible1622820578248'],
        ['GRAY AREA: If you can no longer use the coin because the blockchain no longer advances, probably safe to consider it a loss equal to FMV at last transactable date', ''],
        ['IRS FAQ Q16. Will I recognize a gain or loss if I exchange my virtual currency for other property?', 'https://www.irs.gov/individuals/international-taxpayers/frequently-asked-questions-on-virtual-currency-transactions#collapseCollapsible1622820578673'],
        ['IRS FAQ Q14. Will I recognize a gain or loss if I pay someone with virtual currency for providing me with a service?', 'https://www.irs.gov/individuals/international-taxpayers/frequently-asked-questions-on-virtual-currency-transactions#collapseCollapsible1622820578720'],
        ['IRS 1040 Instructions: ...A [taxable] transaction involving virtual currency includes...An exchange of virtual currency for other property, including for another virtual currency', 'https://www.irs.gov/instructions/i1040gi'],
        ['IRS 1040 Instructions: ...A [taxable] transaction involving virtual currency includes...A disposition of a financial interest in virtual currency', 'https://www.irs.gov/instructions/i1040gi'],
        ['IRS Fact Sheet on Misc Income', 'https://www.irs.gov/pub/irs-news/fs-07-26.pdf'],
    ];

    if (typeof ScriptApp !== 'undefined') {
        const sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet('Categories');

        // populate the header cells
        sheet.getRange('A1:F1').setValues([header]).setFontWeight('bold');

        // fill in the raw data
        for (let i = 0; i < data.length; i++) {
            sheet.getRange(`A${i + 2}:E${i + 2}`).setValues([data[i]]);
        }

        // add text with URL links to colE data
        for (let j = 0; j < data.length; j++) {
            const range = SpreadsheetApp.getActive().getRange(`F${j + 2}`);
            const richValue = SpreadsheetApp.newRichTextValue()
                .setText(justificationLinks[j][0])
                // @ts-expect-error Cannot find name setLinkUrl as no type declarations exists for this function, name is present when loaded in GAS
                .setLinkUrl((justificationLinks[j][1] === '') ? null : justificationLinks[j][1])
                .build();
            range.setRichTextValue(richValue);
        }

        // autosize the 5 columns' widths to fit content
        sheet.autoResizeColumns(1, 6);

        // draw border around the rows that will fed into dropdowns in other sheets
        sheet.getRange('A2:C35').setBorder(true, true, true, true, false, false);

        SpreadsheetApp.flush();
        return sheet;
    }
    return null;
}
