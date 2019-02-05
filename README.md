# State Subclassing Framework

This repository contains a framework for a new Object Oriented approach to state-based programming: **State Subclassing**.

This framework enforces the developer to think of states as a discrete collection of hierarchical states, which maps to a class hierarchy. Conveniently, this gives us the whole prototype-based toolbox: we can use return values, the super keyword, this.constructor, local methods, static methods and getters/setters!

Class members with the state-specific subclasses are used to implement state-specific behavior. Prototype inheritance makes sure that the correct implementation is picked depending on the current state. 

Read my article about State Subclassing if you'd like the rationale behind it.

## What does the framework do?

While changing the state, we want our instances to change their prototype at runtime! But changing the prototype of an instance at runtime (using Object.setPrototypeOf) is a bad idea from a performance perspective. 

As an alternative and **performant** solution this framework auto-generates a **StateMachineRouter** that resides in the prototype chain between the instance and the main class. It is created for a specific class by using `StateMachine.create(classType)`. This custom router class is generated specifically for the source class and the `_states()` provided by it. The router is responsible for *mimicking* dynamic prototype changing based on the selected state. The router is then instantiated instead of the original main class, to create instances that have state-specific behavior.

By changing the state of an instance (see API below), one can change the behavior of certain class members (usually methods, but also getters/setters are supported).

## API

The following methods become available on your main class:

|method|description|
|------|-----------|
|`static _states() : Class[]`|Returns the substates of this state|
|`_setState(statePath : string)`|Changes the current state to the specified state path. The state path is a string of dot-separated names such as Open.Held|
|`_getState() : string`|Returns the currently set state path|
|`_inState(statePath : string)`|Returns true if the current state is in the specified (super)state|
|`_getMostSpecificHandledMember(memberNames : string[]) : string`|If you have multiple members, it returns the member that is specified in the deepest state. It can be used to obtain the most specific member before executing it|

For every state, it is possible to specify special *lifecycle methods*:
|method|description|
|------|-----------|
|`$enter`|invoked when the current state entered this state class|
|`$exit`|invoked when the current state exited this state class|

## Example

```javascript
class Account {
    constructor() {
        this._balance = 0;
    }
    
    $enter() {
        this.open();
    }
    
    open() {
        this._setState("Open");
    }
    
    close() {
        this._setState("Closed");
    }
    
    getAvailable() {
        return this._balance;
    }
    
    static _states() {
        return [
            class Open extends this {
                deposit(amount) {
                    this._balance += amount;
                }
                
                withdraw(amount) {
                    this._balance -= amount;
                }
                
                placeHold() {
                    this._setState("Open.Held");
                }
                
                static _states() {
                    return [
                        class Held extends this {
                            deposit(amount) {
                                // Not allowed when held.
                            }
                            
                            withdraw() {
                                // Not allowed when held.
                            }
                            
                            getAvailable() {
                                return 0;
                            }
                            
                            releaseHold() {
                                this._setState("Open");
                            }
                        }
                    ]
                }
            },
            class Closed extends this {
                deposit(amount) {
                }
                
                getAvailable() {
                    return 0;
                }
            }
        ];
    }
}


// Extend by state machine router.
import StateMachine from "../src/StateMachine.js";
Account = StateMachine.create(Account);

export default Account;
```
