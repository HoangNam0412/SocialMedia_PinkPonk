import React from 'react';

interface EditBioModalProps {
  setShowBioModal: (show: boolean) => void;
  bioText: string;
  setBioText: (text: string) => void;
  handleSaveBio: () => void;
  savingBio: boolean;
}

const EditBioModal: React.FC<EditBioModalProps> = ({
  setShowBioModal,
  bioText,
  setBioText,
  handleSaveBio,
  savingBio,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all">
      <div 
        className="w-96 rounded-xl bg-white p-6 shadow-xl transition-all duration-300 dark:bg-[#2A1C22]/90 dark:shadow-pink-900/10 modal-pop"
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-xl font-bold text-pink-700 dark:text-pink-300">
            Edit Bio
          </h3>
          <button 
            onClick={() => setShowBioModal(false)}
            className="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-pink-50 hover:text-pink-500 dark:text-gray-300 dark:hover:bg-pink-900/20 dark:hover:text-pink-300"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="mb-4">
          <textarea
            className="h-36 w-full resize-none rounded-xl border border-pink-100 bg-pink-50/50 p-3 text-gray-700 placeholder-pink-300 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-300/40 dark:border-pink-900/20 dark:bg-pink-900/10 dark:text-gray-200 dark:placeholder-pink-400/30 dark:focus:border-pink-700 dark:focus:ring-pink-700/30"
            value={bioText}
            onChange={(e) => setBioText(e.target.value)}
            placeholder="Viết gì đó về bản thân bạn..."
          ></textarea>
          <p className="mt-2 text-right text-xs text-pink-500/70 dark:text-pink-400/70">
            {bioText.length} / 150 ký tự
          </p>
        </div>
        <div className="flex justify-end space-x-3">
          <button
            className="flex items-center rounded-full bg-pink-100 px-5 py-2 text-sm font-medium text-pink-700 transition-all duration-200 hover:bg-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:hover:bg-pink-800/50"
            onClick={() => setShowBioModal(false)}
          >
            Hủy bỏ
          </button>
          <button
            className="flex items-center rounded-full bg-pink-500 px-5 py-2 text-sm font-medium text-white shadow-md transition-all duration-200 hover:bg-pink-600 hover:shadow-lg disabled:bg-pink-300 dark:bg-pink-600 dark:hover:bg-pink-700 disabled:dark:bg-pink-800/50"
            onClick={handleSaveBio}
            disabled={savingBio}
          >
            {savingBio ? (
              <>
                <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang lưu...
              </>
            ) : (
              'Lưu thay đổi'
            )}
          </button>
        </div>
      </div>
      <style>
        {`
          @keyframes modalPop {
            0% { transform: scale(0.9); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }
          
          .modal-pop {
            animation: modalPop 0.3s ease-out;
          }
        `}
      </style>
    </div>
  );
};

export default EditBioModal;
