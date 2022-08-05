import { ConnectionNode, ConnectionManager, Geometric } from './types';
import GUID from './core/guid';

class ConnectionManager {

    // ----[ HOOKS ]---- //

    private startHooks: ConnectionManager.TEndHookMap = new Map();
    private endHooks: ConnectionManager.TEndHookMap = new Map();
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
            case 'start': this.startHooks.set(id, hook as ConnectionManager.TStartHook); break;
            case 'end'  : this.endHooks.set(  id, hook as   ConnectionManager.TEndHook); break;
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
            case 'start': return this.startHooks.get(id) as E;
            case 'end': return this.endHooks.get(id) as E;
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
            case 'start': 
                this.startHooks.delete(id); break;

            case 'end': 
                this.endHooks.delete(id); break;
        }

        // -- Return true as the hook was removed
        return true;
    }
    
    // ----[ HOOKS ]---- //


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
        //TODO: Remove the node from any connections

        // -- Remove the node from the parent map
        return true;
    }
    private nodeMap: ConnectionManager.TNodeMap = new Map();        

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
     * @returns {boolean} True if the parent was removed
     */
    public removeParent(id: GUID): boolean {
        // -- Attempt to get the parent 
        const ref = this.getParent(id);

        // -- Check if the parent was found
        if (!ref) return false;

        // -- Loop through the children and remove them     
        ref.forEach(n => this.removeNode(n.get()));

        // -- Remove the parent from the map
        this.parentMap.delete(id);

        // -- Return true as the parent was removed 
        return true;
    }
    private parentMap: ConnectionManager.TParentMap = new Map();    


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

    private readonly opts: ConnectionManager.IConstructor;
    public constructor(opts: ConnectionManager.IConstructor) {
        this.opts = opts;
    }

    public announce(node: ConnectionNode.INode): void {
        let mouse: Geometric.TPoint = { x: 0, y: 0 };

        const ref = {
            get: () => node,
            id: node.ids.self,  
        };

        this.nodeMap.set(node.ids.self, ref); 
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

            // -- Check if the mouse is over a node
            const origin = node,
                target = this.getTarget();

            // -- Send out a drag end event
            this.execEndHooks(ref, {
                get: () => target,
                id: target?.ids.self,
            });

            // -- make sure the node dosent belong to the same group
            if (target && !target.ids.parent.equals(origin.ids.parent)) {

                // -- Make sure that that out != out and in != in
                if (origin.getMode() === target.getMode())
                    return this.clearOrigin();

                // -- Check compatibility
                if (origin.isCompatible(target) === true) {
                    // -- Create a new connection
                    console.log('Connection created');
                }
            }

            // -- Clear the origin
            this.clearOrigin();
        });
    }

    // -- Internal function that inserts a node into the parent map
    // or creates a new map if it does not exist
    private insertParent(id: GUID, child: ConnectionNode.TReferance) {
        const parent = this.parentMap.get(id);

        // -- Check if the parent is already in the map
        if (!parent) return this.parentMap.set(id, new Map([[child.id, child]]));
        
        // -- If it is, just set the child in the map
        parent.set(child.id, child);
    }
}

export default ConnectionManager;