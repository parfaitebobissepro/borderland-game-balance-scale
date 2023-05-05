export class User {
    id?: String;
    pseudo?: string;
    image?: string;
    currentResponse?: Number;
    currentWinner: boolean = false;
    globalScore?: Number;
    globalWinner?: boolean = false;
    eliminate: boolean = false;
    admin: boolean = false;
    closed?: boolean = false; 
}
