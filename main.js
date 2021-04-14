import {Entity} from "./entity.js";

export async function getData() {
    let rawEntities;
    let rawRelations;
    await fetch("./data/data.json")
        .then(response => {
            return response.json();
        })
        .then((data) => {
            rawEntities = data.entities;
            rawRelations = data.relationships;
        });
    let parsedEntities = [];

    rawEntities.forEach((rawEntity) => parsedEntities[rawEntity.id] = new Entity(rawEntity.id, rawEntity.name, rawEntity.type));
    rawRelations.forEach((rawRelation) => {
        parsedEntities[rawRelation.fromEntityId].children.add(parsedEntities[rawRelation.toEntityId]);
        parsedEntities[rawRelation.toEntityId].parents.add(parsedEntities[rawRelation.fromEntityId]);
    });
    return parsedEntities
}



