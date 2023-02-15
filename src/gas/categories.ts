import { version } from '../version';

/* global GoogleAppsScript */
/* global SpreadsheetApp */

/**
 * A function that adds crypto coin Categories and tax theories around each category
 *
 * @return the newly created sheet, for function chaining purposes.
 */
export function newCategorySheet(): GoogleAppsScript.Spreadsheet.Sheet | null {
    // Initial set of categories provided out of the box
    const header = ['Categories', 'Type', 'Tax Status', 'Sample Tax Status Justification (DYOR: Do Your Own Research!)'];
    const data = [
        ['USD Deposit', 'Cash In', 'Not Taxable'],
        ['USD Withdrawal', 'Cash Out', 'Taxable'],
        ['Active Airdrop', 'Inflow', 'Taxable'],
        ['Bridge Inflow', 'Inflow', 'Already Taxed'],
        ['Earned Income', 'Inflow', 'Taxable'],
        ['Fork', 'Inflow', 'Taxable'],
        ['Gift Received', 'Inflow', 'Not Taxable'],
        ['Interest', 'Inflow', 'Taxable'],
        ['Mining', 'Inflow', 'Taxable'],
        ['NFT Sales Inflow', 'Inflow', 'Already Taxed'],
        ['Passive Airdrop', 'Inflow', 'Not Taxable'],
        ['Promotion', 'Inflow', 'Taxable'],
        ['Reward/Prize', 'Inflow', 'Taxable'],
        ['Sales Inflow', 'Inflow', 'Taxable'],
        ['Staking', 'Inflow', 'Taxable'],
        ['Tip Income', 'Inflow', 'Not Taxable'],
        ['Trade Inflow', 'Inflow', 'Already Taxed'],
        ['Unknown Inflow', 'Inflow', 'Taxable'],
        ['Transfer In', 'Inflow', 'Not Taxable'],
        ['Transfer Out', 'Outflow', 'Not Taxable'],
        ['Bridge Outflow', 'Outflow', 'Taxable'],
        ['Fraud/Scam', 'Outflow', 'Taxable'],
        ['Given Away', 'Outflow', 'Not Taxable'],
        ['Lost/Stolen', 'Outflow', 'Not Taxable'],
        ['Project Ended', 'Outflow', 'Taxable'],
        ['Sold for Goods', 'Outflow', 'Taxable'],
        ['Spent', 'Outflow', 'Taxable'],
        ['Trade Outflow', 'Outflow', 'Taxable'],
        ['Tx Fee', 'Outflow', 'Taxable'],
        ['Unknown Outflow', 'Outflow', 'Taxable']
    ];
    const justificationLinks = [
        ['IRS 1040 Instructions: ...A [taxable] transaction does not include the holding of virtual currency in a wallet or account.', 'https://www.irs.gov/instructions/i1040gi'],
        ['IRS 1040 Instructions: ...A [taxable] transaction involving virtual currency includes...A sale of virtual currency.', 'https://www.irs.gov/instructions/i1040gi'],
        ['IRS Memo 202035011: ...virtual currency in exchange for performing a microtask/service... the virtual currency received is taxable.', 'https://www.irs.gov/pub/irs-wd/202035011.pdf'],
        ['The Inflow side of a bridged transaction is not taxable from the HODL Totals perspective because the gain/loss is captured on the Bridge Outflow side of the transaction.', ''],
        ['IRS FAQ Q9. Do I have income if I provide someone with a service and that person pays me with virtual currency?', 'https://www.irs.gov/individuals/international-taxpayers/frequently-asked-questions-on-virtual-currency-transactions#collapseCollapsible1622820578836'],
        ['IRS FAQ Q24. How do I calculate my income from cryptocurrency I received following a hard fork?', 'https://www.irs.gov/individuals/international-taxpayers/frequently-asked-questions-on-virtual-currency-transactions#collapseCollapsible1622820578458'],
        ['IRS FAQ Q31. I received virtual currency as a bona fide gift. Do I have income? (below $15,000/yr)', 'https://www.irs.gov/individuals/international-taxpayers/frequently-asked-questions-on-virtual-currency-transactions#collapseCollapsible1622820578306'],
        ['IRS Pub 550: In general, any interest that you receive or that is credited to your account and can be withdrawn is taxable income.', 'https://www.irs.gov/taxtopics/tc403'],
        ['IRS Notice 2014-21: Q-8. Does a taxpayer who “mines” virtual currency realize gross income upon receipt of the virtual currency resulting from those activities?', 'https://www.irs.gov/irb/2014-16_IRB#NOT-2014-21'],
        ['NFT Sales revenue is not taxable from the HODL Totals perspective, assuming the NFT was tracked with HODL totals sheets, because the gain/loss on the NFT sale is captured on the NFT tracking sheet as a Collectible sale.', ''],
        ['GRAY AREA: Nothing was actively done to receive the coins, nor was the airdrop a proportional reward to some other tokens already held.', ''],
        ['IRS Pub 550: Gift for opening an account: If you receive noncash gifts or services for making deposits/opening an account...you may have to report it.', 'https://www.irs.gov/publications/p550#en_US_2020_publink10009869'],
        ['IRS Pub 525 Other Income... Prizes or awards in goods or services must be included in your income at their FMV.', 'https://www.irs.gov/publications/p525#en_US_2020_publink1000229578'],
        ['IRS FAQ Q17. How do I calculate my gain or loss when I exchange my virtual currency for other property?', 'https://www.irs.gov/individuals/international-taxpayers/frequently-asked-questions-on-virtual-currency-transactions#collapseCollapsible1622820578638'],
        ['GRAY AREA: Jarrett v. United State argued staking rewards are not subject to tax; but the case did not provide clarity. The safest position is to treat staking income just like mining income.', 'https://www.irs.gov/irb/2014-16_IRB#NOT-2014-21'],
        ['GRAY AREA: If not received for a service rendered, nothing was actively done to receive the coins like passive airdrop.', ''],
        ['The Inflow side of a trade is not taxable from the HODL Totals perspective because the gain/loss on the trade is captured on the Trade Outflow side of the trade.', ''],
        ['IRS Pub 525: Undocumentable Income spans from Bribes to Illegal Activity to Stolen Property: all taxable', 'https://www.irs.gov/publications/p525#en_US_2020_publink1000229492'],
        ['Just like you can move dollar bills from one pocket of your pants to another, a transfer between addresses you control is not taxable.'],
        ['Just like you can move dollar bills from one pocket of your pants to another, a transfer between addresses you control is not taxable.'],
        ['GRAY AREA: If you treat the same token on two different networks as separate assets, then bridging outflow would be a taxable transaction subject to capital gains taxes, as you are disposing one token for another.'],
        ['GRAY AREA: Ideally with FBI/Police/SEC reports in hand, you can claim crypto investment losses due to events like fraudulent ICO scams, rug pulls and ponzi schemes that leave you with provably worthless assets.', 'https://www.irs.gov/taxtopics/tc515'],
        ['IRS FAQ Q34. If I donate virtual currency to a charity, will I have to recognize income, gain, or loss?', 'https://www.irs.gov/individuals/international-taxpayers/frequently-asked-questions-on-virtual-currency-transactions#collapseCollapsible1622820578248'],
        ['You can\'t deduct "lost" tokens. and The Job Cuts and Tax Act of 2017 made most crypto casualty and theft losses not deductible.', 'https://www.irs.gov/taxtopics/tc515'],
        ['IRS Chief Counsel Advice 202302011: In general, the worthless securities provisions under §165(g)(1) doesn\'t apply to crypto. but if you can no longer transact the coin (it is definitively worthless/unusable), you can consider it a loss under §165(a).', 'https://www.irs.gov/pub/irs-wd/202302011.pdf'],
        ['IRS FAQ Q16. Will I recognize a gain or loss if I exchange my virtual currency for other property?', 'https://www.irs.gov/individuals/international-taxpayers/frequently-asked-questions-on-virtual-currency-transactions#collapseCollapsible1622820578673'],
        ['IRS FAQ Q14. Will I recognize a gain or loss if I pay someone with virtual currency for providing me with a service?', 'https://www.irs.gov/individuals/international-taxpayers/frequently-asked-questions-on-virtual-currency-transactions#collapseCollapsible1622820578720'],
        ['IRS 1040 Instructions: ...A [taxable] transaction involving virtual currency includes...An exchange of virtual currency for other property, including for another virtual currency.', 'https://www.irs.gov/instructions/i1040gi'],
        ['IRS 1040 Instructions: ...A [taxable] transaction involving virtual currency includes...A disposition of a financial interest in virtual currency.', 'https://www.irs.gov/instructions/i1040gi'],
        ['Use rarely, if ever, to make small adjustments to fix rounding errors. No one wants to get audited and hit with an Accuracy-Related Penalty', 'https://www.irs.gov/payments/accuracy-related-penalty']
    ];

    const sheet = makeCategoriesSheet('Categories', header, data, justificationLinks);
    // draw border around the rows that will fed into dropdowns in other sheets
    sheet?.getRange('A2:C35').setBorder(true, true, true, true, false, false);
    return sheet;
}

