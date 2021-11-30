import React, {useState} from 'react';

// react bootstrap imports
import Modal from 'react-bootstrap/Modal';

export default function UserModal({users, handleClose, status}) {
    const displayUsers = users.map((u) => <li>{u}</li>);

    return (
        <Modal show = {status} onHide={handleClose} scrollable={true}>
        <Modal.Dialog>
            <Modal.Header closeButton>
                <Modal.Title>Modal title</Modal.Title>
            </Modal.Header>

        <Modal.Body>
            {displayUsers}
        </Modal.Body>
        </Modal.Dialog>
        </Modal>
    )
}
