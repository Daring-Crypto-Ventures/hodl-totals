import {sum} from "./calc";

const greeter = (person: string) => {
    return `Hello, ${person}!`;
  };

const user = "Darin";
console.log("Typescript says, " + greeter(user));
console.log("And imported calc module says, 1+1=" + sum(1, 1));
