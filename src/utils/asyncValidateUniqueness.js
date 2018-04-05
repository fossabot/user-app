import i18next from 'i18next';
import api from '../api';

export default function asyncValidateUniqueness(values, _, props) {
    const formNameValue = values.name;

    if (!formNameValue) {
        return Promise.resolve({});
    }

    let errors = {};
    const model = props.role || props.group;
    const entityName = model.modelDefinition.name;

    return api
        .findRoleOrGroupByName(entityName, formNameValue)
        .then(modelCollection => {
            if (modelCollection.size > 0) {
                const foundId = modelCollection.values().next().value.id;
                if (foundId !== model.id) {
                    errors.name = i18next.t('Name is already taken');
                }
            }
            return errors;
        })
        .catch(error => {
            errors.name = i18next.t('Could not verify if this name is unique');
            throw errors;
        });
}