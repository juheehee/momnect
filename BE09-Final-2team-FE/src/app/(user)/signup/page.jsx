"use client";

import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import './signup.css';
import ContentModal from '@/app/(user)/signup/components/ContentModal';
import { MODAL_CONTENTS } from '@/app/(user)/signup/constants/modalContents';
import DaumPostcode from 'react-daum-postcode';
import { useSignup } from '@/store/userStore'; // 백엔드 연동된 signup 함수
import { userAPI } from '@/lib/api'; // 백엔드 API 호출 함수

export default function Signup() {
    const router = useRouter();
    const signup = useSignup(); // Zustand에서 백엔드 연동된 signup 함수

    // 폼 데이터 상태
    const [formData, setFormData] = useState({
        name: '',
        loginId: '',
        password: '',
        passwordConfirm: '',
        nickname: '',
        email: '',
        phone: '',
        address: ''
    });

    // 체크박스 상태
    const [agreements, setAgreements] = useState({
        terms: false,
        privacy: false,
        age: false,
        location: false,
        push: false
    });

    // 모달 상태
    const [modalStates, setModalStates] = useState({
        terms: false,
        privacy: false,
        age: false,
        location: false,
        push: false
    });

    // 우편번호 모달 상태
    const [isPostcodeOpen, setIsPostcodeOpen] = useState(false);

    // 중복 확인 상태
    const [validationStates, setValidationStates] = useState({
        loginId: { status: 'default', message: '💡 중복 확인을 눌러주세요', checked: false },
        email: { status: 'default', message: '💡 중복 확인을 눌러주세요', checked: false },
        nickname: { status: 'default', message: '💡 중복 확인을 눌러주세요', checked: false }
    });

    // 기타 검증 상태
    const [passwordMatch, setPasswordMatch] = useState({ status: 'default', message: '' });
    const [isFormValid, setIsFormValid] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false); // 제출 중 상태 추가

    // 모달 열기/닫기 함수
    const openModal = (type) => {
        setModalStates(prev => ({ ...prev, [type]: true }));
    };

    const closeModal = (type) => {
        setModalStates(prev => ({ ...prev, [type]: false }));
    };

    // 입력값 변경 핸들러
    const handleInputChange = (field, value) => {
        // 휴대폰번호 포맷팅 (기존 로직 유지)
        if (field === 'phone') {
            // 숫자만 추출 후 포맷팅
            const numbers = value.replace(/[^\d]/g, '');
            if (numbers.length <= 11) {
                if (numbers.length <= 3) {
                    value = numbers;
                } else if (numbers.length <= 7) {
                    value = `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
                } else {
                    value = `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
                }
            } else {
                return; // 11자리 초과 시 입력 방지
            }
        }

        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // 중복 확인 상태 초기화 (값이 변경되면)
        if (['loginId', 'email', 'nickname'].includes(field)) {
            // 닉네임 길이 검증 추가
            if (field === 'nickname' && value) {
                if (value.length < 2) { // 2글자 미만 오류
                    setValidationStates(prev => ({
                        ...prev,
                        [field]: {
                            status: 'error',
                            message: '❌ 닉네임은 2글자 이상이어야 합니다',
                            checked: false
                        }
                    }));
                    return; //(기본 메시지 안 보여줌)
                } else if (value.length > 10) { // 10글자 초과 오류
                    setValidationStates(prev => ({
                        ...prev,
                        [field]: {
                            status: 'error',
                            message: '❌ 닉네임은 10글자 이하여야 합니다',
                            checked: false
                        }
                    }));
                    return;
                }
            }
            setValidationStates(prev => ({
                ...prev,
                [field]: {
                    status: 'default',
                    message: '💡 중복 확인을 눌러주세요',
                    checked: false
                }
            }));
        }

        // 비밀번호 확인 검증
        if (field === 'passwordConfirm' || field === 'password') {
            const password = field === 'password' ? value : formData.password;
            const passwordConfirm = field === 'passwordConfirm' ? value : formData.passwordConfirm;

            // 비밀번호 길이 검증
            if (field === 'password' && value && value.length < 8) {
                setPasswordMatch({
                    status: 'error',
                    message: '❌ 비밀번호는 8자 이상이어야 합니다'
                });
            }
            else if (passwordConfirm && password !== passwordConfirm) {
                setPasswordMatch({
                    status: 'error',
                    message: '❌ 비밀번호가 일치하지 않습니다'
                });
            } else if (passwordConfirm && password === passwordConfirm) {
                if (password.length >= 8) {
                    setPasswordMatch({
                        status: 'success',
                        message: '✅ 비밀번호가 일치합니다'
                    });
                }
            } else {
                setPasswordMatch({ status: 'default', message: '' });
            }
        }
    };

    // 체크박스 변경 핸들러
    const handleAgreementChange = (field, checked) => {
        setAgreements(prev => ({
            ...prev,
            [field]: checked
        }));
    };

    // 전체 동의 체크박스
    const handleAllAgreements = (checked) => {
        setAgreements({
            terms: checked,
            privacy: checked,
            age: checked,
            location: checked,
            push: checked
        });
    };

    // 백엔드 연동 - 중복 확인 API 호출
    const checkDuplicate = async (type, value) => {
        try {
            const response = await userAPI.checkDuplicate(type, value);
            return {
                available: !response.data.data.isDuplicate, // API 응답 구조에 맞게 수정
                message: response.data.data.message
            };
        } catch (error) {
            console.error('중복 확인 API 에러:', error);
            throw new Error('중복 확인 중 오류가 발생했습니다.');
        }
    };

    // 중복 확인 핸들러
    const handleDuplicateCheck = async (type) => {
        const value = formData[type];

        if (!value.trim()) {
            setValidationStates(prev => ({
                ...prev,
                [type]: {
                    status: 'error',
                    message: '❌ 입력값을 확인해주세요',
                    checked: false
                }
            }));
            return;
        }

        // 로딩 상태
        setValidationStates(prev => ({
            ...prev,
            [type]: { status: 'loading', message: '🔄 확인 중...', checked: false }
        }));

        try {
            const result = await checkDuplicate(type, value);

            setValidationStates(prev => ({
                ...prev,
                [type]: {
                    status: result.available ? 'success' : 'error',
                    message: result.available
                        ? `✅ 사용 가능한 ${getFieldName(type)}입니다`
                        : `❌ ${result.message}`,
                    checked: result.available
                }
            }));
        } catch (error) {
            setValidationStates(prev => ({
                ...prev,
                [type]: {
                    status: 'error',
                    message: '❌ 확인 중 오류가 발생했습니다',
                    checked: false
                }
            }));
        }
    };

    // 필드명 매핑
    const getFieldName = (type) => {
        const names = {
            loginId: '아이디',
            email: '이메일',
            nickname: '닉네임'
        };
        return names[type] || type;
    };

    // 주소 검색 완료 핸들러
    const handleAddressComplete = (data) => {
        let fullAddress = data.address;
        let extraAddress = '';

        if (data.addressType === 'R') {
            if (data.bname !== '') {
                extraAddress += data.bname;
            }
            if (data.buildingName !== '') {
                extraAddress += (extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName);
            }
            fullAddress += (extraAddress !== '' ? ` (${extraAddress})` : '');
        }

        handleInputChange('address', fullAddress);
        setIsPostcodeOpen(false);
    };

    // 주소 검색 버튼 클릭 핸들러
    const handleAddressSearch = () => {
        setIsPostcodeOpen(true);
    };

    // 폼 유효성 검사
    useEffect(() => {
        const requiredFields = ['name', 'loginId', 'password', 'passwordConfirm', 'email', 'phone', 'address'];
        const requiredAgreements = ['terms', 'privacy', 'age'];
        const requiredChecks = ['loginId', 'email'];

        const isFieldsValid = requiredFields.every(field => formData[field].trim());
        const isAgreementsValid = requiredAgreements.every(field => agreements[field]);
        const isChecksValid = requiredChecks.every(field =>
            formData[field] === '' || validationStates[field].checked
        );
        const isPasswordValid = passwordMatch.status === 'success' ||
            (formData.password.length >= 8 && formData.passwordConfirm === '');

        // 닉네임은 선택사항이므로 빈 값이거나 검증된 경우 통과
        const isNicknameValid = formData.nickname.trim() === '' || validationStates.nickname.checked;

        setIsFormValid(
            isFieldsValid &&
            isAgreementsValid &&
            isChecksValid &&
            isPasswordValid &&
            isNicknameValid
        );
    }, [formData, agreements, validationStates, passwordMatch]);

    // 백엔드 연동 - 폼 제출 핸들러
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isFormValid || isSubmitting) return;

        setIsSubmitting(true);

        try {
            // 휴대폰번호에서 하이픈 제거
            const cleanPhone = formData.phone.replace(/[^\d]/g, '');

            const signupData = {
                loginId: formData.loginId,
                password: formData.password,
                name: formData.name,
                email: formData.email,
                phoneNumber: cleanPhone,
                nickname: formData.nickname || null, // 빈 값이면 null
                address: formData.address,
                agreements
            };

            console.log('🚀 회원가입 요청 데이터:', signupData);

            const result = await signup(signupData);

            if (result.success) {
                console.log('✅ 회원가입 성공, 완료 페이지로 이동');
                router.push(`/signup/complete?nickname=${encodeURIComponent(formData.nickname || formData.name)}`);
            } else {
                alert(result.message || '회원가입에 실패했습니다.');
            }
        } catch (error) {
            console.error('회원가입 에러:', error);
            alert('회원가입 중 오류가 발생했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="signup-root">
            <div className="signup-card">
                {/* 로고 이미지 */}
                <Link href="/">
                    <div className="signup-image" style={{cursor: 'pointer'}}>
                        <img
                            src="/images/common/main-logo.png"
                            alt="Momnect 로고"
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                borderRadius: '8px'
                            }}
                        />
                    </div>
                </Link>
                <form className="signup-form" onSubmit={handleSubmit}>
                    {/* 이름 */}
                    <div className="signup-row">
                        <input
                            className="signup-input"
                            type="text"
                            placeholder="이름을 입력하세요"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* 아이디 */}
                    <div className="signup-row">
                        <div className="signup-input-container">
                            <input
                                className={`signup-input ${validationStates.loginId.status}`}
                                type="text"
                                placeholder="아이디를 입력하세요"
                                value={formData.loginId}
                                onChange={(e) => handleInputChange('loginId', e.target.value)}
                                disabled={isSubmitting}
                            />
                            <button
                                className="signup-check-btn"
                                type="button"
                                onClick={() => handleDuplicateCheck('loginId')}
                                disabled={validationStates.loginId.status === 'loading' || isSubmitting}
                            >
                                중복 확인
                            </button>
                        </div>
                    </div>
                    <div className={`validation-message ${validationStates.loginId.status}`}>
                        {validationStates.loginId.message}
                    </div>

                    {/* 비밀번호 */}
                    <div className="signup-row">
                        <input
                            className="signup-input"
                            type="password"
                            placeholder="비밀번호를 입력하세요(8자 이상)"
                            value={formData.password}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* 비밀번호 확인 */}
                    <div className="signup-row">
                        <input
                            className={`signup-input ${passwordMatch.status}`}
                            type="password"
                            placeholder="비밀번호를 다시 입력하세요"
                            value={formData.passwordConfirm}
                            onChange={(e) => handleInputChange('passwordConfirm', e.target.value)}
                            disabled={isSubmitting}
                        />
                    </div>
                    {passwordMatch.message && (
                        <div className={`validation-message ${passwordMatch.status}`}>
                            {passwordMatch.message}
                        </div>
                    )}

                    {/* 닉네임 */}
                    <div className="signup-row">
                        <div className="signup-input-container">
                            <input
                                className={`signup-input ${validationStates.nickname.status}`}
                                type="text"
                                placeholder="닉네임을 입력하세요 (선택, 2~10자)"
                                value={formData.nickname}
                                onChange={(e) => handleInputChange('nickname', e.target.value)}
                                disabled={isSubmitting}
                            />
                            <button
                                className="signup-check-btn"
                                type="button"
                                onClick={() => handleDuplicateCheck('nickname')}
                                disabled={validationStates.nickname.status === 'loading' ||
                                    formData.nickname.trim() === '' || isSubmitting}
                            >
                                중복 확인
                            </button>
                        </div>
                    </div>
                    <div className={`validation-message ${validationStates.nickname.status}`}>
                        {validationStates.nickname.message}
                    </div>

                    {/* 이메일 */}
                    <div className="signup-row">
                        <div className="signup-input-container">
                            <input
                                className={`signup-input ${validationStates.email.status}`}
                                type="email"
                                placeholder="이메일을 입력하세요"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                disabled={isSubmitting}
                            />
                            <button
                                className="signup-check-btn"
                                type="button"
                                onClick={() => handleDuplicateCheck('email')}
                                disabled={validationStates.email.status === 'loading' || isSubmitting}
                            >
                                중복 확인
                            </button>
                        </div>
                    </div>
                    <div className={`validation-message ${validationStates.email.status}`}>
                        {validationStates.email.message}
                    </div>

                    {/* 휴대전화번호 */}
                    <div className="signup-row">
                        <input
                            className="signup-input"
                            type="text"
                            placeholder="휴대전화번호를 입력해주세요 (예: 01012345678)"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* 주소 */}
                    <div className="signup-row">
                        <div className="signup-input-container">
                            <input
                                className="signup-input"
                                type="text"
                                placeholder="주소를 검색하세요"
                                value={formData.address}
                                readOnly
                            />
                            <button
                                className="signup-check-btn"
                                type="button"
                                onClick={handleAddressSearch}
                                disabled={isSubmitting}
                            >
                                주소 검색
                            </button>
                        </div>
                    </div>

                    {/* 약관 동의 */}
                    <div className="signup-agree">
                        <label>
                            <input
                                type="checkbox"
                                checked={Object.values(agreements).every(Boolean)}
                                onChange={(e) => handleAllAgreements(e.target.checked)}
                                disabled={isSubmitting}
                            />
                            전체동의
                        </label>

                        <label>
                            <input
                                type="checkbox"
                                checked={agreements.terms}
                                onChange={(e) => handleAgreementChange('terms', e.target.checked)}
                                disabled={isSubmitting}
                            />
                            (필수) 이용약관에 동의합니다
                            <span
                                className="agreement-link"
                                onClick={() => openModal('terms')}
                            >
                                보기
                            </span>
                        </label>

                        <label>
                            <input
                                type="checkbox"
                                checked={agreements.privacy}
                                onChange={(e) => handleAgreementChange('privacy', e.target.checked)}
                                disabled={isSubmitting}
                            />
                            (필수) 개인정보 수집 및 이용에 동의합니다
                            <span
                                className="agreement-link"
                                onClick={() => openModal('privacy')}
                            >
                                보기
                            </span>
                        </label>

                        <label>
                            <input
                                type="checkbox"
                                checked={agreements.age}
                                onChange={(e) => handleAgreementChange('age', e.target.checked)}
                                disabled={isSubmitting}
                            />
                            (필수) 14세 이상입니다
                            <span
                                className="agreement-link"
                                onClick={() => openModal('age')}
                            >
                                보기
                            </span>
                        </label>

                        <label>
                            <input
                                type="checkbox"
                                checked={agreements.location}
                                onChange={(e) => handleAgreementChange('location', e.target.checked)}
                                disabled={isSubmitting}
                            />
                            (선택) 위치서비스 이용동의
                            <span
                                className="agreement-link"
                                onClick={() => openModal('location')}
                            >
                                보기
                            </span>
                        </label>

                        <label>
                            <input
                                type="checkbox"
                                checked={agreements.push}
                                onChange={(e) => handleAgreementChange('push', e.target.checked)}
                                disabled={isSubmitting}
                            />
                            (선택) 푸시 알림 이용동의
                            <span
                                className="agreement-link"
                                onClick={() => openModal('push')}
                            >
                                보기
                            </span>
                        </label>
                    </div>

                    <button
                        className={`signup-btn ${isFormValid ? 'active' : ''}`}
                        type="submit"
                        disabled={!isFormValid || isSubmitting}
                    >
                        {isSubmitting ? '회원가입 중...' : '회원가입'}
                    </button>
                </form>
            </div>

            {/* 우편번호 검색 모달 */}
            {isPostcodeOpen && (
                <div className="postcode-overlay">
                    <div className="postcode-modal">
                        <div className="postcode-header">
                            <h3>주소 검색</h3>
                            <button
                                className="postcode-close"
                                onClick={() => setIsPostcodeOpen(false)}
                            >
                                ×
                            </button>
                        </div>
                        <DaumPostcode
                            onComplete={handleAddressComplete}
                            autoClose={false}
                            style={{
                                width: '100%',
                                height: '400px'
                            }}
                        />
                    </div>
                </div>
            )}

            {/* 약관 모달들 */}
            <ContentModal
                open={modalStates.terms}
                title="이용약관"
                content={MODAL_CONTENTS.terms}
                onClose={() => closeModal('terms')}
            />

            <ContentModal
                open={modalStates.privacy}
                title="개인정보처리방침"
                content={MODAL_CONTENTS.privacy}
                onClose={() => closeModal('privacy')}
            />

            <ContentModal
                open={modalStates.age}
                title="14세 이상 이용 안내"
                content={MODAL_CONTENTS.age}
                onClose={() => closeModal('age')}
            />

            <ContentModal
                open={modalStates.location}
                title="위치서비스 이용약관"
                content={MODAL_CONTENTS.location}
                onClose={() => closeModal('location')}
            />

            <ContentModal
                open={modalStates.push}
                title="푸시 알림 서비스 이용약관"
                content={MODAL_CONTENTS.push}
                onClose={() => closeModal('push')}
            />
        </div>
    );
}