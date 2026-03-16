"use client";

import React, { useState, useEffect } from 'react';
import Sidebar from "@/components/common/Sidebar";
import ConfirmModal, { MODAL_TYPES } from "@/components/common/ConfirmModal";
import { useGetMypageDashboard } from "@/store/mypageStore";
import { childAPI } from "@/lib/api";
import './child-management.css';

const ChildManagement = () => {
    const [childForms, setChildForms] = useState([
        { id: Date.now(), nickname: '', birthDate: '', age: null, isExisting: false }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
    const [isChildrenSaved, setIsChildrenSaved] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    // 8년 전 날짜 계산 (백엔드 8세 제한에 맞춤)
    const minDate = new Date();
    minDate.setFullYear(minDate.getFullYear() - 8);
    const minDateStr = minDate.toISOString().split('T')[0];
    const maxDateStr = new Date().toISOString().split('T')[0];

    const getMypageDashboard = useGetMypageDashboard();

    // 마운트 시 기존 자녀 목록 불러오기
    useEffect(() => {
        const loadChildren = async () => {
            try {
                const response = await childAPI.getChildren();
                const children = response.data.data;

                // 기존 자녀 있으면 폼에 채워주기
                if (children.length > 0) {
                    setChildForms(children.map(child => ({
                        id: child.id,
                        nickname: child.nickname,
                        birthDate: child.birthDate,
                        age: child.age,
                        isExisting: true, // 기존 데이터 표시용
                    })));
                    setIsChildrenSaved(true);
                }
            } catch (error) {
                console.error("자녀 목록 조회 실패:", error);
            }
        };
        loadChildren();
    }, []);

    // 나이 계산 함수
    const calculateAge = (birthDate) => {
        if (!birthDate) return null;

        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }

        return age;
    };

    // 입력값 변경 핸들러
    const handleInputChange = (id, field, value) => {
        // 입력값이 변경되면 저장 상태 초기화
        setIsChildrenSaved(false);

        setChildForms(prev => prev.map(form => {
            if (form.id === id) {
                const updatedForm = { ...form, [field]: value };

                // 생년월일이 변경되면 자동으로 나이 계산
                if (field === 'birthDate') {
                    updatedForm.age = calculateAge(value);
                }

                return updatedForm;
            }
            return form;
        }));
    };

    // 자녀 폼 추가
    const addChildForm = () => {
        if (childForms.length < 2) {
            setChildForms(prev => [
                ...prev,
                { id: Date.now(), nickname: '', birthDate: '', age: null }
            ]);
        }
    };

    // 자녀 폼 삭제
    const removeChildForm = async (id) => {
        if (childForms.length <= 1) return;

        const form = childForms.find(f => f.id === id);

        // 기존 데이터면 API로 삭제
        if (form?.isExisting) {
            try {
                await childAPI.deleteChild(id);
            } catch (error) {
                const message = error.response?.data?.message || "삭제 중 오류가 발생했습니다.";
                setErrorMsg(message);
                return;
            }
        }

        setIsChildrenSaved(false);
        setChildForms(prev => prev.filter(f => f.id !== id));
    };

    // 저장 버튼 클릭
    const handleSaveClick = () => {
        setErrorMsg("");
        setIsConfirmModalOpen(true);
    };

    // 저장 확인
    const handleSaveConfirm = async () => {
        setIsConfirmModalOpen(false);
        setIsLoading(true);

        try {
            for (const form of childForms) {
                const requestData = {
                    nickname: form.nickname,
                    birthDate: form.birthDate,
                };

                if (form.isExisting) {
                    await childAPI.updateChild(form.id, requestData);
                } else {
                    await childAPI.createChild(requestData);
                }
            }

            setIsChildrenSaved(true);
            setIsCompleteModalOpen(true);
            await getMypageDashboard(); // 대시보드에 바로 추가하기
        } catch (error) {
            const message = error.response?.data?.message || "저장 중 오류가 발생했습니다.";
            setErrorMsg(message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveCancel = () => {
        setIsConfirmModalOpen(false);
    };

    const handleCompleteModalClose = () => {
        setIsCompleteModalOpen(false);
    };

    // 저장 버튼 활성화 조건
    const isSaveEnabled = !isChildrenSaved &&
        childForms.length > 0 &&
        childForms.every(form => form.nickname.trim() !== '' && form.birthDate !== '') &&
        !isLoading;

    return (
        <>
            <Sidebar
                sidebarKey="child-management"
                title="자녀목록 관리"
                trigger={<span style={{display: 'none'}}>숨김</span>}
                onBack={true}
            >
                <div className="child-management-content">
                    <div className="top-section">
                        {/* 안내 메시지 */}
                        <div className="info-message">
                            자녀는 최대 2명까지 저장가능합니다. (8세 미만)
                        </div>

                        {/* 자녀 폼들 */}
                        <div className="child-forms">
                            {childForms.map((form, index) => (
                                <div key={form.id} className="child-form">
                                    <div className="form-header">
                                        <h4 className="form-title">자녀목록 추가</h4>
                                        {childForms.length > 1 && (
                                            <button
                                                type="button"
                                                className="remove-btn"
                                                onClick={() => removeChildForm(form.id)}
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>

                                    {/* 애칭 입력 */}
                                    <div className="input-field">
                                        <label className="input-label">애칭 *</label>
                                        <input
                                            type="text"
                                            value={form.nickname}
                                            onChange={(e) => handleInputChange(form.id, 'nickname', e.target.value)}
                                            className="child-input"
                                            placeholder="우리 아이를 어떻게 부르시나요?"
                                            maxLength={10}
                                        />
                                        <div className="input-help">최대 10글자까지 입력 가능해요</div>
                                    </div>

                                    {/* 생년월일 입력 */}
                                    <div className="input-field">
                                        <label className="input-label">생년월일 *</label>
                                        <input
                                            type="date"
                                            value={form.birthDate}
                                            onChange={(e) => handleInputChange(form.id, 'birthDate', e.target.value)}
                                            className="child-input date-input"
                                            min={minDateStr}
                                            max={maxDateStr}
                                        />
                                        <div className="input-help">
                                            {form.age !== null ?
                                                `생년월일을 선택하면 자동으로 나이를 계산해 드려요 (현재 ${form.age}세)` :
                                                '생년월일을 선택하면 자동으로 나이를 계산해 드려요'
                                            }
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* 에러 메시지 */}
                        {errorMsg && (
                            <p className="text-sm text-red-600 mt-2">{errorMsg}</p>
                        )}

                        {/* 추가 버튼 */}
                        {childForms.length < 2 && (
                            <div className="add-child-section">
                                <button
                                    type="button"
                                    className="add-child-btn"
                                    onClick={addChildForm}
                                >
                                    + 추가
                                </button>
                            </div>
                        )}
                    </div>

                    {/* 버튼 섹션 */}
                    <div className="bottom-section">
                        <button
                            className={`action-btn primary ${isSaveEnabled ? 'enabled' : 'disabled'}`}
                            onClick={handleSaveClick}
                            disabled={!isSaveEnabled}
                        >
                            {isChildrenSaved ? '자녀 정보 저장 완료' : (isLoading ? '저장 중...' : '자녀 정보 추가')}
                        </button>
                    </div>
                </div>
            </Sidebar>

            {/* 저장 확인 모달 */}
            <ConfirmModal
                open={isConfirmModalOpen}
                title="자녀 정보 저장"
                message="입력한 자녀 정보를 저장하시겠습니까?"
                onConfirm={handleSaveConfirm}
                onCancel={handleSaveCancel}
                type={MODAL_TYPES.CONFIRM_CANCEL}
                confirmText="저장"
                cancelText="취소"
            />

            {/* 저장 완료 모달 */}
            <ConfirmModal
                open={isCompleteModalOpen}
                title="자녀 정보 저장 완료"
                message="자녀 정보가 성공적으로 저장되었습니다."
                onConfirm={handleCompleteModalClose}
                onCancel={handleCompleteModalClose}
                type={MODAL_TYPES.CONFIRM_ONLY}
                confirmText="확인"
            />
        </>
    );
};

export default ChildManagement;