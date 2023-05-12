export class User {
    id?: String;
    pseudo?: string;
    image?: string;
    currentResponse?: number;
    currentWinner: boolean = false;
    globalScore?: number;
    globalWinner?: boolean = false;
    eliminate: boolean = false;
    admin: boolean = false;
    closed?: boolean = false; 
    connected?: boolean = false; 
    exactlyNumberFound?: boolean = false; 
}
