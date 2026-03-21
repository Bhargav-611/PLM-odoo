/**
 * Compares two objects and returns the changed fields.
 * Includes only fields from newData that differ from oldData.
 */
exports.getChanges = (oldData, newData) => {
    const changes = {};
    for (const key in newData) {
        if (newData[key] !== undefined && newData[key] !== oldData[key]) {
            changes[key] = newData[key];
        }
    }
    return changes;
};
