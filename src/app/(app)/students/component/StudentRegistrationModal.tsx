"use client";

import React from "react";
import { X } from "lucide-react";
import Button from "../../../../components/ui/Button/Button";

interface StudentRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const StudentRegistrationModal = ({ isOpen, onClose }: StudentRegistrationModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">신규 학생 등록</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* 본문 (폼 내용) */}
        <div className="p-6">
          <div className="space-y-4">
            <p className="text-slate-600 text-sm">새로운 학생의 정보를 입력해주세요.</p>
            {/* 여기에 Input 컴포넌트들을 배치하여 폼을 구성할 수 있습니다 */}
            <div className="h-40 bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center text-slate-400">
              입력 폼 영역
            </div>
          </div>

          {/* 푸터 버튼 */}
          <div className="flex justify-end gap-3 mt-8">
            <Button variant="background" onClick={onClose}>
              취소
            </Button>
            <Button 
              variant="primary" 
              onClick={() => {
                alert("학생 등록 로직 실행");
                onClose();
              }}
            >
              등록하기
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentRegistrationModal;
