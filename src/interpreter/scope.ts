import { moduleToString } from "./helpers";
import packageJson from '../../package.json'

export interface ScopeBindings {
    [identifier: string]: any;
}

export interface Metadata {
    public: boolean;
}

export interface ScopeBindingMetadata {
    [identifier: string]: {
        public?: boolean
    };
}

export class Scope {

    public readonly IDENTIFIER_SCOPE = '$SCOPE';
    public readonly IDENTIFIER_VERSION = '$VERSION';

    bindings: ScopeBindings = {};
    availableBindings: ScopeBindings = {};
    private metadata: ScopeBindingMetadata = {};
    private closures: Scope[] = [];
    constructor(
        private parent?: Scope,
        public readonly level = 0,
        defaultBindings: ScopeBindings = {}
    ) {
        for (const identifier in defaultBindings) {
            if (defaultBindings.hasOwnProperty(identifier)) {
                this.store(identifier, defaultBindings[identifier]);
            }
        }
    }

    store(identifier: string, value: any, metadata?: Metadata, searchParentChain = true) {
        let scope: Scope = this;
        if (searchParentChain) {
            const resolvedScope = this.resolveScope(identifier);
            if (resolvedScope) {
                scope = resolvedScope;
            }
            scope.store(identifier, value, metadata, false);
            return;
        }
        this.bindings[identifier] = value;
        if (metadata) {
            this.metadata[identifier] = metadata;
        }
    };

    resolveScope(identifier: string): Scope | undefined {
        if (this.bindings.hasOwnProperty(identifier)) {
            return this;
        }

        for (const closure of this.closures) {
            if (closure.bindings.hasOwnProperty(identifier)) {
                return closure;
            }
        }

        if (this.parent) {
            return this.parent.resolveScope(identifier)
        }

        return undefined;
    }

    resolve(identifier: string): any {
        const scope = this.resolveScope(identifier) ?? this
        const binding = scope.bindings[identifier];
        if (!binding) {
            // Handle dynamic bindings
            if (identifier === this.IDENTIFIER_SCOPE) {
                const currentBindings = {
                    ...scope.bindings
                };
                currentBindings.toString = function () { return moduleToString(currentBindings) }
                return currentBindings;
            }

            if (identifier === this.IDENTIFIER_VERSION) {
                return packageJson?.version || 'UNKNOWN';
            }
        }
        return binding;
    };

    push(extraBindings?: ScopeBindings): Scope {
        return new Scope(this, this.level + 1, extraBindings);
    }

    pop(additionalBindings?: ScopeBindings): Scope | undefined {
        const exportedBindings: ScopeBindings = {
            ...additionalBindings
        };
        for (const identifier in this.metadata) {
            const metadata = this.metadata[identifier];
            if (metadata && metadata.public) {
                exportedBindings[identifier] = this.bindings[identifier]
            }
        }
        this.parent?.import(exportedBindings)
        return this.parent;
    }

    import(scopeBindings: ScopeBindings) {
        this.availableBindings = {
            ...scopeBindings
        };
    }

    useImports(selectedIdentifiers?: string[]) {
        let selectedBindings: ScopeBindings = {};
        if (selectedIdentifiers) {
            selectedIdentifiers.forEach(selectedIdentifier => {
                selectedBindings[selectedIdentifier] = this.availableBindings[selectedIdentifier]
                delete this.availableBindings[selectedIdentifier]
            });
        } else {
            selectedBindings = this.availableBindings
            this.availableBindings = {}
        }
        return selectedBindings;
    }

    useNamedImports(selectedIdentifiers: string[]) {
        let selectedBindings: ScopeBindings = {};
        if (selectedIdentifiers) {
            selectedIdentifiers.forEach(selectedIdentifier => {
                selectedBindings[selectedIdentifier] = this.availableBindings[selectedIdentifier]
                delete this.availableBindings[selectedIdentifier]
            });
        }
        this.bindings = {
            ...this.bindings,
            ...selectedBindings,
        };
        return selectedBindings;
    }

    capture(capturedScope: Scope) {
        this.closures.push(capturedScope)
    }
    release() {
        this.closures.pop()
    }
}