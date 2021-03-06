import * as React from 'react';
import { react as bindCallbacks } from 'auto-bind';
import { FlowDefinition, Node, Group, AnyAction } from '../../flowTypes';
import ComponentMap from '../../services/ComponentMap';
import { LocalizedObject } from '../../services/Localization';
import TitleBar from '../TitleBar';
import { getTypeConfig } from '../../config';
import { NodeEditorProps } from '../NodeEditor/NodeEditor';
import { Language } from '../LanguageSelector';

import * as shared from '../shared.scss';
import * as styles from './Action.scss';

export interface ActionProps {
    node: Node;
    action: AnyAction;
    dragging: boolean;
    hasRouter: boolean;
    language: Language;
    translating: boolean;
    definition: FlowDefinition;
    first: boolean;
    localization: LocalizedObject;
    ComponentMap: ComponentMap;
    openEditor(props: NodeEditorProps): void;
    onRemoveAction: Function;
    onMoveActionUp: Function;
    onUpdateLocalizations: Function;
    onUpdateAction: Function;
    onUpdateRouter: Function;
    children?: (action: AnyAction) => JSX.Element;
}

interface ActionState {
    editing: boolean;
    confirmRemoval: boolean;
}

export default class Action extends React.Component<ActionProps, ActionState> {
    protected localizedKeys: string[] = [];
    private clicking = false;

    constructor(props: ActionProps) {
        super(props);

        bindCallbacks(this, {
            include: [
                'onClick',
                'onRemoval',
                'onMoveUp',
                'onMouseUp',
                'onMouseDown'
            ]
        });
    }

    public onClick(event: React.MouseEvent<HTMLDivElement>): void {
        event.preventDefault();
        event.stopPropagation();

        const localizations: LocalizedObject[] = this.props.localization
            ? [this.props.localization]
            : [];

        this.props.openEditor({
            onUpdateLocalizations: this.props.onUpdateLocalizations,
            onUpdateAction: this.props.onUpdateAction,
            onUpdateRouter: this.props.onUpdateRouter,
            node: this.props.node,
            action: this.props.action,
            nodeUI: null,
            language: this.props.language,
            localizations,
            definition: this.props.definition,
            translating: this.props.translating,
            ComponentMap: this.props.ComponentMap
        });
    }

    public componentDidUpdate(
        prevProps: ActionProps,
        prevState: ActionState
    ): void {
        if (this.props.dragging) {
            this.clicking = false;
        }
    }

    private onRemoval(evt: React.MouseEvent<HTMLDivElement>): void {
        evt.stopPropagation();
        this.props.onRemoveAction(this.props.action);
    }

    private onMoveUp(evt: React.MouseEvent<HTMLDivElement>): void {
        evt.stopPropagation();
        this.props.onMoveActionUp(this.props.action);
    }

    private onMouseUp(evt: React.MouseEvent<HTMLDivElement>): void {
        if (this.clicking) {
            this.clicking = false;
            this.onClick(evt);
        }
    }

    private onMouseDown(evt: React.MouseEvent<HTMLDivElement>): void {
        this.clicking = true;
    }

    private getClasses(): string {
        const classes = [styles.action];

        if (this.props.hasRouter) {
            classes.push(styles.has_router);
        }

        if (this.props.translating) {
            classes.push(styles.translating);

            if (this.props.action.type === 'reply') {
                this.localizedKeys.push('text');
            }

            if (this.localizedKeys.length === 0) {
                classes.push(styles.not_localizable);
            } else {
                if (this.props.localization.isLocalized()) {
                    for (const key of this.localizedKeys) {
                        if (!(key in this.props.localization.localizedKeys)) {
                            classes.push(styles.missing_localization);
                            break;
                        }
                    }
                } else {
                    classes.push(styles.missing_localization);
                }
            }
        }

        return classes.join(' ');
    }

    public render(): JSX.Element {
        const id = `action-${this.props.action.uuid}`;
        const { name } = getTypeConfig(this.props.action.type);
        const className: string = this.getClasses();
        const propsToInject: AnyAction = this.props.localization
            ? this.props.localization.getObject() as AnyAction
            : this.props.action;
        const titleBarClass: string = shared[this.props.action.type];
        const showRemoval: boolean = !this.props.translating;
        const showMove: boolean = !this.props.first && !this.props.translating;

        return (
            <div id={id} className={className}>
                <div className={styles.overlay} />
                <div
                    onMouseDown={this.onMouseDown}
                    onMouseUp={this.onMouseUp}
                    data-spec="interactive-div">
                    <TitleBar
                        className={titleBarClass}
                        title={name}
                        onRemoval={this.onRemoval}
                        showRemoval={showRemoval}
                        showMove={showMove}
                        onMoveUp={this.onMoveUp}
                    />
                    <div className={styles.body}>
                        {this.props.children(propsToInject)}
                    </div>
                </div>
            </div>
        );
    }
}
