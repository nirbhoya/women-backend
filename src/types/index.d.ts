export interface User {
    id: string;
    name: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface MenstrualCycle {
    id: string;
    userId: string;
    startDate: Date;
    endDate: Date;
    cycleLength: number;
    periodLength: number;
    symptoms: string[];
    createdAt: Date;
    updatedAt: Date;
}