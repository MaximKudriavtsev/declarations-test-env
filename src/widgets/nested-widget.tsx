import {
    Component,
    ComponentBindings,
    JSXComponent,
} from 'devextreme-generator/component_declaration/common';
import WrapperWidget from './test-widget';
import { h } from 'preact'; // we should add this line to setup test environment

export const viewFunction = (viewModel: Widget) => {
    return (
        <WrapperWidget
            prop1="prop-1"
        >
            <div className="nested-div" />
        </WrapperWidget>
    );
};

@ComponentBindings()
export class WidgetProps {}

// tslint:disable-next-line: max-classes-per-file
@Component({
    defaultOptionRules: null,
    registerJQuery: true,
    view: viewFunction,
})

export default class Widget extends JSXComponent<WidgetProps> {}
