import { ConnectionNode, ConnectionManager, Geometric } from './types';
import _GUID from './core/guid';

export class GUID extends _GUID {}

class ConnectionManager {
    // #region | ----[ CONSTRUCTOR ]----
    private readonly opts: ConnectionManager.IConstructor;
    public constructor(opts: ConnectionManager.IConstructor) {
        this.opts = opts;
    }
    // #endregion | ----[ CONSTRUCTOR ]----    


    // #region | ----[ HOOKS ]----

    private startHooks: ConnectionManager.TStartConnectionHookMap = new Map();
    private endHooks: ConnectionManager.TEndConnectionHookMap = new Map();
    private lineHooks: ConnectionManager.TLineHookMap = new Map();

    private execStartHooks = (ref: ConnectionNode.TReferance) =>
        this.startHooks.forEach((hook) => hook(ref));

    private execEndHooks = (origin: ConnectionNode.TReferance, destination?: ConnectionNode.TReferance) =>
        this.endHooks.forEach((hook) => hook(origin, destination));

    private execLineHooks = (origin: Geometric.TPoint, destination: Geometric.TPoint) =>
        this.lineHooks.forEach((hook) => hook(origin, destination));
    
    /**
     * @name addHook
     * 
     * @description Adds a hook to the connection manager
     * 
     * @param {ConnectionManager.THookType} type The type of the hook to add
     * @param {ConnectionManager.THookUnion} hook The hook to add
     * @returns {GUID} The id of the hook
     */
    public addHook<E extends ConnectionManager.THookUnion>(type: ConnectionManager.THookType, hook: E): GUID {
        // -- Generate a new id for the hook
        const id = new GUID();

        // -- Add the hook to the map
        switch (type) { 
            case 'startConnection': this.startHooks.set(id, hook as ConnectionManager.TStartConnectionHook); break;
            case 'endConnection'  : this.endHooks.set(  id, hook as   ConnectionManager.TEndConnectionHook); break;
            case 'line' : this.lineHooks.set( id, hook as  ConnectionManager.TLineHook); break;
        }

        // -- Return the id 
        return id;
    }

    /**
     * @name getHook
     * 
     * @description Gets a hook from the connection manager
     * 
     * @param {ConnectionManager.THookType} type The type of the hook to add
     * @param {GUID} id The id of the hook to get
     * @returns {ConnectionManager.THookUnion} The hook
     */
    public getHook<E extends ConnectionManager.THookUnion>(type: ConnectionManager.THookType, id: GUID): E | null {
        switch (type) { 
            case 'startConnection': return this.startHooks.get(id) as E;
            case 'endConnection': return this.endHooks.get(id) as E;
            case 'line': return this.lineHooks.get(id) as E;    
        }
    }

    /**
     * @name removeHook
     * 
     * @description Removes a hook from the connection manager
     * 
     * @param {ConnectionManager.THookType} type The type of the hook
     * @param {GUID} id The id of the hook
     * @returns {boolean} - If the hook was removed
     */
    public removeHook = (type: ConnectionManager.THookType, id: GUID): boolean => {
        // -- Attempt to get the hook
        const hook = this.getHook(type, id);

        // -- Check if the hook was found
        if (!hook) return false;

        // -- Remove the hook from the map
        switch (type) { 
            case 'startConnection': 
                this.startHooks.delete(id); break;

            case 'endConnection': 
                this.endHooks.delete(id); break;
        }

        // -- Return true as the hook was removed
        return true;
    }
    
    // #endregion | ----[ HOOKS ]---- 


    // #region | ----[ CONNECTIONS ]----
    private connectionMap: ConnectionManager.TConnectionMap = new Map();
    private connectionPointers: ConnectionManager.TConnectionPointersMap = new Map();
    

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
        if (this.connectionPointers.get(origin).has(destination)) 
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
        this.connectionPointers.get(origin).set(destination, id);
        this.connectionPointers.get(destination).set(origin, id);

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
    public removeNode(node: GUID | ConnectionNode.INode): boolean {
        // -- Get the id
        const id = node instanceof GUID ? node : node.ids.self;

        // -- Attempt to get the node   
        const ref = this.getNode(id);

        // -- Check if the node was found
        if (!ref) return false;

        // -- Remove the node from the maps
        const parent = this.parentMap.get(ref.ids.parent);
        if (parent) parent.delete(ref.ids.self);

        this.nodeMap.delete(id);
        const connections = this.connectionPointers.get(id);

        // -- Remove the connections from the map
        connections.forEach((connectionId: GUID) => 
            this.removeConnection(connectionId));

        // -- Remove the node from the parent map
        return true;
    }

    private nodeMap: ConnectionManager.TNodeMap = new Map();        
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
        ref.forEach(n => this.removeNode(n.get()));

        // -- Remove the parent from the map
        this.parentMap.delete(id);

        // -- Return true as the parent was removed 
        return void 0;
    }
    private parentMap: ConnectionManager.TParentMap = new Map();        
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
        this.connectionPointers.set(node.ids.self, new Map());
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
            this.execStartHooks(ref);
        });


        node.hooks.drag(() => {

            // -- Call all the line hooks
            this.execLineHooks(node.hooks.rootPosition(), mouse);
        });


        node.hooks.dragEnd(() => {      
            // -- Get the target node
            const target = this.getTarget();

            // -- Send out a drag end event
            this.execEndHooks(ref, {
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