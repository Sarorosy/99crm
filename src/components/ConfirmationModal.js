export const ConfirmationModal = ({ context, isReversible, onClose, onConfirm }) => {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white rounded-lg shadow-lg p-3 max-w-md w-full text-center">
          <h4 className="text-xl font-semibold text-gray-800">
            {context.title || "Are you sure?"}
          </h4>
          <p className="text-gray-600 mt-2">
            {context.message || "This action cannot be undone."}
          </p>
          {isReversible == false ? (
            <p className="text-red-600 font-medium mt-2 bg-red-100 rounded p-1">
              This action is irreversible!
            </p>
          ) : ""}
          <div className="mt-3 flex justify-center buton">
            <button
              className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white font-semibold rounded mr-2"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="px-2 py-1 text-white font-semibold rounded bg-teal-500 hover:bg-teal-600"
              onClick={onConfirm}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    );
  };
  