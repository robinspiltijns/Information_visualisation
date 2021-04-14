export class Entity {
    constructor(id, name, type) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.parents = new Set();
        this.children = new Set();
    }

    getId() {
        return this.id;
    }

    getName() {
        return this.name;
    }

    getType() {
        return this.type;
    }

    getParents() {
        return Array.from(this.parents);
    }

    getChildren() {
        return Array.from(this.children);
    }

    getParentsSet() {
        return this.parents;
    }

    getChildrenSet() {
        return this.children;
    }

    getDescendants() {
        return Array.from(this.getDescendantsSet());
    }

    getAncestors() {
        return Array.from(this.getAncestorsSet());
    }

    getDescendantsSet() {
        if (this.getChildren().size === 0) {
            return new Set()
        } else {
            return new Set([...this.getChildren(), ...Array.from(this.getChildren()).flatMap((child) => child.getDescendants())])
        }
    }

    getAncestorsSet() {
        if (this.getParents().size === 0) {
            return new Set()
        } else {
            return new Set([...this.getParents(), ...Array.from(this.getParents()).flatMap((parent) => parent.getAncestors())])
        }
    }

}
