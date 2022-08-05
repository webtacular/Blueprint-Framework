const validGuidRegex: RegExp = /^[0-9a-f]{8}[-][0-9a-f]{4}[-][1-5][0-9a-f]{3}[-][89ab][0-9a-f]{3}[-][0-9a-f]{12}$/i;
import { GUID } from '../types';

export default class GUID_class implements GUID.IGUID {
    public readonly guid: string = '';

    public constructor(guid?: any) {
        // If no GUID is provided, generate a new one
        if(!guid) guid = genGuid();
        
        else if(guid instanceof GUID_class) guid = guid.toString();

        // Validate the GUID
        if(!validateGuid(guid)) throw new Error('Invalid GUID');

        // Set the GUID
        this.guid = guid;
    }

    public toString(): string {
        return this.guid;
    }

    public static isValid(guid:any): boolean {
        return validateGuid(guid);
    }

    public equals(guid:any): boolean {
        // Check if the guid is an instance of the GUID class
        if(guid instanceof GUID_class)
            return this.guid === guid.toString();
        
        // Validate the GUID
        if(!validateGuid(guid)) return false;

        // Compare the GUIDs
        return this.guid === guid;
    }
}

// Generate a new GUID
const genGuid: () => string = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c :string) :string => {
        const r: number = Math.random() * 16 | 0;
        const v: number = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Validate a GUID
const validateGuid:(guid: any) => boolean = (guid: any): boolean => {
    // Check if the GUID is a class instance
    if (guid instanceof GUID_class)
        return true;
        
    return validGuidRegex.test(guid);
}
