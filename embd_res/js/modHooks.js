class EsoExtensions {
    _extensionList = []
    /**
     * Registers a new extension. Returns true if successful, false if the extension is invalid or already registered.
     * @param {EsoExtension} ext 
     * @returns 
     */
    register(ext) {
        if (!ext?.id || this._extensionList.some(curr => curr.id === ext.id)) {
            return false
        }
        this._extensionList.push(ext)
        return true
    }

    /**
     * Unregisters an extension by its ID.
     * @param {string} id 
     */
    unregister(id) {
        this._extensionList = this._extensionList.filter(curr => curr.id !== id)
    }

    /**
     * Returns the list of registered extension IDs.
     * @returns {string[]} keys
     */
    keys() {
        return this._extensionList.map(curr => curr.id)
    }
    
    /**
     * Returns the list of registered extensions.
     * @returns {EsoExtension[]} list of registered extensions
     */
    list() {
        return this._extensionList
    }

    /**
     * 
     * @param {EsoExtensionType} type 
     * @returns {EsoExtension[]} list of extensions of the specified type
     */
    getByType(type) {
        return this._extensionList.filter(curr => curr.type === type)
    }
}

class EsoExtensionType {
    type = null
    constructor(type) {
        this.type = type
    }
    
    static QUICK_START = new EsoExtensionType("QUICK_START");
}

/*
 * EsoExtension and QuickStartExtension classes
 * EsoExtension is the base class for all extensions.
 * QuickStartExtension extends EsoExtension for Quick Start specific extensions.
 * 
 * @type {EsoExtension}
 */
class EsoExtension {
    id = null
    type = null
    errors = []
    constructor(id, type = null) {
        if (!id) {
            throw new Error("ID is required for an EsoExtension")
        }
        if (type === null) {
            throw new Error("Type is required for an EsoExtension")
        }
        this.id = id
        this.type = type
    }

    getId() {
        return this.id
    }

    getType() {
        return this.type
    }

    clearErrors() {
        this.errors = []
    }

    getErrors() {
        return this.errors
    }

    invokeIfPresent(methodName, ...args) {
        try {
            if (typeof this[methodName] === "function") {
                let result = this[methodName](...args)
                // Async hooks: a rejected promise is not caught by the try/catch, so collect it here
                if (result && typeof result.then === "function") {
                    return result.catch(e => {
                        console.error(e)
                        this.errors.push(e)
                        return null
                    })
                }
                return result
            }
        }
        catch (e) {
            console.error(e)
            this.errors.push(e)
        }
        return null
    }
}

class QuickStartExtension extends EsoExtension {
    label = null
    helpText = null
    _render = null
    _hasSelection = null
    _apply = null
    _clear = null
    
    constructor(id, label = null, helpText = null, render = null, hasSelection = null, apply = null, clear = null) {
        super(id, EsoExtensionType.QUICK_START)
        this.label = label
        this.helpText = helpText
        this._render = render
        this._hasSelection = hasSelection
        this._apply = apply
        this._clear = clear
    }

    getLabel() {
        return this.label || ""
    }

    getHelpText() {
        return this.helpText || ""
    }

    render(containerElem, rerender) {
        return this.invokeIfPresent("_render", containerElem, rerender)
    }

    hasSelection() {
        return this.invokeIfPresent("_hasSelection") || false
    }

    async apply() {
        return this.invokeIfPresent("_apply")
    }

    clear() {
        return this.invokeIfPresent("_clear")
    }
}

window.eso.extensions = new EsoExtensions()