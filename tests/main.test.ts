import ConnectionManagerClass from "../src";
import GUID from "../src/core/guid";
import { ConnectionNode, ConnectionManager } from "../src/types";

const createNode = (
    mode: ConnectionNode.TMode,
    hooks: ConnectionNode.INodeHooks = createEmptyHooks(),
    details: ConnectionNode.TDeatails = {},
    parentGUID: GUID = new GUID(),
    groupGUID: GUID = new GUID(),
    isCompatible?: (node: ConnectionNode.INode) => boolean,
):ConnectionNode.INode => {

    //  -- Compatability function
    isCompatible = isCompatible || ((node: ConnectionNode.INode) => true);

    return {
        getMode: () => mode,
        isCompatible,
        details,
        hooks,
        ids: {
            self: new GUID,
            parent: parentGUID,
            group: groupGUID
        }
    }
}

const createEmptyHooks = ():ConnectionNode.INodeHooks => {
    return {
        mouseEnter: (e) => {},
        mouseLeave: (e) => {},

        dragStart: (e) => {},
        dragEnd: (e) => {},
        drag: (e) => {},

        click: (e) => {},
        dblClick: (e) => {},

        rootPosition: () => {
            return { x: 0, y: 0 };
        }
    } 
}

const cmc = () => new ConnectionManagerClass({ mousePositionHook: () => { return { x: 0, y: 0 }; },});

// #region    | ---- [ NODE START ] ---- //
// INPUT NODE //
// -- add input node
describe('[Node: Add] - Input', () => {
    let cm = cmc();
    const node = createNode('input');
    cm.announce(node);

    it('should add a node to the connection manager', () => {
        expect(cm.getNode(node.ids.self).ids.self).toEqual(node.ids.self);
    });
});

// -- add input node and remove it
describe('[Node: Remove] - Input', () => {
    let cm = cmc();
    const node = createNode('input');
    cm.announce(node);

    it('should remove a node from the connection manager', () => {
        cm.removeNode(node.ids.self);
        expect(cm.getNode(node.ids.self)).toBe(null);
    });
});


// OUTPUT NODE //
// -- add output node
describe('[Node: Add] - Output', () => {
    let cm = cmc();
    const node = createNode('output');
    cm.announce(node);

    it('should add a node to the connection manager', () => {
        expect(cm.getNode(node.ids.self).ids.self).toEqual(node.ids.self);
    });
});

// -- add input node and remove it
describe('[Node: Remove] - Output', () => {
    let cm = cmc();
    const node = createNode('output');
    cm.announce(node);

    it('should remove a node from the connection manager', () => {
        cm.removeNode(node.ids.self);
        expect(cm.getNode(node.ids.self)).toBe(null);
    });
});


// -- getNode (Invalid node)
describe('[Node: Get] - Invalid', () => {
    let cm = cmc();

    it('should return null if the node is not in the connection manager', () => {
        expect(cm.getNode(new GUID())).toBe(null);
    });
});

// -- Get parent node
describe('[Node: Get] - Parent', () => {
    let cm = cmc();

    const node1 = createNode('input'),
        node2 = createNode('input');

    node2.ids.parent = node1.ids.parent;

    cm.announce(node1);
    cm.announce(node2);

    const map: ConnectionManager.TParentMap = new Map();

    map.set(node1.ids.parent, new Map([
        [
            node1.ids.self,
            { get: () => node1, id: node1.ids.self }
        ],
        [
            node2.ids.self,
            { get: () => node2, id: node2.ids.self }
        ]
    ]));

    it('should return the parent node', () => {
        expect(JSON.stringify(cm.getParent(node2.ids.parent))).toEqual(JSON.stringify(map));
    });
});

// -- Get parent node (Invalid node)
describe('[Node: Get] - Parent - Invalid', () => {
    let cm = cmc();

    it('should return null if the node is not in the connection manager', () => {
        expect(cm.getParent(new GUID())).toBe(null);
    });
});

// -- Remove parent node    
describe('[Node: Remove] - Parent', () => {
    let cm = cmc();
    
    const node1 = createNode('input'),
        node2 = createNode('input');

    node2.ids.parent = node1.ids.parent;

    cm.announce(node1);
    cm.announce(node2);

    it('should remove the parent node', () => {
        cm.removeParent(node1.ids.parent);
        expect(cm.getParent(node1.ids.parent)).toBe(null);
        expect(cm.getNode(node1.ids.self)).toBe(null);  
        expect(cm.getNode(node2.ids.self)).toBe(null);
    });
});

// -- Remove parent node (Invalid node)
describe('[Node: Remove] - Parent - Invalid', () => {
    let cm = cmc();

    it('should return null if the node is not in the connection manager', () => {
        expect(cm.removeParent(new GUID())).toBe(null);
    });
});

// -- Remove child node
describe('[Node: Remove] - Child (Pass by node)', () => {
    let cm = cmc();

    const node1 = createNode('input'),
        node2 = createNode('input');

    node2.ids.parent = node1.ids.parent;

    cm.announce(node1);
    cm.announce(node2);
    
    it('should remove the child node', () => {
        expect(cm.getParent(node1.ids.parent).get(node1.ids.self)).not.toBe(undefined);  
        cm.removeNode(node1);
        expect(cm.getParent(node1.ids.parent).get(node1.ids.self)).toBe(undefined);  
        expect(cm.getNode(node1.ids.self)).toBe(null);
    });
});

// -- Remove child node
describe('[Node: Remove] - Child (Pass by id)', () => {
    let cm = cmc();

    const node1 = createNode('input'),
        node2 = createNode('input');

    node2.ids.parent = node1.ids.parent;

    cm.announce(node1);
    cm.announce(node2);
    
    it('should remove the child node', () => {
        expect(cm.getParent(node1.ids.parent).get(node1.ids.self)).not.toBe(undefined);  
        cm.removeNode(node1.ids.self);
        expect(cm.getParent(node1.ids.parent).get(node1.ids.self)).toBe(undefined);  
        expect(cm.getNode(node1.ids.self)).toBe(null);
    });
});
// #endregion | ---- [ NODE END ] ---- //  


// #region    | ---- [ HOOKS START ] ---- //

// #endregion | ---- [ HOOKS END ] ---- //
