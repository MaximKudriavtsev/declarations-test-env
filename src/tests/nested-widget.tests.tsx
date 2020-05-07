import { mount } from 'enzyme';
import Widget, { viewFunction, WidgetProps } from '../widgets/nested-widget';
import { render, h, Component } from 'preact';

var aggregation = (baseClass, ...mixins) => {
    class base extends baseClass {
        constructor (...args) {
            super(...args);
            mixins.forEach((mixin) => {
                copyProps(this,(new mixin));
            });
        }
    }
    let copyProps = (target, source) => {  // this function copies all properties and symbols, filtering out some special ones
        Object.getOwnPropertyNames(source)
              .concat(Object.getOwnPropertySymbols(source))
              .forEach((prop) => {
                 if (!prop.match(/^(?:constructor|prototype|arguments|caller|name|bind|call|apply|toString|length)$/))
                    Object.defineProperty(target, prop, Object.getOwnPropertyDescriptor(source, prop));
               })
    }
    mixins.forEach((mixin) => { // outside contructor() to allow aggregation(A,B,C).staticFunction() to be called etc.
        copyProps(base.prototype, mixin.prototype);
        copyProps(base, mixin);
    });
    return base;
}

const combineDeclarations = (DeclarationClass, view, Props) => {
    class Test extends aggregation(DeclarationClass, Component) {
        constructor(props = {}) {
            super();

            const properties = { ...new Props(), ...props };

            this._props = properties; // it needs for render method, because preact remove our initial props;
            this.props = properties; // it needs for methods

            this._effects = [];

            const a = Object.keys(DeclarationClass.prototype);
            const b = DeclarationClass;

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
            this._effects.forEach((effect) => effect.call({ ...this, props: this._props }));
        }

        render() {
            return view({ ...this, props: this._props }); // can we use preact.h() here? - no, we import h in this file
        }
    }
    return Test;
};

describe.only('Widget', () => {
    const TestWidgetBase = combineDeclarations(Widget, viewFunction, WidgetProps);

    describe('View - viewFunction', () => {
        it('should render nested components', () => {
            const node = mount(<TestWidgetBase />);
            
            expect(node.find('.nested-div').exists()).toBe(true);
        });
        
        it('should pass properties into component', () => {
            const node = mount(<TestWidgetBase />).childAt(0);
            
            expect(node.prop('prop1')).toBe('prop-1');
        });
    });
});
