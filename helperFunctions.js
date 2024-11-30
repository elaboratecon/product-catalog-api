// Is Defined
function isDefined(value) {
    if (value === undefined) return false
    return true
}

// Is Null
function isNull(value) {
    return value === null
}

// Export the functions
module.exports = {
    isDefined,
    isNull,
}
