package com.momnect.userservice.security.oauth2;

import com.momnect.userservice.command.entity.User;
import com.momnect.userservice.command.repository.UserRepository;
import com.momnect.userservice.jwt.JwtTokenProvider;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;

    private static final String FRONTEND_URL = "http://localhost:3000";

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        CustomOAuth2User oAuth2User = (CustomOAuth2User) authentication.getPrincipal();
        OAuth2UserInfo userInfo = oAuth2User.getUserInfo();

        if (oAuth2User.isNewUser()) {
            // 신규 유저 → 추가정보 입력 페이지로
            String nickname = URLEncoder.encode(userInfo.getNickname() != null ? userInfo.getNickname() : "", StandardCharsets.UTF_8);
            String email = URLEncoder.encode(userInfo.getEmail() != null ? userInfo.getEmail() : "", StandardCharsets.UTF_8);
            String redirectUrl = FRONTEND_URL + "/additional-info?kakaoNickname=" + nickname + "&kakaoEmail=" + email
                    + "&oauthId=" + userInfo.getProviderId() + "&provider=KAKAO";
            getRedirectStrategy().sendRedirect(request, response, redirectUrl);
        } else {
            // 기존 유저 → JWT 발급 후 메인으로
            User user = userRepository.findByOauthProviderAndOauthId("KAKAO", userInfo.getProviderId())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            String accessToken = jwtTokenProvider.createAccessToken(user);
            String refreshToken = jwtTokenProvider.createRefreshToken(user);

            user.setRefreshToken(refreshToken);
            userRepository.save(user);

            // OAuth 로그인에서도 일반 로그인과 동일하게 쿠키를 세팅해
            // refresh 흐름(/auth/refresh)이 끊기지 않도록 맞춘다.
            response.addHeader(HttpHeaders.SET_COOKIE, createAccessTokenCookie(accessToken).toString());
            response.addHeader(HttpHeaders.SET_COOKIE, createRefreshTokenCookie(refreshToken).toString());

            String redirectUrl = FRONTEND_URL + "/oauth2/callback";
            getRedirectStrategy().sendRedirect(request, response, redirectUrl);
        }
    }

    private ResponseCookie createAccessTokenCookie(String accessToken) {
        return ResponseCookie.from("accessToken", accessToken)
                .httpOnly(true)
                .secure(false)
                .sameSite("Lax")
                .path("/")
                .maxAge(Duration.ofHours(1))
                .build();
    }

    private ResponseCookie createRefreshTokenCookie(String refreshToken) {
        return ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .secure(false)
                .sameSite("Lax")
                .path("/")
                .maxAge(Duration.ofDays(7))
                .build();
    }

}
