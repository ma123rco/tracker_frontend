export interface BusinessInterface {
    about: string;
    address: string;
    email: string;
    readonly id: number;
    location: string;
    locationMap: Map<string, number>;
    name: string;
    phone: string;
}