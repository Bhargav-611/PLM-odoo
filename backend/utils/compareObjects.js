exports.compareObjects = (oldData, newData) => {
    const diff = [];
    const safeOld = oldData || {};
    const safeNew = newData || {};

    const allKeys = new Set([...Object.keys(safeOld), ...Object.keys(safeNew)]);

    for (const key of allKeys) {
        if (['_id', 'createdAt', 'updatedAt', '__v', 'status', 'versionNumber', 'versionLabel', 'createdBy', 'updatedBy', 'image', 'attachments'].includes(key)) continue; // ignore metadata for logic compares

        const oldVal = safeOld[key];
        const newVal = safeNew[key];

        const oldStr = JSON.stringify(oldVal) || 'null';
        const newStr = JSON.stringify(newVal) || 'null';

        const changed = oldStr !== newStr;

        if (changed || newVal !== undefined) {
            diff.push({
                field: key,
                old: oldVal,
                new: newVal,
                changed
            });
        }
    }

    return diff;
};