/**
 * A function that adds NFT Categories and tax theories around each category
 *
 * @return the newly created sheet, for function chaining purposes.
 */
export function newNFTCategorySheet(): GoogleAppsScript.Spreadsheet.Sheet | null {
    // Initial set of categories provided out of the box
    const header = ['Categories', 'Type', 'Tax Status', 'Sample Tax Status Justification (DYOR: Do Your Own Research!)'];
    const data = [
        ['Purchased with USD', 'Cash In', 'Not Taxable'],
        ['Purchased (Fixed Price)', 'Inflow', 'Already Taxed'],
        ['Purchased (Auction)', 'Inflow', 'Already Taxed'],
        ['Active Airdrop', 'Inflow', 'Taxable (on NFT Value)'],
        ['Created from Scratch', 'Inflow', 'Not Taxable'],
        ['Gift Received', 'Inflow', 'Not Taxable'],
        ['Mint', 'Inflow', 'Already Taxed'],
        ['Passive Airdrop', 'Inflow', 'Not Taxable'],
        ['Product of Breeding', 'Inflow', 'Not Taxable'],
        ['Reward/Prize', 'Inflow', 'Taxable (on NFT Value)'],
        ['Trade Inflow', 'Inflow', 'Already Taxed'],
        ['Transfer In', 'Inflow', 'Not Taxable'],
        ['', '', ''],
        ['', '', ''],
        ['', '', ''],
        ['', '', ''],
        ['', '', ''],
        ['', '', ''],
        ['', '', ''],
        ['Sold for USD', 'Cash Out', 'Taxable'],
        ['Sold for Crypto', 'Outflow', 'Taxable'],
        ['Bridge Outflow', 'Outflow', 'Taxable'],
        ['Fraud/Scam', 'Outflow', 'Taxable'],
        ['Given Away', 'Outflow', 'Not Taxable'],
        ['Lost/Stolen', 'Outflow', 'Not Taxable'],
        ['Trade Outflow', 'Outflow', 'Taxable'],
        ['Sold for Goods', 'Outflow', 'Taxable'],
        ['Transfer Out', 'Outflow', 'Not Taxable']

    ];
    const justificationLinks = [
        ['IRS 1040 Instructions: ...A [taxable] transaction does not include the holding of virtual currency in a wallet or account', 'https://www.irs.gov/instructions/i1040gi'],
        ['NFT Purchases are not taxable from the HODL Totals perspective because the gain/loss on the crypto used to purchase NFTs are captured on the crypto coin\'s tracking sheet.', ''],
        ['NFT Purchases are not taxable from the HODL Totals perspective because the gain/loss on the crypto used to purchase NFTs are captured on the crypto coin\'s tracking sheet.', ''],
        ['Based on precedent, airdrops will be taxed as ordinary income (i.e. short-term capital gains rates), generally, when the assets are recorded on ledger and/or enter your wallet.', ''],
        ['Creators of NFTs are taxed in a different way compared to NFT investors. Creating the NFT does not trigger a taxable event.', ''],
        ['Receiving a gift is not a taxable event. However, the donor will likely owe a ‘gift tax’ if the value is above $16,000 and file IRS Form 709.', ''],
        ['Minting NFTs are not taxable from the HODL Totals perspective because the gain/loss on the crypto spent on mint costs and tx fees to acquire the NFTs is captured on the crytpo coin\'s tracking sheet.', ''],
        ['GRAY AREA: Nothing was actively done to receive the NFTs, nor was the airdrop a proportional reward to some other tokens already held', ''],
        ['If you are an artist or creator minting NFTs, you will be subject to income taxes on the revenue from the sale of your NFT(s). If you are selling NFTs as a trade or business, you can deduct related business expenses.', ''],
        ['IRS Pub 525 Other Income... Prizes or awards in goods or services must be included in your income at their FMV', 'https://www.irs.gov/publications/p525#en_US_2020_publink1000229578'],
        ['The Inflow side of an NFT-for-NFT trade is not taxable from the HODL Totals perspective because the gain/loss on the NFT trade is captured on the Trade Outflow side of the trade.', ''],
        ['Just like you can move dollar bills from one pocket of your pants to another, a transfer between addresses you control is not taxable.', ''],
        ['', ''],
        ['', ''],
        ['', ''],
        ['', ''],
        ['', ''],
        ['', ''],
        ['', ''],
        ['IRS 1040 Instructions: ...A [taxable] transaction involving virtual currency includes...A sale of virtual currency', 'https://www.irs.gov/instructions/i1040gi'],
        ['If an NFT is sold for crypto, this would trigger a new capital gain/loss taxable event.', ''],
        ['GRAY AREA: If you treat wrapped or bridged tokens as two separate assets, then bridging outflow would be a taxable transaction subject to capital gains taxes, as you are disposing one token for another.', ''],
        ['GRAY AREA: Ideally with FBI/Police/SEC reports in hand, you can claim crypto investment losses due to events like fraudulent ICO scams, rug pulls and ponzi schemes that leave you with provably worthless assets.', 'https://www.irs.gov/taxtopics/tc515'],
        ['IRS FAQ Q34. If I donate virtual currency to a charity, will I have to recognize income, gain, or loss?', 'https://www.irs.gov/individuals/international-taxpayers/frequently-asked-questions-on-virtual-currency-transactions#collapseCollapsible1622820578248'],
        ['You can\'t deduct "lost" tokens. and The Job Cuts and Tax Act of 2017 made most crypto casualty and theft losses not deductible.', 'https://www.irs.gov/taxtopics/tc515'],
        ['If an NFT is swapped for another NFT, this would trigger a new capital gain/loss taxable event.', ''],
        ['IRS FAQ Q16. Will I recognize a gain or loss if I exchange my virtual currency for other property?', 'https://www.irs.gov/individuals/international-taxpayers/frequently-asked-questions-on-virtual-currency-transactions#collapseCollapsible1622820578673'],
        ['Just like you can move dollar bills from one pocket of your pants to another, a transfer between addresses you control is not taxable.', ''],
        ['', ''],
        ['https://reconcile.substack.com/p/your-full-crypto-tax-guide-and-transaction?s=r', 'https://reconcile.substack.com/p/your-full-crypto-tax-guide-and-transaction?s=r'],
        ['A new holding period would begin for the NFT, which the IRS will likely rule as a “collectible” once they issue guidance on the asset class. Some may argue that NFTs will be classified as a digital asset instead**.', ''],
        ['"*Note: While crypto is taxed as property, it still acts and looks like a security. Under the IRS definitions in §165, 475, 1091, there are no cryptos that meet the definition of a security. \n'
        + '99% of the rules are similar, but also the reason wash sales are currently allowed is because crypto != security at this time. Changes to the wash sale rule for crypto could be coming soon.\n'
        + 'Additionally, SEC chair Gensler has said almost all cryptos ARE securities, but the SEC decision doesn\'t have authority over the IRS. CFTC has said most are likely commodities and not securities."', ''],
        ['', ''],
        ['"Some NFTs do not fall into the “collectibles” category. For example, certain NFTs represent ownership of real-world assets or staking positions in decentralized protocols like Uniswap.\n\n'
        + 'In cases like this, the NFT would likely be taxed at the typical long-term capital gains rate if it is sold after 12 months. Currently, long-term capital gains are capped at 20%."', ''],
        ['"**Note: Collectibles are governed by §408(m), which says ""any work of art."" However, it can clearly be argued that not all NFTS fall into this category (ENS domains, event tix, etc),\n'
        + 'so it\'s not an all or nothing categorization. On the actual art, there\'s a good divide in the tax pro community. Are you buying the art or are you buying computer code that\'s a digital roadmap to the art."', ''],
        ['The IRS treats collectibles as a special class of capital asset subject to its own specific rules. If your NFT is considered a “Collectible”, you will need to pay a maximum tax of 28%, which is slightly higher than the typical long-term capital gains tax rate. ', ''],
        ['"The IRS defines a collectible as:\n\nAny work of art,\nAny rug or antique,\nAny metal or gem,\nAny stamp or coin,\nAny alcoholic beverage, or\nAny other tangible personal property that the IRS determines is a ""collectible"" under IRC Section 408(m)."', '']
    ];

    const sheet = makeCategoriesSheet('NFT Categories', header, data, justificationLinks);
    // draw border around the rows that will fed into dropdowns in other sheets
    sheet?.getRange('A2:C20').setBorder(true, true, true, true, false, false);
    sheet?.getRange('A21:C35').setBorder(true, true, true, true, false, false);
    return sheet;
}

function makeCategoriesSheet(sheetTitle: string, header: string[], data: string[][], justificationLinks: string[][]): GoogleAppsScript.Spreadsheet.Sheet | null {
    if (typeof ScriptApp !== 'undefined') {
        const sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(sheetTitle).hideSheet();
        sheet.addDeveloperMetadata('version', version);

        // populate the header cells
        sheet.getRange('A1:D1').setValues([header]).setFontWeight('bold').setBackground('#DDDDEE');

        // fill in the raw data
        for (let i = 0; i < data.length; i++) {
            sheet.getRange(`A${i + 2}:C${i + 2}`).setValues([data[i]]);
        }

        // add text with URL links to colE data
        for (let j = 0; j < justificationLinks.length; j++) {
            const range = SpreadsheetApp.getActive().getRange(`D${j + 2}`);
            const richValue = SpreadsheetApp.newRichTextValue()
                .setText(justificationLinks[j][0])
                .setLinkUrl((justificationLinks[j][1] === '') ? null : justificationLinks[j][1])
                .build();
            range.setRichTextValue(richValue);
        }

        // autosize the 5 columns' widths to fit content
        sheet.autoResizeColumns(1, 4);

        SpreadsheetApp.flush();
        return sheet;
    }
    return null;
}
