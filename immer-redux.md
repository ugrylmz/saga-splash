
## Test redux reducers with Immer

I recently started using Immer in redux reducers in my react app since I have a lot of nested states in them. (lets avoid the fact the these nesting can be solved with sub reducers).
The usage of Immer is clear for me, but once I started to write unit tests with jest I started wondering, that should I avoid using Immer in the tests ?
    Lets have a basic reducer example:
```
export default function (state = initialState, action) {
    return produce(state, (draftState) => {
        switch (action.type) {
            case MY_TYPE:
                draftState.some.nested.flag = true;
                break;
        }
    });
}
```
then my test which also using Immer
```
it('should handle MY_TYPE', () => {
    const storeState = reducer(initialState, {
        type: MY_TYPE
    });
    const newState = produce(initialState, (draftState) => {
        draftState.some.nested.flag = true;
    });
    expect(storeState).toEqual(newState);
});
```
So my question is that should I avoid using Immer produce in the tests and make the copy of the nested object manually with the spread syntax ? Something like:
```
.toEqual({
    ...initialState,
    some: {
        ...initialState.some,
        nested: {
            ...initialState.some.nested,
            flag: true
        }
    }
})
```
So is there any pitfalls using Immer in tests ?

    In this case Immer does not change all the state.For example:
```
const state = {
    some: {
        another: {},
        nested: {
            flag: true
        }
    }
};
const nextState1 = produce(state, draft => {
    draft.some.nested.flag = false;
});
const nextState2 = produce(state, draft => {
    draft.some.nested.flag = false;
});
expect(nextState1).toEqual(nextState2);
expect(nextState1.another).toBe(nextState2.another); // true!
expect(nextState1).toBe(nextState2); // false
expect(nextState1.some).toBe(nextState2.some); // false
expect(nextState1.some.nested).toBe(nextState2.some.nested); // false
```
Where "toBe" is a function which check identity of object instances(unlike "toEqual").I think, you should not avoid using Immer in the unit tests.Probably it requires another assert function which checks that only part of tree is changed.

Access vue method within vuex mapState

I have an important task to do while data is computed within a vuex mapState.I need to call this vue method countAlerts every time data is changed; to do that the computed property needs to call that method but this scope has no vue methods when it is used insight vuex mapState.
```
export default {
    name: "Alerts",
    methods: {
        countAlerts(data, period) {
            /// DO SOMETHING, THEN RETURN DATA
            return data;
        }
    },
    computed: {
        ...mapState({
            foundation: state => state.insights.foundation,
            insights: state => {
                return state.insights.list.filter(al => {
                    switch (state.insights.foundation.period) {
                        case "daily":
                            // ====>> NEED TO CALL METHOD HERE <<=====
                            al = this.countAlerts(al, "daily");
                            if (
                                al.threeDayUp ||
                                al.threeDayDown ||
                                al.greatDayUp ||
                                al.greatDayDown
                            ) {
                                return al;
                            }
                            break;
                        /// MORE CODE ABOVE
                    }
                });
            }
        })
    }
};
```

this is bound to the component's contex when you define computed props as functions.
From the docs:
```
// to access local state with `this`, a normal function must be used
countPlusLocalState(state) {
    return state.count + this.localCount
}
```
