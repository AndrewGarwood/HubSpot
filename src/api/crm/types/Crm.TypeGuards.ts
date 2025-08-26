/**
 * @file src/api/crm/types/Crm.TypeGuards.ts
 */

import { isObject, hasKeys, isNonEmptyArray, isNonEmptyString } from "@typeshi/typeValidation";
import { SimplePublicObjectWithAssociations, SimplePublicObject, 
    CollectionResponseAssociatedId, AssociatedId 
} from "./Crm";
import { CrmAssociationObjectEnum } from "src/api/crm/types/Enums";


export function isSimplePublicObject(value: any): value is SimplePublicObject {
    return (isObject(value)
        && hasKeys(value, [
            'createdAt', 'archived', 'archivedAt', 'id', 'updatedAt'
        ])
        && (!value.properties || isObject(value.properties))
        && (!value.propertiesWithHistory || isObject(value.propertiesWithHistory))
    );
}

export function isSimplePublicObjectWithAssociations(value: any): value is SimplePublicObjectWithAssociations {
    return (isSimplePublicObject(value) 
        && ('associations' in value)
        && isObject(value.associations)
        && Object.keys(value.associations)
            .every(k=>Object.values(CrmAssociationObjectEnum)
                .includes(k as CrmAssociationObjectEnum)
                && isCollectionResponseAssociatedId((value.associations as Record<string, any>)[k])
            )
    );
}

export function isCollectionResponseAssociatedId(
    value: any
): value is CollectionResponseAssociatedId {
    return (isObject(value)
        && (isNonEmptyArray(value.results)
            && value.results.every(r=>isAssociatedId(r))
        )
    )
}

export function isAssociatedId(value: any): value is AssociatedId {
    return (isObject(value)
        && isNonEmptyString(value.id)
        && isNonEmptyString((value.type))
    );
}