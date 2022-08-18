import { 
    Hooks 
} from './core/hooks';

import { 
    ConnectionNode, 
    ConnectionManager, 
    Geometric, 
    Serialization
} from './types';

import _GUID from './core/guid';
import Serialize from './core/serialization';
import Deserialize from './core/deseriallization';
export class GUID extends _GUID {}

class ConnectionManager extends Hooks {
    // #region | ----[ CONSTRUCTOR ]----
    private nodeMap: ConnectionManager.TNodeMap = new Map();        
    private parentMap: ConnectionManager.TParentMap = new Map();      
    
    private connectionMap: ConnectionManager.TConnectionMap = new Map();
    private connectionPointersMap: ConnectionManager.TConnectionPointersMap = new Map();

    private readonly opts: ConnectionManager.IConstructor;
    public constructor(opts: ConnectionManager.IConstructor) {
        super();
        this.opts = opts;
    }
    // #endregion | ----[ CONSTRUCTOR ]----    


    // #region | ----[ CONNECTIONS ]----
    /**
     * @name getConnection
     * @description Gets a connection from the connection manager, where the ID of the 
     * connection is the origin and the retuned object is the destination.
     * @param {GUID} id The id of the connection to get
     * @returns {ConnectionManager.TConneection | null} The connection or null if not found
     */
    public getConnection = (id: GUID): ConnectionManager.TConneection | null => 
        this.connectionMap.get(id) || null;


    /**
     * @name testCompatibility
     * @description Tests if a connection is possible between two nodes
     * @param {GUID} origin The origin node
     * @param {GUID} destination The destination node   
     * @returns {boolean} True if the connection is possible
     */
    public testCompatibility(origin: GUID, destination: GUID): boolean {
        // -- Check if the conections is between the same nodes
        if (origin.equals(destination)) return false;

        // -- Attempt to get the origin and destination nodes
        const originRef = this.getNode(origin),
            destinationRef = this.getNode(destination);

        // -- Check if the origin and destination were found
        if (!originRef || !destinationRef) return false;

        // -- Check if the connections belong to the same parent
        if (originRef.ids.parent.equals(destinationRef.ids.parent))
            return false;

        // -- Check if the user is trying to connect two nodes of the same type
        if (originRef.getMode() === destinationRef.getMode()) 
            return false;       
        
        // -- Check if the connection already exists
        if (this.connectionPointersMap.get(origin).has(destination)) 
            return false;

        // -- Check for compatibility       
        if (originRef.isCompatible(destinationRef) === false)
            return false;   
       
        // -- Return true as the connection is possible
        return true;
    }

    
    /**
     * @name addConnection
     * @description Adds a connection to the connection manager
     * 
     * @param {GUID} origin The origin of the connection
     * @param {GUID} destination The destination of the connection
     * 
     * @returns {GUID | null} The id of the connection or null if the connection failed
     */
    public addConnection(origin: GUID, destination: GUID): GUID | null {
        // -- Check if the connection is possible
        if(this.testCompatibility(origin, destination) === false) 
            return null;
        
        // -- Generate a new id for the connection
        const id = new GUID();

        // -- Set a reference to the connection
        this.connectionPointersMap.get(origin).set(destination, id);
        this.connectionPointersMap.get(destination).set(origin, id);

        // -- Add the connection to the map 
        this.connectionMap.set(id, [
            origin, destination
        ]);
        
        // -- Return true as the connection was added
        return id;
    }


    /**
     * @name removeConnection
     * @description Removes a connection from the connection manager
     * @param {GUID} id The id of the connection to remove
     * @returns {boolean} True if the connection was removed
     */
    public removeConnection = (id: GUID): boolean => {  
        // -- Attempt to get the connection
        const connection = this.getConnection(id);

        // -- Check if the connection was found
        if (!connection) return false;  

        // -- Remove the connection from the map
        this.connectionMap.delete(id);

        // -- Return true as the connection was removed
        return true;
    }
    // #endregion | ----[ CONNECTIONS ]----


    // #region | ----[ NODE ]----
    /**
     * @name getNode
     * @param {GUID} id The id of the node
     * @returns {ConnectionNode.INode | null} The node or null if not found
     */
    public getNode = (id: GUID): ConnectionNode.INode | null => 
        this.nodeMap.get(id)?.get() ?? null;

    /**
     * @name removeNode
     * @description Removes a node from the connection manager including all related connections    
     * @param {GUID | ConnectionNode.INode} node The id of the node or the node itself  
     * @returns {boolean} True if the node was removed
     */
    public removeNode(id: GUID): boolean {
        // -- Attempt to get the node   
        const ref = this.getNode(id);

        // -- Check if the node was found
        if (!ref) return false;

        // -- Remove the node from the maps
        const parent = this.parentMap.get(ref.ids.parent);
        if (parent) parent.delete(ref.ids.self);

        this.nodeMap.delete(id);
        const connections = this.connectionPointersMap.get(id);

        // -- Remove the connections from the map
        connections.forEach((connectionId: GUID) => 
            this.removeConnection(connectionId));

        // -- Remove the node from the parent map
        return true;
    }
    // #endregion | ----[ NODE ]----


