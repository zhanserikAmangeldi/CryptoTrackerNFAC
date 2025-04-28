import React from 'react';

function ConfirmDialog({
                           title,
                           message,
                           onConfirm,
                           onCancel,
                           isLoading = false,
                           confirmText = "Confirm",
                           cancelText = "Cancel",
                           confirmButtonClass = "danger-btn"
                       }) {
    return (
        <div className="confirm-dialog-overlay">
            <div className="confirm-dialog">
                <h3 className="confirm-dialog-title">{title}</h3>
                <p className="confirm-dialog-message">{message}</p>

                <div className="confirm-dialog-actions">
                    <button
                        className="cancel-btn"
                        onClick={onCancel}
                        disabled={isLoading}
                    >
                        {cancelText}
                    </button>

                    <button
                        className={`${confirmButtonClass}`}
                        onClick={onConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? "Processing..." : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmDialog;