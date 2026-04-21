import { X } from 'lucide-react';
import Button from './Button';

export default function Modal({ isOpen, title, message, type = 'info', onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-[8px] shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className={`p-4 flex items-center justify-between border-b ${type === 'error' ? 'bg-red-50 border-red-100' : type === 'success' ? 'bg-green-50 border-green-100' : 'bg-blue-50 border-blue-100'}`}>
          <h3 className={`font-semibold text-lg ${type === 'error' ? 'text-red-700' : type === 'success' ? 'text-green-700' : 'text-blue-700'}`}>
            {title}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 text-[#333333] text-[15px]">
          {message}
        </div>
        <div className="p-4 bg-gray-50 border-t flex justify-end gap-3">
          {onConfirm ? (
             <>
               <Button onClick={onClose} className="!bg-white !text-[#333333] border border-gray-300 hover:!bg-gray-100">Cancel</Button>
               <Button onClick={onConfirm}>Confirm</Button>
             </>
          ) : (
             <Button onClick={onClose}>OK</Button>
          )}
        </div>
      </div>
    </div>
  );
}
