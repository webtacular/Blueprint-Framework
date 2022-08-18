import { Serialization, ConnectionManager as cm } from "../types";

export default (
    json: string,
    populateHook: Serialization.TPopulateNode
): Serialization.IDeserializedObject | null => {

    // -- Instantiate the Maps
    const nodeMap: cm.TNodeMap = new Map(),     
        parentMap: cm.TParentMap = new Map(),
        connectionMap: cm.TConnectionMap = new Map(),
        connectionPointersMap: cm.TConnectionPointersMap = new Map();

    
    let serializedObject: Serialization.IDeserializedObject;

    // -- Deserialize the JSON
    try { serializedObject = JSON.parse(json); }

    // -- Reject any errors
    catch { return null; }


    console.log(serializedObject);

    
    // -- Return the deserialized object
    return {
        nodeMap,
        parentMap,
        connectionMap,
        connectionPointersMap
    };
}