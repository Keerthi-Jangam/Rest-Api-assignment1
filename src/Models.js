"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Meter = exports.Provider = exports.User = void 0;
class User {
    constructor(id, userName, password, email, fullName, providerId, meterId) {
        this.id = id;
        this.userName = userName;
        this.password = password;
        this.email = email;
        this.fullName = fullName;
        this.providerId = providerId;
        this.meterId = meterId;
    }
}
exports.User = User;
class Provider {
    constructor(id, name, charge) {
        this.id = id;
        this.name = name;
        this.charge = charge;
    }
}
exports.Provider = Provider;
class Meter {
    constructor(id, name, readings) {
        this.id = id;
        this.name = name;
        this.readings = readings;
    }
}
exports.Meter = Meter;
