
import { GUID } from '..';
import { 
    ConnectionManager, 
    ConnectionNode, 
    Serialization 
} from '../types';

export default (
    connectionsMap: ConnectionManager.TConnectionMap,
    nodeMap: ConnectionManager.TNodeMap,
    parentMap: ConnectionManager.TParentMap
): Serialization.TSerializedObject => {
    
    const groups: Array<GUID> = [],
        nodes: Array<Serialization.TSerializedNode> = [],   
        parents: Array<Serialization.TSerializedParent> = [],
        connections: Array<Serialization.TSerializedConnection> = [];

    // -- Gather all data about groups and nodes
    nodeMap.forEach((nodeRef) => {
        // -- Get the node
        const node = nodeRef.get() as ConnectionNode.INode;

        // -- Get the group
        const group = node.ids.group;

        // -- Check if the group is already in the list
        if (groups.indexOf(group) === -1) 
            groups.push(group);

        // -- Push the node
        nodes.push({
            id: node.ids.self,
            parent: node.ids.parent,
            group: node.ids.group,
            position: node.hooks.rootPosition(),
            attributes: node.attributes
        });
    });


    // -- Gather all data about parents
    parentMap.forEach((children, id) => {
        
        // -- Get the ids of its children
        const childrenIds: Array<GUID> = [];

        let attributes: ConnectionNode.TAttributes = null;

        // -- Iterate over the children
        children.forEach((child) => {
            // -- Check if attributes are set 
            if (attributes === null) { 

                // Get the child
                const node = child.get();

                // -- Attempt to get the parent attributes
                attributes = node?.getParentAttributes();
            }

            // -- Push the child id
            childrenIds.push(child.id);
        }); 

        // -- Push the parent
        parents.push({  
            id: id, 
            attributes,
            children: childrenIds
        });
    });


    // -- Gather all data about connections 
    connectionsMap.forEach((connection) => {
        // -- Push the connection
        connections.push({
            origin: connection[0],
            destination: connection[1]
        });
    });
    

    // -- Return the serialized object
    return {
        groups,
        parents,
        nodes,
        connections
    };
}