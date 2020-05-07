import { mount } from 'enzyme';
import Widget, { viewFunction, WidgetProps } from '../widgets/test-widget';
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

describe('Widget', () => {
    const TestWidgetBase = combineDeclarations(Widget, viewFunction, WidgetProps);

    describe('View - viewFunction', () => {
        it('should render view', () => {
            const node = mount(<TestWidgetBase />).childAt(0);
            
            expect(node.prop('prop2')).toBe(100);
            expect(node.prop('prop3')).toBe(false);
            expect(node.prop('className')).toBe('custom-class-name');
        });

        it('should render children', () => {
            const node = mount((
                <TestWidgetBase>
                    <div className="nested-div" />
                </TestWidgetBase>
            ));

            expect(node.find('.nested-div').exists()).toBe(true);
        });
    });

    describe('Effects - hooks', () => {
        it('should call effect manually', () => {
            const testWidget = new TestWidgetBase({ prop1: true, prop2: false });
            
            testWidget.testEffect();

            expect(testWidget._focused).toBe(true);
        });

        it('should call effects after `render` method', () => {
            debugger
            const spy = jest.fn();
            const node = mount(<TestWidgetBase testEvent={spy} />);
            
            expect(spy).toBeCalledTimes(1);
        });
    });

    describe('Model - necessary props are defined', () => {
        it('should define props', () => {
            const testWidget = new TestWidgetBase();
            expect(testWidget.props).toEqual({
                prop1: null,
                prop2: 100,
                prop3: false,
                prop4: { data: 'prop4' },
                children: undefined,
                testEvent: expect.any(Function),
            });
        });
    });

    describe('Getters & Methods - we should call getters and methods from class instance', () => {
        it('should run simple getter', () => {
            const testWidget = new TestWidgetBase();
            expect(testWidget.testGetter).toEqual({});
        });
        
        it('should run simple method', () => {
            const testWidget = new TestWidgetBase();
            expect(testWidget.testMethod()).toEqual({ data: 'prop4' });
        });
        
        it('should run method with state update', () => {
            const testWidget = new TestWidgetBase();
            expect(testWidget._focused).toEqual(false);
            testWidget.testMethod2();
            expect(testWidget._focused).toEqual(true);
        });
    });
    
    describe('defaultOptionRules - default properties should be defined', () => {
    });
});

/**
 * Problems
 * 
 * we should protect users from the infinite loop while state update
 * + test-coverage should covers all lines
 * + we should can render simple jsx markup
 * + we should can render jsx markup with nested components
 * make wrapper with `setState`, `setProps`, `forceUpdate`, `props()`, `state()?` like it enzyme do
 * + call effects after render and update node
 * + render children
 * emulate click on DOM elements
 * ref with real DOM
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