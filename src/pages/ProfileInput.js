import React, { useState } from 'react';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import Form from 'react-bootstrap/Form';


export default function ProfileInput(props) {
    const [input, setInput] = useState("");

    return (
        <div>
        <Form.Label htmlFor="basic-url">{props.label}</Form.Label>
        <InputGroup className="mb-3">
            <FormControl
                placeholder={props.placeholder}
                aria-label={props.label}
                aria-describedby="basic-addon1"
                defaultValue={props.val}
                onChange = {(e) => props.onChange(e, props.field)}
                readOnly = {!props.readOnly}
            />
        </InputGroup> 
        </div>
    )
    
}
