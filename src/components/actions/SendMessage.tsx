import * as React from 'react';
import {NodeEditorState} from '../../interfaces';
import {Action} from '../Action';
import {NodeForm} from '../NodeForm';
import {SendMessageProps} from '../../interfaces';
import {NodeModalProps} from '../NodeModal';

var Select2 = require('react-select2-wrapper');

export class SendMessage extends Action<SendMessageProps> {
    renderNode(): JSX.Element {
        if (this.props.text) {
            return <div>{this.props.text}</div>
        } else {
            return <div className='placeholder'>Send a message to the contact</div>
        }
    }
}

export class SendMessageForm extends NodeForm<SendMessageProps, NodeEditorState> {    
    
    renderForm(): JSX.Element {
        return (
            <div className="form-group">
                <textarea name="message" className="form-control definition" defaultValue={this.props.text}></textarea>
                <div className="error"></div>
            </div>
        )
    }

    validate(control: any): string {
        if (control.name == "message") {
            let textarea = control as HTMLTextAreaElement;
            if (textarea.value.trim().length == 0) {
                return "Message content is required";
            }
        }
        return null;
    }
    
    submit(form: HTMLFormElement, modal: NodeModalProps) {
        var textarea: HTMLTextAreaElement = $(form).find('textarea')[0] as HTMLTextAreaElement;
        modal.onUpdateAction({
            uuid: this.props.uuid, 
            type: "msg", 
            text: textarea.value,
        } as SendMessageProps);
    }
}