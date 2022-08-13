import { GUID } from "..";
import { ConnectionManager, ConnectionNode, Geometric } from "../types";

export class Hooks {

    // NOTE: These maps are not defined in an interface 
    // as Typescript dosen't allow for declaring Private
    // members in interfaces.
    protected startHooks               : ConnectionManager.TStartConnectionHookMap = new Map();
    protected endHooks                 : ConnectionManager.TEndConnectionHookMap   = new Map();
    protected lineHooks                : ConnectionManager.TLineHookMap            = new Map();
    protected announcementHooks        : ConnectionManager.TAnnouncementHookMap    = new Map();  
    protected connectionTerminatedHooks: ConnectionManager.TConnectionStatusMap    = new Map();
    protected connectionInitiatedHooks : ConnectionManager.TConnectionStatusMap    = new Map();


    // #region [ Execute Hooks ]
    //
    // Exectue hooks functions  
    //
    protected execHooks(type: 'startConnection'     , origin: ConnectionNode.TReferance): void;
    protected execHooks(type: 'announcement'        , origin: ConnectionNode.TReferance): void;
    protected execHooks(type: 'endConnection'       , origin: ConnectionNode.TReferance, destination?: ConnectionNode.TReferance): void;
    protected execHooks(type: 'line'                , origin: Geometric.TPoint,          destination: Geometric.TPoint          ): void;
    protected execHooks(type: 'connectionInitiated' , origin: ConnectionNode.TReferance, destination: ConnectionNode.TReferance ): void;
    protected execHooks(type: 'connectionTerminated', origin: ConnectionNode.TReferance, destination: ConnectionNode.TReferance ): void;

    // -- Manual overload disambiguation -- //
    protected execHooks(
        type: ConnectionManager.THookType, 
        a: ConnectionNode.TReferance | Geometric.TPoint,
        b?: ConnectionNode.TReferance | Geometric.TPoint
    ): void {

        // -- Function that returns the correct type (TreeNode.TReferance)
        const Tref = (a: ConnectionNode.TReferance | Geometric.TPoint): ConnectionNode.TReferance => {
            return a as ConnectionNode.TReferance; }

        // -- Function that returns the correct type (Geometric.TPoint)
        const Tpoint = (a: ConnectionNode.TReferance | Geometric.TPoint): Geometric.TPoint => {
            return a as Geometric.TPoint; }
        
        // -- Disambiguate the overloads
        switch (type) {
            case 'startConnection'     : this.startHooks               .forEach(f => f(Tref(a)));              break;
            case 'endConnection'       : this.endHooks                 .forEach(f => f(Tref(a), Tref(b)));     break;
            case 'line'                : this.lineHooks                .forEach(f => f(Tpoint(a), Tpoint(b))); break;
            case 'announcement'        : this.announcementHooks        .forEach(f => f(Tref(a)));              break;    
            case 'connectionInitiated' : this.connectionInitiatedHooks .forEach(f => f(Tref(a), Tref(b)));     break;
            case 'connectionTerminated': this.connectionTerminatedHooks.forEach(f => f(Tref(a), Tref(b)));     break;
        }
    }
    // #endregion


    // #region [ Add Hooks ]
    //
    // Add hooks functions
    //
    public addHook(type: 'announcement', hook: ConnectionManager.TAnnouncementHook): GUID;
    public addHook(type: 'startConnection', hook: ConnectionManager.TStartConnectionHook): GUID;
    public addHook(type: 'endConnection', hook: ConnectionManager.TEndConnectionHook): GUID;
    public addHook(type: 'line', hook: ConnectionManager.TLineHook): GUID;
    public addHook(type: 'connectionInitiated', hook: ConnectionManager.TConnectionHook): GUID;
    public addHook(type: 'connectionTerminated', hook: ConnectionManager.TConnectionHook): GUID;

