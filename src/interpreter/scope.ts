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

    resolveScope(identifier: string): Scope | undefined {
        if (this.bindings.hasOwnProperty(identifier)) {
            return this;
        }

        if (this.parent) {
            return this.parent.resolveScope(identifier)
        }

        return undefined;
    }

    resolve(identifier: string): any {
        const scope = this.resolveScope(identifier) ?? this
        return scope.bindings[identifier];
    };

    push(): Scope {
        return new Scope(this, this.level + 1);
    }

    pop(): Scope | undefined {
        return this.parent;
    }
}