/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

class TextRenderer {
    render(value, defaults = {text: '' + value}) {
        return defaults;
    }
}

class RangeRenderer extends TextRenderer {
    constructor(textRenderer) {
        super(textRenderer);
        
        // assume already sorted on backend
        this.rangeValues = textRenderer.rangeValues;
    }
    
    render(value, defaults = {text: '' + value}) {
        // iterate in reverse
        for (let i = this.rangeValues.length - 1; i >=0; i--) {
            const range = this.rangeValues[i];
            if (value >= range.from && value <= range.to) {
                return {
                    text: range.text || defaults.text,
                    color: range.colour || defaults.color
                };
            }
        }
        
        return defaults;
    }
}

class BinaryRenderer extends TextRenderer {
    constructor(textRenderer) {
        super(textRenderer);
        
        this.values = {
            'true': {
                key: true,
                color: textRenderer.oneColour,
                text: textRenderer.oneLabel
            },
            'false': {
                key: false,
                color: textRenderer.zeroColour,
                text: textRenderer.zeroLabel
            }
        };
    }
    
    render(value, defaults = {text: '' + value}) {
        return this.values[value] || defaults;
    }
}

class MultistateRenderer extends TextRenderer {
    constructor(textRenderer) {
        super(textRenderer);
        
        this.values = {};
        const multistateValues = textRenderer.multistateValues;
        multistateValues.forEach(item => {
            item.color = item.colour;
            this.values[item.key] = item;
        });
    }
    
    render(value, defaults = {text: '' + value}) {
        return this.values[value] || defaults;
    }
}

TextRenderer.forPoint = function(point) {
    if (!point || !point.textRenderer) return new TextRenderer();
    
    switch (point.textRenderer.type) {
    case 'textRendererBinary': return new BinaryRenderer(point.textRenderer);
    case 'textRendererMultistate': return new MultistateRenderer(point.textRenderer);
    case 'textRendererRange': return new RangeRenderer(point.textRenderer);
    }
    
    return new TextRenderer();
};

export default TextRenderer;