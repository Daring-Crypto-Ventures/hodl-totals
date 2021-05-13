import inquirer from 'inquirer';

// The standalone app functionality goes here
function displayData(): void {
    console.log('--> TODO HODL Totals data table <--');
}

enum Commands {
    LoadCostBasisExample = 'Load Example',
    Quit = 'Quit'
}

function promptUser(): void {
    displayData();
    inquirer.prompt({
        type: 'list',
        name: 'command',
        message: 'Choose option',
        choices: Object.values(Commands)
    }).then(answers => {
        switch (answers.command) {
            case Commands.LoadCostBasisExample:
                // TODO implmement this
                console.log('Example not accessible from node.js place yet.');
                promptUser();
                break;
            default:
        }
    });
}

console.clear();
promptUser();