    /**
     * @name addHook
     * 
     * @description Adds a hook to the connection manager
     * 
     * @param {ConnectionManager.THookType} type The type of the hook to add
     * @param {ConnectionManager.THookUnion} hook The hook to add
     * @returns {GUID} The id of the hook
     */
    public addHook(type: ConnectionManager.THookType, hook: ConnectionManager.THookUnion): GUID {
        // -- Generate a new id for the hook
        const id = new GUID();

        // -- Add the hook to the map
        switch (type) { 
            case 'startConnection'     : this.startHooks.set               (id, hook as ConnectionManager.TAnnouncementHook   ); break;   
            case 'endConnection'       : this.endHooks.set                 (id, hook as ConnectionManager.TStartConnectionHook); break;
            case 'line'                : this.lineHooks.set                (id, hook as ConnectionManager.TLineHook           ); break;
            case 'announcement'        : this.announcementHooks.set        (id, hook as ConnectionManager.TAnnouncementHook   ); break;
            case 'connectionInitiated' : this.connectionInitiatedHooks.set (id, hook as ConnectionManager.TConnectionHook     ); break;
            case 'connectionTerminated': this.connectionTerminatedHooks.set(id, hook as ConnectionManager.TConnectionHook     ); break;
        }

        // -- Return the id 
        return id;
    }
    // #endregion


    // #region [ Get Hooks ]
    //
    // Get hooks functions  
    //
    public getHook(id: GUID, type: 'announcement'        ): ConnectionManager.TAnnouncementHook;
    public getHook(id: GUID, type: 'startConnection'     ): ConnectionManager.TStartConnectionHook;
    public getHook(id: GUID, type: 'endConnection'       ): ConnectionManager.TEndConnectionHook;
    public getHook(id: GUID, type: 'line'                ): ConnectionManager.TLineHook;
    public getHook(id: GUID, type: 'connectionInitiated' ): ConnectionManager.TConnectionHook;
    public getHook(id: GUID, type: 'connectionTerminated'): ConnectionManager.TConnectionHook;

    /**
     * @name getHook    
     * 
     * @description Gets a hook from the connection manager
     * 
     * @param {GUID} id The id of the hook to get
     * @param {ConnectionManager.THookType} type The type of the hook to get
     * @returns {ConnectionManager.THookUnion} The hook
     */
    public getHook(id: GUID, type: ConnectionManager.THookType): ConnectionManager.THookUnion {
        // -- Get the hook
        switch (type) {
            case 'announcement'        : return this.announcementHooks        .get(id);
            case 'startConnection'     : return this.startHooks               .get(id);
            case 'endConnection'       : return this.endHooks                 .get(id);
            case 'line'                : return this.lineHooks                .get(id);
            case 'connectionInitiated' : return this.connectionInitiatedHooks .get(id);
            case 'connectionTerminated': return this.connectionTerminatedHooks.get(id);
        }
    }
    // #endregion       


    // #region [ Remove Hooks ]
    //
    // Remove hooks functions
    //
    public removeHook(id: GUID, type: 'announcement'        ): void;
    public removeHook(id: GUID, type: 'startConnection'     ): void;
    public removeHook(id: GUID, type: 'endConnection'       ): void;
    public removeHook(id: GUID, type: 'line'                ): void;
    public removeHook(id: GUID, type: 'connectionInitiated' ): void;
    public removeHook(id: GUID, type: 'connectionTerminated'): void;

    /**
     * @name removeHook
     * 
     * @description Removes a hook from the connection manager
     * 
     * @param {ConnectionManager.THookType} type The type of the hook
     * @param {GUID} id The id of the hook
     * @returns {boolean} - If the hook was removed
     */
    public removeHook(id: GUID, type: ConnectionManager.THookType): boolean {
        // -- Remove the hook from the map
        switch (type) {
            case 'announcement'        : return this.announcementHooks        .delete(id);
            case 'startConnection'     : return this.startHooks               .delete(id);
            case 'endConnection'       : return this.endHooks                 .delete(id);
            case 'line'                : return this.lineHooks                .delete(id);
            case 'connectionInitiated' : return this.connectionInitiatedHooks .delete(id);
            case 'connectionTerminated': return this.connectionTerminatedHooks.delete(id);
        }
    }
    // #endregion       
}