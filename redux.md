As the doc says:
Things you should never do inside a reducer:
Mutate its arguments;
Perform side effects like API calls and routing transitions;
Call non - pure functions, e.g.Date.now() or Math.random().
If I follow the principle, there are some questions about the code orgnization(my app is a file manager).
For example,
default reducer like this:
```
export default function (state = initialState, action) {
    const { path } = action
    if (typeof path === 'undefined') {
        return state
    }
    const ret = {
        ...state,
        [path]: parentNode(state[path], action)
    };
    switch (action.type) {
        case OPEN_NODE:
        case GO_PATH:
            ret['currentPath'] = path
            break
        default:
            break
    }
    return ret
}
```
data struct in state[path] likes:
```
{
    'open': false,
        'path': '/tmp/some_folder',
            'childNodes' : [{ 'path': '/some/path', 'mode': '0755', 'isfolder': true }, ....],
                'updateTime': Date.now()
}
```
Now I need several actions such as ADD_CHILD, DELETE_CHILD, RENAME_CHILD, MOVE_CHILD, there are two sulotions(by change state in actions or reducers):
1. All functional code in actions:
actions:
```
export function updateChildNodes(path, nodes) {
    return {
        type: UPDATE_CHILD_NODES,
        path: path,
        loading: false,
        loaded: true,
        childNodes: nodes,
    };
}
export function addChild(path, node) {
    return (dispatch, getState) => {
        const state = getState().tree[path]
        var childNodes = state.childNodes ? state.childNodes : []
        childNodes.push(node)
        return dispatch(updateChildNodes(path, childNodes))
    }
}
export function deleteChild(parent_path, child_node) {
    return (dispatch, getState) => {
        const state = getState().tree[parent_path]
        var childNodes = state && state.childNodes ? state.childNodes : []
        for (var i = 0; i <= childNodes.length; i++) {
            if (childNodes[i].path == child_node.path) {
                childNodes.splice(i, 1)
                return dispatch(updateChildNodes(parent_path, childNodes))
            }
        }
    }
}
export function deleteNode(node) {
    return (dispatch, getState) => {
        // ajax call
        return api.deleteChild(node.path, () => {
            dispatch(deleteChild(node.parent, node))
        })
    }
}
```
.....
parentNode reducer:
```
function parentNode(state, action) {
    switch (action.type) {
        case UPDATE_CHILD_NODES:
            return {
                ...state,
                childNodes: action.childNodes
            }
        default:
            return state;
    }
}
```
All variable pass in parentNode from actions, parentNode just assign change to state doesn't do anything else.
All logic of remove node and add node is done by actions, only UPDATE_CHILD_NODES in parentNode.
2. Action just send data to reducer, let reducer to process
actions:
```
export function updateChildNodes(path, nodes) {
    return {
        type: UPDATE_CHILD_NODES,
        path: path,
        loading: false,
        loaded: true,
        childNodes: nodes,
    };
}
export function addChild(path, node) {
    return {
        type: ADD_CHILD,
        path: path,
        node: node,
    };
}
export function deleteChild(path, node) {
    return {
        type: DELETE_CHILD,
        path: path,
        node: node,
    };
}
export function deleteNode(node) {
    return (dispatch, getState) => {
        // ajax call
        return api.deleteChild(node.path, () => {
            dispatch(deleteChild(node.parent, node))
        })
    }
}
```
.....
parentNode reducer:
```
function parentNode(state, action) {
    switch (action.type) {
        case DELETE_CHILD:
            let childNodes = state.childNodes.slice() // have to clone obj
            for (var i = 0; i <= childNodes.length; i++) {
                if (childNodes[i].path == action.node.path) {
                    childNodes.splice(i, 1)
                }
            }
            return {
                ...state,
                childNodes: childNodes
            };
        case ADD_CHILD:
            let childNodes = state.childNodes.slice() // have to clone obj
            childNodes.push(node)
            return {
                ...state,
                childNodes: childNodes
            };
        case UPDATE_CHILD_NODES:
            return {
                ...state,
                childNodes: action.childNodes
            }
        default:
            return state;
    }
}
```
In my option, the solution 2 is more readable and pretty.
But is it good to change the state by mutate an cloned obj ? And when I need set updateTime by Date.now(), I have to generate it from actions and pass to reducer, so that state variables are generated in different place(But I'd like put them together...)
Any opinion for this ?

    From this redux discussion here:
It is best practice to place most of the logic in the action creators and leave the reducers as simple as possible (closer to your option 1)
for the following reasons:
    Business logic belongs in action - creators.Reducers should be stupid and simple.In many individual cases it does not matter - but consistency is good and so it's best to consistently do this. There are a couple of reasons why:
Action - creators can be asynchronous through the use of middleware like redux - thunk.Since your application will often require asynchronous updates to your store - some "business logic" will end up in your actions.
    Action - creators(more accurately the thunks they return) can use shared selectors because they have access to the complete state.Reducers cannot because they only have access to their node.
Using redux - thunk, a single action - creator can dispatch multiple actions - which makes complicated state updates simpler and encourages better code reuse.

For small apps I usually put my logic in action creators.For more complex situations you may need to consider other options.Here is a summary on pros and cons of different approaches: https://medium.com/#jeffbski/where-do-i-put-my-business-logic-in-a-react-redux-application-9253ef91ce1#.k8zh31ng5
Also, have a look at Redux middleware.
The middleware provides a third - party extension point between dispatching an action, and the moment it reaches the reducer.
This is an answer provided by Dan Abramov(author of Redux): Why do we need middleware for async flow in Redux ?
    And here are the official Redux docs: http://redux.js.org/docs/advanced/Middleware.html
