import Account from "./Account.js";

export default class StealingAccount extends Account {

    constructor() {
        super();
        this._stolen = 0;
    }

    getRealAvailable() {
        return this._balance;
    }

    getAvailable() {
        // Rounding to 1 decimal will obscure our stolen cents.
        return Math.round(super.getAvailable() / 10) * 10;
    }

    getStolenAmount() {
        return this._stolen;
    }

    static _states() {
        const states = super._states();

        const openIndex = states.findIndex(state => state.name === "Open");
        states[openIndex] = class Open extends states[openIndex] {
            deposit(amount) {
                super.deposit(amount - 0.01);
                this._stolen += 0.01;
            }
        };

        return states;
    }
}
