package com.momnect.userservice.command.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class SignupRequest {

    // 필수 필드
    private final String loginId;   // 카카오 로그인 시 자동생성되므로 선택

    private final String password; // 소셜로그인시 null 가능

    @NotBlank(message = "이름을 입력해주세요")
    private final String name;

    private final String email; // 카카오는 이메일 권한 없음

    @NotBlank(message = "휴대폰번호를 입력해주세요")
    @Pattern(regexp = "^01[0-9]{8,9}$", message = "휴대폰번호는 010으로 시작하는 10-11자리 숫자로 입력해주세요")
    private final String phoneNumber;

    @NotBlank(message = "주소를 입력해주세요")
    private final String address;

    @NotBlank(message = "가입 경로 정보가 필요합니다")
    private final String oauthProvider; // LOCAL, KAKAO

    private final String oauthId; // 소셜로그인시만 필요

    // 약관 동의 (필수)
    @NotNull(message = "이용약관에 동의해주세요")
    private final Boolean isTermsAgreed;

    @NotNull(message = "개인정보처리방침에 동의해주세요")
    private final Boolean isPrivacyAgreed;

    // 선택 필드
    private final String nickname;
    private final String profileImageUrl;
    private final String role; // 기본값: USER
}