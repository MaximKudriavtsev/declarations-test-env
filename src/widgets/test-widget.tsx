import {
    Component,
    ComponentBindings,
    // Effect,
    Event,
    InternalState,
    JSXComponent,
    // Method,
    OneWay,
    Ref,
    Slot,
} from 'devextreme-generator/component_declaration/common';
import { h, createRef } from 'preact'; // we should add this line to setup test environment

export const viewFunction = (viewModel: Widget) => {
    return (
        <div
            ref={viewModel.testRef as any}
            {...viewModel.testGetter}
            data={{ a: 'data' }}
            prop1={viewModel.props.prop1}
            prop2={viewModel.props.prop2}
            prop3={viewModel.props.prop3}
            prop4={viewModel.props.prop4}
            className="custom-class-name"
        >
            {viewModel.props.children}
        </div>
    );
};

// why we should call decorators? OneWay() instead of OneWay
const createMethodDecorator = type => () => (target?, propertyKey?, descriptor?) => {
    target[propertyKey]._decoratorType = type;
    return descriptor;
};
const createPropertyDecorator = type => () => (target?, propertyKey?) => {
    target[propertyKey] = createRef();
    return void 0;
};

// const OneWay = createDecorator('OneWay');
// const TwoWay = createDecorator('TwoWay');
// const Slot = createDecorator('Slot');
// const Event = createDecorator('Event');
const Effect = createMethodDecorator('Effect');
const Method = createMethodDecorator('Method');
const Ref = createPropertyDecorator('Ref');

@ComponentBindings()
export class WidgetProps {
    @OneWay() prop1?: string | number | null = null;
    @OneWay() prop2?: number = 100;
    @OneWay() prop3?: boolean = false;
    @OneWay() prop4?: any = { data: 'prop4' };
    @Slot() children?: any;
    @Event() testEvent?: () => any = () => void 0;
}

// tslint:disable-next-line: max-classes-per-file
@Component({
    defaultOptionRules: null,
    registerJQuery: true,
    view: viewFunction,
})

export default class Widget extends JSXComponent<WidgetProps> {
    @InternalState() _focused: boolean = false;

    @Ref()
    testRef!: HTMLDivElement;

    @Effect()
    testEffect() {
        const { prop1, prop2 } = this.props;
        const isFocusable = prop1 && !prop2;

        if (isFocusable) {
            // dxClick.on(this.testRef, (e) => {
            //     e.stopImmediatePropagation();
                this._focused = true;
            // });

            // return () => dxClick.off(this.testRef);
        }

        return void 0;
    }

    @Effect()
    mockEffect() {
        const { testEvent } = this.props;

        testEvent();
    }
    
    @Method()
    testMethod() {
        const { prop4 } = this.props;

        return prop4;
    }
    
    @Method()
    testMethod2() {
        this._focused = true;
    }

    get testGetter() {
        const { prop3, prop2, prop4 } = this.props;

        if (prop3 && !prop2) return prop4;
        return {};
    }
}
