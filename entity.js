export class Entity {
    constructor(id, name, type, parents, children) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.parents = parents;
        this.children = children;
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
        return this.parents;
    }

    getChildren() {
        return this.children;
    }

    getDescendants() {
        if (this.getChildren().length === 0) {
            return []
        } else {
            return this.getChildren().concat(this.getChildren().flatMap((child) => child.getDescendants()))
        }
    }

    getAncestors() {
      if (this.getParents().length === 0) {
          return []
      } else {
          return this.getParents().concat(this.getParents().flatMap((parent) => parent.getAncestors()))
      }
    }

}
