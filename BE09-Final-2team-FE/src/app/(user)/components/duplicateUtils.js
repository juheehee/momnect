import { useUserStore } from '@/store/userStore';

// 검증 상태 설정 함수 생성
export const createValidationSetter = (setValidationStates) => (field, status, message, checked) => {
    setValidationStates(prev => ({
        ...prev,
        [field]: {
            status,
            message,
            checked: checked !== undefined ? checked : status === 'success' } // 명시적으로 넘기면 그 값 사용
    }));
};

// 백엔드 API와 연동된 중복 확인 핸들러
export const createDuplicateCheckHandler = (formData, setValidationMessage) => {
    const { checkDuplicate } = useUserStore.getState();

    return async (field) => {
        const value = formData[field];

        if (!value || value.trim() === '') {
            setValidationMessage(field, 'error', '❌ 값을 입력해주세요');
            return;
        }

        // 로딩 상태 표시
        setValidationMessage(field, 'loading', '⏳ 확인 중...');

        try {
            // 백엔드 API 호출
            const result = await checkDuplicate(field, value.trim());

            if (result.success) {
                if (result.isDuplicate) {
                    setValidationMessage(field, 'error', `❌ ${result.message}`);
                } else {
                    setValidationMessage(field, 'success', `✅ ${result.message}`);
                }
            } else {
                setValidationMessage(field, 'error', `❌ ${result.message}`);
            }
        } catch (error) {
            console.error(`${field} 중복 확인 에러:`, error);
            setValidationMessage(field, 'error', '❌ 중복 확인 중 오류가 발생했습니다');
        }
    };
};

// 닉네임 자동 검증 (빈 값일 때 아이디를 닉네임으로 사용)
export const handleNicknameValidation = (nickname, setValidationMessage) => {
    if (nickname.trim() === '') {
        setValidationMessage('nickname', 'success', '✅ 아이디가 닉네임이 됩니다');
        return false; // 중복 확인 API 호출하지 않음
    }
    return true; // 중복 확인 API 호출 진행
};

// 실시간 입력 검증 (타이핑 시)
export const createRealTimeValidator = (setValidationMessage) => {
    return {
        // 로그인 ID 실시간 검증
        validateLoginId: (value) => {
            if (!value || value.trim() === '') {
                setValidationMessage('loginId', 'default', '💡 중복 확인을 눌러주세요');
                return;
            }

            // 기본적인 형식 검증
            if (value.length < 4) {
                setValidationMessage('loginId', 'error', '❌ 로그인 ID는 4자 이상이어야 합니다');
                return;
            }

            if (!/^[a-zA-Z0-9@._-]+$/.test(value)) {
                setValidationMessage('loginId', 'error', '❌ 영문, 숫자, @, ., _, - 만 사용 가능합니다');
                return;
            }

            setValidationMessage('loginId', 'default', '💡 중복 확인을 눌러주세요');
        },

        // 이메일 실시간 검증
        validateEmail: (value) => {
            if (!value || value.trim() === '') {
                setValidationMessage('email', 'default', '💡 중복 확인을 눌러주세요');
                return;
            }

            // 이메일 형식 검증
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                setValidationMessage('email', 'error', '❌ 올바른 이메일 형식이 아닙니다');
                return;
            }

            setValidationMessage('email', 'default', '💡 중복 확인을 눌러주세요');
        },

        // 닉네임 실시간 검증
        validateNickname: (value) => {
            if (!value || value.trim() === '') {
                setValidationMessage('nickname', 'success', '✅ 아이디가 닉네임이 됩니다');
                return;
            }

            if (value.length > 15) {
                setValidationMessage('nickname', 'error', '❌ 닉네임은 15자 이하로 입력해주세요');
                return;
            }

            setValidationMessage('nickname', 'default', '💡 중복 확인을 눌러주세요');
        }
    };
};