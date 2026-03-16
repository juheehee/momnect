"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import ConfirmModal, { MODAL_TYPES } from '@/components/common/ConfirmModal';
import { validatePassword } from '@/app/(user)/components/passwordUtils';
import { createValidationSetter } from '@/app/(user)/components/duplicateUtils';
import { validateEmail, validateName, validateLoginId } from '@/app/(user)/components/emailUtils';
import './find-account.css';

const FindAccount = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    // URL 파라미터에서 탭 결정 (기본값: findId)
    const getInitialTab = () => {
        const tab = searchParams.get('tab');
        return tab === 'password' ? 'findPassword' : 'findId';
    };

    const [activeTab, setActiveTab] = useState(getInitialTab());
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        loginId: '',
        passwordEmail: '',
        newPassword: '',
        newPasswordConfirm: ''
    });

    const [validationStates, setValidationStates] = useState({
        name: { status: 'default', message: '', checked: false },
        email: { status: 'default', message: '', checked: false },
        loginId: { status: 'default', message: '', checked: false },
        passwordEmail: { status: 'default', message: '', checked: false }
    });

    const [isLoading, setIsLoading] = useState(false);
    const [passwordValidation, setPasswordValidation] = useState({ status: 'default', message: '' });
    const [resultModal, setResultModal] = useState({
        isOpen: false,
        type: /** @type {string} */ (''),
        data: /** @type {{ loginId?: string } | null} */ (null)
    });

    // resetToken: verify-account 성공 시 저장, reset-password 호출 시 사용
    const [resetToken, setResetToken] = useState(null);

    const setValidationMessage = createValidationSetter(setValidationStates);

    // URL 파라미터 변경 시 탭 업데이트
    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab === 'password') {
            setActiveTab('findPassword');
        } else {
            setActiveTab('findId');
        }
    }, [searchParams]);

    // 실제 api 연동 : 아이디 / 비밀번호 찾기
    const verifyAccountAPI = async (type, data) => {
        const body = {
            type,  // "FIND_ID" | "RESET_PASSWORD"
            email: type === 'FIND_ID' ? data.email : data.passwordEmail,
            ...(type === 'FIND_ID' && { name: data.name }),
            ...(type === 'RESET_PASSWORD' && { loginId: data.loginId }),
        };

        const res = await fetch(`${process.env.NEXT_PUBLIC_USER_API_URL}/auth/verify-account`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(body),
        });

        const json = await res.json();

        if (!res.ok || !json.data?.success) {
            throw new Error(json.data?.message || json.message || '계정을 찾을 수 없습니다');
        }

        return json.data; // { type, success, message, loginId?, resetToken? }
    };

    // 실제 API 연동: 비밀번호 재설정
    const resetPasswordAPI = async (token, newPassword, newPasswordConfirm) => {
        const res = await fetch(`${process.env.NEXT_PUBLIC_USER_API_URL}/auth/reset-password`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                resetToken: token,
                newPassword,
                newPasswordConfirm,
            }),
        });

        const json = await res.json();

        if (!res.ok) {
            throw new Error(json.message || '비밀번호 재설정에 실패했습니다');
        }

        return json;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // 실시간 검증
        let validation = { isValid: true, message: '' };

        if (name === 'name') {
            validation = validateName(value);
            setValidationMessage('name', validation.isValid ? 'default' : 'error', validation.message);
        } else if (name === 'email') {
            validation = validateEmail(value);
            setValidationMessage('email', validation.isValid ? 'default' : 'error', validation.message);
            if (validationStates.email.checked) {
                setValidationMessage('email', 'default', '', false);
            }
        } else if (name === 'loginId') {
            validation = validateLoginId(value);
            setValidationMessage('loginId', validation.isValid ? 'default' : 'error', validation.message);
        } else if (name === 'passwordEmail') {
            validation = validateEmail(value);
            setValidationMessage('passwordEmail', validation.isValid ? 'default' : 'error', validation.message);
            if (validationStates.passwordEmail.checked) {
                setValidationMessage('passwordEmail', 'default', '', false);
            }
        }

        // 비밀번호 검증
        if (name === 'newPassword' || name === 'newPasswordConfirm') {
            const password = name === 'newPassword' ? value : formData.newPassword;
            const passwordConfirm = name === 'newPasswordConfirm' ? value : formData.newPasswordConfirm;
            const result = validatePassword(password, passwordConfirm);
            setPasswordValidation(result);
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        
        // URL 파라미터 업데이트
        const newTab = tab === 'findPassword' ? 'password' : 'id';
        router.replace(`/find-account?tab=${newTab}`, { scroll: false });
        
        setValidationStates({
            name: { status: 'default', message: '', checked: false },
            email: { status: 'default', message: '', checked: false },
            loginId: { status: 'default', message: '', checked: false },
            passwordEmail: { status: 'default', message: '', checked: false }
        });
        setPasswordValidation({ status: 'default', message: '' });
        setResultModal({ isOpen: false, type: '', data: null });
        setFormData({
            name: '', email: '', loginId: '', passwordEmail: '', newPassword: '', newPasswordConfirm: ''
        });
    };

    const handleVerify = async () => {
        // 폼 검증
        let hasError = false;

        if (activeTab === 'findId') {
            const nameValidation = validateName(formData.name);
            const emailValidation = validateEmail(formData.email);

            if (!nameValidation.isValid) {
                setValidationMessage('name', 'error', nameValidation.message);
                hasError = true;
            }
            if (!emailValidation.isValid) {
                setValidationMessage('email', 'error', emailValidation.message);
                hasError = true;
            }
        } else {
            const loginIdValidation = validateLoginId(formData.loginId);
            const emailValidation = validateEmail(formData.passwordEmail);

            if (!loginIdValidation.isValid) {
                setValidationMessage('loginId', 'error', loginIdValidation.message);
                hasError = true;
            }
            if (!emailValidation.isValid) {
                setValidationMessage('passwordEmail', 'error', emailValidation.message);
                hasError = true;
            }
        }

        if (hasError) return;

        setIsLoading(true);
        const field = activeTab === 'findId' ? 'email' : 'passwordEmail';
        setValidationMessage(field, 'loading', '🔄 확인 중...');

        try {
            const type = activeTab === 'findId' ? 'FIND_ID' : 'RESET_PASSWORD';
            const result = await verifyAccountAPI(type, formData);

            // RESET_PASSWORD 성공 시 토큰 저장
            if (result.resetToken) {
                setResetToken(result.resetToken);
            }

            setValidationMessage(field, 'success', '✅ 계정이 확인되었습니다', true);
        } catch (error) {
            setValidationMessage(field, 'error', `❌ ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const field = activeTab === 'findId' ? 'email' : 'passwordEmail';
        if (!validationStates[field].checked) return;

        if (activeTab === 'findId') {
            // 아이디 찾기: verify-account 재호출하여 loginId 가져오기
            try {
                const result = await verifyAccountAPI('FIND_ID', formData);
                setResultModal({ isOpen: true, type: 'idResult', data: { loginId: result.loginId } });
            } catch (error) {
                setValidationMessage('email', 'error', `❌ ${error.message}`);
            }
        } else {
            // 비밀번호 재설정: resetToken + 새 비밀번호로 API 호출
            if (passwordValidation.status !== 'success' || !resetToken) return;

            try {
                await resetPasswordAPI(resetToken, formData.newPassword, formData.newPasswordConfirm);
                setResultModal({ isOpen: true, type: 'passwordResult', data: null });
            } catch (error) {
                setPasswordValidation({ status: 'error', message: `❌ ${error.message}` });
            }
        }
    };

    const closeModal = () => {
        setResultModal({ isOpen: false, type: '', data: null });
    };

    const handleLoginRedirect = () => {
        closeModal();
        router.push('/login');
    };

    const handlePasswordFindRedirect = () => {
        closeModal();
        setActiveTab('findPassword');
        router.replace('/find-account?tab=password', { scroll: false });
    };

    // 버튼 활성화 조건
    const isIdFindEnabled = validationStates.email.checked;
    const isPasswordResetEnabled = validationStates.passwordEmail.checked &&
        formData.newPassword && formData.newPasswordConfirm &&
        passwordValidation.status === 'success';

    const renderFindIdForm = () => (
        <>
            <div className="form-group">
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    autoComplete="off"
                    className={`form-input ${validationStates.name.status === 'error' ? 'error' : ''}`}
                    placeholder="이름을 입력해 주세요"
                />
                {validationStates.name.message && (
                    <span className="error-message">{validationStates.name.message}</span>
                )}
            </div>

            <div className="form-group">
                <div className="input-with-button">
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        autoComplete="off"
                        className={`form-input-with-btn ${validationStates.email.status === 'error' ? 'error' : ''}`}
                        placeholder="이메일을 입력해 주세요"
                    />
                    <button
                        type="button"
                        className="verify-btn"
                        onClick={handleVerify}
                        disabled={isLoading || validationStates.email.checked}
                    >
                        {isLoading ? '확인중...' : validationStates.email.checked ? '✓ 확인됨' : '확인'}
                    </button>
                </div>
                {validationStates.email.message && (
                    <span className={`${validationStates.email.status === 'success' ? 'success-message' : 'error-message'}`}>
                        {validationStates.email.message}
                    </span>
                )}
            </div>
        </>
    );

    const renderFindPasswordForm = () => (
        <>
            <div className="form-group">
                <input
                    type="text"
                    name="loginId"
                    value={formData.loginId}
                    onChange={handleInputChange}
                    autoComplete="off"
                    className={`form-input ${validationStates.loginId.status === 'error' ? 'error' : ''}`}
                    placeholder="아이디를 입력해 주세요"
                />
                {validationStates.loginId.message && (
                    <span className="error-message">{validationStates.loginId.message}</span>
                )}
            </div>

            <div className="form-group">
                <div className="input-with-button">
                    <input
                        type="email"
                        name="passwordEmail"
                        value={formData.passwordEmail}
                        onChange={handleInputChange}
                        autoComplete="off"
                        className={`form-input-with-btn ${validationStates.passwordEmail.status === 'error' ? 'error' : ''}`}
                        placeholder="이메일을 입력해 주세요"
                    />
                    <button
                        type="button"
                        className="verify-btn"
                        onClick={handleVerify}
                        disabled={isLoading || validationStates.passwordEmail.checked}
                    >
                        {isLoading ? '확인중...' : validationStates.passwordEmail.checked ? '✓ 확인됨' : '확인'}
                    </button>
                </div>
                {validationStates.passwordEmail.message && (
                    <span className={`${validationStates.passwordEmail.status === 'success' ? 'success-message' : 'error-message'}`}>
                        {validationStates.passwordEmail.message}
                    </span>
                )}
            </div>

            {/* 계정 확인 후 비밀번호 입력칸 노출 */}
            {validationStates.passwordEmail.checked && (
                <>
                    <div className="form-group">
                        <input
                            type="password"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleInputChange}
                            autoComplete="new-password"
                            className={`form-input ${passwordValidation.status === 'error' ? 'error' : ''}`}
                            placeholder="새 비밀번호를 입력하세요"
                        />
                    </div>

                    <div className="form-group">
                        <input
                            type="password"
                            name="newPasswordConfirm"
                            value={formData.newPasswordConfirm}
                            onChange={handleInputChange}
                            autoComplete="new-password"
                            className={`form-input ${passwordValidation.status === 'error' ? 'error' : ''}`}
                            placeholder="새 비밀번호를 확인하세요"
                        />
                        {passwordValidation.message && (
                            <span className={`${passwordValidation.status === 'success' ? 'success-message' : 'error-message'}`}>
                                {passwordValidation.message}
                            </span>
                        )}
                    </div>
                </>
            )}
        </>
    );

    return (
        <div className="find-account-container">
            <div className="find-account-card">
                <div className="find-account-content">

                    <div className="logo-container">
                        <Link href="/">
                            <img src="/images/common/main-logo.png" alt="Logo" className="logo-image" />
                        </Link>
                    </div>

                    <div className="tab-navigation">
                        <button
                            className={`tab-btn ${activeTab === 'findId' ? 'active' : ''}`}
                            onClick={() => handleTabChange('findId')}
                        >
                            아이디 찾기
                        </button>
                        <span className="tab-divider">|</span>
                        <button
                            className={`tab-btn ${activeTab === 'findPassword' ? 'active' : ''}`}
                            onClick={() => handleTabChange('findPassword')}
                        >
                            비밀번호 찾기
                        </button>
                    </div>

                    <div className="find-form">
                        {activeTab === 'findId' ? renderFindIdForm() : renderFindPasswordForm()}

                        <button
                            onClick={handleSubmit}
                            className={`submit-button ${
                                (activeTab === 'findId' && isIdFindEnabled) ||
                                (activeTab === 'findPassword' && isPasswordResetEnabled)
                                    ? 'active' : 'disabled'
                            }`}
                            disabled={activeTab === 'findId' ? !isIdFindEnabled : !isPasswordResetEnabled}
                        >
                            {activeTab === 'findId' ? '아이디 찾기' : '비밀번호 재설정'}
                        </button>
                    </div>
                </div>
            </div>

            {/* 아이디 찾기 결과 모달 */}
            <ConfirmModal
                open={resultModal.isOpen && resultModal.type === 'idResult'}
                title="아이디 찾기 결과"
                message={`회원님의 아이디는 ${resultModal.data?.loginId} 입니다.`}
                type={MODAL_TYPES.CONFIRM_CANCEL}
                confirmText="비밀번호 찾기"
                cancelText="로그인하기"
                onConfirm={handlePasswordFindRedirect}
                onCancel={handleLoginRedirect}
            />

            {/* 비밀번호 재설정 완료 모달 */}
            <ConfirmModal
                open={resultModal.isOpen && resultModal.type === 'passwordResult'}
                title="비밀번호 재설정 완료"
                message="비밀번호가 성공적으로 변경되었습니다.<br/>새로운 비밀번호로 로그인해주세요."
                type={MODAL_TYPES.CONFIRM_ONLY}
                confirmText="로그인하기"
                onConfirm={handleLoginRedirect}
            />
        </div>
    );
};

export default FindAccount;