import GUID from './core/guid';

/**
 * @name Geometric
 * 
 * @description A collection of types that help dealing with position, scaling etc.
 */
export namespace Geometric {
    export type X = number;
    export type Y = number;

    /**
     * @name TPoint
     * 
     * @description A type for a coordinate pair.
     * @see X
     * @see Y
     */
    export type TPoint = {
        x: X;
        y: Y;
    }

 
    export type Width = number;
    export type Height = number;

    /**
     * @name Size
     * 
     * @description A type for a size.
     * @see Width
     * @see Height
     */
    export type TSize = {
        width: Width;
        height: Height;
    }
}


/**
 * @name ConnectionNode
 * 
 * @description A collection of types that lays out how a connection is constructed.    
 */
 export namespace ConnectionNode {
    /**
     * @name TMode
     * 
     * @input Node will act as a slave, only accepting connections from other nodes.
     * @output Node will act as a master, only allowing connections to other nodes.
     */
    export type TMode = 'input' | 'output';

    
    /**
     * @name TConfiguration
     * 
     * @description A type for a connection node's configuration.
     * 
     * @see TMode
     * @see Number.u_int_8
     * @see Geometric.TPoint
     * @see Geometric.TSize
     * @see konva.Node
     */
    export type TConfiguration = {
        mode: TMode,
        offSet: Geometric.TPoint,           
        size: Geometric.TSize,
        maxConnections: Number.u_int_8,
    }

    // TODO: Create a generic namespace
    export type INodeHook = <E>() => E | void;

    /**
     * @name INodeHooks
     * 
     * @description A type for a connection node's hooks that
     * are required to be implemented.
     * 
     * @property rootPosition: A fucntion that returns the position for where the connection root should start at.
     */
    export type INodeHooks = {
        drag: (func: INodeHook) => void;
        dragEnd: (func: INodeHook) => void;
        dragStart: (func: INodeHook) => void;

        mouseEnter: (func: INodeHook) => void;
        mouseLeave: (func: INodeHook) => void;

        click: (func: INodeHook) => void;
        dblClick: (func: INodeHook) => void;

        rootPosition: () => Geometric.TPoint;
    }

    /**
     * @name TIDs
     * 
     * @description A type for a connection node's IDs.
     * 
     * @param self: The ID of the node. 
     * @param parent: The ID of the node's parent.
     * @param group: The type of node (Used for serialization).
     */
    export type TIDs =  {
        parent: GUID;
        group: GUID;
        self: GUID;
    }

    /**
     * @name TAttributes
     * 
     * @description A generic object type for a connection node's details.
     */
    export type TAttributes = {
        [key: string]: 
            string | 
            number | 
            boolean | 
            null | 
            undefined | 
            GUID |
            Geometric.TSize |
            Geometric.TPoint;
    }

    /**
     * @name INode
     * 
     * @description Interface for an object that can be
     * passed into the connection manager to be used as a 
     * connection node.
     * 
     * @see INodeHooks
     * @see TMode
     * @see konva.Node
     * @see Number.u_int_8
     */
    interface INode {
        getMode: () => TMode;
        getParentAttributes?: () => TAttributes;
        isCompatible: (node: INode) => boolean;
        attributes: TAttributes;
        hooks: INodeHooks;
        ids: TIDs;
    }

    /**
     * @name TReferance
     * 
     * @description A type for a connection node's reference.
     * 
     * @see INode
     */
    export type TReferance = {
        get: () => INode;
        id: GUID;
    };
}

export namespace ConnectionManager {
    /**
     * @name TNodeMap
     * 
     * @description A type for a project's connection node map.
     * 
     * @see TNode
     * @see GUID.IGUID
     */
    export type TNodeMap = Map<Pick<GUID.IGUID, 'guid'>, ConnectionNode.TReferance>;


    /**
     * @name TParentMap
     * 
     * @description A type that contains a map of all the nodes under that parent guid.
     * 
     * @see INode
     * @see GUID.IGUID
     */
    export type TParentMap = Map<Pick<GUID.IGUID, 'guid'>, TNodeMap>;


    /** 
     * @name TMousePositionHook
     * 
     * @description A type for a mouse position hook, a function that returns a position (presumably a mouse position). 
     * @see Geometric.TPoint
     */
    export type TMousePositionHook = () => Geometric.TPoint;


    /**
     * @name TStartConnectionHook
     * 
     * @description A hook for when the user instantiates a connection, returns a reference to origin node.
     * @see ConnectionNode.TReferance
     */
    export type TStartConnectionHook = (node: ConnectionNode.TReferance) => void;


    /**
     * @name TEndConnectionHook
     * 
     * @description A hook for when the user instantiates a connection, returns a reference
     * to the origin node and the destination node (if any).
     * @see ConnectionNode.TReferance
     */
    export type TEndConnectionHook = (origin: ConnectionNode.TReferance, destination?: ConnectionNode.TReferance) => void;


    /**
     * @name TLineHook
     * 
     * @description A hook for when the user is dragging a connection, returns a position [xy1, xy2]
     * for where the line should be drawn.
     * @see Geometric.TPoint
     */
    export type TLineHook = (start: Geometric.TPoint, end: Geometric.TPoint) => void;
    
    /**
     * @name IConstructor
     * 
     * @description A type for a connection manager constructor.    
     * @see TMousePositionHook
     */
    export interface IConstructor {
        mousePositionHook: TMousePositionHook;
    }

