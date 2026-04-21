"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/userStore";
import { userAPI } from "@/lib/api";
import Loading from "@/app/loading/loading";

export default function OAuth2Callback() {
    const router = useRouter();
    const [showLoading, setShowLoading] = useState(false);

    useEffect(() => {
        const loadingTimer = setTimeout(() => {
            setShowLoading(true);
        }, 2000);

        const processOAuthCallback = async () => {
            try {
                // HttpOnly refreshToken 쿠키를 이용해 accessToken 재발급
                const refreshResponse = await userAPI.refresh();
                const newAccessToken = refreshResponse?.data?.data?.accessToken;

                if (!newAccessToken) {
                    router.replace("/login");
                    return;
                }

                // 인터셉터가 최신 토큰을 읽을 수 있도록 먼저 저장
                useUserStore.setState({
                    accessToken: newAccessToken,
                    isAuthenticated: true,
                    isAuthReady: true
                });

                // 재발급된 accessToken으로 사용자 프로필 조회
                const dashboardResponse = await userAPI.getDashboardData();
                const profile = dashboardResponse?.data?.data?.profileInfo;

                if (!profile?.id) {
                    router.replace("/login");
                    return;
                }

                useUserStore.setState({
                    accessToken: newAccessToken,
                    refreshToken: null,
                    isAuthenticated: true,
                    isAuthReady: true,
                    user: profile
                });

                router.replace("/");
            } catch (error) {
                useUserStore.setState({
                    user: null,
                    accessToken: null,
                    refreshToken: null,
                    isAuthenticated: false,
                    isAuthReady: true
                });
                router.replace("/login");
            }
        };

        processOAuthCallback();
        return () => clearTimeout(loadingTimer);
    }, [router]);

    if (!showLoading) return null;

    return (
        <div>
            <Loading />
            <p style={{ marginTop: "-140px", textAlign: "center", color: "#6b7280" }}>
                카카오 로그인 연결 중입니다...
            </p>
        </div>
    );
}