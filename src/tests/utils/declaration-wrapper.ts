import { Component } from 'preact';

const copyProps = (target, source) => {  // this function copies all properties and symbols, filtering out some special ones
    Object.getOwnPropertyNames(source)
          .concat(Object.getOwnPropertySymbols(source))
          .forEach((prop) => {
             if (!prop.match(/^(?:constructor|prototype|arguments|caller|name|bind|call|apply|toString|length)$/))
                Object.defineProperty(target, prop, Object.getOwnPropertyDescriptor(source, prop));
           });
}

const aggregation = (BaseClass, ...mixins) => {
    class Base extends BaseClass {
        constructor (...args) {
            super(...args);
            mixins.forEach((Mixin) => {
                copyProps(this, (new Mixin));
            });
        }
    }
    
    mixins.forEach((Mixin) => { // outside constructor() to allow aggregation(A,B,C).staticFunction() to be called etc.
        copyProps(Base.prototype, Mixin.prototype);
        copyProps(Base, Mixin);
    });

    return Base;
}

export const combineDeclarations = (DeclarationClass, view, Props) => {
    return class DeclarationWidget extends aggregation(Component, DeclarationClass) {
        constructor(props = {}) {
            super(props);

            const properties = { ...new Props(), ...props };

            this._initialProps = properties; // it needs for render method, because preact remove our initial props;
            this.props = properties; // it needs for method calls

            this._effects = [];

            for (const itemName of Object.getOwnPropertyNames(DeclarationClass.prototype)) {
                const descriptor = Object.getOwnPropertyDescriptor(DeclarationClass.prototype, itemName);
                if (typeof descriptor.value !== 'function') continue;

                const property = DeclarationClass.prototype[itemName];
                if (property._decoratorType === 'Effect') {
                    this._effects.push(property);
                }
            }
        }

        componentDidMount() {
            this.props = { ...this._initialProps, ...this.props };
            this._effects.forEach((effect) => effect.call(this));
        }

        render() {
            this.props = { ...this._initialProps, ...this.props }; // save initial props
            return view(this); // can we use preact.h() here? - no, we import h in this file
        }
    }
};

/**
 * Problems
 * 
 * + test-coverage should covers all lines
 * + we should can render simple jsx markup
 * + we should can render jsx markup with nested components
 * + call effects after render and update node
 * + render children
 * + ref with real DOM
 * + emulate click on DOM elements
 * + `setProps` works
 * + `props()` works
 * make wrapper with `setState`, `forceUpdate`, `state()?` like it enzyme do
 * ? defaultOptionRules - default properties should be defined | should be tested outside the document
 * ? we should protect users from the infinite loop while state update
 * 
 * ----
 * Test Declaration
 * 
 * We would like to test widgets common part via declaration and frameworks difference via low count functional tests
 * 
 * Common parts
 *   1. static functions in methods, getters and effects - be sure that methods are defined as a method, and so on
 *   2. default props - be sure that default props from Model are defined
 *   3. props bindings into markup - be sure that necessary properties are bind into markup
 *   4. event subscriptions - be sure that Effects() are defined as Effects and other things are work
 * 
 * Difference parts
 *   1. Effect calls in framework life circle methods - all work fine in complex functional tests for all frameworks
 *   2. Change component state - all work fine in complex functional tests for all frameworks
 *   3. Manipulation with DOM - all work fine in complex functional tests for all frameworks
 * 
 * 
 * Test React Widget
 * 
 * - compiling declarations after each file change
 * - long time file testing
 * 
 * Common parts
 *   1. static functions in methods, getters and effects - we also can test it
 *   2. default props - by test markup
 *   3. props bindings into markup - by test markup
 *   4. event subscriptions - by test markup
 * 
 * Difference parts
 *   1. Effect calls in framework life circle methods - we test only one framework and generator.
 *      If current framework are well and generator test are well too, everything is great!
 *   2. Change component state - we test only one framework and generator.
 *      If current framework are well and generator test are well too, everything is great!
 *   3. Manipulation with DOM - we test only one framework and generator.
 *      If current framework are well and generator test are well too, everything is great!
 * 
 */
