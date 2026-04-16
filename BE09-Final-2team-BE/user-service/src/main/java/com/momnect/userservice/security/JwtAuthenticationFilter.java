package com.momnect.userservice.security;

import com.momnect.userservice.jwt.JwtTokenProvider;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * JWT 기반 인증 필터 (Authorization 헤더)
 */
@Component
@Slf4j
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        // 1. Authorization 헤더에서 토큰 추출
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String accessToken = authHeader.substring(7);
            if (jwtTokenProvider.validateToken(accessToken)) {
                String userId = String.valueOf(jwtTokenProvider.getUserIdFromToken(accessToken));
                String role = jwtTokenProvider.getRoleFromToken(accessToken);

                log.debug("[AuthenticationFilter] Authenticated user - userId: {}, role: {}", userId, role);

                // Spring Security 인증 설정
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                userId,
                                null,
                                List.of(new SimpleGrantedAuthority("ROLE_" + role))
                        );
                // 다른 부분에서 사용할 수 있도록 request에 추가
                SecurityContextHolder.getContext().setAuthentication(authentication);
                request.setAttribute("X-User-Id", userId);
                request.setAttribute("X-User-Role", role);
            } else {
                // 토큰이 있는데 유효하지 않으면 → 401
                log.debug("[AuthenticationFilter] Invalid token - returning 401");
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json;charset=UTF-8");
                response.getWriter().write("{\"error\":\"Unauthorized\",\"message\":\"유효하지 않은 토큰입니다\"}");
                return; // 필터 체인 중단
            }
        } else {
            log.debug("[AuthenticationFilter] No Authorization header found or invalid format.");
        }

        filterChain.doFilter(request, response);
    }
}