import Konva from 'konva';
import bp, { GUID } from '../../../dist/src';  // <[Blueprint framework]>

// -- Create the stage
const stage = new Konva.Stage({
    container: 'body',
    width: window.innerWidth,
    height: window.innerHeight
});

// -- Create and add the layer
const layer = new Konva.Layer(); 
stage.add(layer);


// [Blueprint] Initialize the blueprint framework       
// By passing in a hook that will be called to get the
// current position of the mouse. 
// Expected Format: { x: number, y: number }
const manager = new bp({
    mousePositionHook: () => layer.getRelativePointerPosition()
});


// [Blueprint] Create a blueprint node
// A NODE is an object that a connection can be attached to,
// and a connection can be madefrom.
class node {
    elm;
    // -- Class constructor 
    constructor(elm) {
        this.elm = elm;
    }

    // -- (input) or (output)   
    mode = 'input';

    // -- A hook that returns the mode of the node
    getMode = () => this.mode;

    // -- A hook that is called when a connection is made
    // to or from this node, it is used to determine if
    // the connection should be allowed.
    isCompatible = (node) => {        
        true;
    }

    // -- An object that contains the details about
    // this specific node. used inconjunction with
    // the isCompatible hook.
    details = {
        'some': 'data',
        'im': false,
    }

    // -- An object that contains ID's for this node.
    // its self, its parent, and its group.
    ids = {
        self: new GUID(), // -- A unique ID for this node   
        parent: new GUID(), // -- An ID for the parent OF this node
        group: new GUID(), // -- An ID for type of node this is (eg, all 'a' nodes are in the same group)
    }

    // -- Hooks, these are important as these hooks are responsible
    // for the connection manager to know how to interact with this node.
    hooks = {
        // -- drag, a hook that is called when the node is dragged
        drag: (f) => this.elm.on('dragmove', f),

        // -- dragEnd, a hook that is called once at the end of a drag event
        dragEnd: (f) => this.elm.on('dragend', f),

        // -- dragStart, a hook that is called once when the node is dragged
        dragStart: (f) => this.elm.on('dragstart', f),

        // -- Mouse events, Self explanatory
        click: (f) => this.elm.on('click', f),
        dblClick: (f) => this.elm.on('dblclick', f),

        // -- MouseLeave/Enter Are used to determine if the mouse is
        // hovering over this node.
        mouseEnter: (f) => {
            document.addEventListener('mousemove', () => {
                // Get the current mouse position
                const mouse_pos = stage.getPointerPosition();

                if(!mouse_pos)
                    return;

                // Get the position of the node
                const node_pos = this.elm.getPosition();

                // Get the size of the node
                const size = this.elm.getSize();

                // Check if the mouse is within the node
                if (mouse_pos.x > node_pos.x && mouse_pos.x < node_pos.x + size.width ||
                    mouse_pos.y > node_pos.y && mouse_pos.y < node_pos.y + size.height) {
                    f();
                }
            });
        },
        mouseLeave: (f) => this.elm.on('mouseleave', f),

        // -- Rootposition is a hook that returns the position
        // from where the connection should start at.
        rootPosition: () => {
            const { x, y } = this.elm.getAbsolutePosition();
            return { x, y };
        }
    }

    getParentAttributes = () => {
        return {
            a: 'b',
            pos: {
                x: 0,
                y: 0    
            }
        }
    }
}

//
// As one can see, the blueprint node is a very simple object.
// All it requires is a few hooks, and a few properties.
// That are already there for you to use, provided by frameworks
// like konva.
//

function create_blueprint(mode, color) {
    // Lets create a 'blueprint element'
    const elm_1_id = new GUID(),
        // THIS is the element that visually contains all of its nodes
        elm_1_parent = new Konva.Rect({
            width: 100,
            height: 100,
            fill: color,
            stroke: 'black',
        }),
        // -- THIS is what the user will make connections to and from
        elm_1_node = new Konva.Circle({
            radius: 10,
            fill: 'blue',
            stroke: 'black',
        });


    // -- Add the elements to the layer 
    layer.add(elm_1_parent);
    layer.add(elm_1_node);

    // -- Set the elements as draggable
    elm_1_parent.draggable(true);
    elm_1_node.draggable(true);

    // -- Make the node follow the parent
    elm_1_parent.on('dragmove', () => {
        elm_1_node.x(elm_1_parent.x() + elm_1_parent.width() / 2);
        elm_1_node.y(elm_1_parent.y() + elm_1_parent.height() / 2);
    });

    // -- when the node is done being dragged, send it back to the parent
    elm_1_node.on('dragend', () => {
        elm_1_node.x(elm_1_parent.x() + elm_1_parent.width() / 2);
        elm_1_node.y(elm_1_parent.y() + elm_1_parent.height() / 2);
    }); 

    
    // -- Create the node
    const node_elm_1 = new node(elm_1_node);

    // -- Set the parent ID 
    node_elm_1.ids.parent = elm_1_id;

    // -- Set the mode
    node_elm_1.mode = mode;

    // -- return the node
    return node_elm_1;  
}


// Create our blueprint elements
let a = create_blueprint('input', 'red');

let b = create_blueprint('output', 'blue');

// -- We need to add the nodes to the manager
manager.announce(a);
manager.announce(b);


// -- Create the line
const line = new Konva.Line({
    points: [0, 0, 0, 0],   
    stroke: 'black',
    strokeWidth: 2,
});

// -- Set it up so it dosent inte
layer.add(line)

// -- Lets hook onto the line hook, this hook is called
// every time the line is updated.
manager.addHook('line', (start, end) => {
    line.points([start.x, start.y, end.x, end.y]);
});


// -- ONCE the user has made a connection, we need to
// Hide the temporary line and show the permanent line
// If the connection is valid.
manager.addHook('endConnection', (a, b) => {
    console.log('Connection ended!', a, b);

    // -- reset the line
    line.points([0, 0, 0, 0]);

    // -- Get the positions of the nodes
    const org = a.get().hooks.rootPosition(),
        dest = b?.get()?.hooks?.rootPosition();

    // -- Check if they exist
    if(!org || !dest)
        return;

    // -- Now we can create a line between the two nodes
    layer.add(new Konva.Line({
        points: [org.x, org.y, dest.x, dest.y],
        stroke: 'black',
        strokeWidth: 3,
    }));

    // -- draw the layer
    layer.draw();
});

const ser = manager.serialize();

console.log(ser);


manager.deserialize('ser');   
