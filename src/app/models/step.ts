import { User } from "./user";

export class Step {
    id?: String;
    rang?: number;
    startDate?: Date;
    users?: Array<User>;
    closed?: boolean;   
    durationMillisecond?:number;
}
