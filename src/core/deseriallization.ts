import { GUID } from "..";
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

    
    let so: Serialization.TSerializedObject;

    // -- Deserialize the JSON
    try { so = JSON.parse(json); }

    // -- Reject any errors
    catch { return null; }


    // -- Parse nodes (Skip any nodes that are not valid)
    if(so?.nodes) so.nodes.forEach((node) => {

        // -- Validate the UUIDs
        if(!GUID.isValid(node?.id) || 
           !GUID.isValid(node?.parent) || 
           !GUID.isValid(node?.group))
        return;

        // -- Create the TSerializedNode
        const sn: Serialization.TSerializedNode = {
            id: new GUID(node.id),
            parent: new GUID(node.parent),
            group: new GUID(node.group),
            position: node.position,
            attributes: node.attributes
        }


        // // -- Check if the node is valid
        // // TODO: Add a full validation check, as most people wont use typescript
        // // Which we use to enforce type safety  
        // if(!n) return;

        // // -- Create a reference to the node
        // const nRef = {
        //     get: () => n,
        //     id: sn.id
        // }

        // // -- Add the node to the node map  
        // nodeMap.set(n.ids.self, nRef);
    });

    // -- Return the deserialized object
    return {
        nodeMap,
        parentMap,
        connectionMap,
        connectionPointersMap
    };
}

