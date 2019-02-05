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