    // #region | ----[ PARENT ]----
    /**
     * @name getParent
     * @param {GUID} id  The id of the parent group
     * @returns {ConnectionNode.TReferance[] | null} The list of children or null if the parent is not in the map
     */
    public getParent = (id: GUID): ConnectionManager.TNodeMap | null =>
        this.parentMap.get(id) ?? null;

    /**
     * @name removeParent
     * @description Removes a parent from the parent map including all of its children and connections
     * @param {GUID} id  The id of the parent group
     * @returns {void | null} True if the parent was removed
     */
    public removeParent(id: GUID): void | null {
        // -- Attempt to get the parent 
        const ref = this.getParent(id);

        // -- Check if the parent was found
        if (!ref) return null;

        // -- Loop through the children and remove them     
        ref.forEach(n => this.removeNode(n.get().ids.self));

        // -- Remove the parent from the map
        this.parentMap.delete(id);

        // -- Return true as the parent was removed 
        return void 0;
    }
    // #endregion | ----[ PARENT ]----


    // #region | ----[ ORIGIN AND TARGET ]----
    /**
     * @name getOrigin
     * @description Returns the origin node of the connection is currently being drawn
     * @returns {ConnectionNode.INode | undefined} The origin node or null if none is set
     */
    public getOrigin = (): ConnectionNode.INode | null => this.originNode;
    private originNode: ConnectionNode.INode | null = null;  
    private setOrigin(node: ConnectionNode.INode) { this.originNode = node; }
    private clearOrigin() { this.originNode = null;  }   

    /**
     * @name getTarget
     * @description Returns the target node of the connection is curr
     * @returns {ConnectionNode.INode | null} The origin node or null if none is set
     */
    public getTarget = (): ConnectionNode.INode | null => this.targetNode;
    private targetNode: ConnectionNode.INode | null = null;
    private setTarget(node: ConnectionNode.INode) { this.targetNode = node; }
    private clearTarget() { this.targetNode = null; }
    // #endregion | ----[ ORIGIN AND TARGET ]----


    // #region | ----[ ANNOUNCE ]----
    public announce(node: ConnectionNode.INode): void {
        let mouse: Geometric.TPoint = { x: 0, y: 0 };

        const ref = {
            get: () => node,
            id: node.ids.self,  
        };

        this.nodeMap.set(node.ids.self, ref); 
        this.connectionPointersMap.set(node.ids.self, new Map());
        this.insertParent(node.ids.parent, ref);

        // -- Make sure that the target node cannot be
        // the origin node
        node.hooks.mouseEnter(() => {
            if(this.getTarget() === node)
                this.clearTarget();

            else this.setTarget(node);
        });

        node.hooks.dragStart(() => {

            // -- Clear the target
            this.clearTarget(); 

            // -- Set the origin of the mouses
            mouse = node.hooks.rootPosition();

            // -- set the node as the origin    
            this.setOrigin(node);

            // -- Send out a drag start event
            this.execHooks('startConnection', ref);
        });


        node.hooks.drag(() => {
            // -- Call all the line hooks
            this.execHooks('line', node.hooks.rootPosition(), mouse);
        });


        node.hooks.dragEnd(() => {      
            // -- Get the target node
            const target = this.getTarget();

            // -- Send out a drag end event
            this.execHooks('endConnection', ref, {
                get: () => target,
                id: target?.ids.self,
            });   

            // -- Attempt to add the connection
            this.addConnection(node.ids.self, this.getTarget()?.ids.self);

            // -- Clear the origin and target
            this.clearOrigin();
            this.clearTarget();
        });
    }
    // #endregion | ----[ ANNOUNCE ]----


    // #region | ----[ SERIALIZATION ]----
    /**
     * @name serialize
     * 
     * @description Serializes the connection manager into a JSON object
     * 
     * @returns {string} The serialized JSON object
     */
    public serialize(): string {
        const serializedObject = Serialize(
            this.connectionMap,
            this.nodeMap,
            this.parentMap,
        );

        return JSON.stringify(serializedObject);
    }


    /**
     * @name serializeAsync
     * 
     * @description Serializes the connection manager into a JSON object
     * 
     * @returns {Promise<string>} The serialized JSON object        
     */ 
    public serializeAsync(): Promise<string> {
        return new Promise((resolve) => {
            resolve(this.serialize());
        });
    }


    /**
     * @name deserialize
     * 
     * @description Deserializes the connection manager from a JSON object  
     * 
     * @param {string} json  The JSON object to deserialize
     * 
     * @returns {void}
     */
    public deserialize(json: string, populateHook: Serialization.TPopulateNode): void {
        // -- Try to desrialize the JSON
        const deserializedObject = Deserialize(json, populateHook);

        // -- CHeck if the deserialization was successful
        if (!deserializedObject) {
            throw new Error('The serialized object could not be deserialized'); 
        }
    }

    // #endregion | ----[ SERIALIZATION ]----       


    // #region | ----[ MISC ]----
    // -- Internal function that inserts a node into the parent map
    // or creates a new map if it does not exist
    private insertParent(id: GUID, child: ConnectionNode.TReferance) {
        const parent = this.parentMap.get(id);

        // -- Check if the parent is already in the map
        if (!parent) return this.parentMap.set(id, new Map([[child.id, child]]));
        
        // -- If it is, just set the child in the map
        parent.set(child.id, child);
    }
    // #endregion | ----[ MISC ]----
}

export default ConnectionManager;