import { Step } from "./step";

export class Room {
    id?: string;
    roomId?: string;
    steps?: Array<Step>;
    closed?: boolean;
    actualServerDate?: Date; 
}
