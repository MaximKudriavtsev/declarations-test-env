import { mount } from 'enzyme';
import Widget, { viewFunction, WidgetProps } from '../widgets/test-widget';
import { render, h, Component } from 'preact';
import { combineDeclarations } from './utils/declaration-wrapper';

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

    describe('Ref with real DOM', () => {
        it('should create valid Ref object', () => {
            const node = mount(<TestWidgetBase />);

            expect(node.instance().testRef.current.className)
                .toBe('custom-class-name');
        });
    });
    
    describe('defaultOptionRules - default properties should be defined', () => {
    });
});
