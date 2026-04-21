package com.momnect.userservice.security.oauth2;

import com.momnect.userservice.command.entity.User;
import com.momnect.userservice.command.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {
    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        // 카카오 사용자 정보 파싱
        KakaoOAuth2UserInfo userInfo = new KakaoOAuth2UserInfo(oAuth2User.getAttributes());

        // 기존 유저 조회
        Optional<User> existingUser = userRepository.findByOauthProviderAndOauthId("KAKAO", userInfo.getProviderId());

        boolean isNewUser = existingUser.isEmpty();

        return new CustomOAuth2User(oAuth2User, userInfo, isNewUser);
    }
}