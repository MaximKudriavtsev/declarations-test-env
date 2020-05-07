import { mount } from 'enzyme';
import Widget, { viewFunction, WidgetProps } from '../widgets/nested-widget';
import { render, h, Component } from 'preact';
import { combineDeclarations } from './utils/declaration-wrapper';

describe('Widget', () => {
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