    /**
     * @name TAnnouncementHook
     * 
     * @description A hook for when a new node is announced, returns a reference to the node.
     * @see ConnectionNode.TReferance
     * @see ConnectionNode.INode
     */
    export type TAnnouncementHook = (node: ConnectionNode.TReferance) => void;

    /**
     * @name TConnectionHook
     * 
     * @description A hook for when a connection is initiated / Terminated, returns a reference to the origin and destination nodes.
     * @see ConnectionNode.TReferance       
     * @see ConnectionNode.INode
     */
    export type TConnectionHook = (origin: ConnectionNode.TReferance, destination: ConnectionNode.TReferance) => void; 

    export type TEndConnectionHookMap   = Map<Pick<GUID.IGUID, 'guid'>, TEndConnectionHook>;
    export type TStartConnectionHookMap = Map<Pick<GUID.IGUID, 'guid'>, TStartConnectionHook>;
    export type TLineHookMap            = Map<Pick<GUID.IGUID, 'guid'>, TLineHook>;
    export type TAnnouncementHookMap    = Map<Pick<GUID.IGUID, 'guid'>, TAnnouncementHook>;
    export type TConnectionStatusMap    = Map<Pick<GUID.IGUID, 'guid'>, TConnectionHook>;

    export type THookType = 
        'startConnection' | 
        'endConnection' | 
        'line' | 
        'announcement' |
        'connectionInitiated' |
        'connectionTerminated';

    export type THookUnion = 
        TStartConnectionHook | 
        TEndConnectionHook | 
        TLineHook |
        TAnnouncementHook |
        TConnectionHook;

    export type TConneection = [GUID, GUID];
    export type TConnectionMap = Map<GUID, TConneection>;   
    export type TConnectionPointersMap = Map<GUID, Map<GUID, GUID>>;  

    export interface IInstance {
        // -- Hooks
    }
}


export namespace Serialization {
    export type TSerializedNode = {
        id: GUID;   
        parent: GUID;
        group: GUID;
        position: Geometric.TPoint;
        attributes: ConnectionNode.TAttributes;
    }

    export type TSerializedParent = {
        id: Pick<GUID.IGUID, "guid">;
        attributes: ConnectionNode.TAttributes;
        children: Array<GUID>;
    }

    export type TSerializedConnection = {
        origin: GUID;
        destination: GUID;
    }

    export type TSerializedObject = {
        groups: Array<GUID>;
        parents: Array<TSerializedParent>;
        nodes: Array<TSerializedNode>;
        connections: Array<TSerializedConnection>;   
    }

    export type IDeserializedObject = {
        nodeMap: ConnectionManager.TNodeMap;
        parentMap: ConnectionManager.TParentMap;
        connectionMap: ConnectionManager.TConnectionMap;
        connectionPointersMap: ConnectionManager.TConnectionPointersMap;
    }

    export type TPopulateNode = (arg: TSerializedNode, parent: TSerializedParent) => ConnectionNode.INode;
}


/**
 * @name GUID 
 * 
 * @description A collection of types that lays out how a GUID is constructed.
 */
export namespace GUID {
    export interface IGUID {
        guid: string;
    }
}


/**
 * @name Number
 * 
 * @description A collection of types that help dealing with numerical types not supported by the standard typescript library.
 */
export namespace Number {
    export type u_int_8 = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 | 31 | 32 | 33 | 34 | 35 | 36 | 37 | 38 | 39 | 40 | 41 | 42 | 43 | 44 | 45 | 46 | 47 | 48 | 49 | 50 | 51 | 52 | 53 | 54 | 55 | 56 | 57 | 58 | 59 | 60 | 61 | 62 | 63 | 64 | 65 | 66 | 67 | 68 | 69 | 70 | 71 | 72 | 73 | 74 | 75 | 76 | 77 | 78 | 79 | 80 | 81 | 82 | 83 | 84 | 85 | 86 | 87 | 88 | 89 | 90 | 91 | 92 | 93 | 94 | 95 | 96 | 97 | 98 | 99 | 100 | 101 | 102 | 103 | 104 | 105 | 106 | 107 | 108 | 109 | 110 | 111 | 112 | 113 | 114 | 115 | 116 | 117 | 118 | 119 | 120 | 121 | 122 | 123 | 124 | 125 | 126 | 127 | 128 | 129 | 130 | 131 | 132 | 133 | 134 | 135 | 136 | 137 | 138 | 139 | 140 | 141 | 142 | 143 | 144 | 145 | 146 | 147 | 148 | 149 | 150 | 151 | 152 | 153 | 154 | 155 | 156 | 157 | 158 | 159 | 160 | 161 | 162 | 163 | 164 | 165 | 166 | 167 | 168 | 169 | 170 | 171 | 172 | 173 | 174 | 175 | 176 | 177 | 178 | 179 | 180 | 181 | 182 | 183 | 184 | 185 | 186 | 187 | 188 | 189 | 190 | 191 | 192 | 193 | 194 | 195 | 196 | 197 | 198 | 199 | 200 | 201 | 202 | 203 | 204 | 205 | 206 | 207 | 208 | 209 | 210 | 211 | 212 | 213 | 214 | 215 | 216 | 217 | 218 | 219 | 220 | 221 | 222 | 223 | 224 | 225 | 226 | 227 | 228 | 229 | 230 | 231 | 232 | 233 | 234 | 235 | 236 | 237 | 238 | 239 | 240 | 241 | 242 | 243 | 244 | 245 | 246 | 247 | 248 | 249 | 250 | 251 | 252 | 253 | 254 | 255;
}
