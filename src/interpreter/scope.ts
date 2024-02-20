export interface ScopeBindings  {
    [identifier: string]: any;
}

export class Scope {

    private bindings: ScopeBindings = {};
    constructor(
        private parent?: Scope,
        private level = 0,
        defaultBindings: ScopeBindings = {}
    ) {
        for (const identifier in defaultBindings) {
            if (defaultBindings.hasOwnProperty(identifier)) {
                this.store(identifier, defaultBindings[identifier]);
            }
        }
    }

    store(identifier: string, value: any) {
        return this.bindings[identifier] = value;
    };

    resolve(identifier: string): any {
        const value = this.bindings[identifier];
        if (value !== undefined) {
            return value;
        }
        if (this.parent !== undefined) {
            return this.parent.resolve(identifier);
        }

        return undefined;
    };

    push(): Scope {
        return new Scope(this, this.level + 1);
    }

    pop(): Scope | undefined {
        return this.parent;
    }
}